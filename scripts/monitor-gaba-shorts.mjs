import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inboxPath = path.join(root, 'docs', 'GABA_VIDEO_INBOX.md');
const reportPath = path.join(root, 'docs', 'GABA_VIDEO_DAILY_REPORT.md');
const reportArchiveDir = path.join(root, 'docs', 'gaba-video-daily');
const writeMode = process.argv.includes('--write');
const keywords = [/가바/i, /\bGABA\b/i];
const discoveryQueries = ['GABA 신경전달물질 Shorts', '가바 수면 영양제 Shorts', 'GABA 뇌 신경 Shorts', '가바 스트레스 Shorts'];

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

const parseShortsPage = html => html.split(/"shortsLockupViewModel"\s*:/i).slice(1).map(chunk => {
  const window = chunk.slice(0, 14000);
  const id = window.match(/"videoId":"([\w-]{11})"/)?.[1] ?? '';
  const rawTitle = window.match(/"accessibilityText":"((?:\\.|[^"])*)"/)?.[1] ?? '';
  let title = rawTitle;
  try { title = JSON.parse('"' + rawTitle + '"'); } catch { /* keep the escaped title */ }
  title = title.replace(/,\s*조회수[^-]*-\s*Shorts 동영상 재생.*$/i, '').trim();
  return {id, title, description: '', published: '', updated: ''};
}).filter(item => item.id && keywords.some(keyword => keyword.test(item.title)));

const markdown = value => value.replaceAll('|', '\\|').replaceAll('\r', ' ').replaceAll('\n', ' ');
const checkedDate = new Date().toISOString().slice(0, 10);

const dailyReport = ({successfulSources, successfulSearches, candidates, errors, fallbackSources}) => {
  const warningRows = errors.length
    ? errors.map(error => `| 경고 | ${markdown(error)} | 재시도 또는 수동 확인 |`).join('\n')
    : '| 없음 | 모든 등록 채널 응답 확인 | 다음 단계로 진행 |';
  const candidateRows = candidates.length
    ? candidates.map(item => `| PENDING-${checkedDate.replaceAll('-', '')}-${item.id} | [${markdown(item.title)}](https://www.youtube.com/watch?v=${item.id}) | ${markdown(item.source.name)} | PENDING_REVIEW |`).join('\n')
    : '| 없음 | 신규 후보 없음 | - | - |';
  return [
    '# GABA Shorts 일일 모니터 리포트',
    '',
    `> 자동 생성일: ${checkedDate} · 이 문서는 공개 승인 기록이 아니라 팀 검토 입력이다.`,
    '',
    '## 오늘의 실행 요약',
    '',
    `- 채널 확인: ${successfulSources}/${sources.length}`,
    `- 유사 콘텐츠 검색어 확인: ${successfulSearches}/${discoveryQueries.length}`,
    `- Shorts 페이지 보완 수집: ${fallbackSources.length}개 채널`,
    `- 신규 후보: ${candidates.length}건`,
    `- 자동 공개: 0건 · 모든 후보는 VIDEO·SCIENCE/MEDICAL·RIGHTS 검토 전 PENDING_REVIEW`,
    '',
    '## 신규 후보',
    '',
    '| ID | 영상 | 채널 | 상태 |',
    '| --- | --- | --- | --- |',
    candidateRows,
    '',
    '## 채널 경고',
    '',
    '| 구분 | 내용 | 다음 조치 |',
    '| --- | --- | --- |',
    warningRows,
    '',
    '## 수집 경로 보완',
    '',
    fallbackSources.length
      ? fallbackSources.map(item => `- ${markdown(item)}`).join('\n')
      : '- RSS 보완 수집 없음',
    '',
    '## 다음 15분 감리 순서',
    '',
    '1. VIDEO: 실제 Shorts 형식·원문·자막·발언 타임코드 확인',
    '2. SCIENCE/MEDICAL: 일반 GABA 생리와 수면·스트레스·치료·보충제 주장을 분리',
    '3. RIGHTS: 원문 링크·임베드·인용 가능 범위 확인',
    '4. PM/UX: 소비자 카드에서 한 메시지로 전달 가능한지와 다음 카드 흐름 확인',
    '5. 공개 판정: PUBLISH_GENERAL이 아니면 공개 페이지에 반영하지 않음',
    '',
  ].join('\n');
};

const main = async () => {
  const existing = fs.existsSync(inboxPath) ? fs.readFileSync(inboxPath, 'utf8') : '';
  const knownFiles = [
    inboxPath,
    path.join(root, 'src', 'gabaVideos.ts'),
    path.join(root, 'docs', 'GABA_VIDEO_DB.md'),
    path.join(root, 'docs', 'GABA_VIDEO_REGISTER.md'),
  ];
  const knownText = knownFiles
    .filter(file => fs.existsSync(file))
    .map(file => fs.readFileSync(file, 'utf8'))
    .join('\n');
  const existingIds = new Set([...knownText.matchAll(/(?:shorts\/|video\/|watch\?v=)([\w-]{11})/g)].map(match => match[1]));
  const candidates = [];
  const errors = [];
  const fallbackSources = [];
  let successfulSources = 0;
  let successfulSearches = 0;

  const addCandidates = (items, source, channelId) => {
    for (const item of items) {
      if (existingIds.has(item.id) || candidates.some(candidate => candidate.id === item.id)) continue;
      candidates.push({...item, source, channelId});
    }
  };

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
      try {
        const feed = await fetchText('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId);
        successfulSources += 1;
        addCandidates(parseFeed(feed), source, channelId);
      } catch (feedError) {
        const shortsPage = await fetchText('https://www.youtube.com/@' + encodeURIComponent(source.handle.slice(1)) + '/shorts');
        successfulSources += 1;
        fallbackSources.push(`${source.name}: RSS ${feedError.message} → Shorts 페이지로 보완 수집`);
        addCandidates(parseShortsPage(shortsPage), source, channelId);
      }
    } catch (error) {
      errors.push(source.name + ': ' + error.message);
    }
  }

  for (const query of discoveryQueries) {
    try {
      const html = await fetchText('https://www.youtube.com/results?search_query=' + encodeURIComponent(query));
      successfulSearches += 1;
      const source = {name: 'YouTube 검색: ' + query, handle: 'keyword-discovery', channelId: ''};
      addCandidates(parseShortsPage(html).slice(0, 12), source, '');
    } catch (error) {
      errors.push('검색어 ' + query + ': ' + error.message);
    }
  }

  console.log('GABA Shorts monitor (' + checkedDate + ')');
  console.log('- sources: ' + successfulSources + '/' + sources.length);
  console.log('- new candidates: ' + candidates.length);
  if (errors.length) errors.forEach(error => console.log('- warning: ' + error));

  if (!writeMode) return;

  if (candidates.length > 0) {
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
  }
  fs.mkdirSync(reportArchiveDir, {recursive: true});
  const report = dailyReport({successfulSources, successfulSearches, candidates, errors, fallbackSources});
  fs.writeFileSync(reportPath, report, 'utf8');
  fs.writeFileSync(path.join(reportArchiveDir, `GABA_VIDEO_DAILY_REPORT_${checkedDate}.md`), report, 'utf8');
  console.log('- wrote: daily report to docs/GABA_VIDEO_DAILY_REPORT.md');
  console.log('- archived: docs/gaba-video-daily/GABA_VIDEO_DAILY_REPORT_' + checkedDate + '.md');
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
