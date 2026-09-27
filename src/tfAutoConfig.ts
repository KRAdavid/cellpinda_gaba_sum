export type TfAutoWorkstream = {
  id: string;
  title: string;
  action: string;
  output: string;
  gate: string;
};

export type TfHumanGate = {
  id: string;
  title: string;
  requiredInput: string;
  state: 'NEEDS_INPUT';
};

/**
 * AI-OPS가 즉시 실행할 수 있는 일반 GABA 교육 TF의 기본 구성입니다.
 * 실명 배정·출처 사람 검토·영상 권리/공개 판정은 이 구성으로 자동 승인하지 않습니다.
 */
export const TF_AUTOCONFIG = {
  version: 'TF-AUTOCONFIG-v1',
  mode: 'AI-OPS_WITH_HUMAN_GATES',
  status: 'ACTIVE',
  statusLabel: 'AI-OPS 자동 구성 활성 · 사람 게이트 유지',
  owner: 'Codex AI-OPS',
  scope: '제품과 분리된 일반 GABA 교육 공개',
  excluded: ['제품 정보', '후기', '판매', '개별 섭취 지시', '과학·의학·권리 최종 승인'],
  aiWorkstreams: [
    {
      id: 'AI-01',
      title: 'TF 기준선·회의 준비',
      action: '역할표, 킥오프 입력, 결정 대장, 일일 상태를 최신화합니다.',
      output: '회의용 상태 요약과 다음 액션',
      gate: '실명 담당자·기한이 연결되기 전에는 초안으로 유지',
    },
    {
      id: 'AI-02',
      title: '소비자 스토리·카피',
      action: '1페이지 1메시지 흐름과 일상 용어를 정리하고 제품 표현을 제거합니다.',
      output: '공개 8장 흐름과 사업자 설명 초안',
      gate: '과학·의학 검토 전 확정 문장으로 승격하지 않음',
    },
    {
      id: 'AI-03',
      title: '연구·제품 경계 점검',
      action: '일반 GABA 연구와 제품 효능을 분리하고 연구 조건·공개 문장 범위를 표시합니다.',
      output: '출처별 검토 큐와 연구 패널 경계',
      gate: 'HUMAN_REVIEWED 전에는 사람 검토 필요 상태 유지',
    },
    {
      id: 'AI-04',
      title: '영상 감리·공개 방지',
      action: '제공 Shorts와 매일 수집 후보를 요약·분류하고 원문·자막·화자·권리 확인 큐로 보냅니다.',
      output: '영상 DB, 일일 감리 큐, 후보별 감리 초안',
      gate: 'PUBLISH_GENERAL·권위·권리는 자동 확정하지 않음',
    },
    {
      id: 'AI-05',
      title: 'UX·QA·릴리스 증거',
      action: '모바일 흐름, 인페이지 패널, 빌드, 문서, 공개 범위를 반복 점검합니다.',
      output: 'QA 결과와 배포·변경 이력',
      gate: '현장 세션·실기기 최종 PASS는 별도 입력 필요',
    },
  ] satisfies TfAutoWorkstream[],
  humanGates: [
    {id: 'PM', title: '편집 PM·회의 진행', requiredInput: '주 담당자·백업·첫 회의 일시', state: 'NEEDS_INPUT'},
    {id: 'SCIENCE', title: 'GABA 과학 근거 리드', requiredInput: 'SRC-01~05 원문·문장 범위 검토', state: 'NEEDS_INPUT'},
    {id: 'MEDICAL', title: '의학·건강정보 검토자', requiredInput: '오해·진단·치료 표현 검토', state: 'NEEDS_INPUT'},
    {id: 'VIDEO', title: '권위 영상·출처 큐레이터', requiredInput: '영상 원문·자막·화자 검토', state: 'NEEDS_INPUT'},
    {id: 'RIGHTS', title: '영상·이미지 권리 담당', requiredInput: '임베드·링크·인용 범위 확인', state: 'NEEDS_INPUT'},
    {id: 'UX', title: '소비자 UX·카피 리드', requiredInput: '일상 용어·이해도·접근성 확인', state: 'NEEDS_INPUT'},
    {id: 'QA', title: '프론트엔드·릴리스 QA', requiredInput: '실기기·현장·공개 배포 검증', state: 'NEEDS_INPUT'},
  ] satisfies TfHumanGate[],
  reviewQueue: {
    sources: ['SRC-01', 'SRC-02', 'SRC-03', 'SRC-04', 'SRC-05'],
    providedVideos: ['AUTH-01', 'AUTH-02', 'SHORT-01', 'SHORT-02', 'SHORT-03', 'SHORT-04', 'SHORT-05', 'SHORT-06', 'SHORT-07', 'SHORT-08'],
    dailyMonitor: '매일 09:17 KST · 지연 시 09:37 KST 재확인 · PENDING_REVIEW 유지 · 자동 공개 0건',
  },
  nextActions: [
    '사람 역할 7개와 백업을 입력하고 첫 회의 일시를 확정',
    'SRC-01~05 중 첫 출처를 SCIENCE·MEDICAL 담당자가 원문 검토',
    '오늘 감리 큐 상위 후보의 원문·자막·화자·권리·주장 범위 확인',
  ],
  boundary: 'AI-OPS 자동 구성은 초안·정리·QA·큐잉을 시작하지만 실명 배정, 과학·의학·권리 판단, 영상 공개 승인, 현장 결과를 대신하지 않습니다.',
} as const;
