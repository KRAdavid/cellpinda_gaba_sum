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
  discussion: read('docs/TF_DISCUSSION_BOARD.md'),
  roster: read('docs/TF_ROSTER.md'),
  kickoff: read('docs/TF_KICKOFF_INPUT.md'),
  decisions: read('docs/TF_DECISION_REGISTER.md'),
  fieldPacket: read('docs/FIELD_SESSION_PACKET.md'),
  invite: read('docs/TF_TEAM_INVITE.md'),
  productEvidence: read('docs/PRODUCT_EVIDENCE_INTAKE.md'),
  rightsRegister: read('docs/REVIEW_RIGHTS_REGISTER.md'),
};

const checks = [
  ['public URL is documented', files.readme, 'https://kradavid.github.io/cellpinda_gaba_sum/'],
  ['README documents product exclusion', files.readme, '제품·후기·판매 정보는 공개 카드와 패널에서 다루지 않습니다'],
  ['README links team invite packet', files.readme, 'docs/TF_TEAM_INVITE.md'],
  ['README links video database', files.readme, 'GABA_VIDEO_DB.md'],
  ['README documents TF readiness command', files.readme, 'pnpm run qa:tf'],
  ['official site is identified separately', files.handoff, 'https://kradavid.github.io/cellpinda_GABA/'],
  ['meeting pack is linked from README', files.readme, 'docs/TF_MEETING_PACK.md'],
  ['TF roles are defined', files.tf, '근거·준법 리드'],
  ['TF PM role is defined', files.tf, 'TF 리드·PM'],
  ['consumer psychology role is defined', files.tf, '마케팅·소비자 심리 리드'],
  ['conversion experience role is defined', files.tf, '브랜드·전환 경험 설계 리드'],
  ['information visualization role is defined', files.tf, '일러스트·정보시각화 리드'],
  ['sales data role is defined', files.tf, '데이터·판매처 운영 리드'],
  ['meeting pack covers scenario A', files.meeting, 'A. 전체 이야기'],
  ['meeting pack covers scenario B', files.meeting, 'B. 제품 문의 우선'],
  ['meeting pack covers scenario C', files.meeting, 'C. 근거 질문 대응'],
  ['meeting pack includes TF PM', files.meeting, 'TF 리드·PM'],
  ['meeting pack includes product approver', files.meeting, '제품 책임자·표시 승인자'],
  ['meeting pack defines core meeting roles', files.meeting, '핵심 참석자는 TF 리드·PM'],
  ['meeting pack records decision evidence', files.meeting, '문제 → 결정 → 변경 파일 → 검증 결과 → 다음 담당자·종료 조건'],
  ['discussion board is linked from README', files.readme, 'docs/TF_DISCUSSION_BOARD.md'],
  ['discussion board separates field hold', files.discussion, '기술 PASS / 현장 HOLD'],
  ['discussion board records dissent and evidence', files.discussion, '반대 관점·리스크'],
  ['discussion board keeps product facts on hold', files.discussion, 'EVD-01'],
  ['discussion board tracks product inquiry next action', files.discussion, 'SALES-01'],
  ['discussion board tracks entry hierarchy', files.discussion, 'UX-03'],
  ['discussion board tracks accessibility evidence', files.discussion, 'REL-02'],
  ['discussion board tracks fast swipe evidence', files.discussion, 'REL-03'],
  ['discussion board tracks evidence shortcut', files.discussion, 'SALES-04'],
  ['decision register tracks owners and evidence', files.decisions, '실행 담당·백업'],
  ['decision register preserves field hold', files.decisions, 'READY FOR FIELD'],
  ['decision register uses strict per-session threshold', files.decisions, 'A/B/C **각 세션 4점 이상'],
  ['decision register tracks evidence shortcut', files.decisions, 'SALES-04'],
  ['field packet fixes public baseline', files.fieldPacket, 'RELEASE_HANDOFF.md'],
  ['field packet covers all three scenarios', files.fieldPacket, '### C. 근거 질문 대응'],
  ['field packet defines observer scoring', files.fieldPacket, '다음 행동 명확도 1~5점'],
  ['field packet preserves privacy guardrail', files.fieldPacket, '고객의 이름·연락처·건강 상태·복용 약'],
  ['field packet defines P0 rules', files.fieldPacket, '### P0 판정'],
  ['TF roster defines assignment gate', files.roster, '실제 인력 배정 HOLD'],
  ['TF roster defines core attendees', files.roster, '핵심 회의 참석자'],
  ['TF kickoff input defines six core roles', files.kickoff, '6개 핵심 역할'],
  ['TF kickoff input defines session assignments', files.kickoff, 'A 시나리오 설명자·관찰자'],
  ['TF kickoff input preserves privacy guardrail', files.kickoff, '건강 상태·복용 약'],
  ['acceptance matrix tracks TF assignment', files.acceptance, 'TF 실제 담당자·백업·결정권 배정'],
  ['launch guide is linked from README', files.readme, 'docs/SALES_ONE_PAGE_GUIDE.md'],
  ['launch guide defines the full sales route', files.launchGuide, '01 일상 상태 → 02 여유가 안 생기는 날 → 03 생각 과부하 → 04 적극적인 휴식 → 05 GABA 성분 이름 → 06 일반 GABA 연구 → 07 제품 정보 → 08 활용 TIP → 09 생활 루틴 → 10 후기 → 11 마무리'],
  ['launch guide keeps GABA research bounded', files.launchGuide, '셀핀다 제품의 동일 제형·섭취량 효능을 직접 입증하는 자료는 아닙니다'],
  ['launch guide keeps external sources secondary', files.launchGuide, '외부 자료는 필요할 때만 확인'],
  ['launch guide includes presenter question guidance', files.launchGuide, '자주 묻는 질문에 답하기'],
  ['launch guide includes presenter answer copy guardrail', files.launchGuide, '답변 복사'],
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
  ['TF execution board tracks product inquiry validation', files.tf, '제품 문의 후 행동 전환 검증'],
  ['team invite defines core roles', files.invite, '핵심 역할과 결정 범위'],
  ['team invite defines kickoff agenda', files.invite, '첫 회의 안건'],
  ['team invite preserves approval boundaries', files.invite, '일반 GABA 연구를 셀핀다 제품'],
  ['team invite documents readiness command', files.invite, 'pnpm run qa:tf'],
  ['product evidence intake keeps approval hold', files.productEvidence, '상태를 `HOLD`로 유지'],
  ['product evidence intake separates approvers', files.productEvidence, '제품 책임자와 근거·준법 리드'],
  ['rights register records economic interest', files.rightsRegister, '경제적 이해관계'],
  ['rights register preserves personal data guardrail', files.rightsRegister, '개인정보는 이 표에 기록하지 않는다'],
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
