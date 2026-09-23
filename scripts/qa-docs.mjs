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
  publishing: read('docs/PUBLISHING_TF.md'),
  kickoff: read('docs/GABA_EDUCATION_KICKOFF.md'),
  operator: read('docs/GENERAL_GABA_OPERATOR_GUIDE.md'),
  field: read('docs/GENERAL_GABA_FIELD_SESSION.md'),
  acceptance: read('docs/GOAL_ACCEPTANCE_MATRIX.md'),
  handoff: read('docs/RELEASE_HANDOFF.md'),
  meeting: read('docs/TF_MEETING_PACK.md'),
  discussion: read('docs/TF_DISCUSSION_BOARD.md'),
  decisions: read('docs/TF_DECISION_REGISTER.md'),
  roster: read('docs/TF_ROSTER.md'),
  educationInvite: read('docs/GABA_EDUCATION_TEAM_INVITE.md'),
  invite: read('docs/TF_TEAM_INVITE.md'),
  scope: read('docs/GABA_EDUCATION_SCOPE.md'),
  tf: read('docs/GABA_EDUCATION_TF.md'),
  aiProxy: read('docs/AI_PROXY_APPROVAL_2026-09-23.md'),
  sourceRegister: read('docs/GABA_SOURCE_REGISTER.md'),
  videoDb: read('docs/GABA_VIDEO_DB.md'),
  captionAudit: read('docs/GABA_VIDEO_CAPTION_AUDIT_2026-09-22.md'),
  videoRules: read('docs/GABA_VIDEO_REVIEW_RULES.md'),
  videoMonitor: read('docs/GABA_VIDEO_DAILY_MONITOR.md'),
  legacyField: read('docs/FIELD_SESSION_PACKET.md'),
  legacySales: read('docs/SALES_WALKTHROUGH.md'),
  legacyProduct: read('docs/PRODUCT_EVIDENCE_INTAKE.md'),
  legacyRights: read('docs/REVIEW_RIGHTS_REGISTER.md'),
};

