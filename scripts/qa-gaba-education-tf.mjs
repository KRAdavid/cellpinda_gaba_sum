import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const scope = read('docs/GABA_EDUCATION_SCOPE.md');
const roster = read('docs/GABA_EDUCATION_TF.md');
const kickoff = read('docs/GABA_EDUCATION_KICKOFF.md');
const sources = read('docs/GABA_SOURCE_REGISTER.md');
const videos = read('docs/GABA_VIDEO_REGISTER.md');
const videoDb = read('docs/GABA_VIDEO_DB.md');
const videoRules = read('docs/GABA_VIDEO_REVIEW_RULES.md');
const videoMonitor = read('docs/GABA_VIDEO_DAILY_MONITOR.md');
const videoLog = read('docs/GABA_VIDEO_REVIEW_LOG.md');

const coreRoles = ['PM', 'SCIENCE', 'MEDICAL', 'VIDEO', 'RIGHTS', 'UX', 'QA'];
const rowFor = id => roster.split('\n').find(line => line.startsWith(`| ${id} |`)) ?? '';
const assigned = id => {
  const row = rowFor(id);
  return Boolean(row) && !row.includes('| 미배정 |');
};

const assignedRoles = coreRoles.filter(assigned);
const firstMeetingDate = kickoff.match(/^(?:회의 날짜·시간|첫 회의 날짜·시간):[^\r\n]*$/m)?.[0]?.replace(/^[^:]+:\s*/, '').trim() ?? '';
const firstMeetingFilled = Boolean(firstMeetingDate);
const sourceRows = sources.split('\n').filter(line => /^\| SRC-\d+ \|/.test(line));
const videoRows = videos.split('\n').filter(line => /^\| (?:AUTH|VID|SHORT)-\d+ \|/.test(line));
const sourcePrechecked = sourceRows.filter(line => line.includes('| AI_PRECHECKED |')).length;
const sourceHumanReviewed = sourceRows.filter(line => line.includes('| HUMAN_REVIEWED |')).length;
const shortIds = ['Cnk0PGn9YBM', 'RLAU1VWGsaI', 'vnocd9ZVJj0', 'BiZXS_ojLUA', '7Zsxm9Wh2Yg', 'rOFkZg09AoY', '4MTqi-bapLY', '4xGSHxkMYew'];
const registeredShorts = shortIds.filter(id => videoDb.includes(id)).length;
const videoRulesReady = videoRules.includes('PENDING_REVIEW')
  && videoRules.includes('상업적 이해관계')
  && videoRules.includes('제품 효능');
const monitorReady = videoMonitor.includes('매일 09:00 KST')
  && videoMonitor.includes('PENDING_REVIEW');
const reviewLogReady = videoLog.includes('15분 일일 검토 순서')
  && videoLog.includes('PUBLISH_GENERAL')
  && videoLog.includes('LIMITED_USE');
const publishReady = videoRows.filter(line => line.includes('| PUBLISH_GENERAL |')).length;
const videoReady = publishReady;
const scopeReady = scope.includes('제품 판매가 아닌 일반 GABA 교육 자료')
  && scope.includes('셀핀다 제품명·SKU·가격·구성·섭취량·구매 링크')
  && scope.includes('일반 GABA 연구');
const strict = process.argv.includes('--strict');
const ready = assignedRoles.length === coreRoles.length
  && firstMeetingFilled
  && sourceHumanReviewed > 0
  && registeredShorts === shortIds.length
  && videoRulesReady
  && monitorReady
  && reviewLogReady
  && scopeReady;

console.log('GABA education TF readiness report');
console.log('- 제공 쇼츠 DB 등록: ' + registeredShorts + '/' + shortIds.length);
console.log('- 공개 승인 영상: ' + publishReady + '/' + videoRows.length);
console.log('- 영상 감리 규칙: ' + (videoRulesReady ? '확인' : 'HOLD'));
console.log('- 일일 모니터 파이프라인: ' + (monitorReady ? '준비' : 'HOLD'));
console.log('- 일일 팀 검토 로그: ' + (reviewLogReady ? '준비' : 'HOLD'));
console.log(`- 핵심 인간 역할 배정: ${assignedRoles.length}/${coreRoles.length}`);
console.log('- AI-OPS 실행 권한: 활성');
console.log(`- 첫 회의 입력: ${firstMeetingFilled ? '입력됨' : '필요'}`);
console.log(`- 과학 출처 AI 사전 확인: ${sourcePrechecked}/${sourceRows.length}`);
console.log(`- 과학 출처 사람 검토: ${sourceHumanReviewed}/${sourceRows.length}`);
console.log('- 공개 승인 영상 점검: ' + videoReady + '/' + videoRows.length);
console.log(`- 제품·후기·판매 제외 범위: ${scopeReady ? '확인' : 'HOLD'}`);
console.log(`- 현재 판정: ${ready ? '1차 제작 착수 가능' : '킥오프·출처·영상 입력 필요'}`);

if (!assignedRoles.length || assignedRoles.length < coreRoles.length) console.log('- 다음 조치: docs/GABA_EDUCATION_KICKOFF.md에 핵심 역할·백업을 입력');
if (!firstMeetingFilled) console.log('- 다음 조치: 첫 회의 날짜·시간과 첫 검토 자료를 입력');
if (!sourceHumanReviewed) console.log('- 다음 조치: AI_PRECHECKED 출처를 지정된 과학·의료 담당자가 HUMAN_REVIEWED로 확인');
if (!videoReady) console.log('- 다음 조치: 영상별 원문·자막·권리·과학 감리를 완료하고 승인 판정을 기록');
if (registeredShorts < shortIds.length) console.log('- 다음 조치: 제공 쇼츠 8건을 docs/GABA_VIDEO_DB.md에 등록');
if (!videoRulesReady) console.log('- 다음 조치: 영상별 권위·근거·상업성·권리 감리 규칙을 확인');
if (!monitorReady) console.log('- 다음 조치: 일일 숏츠 수집 파이프라인을 확인');
if (!reviewLogReady) console.log('- 다음 조치: 일일 검토·토론 로그와 공개 판정 문장을 확인');

if (strict && !ready) {
  console.error('GABA education TF strict readiness failed.');
  process.exit(1);
}
