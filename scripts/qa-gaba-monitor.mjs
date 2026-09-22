import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const monitor = read('scripts/monitor-gaba-shorts.mjs');
const workflow = read('.github/workflows/monitor-gaba-shorts.yml');
const deployWorkflow = read('.github/workflows/deploy-pages.yml');
const report = read('docs/GABA_VIDEO_DAILY_REPORT.md');
const inbox = read('docs/GABA_VIDEO_INBOX.md');
const snapshot = read('src/gabaMonitorSnapshot.ts');
const app = read('src/App.tsx');
const triagePath = path.join(root, 'docs', 'GABA_VIDEO_TRIAGE.md');
const triage = fs.existsSync(triagePath) ? fs.readFileSync(triagePath, 'utf8') : '';

const assert = (label, condition) => {
  if (!condition) throw new Error(`GABA monitor QA failed: ${label}`);
  console.log(`PASS ${label}`);
};

const sourceSection = monitor.match(/const sources = \[([\s\S]*?)\];/)?.[1] ?? '';
const sourceCount = [...sourceSection.matchAll(/\{name: '/g)].length;
const inboxIds = [...inbox.matchAll(/(?:shorts\/|watch\?v=)([\w-]{11})/g)].map(match => match[1]);

assert('eight registered source channels are present', sourceCount === 8);
assert('RSS feed collection is present', monitor.includes('feeds/videos.xml?channel_id='));
assert('Shorts page fallback collection is present', monitor.includes('/shorts') && monitor.includes('parseShortsPage'));
assert('similar-content keyword discovery is present', monitor.includes('discoveryQueries') && monitor.includes('search_query'));
assert('authority-focused keyword discovery is present', monitor.includes('의사 GABA 신경전달물질 Shorts') && monitor.includes('과학자 GABA 신경전달물질 Shorts') && monitor.includes('전문가 자격 확인 신호') && monitor.includes('권위 후보 검색 발견'));
assert('English GABA keyword uses a word boundary', monitor.includes('\\bGABA\\b'));
assert('known DB and register files are used for de-duplication', monitor.includes("path.join(root, 'src', 'gabaVideos.ts')") && monitor.includes('GABA_VIDEO_DB.md') && monitor.includes('watch\\?v='));
assert('daily report is archived by date', monitor.includes('reportArchiveDir') && monitor.includes('GABA_VIDEO_DAILY_REPORT_${checkedDate}.md'));
assert('daily monitor date uses Korea time', monitor.includes("timeZone: 'Asia/Seoul'") && monitor.includes('formatToParts') && monitor.includes("koreaDatePart('year')"));
assert('workflow runs daily and includes report archive changes', workflow.includes("cron: '0 0 * * *'") && workflow.includes('docs/gaba-video-daily'));
assert('daily report keeps candidates in review status', report.includes('자동 공개: 0건') && report.includes('PENDING_REVIEW'));
assert('triage classifier is present and explicitly non-approval', monitor.includes('screenCandidate') && monitor.includes('triagePath') && monitor.includes('제목 기반 주의 신호'));
assert('triage classifier covers English effect and supplement signals', monitor.includes('reduce|relief') && monitor.includes('supplement') && monitor.includes('SCIENCE/MEDICAL + RIGHTS'));
assert('triage classifier isolates product and brand signals', monitor.includes('제품·브랜드 신호') && monitor.includes('셀핀다|cellpinda|스마트스토어|smartstore'));
assert('workflow stages triage board changes', workflow.includes('docs/GABA_VIDEO_TRIAGE.md'));
assert('monitor generates a presenter snapshot', monitor.includes('snapshotPath') && monitor.includes('monitorSnapshotTypeScript') && monitor.includes("path.join(root, 'src', 'gabaMonitorSnapshot.ts')"));
assert('workflow stages presenter snapshot changes', workflow.includes('src/gabaMonitorSnapshot.ts'));
assert('successful monitor run triggers Pages publication', deployWorkflow.includes('workflow_run:') && deployWorkflow.includes('Monitor GABA Shorts candidates') && deployWorkflow.includes("github.event.workflow_run.conclusion == 'success'"));
assert('presenter snapshot keeps publication gated', snapshot.includes('GABA_MONITOR_SNAPSHOT') && snapshot.includes('pendingReview') && snapshot.includes('autoPublish') && snapshot.includes('"autoPublish": 0'));
assert('monitor snapshot keeps recent history', monitor.includes('readPreviousMonitorHistory') && monitor.includes('slice(-14)') && snapshot.includes('"history"') && snapshot.includes('"captionBodiesAvailable"'));
assert('presenter exposes recent monitor history', app.includes('monitor-snapshot__history') && app.includes('최근 감리 추이') && app.includes('pendingDelta'));
assert('presenter snapshot includes human decision gates', snapshot.includes('humanRoleAssigned') && snapshot.includes('humanSourceReviewed') && snapshot.includes('registeredVideoApproved') && snapshot.includes('domesticPublicApproved') && snapshot.includes('domesticVideoTotal') && snapshot.includes('firstMeetingReady'));
assert('monitor checks registered video source links', monitor.includes('checkRegisteredVideoLinks') && monitor.includes('registeredVideoLinksChecked') && monitor.includes('registeredVideoLinkWarnings'));
assert('daily report exposes registered link health', report.includes('등록 영상 원문 링크') && report.includes('링크 경고'));
assert('monitor checks authority and research evidence links separately', monitor.includes('checkRegisteredEvidenceLinks') && monitor.includes('registeredEvidenceLinksChecked') && monitor.includes('registeredEvidenceLinkWarnings'));
assert('daily report separates evidence-link reachability from approval', report.includes('권위·연구 출처 링크') && report.includes('출처 링크 경고') && report.includes('인물 자격·영상 화자 일치·연구 내용·과학적 타당성·권리·공개 승인을 의미하지 않는다'));
assert('monitor checks registered YouTube metadata separately', monitor.includes('checkRegisteredYouTubeMetadata') && monitor.includes('registeredVideoMetadataChecked') && monitor.includes('registeredVideoMetadataWarnings'));
assert('daily report separates metadata health from content approval', report.includes('등록 YouTube 메타데이터') && report.includes('메타데이터 경고') && report.includes('영상 내용·화자 권위·과학적 타당성·권리를 승인하지 않는다'));
assert('monitor checks caption track availability without approving transcripts', monitor.includes('checkRegisteredYouTubeCaptionTracks') && monitor.includes('registeredVideoCaptionTracksAvailable') && monitor.includes('자막 본문 확보') && monitor.includes('사람 검토 전'));
assert('daily report exposes caption track boundary', report.includes('등록 YouTube 자막 트랙') && report.includes('자막 경고') && report.includes('자막 트랙 발견은 자막 본문 확보'));
assert('monitor checks caption bodies separately from track discovery', monitor.includes('checkRegisteredYouTubeCaptionBodies') && monitor.includes('registeredVideoCaptionBodiesAvailable') && monitor.includes('자막 본문 확인 HTTP'));
assert('daily report exposes caption body boundary', report.includes('등록 YouTube 자막 본문') && report.includes('본문 경고') && report.includes('자막 본문 확인은 텍스트 응답의 존재만 점검'));
assert('daily review UX matches the one-video showcase', monitor.includes('현재 영상 1건·compact 인덱스·상세 패널·다음 영상 이동') && report.includes('현재 영상 1건·compact 인덱스·상세 패널·다음 영상 이동') && !report.includes('소비자 카드에서 한 메시지로 전달 가능한지'));
assert('monitor archives a per-video caption audit', monitor.includes('captionAuditMarkdown') && monitor.includes('GABA_VIDEO_CAPTION_AUDIT_${checkedDate}.md') && snapshot.includes('captionAuditUrl') && fs.existsSync(path.join(root, 'docs', 'gaba-video-daily', 'GABA_VIDEO_CAPTION_AUDIT_2026-09-22.md')));
assert('caption audit keeps access separate from human content review', read('docs/gaba-video-daily/GABA_VIDEO_CAPTION_AUDIT_2026-09-22.md').includes('영상 내용·화자·과학적 타당성·권리·공개 승인을 의미하지 않는다') && read('docs/gaba-video-daily/GABA_VIDEO_CAPTION_AUDIT_2026-09-22.md').includes('사람 확인 다음 행동'));
assert('presenter queue carries reviewer and next action', monitor.includes('reviewAssignment') && snapshot.includes('pendingQueue') && snapshot.includes('"reviewer"') && snapshot.includes('"nextAction"'));
assert('authority queue separates discovery basis from authority approval', monitor.includes('authorityBasis') && monitor.includes('TITLE_DESCRIPTION_SIGNAL') && monitor.includes('KEYWORD_DISCOVERY') && snapshot.includes('"authorityBasis"') && app.includes('AUTHORITY_BASIS_LABELS') && app.includes('권위 후보 확인 전'));
assert('daily review session is generated for human discussion', monitor.includes('reviewSessionMarkdown') && monitor.includes('GABA_VIDEO_REVIEW_SESSION_${checkedDate}.md') && snapshot.includes('reviewSessionUrl'));
assert('triage board exists and keeps human review boundary', triage.includes('GABA 숏츠 감리 우선순위 보드') && triage.includes('공개 승인을 판정하지 않는다') && triage.includes('PENDING_REVIEW'));
assert('triage board separates authority signal basis', monitor.includes('authoritySignalLabel') && monitor.includes('권위 신호 구분') && triage.includes('전문가 표현 감지 · 자격 미확인') && triage.includes('권위 검색 발견 · 자격 미확인'));
assert('inbox has no duplicate video IDs', new Set(inboxIds).size === inboxIds.length);

console.log(`GABA monitor QA passed: ${sourceCount} channels, ${inboxIds.length} unique inbox video IDs.`);
