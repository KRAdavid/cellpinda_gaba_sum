const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:55124/';
const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9223';
const presenterUrl = `${baseUrl}?mode=presenter%26card=7%23story`;

const targetResponse = await fetch(`${cdpUrl}/json/new?${presenterUrl}`, {method: 'PUT'});
if (!targetResponse.ok) {
  throw new Error(`Could not create a Chrome target at ${cdpUrl}. Start Chrome with remote debugging and the Vite app first.`);
}
const target = await targetResponse.json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
let messageId = 0;
const pending = new Map();

socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const resolve = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) resolve(Promise.reject(new Error(JSON.stringify(message.error))));
  else resolve(message.result);
});

await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++messageId;
  pending.set(id, result => {
    if (result instanceof Promise) result.catch(reject);
    else resolve(result);
  });
  socket.send(JSON.stringify({id, method, params}));
});

const evaluate = async expression => (await send('Runtime.evaluate', {
  expression,
  returnByValue: true,
  awaitPromise: true,
})).result?.value;

const press = async (key, code, virtualKeyCode) => {
  await send('Input.dispatchKeyEvent', {type: 'rawKeyDown', key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode});
  await send('Input.dispatchKeyEvent', {type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode});
  await wait(180);
};

const assert = (label, condition, detail = '') => {
  if (!condition) throw new Error(`${label}${detail ? `: ${detail}` : ''}`);
  console.log(`PASS ${label}`);
};

try {
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await send('Page.reload', {ignoreCache: true});
  await wait(900);

  const initialPage = await evaluate('({title:document.title,width:innerWidth,docWidth:document.documentElement.scrollWidth})');
  assert('page identity', initialPage.title.includes('GABA 한 장씩 보기'));
  assert('mobile width has no horizontal overflow', initialPage.width === 390 && initialPage.docWidth === 390, `${initialPage.width}/${initialPage.docWidth}`);

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=1#story`});
  await wait(850);
  const fullFlowStart = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('full-flow presenter starts at card 1', fullFlowStart.presentation && fullFlowStart.progress === '01 / 11', JSON.stringify(fullFlowStart));

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=7#story`});
  await wait(850);
  const productShortcutStart = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('product shortcut presenter starts at card 7', productShortcutStart.presentation && productShortcutStart.progress === '07 / 11', JSON.stringify(productShortcutStart));

  const presenter = await evaluate('({title:document.title,width:innerWidth,docWidth:document.documentElement.scrollWidth,url:location.href,presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText,visible:[...document.querySelectorAll(".story-card")].filter(card=>getComputedStyle(card).display!=="none").length})');
  assert('presenter deep link opens the requested card', presenter.presentation && presenter.progress === '07 / 11', `${presenter.url} ${presenter.progress}`);
  assert('presenter shows one card', presenter.visible === 1, String(presenter.visible));

  await evaluate('document.querySelector(".presenter-note summary").click()');
  await wait(80);
  const note = await evaluate('({open:document.querySelector(".presenter-note")?.open,text:document.querySelector(".presenter-note p")?.innerText||""})');
  assert('presenter guidance opens', note.open && note.text.length > 10);

  await press('ArrowRight', 'ArrowRight', 39);
  const next = await evaluate('document.querySelector(".story-controls span")?.innerText');
  assert('presenter keyboard advances one card', next === '08 / 11', next);

  await press('Escape', 'Escape', 27);
  const exited = await evaluate('({url:location.href,presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('Escape exits presenter mode and keeps card', !exited.presentation && exited.progress === '08 / 11' && !exited.url.includes('mode=presenter'), JSON.stringify(exited));

  await send('Page.navigate', {url: `${baseUrl}?card=6%23story`});
  await wait(850);
  await evaluate('document.querySelector("#story-card-research .card-link").click()');
  await wait(180);
  const research = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),title:document.querySelector("[role=dialog] h2")?.innerText||"",boundary:document.querySelector(".info-panel__boundary")?.innerText||"",url:location.href})');
  assert('research opens in an in-page dialog', research.dialog && research.title.includes('일반 GABA 연구') && research.url.startsWith(new URL(baseUrl).origin));
  assert('research dialog keeps the product boundary', research.boundary.includes('셀핀다 제품의 효능'));

  await evaluate('document.querySelector(".info-panel__next").click()');
  await wait(350);
  const productCard = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('next card continues the story', !productCard.dialog && productCard.progress === '07 / 11', JSON.stringify(productCard));

  await evaluate('([...document.querySelectorAll(".story-card")].find(card=>card.querySelector("h3")?.innerText.includes("제품 구성"))?.querySelector(".card-link")?.click())');
  await wait(180);
  const product = await evaluate('({title:document.querySelector("[role=dialog] h2")?.innerText||"",facts:document.querySelector(".product-facts")?.innerText||""})');
  assert('product opens in the same dialog flow', product.title.includes('제품 정보') && product.facts.includes('셀핀다 가바 1500'));

  console.log('Interaction QA passed.');
} finally {
  socket.close();
}
