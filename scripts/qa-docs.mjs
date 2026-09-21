import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) throw new Error(`missing file: ${relativePath}`);
  return fs.readFileSync(filePath, 'utf8');
};

const files = {
  readme: read('README.md'),
  tf: read('docs/PUBLISHING_TF.md'),
  meeting: read('docs/TF_MEETING_PACK.md'),
  acceptance: read('docs/GOAL_ACCEPTANCE_MATRIX.md'),
  handoff: read('docs/RELEASE_HANDOFF.md'),
  sessions: read('docs/SALES_SESSION_VALIDATION.md'),
  quickstart: read('docs/SALES_SESSION_QUICKSTART.md'),
  launchGuide: read('docs/SALES_ONE_PAGE_GUIDE.md'),
};

const checks = [
  ['public URL is documented', files.readme, 'https://kradavid.github.io/cellpinda_gaba_sum/'],
  ['README documents presenter product shortcut', files.readme, '제품부터 설명'],
  ['official site is identified separately', files.handoff, 'https://kradavid.github.io/cellpinda_GABA/'],
  ['meeting pack is linked from README', files.readme, 'docs/TF_MEETING_PACK.md'],
  ['TF roles are defined', files.tf, '근거·준법 리드'],
  ['meeting pack covers scenario A', files.meeting, 'A. 전체 이야기'],
  ['meeting pack covers scenario B', files.meeting, 'B. 제품 문의 우선'],
  ['meeting pack covers scenario C', files.meeting, 'C. 근거 질문 대응'],
  ['meeting pack records decision evidence', files.meeting, '문제 → 결정 → 변경 파일 → 검증 결과 → 다음 담당자·종료 조건'],
  ['launch guide is linked from README', files.readme, 'docs/SALES_ONE_PAGE_GUIDE.md'],
  ['launch guide defines the full sales route', files.launchGuide, '01 일상 상태 → 02 여유가 안 생기는 날 → 03 생각 과부하 → 04 적극적인 휴식 → 05 GABA 성분 이름 → 06 일반 GABA 연구 → 07 제품 정보 → 08 활용 TIP → 09 생활 루틴 → 10 후기 → 11 마무리'],
  ['launch guide keeps GABA research bounded', files.launchGuide, '셀핀다 제품의 동일 제형·섭취량 효능을 직접 입증하는 자료는 아닙니다'],
  ['launch guide keeps external sources secondary', files.launchGuide, '외부 자료는 필요할 때만 확인'],
  ['launch guide includes presenter question guidance', files.launchGuide, '자주 묻는 질문에 답하기'],
  ['acceptance matrix keeps business validation on hold', files.acceptance, '실제 영업 적합성 | 세션 검증 양식'],
  ['acceptance matrix keeps device validation on hold', files.acceptance, '실기기 접근성'],
  ['session template forbids personal data collection', files.sessions, '건강정보'],
  ['handoff keeps product facts bounded', files.handoff, '최신 표시사항이 필요한 질문은 답을 확정하지 않는다'],
  ['handoff includes routine cards in the sales route', files.handoff, '08번 활용 TIP과 09번 생활 루틴'],
  ['quickstart defines the full card route', files.quickstart, '01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11'],
  ['session scenario A covers routine cards', files.sessions, '제품 → 활용 TIP → 생활 루틴 → 후기'],
  ['TF execution board defines purpose and deliverable', files.tf, '정식 공개 실행 보드'],
  ['TF execution board defines exit criteria and next action', files.tf, '종료 조건 | 담당 | 다음 액션'],
  ['TF execution board preserves field hold', files.tf, '기술 PASS / 현장 HOLD'],
];

const failures = checks
  .filter(([, content, expected]) => !content.includes(expected))
  .map(([label, , expected]) => `${label}: ${expected}`);

const readmeDocLinks = [...files.readme.matchAll(/\]\((docs\/[^)]+)\)/g)].map(match => match[1]);
for (const relativePath of readmeDocLinks) {
  if (!fs.existsSync(path.join(root, relativePath))) failures.push(`README link target missing: ${relativePath}`);
}

if (failures.length) {
  console.error('TF document QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`TF document QA passed: ${checks.length} governance checks and ${readmeDocLinks.length} README links checked.`);