const checks = [
  ['public URL is documented', files.readme, 'https://kradavid.github.io/cellpinda_gaba_sum/'],
  ['README documents product exclusion', files.readme, '제품·후기·판매 정보는 공개 읽기 흐름과 패널에서 다루지 않습니다'],
  ['README separates presenter tools from public flow', files.readme, '발표자·TF 기능은 노출하지 않습니다'],
  ['README links current operator guide', files.readme, 'docs/GENERAL_GABA_OPERATOR_GUIDE.md'],
  ['README links current field session', files.readme, 'docs/GENERAL_GABA_FIELD_SESSION.md'],
  ['README links video database', files.readme, 'GABA_VIDEO_DB.md'],
  ['README documents readiness command', files.readme, 'pnpm run qa:education-tf'],
  ['README links current education team invite', files.readme, 'docs/GABA_EDUCATION_TEAM_INVITE.md'],
  ['official site is identified separately', files.handoff, 'https://kradavid.github.io/cellpinda_GABA/'],
  ['publishing TF is general education only', files.publishing, '제품명·가격·구성·섭취량·후기·판매 링크는 이 공개 교육본의 범위에 포함하지 않는다'],
  ['publishing TF records eight-scene reading flow', files.publishing, '8개 장면 세로 읽기 흐름'],
  ['kickoff is product-free', files.kickoff, '제품·후기·판매 문구를 결정하는 회의가 아니다'],
  ['kickoff includes video audit questions', files.kickoff, '화자·발언·근거·권리'],
  ['operator guide defines eight-message route', files.operator, '8장 설명 흐름'],
  ['operator guide keeps product out', files.operator, '제품·가격·구성·섭취량·후기·판매 링크는 이 공개 교육 흐름에서 다루지 않는다'],
  ['operator guide defines video DB handoff', files.operator, '다음 감리 행동'],
  ['field packet defines three general education scenarios', files.field, '### B. 권위 영상 질문'],
  ['field packet defines per-session threshold', files.field, 'A/B/C 각 세션 4점 이상'],
  ['field packet protects personal data', files.field, '건강 상태·복용 약은 기록하지 않는다'],
  ['acceptance matrix defines one-message feed', files.acceptance, '1페이지 1메시지·릴스형 흐름'],
  ['acceptance matrix defines research boundary', files.acceptance, '원문·자막·화자·권리 확인 후 승인'],
  ['acceptance matrix keeps auto publication gated', files.acceptance, '자동 공개 방지'],
  ['handoff records Pages workflow', files.handoff, 'Pages 배포'],
  ['handoff keeps human gates', files.handoff, '남은 HOLD'],
  ['meeting pack defines current scenarios', files.meeting, 'A. 처음 보는 사람'],
  ['discussion board tracks video authority', files.discussion, 'VIDEO-01'],
  ['decision register tracks daily monitoring', files.decisions, 'OPS-01'],
  ['TF document keeps assignment gate', files.tf, '담당자와 백업'],
  ['AI proxy approval records the delegated scope', files.aiProxy, 'AI-PROXY-APPROVED_WITH_HUMAN_GATES'],
  ['AI proxy keeps human gates', files.aiProxy, '법률·광고·식품 표시·의료 준법 판단'],
  ['AI proxy does not approve public authority videos', files.aiProxy, '국내 공개 승인 0건'],
  ['education invite is product-free', files.educationInvite, '제품명·가격·구성·섭취량·후기·판매 링크·제품 효능은 이 TF의 공개 범위가 아니다'],
  ['education invite defines human review roles', files.educationInvite, 'SCIENCE'],
  ['education invite keeps approval on hold before human input', files.educationInvite, '역할 이름이나 회의 시간이 입력되기 전에는 `HOLD`로 유지한다'],
  ['scope excludes product facts', files.scope, '셀핀다 제품명·SKU·가격·구성·섭취량·구매 링크'],
  ['source register keeps positive public copy drafts', files.sourceRegister, '## 공개 문장 초안'],
  ['source register public copy stays condition-aware', files.sourceRegister, '연구 조건과 함께 읽습니다'],
  ['source register keeps human review boundary', files.sourceRegister, 'HUMAN_REVIEWED'],
  ['video DB contains required audit fields', files.videoDb, 'operatorSentence'],
  ['video DB links caption access audit', files.videoDb, 'GABA_VIDEO_CAPTION_AUDIT_2026-09-22.md'],
  ['caption audit keeps transcript boundary', files.captionAudit, '자막 본문 자동 확보는 HTTP 429로 실패'],
  ['video rules keep authority separate from claims', files.videoRules, '권위는 영상 내용의 진실성을 대신하지 않는다'],
  ['daily monitor keeps pending review', files.videoMonitor, 'PENDING_REVIEW'],
  ['legacy product session is marked', files.legacyField, '레거시 문서'],
  ['legacy sales guide is marked', files.legacySales, '레거시 문서'],
  ['legacy product evidence is marked', files.legacyProduct, '범위 밖 보관 문서'],
  ['legacy rights register is marked', files.legacyRights, '범위 밖 보관 문서'],
];

const failures = checks
  .filter(([, content, expected]) => !content.includes(expected))
  .map(([label, , expected]) => `${label}: ${expected}`);
if (!files.videoDb.includes('https://pubmed.ncbi.nlm.nih.gov/23574805/') || files.videoDb.includes('https://pubmed.ncbi.nlm.nih.gov/31869147/')) failures.push('video DB general physiology reference is out of sync with the source register');

const readmeDocLinks = [...files.readme.matchAll(/\]\((docs\/[^)]+)\)/g)].map(match => match[1]);
for (const relativePath of readmeDocLinks) {
  if (!fs.existsSync(path.join(root, relativePath))) failures.push(`README link target missing: ${relativePath}`);
}

const currentDocs = [files.publishing, files.kickoff, files.operator, files.field, files.acceptance, files.handoff, files.meeting, files.discussion, files.decisions];
for (const content of currentDocs) {
  if (content.includes('11개 카드') || content.includes('07번 제품 카드') || content.includes('제품 문의 우선')) {
    failures.push('current general-education document contains stale product-flow language');
    break;
  }
}

if (failures.length) {
  console.error('TF document QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`TF document QA passed: ${checks.length} current-governance checks and ${readmeDocLinks.length} README links checked.`);
