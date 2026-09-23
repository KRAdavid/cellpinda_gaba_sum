import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const snapshotPath = path.join(root, 'src', 'gabaMonitorSnapshot.ts');
const acceptancePath = path.join(root, 'docs', 'GOAL_ACCEPTANCE_MATRIX.md');
const handoffPath = path.join(root, 'docs', 'RELEASE_HANDOFF.md');
const monitorGuidePath = path.join(root, 'docs', 'GABA_VIDEO_DAILY_MONITOR.md');

const snapshotSource = fs.readFileSync(snapshotPath, 'utf8');
const snapshotMatch = snapshotSource.match(/export const GABA_MONITOR_SNAPSHOT = (\{[\s\S]*\}) as const;/);
if (!snapshotMatch) throw new Error('Could not parse GABA monitor snapshot.');
const snapshot = JSON.parse(snapshotMatch[1]);

const repository = process.env.GITHUB_REPOSITORY ?? 'KRAdavid/cellpinda_gaba_sum';
const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
const runId = process.env.GITHUB_RUN_ID?.trim();
const eventName = process.env.GITHUB_EVENT_NAME?.trim() || 'local';
const runUrl = runId ? `${serverUrl}/${repository}/actions/runs/${runId}` : '';
const runEvidence = runUrl ? `[${runId}](${runUrl})` : '현재 스냅샷';
const executionLabel = snapshot.runOrigin === 'GitHub Actions 예약 실행' ? '예약 실행 확인' : '예약 실행 증거 대기';

const replaceBlock = (content, startMarker, endMarker, body) => {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  if (start < 0 || end < 0 || end < start) throw new Error(`Missing evidence markers: ${startMarker}`);
  return `${content.slice(0, start)}${startMarker}\n${body}\n${content.slice(end)}`;
};

const monitorStatus = `| 매일 유사 콘텐츠 모니터 | 8개 채널·8개 검색어·RSS/Shorts fallback·날짜별 리포트·리뷰 세션·영상별 메타데이터·자막 감사·권위 후보 큐·제품/브랜드 격리 큐. ${snapshot.checkedAtKst} ${snapshot.runOrigin} ${runEvidence}. 오늘 누적 신규 후보 ${snapshot.newCandidates}건·이번 실행 ${snapshot.newCandidatesThisRun}건·제품·브랜드 격리 ${snapshot.productBrandQuarantine}건·자동 공개 ${snapshot.autoPublish}건 | 기술 PASS / 운영 HOLD | 실제 담당자가 매일 감리하고 승인 기록을 남김 |`;
const scheduleStatus = `- 예약 감리 실행 증거: ${snapshot.checkedAtKst} · ${snapshot.runOrigin} · ${executionLabel}. 다음 예약 ${snapshot.scheduleKst}. 예약 실행·사람 감리·공개 승인을 자동으로 대체하지 않으며, 예약 증거가 없으면 일일 자동 운영 HOLD를 유지한다.`;
const releaseStatus = `- 최신 감리: ${snapshot.checkedAtKst} · ${snapshot.runOrigin} · 실행 ${runEvidence} · 오늘 누적 신규 후보 ${snapshot.newCandidates}건 · 이번 실행 ${snapshot.newCandidatesThisRun}건 · 제품·브랜드 격리 ${snapshot.productBrandQuarantine}건 · 자동 공개 ${snapshot.autoPublish}건`;
const monitorGuideStatus = `최신 운영 확인: ${snapshot.checkedAtKst} · ${snapshot.runOrigin} · ${executionLabel} · 다음 예약 ${snapshot.scheduleKst}. 오늘 누적 신규 후보 ${snapshot.newCandidates}건·이번 실행 ${snapshot.newCandidatesThisRun}건·검토 대기 ${snapshot.pendingReview}건·자동 공개 ${snapshot.autoPublish}건. 예약 실행·사람 감리·공개 승인 전에는 운영 HOLD를 유지한다.`;

let acceptance = fs.readFileSync(acceptancePath, 'utf8');
acceptance = replaceBlock(acceptance, '<!-- GABA_MONITOR_STATUS:START -->', '<!-- GABA_MONITOR_STATUS:END -->', monitorStatus);
acceptance = replaceBlock(acceptance, '<!-- GABA_SCHEDULE_STATUS:START -->', '<!-- GABA_SCHEDULE_STATUS:END -->', scheduleStatus);
fs.writeFileSync(acceptancePath, acceptance);

let handoff = fs.readFileSync(handoffPath, 'utf8');
handoff = replaceBlock(handoff, '<!-- GABA_RELEASE_MONITOR_STATUS:START -->', '<!-- GABA_RELEASE_MONITOR_STATUS:END -->', releaseStatus);
fs.writeFileSync(handoffPath, handoff);

let monitorGuide = fs.readFileSync(monitorGuidePath, 'utf8');
monitorGuide = replaceBlock(monitorGuide, '<!-- GABA_SCHEDULE_OPERATIONS_STATUS:START -->', '<!-- GABA_SCHEDULE_OPERATIONS_STATUS:END -->', monitorGuideStatus);
fs.writeFileSync(monitorGuidePath, monitorGuide);

console.log(`Synced GABA release evidence from ${snapshot.checkedAtKst} (${eventName}).`);
