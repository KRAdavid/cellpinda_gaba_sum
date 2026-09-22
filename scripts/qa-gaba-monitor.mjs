import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const monitor = read('scripts/monitor-gaba-shorts.mjs');
const workflow = read('.github/workflows/monitor-gaba-shorts.yml');
const report = read('docs/GABA_VIDEO_DAILY_REPORT.md');
const inbox = read('docs/GABA_VIDEO_INBOX.md');
const snapshot = read('src/gabaMonitorSnapshot.ts');
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
assert('English GABA keyword uses a word boundary', monitor.includes('\\bGABA\\b'));
assert('known DB and register files are used for de-duplication', monitor.includes("path.join(root, 'src', 'gabaVideos.ts')") && monitor.includes('GABA_VIDEO_DB.md') && monitor.includes('watch\\?v='));
assert('daily report is archived by date', monitor.includes('reportArchiveDir') && monitor.includes('GABA_VIDEO_DAILY_REPORT_${checkedDate}.md'));
assert('workflow runs daily and includes report archive changes', workflow.includes("cron: '0 0 * * *'") && workflow.includes('docs/gaba-video-daily'));
assert('daily report keeps candidates in review status', report.includes('자동 공개: 0건') && report.includes('PENDING_REVIEW'));
assert('triage classifier is present and explicitly non-approval', monitor.includes('screenCandidate') && monitor.includes('triagePath') && monitor.includes('제목 기반 주의 신호'));
assert('workflow stages triage board changes', workflow.includes('docs/GABA_VIDEO_TRIAGE.md'));
assert('monitor generates a presenter snapshot', monitor.includes('snapshotPath') && monitor.includes('monitorSnapshotTypeScript') && monitor.includes("path.join(root, 'src', 'gabaMonitorSnapshot.ts')"));
assert('workflow stages presenter snapshot changes', workflow.includes('src/gabaMonitorSnapshot.ts'));
assert('presenter snapshot keeps publication gated', snapshot.includes('GABA_MONITOR_SNAPSHOT') && snapshot.includes('pendingReview') && snapshot.includes('autoPublish') && snapshot.includes('"autoPublish": 0'));
assert('triage board exists and keeps human review boundary', triage.includes('GABA 숏츠 감리 우선순위 보드') && triage.includes('공개 승인을 판정하지 않는다') && triage.includes('PENDING_REVIEW'));
assert('inbox has no duplicate video IDs', new Set(inboxIds).size === inboxIds.length);

console.log(`GABA monitor QA passed: ${sourceCount} channels, ${inboxIds.length} unique inbox video IDs.`);
