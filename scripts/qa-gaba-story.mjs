import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
const failures = [];

const start = source.indexOf('function makeSlides(): Slide[] {');
const end = source.indexOf('\n}\n\n', start);
if (start < 0 || end < 0) {
  failures.push('makeSlides story block is missing or cannot be read');
} else {
  const story = source.slice(start, end);
  const sceneChunks = story.split(/\n    \{\n      id: '/).slice(1);
  const sceneIds = sceneChunks.map(chunk => chunk.split("'")[0]);
  const expectedIds = ['hook', 'recovered', 'overload', 'sleep', 'gaba', 'function', 'research', 'finish'];

  if (sceneIds.length !== expectedIds.length) {
    failures.push(`expected ${expectedIds.length} one-message scenes, found ${sceneIds.length}`);
  }
  if (sceneIds.join('|') !== expectedIds.join('|')) {
    failures.push(`scene order changed: ${sceneIds.join(' → ')}`);
  }

  for (const [index, chunk] of sceneChunks.entries()) {
    const id = sceneIds[index] ?? `scene-${index + 1}`;
    for (const field of ['title:', 'body:', 'presenterBoundary:']) {
      if (!chunk.includes(field)) failures.push(`${id} is missing one-message field ${field}`);
    }
  }

  const requirements = [
    ['hook everyday interest', '집중이 흐트러지고, 말이 먼저 나오는 날이 있습니다.'],
    ['recovered everyday example', '잠을 충분히 잔 날에는 생각과 행동에 여유가 생깁니다.'],
    ['overload everyday example', '몸은 쉬고 있는데 머리는 계속 바쁠 때가 있습니다.'],
    ['sleep recovery frame', '잠은 뇌가 하루를 정리하고 다시 준비하는 시간입니다.'],
    ['GABA full name before function', 'GABA는 감마아미노부티르산을 줄여 부르는 말입니다.'],
    ['GABA general term boundary', '신경전달물질 중 하나입니다.'],
    ['GABA inhibitory function', '억제성 신호를 맡아'],
    ['GABA function direction', '신경세포의 활동을 낮추는 방향으로 신호를 전달합니다.'],
    ['general GABA research label', '일부 인체 연구에서 스트레스·수면 지표가 좋아지는 변화가 확인됐습니다.'],
    ['14 human trials', '14개 위약대조 인체시험'],
    ['positive stress and sleep signal', '스트레스·수면 관련 지표가 좋아지는 변화가 확인됐습니다'],
    ['research conditions', '참여자·섭취량·기간·비교 방식'],
    ['research product boundary', '우리가 일상에서 느끼는 상태와 GABA 섭취 연구는 각각 따로 살펴봐야 합니다.'],
    ['finish educational summary', '여기까지가 일반적인 GABA를 이해하는 핵심입니다.'],
  ];
  for (const [label, value] of requirements) {
    if (!story.includes(value)) failures.push(`story missing ${label}: ${value}`);
  }

  const forbiddenProductCopy = ['셀핀다', 'smartstore.naver.com', '제품을 추천', '구매 링크'];
  for (const value of forbiddenProductCopy) {
    if (story.includes(value)) failures.push(`product/commercial copy leaked into consumer story: ${value}`);
  }
}

if (failures.length) {
  console.error('GABA story QA failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('GABA story QA passed: 8 ordered one-message scenes, GABA definition/function, positive research signal, and product boundary found.');
