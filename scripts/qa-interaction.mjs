const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:55124/';
const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9223';
const viewportWidth = Number(process.env.QA_WIDTH ?? 390);
const viewportHeight = Number(process.env.QA_HEIGHT ?? 844);

const targetResponse = await fetch(`${cdpUrl}/json/new?${baseUrl}`, {method: 'PUT'});
if (!targetResponse.ok) throw new Error(`Could not create a Chrome target at ${cdpUrl}.`);
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
const evaluate = async expression => (await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true})).result?.value;
const waitForProgress = async expected => {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (await evaluate('document.querySelector(".story-controls span")?.innerText') === expected) return;
    await wait(80);
  }
  throw new Error(`Timed out waiting for progress ${expected}`);
};
const waitForPresentation = async expected => {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const state = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText||"",presentation:!!document.querySelector(".story--presentation")})');
    if (state.progress === expected && state.presentation) return;
    await wait(80);
  }
  throw new Error(`Timed out waiting for presenter state ${expected}`);
};
const waitForText = async (selector, text) => {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if ((await evaluate(`document.querySelector(${JSON.stringify(selector)})?.innerText || ''`)).includes(text)) return;
    await wait(80);
  }
  throw new Error(`Timed out waiting for ${text}`);
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
  await send('Network.enable');
  await send('Network.setCacheDisabled', {cacheDisabled: true});
  await send('Emulation.setDeviceMetricsOverride', {width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: viewportWidth <= 760});
  await send('Page.navigate', {url: baseUrl});
  await wait(900);

  const initial = await evaluate('(() => { const cards=[...document.querySelectorAll(".story-card")]; return {title:document.title,width:innerWidth,height:innerHeight,clientWidth:document.documentElement.clientWidth,docWidth:document.documentElement.scrollWidth,cards:cards.length,progress:document.querySelector(".story-controls span")?.innerText||"",storyTop:document.querySelector("#story")?.getBoundingClientRect().top||0,introTop:document.querySelector(".intro")?.getBoundingClientRect().top||0,body:document.body.innerText}; })()');
  assert('page identity is general GABA education', initial.title.includes('일반 GABA 교육'));
  assert('mobile viewport has no horizontal overflow', initial.width === viewportWidth && initial.docWidth === initial.clientWidth && initial.docWidth <= initial.width, JSON.stringify(initial));
  assert('consumer page contains no product or review content', !initial.body.includes('셀핀다 제품') && !initial.body.includes('구매자 후기') && !initial.body.includes('스마트스토어'));
  assert('consumer page hides presenter monitoring snapshot', !initial.body.includes('일일 감리 상태') && !initial.body.includes('검토 대기'));
  assert('consumer root enters the vertical feed immediately', Math.abs(initial.storyTop) < 2 && initial.introTop >= initial.height - 2, JSON.stringify(initial));
  assert('story has nine one-message cards', initial.cards === 9 && initial.progress === '01 / 09', JSON.stringify(initial));
  const rail = await evaluate('(() => { const el=document.querySelector(".story-rail"), style=getComputedStyle(el); return {touchAction:style.touchAction,snap:style.scrollSnapType,overflowX:style.overflowX,overflowY:style.overflowY,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,scrollTop:el.scrollTop}; })()');
  assert('mobile rail declares vertical touch and snap', rail.touchAction === 'pan-y' && rail.snap.includes('y') && rail.overflowY === 'auto' && rail.overflowX === 'hidden' && rail.scrollHeight > rail.clientHeight && rail.scrollWidth === rail.clientWidth, JSON.stringify(rail));
  const feedSurface = await evaluate('(() => { const story=document.querySelector("#story"), rail=document.querySelector(".story-rail"), card=document.querySelector(".story-card"), dots=document.querySelector(".story-dots"), storyStyle=getComputedStyle(story), railStyle=getComputedStyle(rail), cardStyle=getComputedStyle(card), dotStyle=getComputedStyle(dots); return {storyHeight:story?.getBoundingClientRect().height||0,railHeight:rail?.getBoundingClientRect().height||0,cardWidth:card?.getBoundingClientRect().width||0,cardHeight:card?.getBoundingClientRect().height||0,viewport:innerHeight,contentWidth:document.documentElement.clientWidth,heading:getComputedStyle(document.querySelector(".story-heading")).display,dotsDirection:dotStyle.flexDirection,visual:cardStyle.backgroundImage.includes("gaba-overload"),storyPadding:storyStyle.padding,railHeightStyle:railStyle.height}; })()');
  assert('consumer feed is full-screen and visually focused', feedSurface.storyHeight >= viewportHeight - 2 && feedSurface.railHeight >= viewportHeight - 2 && feedSurface.cardHeight >= viewportHeight - 2 && feedSurface.cardWidth >= feedSurface.contentWidth - 20 && feedSurface.heading === 'none' && feedSurface.dotsDirection === 'column' && feedSurface.visual && feedSurface.storyPadding === '0px', JSON.stringify(feedSurface));
  const swipeHint = await evaluate('({text:document.querySelector(".feed-swipe-hint")?.innerText||"",visible:!!document.querySelector(".feed-swipe-hint")})');
  assert('first consumer card explains the swipe action', swipeHint.visible && swipeHint.text.includes('아래로 넘겨 계속'), JSON.stringify(swipeHint));

  await evaluate('(() => { const story=document.getElementById("story"); window.scrollTo({top:story.offsetTop,left:0,behavior:"instant"}); const el=document.querySelector(".story-rail"); el.scrollTo({top:0,behavior:"auto"}); return true; })()');
  await wait(160);
  await evaluate('(() => { const el=document.querySelector(".story-rail"), second=el.querySelectorAll(".story-card")[1]; const target=second ? second.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 4 : 0; el.scrollTo({top:Math.max(0,target),behavior:"auto"}); return true; })()');
  await wait(700);
  const swiped = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText||"",scrollTop:document.querySelector(".story-rail")?.scrollTop||0})');
  assert('mobile vertical swipe-compatible scroll advances the active card', swiped.progress === '02 / 09' && swiped.scrollTop > rail.scrollTop, JSON.stringify({before:rail,after:swiped}));

  await evaluate('document.querySelector(".story-next-button")?.click()');
  await waitForProgress('03 / 09');
  assert('consumer next action advances the story', true);

  await send('Page.navigate', {url: `${baseUrl}?card=7#story`});
  await waitForProgress('07 / 09');
  await evaluate('document.querySelector(".story-card[aria-current=\\"true\\"] .card-link")?.click()');
  await waitForText('#info-panel-title', '일반 GABA 연구를 읽는 방법');
  const researchPanel = await evaluate('({title:document.querySelector("#info-panel-title")?.innerText||"",source:document.querySelector(".info-panel__source")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||"",url:location.href})');
  assert('research opens in an in-page panel', researchPanel.title.includes('일반 GABA 연구') && researchPanel.source.includes('PMID 33041752') && researchPanel.external.includes('pubmed.ncbi.nlm.nih.gov') && !researchPanel.url.includes('pubmed'), JSON.stringify(researchPanel));
  const researchSources = await evaluate('({summary:document.querySelector(".info-panel__research-sources summary")?.innerText||"",items:document.querySelectorAll(".research-source-list article").length})');
  assert('research panel keeps multiple evidence sources in-page', researchSources.summary.includes('근거 출처 4건') && researchSources.items === 4, JSON.stringify(researchSources));
  await evaluate('document.querySelector(".info-panel__next")?.click()');
  await waitForProgress('08 / 09');
  assert('research panel next action continues the card flow', true);

  await evaluate('document.querySelector(".story-card[aria-current=\\"true\\"] .card-link")?.click()');
  await waitForText('#info-panel-title', 'GABA 영상 DB 검토');
  const publicVideo = await evaluate('({items:document.querySelectorAll(".video-db-item").length,detail:document.querySelector(".video-db-detail")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||"",preview:!!document.querySelector(".video-db-preview") && (!!document.querySelector(".video-db-preview img") || !!document.querySelector(".video-db-preview__source-mark")),body:document.querySelector(".info-panel")?.innerText||""})');
  assert('consumer video panel shows approved sources only', publicVideo.items === 2 && publicVideo.detail.includes('인물 소개') && publicVideo.detail.includes('확인 기반') && publicVideo.detail.includes('권위') && publicVideo.preview && publicVideo.external.includes('dnalc.cshl.edu') && !publicVideo.body.includes('잠자기 어렵다면 수면제'), JSON.stringify(publicVideo));
  await evaluate('document.querySelectorAll(".video-db-item__select")[1]?.click()');
  await waitForText('.video-db-detail', 'Wei Lu');
  const secondPublicVideo = await evaluate('({detail:document.querySelector(".video-db-detail")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||""})');
  assert('consumer can inspect the second approved authority video', secondPublicVideo.detail.includes('Wei Lu') && secondPublicVideo.external.includes('videocast.nih.gov'), JSON.stringify(secondPublicVideo));
  await press('Escape', 'Escape', 27);

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=1#story`});
  await waitForPresentation('01 / 09');
  const presenterEntry = await evaluate('({presentation:!!document.querySelector(".story--presentation"),button:!!document.querySelector(".story-video-db-button"),opsButton:!!document.querySelector(".story-ops-board-button"),product:document.body.innerText.includes("셀핀다 제품")})');
  assert('presenter mode exposes the video DB and operations controls', presenterEntry.presentation && presenterEntry.button && presenterEntry.opsButton && !presenterEntry.product, JSON.stringify(presenterEntry));
  await evaluate('document.querySelector(".story-video-db-button")?.click()');
  await waitForText('#info-panel-title', 'GABA 영상 DB 검토');
  const presenterDb = await evaluate('({items:document.querySelectorAll(".video-db-item").length,hasHold:document.querySelector(".video-db-list")?.innerText.includes("검토 보류")||false,detail:document.querySelector(".video-db-detail")?.innerText||"",search:!!document.querySelector(".video-db-search input"),filters:document.querySelectorAll(".video-db-filters button").length})');
  assert('presenter video DB keeps candidate review separate from public curation', presenterDb.items === 10 && presenterDb.hasHold && !presenterDb.detail, JSON.stringify(presenterDb));
  const monitorSnapshot = await evaluate('({summary:document.querySelector(".monitor-snapshot")?.innerText||"",links:document.querySelectorAll(".monitor-snapshot a").length})');
  assert('presenter video DB shows daily monitoring snapshot', monitorSnapshot.summary.includes('마지막 자동 확인') && monitorSnapshot.summary.includes('검토 대기') && monitorSnapshot.links === 2, JSON.stringify(monitorSnapshot));
  await evaluate('document.querySelector(".video-db-filters button:nth-child(4)")?.click()');
  await wait(180);
  const holdFilter = await evaluate('({items:document.querySelectorAll(".video-db-item").length,active:document.querySelector(".video-db-filters button:nth-child(4)")?.getAttribute("aria-pressed")||""})');
  assert('presenter video DB filters review status before selection', presenterDb.search && presenterDb.filters === 6 && holdFilter.items === 4 && holdFilter.active === 'true', JSON.stringify({presenterDb,holdFilter}));
  await evaluate('document.querySelector(".video-db-filters button:first-child")?.click()');
  await wait(120);
  await evaluate('(() => { const input=document.querySelector(".video-db-search input"); if (!input) return false; const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set; setter?.call(input,"Wei Lu"); input.dispatchEvent(new Event("input",{bubbles:true})); return true; })()');
  await wait(180);
  const searchResult = await evaluate('({items:document.querySelectorAll(".video-db-item").length,title:document.querySelector(".video-db-item h3")?.innerText||""})');
  assert('presenter video DB searches title, channel, or speaker', searchResult.items === 1 && searchResult.title.includes('Molecular regulation'), JSON.stringify(searchResult));
  await evaluate('(() => { const input=document.querySelector(".video-db-search input"); if (!input) return false; const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set; setter?.call(input,""); input.dispatchEvent(new Event("input",{bubbles:true})); return true; })()');
  await wait(120);
  await evaluate('document.querySelector(".video-db-item__select")?.click()');
  await waitForText('.video-db-detail', '인물 소개');
  const selected = await evaluate('({detail:document.querySelector(".video-db-detail")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||""})');
  assert('video DB selection shows summary, person introduction, operator sentence, and next audit action', selected.detail.includes('무엇을 어떻게 소개했나') && selected.detail.includes('인물 소개') && selected.detail.includes('사업자 설명 한 문장') && selected.detail.includes('다음 감리 행동') && selected.detail.includes('원문 페이지·대본 확인') && selected.external.includes('dnalc.cshl.edu'), JSON.stringify(selected));
  await press('Escape', 'Escape', 27);
  await evaluate('document.querySelector(".story-ops-board-button")?.click()');
  await waitForText('#info-panel-title', 'TF 운영 보드');
  const opsBoard = await evaluate('({text:document.querySelector(".info-panel")?.innerText||"",workstreams:document.querySelectorAll(".tf-board__item").length,links:document.querySelectorAll(".tf-board__links a").length,hold:[...document.querySelectorAll(".tf-board__item-topline strong")].filter(element => element.innerText === "HOLD").length})');
  assert('presenter operations board keeps human gates and next actions visible', opsBoard.text.includes('핵심 역할 배정') && opsBoard.text.includes('다음 행동') && opsBoard.workstreams === 4 && opsBoard.links === 2 && opsBoard.hold === 4, JSON.stringify(opsBoard));
  await evaluate('document.querySelector(".tf-board__meeting summary")?.click()');
  const meetingSteps = await evaluate('document.querySelectorAll(".tf-board__meeting li").length');
  assert('operations board exposes the first meeting sequence', meetingSteps === 6, String(meetingSteps));
  await press('Escape', 'Escape', 27);
  await press('ArrowRight', 'ArrowRight', 39);
  await waitForProgress('02 / 09');
  assert('presenter keyboard advances one educational card', true);
  await press('Escape', 'Escape', 27);
  const finalState = await evaluate('({presentation:!!document.querySelector(".story--presentation"),url:location.href})');
  assert('Escape exits presenter mode', !finalState.presentation && !finalState.url.includes('mode=presenter'), JSON.stringify(finalState));
} finally {
  socket.close();
}
