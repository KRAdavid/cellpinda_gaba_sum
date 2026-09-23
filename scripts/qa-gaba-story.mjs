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
    ['hook everyday interest', '쉽게 흥분하고 실수가 이어지는 날, 알아둘 성분이 있습니다.'],
    ['recovered everyday example', '충분히 쉬고 난 날에는 작은 일에도 한 번 더 생각할 여유가 생깁니다.'],
    ['overload everyday example', '반대로 뇌가 과부하인 날에는 몸이 쉬어도 생각이 계속 다음 일로 달려갑니다.'],
    ['sleep recovery frame', '잠을 자는 동안 뇌와 몸은 다음 날을 준비합니다.'],
    ['GABA full name before function', 'GABA는 감마아미노부티르산을 줄여 부르는 이름입니다.'],
    ['GABA general term boundary', '신경전달물질을 가리키는 일반 용어입니다.'],
    ['GABA inhibitory function', '억제성 신경전달물질이라고 부릅니다.'],
    ['GABA brake metaphor boundary', '“뇌의 브레이크”는 이해를 위한 비유'],
    ['general GABA research label', '일반 GABA 연구는 스트레스와 수면에 관한 질문을 살펴봅니다.'],
    ['14 human trials', '14개 위약대조 인체시험'],
    ['limited stress evidence', '스트레스 관련 근거는 제한적'],
    ['very limited sleep evidence', '수면 관련 근거는 매우 제한적'],
    ['research conditions', '연구 대상·섭취량·기간·비교 조건'],
    ['research product boundary', '일반 GABA 연구라는 표기를 고정하고 개인 결과로 확장하지 않습니다.'],
    ['finish educational boundary', '구매나 효능 약속으로 연결하지 않습니다.'],
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

console.log('GABA story QA passed: 8 ordered one-message scenes, GABA definition/function, research limits, and product boundary found.');
