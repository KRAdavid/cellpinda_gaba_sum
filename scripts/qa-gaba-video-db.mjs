import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src', 'gabaVideos.ts'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
const requiredSeeds = ['Cnk0PGn9YBM', 'RLAU1VWGsaI', 'vnocd9ZVJj0', 'BiZXS_ojLUA', '7Zsxm9Wh2Yg', 'rOFkZg09AoY', '4MTqi-bapLY', '4xGSHxkMYew'];
const consumerCopyIds = ['SHORT-02', 'SHORT-03', 'SHORT-04', 'SHORT-05', 'SHORT-06', 'SHORT-07', 'SHORT-08'];
const forbiddenConsumerClaimWords = ['수면제', '영양제', '보충제', '불안 완화', '부작용 없음'];
const requiredFields = ['id:', 'title:', 'url:', 'channel:', 'speaker:', 'summary:', 'operatorSentence:', 'personSummary:', 'status:', 'statusReason:', 'checkedAt:', 'audit:', 'contentBasis:', 'authorityLevel:', 'evidenceLevel:', 'claimCategories:', 'rightsStatus:', 'usageMode:', 'nextAction:'];
const recordBlocks = source.match(/\{\n    id: '[^']+'[\s\S]*?\n  \},/g) ?? [];
const failures = [];

if (recordBlocks.length < 10) failures.push(`expected at least 10 video records, found ${recordBlocks.length}`);
if (!source.includes('SHARED_GABA_VIDEOS')) failures.push('shared YouTube review showcase is not defined');
if (!source.includes("video.id.startsWith('SHORT-') && video.status !== 'EXCLUDE'")) failures.push('shared showcase does not exclude EXCLUDE videos');
const consumerCopyBlock = source.match(/const CONSUMER_GABA_VIDEO_COPY[\s\S]*?\n};\n\nexport const SHARED_GABA_VIDEOS/)?.[0] ?? '';
for (const id of consumerCopyIds) if (!consumerCopyBlock.includes(`'${id}'`)) failures.push(`consumer-safe copy missing: ${id}`);
for (const word of forbiddenConsumerClaimWords) if (consumerCopyBlock.includes(word)) failures.push(`consumer-safe copy contains forbidden claim word: ${word}`);
for (const field of requiredFields) {
  const missing = recordBlocks.filter(block => !block.includes(field)).length;
  if (missing) failures.push(`${field} missing from ${missing} record(s)`);
}
for (const seed of requiredSeeds) if (!source.includes(seed)) failures.push(`provided Shorts seed missing: ${seed}`);
if (!source.includes("status: 'PUBLISH_GENERAL'")) failures.push('no PUBLISH_GENERAL record found');
if (!source.includes('https://www.sleepnet.or.kr/workshop/monthly/view?idx=150') || !source.includes('https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002182911')) failures.push('SHORT-06 authority and research evidence links are not the verified official records');
if (!source.includes('https://www.youtube.com/@doctorLeeTV/about') || !source.includes('https://www.youtube.com/@%EB%B8%8C%EB%A0%88%EC%9D%B8%ED%8A%9C%EB%B8%8CBrainDoctor/about')) failures.push('SHORT-02/04 authority evidence links are not the current official profile pages');
if (!source.includes("PUBLIC_GABA_VIDEOS = GABA_VIDEO_DB.filter(video => video.status === 'PUBLISH_GENERAL')")) failures.push('public list is not restricted to PUBLISH_GENERAL');
if (!appSource.includes("const approvedForCustomerSummary = video.status === 'PUBLISH_GENERAL';") || !appSource.includes('현재 요약은 제목·공개 설명 기반의 예비 정보이며')) failures.push('customer copy does not gate unapproved video summaries');
if (!appSource.includes('video.publicTitle') || !appSource.includes('selectedVideo.publicSummary') || !appSource.includes('selectedVideo.publicPersonSummary') || !appSource.includes('selectedVideo.publicOperatorSentence')) failures.push('consumer video surface does not use the separate public copy fields');
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
