import {spawnSync} from 'node:child_process';

const viewports = [
  {width: 320, height: 900},
  {width: 390, height: 844},
  {width: 1440, height: 900},
];

for (const viewport of viewports) {
  console.log(`\nInteraction QA: ${viewport.width}x${viewport.height}`);
  const result = spawnSync(process.execPath, ['scripts/qa-interaction.mjs'], {
    env: {...process.env, QA_WIDTH: String(viewport.width), QA_HEIGHT: String(viewport.height)},
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\nInteraction QA matrix passed.');
