import fs from 'node:fs';
import path from 'node:path';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:55124/';
const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9223';
const outputDir = process.env.QA_SCREENSHOT_DIR ?? path.join(process.cwd(), 'qa-screenshots');
fs.mkdirSync(outputDir, {recursive: true});

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

  await send('Page.navigate', {url: `${baseUrl}?mode=presenter&card=1#story`});
  await wait(900);
  await capture('cellpinda-presenter-390-current.png');

  await send('Page.navigate', {url: `${baseUrl}?card=6#story`});
  await wait(900);
  await evaluate('document.querySelector("#story-card-research .card-link")?.click()');
  await wait(180);
  await capture('cellpinda-research-panel-390-current.png');
} finally {
  socket.close();
}
