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

const waitForProgress = async expected => {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (await evaluate('document.querySelector(".story-controls span")?.innerText') === expected) return;
    await wait(100);
  }
  throw new Error(`Timed out waiting for progress ${expected}`);
};

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
  await send('Network.enable');
  await send('Network.clearBrowserCache');
  await send('Page.navigate', {url: baseUrl});
  await wait(900);

  const initialPage = await evaluate('({title:document.title,width:innerWidth,docWidth:document.documentElement.scrollWidth,presenterGuidance:!!document.querySelector(".presenter-note")})');
  assert('page identity', initialPage.title.includes('GABA 한 장씩 보기'));
  assert('mobile width has no horizontal overflow', initialPage.width === 390 && initialPage.docWidth === 390, `${initialPage.width}/${initialPage.docWidth}`);
  assert('consumer view hides presenter guidance', !initialPage.presenterGuidance);

  await evaluate('document.querySelector(".intro-product-button")?.click()');
  await waitForProgress('07 / 11');
  const productEntry = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,visible:!!document.querySelector("#story-card-product")})');
  assert('intro product entry opens card 7', productEntry.progress === '07 / 11' && productEntry.visible, JSON.stringify(productEntry));

  await send('Page.navigate', {url: baseUrl});
  await waitForProgress('01 / 11');
  await evaluate('document.querySelector(".intro-presentation-button")?.click()');
  await waitForProgress('01 / 11');
  const introPresentation = await evaluate('({presentation:!!document.querySelector(".story--presentation"),url:location.href})');
  assert('intro presenter entry creates a resumable card link', introPresentation.presentation && introPresentation.url.includes('mode=presenter') && introPresentation.url.includes('card=1'), JSON.stringify(introPresentation));
  await press('Escape', 'Escape', 27);

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=1#story`});
  await waitForProgress('01 / 11');
  const fullFlowStart = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('full-flow presenter starts at card 1', fullFlowStart.presentation && fullFlowStart.progress === '01 / 11', JSON.stringify(fullFlowStart));

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=7#story`});
  await waitForProgress('07 / 11');
  const productShortcutStart = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('product shortcut presenter starts at card 7', productShortcutStart.presentation && productShortcutStart.progress === '07 / 11', JSON.stringify(productShortcutStart));

  const presenter = await evaluate('({title:document.title,width:innerWidth,docWidth:document.documentElement.scrollWidth,url:location.href,presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText,visible:[...document.querySelectorAll(".story-card")].filter(card=>getComputedStyle(card).display!=="none").length})');
  assert('presenter deep link opens the requested card', presenter.presentation && presenter.progress === '07 / 11', `${presenter.url} ${presenter.progress}`);
  assert('presenter shows one card', presenter.visible === 1, String(presenter.visible));

  await evaluate('document.querySelector(".presenter-note summary").click()');
  await wait(80);
  const note = await evaluate('({open:document.querySelector(".presenter-note")?.open,prompt:document.querySelector(".presenter-note__grid > div:first-child p")?.innerText||"",boundary:document.querySelector(".presenter-note__grid > div:last-child p")?.innerText||""})');
  assert('presenter guidance opens', note.open && note.prompt.length > 10 && note.boundary.length > 10, JSON.stringify(note));

  await press('ArrowRight', 'ArrowRight', 39);
  const next = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,url:location.href})');
  assert('presenter keyboard advances one card', next.progress === '08 / 11' && next.url.includes('mode=presenter') && next.url.includes('card=8'), JSON.stringify(next));

  const shareMocked = await evaluate('(() => { try { Object.defineProperty(navigator, "share", {configurable:true, value: async data => { window.__qaShared = data; }}); return true; } catch { return false; } })()');
  if (shareMocked) {
    await evaluate('document.querySelector(".story-share-button")?.click()');
    await wait(120);
    const shared = await evaluate('({url:document.querySelector(".story-share-url")?.value||"",message:document.querySelector(".story-share-message")?.innerText||"",native:window.__qaShared||null})');
    assert('customer card share strips presenter mode', shared.url.includes('card=8') && shared.url.includes('#story') && !shared.url.includes('mode=presenter') && shared.native?.url === shared.url, JSON.stringify(shared));
  }

  await press('Escape', 'Escape', 27);
  const exited = await evaluate('({url:location.href,presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('Escape exits presenter mode and keeps card', !exited.presentation && exited.progress === '08 / 11' && !exited.url.includes('mode=presenter'), JSON.stringify(exited));

  const fallbackMocked = await evaluate('(() => { try { Object.defineProperty(navigator, "share", {configurable:true, value: undefined}); Object.defineProperty(navigator, "clipboard", {configurable:true, value: {writeText: async () => { throw new Error("qa clipboard failure"); }}}); Object.defineProperty(document, "execCommand", {configurable:true, value: () => true}); return true; } catch { return false; } })()');
  if (fallbackMocked) {
    await evaluate('document.querySelector(".story-share-button")?.click()');
    await wait(120);
    const fallback = await evaluate('({url:document.querySelector(".story-share-url")?.value||"",message:document.querySelector(".story-share-message")?.innerText||""})');
    assert('card link share falls back to copy', fallback.url.includes('card=8') && fallback.url.includes('#story') && !fallback.url.includes('mode=presenter') && fallback.message.includes('복사했습니다'), JSON.stringify(fallback));
  }

  await send('Page.navigate', {url: `${baseUrl}?card=6#story`});
  await waitForProgress('06 / 11');
  const researchEntry = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,hash:location.hash})');
  assert('research deep link opens the requested card', researchEntry.progress === '06 / 11' && researchEntry.hash === '#story', JSON.stringify(researchEntry));
  await evaluate('document.querySelector("#story-card-research .card-link").click()');
  await wait(180);
  const research = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),title:document.querySelector("[role=dialog] h2")?.innerText||"",boundary:document.querySelector(".info-panel__boundary")?.innerText||"",url:location.href})');
  assert('research opens in an in-page dialog', research.dialog && research.title.includes('일반 GABA 연구') && research.url.startsWith(new URL(baseUrl).origin));
  assert('research dialog keeps the product boundary', research.boundary.includes('셀핀다 제품의 효능'));

  await evaluate('document.querySelector(".info-panel__next").click()');
  await wait(350);
  const productCard = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),progress:document.querySelector(".story-controls span")?.innerText,focus:document.activeElement?.innerText||""})');
  assert('next card continues the story', !productCard.dialog && productCard.progress === '07 / 11' && productCard.focus.includes('제품 정보'), JSON.stringify(productCard));

  await evaluate('([...document.querySelectorAll(".story-card")].find(card=>card.querySelector("h3")?.innerText.includes("제품 구성"))?.querySelector(".card-link")?.click())');
  await wait(180);
  const product = await evaluate('({title:document.querySelector("[role=dialog] h2")?.innerText||"",facts:document.querySelector(".product-facts")?.innerText||"",status:document.querySelector(".info-panel__status")?.innerText||""})');
  assert('product opens in the same dialog flow', product.title.includes('제품 정보') && product.facts.includes('셀핀다 가바 1500') && product.status.includes('최종 제품 사실로 확정하지 않습니다'), JSON.stringify(product));

  await send('Page.navigate', {url: `${baseUrl}?card=10#story`});
  await waitForProgress('10 / 11');
  await evaluate('document.querySelector("#story-card-review .card-link")?.click()');
  await wait(180);
  const review = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),title:document.querySelector("[role=dialog] h2")?.innerText||"",status:document.querySelector(".info-panel__status")?.innerText||"",boundary:document.querySelector(".info-panel__boundary")?.innerText||"",url:location.href})');
  assert('review opens in the same dialog flow', review.dialog && review.title.includes('후기') && review.status.includes('사용권 확인 전 재게시하지 않음') && review.boundary.includes('효능') && review.url.startsWith(new URL(baseUrl).origin), JSON.stringify(review));

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=6#story`});
  await waitForProgress('06 / 11');
  await evaluate('document.querySelector("#story-card-research .card-link")?.click()');
  await wait(180);
  await evaluate('document.querySelector(".info-panel__next")?.click()');
  await wait(350);
  const presenterPanelNext = await evaluate('({dialog:!!document.querySelector(".info-panel"),progress:document.querySelector(".story-controls span")?.innerText,focus:document.activeElement?.className||""})');
  assert('presenter panel next keeps focus in the story', !presenterPanelNext.dialog && presenterPanelNext.progress === '07 / 11' && presenterPanelNext.focus.includes('story-presentation-toggle'), JSON.stringify(presenterPanelNext));

  console.log('Interaction QA passed.');
} finally {
  socket.close();
}
