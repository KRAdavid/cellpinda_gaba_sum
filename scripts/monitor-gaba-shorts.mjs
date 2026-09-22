import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inboxPath = path.join(root, 'docs', 'GABA_VIDEO_INBOX.md');
const reportPath = path.join(root, 'docs', 'GABA_VIDEO_DAILY_REPORT.md');
const triagePath = path.join(root, 'docs', 'GABA_VIDEO_TRIAGE.md');
const snapshotPath = path.join(root, 'src', 'gabaMonitorSnapshot.ts');
const educationTfPath = path.join(root, 'docs', 'GABA_EDUCATION_TF.md');
const sourceRegisterPath = path.join(root, 'docs', 'GABA_SOURCE_REGISTER.md');
const videoRegisterPath = path.join(root, 'docs', 'GABA_VIDEO_REGISTER.md');
const kickoffPath = path.join(root, 'docs', 'GABA_EDUCATION_KICKOFF.md');
const reportArchiveDir = path.join(root, 'docs', 'gaba-video-daily');
const writeMode = process.argv.includes('--write');
const keywords = [/가바/i, /\bGABA\b/i];
const discoveryQueries = [
  'GABA 신경전달물질 Shorts',
  '가바 수면 영양제 Shorts',
  'GABA 뇌 신경 Shorts',
  '가바 스트레스 Shorts',
  '의사 GABA 신경전달물질 Shorts',
  '과학자 GABA 신경전달물질 Shorts',
];

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

