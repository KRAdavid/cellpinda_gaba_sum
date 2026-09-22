import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src', 'gabaVideos.ts'), 'utf8');
const publicSource = fs.readFileSync(path.join(root, 'src', 'gabaPublicVideos.ts'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
const requiredSeeds = ['Cnk0PGn9YBM', 'RLAU1VWGsaI', 'vnocd9ZVJj0', 'BiZXS_ojLUA', '7Zsxm9Wh2Yg', 'rOFkZg09AoY', '4MTqi-bapLY', '4xGSHxkMYew'];
const requiredChannelIds = ['UC86AuKBawrgBuEZIgiOo7hA', 'UC9Vkx4zyHY4myJoykjtVm7A', 'UCY-mXLM6DsS9cmSwlh0tqSA', 'UCR6sR1ITtHIz8GZqJOwqxDQ', 'UCHkibO5NjXrjMO90jGjhcPQ', 'UC70hC0mVGURG6rCBibw9Wug', 'UCGZQ3Ac7xkBNL0_s5pDVCKg', 'UC-eyEDlbCD_8epmh-qCJ9oA'];
const consumerCopyIds = ['SHORT-02', 'SHORT-03', 'SHORT-04', 'SHORT-05', 'SHORT-06', 'SHORT-07', 'SHORT-08'];
const forbiddenConsumerClaimWords = ['수면제', '영양제', '보충제', '불안 완화', '부작용 없음'];
const publicRecordBlocks = publicSource.match(/\{\n    id: 'SHORT-[^']+'[\s\S]*?\n  \},/g) ?? [];
const requiredFields = ['id:', 'title:', 'url:', 'channel:', 'speaker:', 'summary:', 'operatorSentence:', 'personSummary:', 'status:', 'statusReason:', 'checkedAt:', 'audit:', 'contentBasis:', 'authorityLevel:', 'evidenceLevel:', 'claimCategories:', 'rightsStatus:', 'usageMode:', 'nextAction:'];
const recordBlocks = source.match(/\{\n    id: '[^']+'[\s\S]*?\n  \},/g) ?? [];
const failures = [];

if (recordBlocks.length < 10) failures.push(`expected at least 10 video records, found ${recordBlocks.length}`);
if (!source.includes('SHARED_GABA_VIDEOS')) failures.push('shared YouTube review showcase is not defined');
if (!source.includes("video.id.startsWith('SHORT-') && video.status !== 'EXCLUDE'")) failures.push('shared showcase does not exclude EXCLUDE videos');
if (!source.includes("ACTIVE_GABA_VIDEOS = GABA_VIDEO_DB.filter(video => !video.id.startsWith('AUTH-'))") || !appSource.includes('const publicPanelVideos = useMemo(() => [...approvedVideos, ...SHARED_GABA_VIDEOS]') || !appSource.includes('const panelVideos = presentationMode ? activePresenterVideos : publicPanelVideos') || !appSource.includes("import('./gabaVideos')")) failures.push('overseas AUTH records are not isolated from domestic presenter and consumer queues');
if (!appSource.includes('id="approved-video-showcase"') || !appSource.includes('사람 검토 완료 · 일반 GABA 교육') || !appSource.includes('일반 교육 공개 승인')) failures.push('domestic PUBLISH_GENERAL records are not connected to a separate approved consumer showcase');
const consumerCopyBlock = publicSource;
for (const id of consumerCopyIds) if (!consumerCopyBlock.includes(`'${id}'`)) failures.push(`consumer-safe copy missing: ${id}`);
for (const word of forbiddenConsumerClaimWords) if (consumerCopyBlock.includes(word)) failures.push(`consumer-safe copy contains forbidden claim word: ${word}`);
for (const block of publicRecordBlocks) {
  const id = block.match(/id: '(SHORT-[^']+)'/)?.[1] ?? 'unknown';
  for (const field of ['publicTitle:', 'publicSummary:', 'publicPersonSummary:', 'publicOperatorSentence:']) {
    if (!block.includes(field)) failures.push(`${field} missing from public-safe ${id}`);
  }
}
if (!consumerCopyBlock.includes('공식 채널 프로필은') || !consumerCopyBlock.includes('인물 확인용이며') || !consumerCopyBlock.includes('자동 승인하지 않습니다')) failures.push('public person summaries do not preserve source-qualified authority boundaries');
for (const field of requiredFields) {
  const missing = recordBlocks.filter(block => !block.includes(field)).length;
  if (missing) failures.push(`${field} missing from ${missing} record(s)`);
}
for (const seed of requiredSeeds) if (!source.includes(seed)) failures.push(`provided Shorts seed missing: ${seed}`);
for (const channelId of requiredChannelIds) if (!source.includes(`sourceChannelId: '${channelId}'`)) failures.push(`provided Shorts source channel ID missing: ${channelId}`);
if (source.includes('https://www.youtube.com/@%EB%B8%8C%EB%A0%88%EC%9D%B8%ED%8A%9C%EB%B8%8CBrainDoctor')) failures.push('SHORT-04 keeps an unstable encoded handle instead of the verified channel ID URL');
if (!source.includes("status: 'PUBLISH_GENERAL'")) failures.push('no PUBLISH_GENERAL record found');
if (!source.includes('https://www.sleepnet.or.kr/workshop/monthly/view?idx=150') || !source.includes('https://e-jsm.org/upload/jsm-13-2-60.pdf')) failures.push('SHORT-06 authority and research evidence links are not the verified official records');
if (!source.includes('https://mediahub.seoul.go.kr/archives/1135642')) failures.push('SHORT-05 authority evidence link is not the current Seoul official profile record');
const short05Block = source.match(/\{\n    id: 'SHORT-05'[\s\S]*?\n  \},/)?.[0] ?? '';
const short06Block = source.match(/\{\n    id: 'SHORT-06'[\s\S]*?\n  \},/)?.[0] ?? '';
if (!short05Block.includes("status: 'LIMITED_USE'") || !short06Block.includes("status: 'HOLD'")) failures.push('official source-link upgrades must not bypass SHORT-05/06 video-content review gates');
if (!source.includes('https://www.youtube.com/channel/UC9Vkx4zyHY4myJoykjtVm7A/about') || !source.includes('https://www.youtube.com/channel/UCR6sR1ITtHIz8GZqJOwqxDQ/about')) failures.push('SHORT-02/04 authority evidence links are not the current official profile pages');
if (!source.includes("PUBLIC_GABA_VIDEOS = GABA_VIDEO_DB.filter(video => video.status === 'PUBLISH_GENERAL')")) failures.push('public list is not restricted to PUBLISH_GENERAL');
if (!appSource.includes("const approvedForCustomerSummary = video.status === 'PUBLISH_GENERAL';") || !appSource.includes('현재 요약은 제목·공개 설명 기반의 예비 정보이며')) failures.push('customer copy does not gate unapproved video summaries');
if (!appSource.includes('video.publicTitle') || !appSource.includes('selectedVideo.publicSummary') || !appSource.includes('selectedVideo.publicPersonSummary') || !appSource.includes('selectedVideo.publicOperatorSentence')) failures.push('consumer video surface does not use the separate public copy fields');
if (!appSource.includes('<dt>요약 근거</dt>') || !appSource.includes('요약 근거: {VIDEO_AUDIT_LABELS.contentBasis[showcaseVideo.audit.contentBasis]}')) failures.push('consumer video surface does not expose the summary evidence basis');
if (!appSource.includes('무엇을 어떻게 소개했나: ${selectedVideo.summary}') || !appSource.includes('인물 소개: ${selectedVideo.personSummary}') || !appSource.includes('무엇을 어떻게 소개했나: ${video.summary}') || !appSource.includes('인물 소개: ${video.personSummary}')) failures.push('meeting copy does not preserve each video summary and person introduction');
if (source.includes("status: 'PUBLISH_GENERAL',\n    statusReason: '")) {
  const publicBlocks = recordBlocks.filter(block => block.includes("status: 'PUBLISH_GENERAL'"));
  for (const block of publicBlocks) {
    if (!/교육|일반|NIH|CSHL/.test(block)) failures.push(`public record lacks general-education evidence marker: ${block.match(/id: '([^']+)'/)?.[1] ?? 'unknown'}`);
    if (!block.includes('statusReason:') || !block.includes('checkedAt:')) failures.push(`public record lacks audit fields: ${block.match(/id: '([^']+)'/)?.[1] ?? 'unknown'}`);
    if ((!block.includes('previewImage:') || !block.includes('previewAlt:')) && !block.includes('previewLabel:')) failures.push(`public record lacks official preview metadata: ${block.match(/id: '([^']+)'/)?.[1] ?? 'unknown'}`);
  }
}

if (failures.length) {
  console.error('GABA video DB QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`GABA video DB QA passed: ${recordBlocks.length} records, ${requiredSeeds.length} provided Shorts, public list gated by PUBLISH_GENERAL.`);
