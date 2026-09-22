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
  assert('story has eight one-message cards', initial.cards === 8 && initial.progress === '01 / 08', JSON.stringify(initial));
  const rail = await evaluate('(() => { const el=document.querySelector(".story-rail"), style=getComputedStyle(el); return {touchAction:style.touchAction,snap:style.scrollSnapType,overflowX:style.overflowX,overflowY:style.overflowY,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,scrollTop:el.scrollTop}; })()');
  assert('mobile rail declares vertical touch and snap', rail.touchAction === 'pan-y' && rail.snap.includes('y') && rail.overflowY === 'auto' && rail.overflowX === 'hidden' && rail.scrollHeight > rail.clientHeight && rail.scrollWidth === rail.clientWidth, JSON.stringify(rail));
  const feedSurface = await evaluate('(() => { const story=document.querySelector("#story"), rail=document.querySelector(".story-rail"), card=document.querySelector(".story-card"), dots=document.querySelector(".story-dots"), storyStyle=getComputedStyle(story), railStyle=getComputedStyle(rail), cardStyle=getComputedStyle(card), dotStyle=getComputedStyle(dots); return {storyHeight:story?.getBoundingClientRect().height||0,railHeight:rail?.getBoundingClientRect().height||0,cardWidth:card?.getBoundingClientRect().width||0,cardHeight:card?.getBoundingClientRect().height||0,viewport:innerHeight,contentWidth:document.documentElement.clientWidth,heading:getComputedStyle(document.querySelector(".story-heading")).display,dotsDisplay:dotStyle.display,vertical:railStyle.flexDirection === "column",visual:cardStyle.backgroundImage.includes("gaba-overload"),storyPadding:storyStyle.padding,railHeightStyle:railStyle.height}; })()');
  assert('consumer feed is full-screen and visually focused', feedSurface.storyHeight >= viewportHeight - 2 && feedSurface.railHeight >= viewportHeight - 2 && feedSurface.cardHeight >= viewportHeight - 2 && feedSurface.cardWidth >= feedSurface.contentWidth - 20 && feedSurface.heading === 'flex' && feedSurface.dotsDisplay === 'none' && feedSurface.vertical && feedSurface.visual && feedSurface.storyPadding === '0px', JSON.stringify(feedSurface));
  const nextBar = await evaluate('({text:document.querySelector(".reel-next-bar")?.innerText||"",button:!!document.querySelector(".reel-next-button"),link:!!document.querySelector(".reel-next-link"),visible:!!document.querySelector(".reel-next-bar")})');
  assert('reel feed exposes the next message action', nextBar.visible && nextBar.button && !nextBar.link && nextBar.text.includes('아래로 넘겨 계속') && nextBar.text.includes('02 · 충분히 쉰 날'), JSON.stringify(nextBar));

  await evaluate('(() => { const story=document.getElementById("story"); window.scrollTo({top:story.offsetTop,left:0,behavior:"instant"}); const el=document.querySelector(".story-rail"); el.scrollTo({top:0,behavior:"auto"}); return true; })()');
  await wait(160);
  await evaluate('(() => { const el=document.querySelector(".story-rail"), second=el.querySelectorAll(".story-card")[1]; const target=second ? second.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 4 : 0; el.scrollTo({top:Math.max(0,target),behavior:"auto"}); return true; })()');
  await wait(1800);
  const swiped = await evaluate('({progress:document.querySelector(".story-controls span")?.innerText||"",scrollTop:document.querySelector(".story-rail")?.scrollTop||0})');
  assert('mobile vertical swipe-compatible scroll advances the active card', swiped.progress === '02 / 08' && swiped.scrollTop > rail.scrollTop, JSON.stringify({before:rail,after:swiped}));
  const nextBarAfterSwipe = await evaluate('document.querySelector(".reel-next-bar")?.innerText||""');
  assert('reel feed previews the following message', nextBarAfterSwipe.includes('다음 장면') && nextBarAfterSwipe.includes('03 · 뇌 과부하 상태'), nextBarAfterSwipe);

  await evaluate('document.querySelector(".story-next-button")?.click()');
  await waitForProgress('03 / 08');
  assert('consumer next action advances the story', true);

  await send('Page.navigate', {url: `${baseUrl}?card=7#story`});
  await waitForProgress('07 / 08');
  await evaluate('document.querySelector(".story-card[aria-current=\\"true\\"] .card-link")?.click()');
  await waitForText('#info-panel-title', '일반 GABA 연구를 읽는 방법');
  const researchPanel = await evaluate('({title:document.querySelector("#info-panel-title")?.innerText||"",source:document.querySelector(".info-panel__source")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||"",url:location.href})');
  assert('research opens in an in-page panel', researchPanel.title.includes('일반 GABA 연구') && researchPanel.source.includes('PMID 33041752') && researchPanel.external.includes('pubmed.ncbi.nlm.nih.gov') && !researchPanel.url.includes('pubmed'), JSON.stringify(researchPanel));
  const researchSources = await evaluate('({summary:document.querySelector(".info-panel__research-sources summary")?.innerText||"",items:document.querySelectorAll(".research-source-list article").length})');
  assert('research panel keeps multiple evidence sources in-page', researchSources.summary.includes('근거 출처 5건') && researchSources.items === 5, JSON.stringify(researchSources));
  await evaluate('document.querySelector(".info-panel__next")?.click()');
  await waitForProgress('08 / 08');
  assert('research panel next action continues the card flow', true);
  const finalReelAction = await evaluate('({text:document.querySelector(".reel-next-bar")?.innerText||"",href:document.querySelector(".reel-next-link")?.getAttribute("href")||""})');
  assert('last reel message hands off to the video section', finalReelAction.text.includes('영상 검토 후보') && finalReelAction.href === '#video-showcase', JSON.stringify(finalReelAction));

  await evaluate('document.querySelector(".video-showcase__item:nth-child(2)")?.scrollIntoView({block:"center",behavior:"instant"})');
  await wait(700);
  const videoShowcase = await evaluate('({section:!!document.querySelector("#video-showcase"),title:document.querySelector("#video-showcase-title")?.innerText||"",items:document.querySelectorAll(".video-showcase__item").length,summaries:document.querySelectorAll(".video-showcase__copy").length,links:[...document.querySelectorAll(".video-showcase__actions a")].map(link=>link.getAttribute("href")||""),actionButtons:document.querySelectorAll(".video-showcase__actions button").length,preview:document.querySelectorAll(".video-showcase__media img, .video-showcase__source-mark").length,previewImageLoaded:[...document.querySelectorAll(".video-showcase__media img")].every(image => image.complete && image.naturalWidth > 0),mediaButtons:document.querySelectorAll(".video-showcase__media").length,body:document.querySelector("#video-showcase")?.innerText||""})');
  assert('consumer video summaries live in a separate showcase section', videoShowcase.section && videoShowcase.title.includes('원문으로 확인') && videoShowcase.items === 7 && videoShowcase.summaries === 7 && videoShowcase.links.length === 0 && videoShowcase.actionButtons === 7 && videoShowcase.preview === 7 && videoShowcase.previewImageLoaded && videoShowcase.mediaButtons === 7 && videoShowcase.body.includes('무엇을 어떻게 소개했나') && videoShowcase.body.includes('인물 소개') && videoShowcase.body.includes('오늘 공유된 검토 후보') && videoShowcase.body.includes('원문 링크는 상세 패널에서 선택') && videoShowcase.body.includes('검토 보류') && videoShowcase.body.includes('제한 사용') && !videoShowcase.body.includes('권위 영상 DB'), JSON.stringify(videoShowcase));
  await evaluate('document.querySelector(".video-showcase__media")?.click()');
  await waitForText('#info-panel-title', 'GABA 영상 DB 검토');
  const publicVideo = await evaluate('({items:document.querySelectorAll(".video-db-item").length,detail:document.querySelector(".video-db-detail")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||"",channels:[...document.querySelectorAll(".video-db-detail__meta a")].map(link=>link.getAttribute("href")||""),preview:!!document.querySelector(".video-db-preview") && (!!document.querySelector(".video-db-preview img") || !!document.querySelector(".video-db-preview__source-mark")),body:document.querySelector(".info-panel")?.innerText||""})');
  assert('consumer video detail remains available from the separate showcase', publicVideo.items === 7 && publicVideo.detail.includes('인물 소개') && publicVideo.detail.includes('확인 기반') && publicVideo.detail.includes('권위') && publicVideo.detail.includes('화자·소속 확인 출처') && publicVideo.preview && publicVideo.external.includes('youtube.com/shorts/') && publicVideo.channels.some(link => link.includes('youtube.com/@bm_k_clinic')) && publicVideo.channels.some(link => link.includes('bmkclinic.com')) && !publicVideo.body.includes('dnalc.cshl.edu') && !publicVideo.body.includes('videocast.nih.gov'), JSON.stringify(publicVideo));
  await evaluate('document.querySelectorAll(".video-db-item__select")[1]?.click()');
  await waitForText('.video-db-detail', '브레인튜브');
  const secondPublicVideo = await evaluate('({detail:document.querySelector(".video-db-detail")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||""})');
  assert('consumer can inspect the second shared YouTube video', secondPublicVideo.detail.includes('브레인튜브') && secondPublicVideo.external.includes('youtube.com/shorts/BiZXS_ojLUA'), JSON.stringify(secondPublicVideo));
  await evaluate('document.querySelector(".info-panel__next")?.click()');
  await waitForText('.video-db-detail', '30년 자율신경');
  const nextPublicVideo = await evaluate('({detail:document.querySelector(".video-db-detail")?.innerText||"",button:document.querySelector(".info-panel__next")?.innerText||""})');
  assert('consumer can continue to the next video without leaving the page', nextPublicVideo.detail.includes('30년 자율신경') && nextPublicVideo.button.includes('다음 영상'), JSON.stringify(nextPublicVideo));
  await press('Escape', 'Escape', 27);

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=1#story`});
  await waitForPresentation('01 / 08');
  const presenterEntry = await evaluate('({presentation:!!document.querySelector(".story--presentation"),button:!!document.querySelector(".story-video-db-button"),opsButton:!!document.querySelector(".story-ops-board-button"),product:document.body.innerText.includes("셀핀다 제품")})');
  assert('presenter mode exposes the video DB and operations controls', presenterEntry.presentation && presenterEntry.button && presenterEntry.opsButton && !presenterEntry.product, JSON.stringify(presenterEntry));
  await evaluate('document.querySelector(".story-video-db-button")?.click()');
  await waitForText('#info-panel-title', 'GABA 영상 DB 검토');
  const presenterDb = await evaluate('({items:document.querySelectorAll(".video-db-item").length,hasHold:document.querySelector(".video-db-list")?.innerText.includes("검토 보류")||false,detail:document.querySelector(".video-db-detail")?.innerText||"",body:document.querySelector(".video-db-list")?.innerText||"",panel:document.querySelector(".info-panel")?.innerText||"",search:!!document.querySelector(".video-db-search input"),filters:document.querySelectorAll(".video-db-filters button").length})');
  assert('presenter video DB keeps candidate review separate from public curation', presenterDb.items === 9 && presenterDb.hasHold && !presenterDb.detail && !presenterDb.body?.includes('Molecular regulation') && presenterDb.panel.includes('국내 공개 승인 0건') && presenterDb.panel.includes('DB 승인 이력 2건'), JSON.stringify(presenterDb));
  const monitorSnapshot = await evaluate('({summary:document.querySelector(".monitor-snapshot")?.innerText||"",links:document.querySelectorAll(".monitor-snapshot a").length})');
  assert('presenter video DB shows daily monitoring snapshot', monitorSnapshot.summary.includes('마지막 자동 확인') && monitorSnapshot.summary.includes('검토 대기') && monitorSnapshot.links === 2, JSON.stringify(monitorSnapshot));
  await evaluate('document.querySelector(".video-db-filters button:nth-child(4)")?.click()');
  await wait(180);
  const holdFilter = await evaluate('({items:document.querySelectorAll(".video-db-item").length,active:document.querySelector(".video-db-filters button:nth-child(4)")?.getAttribute("aria-pressed")||""})');
  assert('presenter video DB filters review status before selection', presenterDb.search && presenterDb.filters === 6 && holdFilter.items === 5 && holdFilter.active === 'true', JSON.stringify({presenterDb,holdFilter}));
  await evaluate('document.querySelector(".video-db-filters button:first-child")?.click()');
  await wait(120);
  await evaluate('(() => { const input=document.querySelector(".video-db-search input"); if (!input) return false; const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set; setter?.call(input,"이동환"); input.dispatchEvent(new Event("input",{bubbles:true})); return true; })()');
  await wait(180);
  const searchResult = await evaluate('({items:document.querySelectorAll(".video-db-item").length,title:document.querySelector(".video-db-item h3")?.innerText||""})');
  assert('presenter video DB searches title, channel, or speaker', searchResult.items === 1 && searchResult.title.includes('잠자기 어렵다면'), JSON.stringify(searchResult));
  await evaluate('document.querySelector(".video-db-item__select")?.click()');
  await waitForText('.video-db-detail', '인물 소개');
  const selected = await evaluate('({detail:document.querySelector(".video-db-detail")?.innerText||"",external:document.querySelector(".info-panel__external")?.getAttribute("href")||""})');
  assert('video DB selection shows summary, person introduction, operator sentence, and next audit action', selected.detail.includes('무엇을 어떻게 소개했나') && selected.detail.includes('인물 소개') && selected.detail.includes('사업자 설명 한 문장') && selected.detail.includes('고객 설명 3문장 복사') && selected.detail.includes('다음 감리 행동') && selected.external.includes('youtube.com/shorts/RLAU1VWGsaI'), JSON.stringify(selected));
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
  await waitForProgress('02 / 08');
  assert('presenter keyboard advances one educational card', true);
  await press('Escape', 'Escape', 27);
  const finalState = await evaluate('({presentation:!!document.querySelector(".story--presentation"),url:location.href})');
  assert('Escape exits presenter mode', !finalState.presentation && !finalState.url.includes('mode=presenter'), JSON.stringify(finalState));
} finally {
  socket.close();
}