const getRegisteredVideoUrls = () => {
  const sourcePath = path.join(root, 'src', 'gabaVideos.ts');
  if (!fs.existsSync(sourcePath)) return [];
  const source = fs.readFileSync(sourcePath, 'utf8');
  return [...new Set([...source.matchAll(/\n\s+url: '([^']+)'/g)].map(match => match[1]))];
};

const getRegisteredEvidenceUrls = () => {
  const sourcePath = path.join(root, 'src', 'gabaVideos.ts');
  if (!fs.existsSync(sourcePath)) return [];
  const source = fs.readFileSync(sourcePath, 'utf8');
  return [...new Set([
    ...[...source.matchAll(/\n\s+authorityEvidenceUrl: '([^']+)'/g)].map(match => match[1]),
    ...[...source.matchAll(/\n\s+researchEvidenceUrl: '([^']+)'/g)].map(match => match[1]),
  ])];
};

const checkUrlHealth = async (urls, userAgent) => {
  const warnings = [];
  let healthy = 0;
  for (const url of urls) {
    try {
      let response = await fetch(url, {
        method: 'HEAD',
        headers: {'user-agent': userAgent, 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8'},
      });
      if ([405, 429, 500, 502, 503, 504].includes(response.status)) {
        response = await fetch(url, {
          headers: {'user-agent': userAgent, 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8'},
        });
        response.body?.cancel();
      }
      if (response.ok) healthy += 1;
      else warnings.push(`${url} → HTTP ${response.status}`);
    } catch (error) {
      warnings.push(`${url} → ${error.message}`);
    }
  }
  return {checked: urls.length, healthy, warnings};
};

const checkRegisteredVideoLinks = async () => checkUrlHealth(
  getRegisteredVideoUrls(),
  'cellpinda-gaba-sum/1.0 (educational source check)',
);

const checkRegisteredEvidenceLinks = async () => checkUrlHealth(
  getRegisteredEvidenceUrls(),
  'cellpinda-gaba-sum/1.0 (authority evidence check)',
);

const checkRegisteredYouTubeMetadata = async () => {
  const urls = getRegisteredVideoUrls().filter(url => /youtube\.com|youtu\.be/i.test(url));
  const warnings = [];
  let healthy = 0;
  for (const url of urls) {
    try {
      const endpoint = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json';
      const response = await fetch(endpoint, {
        headers: {'user-agent': 'cellpinda-gaba-sum/1.0 (educational metadata check)', 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8'},
      });
      if (!response.ok) {
        warnings.push(`${url} → HTTP ${response.status}`);
        continue;
      }
      const metadata = await response.json();
      if (metadata.title && metadata.author_name) healthy += 1;
      else warnings.push(`${url} → 제목·채널 메타데이터 없음`);
    } catch (error) {
      warnings.push(`${url} → ${error.message}`);
    }
  }
  return {checked: urls.length, healthy, warnings};
};

const extractCaptionTrackUrl = html => {
  const raw = html.match(/"captionTracks"\s*:\s*\[\s*\{\s*"baseUrl"\s*:\s*"((?:\\.|[^"])*)"/i)?.[1] ?? '';
  if (!raw) return '';
  try { return JSON.parse('"' + raw + '"'); } catch {
    return raw.replace(/\\u0026/g, '&').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
};

const checkRegisteredYouTubeCaptionTracks = async () => {
  const urls = getRegisteredVideoUrls().filter(url => /youtube\.com|youtu\.be/i.test(url));
  const warnings = [];
  let available = 0;
  const tracks = new Map();
  for (const url of urls) {
    const videoId = url.match(/(?:shorts\/|watch\?v=)([\w-]{11})/)?.[1];
    if (!videoId) {
      warnings.push(`${url} → 영상 ID 추출 실패`);
      continue;
    }
    try {
      const html = await fetchText('https://www.youtube.com/watch?v=' + videoId);
      const captionUrl = extractCaptionTrackUrl(html);
      if (html.includes('playerCaptionsTracklistRenderer') || html.includes('"captionTracks"')) available += 1;
      if (captionUrl) tracks.set(url, captionUrl);
      else warnings.push(`${url} → watch 페이지 자막 트랙 없음`);
    } catch (error) {
      warnings.push(`${url} → ${error.message}`);
    }
  }
  return {checked: urls.length, available, warnings, tracks};
};

const checkRegisteredYouTubeCaptionBodies = async captionHealth => {
  const urls = getRegisteredVideoUrls().filter(url => /youtube\.com|youtu\.be/i.test(url));
  const warnings = [];
  let available = 0;
  const availableUrls = [];
  for (const url of urls) {
    const captionUrl = captionHealth.tracks.get(url);
    if (!captionUrl) {
      warnings.push(`${url} → 자막 본문 요청 URL 없음`);
      continue;
    }
    try {
      const endpoint = captionUrl + (captionUrl.includes('?') ? '&' : '?') + 'fmt=json3';
      const response = await fetch(endpoint, {
        headers: {
          'user-agent': 'cellpinda-gaba-sum/1.0 (educational caption health check)',
          'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
      });
      if (!response.ok) {
        warnings.push(`${url} → 자막 본문 확인 HTTP ${response.status}`);
        continue;
      }
      const payload = await response.json();
      const hasText = Array.isArray(payload.events)
        && payload.events.some(event => Array.isArray(event.segs) && event.segs.some(segment => segment.utf8?.trim()));
      if (hasText) {
        available += 1;
        availableUrls.push(url);
      }
      else warnings.push(`${url} → 자막 본문이 비어 있거나 JSON3 형식이 아님`);
    } catch (error) {
      warnings.push(`${url} → 자막 본문 확인 ${error.message}`);
    }
  }
  return {checked: urls.length, available, availableUrls, warnings};
};

const captionAuditMarkdown = ({checkedDate: date, captionHealth, captionBodyHealth}) => {
  const urls = getRegisteredVideoUrls().filter(url => /youtube\.com|youtu\.be/i.test(url));
  const rows = urls.length
    ? urls.map(url => {
      const videoId = url.match(/(?:shorts\/|watch\?v=)([\w-]{11})/)?.[1] ?? '확인 필요';
      const trackStatus = captionHealth.tracks.has(url) ? '발견' : '미발견';
      const bodyStatus = captionBodyHealth.availableUrls.includes(url)
        ? '본문 확인'
        : captionBodyHealth.warnings.find(item => item.startsWith(url + ' →'))?.replace(url + ' → ', '경고: ') ?? '확인 필요';
      return `| ${videoId} | [원문 보기](${url}) | ${trackStatus} | ${markdown(bodyStatus)} | 원문 재생·자막·발언 구간을 사람이 확인 |`;
    }).join('\n')
    : '| 없음 | 등록 YouTube 링크 없음 | - | - | - |';
  return [
    '# GABA 영상 자막 접근 감사',
    '',
    `> 자동 생성일: ${date} · 이 기록은 자막 접근 상태를 정리한 감리 입력이며 영상 내용·화자·과학적 타당성·권리·공개 승인을 의미하지 않는다.`,
    '',
    '## 영상별 확인',
    '',
    '| 영상 ID | 원문 | 자막 트랙 | 자막 본문 | 사람 확인 다음 행동 |',
    '| --- | --- | --- | --- | --- |',
    rows,
    '',
    '## 해석 기준',
    '',
    '- 자막 트랙 발견은 watch 페이지에 자막 안내가 있었다는 뜻이며, 본문 확보·번역 정확성·화자 일치를 뜻하지 않는다.',
    '- 자막 본문 확인은 텍스트 응답의 존재만 확인하며, 영상의 주장이나 일반 GABA 연구와의 일치를 승인하지 않는다.',
    '- HTTP 429·본문 형식 오류·접근 제한은 경고로 남기고, 사람은 원문을 직접 재생해 타임코드와 발언을 기록한다.',
    '',
  ].join('\n');
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

const markdown = value => value.replaceAll('|', '\\|').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('\r', ' ').replaceAll('\n', ' ');
const checkedDate = new Date().toISOString().slice(0, 10);

const triageRules = [
  {label: '질환·치료 표현', priority: 'SCIENCE/MEDICAL 우선', pattern: /불면증|우울증|ADHD|치매|알츠하이머|공황|PTSD|불안장애|치료|예방|진단|결핍|신약|정신질환|insomnia|depression|ADHD|alzheimer|panic|PTSD|anxiety|treat(?:ment)?|prevent(?:ion)?|diagnos(?:is|e)|deficien(?:cy|t)|clinical trial/i},
  {label: '약물 대체·비교', priority: 'SCIENCE/MEDICAL 우선', pattern: /수면제|졸피뎀|자낙스|약.*대체|대체.*약|sleep(?:ing)?\s*pill|zolpidem|xanax|instead of (?:a )?(?:sleeping )?pill|replace(?:ment)?/i},
  {label: '효과·안전성 단정 신호', priority: 'SCIENCE/MEDICAL 우선', pattern: /부작용\s*없|안전|황금 복용량|특효|효과|해결|꿀잠|치유|도움되는|side[-\s]?effect[-\s]?free|safe(?:ly)?|dosage|effective|effect|reduce|relief|cure|help(?:s|ful)?|calm(?:ing)?|sleep better/i},
  {label: '섭취·상업성 신호', priority: 'SCIENCE/MEDICAL + RIGHTS', pattern: /영양제|건기식|수면영양제|판매|품절|상륙|복용량|함량|발효|식품|섭취|supplement|dietary supplement|sleep supplement|sold|buy|dosage|amount|fermented|food|intake|consume/i},
  {label: '제품·브랜드 신호', priority: 'SCIENCE/MEDICAL + RIGHTS', pattern: /셀핀다|cellpinda|스마트스토어|smartstore|제품\s*(?:소개|추천|구매)|product\s*(?:review|recommend|buy)/i},
];

const authorityLeadRule = {label: '전문가 자격 확인 신호', pattern: /의사|박사|교수|과학자|전문의|doctor|scientist|professor|ph\.?d|\bMD\b|neurolog(?:y|ist)|neuroscien/i};
const authoritySearchRule = {label: '권위 후보 검색 발견', pattern: /YouTube 검색:\s*(?:의사|과학자)\s+GABA/i};

const screenCandidate = (text, context = '') => {
  const matched = triageRules.filter(rule => rule.pattern.test(text));
  const signals = matched.length ? [...new Set(matched.map(rule => rule.label))] : ['일반 설명 후보'];
  if (authorityLeadRule.pattern.test(text)) signals.push(authorityLeadRule.label);
  if (authoritySearchRule.pattern.test(context)) signals.push(authoritySearchRule.label);
  const priority = matched.some(rule => rule.priority === 'SCIENCE/MEDICAL 우선')
    ? 'SCIENCE/MEDICAL 우선'
    : matched.some(rule => rule.priority === 'SCIENCE/MEDICAL + RIGHTS')
      ? 'SCIENCE/MEDICAL + RIGHTS'
      : 'VIDEO 우선';
  return {signals, priority};
};

const reviewAssignment = priority => {
  if (priority === 'VIDEO 우선') return {reviewer: 'VIDEO', nextAction: '원문·자막·화자 확인'};
  if (priority === 'SCIENCE/MEDICAL + RIGHTS') return {reviewer: 'SCIENCE/MEDICAL → RIGHTS', nextAction: '주장·이해관계·사용권 확인'};
  return {reviewer: 'SCIENCE/MEDICAL', nextAction: '질환·효과·안전성 표현 확인'};
};

const parseInboxEntries = text => text.split(/^### /m).slice(1).map(section => {
  const lines = section.split('\n');
  const id = lines[0].trim();
  const status = lines.find(line => line.startsWith('- 상태:'))?.replace('- 상태:', '').trim() ?? '';
  const videoMatch = lines.find(line => line.startsWith('- 영상:'))?.match(/^- 영상: \[(.*?)\]\((https?:\/\/[^)]+)\)/);
  const channel = lines.find(line => line.startsWith('- 채널:'))?.replace('- 채널:', '').trim() ?? '';
  const description = lines.find(line => line.startsWith('- 공개 설명(자동 수집):'))?.replace('- 공개 설명(자동 수집):', '').trim() ?? '';
  if (!id || !videoMatch) return null;
  return {id, status, title: videoMatch[1], url: videoMatch[2], channel, description};
}).filter(Boolean);

const triageMarkdown = ({inboxText, checkedDate: date}) => {
  const entries = parseInboxEntries(inboxText).filter(entry => entry.status === 'PENDING_REVIEW');
  const ranked = entries.map(entry => ({...entry, ...screenCandidate(`${entry.title} ${entry.description}`, entry.channel)})).sort((a, b) => {
    const rank = value => value === 'SCIENCE/MEDICAL 우선' ? 0 : value === 'SCIENCE/MEDICAL + RIGHTS' ? 1 : 2;
    return rank(a.priority) - rank(b.priority) || a.id.localeCompare(b.id);
  });
  const rows = ranked.length
    ? ranked.map(entry => {
      const {reviewer: firstReviewer} = reviewAssignment(entry.priority);
      return `| ${entry.id} | [${markdown(entry.title)}](${entry.url}) | ${markdown(entry.channel)} | ${markdown(entry.signals.join(' · '))} | ${entry.priority} | ${firstReviewer} | PENDING_REVIEW |`;
    }).join('\n')
    : '| 없음 | 검토 대기 후보 없음 | - | - | - | - | - |';
  const scienceFirst = ranked.filter(entry => entry.priority !== 'VIDEO 우선').length;
  return [
    '# GABA 숏츠 감리 우선순위 보드',
    '',
    `> 자동 생성일: ${date} · 제목과 수집된 공개 설명 기반의 감리 보조 분류다. 권위·근거·권리·공개 승인을 판정하지 않는다.`,
    '',
    '## 오늘의 큐',
    '',
    `- 검토 대기: ${ranked.length}건`,
    `- SCIENCE/MEDICAL 또는 RIGHTS 선확인: ${scienceFirst}건`,
    `- VIDEO 원문·자막 선확인: ${ranked.length - scienceFirst}건`,
    '',
    '## 우선순위 정의',
    '',
    '- SCIENCE/MEDICAL 우선: 질환·치료, 약물 대체·비교, 효과·안전성 단정으로 읽힐 수 있어 일반 GABA 연구와 분리해 먼저 감리한다.',
    '- SCIENCE/MEDICAL + RIGHTS: 섭취·상업성 신호가 있어 과학·의료 주장과 이해관계·사용권을 함께 확인한다.',
    '- VIDEO 우선: 제목상 위험 신호가 적어 원문·자막·화자·Shorts 형식부터 확인한다.',
    '- 전문가 자격 확인 신호·권위 후보 검색 발견: 자격·화자·원문을 먼저 확인할 후보라는 뜻이며 권위 승인이나 과학적 타당성 판정이 아니다.',
    '- 모든 행은 PENDING_REVIEW이며, 이 보드의 분류만으로 공개·배제하지 않는다.',
    '',
    '## 검토 대기 목록',
    '',
    '| ID | 영상 | 발견 채널·경로 | 제목·공개 텍스트 주의 신호 | 자동 우선순위 | 첫 담당 | 상태 |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    rows,
    '',
    '## 다음 행동',
    '',
    '1. SCIENCE/MEDICAL 우선 행은 질환·약물·효과·안전성 표현을 일반 GABA 연구와 분리해 원문 타임코드와 함께 기록한다.',
    '2. VIDEO 담당은 모든 후보의 실제 Shorts 형식·자막·화자를 확인하고, 제목만으로 인물 권위를 승인하지 않는다.',
    '3. RIGHTS 담당은 임베드·원문 링크·재사용·인용 범위를 확인한다.',
    '4. 최종 상태는 GABA_VIDEO_REVIEW_RULES.md의 PUBLISH_GENERAL·LIMITED_USE·HOLD·EXCLUDE 중 하나로 사람이 결정한다.',
    '',
  ].join('\n');
};

const reviewSessionMarkdown = ({inboxText, checkedDate: date}) => {
  const priorityRank = value => value === 'SCIENCE/MEDICAL 우선' ? 0 : value === 'SCIENCE/MEDICAL + RIGHTS' ? 1 : 2;
  const candidates = parseInboxEntries(inboxText)
    .filter(entry => entry.status === 'PENDING_REVIEW')
    .map(entry => ({...entry, ...screenCandidate(`${entry.title} ${entry.description}`, entry.channel)}))
    .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority) || left.id.localeCompare(right.id))
    .slice(0, 5);
  const blocks = candidates.length
    ? candidates.map((candidate, index) => {
      const assignment = reviewAssignment(candidate.priority);
      return [
        `## ${String(index + 1).padStart(2, '0')} · ${candidate.id}`,
        '',
        `- 영상: [${markdown(candidate.title)}](${candidate.url})`,
        `- 발견 경로: ${markdown(candidate.channel)}`,
        `- 자동 우선순위: ${candidate.priority}`,
        `- 첫 담당 제안: ${assignment.reviewer}`,
        `- 다음 행동 제안: ${assignment.nextAction}`,
        `- 제목·공개 텍스트 주의 신호: ${markdown(candidate.signals.join(' · '))}`,
        '- 현재 상태: PENDING_REVIEW',
        '',
        '### 사람 검토 체크',
        '',
        '- [ ] VIDEO: 실제 Shorts 형식·원문·자막·화자 확인',
        '- [ ] SCIENCE/MEDICAL: 일반 GABA 생리와 질환·수면·스트레스·섭취 주장을 분리',
        '- [ ] RIGHTS: 원문 링크·임베드·인용·재사용 범위 확인',
        '- [ ] PM/UX: 소비자에게 한 문장으로 설명할 수 있는지 확인',
        '- [ ] 최종 판정과 보류 사유를 `GABA_VIDEO_REVIEW_LOG.md`에 기록',
        '',
        '### 회의 메모',
        '',
        '- 결정: HOLD (사람 검토 전 기본값)',
        '- 타임코드·근거·권리 메모: ',
        '',
      ].join('\n');
    }).join('\n')
    : '현재 검토 대기 후보가 없습니다.\n';
  return [
    '# GABA 영상 오늘 리뷰 세션',
    '',
    `> 자동 생성일: ${date} · 이 문서는 팀 토론용 입력이며 공개 승인 기록이 아니다.`,
    '',
    '## 사용 원칙',
    '',
    '- 제목·공개 설명 기반 자동 분류는 검토 순서만 제안한다.',
    '- 원문·자막·화자·과학 근거·권리 확인 전에는 `PUBLISH_GENERAL`로 바꾸지 않는다.',
    '- 일반 GABA 연구와 영상의 경구 섭취·질환·제품 주장을 분리한다.',
    '',
    '## 오늘 먼저 논의할 후보',
    '',
    blocks,
    '## 세션 종료 조건',
    '',
    '- [ ] 후보별 담당자가 실제로 지정됨',
    '- [ ] 사람 검토 결과가 영상 DB와 검토 로그에 반영됨',
    '- [ ] 공개·제한·보류·배제 판정의 사유가 남음',
    '',
  ].join('\n');
};

const monitorSnapshotTypeScript = ({inboxText, checkedDate: date, successfulSources, successfulSearches, newCandidates, linkHealth, evidenceHealth, metadataHealth, captionHealth, captionBodyHealth}) => {
  const entries = parseInboxEntries(inboxText).filter(entry => entry.status === 'PENDING_REVIEW');
  const priorityRank = value => value === 'SCIENCE/MEDICAL 우선' ? 0 : value === 'SCIENCE/MEDICAL + RIGHTS' ? 1 : 2;
  const ranked = entries.map(entry => ({...entry, ...screenCandidate(`${entry.title} ${entry.description}`, entry.channel)}))
    .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority) || left.id.localeCompare(right.id));
  const authorityQueue = ranked
    .filter(entry => entry.signals.includes('권위 후보 검색 발견') || entry.signals.includes('전문가 자격 확인 신호'))
    .slice(0, 5);
  const scienceMedicalPriority = ranked.filter(item => item.priority !== 'VIDEO 우선').length;
  const educationTf = fs.existsSync(educationTfPath) ? fs.readFileSync(educationTfPath, 'utf8') : '';
  const sourceRegister = fs.existsSync(sourceRegisterPath) ? fs.readFileSync(sourceRegisterPath, 'utf8') : '';
  const videoRegister = fs.existsSync(videoRegisterPath) ? fs.readFileSync(videoRegisterPath, 'utf8') : '';
  const kickoff = fs.existsSync(kickoffPath) ? fs.readFileSync(kickoffPath, 'utf8') : '';
  const coreRoles = ['PM', 'SCIENCE', 'MEDICAL', 'VIDEO', 'RIGHTS', 'UX', 'QA'];
  const humanRoleAssigned = coreRoles.filter(role => {
    const row = educationTf.split('\n').find(line => line.startsWith(`| ${role} |`)) ?? '';
    return row && !row.includes('| 미배정 |');
  }).length;
  const sourceRows = sourceRegister.split('\n').filter(line => /^\| SRC-\d+ \|/.test(line));
  const videoRows = videoRegister.split('\n').filter(line => /^\| (?:AUTH|VID|SHORT)-\d+ \|/.test(line));
  const domesticVideoRows = videoRows.filter(line => !line.startsWith('| AUTH-'));
  const snapshot = {
    checkedAt: date,
    sourceChannels: successfulSources,
    registeredChannels: sources.length,
    discoveryQueries: successfulSearches,
    totalDiscoveryQueries: discoveryQueries.length,
    newCandidates,
    pendingReview: entries.length,
    scienceMedicalPriority,
    videoPriority: entries.length - scienceMedicalPriority,
    pendingQueue: ranked.slice(0, 5).map(entry => ({
      id: entry.id,
      title: entry.title,
      channel: entry.channel,
      priority: entry.priority,
      signals: entry.signals,
      ...reviewAssignment(entry.priority),
    })),
    authorityQueue: authorityQueue.map(entry => ({
      id: entry.id,
      title: entry.title,
      channel: entry.channel,
      signals: entry.signals,
      nextAction: '독립적인 자격·실제 화자·원문·자막·권리 확인',
    })),
    autoPublish: 0,
    humanRoleAssigned,
    humanRoleTotal: coreRoles.length,
    humanSourceReviewed: sourceRows.filter(line => line.includes('| HUMAN_REVIEWED |')).length,
    humanSourceTotal: sourceRows.length,
    registeredVideoApproved: videoRows.filter(line => line.includes('| PUBLISH_GENERAL |')).length,
    registeredVideoTotal: videoRows.length,
    domesticPublicApproved: domesticVideoRows.filter(line => line.includes('| PUBLISH_GENERAL |')).length,
    domesticVideoTotal: domesticVideoRows.length,
    registeredVideoLinksChecked: linkHealth.checked,
    registeredVideoLinksHealthy: linkHealth.healthy,
    registeredVideoLinkWarnings: linkHealth.warnings.length,
    registeredEvidenceLinksChecked: evidenceHealth.checked,
    registeredEvidenceLinksHealthy: evidenceHealth.healthy,
    registeredEvidenceLinkWarnings: evidenceHealth.warnings.length,
    registeredVideoMetadataChecked: metadataHealth.checked,
    registeredVideoMetadataHealthy: metadataHealth.healthy,
    registeredVideoMetadataWarnings: metadataHealth.warnings.length,
    registeredVideoCaptionTracksChecked: captionHealth.checked,
    registeredVideoCaptionTracksAvailable: captionHealth.available,
    registeredVideoCaptionTrackWarnings: captionHealth.warnings.length,
    registeredVideoCaptionBodiesChecked: captionBodyHealth.checked,
    registeredVideoCaptionBodiesAvailable: captionBodyHealth.available,
    registeredVideoCaptionBodyWarnings: captionBodyHealth.warnings.length,
    firstMeetingReady: Boolean(kickoff.match(/^(?:회의 날짜·시간|첫 회의 날짜·시간):[^\r\n]*$/m)?.[0]?.replace(/^[^:]+:\s*/, '').trim()),
    triageUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_VIDEO_TRIAGE.md',
    reportUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_VIDEO_DAILY_REPORT.md',
    reviewSessionUrl: `https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/gaba-video-daily/GABA_VIDEO_REVIEW_SESSION_${date}.md`,
    captionAuditUrl: `https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/gaba-video-daily/GABA_VIDEO_CAPTION_AUDIT_${date}.md`,
    kickoffUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_EDUCATION_KICKOFF.md',
    sourceRegisterUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_SOURCE_REGISTER.md',
  };
  return `export const GABA_MONITOR_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)} as const;\n`;
};

const dailyReport = ({successfulSources, successfulSearches, candidates, errors, fallbackSources, linkHealth, evidenceHealth, metadataHealth, captionHealth, captionBodyHealth}) => {
  const warningRows = errors.length
    ? errors.map(error => `| 경고 | ${markdown(error)} | 재시도 또는 수동 확인 |`).join('\n')
    : '| 없음 | 모든 등록 채널 응답 확인 | 다음 단계로 진행 |';
  const candidateRows = candidates.length
    ? candidates.map(item => `| PENDING-${checkedDate.replaceAll('-', '')}-${item.id} | [${markdown(item.title)}](https://www.youtube.com/watch?v=${item.id}) | ${markdown(item.source.name)} | ${markdown(item.riskSignals.join(' · '))} | ${item.reviewPriority} | PENDING_REVIEW |`).join('\n')
    : '| 없음 | 신규 후보 없음 | - | - | - |';
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
    `- 등록 영상 원문 링크: ${linkHealth.healthy}/${linkHealth.checked} 접근 확인 · 링크 경고 ${linkHealth.warnings.length}건`,
    `- 권위·연구 출처 링크: ${evidenceHealth.healthy}/${evidenceHealth.checked} 접근 확인 · 출처 링크 경고 ${evidenceHealth.warnings.length}건`,
    `- 등록 YouTube 메타데이터: ${metadataHealth.healthy}/${metadataHealth.checked} 제목·채널 확인 · 메타데이터 경고 ${metadataHealth.warnings.length}건`,
    `- 등록 YouTube 자막 트랙: ${captionHealth.available}/${captionHealth.checked} watch 페이지에서 발견 · 자막 경고 ${captionHealth.warnings.length}건`,
    `- 등록 YouTube 자막 본문: ${captionBodyHealth.available}/${captionBodyHealth.checked} 본문 확인 · 본문 경고 ${captionBodyHealth.warnings.length}건`,
    `- 자막 상세 감사: [영상별 기록](gaba-video-daily/GABA_VIDEO_CAPTION_AUDIT_${checkedDate}.md) · 트랙·본문 상태를 영상별로 보관`,
    `- 자동 공개: 0건 · 모든 후보는 VIDEO·SCIENCE/MEDICAL·RIGHTS 검토 전 PENDING_REVIEW`,
    '',
    '## 신규 후보',
    '',
    '| ID | 영상 | 채널 | 제목 기반 주의 신호 | 우선순위 | 상태 |',
    '| --- | --- | --- | --- | --- | --- |',
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
    '## 등록 영상 원문 링크 상태',
    '',
    linkHealth.warnings.length
      ? linkHealth.warnings.map(item => `- 경고: ${markdown(item)}`).join('\n')
      : '- 등록 영상 원문 링크에서 HTTP 경고 없음',
    '',
    '## 권위·연구 출처 링크 상태',
    '',
    evidenceHealth.warnings.length
      ? evidenceHealth.warnings.map(item => `- 경고: ${markdown(item)}`).join('\n')
      : '- 등록된 권위·연구 출처 링크에서 HTTP 경고 없음',
    '- 이 점검은 등록된 출처 URL의 접근 상태만 확인한다. 링크 접근 가능 여부는 인물 자격·영상 화자 일치·연구 내용·과학적 타당성·권리·공개 승인을 의미하지 않는다.',
    '',
    '## 등록 YouTube 메타데이터 상태',
    '',
    metadataHealth.warnings.length
      ? metadataHealth.warnings.map(item => `- 경고: ${markdown(item)}`).join('\n')
      : '- 제목·채널 메타데이터 HTTP 경고 없음',
    '- 메타데이터 확인은 제목·채널 존재 여부만 점검하며, 영상 내용·화자 권위·과학적 타당성·권리를 승인하지 않는다.',
    '',
    '## 등록 YouTube 자막 트랙 상태',
    '',
    captionHealth.warnings.length
      ? captionHealth.warnings.map(item => `- 경고: ${markdown(item)}`).join('\n')
      : '- 모든 등록 YouTube watch 페이지에서 자막 트랙 안내 발견',
    '- 자막 트랙 발견은 자막 본문 확보·정확성·화자 확인을 의미하지 않는다. 사람 검토 전 요약과 공개 상태는 바꾸지 않는다.',
    '',
    '## 등록 YouTube 자막 본문 상태',
    '',
    captionBodyHealth.warnings.length
      ? captionBodyHealth.warnings.map(item => `- 경고: ${markdown(item)}`).join('\n')
      : '- 모든 등록 YouTube 자막 본문을 JSON3 응답으로 확인',
    '- 자막 본문 확인은 텍스트 응답의 존재만 점검한다. 번역 정확성·발언 맥락·화자·과학적 타당성·권리를 승인하지 않으며, 본문 확인 전 요약과 공개 상태를 바꾸지 않는다.',
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
      const triage = screenCandidate(`${item.title} ${item.description ?? ''}`, source.name);
      candidates.push({...item, source, channelId, riskSignals: triage.signals, reviewPriority: triage.priority});
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

  const linkHealth = await checkRegisteredVideoLinks();
  const evidenceHealth = await checkRegisteredEvidenceLinks();
  const metadataHealth = await checkRegisteredYouTubeMetadata();
  const captionHealth = await checkRegisteredYouTubeCaptionTracks();
  const captionBodyHealth = await checkRegisteredYouTubeCaptionBodies(captionHealth);

  console.log('GABA Shorts monitor (' + checkedDate + ')');
  console.log('- sources: ' + successfulSources + '/' + sources.length);
  console.log('- new candidates: ' + candidates.length);
  console.log('- registered video links: ' + linkHealth.healthy + '/' + linkHealth.checked + ' healthy');
  console.log('- registered authority/research evidence links: ' + evidenceHealth.healthy + '/' + evidenceHealth.checked + ' healthy');
  console.log('- registered YouTube metadata: ' + metadataHealth.healthy + '/' + metadataHealth.checked + ' healthy');
  console.log('- registered YouTube caption tracks: ' + captionHealth.available + '/' + captionHealth.checked + ' available');
  console.log('- registered YouTube caption bodies: ' + captionBodyHealth.available + '/' + captionBodyHealth.checked + ' available');
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
    '- 공개 설명(자동 수집): ' + (item.description ? markdown(item.description).slice(0, 240) : '없음'),
    '- 제목 기반 주의 신호: ' + item.riskSignals.join(' · '),
    '- 자동 우선순위: ' + item.reviewPriority,
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
  const captionAudit = captionAuditMarkdown({checkedDate, captionHealth, captionBodyHealth});
  fs.writeFileSync(path.join(reportArchiveDir, `GABA_VIDEO_CAPTION_AUDIT_${checkedDate}.md`), captionAudit, 'utf8');
  const report = dailyReport({successfulSources, successfulSearches, candidates, errors, fallbackSources, linkHealth, evidenceHealth, metadataHealth, captionHealth, captionBodyHealth});
  fs.writeFileSync(reportPath, report, 'utf8');
  fs.writeFileSync(path.join(reportArchiveDir, `GABA_VIDEO_DAILY_REPORT_${checkedDate}.md`), report, 'utf8');
  const updatedInbox = fs.readFileSync(inboxPath, 'utf8');
  const reviewSession = reviewSessionMarkdown({inboxText: updatedInbox, checkedDate});
  fs.writeFileSync(path.join(reportArchiveDir, `GABA_VIDEO_REVIEW_SESSION_${checkedDate}.md`), reviewSession, 'utf8');
  fs.writeFileSync(triagePath, triageMarkdown({inboxText: updatedInbox, checkedDate}), 'utf8');
  fs.writeFileSync(snapshotPath, monitorSnapshotTypeScript({
    inboxText: updatedInbox,
    checkedDate,
    successfulSources,
    successfulSearches,
    newCandidates: candidates.length,
    linkHealth,
    evidenceHealth,
    metadataHealth,
    captionHealth,
    captionBodyHealth,
  }), 'utf8');
  console.log('- wrote: daily report to docs/GABA_VIDEO_DAILY_REPORT.md');
  console.log('- archived: docs/gaba-video-daily/GABA_VIDEO_DAILY_REPORT_' + checkedDate + '.md');
  console.log('- archived: docs/gaba-video-daily/GABA_VIDEO_REVIEW_SESSION_' + checkedDate + '.md');
  console.log('- archived: docs/gaba-video-daily/GABA_VIDEO_CAPTION_AUDIT_' + checkedDate + '.md');
  console.log('- wrote: triage board to docs/GABA_VIDEO_TRIAGE.md');
  console.log('- wrote: monitor snapshot to src/gabaMonitorSnapshot.ts');
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
