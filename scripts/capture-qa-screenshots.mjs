import fs from 'node:fs';
import path from 'node:path';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:55124/';
const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9223';
const outputDir = process.env.QA_SCREENSHOT_DIR ?? path.join(process.cwd(), 'qa-screenshots');
fs.mkdirSync(outputDir, {recursive: true});
const routeUrl = (params, hash = '') => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.hash = hash;
  return url.toString();
};
const presenterUrl = routeUrl({mode: 'presenter', card: '1'}, 'story');
const researchUrl = routeUrl({card: '6'}, 'story');
const presenterResearchUrl = routeUrl({mode: 'presenter', card: '7'}, 'story');

const targetResponse = await fetch(`${cdpUrl}/json/new?${baseUrl}`, {method: 'PUT'});
if (!targetResponse.ok) throw new Error(`Could not create Chrome target at ${cdpUrl}.`);
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
await send('Network.enable');
await send('Network.setCacheDisabled', {cacheDisabled: true});
const capture = async (name) => {
  const result = await send('Page.captureScreenshot', {format: 'png', fromSurface: true});
  const filePath = path.join(outputDir, name);
  fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
  console.log(filePath);
};

try {
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await send('Page.navigate', {url: baseUrl});
  await wait(900);
  await capture('cellpinda-consumer-390-current.png');

  await send('Page.navigate', {url: `${baseUrl}#video-showcase`});
  await wait(900);
  await capture('cellpinda-video-showcase-390-current.png');
  await evaluate('document.querySelector(".video-showcase__media")?.click()');
  await wait(240);
  await evaluate('document.querySelector(".video-db-detail")?.scrollIntoView({block:"center",behavior:"auto"})');
  await wait(180);
  await capture('cellpinda-video-detail-390-current.png');

  await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: baseUrl});
  await wait(900);
  await capture('cellpinda-consumer-1440-current.png');

  await send('Page.navigate', {url: `${baseUrl}#video-showcase`});
  await wait(900);
  await capture('cellpinda-video-showcase-1440-current.png');

  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await send('Page.navigate', {url: presenterUrl});
  await wait(900);
  await capture('cellpinda-presenter-390-current.png');
  await evaluate('document.querySelector(".story-ops-board-button")?.click()');
  await wait(180);
  await evaluate('document.querySelector(".tf-board__discussion")?.setAttribute("open", "")');
  await evaluate('document.querySelector(".tf-board__discussion-draft")?.setAttribute("open", "")');
  await wait(180);
  await capture('cellpinda-ops-discussion-390-current.png');

  await send('Page.navigate', {url: researchUrl});
  await wait(900);
  await evaluate('document.querySelector("#story-scene-research .reader-link")?.click()');
  await wait(180);
  await capture('cellpinda-research-panel-390-current.png');

  await send('Page.navigate', {url: presenterResearchUrl});
  await wait(900);
  await evaluate('document.querySelector(".story-card--research .card-link")?.click()');
  await wait(180);
  await evaluate('document.querySelector(".source-review-draft")?.setAttribute("open", "")');
  await wait(180);
  await capture('cellpinda-source-review-panel-390-current.png');
} finally {
  socket.close();
}
