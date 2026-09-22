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
const requiredPublicAssets = ['images/gaba-overload.png', 'images/gaba-neural-signal.png'];
const assetPaths = [...index.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
const assetText = assetPaths.map(assetPath => {
  const filePath = path.join(dist, assetPath.replace(/^\//, '').replace(/^cellpinda_gaba_sum\//, ''));
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}).join('\n');

const required = [
  ['general education title', '일반 GABA 교육'],
  ['general research label', '일반 GABA 연구'],
  ['gaba name definition', '감마아미노부티르산을 줄여 부르는 이름'],
  ['everyday hook copy', '쉽게 흥분하고 실수가 이어지는 날'],
  ['research limitation', '14개 위약대조 인체시험'],
  ['stress evidence limitation', '스트레스 관련 근거는 제한적'],
  ['sleep evidence limitation', '수면 관련 근거는 매우 제한적'],
  ['research citation title', 'Effects of Oral Gamma-Aminobutyric Acid'],
  ['research citation PMID', 'PMID 33041752'],
  ['research neutral summary', '스트레스와 수면 관련 지표'],
  ['research source disclosure', '근거 출처 5건'],
  ['presenter source review draft', '과학 출처 사람 검토 초안'],
  ['presenter source review copy', '출처 검토 초안 전체 복사'],
  ['in-page video player', '페이지 안에서 원문 재생'],
  ['general physiology source', 'Synaptic inhibition and γ-aminobutyric acid'],
  ['GABA tone source', 'GABA tone regulation and its cognitive functions'],
  ['stress human trial source', 'Oral intake of γ-aminobutyric acid affects mood'],
  ['stress human trial PMID', 'PMID 22203366'],
  ['sleep physiology source', 'About Sleep'],
  ['inhibitory neurotransmitter explanation', '억제성 신경전달물질'],
  ['everyday GABA function explanation', '뇌의 신호가 너무 커지지 않도록 브레이크처럼 조절합니다'],
  ['video status curation', '일반 교육 공개 승인'],
  ['shared YouTube Shorts showcase', '오늘 공유하신 국내 YouTube Shorts'],
  ['separate video showcase', '별도 섹션 · 영상 요약'],
  ['video showcase in-page-first action', '상세 감리 먼저 보기'],
  ['video showcase share action', '이 영상 링크 공유'],
  ['video showcase deep-link state', 'searchParams.set("video"'],
  ['video showcase source-link guard', '원문 링크는 상세 패널에서 선택'],
  ['video showcase hero copy', '원문으로 확인하세요'],
  ['video candidate boundary', '오늘 공유된 검토 후보입니다'],
  ['video audit preview', '권위 확인:'],
  ['video candidate trust boundary', '사람 감리 전 검토 후보'],
  ['approved video showcase gate', '사람 검토 완료 · 일반 GABA 교육'],
  ['approved video publication status', '일반 교육 공개 승인'],
  ['approved video source-link guard', '상세 패널에서 원문 확인'],
  ['video monitor freshness', '영상 후보는 원문 확인 전 검토 대상으로 표시됩니다'],
  ['reel next action', '다음 장면'],
  ['reel video handoff', '영상 요약으로 이어가기'],
  ['video person summary', '인물 소개'],
  ['video operator sentence', '사업자 설명 한 문장'],
  ['video audit fields', '요약 근거'],
  ['video audit next action', '다음 감리 행동'],
  ['official video preview', '공식 원문 미리보기'],
  ['video audit database', '영상 DB 감리'],
  ['publication request gate', '공개 요청 패킷 저장'],
  ['presenter guidance', '발표자용 진행 포인트'],
  ['presenter scene explanation copy', '현재 장면 설명문 복사'],
  ['presenter prompt guidance', '고객에게 물어보기'],
  ['presenter boundary guidance', '이어서 말할 때'],
  ['presenter question guidance', '자주 묻는 질문에 답하기'],
  ['presenter answer copy control', '답변 복사'],
  ['presenter next-scene hint', '다음 설명:'],
  ['presenter keyboard support', 'PageUp/PageDown'],
  ['presenter dialog state', 'story--presentation'],
  ['scene sharing control', '현재 장면 링크 공유'],
  ['card sharing copy control', '고객용 링크 복사'],
  ['panel customer copy control', '이 장면 고객용 링크 복사'],
  ['daily monitoring snapshot', '일일 감리 상태'],
  ['daily monitoring last check', '마지막 자동 확인'],
  ['registered video link health', '등록 영상 원문 링크'],
  ['registered video link warnings', '링크 경고'],
  ['registered YouTube metadata health', '등록 YouTube 메타데이터'],
  ['registered YouTube metadata warnings', '메타데이터 경고'],
  ['registered YouTube caption health', '등록 YouTube 자막 트랙'],
  ['registered YouTube caption warnings', '자막 경고'],
  ['registered YouTube caption body health', '등록 YouTube 자막 본문'],
  ['registered YouTube caption body warnings', '본문 경고'],
  ['registered YouTube caption body rate limit', 'HTTP 429 접근 제한'],
  ['daily review queue', '오늘 먼저 검토할 후보'],
  ['daily review queue assignment', '첫 담당'],
  ['daily review queue disclosure', '원문·자막·화자·권리 확인 전에는 공개하지 않습니다'],
  ['daily review session link', '오늘 리뷰 세션'],
  ['daily monitoring source link', '감리 우선순위 보드 원문'],
  ['presenter TF operations board', 'TF 운영 보드'],
  ['presenter TF next action', '다음 행동'],
  ['presenter TF meeting sequence', '첫 회의 진행 순서'],
  ['presenter TF discussion queue', '오늘의 토론 논점 보기'],
  ['presenter TF discussion evidence', '필요 증거'],
  ['presenter TF discussion copy', '회의 논점·기록 복사'],
  ['presenter field session records', 'A/B/C 현장 검증 기록'],
  ['presenter field session privacy boundary', '고객 개인정보·건강 상태·복용 약은 기록하지 않습니다'],
  ['presenter field session copy', '현장 기록 초안 복사'],
  ['presenter video DB csv export', '영상 DB CSV 내려받기'],
  ['presenter review queue csv export', '감리 큐 CSV 내려받기'],
  ['presenter review handoff export', '감리 패킷 JSON 저장'],
  ['presenter review handoff import', '감리 패킷 불러오기'],
  ['in-page flow continuity', '현재 페이지의 흐름은 유지됩니다'],
  ['in-page next destination', '다음 장면'],
  ['consumer next action', 'story-next-button'],
  ['consumer secondary controls disclosure', 'story-secondary-controls'],
  ['external link disclosure', '외부 자료는 필요할 때만 확인'],
  ['accessible story carousel', 'aria-roledescription'],
  ['native share fallback', 'navigator.share'],
];

const requiredMetadata = [
  ['description metadata', 'GABA가 무엇이고 뇌의 신호를 어떻게 조절하는지'],
  ['Open Graph description', '일상 속 뇌 과부하에서 GABA의 일반 기능'],
];

const forbiddenMetadata = [
  ['product advertising description', '셀핀다 제품 관련 소비자 안내'],
  ['product review metadata', '구매자 후기를 구분'],
  ['smartstore metadata', '스마트스토어'],
];

const forbiddenPublicCopy = [
  ['product brand name', '셀핀다'],
  ['product store URL', 'smartstore.naver.com'],
  ['negative stress evidence wording', '스트레스 근거는 제한적이고'],
  ['negative sleep evidence wording', '수면 근거는 매우 제한적이며'],
];

const forbiddenPublicBundleTerms = [
  ['raw product candidate title', '몽진환'],
  ['raw product candidate source', '케이지바이오'],
  ['raw product candidate label', '제품성 후보'],
  ['raw supplement claim', '수면제'],
  ['raw supplement claim', '영양제'],
];

const failures = [];
if (!index.includes('favicon.svg')) failures.push('missing favicon link');
if (!fs.existsSync(path.join(dist, 'favicon.svg'))) failures.push('missing favicon asset');
for (const [label, value] of required) if (!assetText.includes(value)) failures.push(`missing required ${label}: ${value}`);
for (const [label, value] of requiredMetadata) if (!index.includes(value)) failures.push(`missing required ${label}: ${value}`);
for (const [label, value] of forbiddenMetadata) if (index.includes(value)) failures.push(`found forbidden ${label}: ${value}`);
for (const [label, value] of forbiddenPublicCopy) if (assetText.includes(value)) failures.push(`found forbidden public copy ${label}: ${value}`);
for (const [label, value] of forbiddenPublicBundleTerms) if (assetText.includes(value)) failures.push(`found forbidden public bundle term ${label}: ${value}`);
for (const asset of requiredPublicAssets) if (!fs.existsSync(path.join(dist, asset))) failures.push(`missing required visual asset: ${asset}`);

if (failures.length) {
  console.error('Public bundle QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Public bundle QA passed: ${assetPaths.length} assets checked; general education metadata and controls found.`);
