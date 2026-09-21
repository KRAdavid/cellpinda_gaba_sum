const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:55124/';
const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9223';
const viewportWidth = Number(process.env.QA_WIDTH ?? 390);
const viewportHeight = Number(process.env.QA_HEIGHT ?? 844);
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

const waitForPresentation = async expected => {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const state = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,presentation:!!document.querySelector(".story--presentation")})');
    if (state.progress === expected && state.presentation) return;
    await wait(100);
  }
  throw new Error(`Timed out waiting for presenter state ${expected}`);
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
  await send('Emulation.setDeviceMetricsOverride', {width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: viewportWidth <= 760});
  await send('Network.enable');
  await send('Network.clearBrowserCache');
  await send('Page.navigate', {url: baseUrl});
  await wait(900);

  const initialPage = await evaluate('({title:document.title,width:innerWidth,clientWidth:document.documentElement.clientWidth,docWidth:document.documentElement.scrollWidth,presenterGuidance:!!document.querySelector(".presenter-note"),presenterProductShortcut:!!document.querySelector(".story-product-start"),carousel:document.querySelector(".story-rail")?.getAttribute("aria-roledescription")||"",currentCard:document.querySelector(".story-card[aria-current=\\"true\\"]")?.getAttribute("aria-label")||""})');
  assert('page identity', initialPage.title.includes('GABA 한 장씩 보기'));
  assert('viewport has no horizontal overflow', initialPage.width === viewportWidth && initialPage.docWidth === initialPage.clientWidth && initialPage.docWidth <= initialPage.width, `${initialPage.width}/${initialPage.clientWidth}/${initialPage.docWidth}`);
  assert('consumer view hides presenter guidance', !initialPage.presenterGuidance && !initialPage.presenterProductShortcut);
  assert('story carousel exposes accessible slide state', initialPage.carousel === 'carousel' && initialPage.currentCard.includes('01 / 11'), JSON.stringify(initialPage));

  await evaluate('document.getElementById("story")?.scrollIntoView({behavior:"auto"})');
  await wait(200);
  const railBehavior = await evaluate('(() => { const rail = document.querySelector(".story-rail"); const style = rail ? getComputedStyle(rail) : null; return {touchAction:style?.touchAction || "", snap:style?.scrollSnapType || "", overflow:style?.overflowX || ""}; })()');
  if (viewportWidth <= 760) assert('mobile rail declares horizontal touch and snap', railBehavior.touchAction === 'pan-x' && railBehavior.snap.includes('x') && railBehavior.overflow === 'auto', JSON.stringify(railBehavior));

  await evaluate('document.querySelector(".intro-product-button")?.click()');
  await waitForProgress('07 / 11');
  const productEntry = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,visible:!!document.querySelector("#story-card-product"),phase:document.querySelector(".story-sequence .is-active")?.innerText||""})');
  assert('intro product entry opens card 7', productEntry.progress === '07 / 11' && productEntry.visible && productEntry.phase.includes('제품 정보'), JSON.stringify(productEntry));

  await send('Page.navigate', {url: baseUrl});
  await waitForProgress('01 / 11');
  const openingPhase = await evaluate('document.querySelector(".story-sequence .is-active")?.innerText||""');
  assert('story sequence starts with everyday context', openingPhase.includes('일상 상태'), openingPhase);
  await evaluate('document.querySelector(".intro-presentation-button")?.click()');
  await waitForProgress('01 / 11');
  const introPresentation = await evaluate('({presentation:!!document.querySelector(".story--presentation"),url:location.href})');
  assert('intro presenter entry creates a resumable card link', introPresentation.presentation && introPresentation.url.includes('mode=presenter') && introPresentation.url.includes('card=1'), JSON.stringify(introPresentation));
  await press('Escape', 'Escape', 27);

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=1#story`});
  await waitForPresentation('01 / 11');
  const fullFlowStart = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('full-flow presenter starts at card 1', fullFlowStart.presentation && fullFlowStart.progress === '01 / 11', JSON.stringify(fullFlowStart));
  const presenterControlLayout = await evaluate('(() => { const buttons = [...document.querySelectorAll(".story--presentation .story-controls button")]; const rects = buttons.map(button => { const rect = button.getBoundingClientRect(); return {label:button.innerText, left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom, width:rect.width, height:rect.height}; }); const overlap = rects.some((left, index) => rects.slice(index + 1).some(right => left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top)); const product = rects.find(rect => rect.label === "제품부터 설명"); return {within:rects.every(rect => rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1), overlap, product, rects}; })()');
  assert('presenter controls stay bounded and non-overlapping', presenterControlLayout.within && !presenterControlLayout.overlap && presenterControlLayout.product?.width > 0 && presenterControlLayout.product?.height > 0, JSON.stringify(presenterControlLayout));
  const firstCardVisibility = await evaluate('(() => { const card = document.querySelector(".story--presentation .story-card[aria-current=\\"true\\"]"); const title = card?.querySelector("h3")?.getBoundingClientRect(); const body = card?.querySelector("p")?.getBoundingClientRect(); return {titleVisible:!!title && title.top >= 0 && title.bottom <= innerHeight, bodyVisible:!!body && body.top >= 0 && body.bottom <= innerHeight, titleTop:title?.top ?? -1, bodyBottom:body?.bottom ?? -1}; })()');
  if (viewportWidth <= 760) assert('presenter first card content is visible on mobile', firstCardVisibility.titleVisible && firstCardVisibility.bodyVisible, JSON.stringify(firstCardVisibility));
  await evaluate('document.querySelector(".story-product-start")?.click()');
  await waitForPresentation('07 / 11');
  const inPageProductShortcut = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText,url:location.href})');
  assert('presenter can jump to product without leaving the flow', inPageProductShortcut.presentation && inPageProductShortcut.progress === '07 / 11' && inPageProductShortcut.url.includes('mode=presenter') && inPageProductShortcut.url.includes('card=7'), JSON.stringify(inPageProductShortcut));
  await evaluate('document.querySelector(".story-restart-button")?.click()');
  await waitForPresentation('01 / 11');

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=7#story`});
  await waitForPresentation('07 / 11');
  const productShortcutStart = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText})');
  assert('product shortcut presenter starts at card 7', productShortcutStart.presentation && productShortcutStart.progress === '07 / 11', JSON.stringify(productShortcutStart));

  await evaluate('document.querySelector(".story-restart-button")?.click()');
  await waitForPresentation('01 / 11');
  const restarted = await evaluate('({presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText,url:location.href})');
  assert('presenter can restart the full flow', restarted.presentation && restarted.progress === '01 / 11' && restarted.url.includes('card=1'), JSON.stringify(restarted));
  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=7#story`});
  await waitForPresentation('07 / 11');

  const presenter = await evaluate('({title:document.title,width:innerWidth,docWidth:document.documentElement.scrollWidth,url:location.href,presentation:!!document.querySelector(".story--presentation"),progress:document.querySelector(".story-controls span")?.innerText,visible:[...document.querySelectorAll(".story-card")].filter(card=>getComputedStyle(card).display!=="none").length})');
  assert('presenter deep link opens the requested card', presenter.presentation && presenter.progress === '07 / 11', `${presenter.url} ${presenter.progress}`);
  assert('presenter shows one card', presenter.visible === 1, String(presenter.visible));
  const nextHint = await evaluate('document.querySelector(".presenter-next-hint")?.innerText||""');
  assert('presenter shows the next card hint', nextHint.includes('다음 설명:') && nextHint.includes('08 · 활용 TIP'), nextHint);

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
    await press('ArrowRight', 'ArrowRight', 39);
    const clearedShare = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,url:document.querySelector(".story-share-url")?.value||"",message:document.querySelector(".story-share-message")?.innerText||""})');
    assert('card navigation clears stale share context', clearedShare.progress === '09 / 11' && !clearedShare.url && !clearedShare.message, JSON.stringify(clearedShare));
    await press('ArrowLeft', 'ArrowLeft', 37);
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
    const copyLabel = await evaluate('document.querySelector(".story-share-copy-button")?.innerText||""');
    assert('shared card exposes customer copy label', copyLabel === '고객용 링크 복사', copyLabel);
    await evaluate('document.querySelector(".story-share-copy-button")?.click()');
    await wait(120);
    const copiedAgain = await evaluate('document.querySelector(".story-share-message")?.innerText||""');
    assert('shared card exposes a direct customer copy action', copiedAgain.includes('고객용 링크를 복사했습니다') && copiedAgain.includes('발표자 모드 제외'), copiedAgain);
  }

  await send('Page.navigate', {url: `${baseUrl}?card=6#story`});
  await waitForProgress('06 / 11');
  const researchEntry = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText,hash:location.hash})');
  assert('research deep link opens the requested card', researchEntry.progress === '06 / 11' && researchEntry.hash === '#story', JSON.stringify(researchEntry));
  await evaluate('document.querySelector("#story-card-research .card-link").click()');
  await wait(180);
  const research = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),title:document.querySelector("[role=dialog] h2")?.innerText||"",source:document.querySelector(".info-panel__source")?.innerText||"",boundary:document.querySelector(".info-panel__boundary")?.innerText||"",flowNote:document.querySelector(".info-panel__flow-note")?.innerText||"",url:location.href})');
  assert('research opens in an in-page dialog', research.dialog && research.title.includes('일반 GABA 연구') && research.url.startsWith(new URL(baseUrl).origin));
  assert('research dialog keeps the citation and product boundary', research.source.includes('PMID 33041752') && research.boundary.includes('셀핀다 제품의 효능'), JSON.stringify(research));
  assert('research dialog keeps the story in page', research.flowNote.includes('현재 페이지의 흐름은 유지됩니다') && research.flowNote.includes('다음 카드'), research.flowNote);
  const researchActionOrder = await evaluate('([...document.querySelectorAll(".info-panel__actions > *")].map(element => element.className).join("|"))');
  assert('in-page next action precedes external source', researchActionOrder.startsWith('info-panel__next|info-panel__external'), researchActionOrder);
  const researchActionVisibility = await evaluate('(() => { const panel = document.querySelector(".info-panel")?.getBoundingClientRect(); const actions = document.querySelector(".info-panel__actions"); const rect = actions?.getBoundingClientRect(); return {position:actions ? getComputedStyle(actions).position : "", visible:!!rect && rect.height > 0 && !!panel && rect.bottom <= panel.bottom + 1, bottom:rect?.bottom ?? -1, panelBottom:panel?.bottom ?? -1}; })()');
  assert('in-page next action stays visible in the panel', researchActionVisibility.position === 'sticky' && researchActionVisibility.visible, JSON.stringify(researchActionVisibility));
  const researchNextLabel = await evaluate('document.querySelector(".info-panel__next")?.innerText||""');
  assert('in-page next action names its destination', researchNextLabel.includes('다음 카드:') && researchNextLabel.includes('07 · 셀핀다 제품 정보'), researchNextLabel);
  const researchExternal = await evaluate('({target:document.querySelector(".info-panel__external")?.target||"",href:document.querySelector(".info-panel__external")?.href||""})');
  assert('research source link is an explicit new-tab choice', researchExternal.target === '_blank' && researchExternal.href.includes('pubmed.ncbi.nlm.nih.gov/33041752'), JSON.stringify(researchExternal));

  await press('Escape', 'Escape', 27);
  const researchEscaped = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),focus:document.activeElement?.innerText||""})');
  assert('Escape closes the research dialog', !researchEscaped.dialog && researchEscaped.focus.includes('일반 GABA 연구 내용'), JSON.stringify(researchEscaped));
  await evaluate('document.querySelector("#story-card-research .card-link")?.click()');
  await wait(180);
  await evaluate('document.querySelector(".info-layer")?.dispatchEvent(new MouseEvent("mousedown", {bubbles:true}))');
  await wait(120);
  const researchOutside = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),focus:document.activeElement?.innerText||""})');
  assert('outside click closes the research dialog', !researchOutside.dialog && researchOutside.focus.includes('일반 GABA 연구 내용'), JSON.stringify(researchOutside));
  await evaluate('document.querySelector("#story-card-research .card-link")?.click()');
  await wait(180);

  await evaluate('document.querySelector(".info-panel__next").click()');
  await wait(350);
  const productCard = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),progress:document.querySelector(".story-controls span")?.innerText,focus:document.activeElement?.innerText||""})');
  assert('next card continues the story', !productCard.dialog && productCard.progress === '07 / 11' && productCard.focus.includes('제품 정보'), JSON.stringify(productCard));

  await evaluate('([...document.querySelectorAll(".story-card")].find(card=>card.querySelector("h3")?.innerText.includes("제품 구성"))?.querySelector(".card-link")?.click())');
  await wait(180);
  const product = await evaluate('({title:document.querySelector("[role=dialog] h2")?.innerText||"",facts:document.querySelector(".product-facts")?.innerText||"",status:document.querySelector(".info-panel__status")?.innerText||""})');
  assert('product opens in the same dialog flow', product.title.includes('제품 정보') && product.facts.includes('셀핀다 가바 1500') && product.status.includes('최종 제품 사실로 확정하지 않습니다'), JSON.stringify(product));
  const productExternal = await evaluate('({target:document.querySelector(".info-panel__external")?.target||"",href:document.querySelector(".info-panel__external")?.href||""})');
  assert('product source link is an explicit new-tab choice', productExternal.target === '_blank' && productExternal.href.includes('smartstore.naver.com/cellpinda/products/4701017202'), JSON.stringify(productExternal));

  await send('Page.navigate', {url: `${baseUrl}?card=10#story`});
  await waitForProgress('10 / 11');
  await evaluate('document.querySelector("#story-card-review .card-link")?.click()');
  await wait(180);
  const review = await evaluate('({dialog:!!document.querySelector("[role=dialog]"),title:document.querySelector("[role=dialog] h2")?.innerText||"",status:document.querySelector(".info-panel__status")?.innerText||"",boundary:document.querySelector(".info-panel__boundary")?.innerText||"",url:location.href})');
  assert('review opens in the same dialog flow', review.dialog && review.title.includes('후기') && review.status.includes('사용권 확인 전 재게시하지 않음') && review.boundary.includes('효능') && review.url.startsWith(new URL(baseUrl).origin), JSON.stringify(review));
  const reviewExternal = await evaluate('({target:document.querySelector(".info-panel__external")?.target||"",href:document.querySelector(".info-panel__external")?.href||""})');
  assert('review source link is an explicit new-tab choice', reviewExternal.target === '_blank' && reviewExternal.href.includes('smartstore.naver.com/cellpinda/products/4701017202#REVIEW_DIALOG'), JSON.stringify(reviewExternal));

  await send('Page.navigate', {url: `${baseUrl}?card=11#story`});
  await waitForProgress('11 / 11');
  const finalPhase = await evaluate('(() => { const nav=document.querySelector(".story-sequence"); const current=nav?.querySelector(".is-active"); const navRect=nav?.getBoundingClientRect(); const currentRect=current?.getBoundingClientRect(); return {label:current?.innerText||"",visible:!!navRect&&!!currentRect&&currentRect.left>=navRect.left-1&&currentRect.right<=navRect.right+1,navScroll:nav?.scrollLeft||0}; })()');
  assert('story sequence keeps current phase visible', finalPhase.label.includes('후기') && finalPhase.visible, JSON.stringify(finalPhase));
  const finishChoices = await evaluate('({count:document.querySelectorAll("#story-card-finish .card-link").length,labels:[...document.querySelectorAll("#story-card-finish .card-link")].map(button=>button.innerText)})');
  assert('finish card keeps three in-page next actions', finishChoices.count === 3 && finishChoices.labels.join('|').includes('일반 GABA 연구') && finishChoices.labels.join('|').includes('제품 정보') && finishChoices.labels.join('|').includes('구매자 후기'), JSON.stringify(finishChoices));
  await evaluate('document.querySelector("#story-card-finish .card-link")?.click()');
  await wait(180);
  const finishResearch = await evaluate('({dialog:!!document.querySelector(".info-panel"),title:document.querySelector(".info-panel h2")?.innerText||"",url:location.href})');
  assert('finish card research choice stays in page', finishResearch.dialog && finishResearch.title.includes('일반 GABA 연구') && finishResearch.url.startsWith(new URL(baseUrl).origin), JSON.stringify(finishResearch));
  await evaluate('document.querySelector(".info-panel__next")?.click()');
  await wait(180);
  const finishFocus = await evaluate('document.activeElement?.innerText||""');
  assert('finish card panel returns focus to selected choice', finishFocus.includes('일반 GABA 연구 다시 보기'), finishFocus);

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=6#story`});
  await waitForPresentation('06 / 11');
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
