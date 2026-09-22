import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const monitor = read('scripts/monitor-gaba-shorts.mjs');
const workflow = read('.github/workflows/monitor-gaba-shorts.yml');
const report = read('docs/GABA_VIDEO_DAILY_REPORT.md');
const inbox = read('docs/GABA_VIDEO_INBOX.md');

const assert = (label, condition) => {
  if (!condition) throw new Error(`GABA monitor QA failed: ${label}`);
  console.log(`PASS ${label}`);
};

const sourceCount = [...monitor.matchAll(/\{name: '/g)].length;
const inboxIds = [...inbox.matchAll(/(?:shorts\/|watch\?v=)([\w-]{11})/g)].map(match => match[1]);

assert('eight registered source channels are present', sourceCount === 8);
assert('RSS feed collection is present', monitor.includes('feeds/videos.xml?channel_id='));
assert('Shorts page fallback collection is present', monitor.includes('/shorts') && monitor.includes('parseShortsPage'));
assert('known DB and register files are used for de-duplication', monitor.includes("path.join(root, 'src', 'gabaVideos.ts')") && monitor.includes('GABA_VIDEO_DB.md') && monitor.includes('watch\\?v='));
assert('daily report is archived by date', monitor.includes('reportArchiveDir') && monitor.includes('GABA_VIDEO_DAILY_REPORT_${checkedDate}.md'));
assert('workflow runs daily and includes report archive changes', workflow.includes("cron: '0 0 * * *'") && workflow.includes('docs/gaba-video-daily'));
assert('daily report keeps candidates in review status', report.includes('자동 공개: 0건') && report.includes('PENDING_REVIEW'));
assert('inbox has no duplicate video IDs', new Set(inboxIds).size === inboxIds.length);

console.log(`GABA monitor QA passed: ${sourceCount} channels, ${inboxIds.length} unique inbox video IDs.`);
