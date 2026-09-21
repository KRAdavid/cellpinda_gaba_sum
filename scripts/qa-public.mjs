import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const indexPath = path.join(dist, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('QA failed: dist/index.html is missing. Run the build first.');
  process.exit(1);
}

const index = fs.readFileSync(indexPath, 'utf8');
const assetPaths = [...index.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
const assetText = assetPaths
  .map(assetPath => {
    const filePath = path.join(dist, assetPath.replace(/^\//, '').replace(/^cellpinda_gaba_sum\//, ''));
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  })
  .join('\n');

const required = [
  ['general research label', '일반 GABA 연구'],
  ['research limitation', '14개 위약대조 인체시험'],
  ['research citation title', 'Effects of Oral Gamma-Aminobutyric Acid'],
  ['research citation PMID', 'PMID 33041752'],
  ['product efficacy boundary', '셀핀다 제품의 효능을 직접 입증하는 자료가 아닙니다'],
  ['research to product transition', '여기서부터는 연구가 아닌 판매 제품의 표시 정보입니다'],
  ['presenter guidance', '발표자용 진행 포인트'],
  ['presenter prompt guidance', '고객에게 물어보기'],
  ['presenter boundary guidance', '이어서 말할 때'],
  ['presenter restart control', '처음부터'],
  ['presenter keyboard support', 'PageUp/PageDown'],
  ['presenter dialog state', 'story--presentation'],
  ['card sharing control', '현재 카드 링크 공유'],
  ['card sharing copy control', '링크 복사'],
  ['business entry label', '사업자용 설명 시작'],
  ['opening everyday hook', '말이 먼저 세게 나온 날'],
  ['opening product boundary', '바로 제품을 찾기보다'],
  ['opening presenter prompt', '몸은 쉬고 있는데 생각이 다음 일로 달려간다고 느낀 적이 있나요?'],
  ['story sequence guide', 'story-sequence'],
  ['native share fallback', 'navigator.share'],
  ['lifestyle and product boundary', '이 생활 루틴은 특정 성분이나 제품의 효과를 뜻하지 않습니다'],
  ['product verification status', '최종 제품 사실로 확정하지 않습니다'],
  ['product card boundary', '이 카드에서 확정하지 않고'],
  ['review rights boundary', '원문·이미지 사용권 확인 전 재게시하지 않음'],
];

const requiredMetadata = [
  ['description metadata', '셀핀다 제품 관련 소비자 안내 페이지입니다'],
  ['Open Graph description', '일반 GABA 연구, 셀핀다 제품 정보, 구매자 후기를 구분'],
];

const forbidden = [
  ['unverified product image', 'product-gaba1500.webp'],
  ['sleep guarantee', '숙면 보장'],
  ['interaction guarantee', '상호작용 없음'],
  ['brain fatigue claim', '뇌 피로 회복'],
  ['old official-site URL', 'cellpinda_GABA/'],
  ['old biological wording', '몸속 신호 전달에 관여'],
];

const failures = [];
if (!index.includes('favicon.svg')) failures.push('missing favicon link');
if (!fs.existsSync(path.join(dist, 'favicon.svg'))) failures.push('missing favicon asset');
for (const [label, value] of required) {
  if (!assetText.includes(value)) failures.push(`missing required ${label}: ${value}`);
}
for (const [label, value] of requiredMetadata) {
  if (!index.includes(value)) failures.push(`missing required ${label}: ${value}`);
}
for (const [label, value] of forbidden) {
  if (assetText.includes(value)) failures.push(`found forbidden ${label}: ${value}`);
}

if (failures.length) {
  console.error('Public bundle QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Public bundle QA passed: ${assetPaths.length} assets checked.`);
