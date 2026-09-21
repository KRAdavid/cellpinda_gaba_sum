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
  ['product efficacy boundary', '셀핀다 제품의 효능을 직접 입증하는 자료가 아닙니다'],
  ['research to product transition', '여기서부터는 연구가 아닌 판매 제품의 표시 정보입니다'],
  ['presenter guidance', '발표자용 설명 포인트'],
  ['presenter keyboard support', 'PageUp/PageDown'],
  ['presenter dialog state', 'story--presentation'],
  ['card sharing control', '현재 카드 링크 공유'],
  ['native share fallback', 'navigator.share'],
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
for (const [label, value] of forbidden) {
  if (assetText.includes(value)) failures.push(`found forbidden ${label}: ${value}`);
}

if (failures.length) {
  console.error('Public bundle QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Public bundle QA passed: ${assetPaths.length} assets checked.`);
