export type TfWorkstream = {
  id: string;
  title: string;
  owner: string;
  action: string;
  exit: string;
};

export type TfRole = {
  id: string;
  title: string;
  responsibility: string;
};

export const TF_ROLES: TfRole[] = [
  {id: 'PM', title: '편집 PM·회의 진행', responsibility: '범위·우선순위·회의 결정·공개 기준'},
  {id: 'SCIENCE', title: 'GABA 과학 근거 리드', responsibility: '정의·기전·연구 설계·근거 수준'},
  {id: 'MEDICAL', title: '의학·건강정보 검토자', responsibility: '진단·치료·안전성 오해 방지'},
  {id: 'VIDEO', title: '권위 영상·출처 큐레이터', responsibility: '원문·발언 구간·자막·화자'},
  {id: 'RIGHTS', title: '영상·이미지 권리 담당', responsibility: '링크·임베드·인용·재사용 범위'},
  {id: 'UX', title: '소비자 UX·카피 리드', responsibility: '일상 용어·이해도·접근성'},
  {id: 'QA', title: '프론트엔드·릴리스 QA', responsibility: '모바일·패널·공개 배포 검증'},
];

export const TF_WORKSTREAMS: TfWorkstream[] = [
  {
    id: 'PEOPLE',
    title: '사람 승인 주체',
    owner: 'PM · SCIENCE · MEDICAL',
    action: '핵심 역할과 백업을 입력하고 첫 회의 시간을 확정합니다.',
    exit: '7개 핵심 역할의 주 담당자·백업 입력',
  },
  {
    id: 'SOURCES',
    title: '과학 출처 검토',
    owner: 'SCIENCE · MEDICAL',
    action: 'AI 사전 확인 출처를 원문·문장 범위·한계 기준으로 재검토합니다.',
    exit: 'SRC-01~05 중 사람 검토 상태 기록',
  },
  {
    id: 'VIDEOS',
    title: '영상 감리·공개 판정',
    owner: 'VIDEO · RIGHTS',
    action: '후보마다 원문·자막·화자·권리·일반 GABA 설명 범위를 확인합니다.',
    exit: 'PUBLISH_GENERAL·LIMITED_USE·HOLD·EXCLUDE 중 사람 판정',
  },
  {
    id: 'FIELD',
    title: '사업자 사용성 검증',
    owner: 'UX · QA · PM',
    action: 'A/B/C 설명 세션에서 다음 행동과 감리 보드 탐색 시간을 기록합니다.',
    exit: '실제 세션·실기기 증거 제출',
  },
];

export const TF_MEETING_STEPS = [
  '범위 고정: 일반 GABA 교육, 제품 정보 제외',
  '소비자 학습 목표와 일상 도입 문장 확인',
  'GABA 정의·기능 출처의 사람 검토 범위 결정',
  '수면·스트레스 연구의 허용 문장과 보류 문장 결정',
  '영상 후보의 원문·권리·공개 판정 담당 지정',
  '다음 회의일·담당자·종료 조건 기록',
];
