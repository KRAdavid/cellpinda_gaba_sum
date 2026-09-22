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

const markdown = value => value.replaceAll('|', '\\|').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('\r', ' ').replaceAll('\n', ' ');
const checkedDate = new Date().toISOString().slice(0, 10);

const triageRules = [
  {label: '질환·치료 표현', priority: 'SCIENCE/MEDICAL 우선', pattern: /불면증|우울증|ADHD|치매|알츠하이머|공황|PTSD|불안장애|치료|예방|진단|결핍|신약|정신질환/i},
  {label: '약물 대체·비교', priority: 'SCIENCE/MEDICAL 우선', pattern: /수면제|졸피뎀|자낙스|약.*대체|대체.*약/i},
  {label: '효과·안전성 단정 신호', priority: 'SCIENCE/MEDICAL 우선', pattern: /부작용\s*없|안전|황금 복용량|특효|효과|해결|꿀잠|치유|도움되는/i},
  {label: '섭취·상업성 신호', priority: 'SCIENCE/MEDICAL + RIGHTS', pattern: /영양제|건기식|수면영양제|판매|품절|상륙|복용량|함량|발효|식품|섭취/i},
];

const screenCandidate = text => {
  const matched = triageRules.filter(rule => rule.pattern.test(text));
  const signals = matched.length ? [...new Set(matched.map(rule => rule.label))] : ['일반 설명 후보'];
  const priority = matched.some(rule => rule.priority === 'SCIENCE/MEDICAL 우선')
    ? 'SCIENCE/MEDICAL 우선'
    : matched.some(rule => rule.priority === 'SCIENCE/MEDICAL + RIGHTS')
      ? 'SCIENCE/MEDICAL + RIGHTS'
      : 'VIDEO 우선';
  return {signals, priority};
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
  const ranked = entries.map(entry => ({...entry, ...screenCandidate(`${entry.title} ${entry.description}`)})).sort((a, b) => {
    const rank = value => value === 'SCIENCE/MEDICAL 우선' ? 0 : value === 'SCIENCE/MEDICAL + RIGHTS' ? 1 : 2;
    return rank(a.priority) - rank(b.priority) || a.id.localeCompare(b.id);
  });
  const rows = ranked.length
    ? ranked.map(entry => {
      const firstReviewer = entry.priority === 'VIDEO 우선'
        ? 'VIDEO'
        : entry.priority === 'SCIENCE/MEDICAL + RIGHTS'
          ? 'SCIENCE/MEDICAL → RIGHTS'
          : 'SCIENCE/MEDICAL';
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

const monitorSnapshotTypeScript = ({inboxText, checkedDate: date, successfulSources, successfulSearches, newCandidates}) => {
  const entries = parseInboxEntries(inboxText).filter(entry => entry.status === 'PENDING_REVIEW');
  const ranked = entries.map(entry => screenCandidate(`${entry.title} ${entry.description}`));
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
    autoPublish: 0,
    humanRoleAssigned,
    humanRoleTotal: coreRoles.length,
    humanSourceReviewed: sourceRows.filter(line => line.includes('| HUMAN_REVIEWED |')).length,
    humanSourceTotal: sourceRows.length,
    registeredVideoApproved: videoRows.filter(line => line.includes('| PUBLISH_GENERAL |')).length,
    registeredVideoTotal: videoRows.length,
    firstMeetingReady: Boolean(kickoff.match(/^(?:회의 날짜·시간|첫 회의 날짜·시간):[^\r\n]*$/m)?.[0]?.replace(/^[^:]+:\s*/, '').trim()),
    triageUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_VIDEO_TRIAGE.md',
    reportUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_VIDEO_DAILY_REPORT.md',
    kickoffUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_EDUCATION_KICKOFF.md',
    sourceRegisterUrl: 'https://github.com/KRAdavid/cellpinda_gaba_sum/blob/main/docs/GABA_SOURCE_REGISTER.md',
  };
  return `export const GABA_MONITOR_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)} as const;\n`;
};

const dailyReport = ({successfulSources, successfulSearches, candidates, errors, fallbackSources}) => {
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
      const triage = screenCandidate(`${item.title} ${item.description ?? ''}`);
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
  const report = dailyReport({successfulSources, successfulSearches, candidates, errors, fallbackSources});
  fs.writeFileSync(reportPath, report, 'utf8');
  fs.writeFileSync(path.join(reportArchiveDir, `GABA_VIDEO_DAILY_REPORT_${checkedDate}.md`), report, 'utf8');
  const updatedInbox = fs.readFileSync(inboxPath, 'utf8');
  fs.writeFileSync(triagePath, triageMarkdown({inboxText: updatedInbox, checkedDate}), 'utf8');
  fs.writeFileSync(snapshotPath, monitorSnapshotTypeScript({
    inboxText: updatedInbox,
    checkedDate,
    successfulSources,
    successfulSearches,
    newCandidates: candidates.length,
  }), 'utf8');
  console.log('- wrote: daily report to docs/GABA_VIDEO_DAILY_REPORT.md');
  console.log('- archived: docs/gaba-video-daily/GABA_VIDEO_DAILY_REPORT_' + checkedDate + '.md');
  console.log('- wrote: triage board to docs/GABA_VIDEO_TRIAGE.md');
  console.log('- wrote: monitor snapshot to src/gabaMonitorSnapshot.ts');
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
