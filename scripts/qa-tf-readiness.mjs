import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const roster = read('docs/TF_ROSTER.md');
const kickoff = read('docs/TF_KICKOFF_INPUT.md');
const decisions = read('docs/TF_DECISION_REGISTER.md');
const sessions = read('docs/SALES_SESSION_VALIDATION.md');

const coreRoles = [
  ['PM', 'TF 리드·PM'],
  ['SALES', '사업·영업 리드'],
  ['UX', '소비자 UX·카피 리드'],
  ['EVIDENCE', '근거·준법 리드'],
  ['PRODUCT', '제품 책임자·표시 승인자'],
  ['QA', '릴리스 QA 리드'],
];

const roleRow = id => roster.split('\n').find(line => line.startsWith(`| ${id} |`)) ?? '';
const roleAssigned = id => {
  const row = roleRow(id);
  return Boolean(row) && !row.includes('| 미배정 |');
};

const sessionRow = scenario => {
  const rowNumber = {A: '1', B: '2', C: '3'}[scenario];
  return sessions.split('\n').find(line => line.startsWith(`| ${rowNumber} | ${scenario}.`)) ?? '';
};
const sessionRecorded = scenario => {
  const row = sessionRow(scenario);
  const cells = row.split('|').map(cell => cell.trim());
  // Ignore the template's fixed option text in the customer-link column.
  return Boolean(row) && [3, 4, 5, 7, 8].some(index => Boolean(cells[index]));
};

const coreAssigned = coreRoles.filter(([id]) => roleAssigned(id));
const kickoffAssignments = ['A', 'B', 'C'].filter(scenario => {
  const row = kickoff.split('\n').find(line => line.startsWith(`| ${scenario} 시나리오 설명자·관찰자 |`));
  return Boolean(row) && !row.match(/\|\s*\|\s*$/);
});
const recordedSessions = ['A', 'B', 'C'].filter(sessionRecorded);
const productApproved = !decisions.split('\n').some(line => line.startsWith('| EVD-01 |') && line.includes('| HOLD |'));
const rightsApproved = !decisions.split('\n').some(line => line.startsWith('| RIGHTS-01 |') && line.includes('| HOLD |'));
const deviceReady = !decisions.split('\n').some(line => line.startsWith('| REL-01 |') && line.includes('| 미배정 / 미배정 |'));
const strict = process.argv.includes('--strict');

console.log('TF readiness report');
console.log(`- 핵심 역할 배정: ${coreAssigned.length}/${coreRoles.length}`);
console.log(`- A/B/C 진행자·관찰자 입력: ${kickoffAssignments.length}/3`);
console.log(`- A/B/C 세션 결과 기록: ${recordedSessions.length}/3`);
console.log(`- 제품 사실 승인: ${productApproved ? 'PASS' : 'HOLD'}`);
console.log(`- 후기 권리 승인: ${rightsApproved ? 'PASS' : 'HOLD'}`);
console.log(`- 실기기 게이트: ${deviceReady ? 'READY' : 'HOLD'}`);

const humanReady = coreAssigned.length === coreRoles.length && kickoffAssignments.length === 3;
const fieldReady = recordedSessions.length === 3;
const approvalReady = humanReady && fieldReady && productApproved && rightsApproved && deviceReady;
console.log(`- 현재 판정: ${approvalReady ? '정식 승인 검토 가능' : humanReady ? '현장·증거 검증 진행 필요' : '킥오프 입력 필요'}`);

if (!humanReady) console.log('- 다음 조치: docs/TF_TEAM_INVITE.md 회신 양식으로 6개 핵심 역할·백업·A/B/C 담당자를 입력');
if (!fieldReady) console.log('- 다음 조치: docs/FIELD_SESSION_PACKET.md로 실제 A/B/C 세션을 진행하고 결과를 기록');
if (!productApproved) console.log('- 다음 조치: 최신 포장 또는 제조사 승인 자료로 EVD-01 재검토');
if (!rightsApproved) console.log('- 다음 조치: 후기별 원문·이미지 권리와 경제적 이해관계 확인');
if (!deviceReady) console.log('- 다음 조치: 지원 iOS·Android에서 REL-01 실기기 기록 제출');

if (strict && !approvalReady) {
  console.error('TF strict readiness failed: final approval gates are not complete.');
  process.exit(1);
}
