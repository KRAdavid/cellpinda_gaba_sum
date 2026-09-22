import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inboxPath = path.join(root, 'docs', 'GABA_VIDEO_INBOX.md');
const writeMode = process.argv.includes('--write');
const keywords = [/가바/i, /GABA/i];

const sources = [
  {name: '셀럽의 건강비결', handle: '@Celeb_tip', channelId: 'UC86AuKBawrgBuEZIgiOo7hA', seedVideoId: 'Cnk0PGn9YBM'},
  {name: '교육하는 의사! 이동환TV', handle: '@doctorLeeTV', channelId: 'UC9Vkx4zyHY4myJoykjtVm7A', seedVideoId: 'RLAU1VWGsaI'},
  {name: '영양과학자 양과자', handle: '@snack-yang', channelId: 'UCY-mXLM6DsS9cmSwlh0tqSA', seedVideoId: 'vnocd9ZVJj0'},
  {name: '브레인튜브 Brain Doctor', handle: '@브레인튜브BrainDoctor', channelId: 'UCR6sR1ITtHIz8GZqJOwqxDQ', seedVideoId: 'BiZXS_ojLUA'},
  {name: '30년 자율신경, 정이안한의원TV', handle: '@JeongianTV', channelId: 'UCHkibO5NjXrjMO90jGjhcPQ', seedVideoId: '7Zsxm9Wh2Yg'},
  {name: 'SLEEP Dr. 신원철 꿀잠튜브', handle: '@sleepdoctor1', channelId: 'UC70hC0mVGURG6rCBibw9Wug', seedVideoId: 'rOFkZg09AoY'},
  {name: '마음 튼튼, 뇌연구소 바이탈라이즈', handle: '@vitalize866', channelId: 'UCGZQ3Ac7xkBNL0_s5pDVCKg', seedVideoId: '4MTqi-bapLY'},
  {name: '비엠한방내과', handle: '@bm_k_clinic', channelId: 'UC-eyEDlbCD_8epmh-qCJ9oA', seedVideoId: '4xGSHxkMYew'},
];

const decodeXml = value => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .trim();

const tag = (entry, name) => {
  const match = entry.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>', 'i'));
  return match ? decodeXml(match[1]) : '';
};

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const fetchText = async url => {
  let lastError = new Error('request failed');
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'cellpinda-gaba-sum/1.0 (educational monitoring)',
          'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
      });
      if (response.ok) return response.text();
      lastError = new Error(response.status + ' ' + response.statusText);
      if (![404, 429, 500, 502, 503, 504].includes(response.status)) throw lastError;
    } catch (error) {
      lastError = error;
    }
    if (attempt < 2) await sleep(400 * (attempt + 1));
  }
  throw lastError;
};

const findChannelId = html => {
  const patterns = [
    /<meta[^>]+itemprop=["']channelId["'][^>]+content=["'](UC[\w-]+)["']/i,
    /["'](?:channelId|externalId|browseId)["']\s*:\s*["'](UC[\w-]+)["']/i,
    /\\x22(?:channelId|externalId|browseId)\\x22\\s*:\\s*\\x22(UC[\w-]+)\\x22/i,
    /(?:channelId|externalId|browseId)=(UC[\w-]+)/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return '';
};

const parseFeed = xml => [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map(match => {
  const entry = match[1];
  const id = tag(entry, 'yt:videoId');
  const title = tag(entry, 'title');
  const description = tag(entry, 'media:description');
  const published = tag(entry, 'published');
  const updated = tag(entry, 'updated');
  return {id, title, description, published, updated};
}).filter(item => item.id && keywords.some(keyword => keyword.test(item.title)));

const markdown = value => value.replaceAll('|', '\\|').replaceAll('\r', ' ').replaceAll('\n', ' ');
const checkedDate = new Date().toISOString().slice(0, 10);

const main = async () => {
  const existing = fs.existsSync(inboxPath) ? fs.readFileSync(inboxPath, 'utf8') : '';
  const existingIds = new Set([...existing.matchAll(/(?:shorts\/|video\/)([\w-]{11})/g)].map(match => match[1]));
  const candidates = [];
  const errors = [];
  let successfulSources = 0;

  for (const source of sources) {
    try {
      let channelId = source.channelId || '';
      if (!channelId && source.seedVideoId) {
        const watchPage = await fetchText('https://www.youtube.com/watch?v=' + source.seedVideoId);
        channelId = findChannelId(watchPage);
      }
      if (!channelId) {
        const encodedHandle = encodeURIComponent(source.handle.slice(1));
        const channelPage = await fetchText('https://www.youtube.com/@' + encodedHandle + '/videos');
        channelId = findChannelId(channelPage);
      }
      if (!channelId) throw new Error('channel ID not found');
      const feed = await fetchText('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId);
      successfulSources += 1;
      for (const item of parseFeed(feed)) {
        if (existingIds.has(item.id) || candidates.some(candidate => candidate.id === item.id)) continue;
        candidates.push({...item, source, channelId});
      }
    } catch (error) {
      errors.push(source.name + ': ' + error.message);
    }
  }

  console.log('GABA Shorts monitor (' + checkedDate + ')');
  console.log('- sources: ' + successfulSources + '/' + sources.length);
  console.log('- new candidates: ' + candidates.length);
  if (errors.length) errors.forEach(error => console.log('- warning: ' + error));

  if (!writeMode || candidates.length === 0) return;

  const blocks = candidates.map(item => [
    '### PENDING-' + checkedDate.replaceAll('-', '') + '-' + item.id,
    '',
    '- 상태: PENDING_REVIEW',
    '- 영상: [' + markdown(item.title) + '](https://www.youtube.com/watch?v=' + item.id + ')',
    '- 채널: ' + markdown(item.source.name) + ' (' + markdown(item.source.handle) + ')',
    '- 공개일: ' + (item.published || '확인 필요'),
    '- 수집일: ' + checkedDate,
    '- 키워드 일치: 가바/GABA 제목',
    '- 형식: Shorts 여부 확인 필요',
    '- 무엇을 어떻게 소개했나: 원문·자막 확인 전',
    '- 인물 소개: 확인 전',
    '- 과학 감리: 미검토',
    '- 상업·권리 감리: 미검토',
    '- 다음 담당: VIDEO → SCIENCE/MEDICAL → RIGHTS',
    '',
  ].join('\n')).join('\n');
  const separator = existing.endsWith('\n') ? '' : '\n';
  fs.writeFileSync(inboxPath, existing + separator + '\n' + blocks, 'utf8');
  console.log('- wrote: ' + candidates.length + ' candidate(s) to docs/GABA_VIDEO_INBOX.md');
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
