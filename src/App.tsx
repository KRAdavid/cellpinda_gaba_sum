import {useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent as ReactTouchEvent, type WheelEvent as ReactWheelEvent} from 'react';
import {DOMESTIC_PUBLIC_GABA_VIDEOS, SHARED_GABA_VIDEOS} from './gabaPublicVideos';
import type {GabaVideoRecord} from './gabaVideos';

type PanelKey = 'research' | 'video' | 'ops';
type SlideLink = {href: string; label: string; panel: PanelKey};

type Slide = {
  id: string;
  label: string;
  title: string;
  body: string;
  tone: string;
  visual?: string;
  note?: string;
  presenterPrompt: string;
  presenterBoundary: string;
  link?: SlideLink;
  links?: SlideLink[];
};

const STORY_VISUALS = {
  overload: `${import.meta.env.BASE_URL}images/gaba-overload.png`,
  neural: `${import.meta.env.BASE_URL}images/gaba-neural-signal.png`,
} as const;

const MONITOR_WORKFLOW_URL = 'https://github.com/KRAdavid/cellpinda_gaba_sum/actions/workflows/monitor-gaba-shorts.yml';

type VideoFilter = 'ALL' | 'REVIEW' | 'PROFILE' | 'INCOMPLETE' | GabaVideoRecord['status'];
type TfAssignment = Record<string, {lead: string; backup: string}>;
type TfDiscussionDecision = 'UNDECIDED' | 'CONTINUE' | 'HOLD' | 'DECIDED';
type TfDiscussionDraft = {owner: string; due: string; decision: TfDiscussionDecision; notes: string; updatedAt: string};
type TfDiscussionDrafts = Record<string, TfDiscussionDraft>;
type FieldSessionScenarioId = 'A' | 'B' | 'C';
type FieldSessionClarity = '' | '1' | '2' | '3' | '4' | '5';
type FieldSessionExit = 'UNRECORDED' | 'NONE' | 'YES';
type FieldSessionDraft = {
  facilitator: string;
  observer: string;
  device: string;
  clarity: FieldSessionClarity;
  firstActionSeconds: string;
  externalExit: FieldSessionExit;
  misunderstanding: string;
  nextAction: string;
  owner: string;
  due: string;
  updatedAt: string;
};
type FieldSessionDrafts = Record<FieldSessionScenarioId, FieldSessionDraft>;
type VideoReviewDecision = 'UNDECIDED' | 'HOLD' | 'LIMITED_USE' | 'PUBLISH_GENERAL' | 'EXCLUDE';
type VideoReviewDraft = {
  reviewer: string;
  role: string;
  decision: VideoReviewDecision;
  sourceChecked: boolean;
  transcriptChecked: boolean;
  speakerChecked: boolean;
  rightsChecked: boolean;
  claimScopeChecked: boolean;
  timestamps: string;
  transcriptExcerpt: string;
  notes: string;
  updatedAt: string;
};
type VideoReviewDrafts = Record<string, VideoReviewDraft>;
type MonitorSnapshot = typeof import('./gabaMonitorSnapshot')['GABA_MONITOR_SNAPSHOT'];
type MonitorCandidate = MonitorSnapshot['pendingQueue'][number] | MonitorSnapshot['authorityQueue'][number] | MonitorSnapshot['productBrandQueue'][number];
type PresenterData = {
  activeVideos: GabaVideoRecord[];
  videoDb: GabaVideoRecord[];
  approvedVideos: GabaVideoRecord[];
  monitor: MonitorSnapshot;
  tfRoles: typeof import('./tfBoard')['TF_ROLES'];
  tfDiscussionItems: typeof import('./tfBoard')['TF_DISCUSSION_ITEMS'];
  tfMeetingSteps: typeof import('./tfBoard')['TF_MEETING_STEPS'];
  tfWorkstreams: typeof import('./tfBoard')['TF_WORKSTREAMS'];
};
type MonitorReviewDrafts = Record<string, VideoReviewDraft>;
type SourceReviewDecision = 'UNDECIDED' | 'USE_GENERAL' | 'REVISE' | 'HOLD';
type SourceReviewDraft = {
  reviewer: string;
  role: 'SCIENCE' | 'MEDICAL';
  decision: SourceReviewDecision;
  scopeChecked: boolean;
  limitationChecked: boolean;
  sentenceChecked: boolean;
  notes: string;
  updatedAt: string;
};
type SourceReviewDrafts = Record<string, SourceReviewDraft>;
type ReviewHandoffPacket = {
  packetType: 'GABA_EDUCATION_REVIEW_HANDOFF';
  version: 1;
  exportedAt: string;
  checkedAt: string;
  scope: {videoDb: number; monitorCandidates: number; tfRoles: number};
  videoReviewDrafts: VideoReviewDrafts;
  monitorReviewDrafts: MonitorReviewDrafts;
  sourceReviewDrafts: SourceReviewDrafts;
  tfAssignments: TfAssignment;
  tfMeetingDraft: string;
  tfDiscussionDrafts: TfDiscussionDrafts;
  fieldSessionDrafts: FieldSessionDrafts;
  boundary: string;
};

const TF_ASSIGNMENT_STORAGE_KEY = 'cellpinda-gaba-tf-assignment-draft-v1';
const TF_DISCUSSION_STORAGE_KEY = 'cellpinda-gaba-tf-discussion-draft-v1';
const FIELD_SESSION_STORAGE_KEY = 'cellpinda-gaba-field-session-draft-v1';
const VIDEO_REVIEW_STORAGE_KEY = 'cellpinda-gaba-video-review-draft-v1';
const MONITOR_REVIEW_STORAGE_KEY = 'cellpinda-gaba-monitor-review-draft-v1';
const SOURCE_REVIEW_STORAGE_KEY = 'cellpinda-gaba-source-review-draft-v1';
const REVIEW_HANDOFF_PACKET_TYPE = 'GABA_EDUCATION_REVIEW_HANDOFF';
const VIDEO_REVIEW_ROLES = ['VIDEO', 'SCIENCE', 'MEDICAL', 'RIGHTS', 'PM'] as const;
const VIDEO_REVIEW_CHECKS = [
  {key: 'sourceChecked', label: '원문·영상'},
  {key: 'transcriptChecked', label: '자막·대본'},
  {key: 'speakerChecked', label: '화자·자격'},
  {key: 'rightsChecked', label: '권리·사용'},
  {key: 'claimScopeChecked', label: '주장 범위·연구'},
] as const;
const VIDEO_REVIEW_DECISIONS: Array<{id: VideoReviewDecision; label: string}> = [
  {id: 'UNDECIDED', label: '아직 결정하지 않음'},
  {id: 'HOLD', label: '보류'},
  {id: 'LIMITED_USE', label: '제한 사용 검토'},
  {id: 'PUBLISH_GENERAL', label: '일반 교육 공개 검토'},
  {id: 'EXCLUDE', label: '사용 제외'},
];
const TF_DISCUSSION_DECISIONS: Array<{id: TfDiscussionDecision; label: string}> = [
  {id: 'UNDECIDED', label: '아직 결정하지 않음'},
  {id: 'CONTINUE', label: '계속 검토'},
  {id: 'HOLD', label: 'HOLD'},
  {id: 'DECIDED', label: '결정 기록'},
];
const FIELD_SESSION_SCENARIOS: Array<{id: FieldSessionScenarioId; title: string; goal: string}> = [
  {id: 'A', title: '처음 보는 사람의 전체 흐름', goal: '01→08에서 GABA 이름·기능·연구 읽는 기준을 이해하는지 확인'},
  {id: 'B', title: '권위 영상 질문', goal: '승인 영상·검토 후보·원문 링크의 차이를 구분하는지 확인'},
  {id: 'C', title: '연구 질문', goal: '일반 GABA 연구와 개인·제품 효능을 구분하는지 확인'},
];
const FIELD_SESSION_CLARITY_OPTIONS: Array<{id: FieldSessionClarity; label: string}> = [
  {id: '', label: '아직 기록하지 않음'},
  {id: '1', label: '1점'},
  {id: '2', label: '2점'},
  {id: '3', label: '3점'},
  {id: '4', label: '4점'},
  {id: '5', label: '5점'},
];

const makeEmptyVideoReviewDraft = (): VideoReviewDraft => ({
  reviewer: '',
  role: 'VIDEO',
  decision: 'UNDECIDED',
  sourceChecked: false,
  transcriptChecked: false,
  speakerChecked: false,
  rightsChecked: false,
  claimScopeChecked: false,
  timestamps: '',
  transcriptExcerpt: '',
  notes: '',
  updatedAt: '',
});

const makeEmptySourceReviewDraft = (): SourceReviewDraft => ({
  reviewer: '',
  role: 'SCIENCE',
  decision: 'UNDECIDED',
  scopeChecked: false,
  limitationChecked: false,
  sentenceChecked: false,
  notes: '',
  updatedAt: '',
});

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normaliseReviewDrafts = (value: unknown): VideoReviewDrafts => {
  if (!isRecord(value)) return {};
  const allowedDecisions = new Set<VideoReviewDecision>(['UNDECIDED', 'HOLD', 'LIMITED_USE', 'PUBLISH_GENERAL', 'EXCLUDE']);
  return Object.fromEntries(Object.entries(value).flatMap(([id, rawDraft]) => {
    if (!isRecord(rawDraft) || !id.trim()) return [];
    const blank = makeEmptyVideoReviewDraft();
    const draft: VideoReviewDraft = {
      reviewer: typeof rawDraft.reviewer === 'string' ? rawDraft.reviewer : blank.reviewer,
      role: typeof rawDraft.role === 'string' ? rawDraft.role : blank.role,
      decision: typeof rawDraft.decision === 'string' && allowedDecisions.has(rawDraft.decision as VideoReviewDecision) ? rawDraft.decision as VideoReviewDecision : blank.decision,
      sourceChecked: rawDraft.sourceChecked === true,
      transcriptChecked: rawDraft.transcriptChecked === true,
      speakerChecked: rawDraft.speakerChecked === true,
      rightsChecked: rawDraft.rightsChecked === true,
      claimScopeChecked: rawDraft.claimScopeChecked === true,
      timestamps: typeof rawDraft.timestamps === 'string' ? rawDraft.timestamps : blank.timestamps,
      transcriptExcerpt: typeof rawDraft.transcriptExcerpt === 'string' ? rawDraft.transcriptExcerpt : blank.transcriptExcerpt,
      notes: typeof rawDraft.notes === 'string' ? rawDraft.notes : blank.notes,
      updatedAt: typeof rawDraft.updatedAt === 'string' ? rawDraft.updatedAt : blank.updatedAt,
    };
    return [[id, draft]];
  })) as VideoReviewDrafts;
};

const normaliseTfAssignments = (value: unknown): TfAssignment => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([id, rawAssignment]) => {
    if (!isRecord(rawAssignment) || !id.trim()) return [];
    return [[id, {
      lead: typeof rawAssignment.lead === 'string' ? rawAssignment.lead : '',
      backup: typeof rawAssignment.backup === 'string' ? rawAssignment.backup : '',
    }]];
  })) as TfAssignment;
};

const makeEmptyTfDiscussionDraft = (): TfDiscussionDraft => ({
  owner: '',
  due: '',
  decision: 'UNDECIDED',
  notes: '',
  updatedAt: '',
});

const normaliseTfDiscussionDrafts = (value: unknown): TfDiscussionDrafts => {
  if (!isRecord(value)) return {};
  const allowedDecisions = new Set<TfDiscussionDecision>(['UNDECIDED', 'CONTINUE', 'HOLD', 'DECIDED']);
  return Object.fromEntries(Object.entries(value).flatMap(([id, rawDraft]) => {
    if (!isRecord(rawDraft) || !id.trim()) return [];
    const blank = makeEmptyTfDiscussionDraft();
    const draft: TfDiscussionDraft = {
      owner: typeof rawDraft.owner === 'string' ? rawDraft.owner : blank.owner,
      due: typeof rawDraft.due === 'string' ? rawDraft.due : blank.due,
      decision: typeof rawDraft.decision === 'string' && allowedDecisions.has(rawDraft.decision as TfDiscussionDecision) ? rawDraft.decision as TfDiscussionDecision : blank.decision,
      notes: typeof rawDraft.notes === 'string' ? rawDraft.notes : blank.notes,
      updatedAt: typeof rawDraft.updatedAt === 'string' ? rawDraft.updatedAt : blank.updatedAt,
    };
    return [[id, draft]];
  })) as TfDiscussionDrafts;
};

const makeEmptyFieldSessionDraft = (): FieldSessionDraft => ({
  facilitator: '',
  observer: '',
  device: '',
  clarity: '',
  firstActionSeconds: '',
  externalExit: 'UNRECORDED',
  misunderstanding: '',
  nextAction: '',
  owner: '',
  due: '',
  updatedAt: '',
});

const normaliseFieldSessionDrafts = (value: unknown): Partial<FieldSessionDrafts> => {
  if (!isRecord(value)) return {};
  const clarityValues = new Set<FieldSessionClarity>(['', '1', '2', '3', '4', '5']);
  const exitValues = new Set<FieldSessionExit>(['UNRECORDED', 'NONE', 'YES']);
  return Object.fromEntries(Object.entries(value).flatMap(([id, rawDraft]) => {
    if (!['A', 'B', 'C'].includes(id) || !isRecord(rawDraft)) return [];
    const blank = makeEmptyFieldSessionDraft();
    const draft: FieldSessionDraft = {
      facilitator: typeof rawDraft.facilitator === 'string' ? rawDraft.facilitator : blank.facilitator,
      observer: typeof rawDraft.observer === 'string' ? rawDraft.observer : blank.observer,
      device: typeof rawDraft.device === 'string' ? rawDraft.device : blank.device,
      clarity: typeof rawDraft.clarity === 'string' && clarityValues.has(rawDraft.clarity as FieldSessionClarity) ? rawDraft.clarity as FieldSessionClarity : blank.clarity,
      firstActionSeconds: typeof rawDraft.firstActionSeconds === 'string' ? rawDraft.firstActionSeconds : blank.firstActionSeconds,
      externalExit: typeof rawDraft.externalExit === 'string' && exitValues.has(rawDraft.externalExit as FieldSessionExit) ? rawDraft.externalExit as FieldSessionExit : blank.externalExit,
      misunderstanding: typeof rawDraft.misunderstanding === 'string' ? rawDraft.misunderstanding : blank.misunderstanding,
      nextAction: typeof rawDraft.nextAction === 'string' ? rawDraft.nextAction : blank.nextAction,
      owner: typeof rawDraft.owner === 'string' ? rawDraft.owner : blank.owner,
      due: typeof rawDraft.due === 'string' ? rawDraft.due : blank.due,
      updatedAt: typeof rawDraft.updatedAt === 'string' ? rawDraft.updatedAt : blank.updatedAt,
    };
    return [[id, draft]];
  })) as Partial<FieldSessionDrafts>;
};

const normaliseSourceReviewDrafts = (value: unknown): SourceReviewDrafts => {
  if (!isRecord(value)) return {};
  const allowedDecisions = new Set<SourceReviewDecision>(['UNDECIDED', 'USE_GENERAL', 'REVISE', 'HOLD']);
  return Object.fromEntries(Object.entries(value).flatMap(([id, rawDraft]) => {
    if (!isRecord(rawDraft) || !id.trim()) return [];
    const blank = makeEmptySourceReviewDraft();
    const draft: SourceReviewDraft = {
      reviewer: typeof rawDraft.reviewer === 'string' ? rawDraft.reviewer : blank.reviewer,
      role: rawDraft.role === 'MEDICAL' ? 'MEDICAL' : 'SCIENCE',
      decision: typeof rawDraft.decision === 'string' && allowedDecisions.has(rawDraft.decision as SourceReviewDecision) ? rawDraft.decision as SourceReviewDecision : blank.decision,
      scopeChecked: rawDraft.scopeChecked === true,
      limitationChecked: rawDraft.limitationChecked === true,
      sentenceChecked: rawDraft.sentenceChecked === true,
      notes: typeof rawDraft.notes === 'string' ? rawDraft.notes : blank.notes,
      updatedAt: typeof rawDraft.updatedAt === 'string' ? rawDraft.updatedAt : blank.updatedAt,
    };
    return [[id, draft]];
  })) as SourceReviewDrafts;
};

const VIDEO_FILTERS: Array<{id: VideoFilter; label: string}> = [
  {id: 'ALL', label: '전체'},
  {id: 'REVIEW', label: '검토 필요'},
  {id: 'PUBLISH_GENERAL', label: '공개 승인'},
  {id: 'HOLD', label: '보류'},
  {id: 'LIMITED_USE', label: '제한 사용'},
  {id: 'EXCLUDE', label: '배제'},
  {id: 'INCOMPLETE', label: '감리 진행 필요'},
  {id: 'PROFILE', label: '인물 출처 있음'},
];

const RESEARCH_URL = 'https://pubmed.ncbi.nlm.nih.gov/33041752/';
const RESEARCH_SOURCES = [
  {
    id: 'SRC-01',
    topic: '일반 생리',
    title: 'Synaptic inhibition and γ-aminobutyric acid in the mammalian central nervous system',
    meta: 'Obata · Proc Jpn Acad Ser B. 2013 · PMID 23574805',
    summary: 'GABA를 척추동물 억제성 시냅스의 주요 신경전달물질로 설명하는 리뷰입니다.',
    boundary: 'GABA의 기본적인 신경 신호 조절을 이해하는 자료입니다. 섭취와 수면 관련 결과는 별도 인체 연구에서 살펴봅니다.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23574805/',
  },
  {
    id: 'SRC-02',
    topic: '신경 신호 조절',
    title: 'GABA tone regulation and its cognitive functions in the brain',
    meta: 'Koh et al. · Nat Rev Neurosci. 2023 · PMID 37495761',
    summary: '빠른 억제성 신호와 tonic GABA current가 신경활동을 조절하는 기전을 다루는 리뷰입니다.',
    boundary: 'GABA 신호가 뇌의 활동을 조절하는 원리를 이해하는 자료입니다. 섭취 후 변화는 별도 인체 연구에서 확인합니다.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37495761/',
  },
  {
    id: 'SRC-03',
    topic: '경구 GABA 인체 연구',
    title: 'Effects of Oral Gamma-Aminobutyric Acid (GABA) Administration on Stress and Sleep in Humans',
    meta: 'Hepsomali et al. · Front Neurosci. 2020 · PMID 33041752',
    summary: '자연 유래·발효 GABA를 살핀 14개 위약대조 인체시험을 종합한 문헌고찰로, 일부 연구에서 스트레스·수면 관련 지표가 좋아지는 변화가 확인됐습니다.',
    boundary: '여러 연구에서 관찰된 스트레스·수면 관련 변화를 모은 자료입니다. 참여자·섭취량·기간에 따라 결과를 더 정확하게 이해할 수 있습니다.',
    url: RESEARCH_URL,
  },
  {
    id: 'SRC-04',
    topic: '스트레스와 GABA 일반 연구',
    title: 'Oral intake of γ-aminobutyric acid affects mood and activities of central nervous system during stressed condition induced by mental tasks',
    meta: 'Yoto et al. · Amino Acids. 2012 · PMID 22203366',
    summary: '정신적 과제를 이용한 스트레스 조건에서 경구 GABA를 살핀 무작위·위약대조 교차 연구입니다.',
    boundary: '정신적 과제가 주어진 조건에서 관찰된 변화입니다. 연구 대상과 비교 조건을 함께 보면 결과를 더 정확하게 이해할 수 있습니다.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22203366/',
  },
  {
    id: 'SRC-05',
    topic: '수면과 회복',
    title: 'About Sleep',
    meta: 'NICHD · National Institutes of Health',
    summary: '수면이 학습·기억·대사·면역과 연결되고 뇌가 수면 중에도 활동한다는 일반 생리 자료입니다.',
    boundary: '수면이 뇌와 몸의 회복에 중요한 이유를 설명하는 공공기관 자료입니다. GABA 연구 자료와 함께 읽으면 역할과 연구 결과를 구분해 이해할 수 있습니다.',
    url: 'https://www.nichd.nih.gov/health/topics/sleep/conditioninfo',
  },
] as const;
const VIDEO_STATUS_LABELS: Record<GabaVideoRecord['status'], string> = {
  PUBLISH_GENERAL: '일반 교육 공개 승인',
  LIMITED_USE: '제한 사용 후보',
  HOLD: '검토 보류',
  EXCLUDE: '사용 제외',
  PENDING_REVIEW: '검토 대기',
  AUTO_FILTERED: '자동 필터 제외',
};
const PUBLIC_VIDEO_STATUS_LABEL = '원문 확인 전';
const VIDEO_AUDIT_LABELS = {
  contentBasis: {
    ORIGINAL_PAGE_TRANSCRIPT: '원문 페이지·대본 확인',
    OFFICIAL_EVENT_PAGE: '공식 강의·행사 페이지 확인',
    TITLE_AND_PUBLIC_DESCRIPTION: '제목·공개 설명 기반 예비 확인',
    UNREVIEWED: '아직 확인하지 않음',
  },
  authorityLevel: {VERIFIED: '권위 확인', PARTIAL: '부분 확인', UNVERIFIED: '미확인'},
  evidenceLevel: {A: '근거 A', B: '근거 B', C: '근거 C', D: '근거 D', UNREVIEWED: '근거 미검토'},
  rightsStatus: {SOURCE_PAGE: '원문 링크 방식', CHECK_REQUIRED: '권리 확인 필요', NOT_FOR_USE: '사용하지 않음'},
  usageMode: {SOURCE_LINK: '원문 링크', EMBED_IF_ALLOWED: '허용 시 임베드', REVIEW_ONLY: '검토용', EXCLUDE: '공개 제외'},
} as const;

const getMonitorScheduleStatus = (snapshot: MonitorSnapshot | null | undefined) => {
  if (!snapshot) return {label: '예약 실행 확인 전', tone: 'pending' as const};
  if (String(snapshot.runOrigin) === 'GitHub Actions 예약 실행') {
    return {label: '예약 실행 확인', tone: 'ready' as const};
  }
  return {label: '수동 실행 · 예약 증거 대기', tone: 'pending' as const};
};

const AUTHORITY_BASIS_LABELS = {
  TITLE_DESCRIPTION_SIGNAL: '전문가 표현 감지 · 자격 미확인',
  KEYWORD_DISCOVERY: '권위 검색 발견 · 자격 미확인',
} as const;
const monitorCandidateDisplayTitle = (candidate: MonitorCandidate) => candidate.publicationGate === 'PRODUCT_BRAND_QUARANTINE'
  ? '제품·브랜드 격리 후보 · 원문 제목은 일일 리포트에서 확인'
  : candidate.title;
const VIDEO_CLAIM_LABELS: Record<GabaVideoRecord['audit']['claimCategories'][number], string> = {
  GENERAL_PHYSIOLOGY: '일반 생리',
  ORAL_GABA_HUMAN_RESEARCH: '경구 GABA 인체 연구',
  SLEEP_STRESS: '수면·스트레스',
  DISEASE_TREATMENT: '질환·치료',
  PRODUCT_COMMERCIAL: '제품·상업성',
  UNREVIEWED: '미검토',
};

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

const downloadCsvFile = (filename: string, rows: unknown[][]) => {
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const downloadJsonFile = (filename: string, value: unknown) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], {type: 'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const STORY_PHASES = [
  {id: 'everyday', label: '일상 상태', start: 0, end: 2},
  {id: 'rest', label: '회복', start: 3, end: 3},
  {id: 'ingredient', label: 'GABA 기능', start: 4, end: 5},
  {id: 'research', label: '일반 연구', start: 6, end: 6},
  {id: 'finish', label: '한 문장 정리', start: 7, end: 7},
] as const;

const PRESENTER_QUESTIONS = [
  {
    label: 'GABA 기능',
    answer: 'GABA는 뇌에서 신경세포의 활동을 낮추는 방향으로 신호를 전달하는 대표적인 억제성 신경전달물질입니다. 뇌의 활동을 조절하는 여러 신호 중 하나라고 이해하면 됩니다.',
  },
  {
    label: '수면·스트레스',
    answer: '수면과 스트레스는 여러 요인의 영향을 받습니다. 일반 GABA 섭취 연구에서 스트레스와 수면 관련 지표가 좋아지는 변화가 확인된 사례가 있으며, 어떤 참여자와 조건에서 나온 결과인지 함께 확인하면 됩니다.',
  },
  {
    label: '일반 연구',
    answer: '연구 대상·섭취량·기간·비교 조건을 함께 확인하고, 연구 결과가 특정 제품의 효능을 입증하는 것으로 확장되지 않게 설명합니다.',
  },
  {
    label: '영상 사용',
    answer: '권위자의 영상이라도 원문·자막·발언 구간·권리를 확인합니다. 공개 승인 전 후보는 소비자 화면의 별도 영상 섹션에서 ‘원문 확인 전’으로만 구분해 보여 주며, 일반 GABA 근거 자료로 사용하지 않습니다.',
  },
] as const;

function makeSlides(): Slide[] {
  return [
    {
      id: 'hook',
      label: '01 · 일상에서 생기는 변화',
      title: '집중이 흐트러지고, 말이 먼저 나오는 날이 있습니다.',
      body: '잠이 부족하거나 할 일이 몰리면 평소보다 쉽게 지치고 작은 일에도 반응이 커질 수 있습니다. 이럴 때 뇌의 상태를 살펴보겠습니다.',
      tone: 'deep',
      visual: STORY_VISUALS.overload,
      presenterPrompt: '최근 집중이 흐트러지거나 말이 먼저 나왔던 순간이 있었나요?',
      presenterBoundary: '일상에서 흔히 겪는 변화를 예로 든 도입입니다. 특정 성분 부족이나 질환을 뜻하지 않습니다.',
    },
    {
      id: 'recovered',
      label: '02 · 여유가 생기는 날',
      title: '잠을 충분히 잔 날에는 생각과 행동에 여유가 생깁니다.',
      body: '말하기 전에 한 번 더 생각하고, 하던 일에 집중하고, 작은 실수를 알아차리기 쉬워집니다. 수면은 몸뿐 아니라 뇌가 회복하는 시간입니다.',
      tone: 'fresh',
      presenterPrompt: '잠을 충분히 잔 날에는 무엇이 달랐는지 떠올려 보세요.',
      presenterBoundary: '충분한 수면이 뇌와 몸의 회복에 중요하다는 일반 설명입니다.',
    },
    {
      id: 'overload',
      label: '03 · 머리가 계속 바쁜 날',
      title: '몸은 쉬고 있는데 머리는 계속 바쁠 때가 있습니다.',
      body: '같은 문장을 반복해서 읽거나, 알림 하나에도 집중이 끊기고, 사소한 일에 예민해지는 식입니다. 흔히 말하는 ‘뇌 과부하’는 이런 일상의 상태를 표현하는 말입니다.',
      tone: 'warm',
      visual: STORY_VISUALS.overload,
      presenterPrompt: '몸은 쉬었는데 머리는 계속 바빴던 때가 있었나요?',
      presenterBoundary: '뇌 과부하는 진단명이 아니라, 일상에서 머리가 과도하게 바쁜 상태를 표현한 말입니다.',
    },
    {
      id: 'sleep',
      label: '04 · 뇌가 쉬는 시간',
      title: '잠은 뇌가 하루를 정리하고 다시 준비하는 시간입니다.',
      body: '수면 중에는 기억과 학습, 대사와 면역 등 여러 과정이 이어집니다. 그래서 충분한 수면은 뇌와 몸의 기본적인 회복에 중요합니다.',
      tone: 'green',
      note: '수면과 회복의 일반 정보는 공공기관 자료와 함께 확인합니다.',
      presenterPrompt: '수면이 줄었을 때 일상에서 가장 먼저 달라지는 것은 무엇인가요?',
      presenterBoundary: '수면의 일반 생리와 회복을 설명하는 장면입니다.',
      link: {href: RESEARCH_URL, label: '수면 회복 자료 보기', panel: 'research'},
    },
    {
      id: 'gaba',
      label: '05 · GABA란 무엇일까',
      title: '뇌의 신호를 조절하는 물질, GABA입니다.',
      body: 'GABA는 감마아미노부티르산을 줄여 부르는 말입니다. 우리 뇌에서 신경세포 사이에 신호를 전달하는 신경전달물질 중 하나입니다.',
      tone: 'green-dark',
      visual: STORY_VISUALS.neural,
      presenterPrompt: 'GABA라는 이름을 처음 들었다면 무엇부터 알고 싶으신가요?',
      presenterBoundary: 'GABA라는 신경전달물질의 기본 정의를 설명하는 장면입니다.',
    },
    {
      id: 'function',
      label: '06 · GABA가 하는 일',
      title: 'GABA는 신경세포의 활동을 낮추는 방향으로 신호를 전달합니다.',
      body: '뇌에는 활동을 높이는 신호와 낮추는 신호가 함께 있습니다. GABA는 그중 억제성 신호를 맡아 뇌의 전체 활동이 균형을 이루도록 조절하는 데 관여합니다.',
      tone: 'research',
      visual: STORY_VISUALS.neural,
      presenterPrompt: '뇌의 활동을 높이는 신호와 낮추는 신호가 함께 있다는 점을 기억하면 됩니다.',
      presenterBoundary: 'GABA의 일반적인 신경생리 기능을 설명하는 장면입니다.',
      link: {href: RESEARCH_URL, label: 'GABA 기능 자료 보기', panel: 'research'},
    },
    {
      id: 'research',
      label: '07 · 일반 GABA 연구는 어디까지 알까',
      title: '일부 인체 연구에서 스트레스·수면 지표가 좋아지는 변화가 확인됐습니다.',
      body: '일반 GABA 섭취를 살펴본 여러 인체 연구를 모은 문헌고찰에서, 일부 연구의 스트레스·수면 관련 지표가 좋아지는 변화가 확인됐습니다. 연구마다 참여자·섭취량·기간이 달랐으므로 결과는 연구 조건과 함께 살펴봅니다.',
      tone: 'research',
      note: '연구에 사용된 자료와 조건은 아래에서 확인할 수 있습니다.',
      presenterPrompt: '이 연구가 누구를 대상으로, 어떤 조건에서 진행됐는지 먼저 보겠습니다.',
      presenterBoundary: '일반 GABA 섭취 연구의 결과와 한계를 함께 설명하는 장면입니다.',
      link: {href: RESEARCH_URL, label: '연구 자료 보기', panel: 'research'},
    },
    {
      id: 'finish',
      label: '08 · 한 문장으로 정리하면',
      title: 'GABA는 뇌의 신호를 조절하는 대표적인 억제성 신경전달물질입니다.',
      body: 'GABA는 뇌의 신호를 조절하는 대표적인 억제성 신경전달물질입니다. 연구 결과는 연구 조건과 출처를 함께 살펴보면 더 정확하게 이해할 수 있습니다.',
      tone: 'finish',
      presenterPrompt: 'GABA를 한 문장으로 설명하면 어떤 말이 가장 자연스러울까요?',
      presenterBoundary: 'GABA의 생리적 역할과 섭취 연구를 구분해 정리하는 장면입니다.',
      link: {href: RESEARCH_URL, label: '연구 자료 다시 보기', panel: 'research'},
    },
  ];
}

export default function App() {
  const slides = useMemo(makeSlides, []);
  const [active, setActive] = useState(0);
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null);
  const [panelSourceIndex, setPanelSourceIndex] = useState<number | null>(null);
  const [panelVideoId, setPanelVideoId] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presenterData, setPresenterData] = useState<PresenterData | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [panelShareMessage, setPanelShareMessage] = useState('');
  const [presenterCopyMessage, setPresenterCopyMessage] = useState('');
  const [videoCopyMessage, setVideoCopyMessage] = useState('');
  const [showcaseShareMessage, setShowcaseShareMessage] = useState('');
  const [showcasePlayerStartedId, setShowcasePlayerStartedId] = useState<string | null>(null);
  const [previewImageError, setPreviewImageError] = useState(false);
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('ALL');
  const [videoQuery, setVideoQuery] = useState('');
  const [showcaseVideoIndex, setShowcaseVideoIndex] = useState(0);
  const [approvedVideoIndex, setApprovedVideoIndex] = useState(0);
  const [tfAssignments, setTfAssignments] = useState<TfAssignment>({});
  const [tfMeetingDraft, setTfMeetingDraft] = useState('');
  const [tfAssignmentMessage, setTfAssignmentMessage] = useState('');
  const [tfDiscussionMessage, setTfDiscussionMessage] = useState('');
  const [tfDiscussionDrafts, setTfDiscussionDrafts] = useState<TfDiscussionDrafts>({});
  const [tfDiscussionDraftMessage, setTfDiscussionDraftMessage] = useState('');
  const [fieldSessionDrafts, setFieldSessionDrafts] = useState<FieldSessionDrafts>(() => ({A: makeEmptyFieldSessionDraft(), B: makeEmptyFieldSessionDraft(), C: makeEmptyFieldSessionDraft()}));
  const [fieldSessionMessage, setFieldSessionMessage] = useState('');
  const [videoReviewDrafts, setVideoReviewDrafts] = useState<VideoReviewDrafts>({});
  const [videoReviewMessage, setVideoReviewMessage] = useState('');
  const [reviewHandoffMessage, setReviewHandoffMessage] = useState('');
  const [sourceReviewDrafts, setSourceReviewDrafts] = useState<SourceReviewDrafts>({});
  const [sourceReviewMessage, setSourceReviewMessage] = useState('');
  const [monitorCopyMessage, setMonitorCopyMessage] = useState('');
  const [monitorReviewDrafts, setMonitorReviewDrafts] = useState<MonitorReviewDrafts>({});
  const [monitorReviewCandidateId, setMonitorReviewCandidateId] = useState<string | null>(null);
  const [monitorReviewMessage, setMonitorReviewMessage] = useState('');
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const panelTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLElement>(null);
  const panelCloseRef = useRef<HTMLButtonElement>(null);
  const presentationRef = useRef<HTMLElement>(null);
  const presentationModeRef = useRef(false);
  const presentationReturnRef = useRef<HTMLElement | null>(null);
  const panelReturnRef = useRef<HTMLElement | null>(null);
  const reviewHandoffInputRef = useRef<HTMLInputElement>(null);
  const shareRequestRef = useRef(0);
  const programmaticTargetRef = useRef<number | null>(null);
  const railScrollFrameRef = useRef<number | null>(null);
  const consumerSwipeStartRef = useRef<number | null>(null);
  const consumerWheelLockRef = useRef(false);
  const phaseNavRef = useRef<HTMLElement>(null);
  const showcaseShareRequestRef = useRef(0);
  const activePhase = STORY_PHASES.find(phase => active >= phase.start && active <= phase.end) ?? STORY_PHASES[0];
  const nextSlide = slides[active + 1];
  const activePresenterVideos = presenterData?.activeVideos ?? [];
  const presenterVideoDb = presenterData?.videoDb ?? [];
  const presenterApprovedVideos = presenterData?.approvedVideos ?? [];
  const presenterMonitor = presenterData?.monitor;
  const presenterScheduleStatus = getMonitorScheduleStatus(presenterMonitor);
  const presenterTfRoles = presenterData?.tfRoles ?? [];
  const presenterTfDiscussionItems = presenterData?.tfDiscussionItems ?? [];
  const presenterTfMeetingSteps = presenterData?.tfMeetingSteps ?? [];
  const presenterTfWorkstreams = presenterData?.tfWorkstreams ?? [];
  const approvedVideos = useMemo(() => DOMESTIC_PUBLIC_GABA_VIDEOS.map(video => {
    const videoId = video.url.match(/\/shorts\/([^?&#/]+)/)?.[1];
    return {
      ...video,
      previewImage: video.previewImage ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined),
      previewAlt: video.previewAlt ?? `${video.title} 원문 미리보기`,
      previewLabel: video.previewLabel ?? '사람 검토 완료 · 일반 GABA 교육',
    };
  }), []);
  const publicPanelVideos = useMemo(() => [...approvedVideos, ...SHARED_GABA_VIDEOS], [approvedVideos]);
  const approvedVideo = approvedVideos[approvedVideoIndex] ?? approvedVideos[0] ?? null;
  const publicVideo = publicPanelVideos[0] ?? null;
  const showcaseVideo = SHARED_GABA_VIDEOS[showcaseVideoIndex] ?? SHARED_GABA_VIDEOS[0] ?? null;
  const panelVideos = presentationMode ? activePresenterVideos : publicPanelVideos;
  const selectedVideo = panelVideoId ? panelVideos.find(video => video.id === panelVideoId) ?? presenterVideoDb.find(video => video.id === panelVideoId) ?? null : null;
  const selectedVideoId = selectedVideo?.url.match(/(?:shorts\/|watch\?v=)([\w-]{11})/)?.[1] ?? null;
  const selectedVideoEmbedUrl = selectedVideoId && /youtube\.com|youtu\.be/i.test(selectedVideo?.url ?? '')
    ? `https://www.youtube-nocookie.com/embed/${selectedVideoId}?rel=0&modestbranding=1`
    : null;
  const selectedVideoIsShort = Boolean(selectedVideo?.url.includes('/shorts/'));
  const showcaseVideoId = showcaseVideo?.url.match(/(?:shorts\/|watch\?v=)([\w-]{11})/)?.[1] ?? null;
  const showcaseVideoEmbedUrl = showcaseVideoId && /youtube\.com|youtu\.be/i.test(showcaseVideo?.url ?? '')
    ? `https://www.youtube-nocookie.com/embed/${showcaseVideoId}?rel=0&modestbranding=1`
    : null;
  const selectedVideoIndex = selectedVideo ? panelVideos.findIndex(video => video.id === selectedVideo.id) : -1;
  const nextVideo = selectedVideoIndex >= 0 ? panelVideos[selectedVideoIndex + 1] ?? null : null;
  const selectedVideoReviewDraft = selectedVideo ? videoReviewDrafts[selectedVideo.id] ?? makeEmptyVideoReviewDraft() : null;
  const selectedReviewCheckCount = selectedVideoReviewDraft ? VIDEO_REVIEW_CHECKS.filter(check => selectedVideoReviewDraft[check.key]).length : 0;
  const incompleteAuditVideos = useMemo(() => panelVideos.filter(video => VIDEO_REVIEW_CHECKS.filter(check => videoReviewDrafts[video.id]?.[check.key]).length < VIDEO_REVIEW_CHECKS.length), [panelVideos, videoReviewDrafts]);
  const releaseReadyVideos = useMemo(() => activePresenterVideos.filter(video => {
    const draft = videoReviewDrafts[video.id];
    return Boolean(draft
      && draft.decision === 'PUBLISH_GENERAL'
      && draft.reviewer.trim()
      && draft.timestamps.trim()
      && draft.transcriptExcerpt.trim()
      && VIDEO_REVIEW_CHECKS.every(check => draft[check.key]));
  }), [activePresenterVideos, videoReviewDrafts]);
  const reviewPriorityVideos = useMemo(() => {
    const statusRank: Record<GabaVideoRecord['status'], number> = {
      LIMITED_USE: 0,
      HOLD: 1,
      PENDING_REVIEW: 2,
      PUBLISH_GENERAL: 3,
      AUTO_FILTERED: 8,
      EXCLUDE: 9,
    };
    const reviewProgress = (video: GabaVideoRecord) => VIDEO_REVIEW_CHECKS.filter(check => videoReviewDrafts[video.id]?.[check.key]).length;
    const reviewPool = presentationMode && activePresenterVideos.length ? activePresenterVideos : SHARED_GABA_VIDEOS;
    return [...reviewPool]
      .filter(video => video.status !== 'EXCLUDE')
      .sort((left, right) => {
        const leftProgress = reviewProgress(left);
        const rightProgress = reviewProgress(right);
        return Number(leftProgress === VIDEO_REVIEW_CHECKS.length) - Number(rightProgress === VIDEO_REVIEW_CHECKS.length)
          || statusRank[left.status] - statusRank[right.status]
          || left.id.localeCompare(right.id);
      })
      .slice(0, 3);
  }, [activePresenterVideos, presentationMode, videoReviewDrafts]);
  const monitorCandidates = useMemo<MonitorCandidate[]>(() => presenterMonitor ? [...presenterMonitor.pendingQueue, ...presenterMonitor.authorityQueue, ...presenterMonitor.productBrandQueue] : [], [presenterMonitor]);
  const monitorReviewCandidate = monitorCandidates.find(candidate => candidate.id === monitorReviewCandidateId) ?? null;
  const monitorReviewDraft = monitorReviewCandidate ? monitorReviewDrafts[monitorReviewCandidate.id] ?? makeEmptyVideoReviewDraft() : null;
  const monitorReviewCandidateIdFromUrl = monitorReviewCandidate?.url.match(/(?:shorts\/|watch\?v=)([\w-]{11})/)?.[1] ?? null;
  const monitorReviewCandidateEmbedUrl = monitorReviewCandidateIdFromUrl && monitorReviewCandidate?.url && /youtube\.com|youtu\.be/i.test(monitorReviewCandidate.url)
    ? `https://www.youtube-nocookie.com/embed/${monitorReviewCandidateIdFromUrl}?rel=0&modestbranding=1`
    : null;
  const monitorReviewCheckCount = monitorReviewDraft ? VIDEO_REVIEW_CHECKS.filter(check => monitorReviewDraft[check.key]).length : 0;
  const sourceReviewCompleted = RESEARCH_SOURCES.filter(source => {
    const draft = sourceReviewDrafts[source.id];
    return Boolean(draft?.scopeChecked && draft.limitationChecked && draft.sentenceChecked);
  }).length;

  useEffect(() => setPreviewImageError(false), [panelVideoId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TF_ASSIGNMENT_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {assignments?: TfAssignment; meeting?: string};
      if (parsed.assignments && typeof parsed.assignments === 'object') setTfAssignments(parsed.assignments);
      if (typeof parsed.meeting === 'string') setTfMeetingDraft(parsed.meeting);
    } catch {
      // A local draft is optional and must never block the public page.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TF_DISCUSSION_STORAGE_KEY);
      if (!saved) return;
      const parsed = normaliseTfDiscussionDrafts(JSON.parse(saved));
      if (parsed && typeof parsed === 'object') setTfDiscussionDrafts(parsed);
    } catch {
      // A local discussion draft is optional and must never block the public page.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FIELD_SESSION_STORAGE_KEY);
      if (!saved) return;
      const parsed = normaliseFieldSessionDrafts(JSON.parse(saved));
      setFieldSessionDrafts(current => ({...current, ...parsed}));
    } catch {
      // A local field-session draft is optional and must never block the public page.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIDEO_REVIEW_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as VideoReviewDrafts;
      if (parsed && typeof parsed === 'object') setVideoReviewDrafts(parsed);
    } catch {
      // A local review draft is optional and must never block the public page.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MONITOR_REVIEW_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as MonitorReviewDrafts;
      if (parsed && typeof parsed === 'object') setMonitorReviewDrafts(parsed);
    } catch {
      // A local monitor draft is optional and must never block the public page.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SOURCE_REVIEW_STORAGE_KEY);
      if (!saved) return;
      const parsed = normaliseSourceReviewDrafts(JSON.parse(saved));
      if (parsed && typeof parsed === 'object') setSourceReviewDrafts(parsed);
    } catch {
      // A local source review draft is optional and must never block the public page.
    }
  }, []);
  const filteredPanelVideos = useMemo(() => {
    const query = videoQuery.trim().toLocaleLowerCase();
    const reviewProgress = (video: GabaVideoRecord) => VIDEO_REVIEW_CHECKS.filter(check => videoReviewDrafts[video.id]?.[check.key]).length;
    const matchesFilter = (video: GabaVideoRecord) => videoFilter === 'ALL'
      || (videoFilter === 'REVIEW' && video.status !== 'PUBLISH_GENERAL')
      || (videoFilter === 'INCOMPLETE' && reviewProgress(video) < VIDEO_REVIEW_CHECKS.length)
      || (videoFilter === 'PROFILE' && Boolean(video.authorityEvidenceUrl) && video.audit.authorityLevel !== 'UNVERIFIED')
      || video.status === videoFilter;
    return [...panelVideos]
      .filter(video => matchesFilter(video))
      .filter(video => !query || [video.id, video.title, video.channel, video.speaker].join(' ').toLocaleLowerCase().includes(query));
  }, [panelVideos, videoFilter, videoQuery, videoReviewDrafts]);

  const videoFilterCount = (filter: VideoFilter) => panelVideos.filter(video => filter === 'ALL'
    || (filter === 'REVIEW' && video.status !== 'PUBLISH_GENERAL')
    || (filter === 'INCOMPLETE' && VIDEO_REVIEW_CHECKS.filter(check => videoReviewDrafts[video.id]?.[check.key]).length < VIDEO_REVIEW_CHECKS.length)
    || (filter === 'PROFILE' && Boolean(video.authorityEvidenceUrl) && video.audit.authorityLevel !== 'UNVERIFIED')
    || video.status === filter).length;

  useEffect(() => {
    const nav = phaseNavRef.current;
    const current = nav?.querySelector<HTMLElement>(`[data-phase="${activePhase.id}"]`);
    if (!nav || !current) return;
    const viewStart = nav.scrollLeft;
    const viewEnd = viewStart + nav.clientWidth;
    const itemStart = current.offsetLeft;
    const itemEnd = itemStart + current.offsetWidth;
    if (itemStart < viewStart) nav.scrollLeft = Math.max(0, itemStart - 8);
    else if (itemEnd > viewEnd) nav.scrollLeft = itemEnd - nav.clientWidth + 8;
  }, [activePhase.id]);

  const syncActiveFromRail = () => {
    if (presentationModeRef.current || programmaticTargetRef.current !== null) return;
    if (railScrollFrameRef.current !== null) cancelAnimationFrame(railScrollFrameRef.current);
    railScrollFrameRef.current = requestAnimationFrame(() => {
      railScrollFrameRef.current = null;
      const rail = railRef.current;
      if (!rail) return;
      if (rail.scrollTop <= 1) {
        setActive(0);
        return;
      }
      const railRect = rail.getBoundingClientRect();
      const railCenter = railRect.top + railRect.height / 2;
      const centered = slideRefs.current
        .map((slide, index) => ({slide, index}))
        .filter(({slide}) => slide && slide.getBoundingClientRect().width > 0)
        .sort((left, right) => {
          const leftRect = left.slide!.getBoundingClientRect();
          const rightRect = right.slide!.getBoundingClientRect();
          return Math.abs(leftRect.top + leftRect.height / 2 - railCenter) - Math.abs(rightRect.top + rightRect.height / 2 - railCenter);
        })[0];
      if (centered) setActive(centered.index);
    });
  };

  const goTo = (index: number, requestedBehavior?: ScrollBehavior) => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    programmaticTargetRef.current = next;
    shareRequestRef.current += 1;
    setShareUrl('');
    setShareMessage('');
    if (presentationModeRef.current) {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'presenter');
      url.searchParams.set('card', String(next + 1));
      url.hash = 'story';
      window.history.replaceState({}, '', url);
    }
    setActive(next);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = requestedBehavior ?? (reduceMotion ? 'auto' : 'smooth');
    const rail = railRef.current;
    const target = slideRefs.current[next];
    if (presentationModeRef.current && rail && target) {
      rail.scrollTo({top: target.offsetTop, behavior});
    } else {
      document.getElementById('story-scene-hook')?.scrollIntoView({behavior, block: 'start'});
    }
    const settleDelay = behavior === 'auto' ? 80 : 850;
    window.setTimeout(() => {
      if (programmaticTargetRef.current === next) programmaticTargetRef.current = null;
    }, settleDelay);
  };

  const handleConsumerWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (presentationModeRef.current || openPanel || Math.abs(event.deltaY) < 24 || consumerWheelLockRef.current) return;
    event.preventDefault();
    consumerWheelLockRef.current = true;
    goTo(active + (event.deltaY > 0 ? 1 : -1));
    window.setTimeout(() => { consumerWheelLockRef.current = false; }, 680);
  };

  const handleConsumerTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    consumerSwipeStartRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleConsumerTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const startY = consumerSwipeStartRef.current;
    consumerSwipeStartRef.current = null;
    if (presentationModeRef.current || openPanel || startY === null) return;
    const endY = event.changedTouches[0]?.clientY ?? startY;
    const distance = startY - endY;
    if (Math.abs(distance) < 44) return;
    goTo(active + (distance > 0 ? 1 : -1));
  };

  const handleConsumerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'PageDown' && event.key !== 'PageUp') return;
    event.preventDefault();
    goTo(active + (event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = Number(params.get('card'));
    const presenterRequested = params.get('mode') === 'presenter' || params.get('presenter') === '1';
    const requestedVideoId = params.get('video');
    if (presenterRequested) {
      presentationModeRef.current = true;
      setPresentationMode(true);
    }
    if (Number.isInteger(requested) && requested >= 1 && requested <= slides.length) {
      const requestedIndex = requested - 1;
      // Resolve a direct scene URL before rendering the single-page reader stage.
      // Presenter mode renders one focused scene, so it does not need a scroll command.
      programmaticTargetRef.current = null;
      setActive(requestedIndex);
      if (!presenterRequested) {
        window.requestAnimationFrame(() => document.getElementById('story-scene-hook')?.scrollIntoView({behavior: 'auto', block: 'start'}));
      }
    }
    if (presenterRequested && requestedVideoId && presenterData?.videoDb.some(video => video.id === requestedVideoId)) {
      window.requestAnimationFrame(() => {
        setPanelSourceIndex(Number.isInteger(requested) && requested >= 1 && requested <= slides.length ? requested - 1 : 0);
        setPanelVideoId(requestedVideoId);
        setVideoFilter('ALL');
        setVideoQuery('');
        setOpenPanel('video');
      });
    }
    if (!presenterRequested && requestedVideoId) {
      const sharedVideoIndex = SHARED_GABA_VIDEOS.findIndex(video => video.id === requestedVideoId);
      if (sharedVideoIndex >= 0) {
        window.requestAnimationFrame(() => {
          setShowcaseVideoIndex(sharedVideoIndex);
          setShowcaseShareMessage('');
          if (window.location.hash === '#video-showcase') document.getElementById('video-showcase')?.scrollIntoView({behavior: 'auto', block: 'start'});
        });
      }
    }
  }, [slides.length, presenterData]);

  useEffect(() => {
    if (!presentationMode) {
      setPresenterData(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      import('./gabaVideos'),
      import('./gabaMonitorSnapshot'),
      import('./tfBoard'),
    ]).then(([videos, monitor, board]) => {
      if (cancelled) return;
      setPresenterData({
        activeVideos: videos.ACTIVE_GABA_VIDEOS,
        videoDb: videos.GABA_VIDEO_DB,
        approvedVideos: videos.PUBLIC_GABA_VIDEOS,
        monitor: monitor.GABA_MONITOR_SNAPSHOT,
        tfRoles: board.TF_ROLES,
        tfDiscussionItems: board.TF_DISCUSSION_ITEMS,
        tfMeetingSteps: board.TF_MEETING_STEPS,
        tfWorkstreams: board.TF_WORKSTREAMS,
      });
    }).catch(() => {
      if (!cancelled) setPresenterData(null);
    });
    return () => { cancelled = true; };
  }, [presentationMode]);

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Use a selection fallback when clipboard permission is unavailable.
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    try {
      field.select();
      if (!document.execCommand('copy')) throw new Error('copy command failed');
    } finally {
      field.remove();
    }
  };

  const persistTfDraft = (assignments: TfAssignment, meeting: string) => {
    try {
      window.localStorage.setItem(TF_ASSIGNMENT_STORAGE_KEY, JSON.stringify({assignments, meeting}));
    } catch {
      // Keep the in-memory draft when browser storage is unavailable.
    }
  };

  const persistTfDiscussionDrafts = (drafts: TfDiscussionDrafts) => {
    try {
      window.localStorage.setItem(TF_DISCUSSION_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Keep the in-memory discussion draft when browser storage is unavailable.
    }
  };

  const persistFieldSessionDrafts = (drafts: FieldSessionDrafts) => {
    try {
      window.localStorage.setItem(FIELD_SESSION_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Keep the in-memory field-session draft when browser storage is unavailable.
    }
  };

  const persistVideoReviewDrafts = (drafts: VideoReviewDrafts) => {
    try {
      window.localStorage.setItem(VIDEO_REVIEW_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Keep the in-memory draft when browser storage is unavailable.
    }
  };

  const persistMonitorReviewDrafts = (drafts: MonitorReviewDrafts) => {
    try {
      window.localStorage.setItem(MONITOR_REVIEW_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Keep the in-memory draft when browser storage is unavailable.
    }
  };

  const persistSourceReviewDrafts = (drafts: SourceReviewDrafts) => {
    try {
      window.localStorage.setItem(SOURCE_REVIEW_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Keep the in-memory source review draft when browser storage is unavailable.
    }
  };

  const updateVideoReviewDraft = <K extends keyof VideoReviewDraft>(field: K, value: VideoReviewDraft[K]) => {
    if (!selectedVideo) return;
    const current = videoReviewDrafts[selectedVideo.id] ?? makeEmptyVideoReviewDraft();
    const nextDraft = {...current, [field]: value, updatedAt: new Date().toISOString()};
    const next = {...videoReviewDrafts, [selectedVideo.id]: nextDraft};
    setVideoReviewDrafts(next);
    persistVideoReviewDrafts(next);
    setVideoReviewMessage('이 브라우저에 감리 기록 초안을 저장했습니다.');
  };

  const startMonitorReview = (candidateId: string) => {
    setMonitorReviewCandidateId(candidateId);
    setMonitorReviewMessage('');
  };

  const updateMonitorReviewDraft = <K extends keyof VideoReviewDraft>(field: K, value: VideoReviewDraft[K]) => {
    if (!monitorReviewCandidate) return;
    const current = monitorReviewDrafts[monitorReviewCandidate.id] ?? makeEmptyVideoReviewDraft();
    const nextDraft = {...current, [field]: value, updatedAt: new Date().toISOString()};
    const next = {...monitorReviewDrafts, [monitorReviewCandidate.id]: nextDraft};
    setMonitorReviewDrafts(next);
    persistMonitorReviewDrafts(next);
    setMonitorReviewMessage('이 브라우저에 신규 후보 감리 초안을 저장했습니다.');
  };

  const updateSourceReviewDraft = <K extends keyof SourceReviewDraft>(sourceId: string, field: K, value: SourceReviewDraft[K]) => {
    const current = sourceReviewDrafts[sourceId] ?? makeEmptySourceReviewDraft();
    const nextDraft = {...current, [field]: value, updatedAt: new Date().toISOString()};
    const next = {...sourceReviewDrafts, [sourceId]: nextDraft};
    setSourceReviewDrafts(next);
    persistSourceReviewDrafts(next);
    setSourceReviewMessage('이 브라우저에 과학 출처 검토 초안을 저장했습니다.');
  };

  const copySourceReviewDrafts = async () => {
    const lines = [
      '일반 GABA 과학 출처 검토 초안',
      `완료 ${sourceReviewCompleted}/${RESEARCH_SOURCES.length}건`,
      '',
      ...RESEARCH_SOURCES.map(source => {
        const draft = sourceReviewDrafts[source.id] ?? makeEmptySourceReviewDraft();
        const checks = [
          ['원문·범위', draft.scopeChecked],
          ['한계·금지 범위', draft.limitationChecked],
          ['공개 문장', draft.sentenceChecked],
        ].map(([label, value]) => `- ${label}: ${value ? '확인' : '미확인'}`).join('\n');
        return [
          `${source.id} · ${source.topic}`,
          `검토자: ${draft.reviewer.trim() || '미입력'} · 역할: ${draft.role}`,
          `결정 초안: ${draft.decision === 'USE_GENERAL' ? '일반 교육 사용 검토' : draft.decision === 'REVISE' ? '문장 수정 필요' : draft.decision === 'HOLD' ? '보류' : '아직 결정하지 않음'}`,
          checks,
          `메모: ${draft.notes.trim() || '미입력'}`,
          '',
        ].join('\n');
      }),
      '※ 브라우저 로컬 초안이며 출처 등록부의 HUMAN_REVIEWED 상태나 공개 승인을 변경하지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setSourceReviewMessage('과학 출처 검토 초안을 복사했습니다.');
    } catch {
      setSourceReviewMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyMonitorReviewDraft = async () => {
    if (!monitorReviewCandidate || !monitorReviewDraft) return;
    const candidatePriority = 'priority' in monitorReviewCandidate ? monitorReviewCandidate.priority : '권위 후보 확인';
    const checked = VIDEO_REVIEW_CHECKS
      .map(check => `- ${check.label}: ${monitorReviewDraft[check.key] ? '확인' : '미확인'}`)
      .join('\n');
    const lines = [
      `GABA 신규 후보 감리 기록 초안 · ${monitorReviewCandidate.id}`,
      `제목: ${monitorReviewCandidate.title}`,
      `발견 경로: ${monitorReviewCandidate.channel}`,
      `우선순위: ${candidatePriority}`,
      `담당자: ${monitorReviewDraft.reviewer.trim() || ('reviewer' in monitorReviewCandidate ? monitorReviewCandidate.reviewer : '미입력')} · 역할: ${monitorReviewDraft.role}`,
      `결정 초안: ${VIDEO_REVIEW_DECISIONS.find(item => item.id === monitorReviewDraft.decision)?.label ?? '아직 결정하지 않음'}`,
      `확인 타임코드: ${monitorReviewDraft.timestamps.trim() || '미입력'}`,
      `확인한 발언·자막 발췌: ${(monitorReviewDraft.transcriptExcerpt ?? '').trim() || '미입력'}`,
      `자동 주의 신호: ${monitorReviewCandidate.signals.join(' · ')}`,
      '',
      '확인 체크',
      checked,
      '',
      `팀 메모: ${monitorReviewDraft.notes.trim() || '미입력'}`,
      '',
      '※ 브라우저 로컬 초안이며 공식 DB 등록·공개 승인·과학/의학·권리 판정을 의미하지 않습니다. 원문·자막·화자·권리 확인 후 사람이 DB와 일일 검토 로그에 최종 반영합니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setMonitorReviewMessage('신규 후보 감리 초안을 복사했습니다.');
    } catch {
      setMonitorReviewMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyVideoReviewDraft = async () => {
    if (!selectedVideo || !selectedVideoReviewDraft) return;
    const draft = selectedVideoReviewDraft;
    const checked = [
      ['원문/영상', draft.sourceChecked],
      ['자막/대본', draft.transcriptChecked],
      ['화자·자격', draft.speakerChecked],
      ['권리·사용 방식', draft.rightsChecked],
      ['주장 범위·연구 구분', draft.claimScopeChecked],
    ].map(([label, value]) => `- ${label}: ${value ? '확인' : '미확인'}`).join('\n');
    const lines = [
      `GABA 영상 감리 기록 초안 · ${selectedVideo.id}`,
      `원본 제목: ${selectedVideo.title}`,
      `담당자: ${draft.reviewer.trim() || '미입력'} · 역할: ${draft.role}`,
      `결정 초안: ${VIDEO_REVIEW_DECISIONS.find(item => item.id === draft.decision)?.label ?? '아직 결정하지 않음'}`,
      `무엇을 어떻게 소개했나: ${selectedVideo.summary}`,
      `인물 소개: ${selectedVideo.personSummary}`,
      `요약 근거: ${VIDEO_AUDIT_LABELS.contentBasis[selectedVideo.audit.contentBasis]} · 권위: ${VIDEO_AUDIT_LABELS.authorityLevel[selectedVideo.audit.authorityLevel]} · 근거: ${VIDEO_AUDIT_LABELS.evidenceLevel[selectedVideo.audit.evidenceLevel]}`,
      `주장 범위: ${selectedVideo.audit.claimCategories.map(category => VIDEO_CLAIM_LABELS[category]).join(' · ')}`,
      `권리·사용: ${VIDEO_AUDIT_LABELS.rightsStatus[selectedVideo.audit.rightsStatus]} · ${VIDEO_AUDIT_LABELS.usageMode[selectedVideo.audit.usageMode]}`,
      `영상별 감리 규칙: ${selectedVideo.reviewRule ?? selectedVideo.audit.nextAction}`,
      `다음 감리 행동: ${selectedVideo.audit.nextAction}`,
      `타임코드: ${draft.timestamps.trim() || '미입력'}`,
      `발언·자막 발췌: ${(draft.transcriptExcerpt ?? '').trim() || '미입력'}`,
      '',
      '확인 체크',
      checked,
      '',
      `팀 메모: ${draft.notes.trim() || '미입력'}`,
      '',
      '※ 브라우저 로컬 초안이며 공식 공개 승인·과학/의학·권리 판정을 의미하지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setVideoReviewMessage('감리 기록 초안을 복사했습니다.');
    } catch {
      setVideoReviewMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyAllVideoReviewDrafts = async () => {
    const entries = presenterVideoDb
      .filter(video => videoReviewDrafts[video.id])
      .map(video => ({video, draft: videoReviewDrafts[video.id]}));
    if (!entries.length) {
      setVideoReviewMessage('복사할 감리 초안이 없습니다.');
      return;
    }
    const lines = ['GABA 영상 감리 기록 초안 모음', `작성 초안 ${entries.length}건`, ''];
    entries.forEach(({video, draft}, index) => {
      if (!draft) return;
      const checked = [
        ['원문/영상', draft.sourceChecked],
        ['자막/대본', draft.transcriptChecked],
        ['화자·자격', draft.speakerChecked],
        ['권리·사용 방식', draft.rightsChecked],
        ['주장 범위·연구 구분', draft.claimScopeChecked],
      ].map(([label, value]) => `- ${label}: ${value ? '확인' : '미확인'}`).join('\n');
      lines.push(
        `${index + 1}. ${video.id} · ${video.title}`,
        `담당자: ${draft.reviewer.trim() || '미입력'} · 역할: ${draft.role}`,
        `결정 초안: ${VIDEO_REVIEW_DECISIONS.find(item => item.id === draft.decision)?.label ?? '아직 결정하지 않음'}`,
        `무엇을 어떻게 소개했나: ${video.summary}`,
        `인물 소개: ${video.personSummary}`,
        `요약 근거: ${VIDEO_AUDIT_LABELS.contentBasis[video.audit.contentBasis]} · 권위: ${VIDEO_AUDIT_LABELS.authorityLevel[video.audit.authorityLevel]} · 근거: ${VIDEO_AUDIT_LABELS.evidenceLevel[video.audit.evidenceLevel]}`,
        `주장 범위: ${video.audit.claimCategories.map(category => VIDEO_CLAIM_LABELS[category]).join(' · ')}`,
        `권리·사용: ${VIDEO_AUDIT_LABELS.rightsStatus[video.audit.rightsStatus]} · ${VIDEO_AUDIT_LABELS.usageMode[video.audit.usageMode]}`,
        `영상별 감리 규칙: ${video.reviewRule ?? video.audit.nextAction}`,
        `다음 감리 행동: ${video.audit.nextAction}`,
        `타임코드: ${draft.timestamps.trim() || '미입력'}`,
        `발언·자막 발췌: ${(draft.transcriptExcerpt ?? '').trim() || '미입력'}`,
        '확인 체크',
        checked,
        `팀 메모: ${draft.notes.trim() || '미입력'}`,
        '',
      );
    });
    lines.push('※ 브라우저 로컬 초안이며 공식 공개 승인·과학/의학·권리 판정을 의미하지 않습니다.');
    try {
      await copyText(lines.join('\n'));
      setVideoReviewMessage('작성된 감리 초안을 모두 복사했습니다.');
    } catch {
      setVideoReviewMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const exportVideoDbCsv = () => {
    const headers = ['ID', '원본 제목', '소비자 제목', '영상 URL', '채널', '화자', '상태', '상태 사유', '무엇을 어떻게 소개했나', '인물 소개', '요약 근거', '권위', '근거', '주장 범위', '권리', '사용 방식', '다음 감리 행동', '확인일'];
    const rows = activePresenterVideos.map(video => [
      video.id,
      video.title,
      video.publicTitle ?? '',
      video.url,
      video.channel,
      video.speaker,
      VIDEO_STATUS_LABELS[video.status],
      video.statusReason,
      video.publicSummary ?? video.summary,
      video.publicPersonSummary ?? video.personSummary,
      VIDEO_AUDIT_LABELS.contentBasis[video.audit.contentBasis],
      VIDEO_AUDIT_LABELS.authorityLevel[video.audit.authorityLevel],
      VIDEO_AUDIT_LABELS.evidenceLevel[video.audit.evidenceLevel],
      video.audit.claimCategories.map(category => VIDEO_CLAIM_LABELS[category]).join(' · '),
      VIDEO_AUDIT_LABELS.rightsStatus[video.audit.rightsStatus],
      VIDEO_AUDIT_LABELS.usageMode[video.audit.usageMode],
      video.audit.nextAction,
      video.checkedAt,
    ]);
    downloadCsvFile(`gaba-video-db-${presenterMonitor?.checkedAt ?? 'pending'}.csv`, [headers, ...rows]);
    setVideoReviewMessage('영상 DB CSV를 내려받았습니다. 공개 승인 상태는 바뀌지 않습니다.');
  };

  const exportPublicationRequest = () => {
    if (!releaseReadyVideos.length) {
      setVideoReviewMessage('공개 요청 조건을 충족한 영상이 없습니다. 5개 확인 항목과 사람 판정을 먼저 완료해 주세요.');
      return;
    }
    const packet = {
      packetType: 'GABA_EDUCATION_PUBLICATION_REQUEST',
      version: 1,
      requestedAt: new Date().toISOString(),
      checkedAt: presenterMonitor?.checkedAt ?? 'pending',
      items: releaseReadyVideos.map(video => {
        const draft = videoReviewDrafts[video.id]!;
        return {
          id: video.id,
          url: video.url,
          title: video.title,
          publicTitle: video.publicTitle ?? video.title,
          publicSummary: video.publicSummary ?? video.summary,
          publicPersonSummary: video.publicPersonSummary ?? video.personSummary,
          publicOperatorSentence: video.publicOperatorSentence ?? video.operatorSentence,
          channel: video.channel,
          speaker: video.speaker,
          currentStatus: video.status,
          reviewer: draft.reviewer.trim(),
          role: draft.role,
          decision: draft.decision,
          timestamps: draft.timestamps.trim(),
          transcriptExcerpt: draft.transcriptExcerpt.trim(),
          notes: draft.notes.trim(),
          checks: Object.fromEntries(VIDEO_REVIEW_CHECKS.map(check => [check.key, Boolean(draft[check.key])])),
          boundary: '이 파일은 PUBLISH_GENERAL 적용을 요청하는 사람 검토 결과이며, 공식 DB 상태·공개 배포는 별도 확인 후 반영합니다.',
        };
      }),
      boundary: 'AI-OPS는 이 요청 파일만으로 자동 공개하지 않습니다. PM·SCIENCE/MEDICAL·RIGHTS가 원문·주장·권리·공개 문장을 다시 확인한 뒤 사람이 공식 DB와 배포를 반영합니다.',
    };
    downloadJsonFile(`gaba-education-publication-request-${packet.checkedAt}.json`, packet);
    setVideoReviewMessage(`공개 요청 패킷을 저장했습니다. ${releaseReadyVideos.length}건을 사람 최종 확인으로 전달합니다.`);
  };

  const exportReviewHandoff = () => {
    if (!presenterMonitor) {
      setReviewHandoffMessage('발표자 자료를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const packet: ReviewHandoffPacket = {
      packetType: REVIEW_HANDOFF_PACKET_TYPE,
      version: 1,
      exportedAt: new Date().toISOString(),
      checkedAt: presenterMonitor.checkedAt,
      scope: {videoDb: presenterVideoDb.length, monitorCandidates: monitorCandidates.length, tfRoles: presenterTfRoles.length},
      videoReviewDrafts,
      monitorReviewDrafts,
      sourceReviewDrafts,
      tfAssignments,
      tfMeetingDraft,
      tfDiscussionDrafts,
      fieldSessionDrafts,
      boundary: '브라우저 로컬 감리·회의 초안의 팀 전달용 사본이며 공식 DB 상태·공개 승인·과학/의학·권리 판정을 의미하지 않습니다.',
    };
    downloadJsonFile(`gaba-education-review-handoff-${presenterMonitor.checkedAt}.json`, packet);
    setReviewHandoffMessage('감리 패킷 JSON을 저장했습니다. 공식 승인 상태는 바뀌지 않습니다.');
  };

  const importReviewHandoff = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!isRecord(parsed) || parsed.packetType !== REVIEW_HANDOFF_PACKET_TYPE || parsed.version !== 1) {
        throw new Error('unsupported packet');
      }
      const importedVideoDrafts = normaliseReviewDrafts(parsed.videoReviewDrafts);
      const importedMonitorDrafts = normaliseReviewDrafts(parsed.monitorReviewDrafts);
      const importedSourceDrafts = normaliseSourceReviewDrafts(parsed.sourceReviewDrafts);
      const importedAssignments = normaliseTfAssignments(parsed.tfAssignments);
      const importedDiscussionDrafts = normaliseTfDiscussionDrafts(parsed.tfDiscussionDrafts);
      const importedFieldSessionDrafts = normaliseFieldSessionDrafts(parsed.fieldSessionDrafts);
      const nextVideoDrafts = {...videoReviewDrafts, ...importedVideoDrafts};
      const nextMonitorDrafts = {...monitorReviewDrafts, ...importedMonitorDrafts};
      const nextSourceDrafts = {...sourceReviewDrafts, ...importedSourceDrafts};
      const nextAssignments = {...tfAssignments, ...importedAssignments};
      const nextDiscussionDrafts = {...tfDiscussionDrafts, ...importedDiscussionDrafts};
      const nextFieldSessionDrafts = {...fieldSessionDrafts, ...importedFieldSessionDrafts};
      const nextMeetingDraft = typeof parsed.tfMeetingDraft === 'string' ? parsed.tfMeetingDraft : tfMeetingDraft;
      setVideoReviewDrafts(nextVideoDrafts);
      setMonitorReviewDrafts(nextMonitorDrafts);
      setSourceReviewDrafts(nextSourceDrafts);
      setTfAssignments(nextAssignments);
      setTfMeetingDraft(nextMeetingDraft);
      setTfDiscussionDrafts(nextDiscussionDrafts);
      setFieldSessionDrafts(nextFieldSessionDrafts);
      persistVideoReviewDrafts(nextVideoDrafts);
      persistMonitorReviewDrafts(nextMonitorDrafts);
      persistSourceReviewDrafts(nextSourceDrafts);
      persistTfDraft(nextAssignments, nextMeetingDraft);
      persistTfDiscussionDrafts(nextDiscussionDrafts);
      persistFieldSessionDrafts(nextFieldSessionDrafts);
      setReviewHandoffMessage(`감리 패킷을 병합했습니다. 영상 ${Object.keys(importedVideoDrafts).length}건 · 신규 후보 ${Object.keys(importedMonitorDrafts).length}건 · 출처 ${Object.keys(importedSourceDrafts).length}건 · 토론 ${Object.keys(importedDiscussionDrafts).length}건 · 현장 ${Object.keys(importedFieldSessionDrafts).length}건`);
    } catch {
      setReviewHandoffMessage('불러오지 못했습니다. 이 사이트에서 저장한 감리 패킷 JSON인지 확인해 주세요.');
    }
  };

  const copyIncompleteVideoAuditQueue = async () => {
    const lines = [
      'GABA 영상 감리 진행 필요 목록',
      `미완료 후보 ${incompleteAuditVideos.length}건`,
      '',
      ...incompleteAuditVideos.map((video, index) => {
        const completed = VIDEO_REVIEW_CHECKS.filter(check => videoReviewDrafts[video.id]?.[check.key]).length;
        return `${index + 1}. ${video.id} · ${video.title} · ${completed}/${VIDEO_REVIEW_CHECKS.length} 확인 · 상태 ${VIDEO_STATUS_LABELS[video.status]} · 다음 행동: ${video.audit.nextAction}`;
      }),
      '',
      '※ 브라우저 로컬 감리 초안의 미완료 목록입니다. 원문·자막·화자·권리·주장 범위 확인 전에는 공개 승인이나 권위 승인으로 보지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setVideoReviewMessage('미완료 감리 목록을 복사했습니다.');
    } catch {
      setVideoReviewMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyDailyMonitorBrief = async () => {
    if (!presenterMonitor) {
      setMonitorCopyMessage('발표자 자료를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const snapshot = presenterMonitor;
    const scheduleStatus = getMonitorScheduleStatus(snapshot);
    const lines = [
      'GABA Shorts 일일 감리 요약',
      `확인일: ${snapshot.checkedAt}`,
      `자동화 상태: ${scheduleStatus.label} · 마지막 실행 출처: ${snapshot.runOrigin} · 다음 예약: ${snapshot.scheduleKst}`,
      `수집 범위: 채널 ${snapshot.sourceChannels}/${snapshot.registeredChannels} · 검색어 ${snapshot.discoveryQueries}/${snapshot.totalDiscoveryQueries}`,
      `검토 대기: ${snapshot.pendingReview}건 · SCIENCE/MEDICAL 우선: ${snapshot.scienceMedicalPriority}건 · 오늘 신규 후보(누적): ${snapshot.newCandidates}건 · 이번 실행 신규 후보: ${snapshot.newCandidatesThisRun}건`,
      `제품·브랜드 신호로 일반 GABA 공개 큐에서 자동 제외: ${snapshot.productBrandQuarantine}건`,
      `오늘의 다음 행동: ${snapshot.pendingQueue[0]?.nextAction ?? '검토 대기 후보를 확인'}`,
      `자동 공개: ${snapshot.autoPublish}건 · 자동 공개는 사람 승인 전 0건 유지`,
      `등록 영상 링크: ${snapshot.registeredVideoLinksHealthy}/${snapshot.registeredVideoLinksChecked} · 경고 ${snapshot.registeredVideoLinkWarnings}건`,
      `권위·연구 출처 링크: ${snapshot.registeredEvidenceLinksHealthy}/${snapshot.registeredEvidenceLinksChecked} · 경고 ${snapshot.registeredEvidenceLinkWarnings}건`,
      `메타데이터: ${snapshot.registeredVideoMetadataHealthy}/${snapshot.registeredVideoMetadataChecked} · 경고 ${snapshot.registeredVideoMetadataWarnings}건`,
      `자막 트랙: ${snapshot.registeredVideoCaptionTracksAvailable}/${snapshot.registeredVideoCaptionTracksChecked} · 경고 ${snapshot.registeredVideoCaptionTrackWarnings}건`,
      `자막 본문: ${snapshot.registeredVideoCaptionBodiesAvailable}/${snapshot.registeredVideoCaptionBodiesChecked} · 경고 ${snapshot.registeredVideoCaptionBodyWarnings}건 · HTTP 429 접근 제한 ${snapshot.registeredVideoCaptionBodyRateLimited}건`,
      `팀 리뷰 로그: ${snapshot.reviewLogUrl}`,
      `메타데이터 상세 감사: ${snapshot.metadataAuditUrl}`,
      `자막 상세 감사: ${snapshot.captionAuditUrl}`,
      `수동 감리 실행 화면: ${MONITOR_WORKFLOW_URL}`,
      '',
      '오늘 먼저 검토할 후보',
      ...snapshot.pendingQueue.slice(0, 5).map((candidate, index) => `${index + 1}. ${candidate.title} · ${candidate.priority} · 다음 행동: ${candidate.nextAction}`),
      '',
      '권위 후보 확인 전 큐',
      ...snapshot.authorityQueue.slice(0, 5).map((candidate, index) => `${index + 1}. ${candidate.title} · ${AUTHORITY_BASIS_LABELS[candidate.authorityBasis]} · ${candidate.signals.join(' · ')} · 다음 행동: ${candidate.nextAction}`),
      '',
      '제품·브랜드 신호 격리 큐',
      ...snapshot.productBrandQueue.slice(0, 5).map((candidate, index) => `${index + 1}. ${candidate.title} · ${candidate.signals.join(' · ')} · 일반 GABA 공개 큐에서 자동 제외 · 다음 행동: ${candidate.nextAction}`),
      '',
      '※ 제목·공개 설명 기반의 업무 우선순위입니다. 원문·자막·화자·근거·권리 확인 전에는 권위 승인이나 공개 승인으로 보지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setMonitorCopyMessage('회의용 일일 감리 요약을 복사했습니다.');
    } catch {
      setMonitorCopyMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const exportMonitorQueueCsv = () => {
    if (!presenterMonitor) {
      setMonitorCopyMessage('발표자 자료를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const queue = Array.from(new Map([...presenterMonitor.pendingQueue, ...presenterMonitor.authorityQueue, ...presenterMonitor.productBrandQueue].map(candidate => [candidate.id, candidate])).values());
    const headers = ['ID', '제목', '발견 경로', '우선순위', '권위 신호 구분', '공개 큐 분류', '주의 신호', '첫 담당', '다음 행동', '상태'];
    const rows = queue.map(candidate => [
      candidate.id,
      candidate.title,
      candidate.channel,
      'priority' in candidate ? candidate.priority : '권위 후보 확인 전',
      'authorityBasis' in candidate ? AUTHORITY_BASIS_LABELS[candidate.authorityBasis] : '',
      candidate.publicationGate === 'PRODUCT_BRAND_QUARANTINE' ? '제품·브랜드 공개 큐 제외' : '일반 교육 검토',
      candidate.signals.join(' · '),
      'reviewer' in candidate ? candidate.reviewer : '',
      candidate.nextAction,
      'PENDING_REVIEW',
    ]);
    downloadCsvFile(`gaba-shorts-review-queue-${presenterMonitor.checkedAt}.csv`, [headers, ...rows]);
    setMonitorCopyMessage('감리 큐 CSV를 내려받았습니다. 후보는 공개 승인되지 않았습니다.');
  };

  const updateTfAssignment = (roleId: string, field: 'lead' | 'backup', value: string) => {
    const next = {...tfAssignments, [roleId]: {...tfAssignments[roleId], [field]: value}};
    setTfAssignments(next);
    persistTfDraft(next, tfMeetingDraft);
    setTfAssignmentMessage('이 브라우저에 업무 배정 초안을 저장했습니다.');
  };

  const updateTfMeetingDraft = (value: string) => {
    setTfMeetingDraft(value);
    persistTfDraft(tfAssignments, value);
    setTfAssignmentMessage('이 브라우저에 첫 회의 초안을 저장했습니다.');
  };

  const updateTfDiscussionDraft = <K extends keyof TfDiscussionDraft>(discussionId: string, field: K, value: TfDiscussionDraft[K]) => {
    const current = tfDiscussionDrafts[discussionId] ?? makeEmptyTfDiscussionDraft();
    const nextDraft = {...current, [field]: value, updatedAt: new Date().toISOString()};
    const next = {...tfDiscussionDrafts, [discussionId]: nextDraft};
    setTfDiscussionDrafts(next);
    persistTfDiscussionDrafts(next);
    setTfDiscussionDraftMessage('토론 기록 초안을 저장했습니다.');
  };

  const updateFieldSessionDraft = <K extends keyof FieldSessionDraft>(scenarioId: FieldSessionScenarioId, field: K, value: FieldSessionDraft[K]) => {
    const current = fieldSessionDrafts[scenarioId] ?? makeEmptyFieldSessionDraft();
    const nextDraft = {...current, [field]: value, updatedAt: new Date().toISOString()};
    const next = {...fieldSessionDrafts, [scenarioId]: nextDraft};
    setFieldSessionDrafts(next);
    persistFieldSessionDrafts(next);
    setFieldSessionMessage('현장 세션 기록을 저장했습니다. 실제 현장 PASS는 별도 검증이 필요합니다.');
  };

  const copyTfAssignmentDraft = async () => {
    const lines = [
      'GABA 교육 TF 업무 배정 초안',
      `첫 회의: ${tfMeetingDraft.trim() || '미정'}`,
      '',
      ...presenterTfRoles.map(role => {
        const assignment = tfAssignments[role.id];
        return `- ${role.id} ${role.title}: 주 담당 ${assignment?.lead?.trim() || '미배정'} · 백업 ${assignment?.backup?.trim() || '미배정'}`;
      }),
      '',
      '※ 이 내용은 브라우저에서 만든 초안이며, 공식 역할 배정·과학 검토·공개 승인을 의미하지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setTfAssignmentMessage('업무 배정 초안을 복사했습니다.');
    } catch {
      setTfAssignmentMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyTfDiscussionBrief = async () => {
    const lines = [
      '일반 GABA 교육 TF 오늘의 토론 논점',
      ...presenterTfDiscussionItems.map((item, index) => {
        const draft = tfDiscussionDrafts[item.id] ?? makeEmptyTfDiscussionDraft();
        const decision = TF_DISCUSSION_DECISIONS.find(option => option.id === draft.decision)?.label ?? '아직 결정하지 않음';
        return [
          `${index + 1}. ${item.id} · ${item.issue}`,
          `상태: ${item.status} · 다음 담당: ${item.nextOwner}`,
          `필요 증거: ${item.evidence}`,
          `종료 조건: ${item.exit}`,
          `회의 결정 초안: ${decision} · 담당: ${draft.owner.trim() || '미입력'} · 기한: ${draft.due.trim() || '미입력'}`,
          `팀 메모: ${draft.notes.trim() || '미입력'}`,
        ].join('\n');
      }),
      '',
      '토론 순서: 문제 → 관점 → 증거 → 결정 또는 HOLD → 다음 담당·기한·종료 조건',
      '※ 브라우저 로컬 토론 기록 초안이며 제품·후기·판매 문구가 아닌 일반 GABA 교육 범위의 팀 토론 자료입니다. 공식 공개 승인이나 과학·의학·권리 판정을 의미하지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n\n'));
      setTfDiscussionMessage('오늘의 토론 논점을 복사했습니다.');
    } catch {
      setTfDiscussionMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyFieldSessionDrafts = async () => {
    const lines = [
      '일반 GABA 교육 A/B/C 현장 세션 기록 초안',
      '※ 고객 이름·연락처·건강 상태·복용 약은 기록하지 않습니다. 이 기록은 현장 검증 입력이며 최종 승인이나 사업 성과를 의미하지 않습니다.',
      '',
      ...FIELD_SESSION_SCENARIOS.map(scenario => {
        const draft = fieldSessionDrafts[scenario.id] ?? makeEmptyFieldSessionDraft();
        const clarity = FIELD_SESSION_CLARITY_OPTIONS.find(option => option.id === draft.clarity)?.label ?? '아직 기록하지 않음';
        const exit = draft.externalExit === 'NONE' ? '없음' : draft.externalExit === 'YES' ? '있음' : '아직 기록하지 않음';
        return [
          `${scenario.id}. ${scenario.title}`,
          `목표: ${scenario.goal}`,
          `설명자: ${draft.facilitator.trim() || '미입력'} · 관찰자: ${draft.observer.trim() || '미입력'} · 기기/브라우저: ${draft.device.trim() || '미입력'}`,
          `다음 행동 명확도: ${clarity} · 첫 다음 행동: ${draft.firstActionSeconds.trim() || '미입력'}초 · 외부 선행 이탈: ${exit}`,
          `오해·문제: ${draft.misunderstanding.trim() || '미입력'}`,
          `다음 액션: ${draft.nextAction.trim() || '미입력'} · 담당: ${draft.owner.trim() || '미입력'} · 기한: ${draft.due.trim() || '미입력'}`,
          '',
        ].join('\n');
      }),
      '판정 기준: A/B/C 각 명확도 4점 이상 · 외부 선행 이탈 0건 · 검토 전 영상 공개 오해 0건 · P0 오류 0건',
    ];
    try {
      await copyText(lines.join('\n'));
      setFieldSessionMessage('A/B/C 현장 기록 초안을 복사했습니다. 실제 세션 결과는 별도 반영해야 합니다.');
    } catch {
      setFieldSessionMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyPresenterAnswer = async (label: string, answer: string) => {
    try {
      await copyText(answer);
      setPresenterCopyMessage(`${label} 답변을 복사했습니다.`);
    } catch {
      setPresenterCopyMessage(`${label} 답변 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.`);
    }
  };

  const copyPresenterSceneBrief = async () => {
    const slide = slides[active];
    const lines = [
      `일반 GABA 교육 설명문 · ${slide.label}`,
      `핵심 메시지: ${slide.title}`,
      `설명: ${slide.body}`,
      `설명 경계: ${slide.presenterBoundary}`,
      '',
      '※ 일반 교육용 설명문이며 개인 진단·치료·특정 제품의 효능을 의미하지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setPresenterCopyMessage('현재 장면 설명문을 복사했습니다.');
    } catch {
      setPresenterCopyMessage('설명문 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyPresenterFullBrief = async () => {
    const lines = [
      '일반 GABA 교육 3분 설명 흐름',
      '※ 제품·후기·판매 정보 없이 GABA의 일반 기능과 연구 범위를 설명하는 발표용 초안입니다.',
      '',
      ...slides.flatMap((slide, index) => [
        `${String(index + 1).padStart(2, '0')}. ${slide.label}`,
        `핵심 메시지: ${slide.title}`,
        `설명: ${slide.body}`,
        `설명 경계: ${slide.presenterBoundary}`,
        '',
      ]),
      '발표 마무리 경계: 일반 GABA 연구는 연구 조건과 한계를 함께 설명하며 특정 제품의 효능·개인의 진단·치료로 확장하지 않습니다.',
    ];
    try {
      await copyText(lines.join('\n'));
      setPresenterCopyMessage('전체 교육 흐름 설명문을 복사했습니다.');
    } catch {
      setPresenterCopyMessage('전체 설명문 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyVideoOperatorSentence = async (video: GabaVideoRecord) => {
    try {
      await copyText(video.operatorSentence);
      setVideoCopyMessage('사업자 설명 문장을 복사했습니다.');
    } catch {
      setVideoCopyMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const getVideoCustomerBrief = (video: GabaVideoRecord) => {
    const approvedForCustomerSummary = video.status === 'PUBLISH_GENERAL';
    const customerStatus = approvedForCustomerSummary ? '일반 교육 공개 승인' : PUBLIC_VIDEO_STATUS_LABEL;
    return [
      approvedForCustomerSummary ? `이 영상은 ${video.title}을(를) 다룹니다.` : '이 영상은 GABA 관련 영상 검토 후보입니다.',
      approvedForCustomerSummary ? video.summary : '현재 요약은 제목·공개 설명 기반의 예비 정보이며, 원문·자막·발언 구간 확인 전입니다.',
      `${video.operatorSentence} 현재 상태는 ${customerStatus}이며, 이 내용을 특정 제품의 효능이나 개인의 결과로 확대해 설명하지 않습니다.`,
    ];
  };

  const copyVideoCustomerBrief = async (video: GabaVideoRecord) => {
    const brief = getVideoCustomerBrief(video).join(' ');
    try {
      await copyText(brief);
      setVideoCopyMessage('고객 설명 3문장을 복사했습니다.');
    } catch {
      setVideoCopyMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const getPresenterVideoLink = (videoId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'presenter');
    url.searchParams.set('card', String(active + 1));
    url.searchParams.set('video', videoId);
    url.hash = 'video-showcase';
    return url.toString();
  };

  const copyVideoReviewLink = async (video: GabaVideoRecord) => {
    try {
      await copyText(getPresenterVideoLink(video.id));
      setVideoCopyMessage('이 영상 감리 링크를 복사했습니다.');
    } catch {
      setVideoCopyMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const getCustomerVideoLink = (videoId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    url.searchParams.delete('presenter');
    url.searchParams.delete('card');
    url.searchParams.set('video', videoId);
    url.hash = 'video-showcase';
    return url.toString();
  };

  const shareShowcaseVideo = async () => {
    if (!showcaseVideo) return;
    const shareRequest = ++showcaseShareRequestRef.current;
    const link = getCustomerVideoLink(showcaseVideo.id);
    try {
      if (navigator.share) {
        await navigator.share({title: 'GABA 영상 검토 후보', text: '이 영상부터 GABA 일반 교육 흐름을 확인해 보세요.', url: link});
        if (shareRequest === showcaseShareRequestRef.current) setShowcaseShareMessage('이 영상부터 보는 고객용 링크를 공유했습니다.');
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (shareRequest === showcaseShareRequestRef.current) setShowcaseShareMessage('영상 링크 공유를 취소했습니다.');
        return;
      }
    }
    try {
      await copyText(link);
      if (shareRequest === showcaseShareRequestRef.current) setShowcaseShareMessage('이 영상부터 보는 고객용 링크를 복사했습니다.');
    } catch {
      if (shareRequest === showcaseShareRequestRef.current) setShowcaseShareMessage('영상 링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const getCustomerCardLink = (index: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('card', String(index + 1));
    url.searchParams.delete('mode');
    url.searchParams.delete('presenter');
    url.hash = 'story';
    return url.toString();
  };

  const shareCardLink = async () => {
    const shareRequest = ++shareRequestRef.current;
    const link = getCustomerCardLink(active);
    setShareUrl(link);
    if (navigator.share) {
      try {
        await navigator.share({title: 'GABA 한 흐름으로 알아보기', text: '현재 장면부터 이어서 확인해 보세요.', url: link});
        if (shareRequest === shareRequestRef.current) setShareMessage('고객용 링크를 공유했습니다. (발표자 모드 제외)');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          if (shareRequest === shareRequestRef.current) setShareMessage('고객용 링크 공유를 취소했습니다.');
          return;
        }
      }
    }
    try {
      await copyText(link);
      if (shareRequest === shareRequestRef.current) setShareMessage('고객용 링크를 복사했습니다. (발표자 모드 제외)');
    } catch {
      if (shareRequest === shareRequestRef.current) setShareMessage('고객용 링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copySharedCardLink = async () => {
    if (!shareUrl) return;
    const shareRequest = shareRequestRef.current;
    try {
      await copyText(shareUrl);
      if (shareRequest === shareRequestRef.current) setShareMessage('고객용 링크를 복사했습니다. (발표자 모드 제외)');
    } catch {
      if (shareRequest === shareRequestRef.current) setShareMessage('고객용 링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copyPanelCardLink = async () => {
    const shareRequest = ++shareRequestRef.current;
    try {
      await copyText(getCustomerCardLink(panelSourceIndex ?? active));
      if (shareRequest === shareRequestRef.current) setPanelShareMessage('고객용 장면 링크를 복사했습니다.');
    } catch {
      if (shareRequest === shareRequestRef.current) setPanelShareMessage('고객용 장면 링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const closePanel = (restoreFocus = true) => {
    const sourceIndex = panelSourceIndex;
    const returnElement = panelReturnRef.current;
    setOpenPanel(null);
    setPanelSourceIndex(null);
    setPanelVideoId(null);
    setVideoFilter('ALL');
    setVideoQuery('');
    setPanelShareMessage('');
    panelReturnRef.current = null;
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        if (returnElement?.isConnected) returnElement.focus();
        else if (sourceIndex !== null) panelTriggerRefs.current[sourceIndex]?.focus();
      });
    }
  };

  const continueToNextCard = () => {
    const sourceIndex = panelSourceIndex ?? active;
    const next = Math.min(slides.length - 1, sourceIndex + 1);
    const returnElement = panelReturnRef.current;
    closePanel(false);
    goTo(next);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const focusTarget = next === sourceIndex && returnElement?.isConnected
          ? returnElement
          : slideRefs.current[next]?.querySelector<HTMLElement>('h3')
            ?? (presentationMode ? presentationRef.current?.querySelector<HTMLElement>('.story-presentation-toggle') : null)
            ?? panelTriggerRefs.current[next]
            ?? railRef.current;
        focusTarget?.focus();
      });
    });
  };

  const continueToNextVideo = () => {
    if (!nextVideo) return;
    setPanelVideoId(nextVideo.id);
    setVideoCopyMessage('');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLElement>('.video-db-detail h3')?.focus();
      });
    });
  };

  const selectReviewBatchVideo = (videoId: string) => {
    setPanelVideoId(videoId);
    setVideoCopyMessage('');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLElement>('.video-db-detail h3')?.focus();
      });
    });
  };

  const openInfoPanel = (index: number, panel: PanelKey, returnElement?: HTMLElement | null) => {
    panelReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPanelSourceIndex(index);
    setPanelVideoId(panel === 'video' && !presentationMode ? publicVideo?.id ?? null : null);
    setVideoFilter('ALL');
    setVideoQuery('');
    setPanelShareMessage('');
    setOpenPanel(panel);
  };

  const openVideoPanel = (returnElement?: HTMLElement | null, videoId?: string) => {
    panelReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPanelSourceIndex(active);
    setPanelVideoId(videoId ?? null);
    setVideoFilter('ALL');
    setVideoQuery('');
    setPanelShareMessage('');
    setOpenPanel('video');
  };

  const openTodayVideoReview = () => {
    panelReturnRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPanelSourceIndex(active);
    setPanelVideoId(reviewPriorityVideos[0]?.id ?? null);
    setVideoFilter('ALL');
    setVideoQuery('');
    setPanelShareMessage('');
    setOpenPanel('video');
  };

  const revealOpsSection = (selector: string) => {
    const details = document.querySelector<HTMLDetailsElement>(selector);
    if (!details) return;
    details.open = true;
    window.requestAnimationFrame(() => details.scrollIntoView({block: 'nearest', behavior: 'smooth'}));
  };

  const selectShowcaseVideo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(SHARED_GABA_VIDEOS.length - 1, index));
    const nextVideo = SHARED_GABA_VIDEOS[nextIndex];
    setShowcaseVideoIndex(nextIndex);
    setShowcasePlayerStartedId(null);
    setShowcaseShareMessage('');
    setPreviewImageError(false);
    if (nextVideo) {
      const url = new URL(window.location.href);
      url.searchParams.set('video', nextVideo.id);
      url.hash = 'video-showcase';
      window.history.replaceState({}, '', url);
    }
  };

  const selectApprovedVideo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(approvedVideos.length - 1, index));
    setApprovedVideoIndex(nextIndex);
    setPreviewImageError(false);
  };

  const enterPresentation = (returnElement?: HTMLElement | null, startIndex = active) => {
    const start = Math.max(0, Math.min(slides.length - 1, startIndex));
    presentationReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    presentationModeRef.current = true;
    setPresentationMode(true);
    if (start !== active) goTo(start);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'presenter');
    url.searchParams.set('card', String(start + 1));
    url.hash = 'story';
    window.history.replaceState({}, '', url);
  };

  const exitPresentation = () => {
    const currentActive = active;
    const returnElement = presentationReturnRef.current;
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    url.searchParams.delete('presenter');
    window.history.replaceState({}, '', url);
    setPresentationMode(false);
    window.requestAnimationFrame(() => {
      presentationModeRef.current = false;
      setActive(currentActive);
      slideRefs.current[currentActive]?.scrollIntoView({behavior: 'auto', inline: 'nearest', block: 'start'});
      if (returnElement?.isConnected) returnElement.focus();
      presentationReturnRef.current = null;
    });
  };

  useEffect(() => {
    if (!openPanel) return;
    const previousOverflow = document.body.style.overflow;
    const storyOutside = Array.from(presentationRef.current?.children ?? [])
      .filter(element => !element.classList.contains('info-layer')) as HTMLElement[];
    const previousState = storyOutside.map(element => ({element, inert: element.getAttribute('inert'), ariaHidden: element.getAttribute('aria-hidden')}));
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('summary, a[href], button:not([disabled]), input:not([disabled])'))
        .filter(element => !element.closest('details:not([open])') || element.matches('summary'));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0]?.focus(); }
    };
    storyOutside.forEach(element => { element.setAttribute('inert', ''); element.setAttribute('aria-hidden', 'true'); });
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => panelCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      previousState.forEach(({element, inert, ariaHidden}) => {
        if (inert === null) element.removeAttribute('inert'); else element.setAttribute('inert', inert);
        if (ariaHidden === null) element.removeAttribute('aria-hidden'); else element.setAttribute('aria-hidden', ariaHidden);
      });
    };
  }, [openPanel]);

  useEffect(() => {
    if (!presentationMode) return;
    const outside = [
      document.querySelector<HTMLElement>('.site-header'),
      document.querySelector<HTMLElement>('.intro'),
      document.querySelector<HTMLElement>('.guardrail'),
      document.querySelector<HTMLElement>('.site-footer'),
    ].filter(Boolean) as HTMLElement[];
    const previousState = outside.map(element => ({element, inert: element.getAttribute('inert'), ariaHidden: element.getAttribute('aria-hidden')}));
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !openPanel) { exitPresentation(); return; }
      if (openPanel) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); goTo(active + 1); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goTo(active - 1); }
      if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
    };
    outside.forEach(element => { element.setAttribute('inert', ''); element.setAttribute('aria-hidden', 'true'); });
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
      previousState.forEach(({element, inert, ariaHidden}) => {
        if (inert === null) element.removeAttribute('inert'); else element.setAttribute('inert', inert);
        if (ariaHidden === null) element.removeAttribute('aria-hidden'); else element.setAttribute('aria-hidden', ariaHidden);
      });
    };
  }, [presentationMode, openPanel, active]);

  useEffect(() => {
    setShareUrl('');
    setShareMessage('');
    setPresenterCopyMessage('');
  }, [active]);

  const panelTitle = openPanel === 'research' ? '일반 GABA 연구를 읽는 방법' : openPanel === 'video' ? (presentationMode ? 'GABA 영상 DB 검토' : 'GABA 영상 보기') : 'TF 운영 보드';
  const openExternal = openPanel === 'research' ? RESEARCH_URL : openPanel === 'video' ? selectedVideo?.url ?? (presentationMode ? '' : publicVideo?.url ?? '') : '';
  const panelExternalLabel = openPanel === 'research' ? '연구 원문을 새 탭에서 보기' : presentationMode ? '선택 영상 원문 보기' : 'YouTube 원문 보기';
  const panelSource = panelSourceIndex ?? active;
  const panelNext = slides[Math.min(slides.length - 1, panelSource + 1)];
  const panelNextAction = panelSource < slides.length - 1
    ? `다음 장면: ${panelNext.label} →`
    : presentationMode ? '장면 흐름으로 돌아가기' : '읽기 흐름으로 돌아가기';
  const videoNextAction = nextVideo ? presentationMode ? `다음 영상: ${nextVideo.id} →` : '다음 영상으로 이어보기 →' : '영상 목록으로 돌아가기';
  const introSection = <section className="intro" aria-labelledby="page-title">
    <div className="intro-copy">
      <p className="eyebrow">일반 GABA 소개</p>
      <h1 id="page-title">가바(GABA),<br /><em>무엇이고</em><br />어떤 일을 할까요?</h1>
      <p className="intro-body">우리 몸에서 사용하는 신경전달물질 GABA의 역할과 수면·스트레스 관련 연구를 8장면으로 쉽게 설명합니다.</p>
      <p className="separation-note">제품이 아니라 GABA라는 물질 자체를 이해하는 데 초점을 맞춘 일반 소개 자료입니다.</p>
      <div className="intro-entry-actions">
        <a className="text-button intro-primary-button" href="#story">첫 장면부터 읽기 <span aria-hidden="true">↓</span></a>
        <button type="button" className="text-button intro-presentation-button" onClick={event => enterPresentation(event.currentTarget, 0)}>발표자용 설명 시작 <span aria-hidden="true">↗</span></button>
      </div>
    </div>
    <div className="intro-orbit" aria-hidden="true"><span>GABA</span><i>일상<br />이해</i></div>
  </section>;
  const consumerStory = <div
    id="consumer-reel"
    className="consumer-reel"
    onWheel={handleConsumerWheel}
    onTouchStart={handleConsumerTouchStart}
    onTouchEnd={handleConsumerTouchEnd}
    onKeyDown={handleConsumerKeyDown}
    tabIndex={0}
    role="region"
    aria-roledescription="세로 리더"
    aria-labelledby="story-title"
  >
    <div className="consumer-reel__topline">
      <div>
        <p className="consumer-reel__context">GABA 알아보기</p>
        <h1 id="story-title" className="consumer-reel__lead-title">GABA를 모르는 사람도<br /><em>3분 안에 이해하는 흐름</em></h1>
        <p className="consumer-reel__promise">일상에서 시작해 GABA와 연구까지 한 장면씩 읽어보세요.</p>
      </div>
      <div className="consumer-reel__counter" aria-live="polite"><strong>{String(active + 1).padStart(2, '0')}</strong><span>/ {String(slides.length).padStart(2, '0')}</span></div>
      <button type="button" className="consumer-reel__share" onClick={shareCardLink}>공유 <span aria-hidden="true">↗</span></button>
    </div>

    <nav className="consumer-reel__progress" aria-label="GABA 소개 장면 바로가기">
      <span className="consumer-reel__progress-caption">오늘의 흐름</span>
      <ol>
        {slides.map((slide, index) => <li key={slide.id}>
          <button type="button" className={index === active ? 'is-active' : ''} aria-current={index === active ? 'step' : undefined} aria-label={`${String(index + 1).padStart(2, '0')}번 장면 ${slide.label} 보기`} onClick={() => goTo(index, 'auto')}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><strong>{slide.label}</strong>
          </button>
        </li>)}
      </ol>
    </nav>

    <div id="story-scene-hook" className="consumer-reel__stage story-reader-stream" aria-live="polite">
      {slides.map((slide, index) => <article
        key={slide.id}
        id={`story-scene-${slide.id}`}
        ref={element => {slideRefs.current[index] = element;}}
        data-index={index}
        className={`consumer-reel__scene story-reader-scene story-reader-scene--${slide.tone}${index === active ? ' is-active' : ' story-reader-scene--hidden'}`}
        aria-hidden={index === active ? undefined : true}
        inert={index === active ? undefined : true}
        aria-labelledby={`reader-slide-${slide.id}`}
      >
        <div className="consumer-reel__scene-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
        <div className="consumer-reel__copy">
          <p className="consumer-reel__label">{slide.label}</p>
          <h2 id={`reader-slide-${slide.id}`} tabIndex={-1}>{slide.title}</h2>
          <p>{slide.body}</p>
          {slide.link ? <button type="button" className="reader-link consumer-reel__evidence-link" ref={element => {panelTriggerRefs.current[index] = element;}} onClick={event => openInfoPanel(index, slide.link!.panel, event.currentTarget)}>{slide.link.label} <span aria-hidden="true">↗</span></button> : null}
          {slide.note ? <p className="consumer-reel__note">{slide.note}</p> : null}
        </div>
        {slide.visual ? <div className="consumer-reel__visual" aria-hidden="true" style={{backgroundImage: `url("${slide.visual}")`}} /> : <div className="consumer-reel__visual consumer-reel__visual--quiet" aria-hidden="true" />}
      </article>)}
    </div>

    <div className="consumer-reel__footer">
      <div className="consumer-reel__evidence-note"><span aria-hidden="true">—</span><span>쉽게 보고, 출처로 확인</span></div>
      <div className="consumer-reel__gesture">위로 넘기거나 버튼을 눌러 계속 <span aria-hidden="true">↑</span></div>
      <p className="story-share-message" aria-live="polite">{shareMessage}</p>
      {shareUrl ? <div className="story-share-row"><input className="story-share-url" value={shareUrl} readOnly aria-label="고객에게 전달할 장면 링크" onFocus={event => event.currentTarget.select()} /><button type="button" className="story-share-copy-button" onClick={copySharedCardLink}>링크 복사</button></div> : null}
      <div className="story-reader-next consumer-reel__next" aria-live="polite">
        <div><span>{nextSlide ? '다음 장면' : '다음 섹션'}</span><strong>{nextSlide ? nextSlide.label : '영상으로 더 알아보기'}</strong></div>
        <div className="consumer-reel__next-actions">
          {nextSlide ? <button type="button" className="consumer-reel__next-button" onClick={() => goTo(active + 1)} aria-label={`다음 장면 ${nextSlide.label} 보기`}>다음 장면 <span aria-hidden="true">→</span></button> : <a className="consumer-reel__next-button" href="#video-showcase">영상 요약으로 이어가기 <span aria-hidden="true">→</span></a>}
        </div>
      </div>
    </div>
  </div>;

  return <>
    <header className={`site-header${presentationMode ? '' : ' site-header--consumer'}`}>
      <a className="brand" href="#top">GABA<span>.</span></a>
      {presentationMode ? <p>일반 GABA 교육 자료</p> : <nav className="site-header__nav" aria-label="페이지 바로가기">
        <a href="#story">일상</a>
        <a href="#story-scene-gaba">GABA란</a>
        <a href="#story-scene-research">연구</a>
        <a href="#video-showcase">영상</a>
      </nav>}
    </header>

    <main id="top" className={presentationMode ? 'presenter-main' : 'consumer-main'}>
      {presentationMode ? introSection : null}

      <section id="story" ref={presentationRef} className={`story${presentationMode ? ' story--presentation' : ' story--reader'}`} role={presentationMode ? 'dialog' : undefined} aria-labelledby="story-title" aria-modal={presentationMode ? 'true' : undefined} aria-keyshortcuts={presentationMode ? 'ArrowLeft ArrowRight PageUp PageDown Home End Escape' : undefined}>
        {presentationMode ? <>
        <div className="story-heading">
          <div>
            <p className="eyebrow">장면마다 한 메시지</p>
            <h2 id="story-title">가바(GABA)를<br />8장면으로</h2>
          </div>
          <p>{presentationMode ? <>← → 또는 PageUp/PageDown으로 넘기고<br />Esc로 발표 모드를 종료하세요.</> : <>모바일에서는 위아래로 넘겨 보세요.<br />일상·기능·연구·영상은 각각 다른 정보입니다.</>}</p>
        </div>
        <nav ref={phaseNavRef} className="story-sequence" aria-label="장면 흐름 단계">
          {STORY_PHASES.map((phase, index) => <span key={phase.id} data-phase={phase.id} className={phase.id === activePhase.id ? 'is-active' : ''} aria-current={phase.id === activePhase.id ? 'step' : undefined}>
            {phase.label}{index < STORY_PHASES.length - 1 ? <i aria-hidden="true">→</i> : null}
          </span>)}
        </nav>
        <nav className="story-progress" aria-label="GABA 소개 장면 바로가기">
          {slides.map((slide, index) => <button
            key={slide.id}
            type="button"
            className={index === active ? 'is-active' : ''}
            aria-current={index === active ? 'step' : undefined}
            aria-label={`${String(index + 1).padStart(2, '0')}번 장면 ${slide.label} 보기`}
            onClick={() => goTo(index, 'auto')}
          ><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></button>)}
        </nav>
        <div className="story-controls">
          <span aria-live="polite" aria-label={`현재 ${active + 1}번째 장면, 총 ${slides.length}장`}>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div>
            {presentationMode ? <button type="button" className="story-start-button story-video-db-button" onClick={event => openVideoPanel(event.currentTarget)}>영상 DB</button> : null}
            {presentationMode ? <button type="button" className="story-start-button story-ops-board-button" onClick={event => openInfoPanel(active, 'ops', event.currentTarget)}>운영 보드</button> : null}
            <button type="button" className="story-nav-button story-prev-button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="이전 장면"><span aria-hidden="true">←</span><span className="nav-label">이전 장면</span></button>
            <button type="button" className="story-nav-button story-next-button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="다음 장면"><span className="nav-label">다음 장면</span><span aria-hidden="true">→</span></button>
            {presentationMode ? <>
              <button type="button" className="story-share-button" onClick={shareCardLink}>현재 장면 링크 공유</button>
              <button type="button" className="story-share-button story-presenter-copy-button" data-presenter-quick-copy onClick={copyPresenterSceneBrief}>설명문 복사</button>
              <button type="button" className="story-presentation-toggle" onClick={exitPresentation}>발표 모드 종료</button>
            </> : <details className="story-secondary-controls">
              <summary>더 보기 <span aria-hidden="true">＋</span></summary>
              <button type="button" className="story-share-button" onClick={shareCardLink}>현재 장면 링크 공유</button>
            </details>}
          </div>
        </div>
        <p className="story-share-message" aria-live="polite">{shareMessage}</p>
        {shareUrl ? <div className="story-share-row"><input className="story-share-url" value={shareUrl} readOnly aria-label="고객에게 전달할 장면 링크" onFocus={event => event.currentTarget.select()} /><button type="button" className="story-share-copy-button" onClick={copySharedCardLink}>고객용 링크 복사</button></div> : null}
        {presentationMode ? <>
          <p className="presenter-next-hint" aria-live="polite">{nextSlide ? <>다음 설명: <strong>{nextSlide.label}</strong></> : '마지막 설명 장면입니다.'}</p>
          <details className="presenter-note"><summary>발표자용 진행 포인트</summary><div className="presenter-note__grid"><div><strong>고객에게 물어보기</strong><p>{slides[active].presenterPrompt}</p></div><div><strong>이어서 말할 때</strong><p>{slides[active].presenterBoundary}</p></div></div><div className="presenter-note__actions"><button type="button" onClick={copyPresenterSceneBrief}>현재 장면 설명문 복사</button><button type="button" data-presenter-full-copy onClick={copyPresenterFullBrief}>전체 교육 흐름 복사</button></div></details>
          <details className="presenter-questions"><summary>자주 묻는 질문에 답하기</summary><div className="presenter-questions__list">{PRESENTER_QUESTIONS.map(question => <div key={question.label}><div className="presenter-questions__heading"><strong>{question.label}</strong><button type="button" className="presenter-answer-copy" onClick={() => copyPresenterAnswer(question.label, question.answer)}>답변 복사</button></div><p>{question.answer}</p></div>)}</div></details>
          <p className="presenter-copy-message" aria-live="polite">{presenterCopyMessage}</p>
        </> : null}
        <div className="story-rail" ref={railRef} onScroll={syncActiveFromRail} tabIndex={0} role="region" aria-roledescription="세로 피드" aria-label="GABA 소개 장면 흐름">
          {slides.map((slide, index) => <article
            key={slide.id}
            id={`story-card-${slide.id}`}
            ref={element => {slideRefs.current[index] = element;}}
            data-index={index}
            className={`story-card story-card--${slide.tone}${presentationMode && index !== active ? ' story-card--presentation-hidden' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')} ${slide.label}`}
            aria-hidden={index === active ? undefined : 'true'}
            inert={index === active ? undefined : true}
            aria-current={index === active ? 'true' : undefined}
            aria-labelledby={`slide-${slide.id}`}
            style={slide.visual ? {backgroundImage: `url("${slide.visual}")`} : undefined}
          >
            <div className="card-label"><span>{slide.label}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div className="card-content">
              <h3 id={`slide-${slide.id}`} tabIndex={-1}>{slide.title}</h3>
              <p>{slide.body}</p>
              {slide.link ? <button type="button" className="card-link" ref={element => {panelTriggerRefs.current[index] = element;}} onClick={event => openInfoPanel(index, slide.link!.panel, event.currentTarget)}>{slide.link.label} <span aria-hidden="true">＋</span></button> : null}
              {slide.links ? <div className="card-link-group" aria-label="더 확인할 정보">{slide.links.map(link => <button key={link.panel} type="button" className="card-link" ref={element => {panelTriggerRefs.current[index] = element;}} onClick={event => openInfoPanel(index, link.panel, event.currentTarget)}>{link.label} <span aria-hidden="true">＋</span></button>)}</div> : null}
              {slide.note ? <small>{slide.note}</small> : null}
            </div>
          </article>)}
        </div>
        <div className="story-dots" aria-hidden="true">{slides.map((slide, index) => <span key={slide.id} className={index === active ? 'active' : ''} />)}</div>
        {!presentationMode ? <div className="reel-next-bar" aria-live="polite">
          <div className="reel-next-bar__copy">
            <span>{active === 0 ? '아래로 넘겨 계속' : nextSlide ? '다음 장면' : '다음 섹션'}</span>
          <strong>{nextSlide ? nextSlide.label : '영상 검토 후보'}</strong>
          </div>
          {nextSlide ? <button type="button" className="reel-next-button" onClick={() => goTo(active + 1)} aria-label={`다음 장면 ${nextSlide.label} 보기`}>다음 장면 <span aria-hidden="true">↓</span></button> : <a className="reel-next-link" href="#video-showcase">영상 요약으로 이어가기 <span aria-hidden="true">↓</span></a>}
        </div> : null}
        </> : consumerStory}
        {openPanel ? <div className="info-layer" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) closePanel();}}>
          <aside className={`info-panel${openPanel === 'ops' ? ' info-panel--ops' : ''}${openPanel === 'video' && !presentationMode ? ' info-panel--consumer-video' : ''}`} ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="info-panel-title">
            <div className="info-panel__topline"><span>{presentationMode ? '장면 흐름 안에서 확인' : '읽기 흐름 안에서 확인'}</span><button ref={panelCloseRef} type="button" onClick={() => closePanel()} aria-label="정보 패널 닫기">×</button></div>
            <p className="eyebrow">{openPanel === 'research' ? '일반 GABA 연구' : openPanel === 'video' ? (presentationMode ? '영상 DB 감리' : 'GABA 영상') : '발표자 운영'}</p>
            <h2 id="info-panel-title">{panelTitle}</h2>
            {openPanel === 'research' ? <>
              <p>일반 GABA 연구에서 어떤 변화가 관찰됐는지, 그리고 그 결과를 어떻게 읽으면 되는지 쉽게 정리했습니다.</p>
              <p className="info-panel__verification"><strong>결과를 볼 때 함께 확인할 것</strong>누구를 대상으로, 얼마나 오래, 어떤 방식으로 살펴본 연구인지 확인하면 결과를 더 정확하게 이해할 수 있습니다.</p>
              <p className="info-panel__evidence">연결된 문헌고찰은 일반 GABA 섭취를 살펴본 14개 위약대조 인체시험을 종합했습니다. 일부 연구에서 스트레스·수면 관련 지표가 좋아지는 변화가 확인됐고, 연구마다 참여자·섭취량·기간·비교 방식이 달랐습니다.</p>
              <ul><li>누구를 대상으로 했는지</li><li>얼마나 오래 살펴봤는지</li><li>어떤 방식으로 비교했는지</li></ul>
              <p className="info-panel__boundary">GABA의 역할과 섭취 연구는 서로 다른 내용이므로, 각각의 출처와 조건을 따로 확인합니다.</p>
              <details className="info-panel__research-sources">
                <summary>참고한 연구·자료 보기 <span aria-hidden="true">＋</span></summary>
                <div className="research-source-list">
                  {RESEARCH_SOURCES.map(source => <article key={source.id}>
                    <p className="research-source-list__topic">{source.topic}</p>
                    <h3>{source.title}</h3>
                    <p>{source.summary}</p>
                    <p className="research-source-list__meta">{source.meta}</p>
                    <p className="research-source-list__boundary">{source.boundary}</p>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">원문 출처 보기 ↗</a>
                  </article>)}
                </div>
              </details>
              {presentationMode ? <details className="source-review-draft">
                <summary><span>과학 출처 사람 검토 초안</span><strong>{sourceReviewCompleted}/{RESEARCH_SOURCES.length} 완료 <span aria-hidden="true">＋</span></strong></summary>
                <div className="source-review-draft__body">
                  <p className="source-review-draft__note">SCIENCE·MEDICAL 담당자가 원문 범위·한계·공개 문장을 확인하는 브라우저 로컬 초안입니다. 입력만으로 `HUMAN_REVIEWED`나 공개 승인이 되지 않습니다.</p>
                  <div className="source-review-list">
                    {RESEARCH_SOURCES.map(source => {
                      const draft = sourceReviewDrafts[source.id] ?? makeEmptySourceReviewDraft();
                      const completed = draft.scopeChecked && draft.limitationChecked && draft.sentenceChecked;
                      return <article key={source.id} className={completed ? 'is-complete' : ''}>
                        <div className="source-review-list__heading"><strong>{source.id} · {source.topic}</strong><small>{completed ? '3/3 확인' : '검토 필요'}</small></div>
                        <p>{source.title}</p>
                        <div className="source-review-draft__fields">
                          <label>검토자<input data-source-review-field={`${source.id}-reviewer`} type="text" value={draft.reviewer} onChange={event => updateSourceReviewDraft(source.id, 'reviewer', event.currentTarget.value)} placeholder="예: SCIENCE 담당" /></label>
                          <label>역할<select data-source-review-field={`${source.id}-role`} value={draft.role} onChange={event => updateSourceReviewDraft(source.id, 'role', event.currentTarget.value as SourceReviewDraft['role'])}><option value="SCIENCE">SCIENCE</option><option value="MEDICAL">MEDICAL</option></select></label>
                          <label>결정 초안<select data-source-review-field={`${source.id}-decision`} value={draft.decision} onChange={event => updateSourceReviewDraft(source.id, 'decision', event.currentTarget.value as SourceReviewDecision)}><option value="UNDECIDED">아직 결정하지 않음</option><option value="USE_GENERAL">일반 교육 사용 검토</option><option value="REVISE">문장 수정 필요</option><option value="HOLD">보류</option></select></label>
                        </div>
                        <fieldset className="source-review-draft__checks"><legend>확인 체크</legend><label><input type="checkbox" data-source-review-check={`${source.id}-scope`} checked={draft.scopeChecked} onClick={() => updateSourceReviewDraft(source.id, 'scopeChecked', !draft.scopeChecked)} onChange={() => undefined} /> 원문·연구 범위</label><label><input type="checkbox" data-source-review-check={`${source.id}-limitation`} checked={draft.limitationChecked} onClick={() => updateSourceReviewDraft(source.id, 'limitationChecked', !draft.limitationChecked)} onChange={() => undefined} /> 한계·금지 범위</label><label><input type="checkbox" data-source-review-check={`${source.id}-sentence`} checked={draft.sentenceChecked} onClick={() => updateSourceReviewDraft(source.id, 'sentenceChecked', !draft.sentenceChecked)} onChange={() => undefined} /> 공개 문장</label></fieldset>
                        <label className="source-review-draft__notes">검토 메모<textarea data-source-review-field={`${source.id}-notes`} value={draft.notes} onChange={event => updateSourceReviewDraft(source.id, 'notes', event.currentTarget.value)} placeholder="원문 확인 범위, 문장 수정, 이견을 기록하세요." rows={2} /></label>
                      </article>;
                    })}
                  </div>
                  <div className="source-review-draft__actions"><button type="button" data-source-review-copy onClick={copySourceReviewDrafts}>출처 검토 초안 전체 복사</button><span aria-live="polite">{sourceReviewMessage}</span></div>
                </div>
              </details> : null}
            </> : null}
            {openPanel === 'video' ? <>
              <p>{presentationMode ? '발표자용 영상 DB 감리 화면입니다. 공개 후보를 원문·자막·인물·근거·권리 기준으로 확인하고, 영상별 권위 수준과 공개 여부를 따로 결정합니다.' : 'GABA를 설명하는 영상을 한 편씩 살펴볼 수 있습니다. 영상의 전체 내용은 페이지 안에서 먼저 확인하고, 필요할 때 YouTube 원문으로 이어가세요.'}</p>
              <p className="info-panel__status">{presentationMode ? presenterData ? `감리 대장 ${presenterVideoDb.length}건 · 현재 국내 큐 ${filteredPanelVideos.length}건 · DB 승인 이력 ${presenterApprovedVideos.length}건 · 국내 공개 승인 ${DOMESTIC_PUBLIC_GABA_VIDEOS.length}건 · 등록 영상 초안 ${Object.keys(videoReviewDrafts).length}건 · 신규 후보 초안 ${Object.keys(monitorReviewDrafts).length}건` : '발표자용 감리 자료를 불러오는 중입니다.' : 'GABA 관련 참고 영상 · 한 편씩 보기'}</p>
              {presentationMode ? <div className="video-review-summary" aria-label="감리 목록 복사"><span>감리 초안 {Object.keys(videoReviewDrafts).length}건 · 미완료 {incompleteAuditVideos.length}건</span><button type="button" disabled={!Object.keys(videoReviewDrafts).length} onClick={copyAllVideoReviewDrafts}>작성 초안 전체 복사</button><button type="button" disabled={!incompleteAuditVideos.length} onClick={copyIncompleteVideoAuditQueue}>미완료 목록 복사</button><button type="button" data-export-video-db-csv onClick={exportVideoDbCsv}>영상 DB CSV 내려받기</button><button type="button" data-export-review-packet onClick={exportReviewHandoff}>감리 패킷 JSON 저장</button><button type="button" data-import-review-packet onClick={() => reviewHandoffInputRef.current?.click()}>감리 패킷 불러오기</button><input ref={reviewHandoffInputRef} className="sr-only" type="file" accept="application/json,.json" aria-label="감리 패킷 JSON 불러오기" onChange={importReviewHandoff} /><small aria-live="polite">{videoReviewMessage}</small><small aria-live="polite">{reviewHandoffMessage}</small></div> : null}
              {presentationMode ? <section className="video-publication-request" aria-label="일반 교육 공개 요청">
                <div><p className="eyebrow">다음 단계 · 사람 최종 확인</p><strong>{releaseReadyVideos.length}건 공개 요청 가능</strong><small>5개 확인 항목·담당자·타임코드·발언 발췌·공개 판정이 모두 입력된 국내 영상만 포함합니다.</small></div>
                <button type="button" data-export-publication-request disabled={!releaseReadyVideos.length} onClick={exportPublicationRequest}>공개 요청 패킷 저장</button>
              </section> : null}
              {presentationMode ? <section className="video-review-batch" aria-label="오늘 먼저 감리할 등록 영상">
                <div className="video-review-batch__heading"><div><p className="eyebrow">오늘 먼저 감리할 등록 영상</p><small>{activePresenterVideos.length ? `국내 등록 영상 ${activePresenterVideos.length}건 중 상태·미완료 기록을 기준으로 자동 정렬` : '오늘 공유된 후보 중 상태·미완료 기록을 기준으로 자동 정렬'}</small></div><strong>{reviewPriorityVideos.length}건</strong></div>
                <ol>
                  {reviewPriorityVideos.map((video, index) => {
                    const completed = VIDEO_REVIEW_CHECKS.filter(check => videoReviewDrafts[video.id]?.[check.key]).length;
                    return <li key={video.id}>
                      <div className="video-review-batch__copy"><span>{String(index + 1).padStart(2, '0')}</span><strong>{video.publicTitle ?? video.title}</strong><small>{VIDEO_STATUS_LABELS[video.status]} · {completed}/5 확인</small></div>
                      <p>{video.audit.nextAction}</p>
                      <button type="button" data-review-batch-video={video.id} onClick={() => selectReviewBatchVideo(video.id)}>이 영상 감리 시작</button>
                    </li>;
                  })}
                </ol>
                <p className="video-review-batch__boundary">5개 확인 항목을 모두 마친 뒤에도 사람의 공개 판단이 필요합니다. 자동 정렬은 권위·과학적 타당성·권리를 승인하지 않습니다.</p>
              </section> : null}
              {presentationMode ? <div className="monitor-snapshot">
                <div className="monitor-snapshot__heading"><div className="monitor-snapshot__title"><p className="eyebrow">일일 감리 상태</p><span className={`monitor-snapshot__schedule monitor-snapshot__schedule--${presenterScheduleStatus.tone}`}>{presenterScheduleStatus.label}</span></div><div className="monitor-snapshot__actions"><button type="button" className="monitor-snapshot__copy" onClick={copyDailyMonitorBrief}>회의용 요약 복사</button><button type="button" className="monitor-snapshot__copy" data-export-monitor-csv onClick={exportMonitorQueueCsv}>감리 큐 CSV 내려받기</button></div></div>
                <small className="monitor-snapshot__copy-message" aria-live="polite">{monitorCopyMessage}</small>
                <p><strong>{presenterMonitor?.checkedAtKst ?? presenterMonitor?.checkedAt ?? '—'}</strong> 마지막 실행 기록 · 실행 출처: {presenterMonitor?.runOrigin ?? '확인 전'} · 다음 예약 {presenterMonitor?.scheduleKst ?? '매일 09:17 KST'} · 채널 {presenterMonitor?.sourceChannels ?? 0}/{presenterMonitor?.registeredChannels ?? 0} · 검색어 {presenterMonitor?.discoveryQueries ?? 0}/{presenterMonitor?.totalDiscoveryQueries ?? 0} · 검색어 보완 {presenterMonitor?.searchFallbacksUsed?.length ?? 0}건</p>
                <p>검토 대기 {presenterMonitor?.pendingReview ?? 0}건 · SCIENCE/MEDICAL 우선 {presenterMonitor?.scienceMedicalPriority ?? 0}건 · 오늘 신규 후보 {presenterMonitor?.newCandidates ?? 0}건 · 이번 실행 {presenterMonitor?.newCandidatesThisRun ?? 0}건 · 자동 공개 {presenterMonitor?.autoPublish ?? 0}건</p>
                <p>등록 영상 원문 링크 {presenterMonitor?.registeredVideoLinksHealthy ?? 0}/{presenterMonitor?.registeredVideoLinksChecked ?? 0} 접근 확인 · 링크 경고 {presenterMonitor?.registeredVideoLinkWarnings ?? 0}건</p>
                <p>권위·연구 출처 링크 {presenterMonitor?.registeredEvidenceLinksHealthy ?? 0}/{presenterMonitor?.registeredEvidenceLinksChecked ?? 0} 접근 확인 · 출처 링크 경고 {presenterMonitor?.registeredEvidenceLinkWarnings ?? 0}건</p>
                <p>등록 YouTube 메타데이터 {presenterMonitor?.registeredVideoMetadataHealthy ?? 0}/{presenterMonitor?.registeredVideoMetadataChecked ?? 0} 제목·채널 확인 · 메타데이터 경고 {presenterMonitor?.registeredVideoMetadataWarnings ?? 0}건</p>
                <p>등록 YouTube 자막 트랙 {presenterMonitor?.registeredVideoCaptionTracksAvailable ?? 0}/{presenterMonitor?.registeredVideoCaptionTracksChecked ?? 0} 발견 · 자막 경고 {presenterMonitor?.registeredVideoCaptionTrackWarnings ?? 0}건</p>
                <p>등록 YouTube 자막 본문 {presenterMonitor?.registeredVideoCaptionBodiesAvailable ?? 0}/{presenterMonitor?.registeredVideoCaptionBodiesChecked ?? 0} 확인 · 본문 경고 {presenterMonitor?.registeredVideoCaptionBodyWarnings ?? 0}건 · HTTP 429 접근 제한 {presenterMonitor?.registeredVideoCaptionBodyRateLimited ?? 0}건</p>
                <section className="monitor-snapshot__brief" data-monitor-daily-brief aria-label="오늘의 운영 브리핑">
                  <div className="monitor-snapshot__brief-heading"><div><p className="eyebrow">오늘의 운영 브리핑</p><small>회의 전에 먼저 보는 변화·공개 경계·다음 행동</small></div><strong>{presenterScheduleStatus.tone === 'pending' ? '운영 HOLD' : '운영 확인'}</strong></div>
                  <div className="monitor-snapshot__brief-grid">
                    <article><span>오늘의 변화</span><strong>{presenterMonitor?.newCandidatesThisRun ? `신규 ${presenterMonitor.newCandidatesThisRun}건` : '새 후보 없음'}</strong><small>누적 후보 {presenterMonitor?.newCandidates ?? 0}건 · 검토 대기 {presenterMonitor?.pendingReview ?? 0}건</small></article>
                    <article><span>공개 경계</span><strong>제품·브랜드 {presenterMonitor?.productBrandQuarantine ?? 0}건 격리</strong><small>일반 공개 큐 제외 · 자동 공개 {presenterMonitor?.autoPublish ?? 0}건</small></article>
                    <article><span>다음 행동</span><strong>{presenterMonitor?.pendingQueue[0] ? '첫 후보 원문 감리' : '검토 큐 확인'}</strong><small>{presenterMonitor?.pendingQueue[0]?.nextAction ?? '오늘 검토할 후보가 없습니다.'}</small></article>
                  </div>
                  <p className="monitor-snapshot__brief-boundary">이 브리핑은 제목·공개 설명 기반의 운영 우선순위입니다. 예약 실행·사람 감리·권위·과학적 타당성·공개 승인을 대신하지 않습니다.</p>
                </section>
                <div className="monitor-snapshot__history" aria-label="최근 감리 추이">
                  <div className="monitor-snapshot__history-heading"><p className="eyebrow">최근 감리 추이</p><small>최근 {presenterMonitor?.history.length ?? 0}회</small></div>
                  <ol>
                    {[...(presenterMonitor?.history ?? [])].slice(-7).reverse().map((point, index, visibleHistory) => {
                      const olderPoint = visibleHistory[index + 1];
                      const pendingDelta = olderPoint ? point.pendingReview - olderPoint.pendingReview : 0;
                      return <li key={point.date}>
                        <span>{point.date.slice(5)}</span>
                        <strong>{point.newCandidates} 신규</strong>
                        <small>대기 {point.pendingReview}{olderPoint ? ` (${pendingDelta > 0 ? '+' : ''}${pendingDelta})` : ''} · 자막 본문 {point.captionBodiesAvailable}/{point.captionBodiesChecked}</small>
                      </li>;
                    })}
                  </ol>
                  <small>괄호 안 숫자는 직전 감리 대비 검토 대기 건수 변화입니다. 추이는 공개 승인이나 과학적 타당성을 의미하지 않습니다.</small>
                </div>
                <div className="monitor-snapshot__queue" aria-label="오늘 먼저 검토할 후보">
                  <p className="eyebrow">오늘 먼저 검토할 후보</p>
                  {presenterMonitor?.pendingQueue.length ? <ol>{presenterMonitor.pendingQueue.map(candidate => <li key={candidate.id}><details><summary><strong>{candidate.priority}</strong><span>{monitorCandidateDisplayTitle(candidate)}</span></summary><div><small>상태: PENDING_REVIEW · 첫 담당: {candidate.reviewer}</small><small>다음 행동: {candidate.nextAction}</small><small>발견 경로: {candidate.channel}</small><small>주의 신호: {candidate.signals.join(' · ')}</small><small>원문·자막·화자·권리 확인 전에는 공개하지 않습니다.</small><button type="button" className="monitor-candidate-review-button" onClick={() => startMonitorReview(candidate.id)}>이 후보 감리 초안 시작</button></div></details></li>)}</ol> : <p>현재 검토 대기 후보가 없습니다.</p>}
                  <small>제목·공개 설명 기반 우선순위입니다. 영상 원문·자막·화자·권리 확인 전 공개 승인으로 보지 않습니다.</small>
                </div>
                <div className="monitor-snapshot__authority-queue" aria-label="권위 후보 확인 전 큐">
                  <p className="eyebrow">권위 후보 확인 전</p>
                  {presenterMonitor?.authorityQueue.length ? <ol>{presenterMonitor.authorityQueue.map(candidate => <li key={candidate.id}><details><summary><strong>{AUTHORITY_BASIS_LABELS[candidate.authorityBasis]}</strong><span>{candidate.title}</span></summary><div><small>확인 경로: {AUTHORITY_BASIS_LABELS[candidate.authorityBasis]}</small><small>발견 신호: {candidate.signals.join(' · ')}</small><small>다음 행동: {candidate.nextAction}</small><small>발견 경로: {candidate.channel}</small><small>자격·실제 화자·원문·자막·권리 확인 전에는 권위 영상으로 공개하지 않습니다.</small><button type="button" className="monitor-candidate-review-button" onClick={() => startMonitorReview(candidate.id)}>이 후보 감리 초안 시작</button></div></details></li>)}</ol> : <p>현재 권위 후보 신호가 있는 영상이 없습니다.</p>}
                  <small>전문가 표현 감지와 검색어 발견은 서로 다른 감리 단서입니다. 둘 다 의사·과학자 자격이나 영상의 과학적 타당성을 승인하지 않습니다.</small>
                </div>
                <div className="monitor-snapshot__product-queue" aria-label="제품 브랜드 신호 격리 큐">
                  <p className="eyebrow">제품·브랜드 신호 — 일반 공개 큐 제외</p>
                  {presenterMonitor?.productBrandQueue.length ? <ol>{presenterMonitor.productBrandQueue.map(candidate => <li key={candidate.id}><details><summary><strong>공개 큐 제외</strong><span>{monitorCandidateDisplayTitle(candidate)}</span></summary><div><small>상태: PENDING_REVIEW · 일반 GABA 공개 후보로 자동 사용하지 않음</small><small>발견 신호: {candidate.signals.join(' · ')}</small><small>다음 행동: {candidate.nextAction}</small><small>발견 경로: {candidate.channel}</small><small>제품·브랜드 주장과 일반 GABA 설명을 분리한 뒤 사람이 오탐 여부와 권리를 확인합니다.</small><button type="button" className="monitor-candidate-review-button" onClick={() => startMonitorReview(candidate.id)}>이 후보 감리 초안 시작</button></div></details></li>)}</ol> : <p>현재 제품·브랜드 신호로 격리된 후보가 없습니다.</p>}
                  <small>이 큐는 제품 정보를 공개하기 위한 목록이 아닙니다. 일반 GABA 공개 큐와 제품성 콘텐츠를 분리하기 위한 안전 장치입니다.</small>
                </div>
                {monitorReviewCandidate && monitorReviewDraft ? <section className="monitor-candidate-review" aria-label="신규 후보 감리 초안">
                  <div className="monitor-candidate-review__heading"><div><p className="eyebrow">오늘 검토 후보 입력</p><strong>{monitorReviewCandidate.id}</strong></div><button type="button" onClick={() => setMonitorReviewCandidateId(null)}>닫기</button></div>
                  <h3>{monitorReviewCandidate.title}</h3>
                  <p className="monitor-candidate-review__meta">{monitorReviewCandidate.channel} · {('priority' in monitorReviewCandidate ? monitorReviewCandidate.priority : '권위 후보 확인')}</p>
                  <p className="monitor-candidate-review__boundary">자동 수집 후보는 아직 `PENDING_REVIEW`입니다. 아래 기록은 이 브라우저의 감리 초안이며 공식 DB 등록·공개 승인 상태를 바꾸지 않습니다.</p>
                  {monitorReviewCandidateEmbedUrl ? <section className="monitor-candidate-review__player" aria-label="자동 수집 후보 YouTube 원문 플레이어">
                    <div><strong>페이지 안에서 원문 확인</strong><small>YouTube 공식 플레이어 · 검토 후보</small></div>
                    <iframe src={monitorReviewCandidateEmbedUrl} title={`${monitorReviewCandidate.title} YouTube 원문 플레이어`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                    <p>재생은 사람 감리·권위 확인·공개 승인을 의미하지 않습니다. 원문·자막·화자·권리를 확인한 뒤 초안을 기록하세요.</p>
                    <a href={monitorReviewCandidate.url} target="_blank" rel="noopener noreferrer">원문 링크 열기 ↗</a>
                  </section> : null}
                  <div className="monitor-candidate-review__fields">
                    <label>담당자<input data-monitor-review-field="reviewer" type="text" value={monitorReviewDraft.reviewer} onChange={event => updateMonitorReviewDraft('reviewer', event.currentTarget.value)} placeholder="예: VIDEO 담당" /></label>
                    <label>역할<select data-monitor-review-field="role" value={monitorReviewDraft.role} onChange={event => updateMonitorReviewDraft('role', event.currentTarget.value)}>{VIDEO_REVIEW_ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select></label>
                    <label>결정 초안<select data-monitor-review-field="decision" value={monitorReviewDraft.decision} onChange={event => updateMonitorReviewDraft('decision', event.currentTarget.value as VideoReviewDecision)}>{VIDEO_REVIEW_DECISIONS.map(decision => <option key={decision.id} value={decision.id} disabled={decision.id === 'PUBLISH_GENERAL' && monitorReviewCheckCount < VIDEO_REVIEW_CHECKS.length}>{decision.label}</option>)}</select></label>
                    <label>확인 타임코드<input data-monitor-review-field="timestamps" type="text" value={monitorReviewDraft.timestamps} onChange={event => updateMonitorReviewDraft('timestamps', event.currentTarget.value)} placeholder="예: 00:12–00:28" /></label>
                  </div>
                  <label className="monitor-candidate-review__transcript">확인한 발언·자막 발췌<textarea data-monitor-review-field="transcriptExcerpt" value={monitorReviewDraft.transcriptExcerpt} onChange={event => updateMonitorReviewDraft('transcriptExcerpt', event.currentTarget.value)} placeholder="예: 원문에서 확인한 문장을 그대로 기록하세요." rows={3} /></label>
                  <fieldset className="monitor-candidate-review__checks"><legend>{monitorReviewCheckCount}/5 확인</legend>{VIDEO_REVIEW_CHECKS.map(check => <label key={check.key}><input type="checkbox" data-monitor-review-check={check.key} checked={monitorReviewDraft[check.key]} onClick={() => updateMonitorReviewDraft(check.key, !monitorReviewDraft[check.key])} onChange={() => undefined} /> {check.label}</label>)}</fieldset>
                  <p className="monitor-candidate-review__guardrail">5개 확인 항목을 모두 마친 뒤에만 ‘일반 교육 공개 검토’를 선택할 수 있습니다. 자동 수집 후보는 사람이 원문과 발언을 확인하기 전까지 공개하지 않습니다.</p>
                  <label className="monitor-candidate-review__notes">팀 메모<textarea data-monitor-review-field="notes" value={monitorReviewDraft.notes} onChange={event => updateMonitorReviewDraft('notes', event.currentTarget.value)} placeholder="확인한 근거, 이견, 다음 질문을 기록하세요." rows={3} /></label>
                  <div className="monitor-candidate-review__actions"><button type="button" data-monitor-review-copy onClick={copyMonitorReviewDraft}>후보 감리 초안 복사</button><span aria-live="polite">{monitorReviewMessage}</span></div>
                </section> : null}
                <p className="monitor-snapshot__fallback-note">예약 실행이 확인되기 전에는 아래 화면에서 `Run workflow`를 선택해 수동 감리를 시작할 수 있습니다. 수동 실행은 예약 실행 확인으로 바뀌지 않으며, 자동 공개도 발생하지 않습니다.</p>
                <div className="monitor-snapshot__links"><a className="monitor-snapshot__manual-run" data-manual-monitor-run href={MONITOR_WORKFLOW_URL} target="_blank" rel="noopener noreferrer">수동 감리 실행 화면 ↗</a><a href={presenterMonitor?.triageUrl ?? '#'} target="_blank" rel="noopener noreferrer">감리 우선순위 보드 원문 ↗</a><a href={presenterMonitor?.reportUrl ?? '#'} target="_blank" rel="noopener noreferrer">일일 리포트 ↗</a><a href={presenterMonitor?.reviewLogUrl ?? '#'} target="_blank" rel="noopener noreferrer">팀 리뷰 로그 ↗</a><a href={presenterMonitor?.reviewSessionUrl ?? '#'} target="_blank" rel="noopener noreferrer">오늘 리뷰 세션 ↗</a><a href={presenterMonitor?.metadataAuditUrl ?? '#'} target="_blank" rel="noopener noreferrer">메타데이터 감사 기록 ↗</a><a href={presenterMonitor?.captionAuditUrl ?? '#'} target="_blank" rel="noopener noreferrer">자막 감사 기록 ↗</a></div>
              </div> : null}
              {presentationMode ? <div className="video-db-tools">
                <label className="video-db-search">영상 DB 검색
                  <input type="search" value={videoQuery} onChange={event => setVideoQuery(event.currentTarget.value)} placeholder="제목·채널·화자·ID" aria-label="영상 DB 검색" />
                </label>
                <div className="video-db-filters" role="group" aria-label="영상 DB 상태·인물 출처 필터">
                  {VIDEO_FILTERS.map(filter => <button key={filter.id} type="button" className={videoFilter === filter.id ? 'is-active' : ''} aria-pressed={videoFilter === filter.id} onClick={() => setVideoFilter(filter.id)}>
                    {filter.label}<span>{videoFilterCount(filter.id)}</span>
                  </button>)}
                </div>
              </div> : null}
              <div className="video-db-list" aria-label="GABA 영상 DB 목록">
                {filteredPanelVideos.length ? filteredPanelVideos.map(video => <article key={video.id} className={'video-db-item' + (panelVideoId === video.id ? ' is-selected' : '')}>
                  <div className="video-db-item__topline"><span>{presentationMode ? video.id : 'GABA'}</span><strong>{presentationMode ? VIDEO_STATUS_LABELS[video.status] : 'GABA 참고 영상'}</strong></div>
                  <h3>{presentationMode ? video.title : video.publicTitle ?? video.title}</h3>
                  <p>{video.channel}</p>
                  <button type="button" className="video-db-item__select" aria-pressed={panelVideoId === video.id} onClick={() => setPanelVideoId(video.id)}>{panelVideoId === video.id ? '선택된 영상' : presentationMode ? '이 영상 검토' : '상세 보기'}</button>
                </article>) : <p className="info-panel__flow-note">{presentationMode && !presenterData ? '발표자용 감리 자료를 불러오는 중입니다.' : '현재 조건에 맞는 영상이 없습니다. 검색어를 지우거나 다른 상태를 선택하세요.'}</p>}
              </div>
              {selectedVideo ? <div className="video-db-detail">
                <p className="eyebrow">{presentationMode ? `선택 영상 상세 · ${VIDEO_STATUS_LABELS[selectedVideo.status]}` : '영상 정보'}</p>
                <h3 tabIndex={-1}>{presentationMode ? selectedVideo.title : selectedVideo.publicTitle ?? selectedVideo.title}</h3>
                {selectedVideo.previewImage || selectedVideo.previewLabel ? <figure className={'video-db-preview' + (!selectedVideo.previewImage || previewImageError ? ' video-db-preview--source' : '')}>
                  {selectedVideo.previewImage && !previewImageError ? <img src={selectedVideo.previewImage} alt={selectedVideo.previewAlt ?? `${selectedVideo.title} 공식 원문 미리보기`} loading="lazy" decoding="async" onError={() => setPreviewImageError(true)} /> : <div className="video-db-preview__source-mark"><span>공식 교육기관</span><strong>{selectedVideo.previewLabel}</strong><small>원문 페이지·대본 확인</small></div>}
                  <figcaption>{presentationMode ? '공식 원문 미리보기 · 아래 페이지 안에서 먼저 재생하고, 전체 맥락은 원문 선택에서 확인합니다.' : 'YouTube 미리보기 · 전체 영상은 아래에서 확인하세요.'}</figcaption>
                </figure> : null}
                {selectedVideoEmbedUrl ? <section className={`video-db-embed${selectedVideoIsShort ? ' video-db-embed--short' : ''}`} aria-label="YouTube 원문 플레이어">
                  <div className="video-db-embed__heading"><strong>{presentationMode ? '페이지 안에서 원문 재생' : '페이지 안에서 영상 보기'}</strong><small>YouTube · {selectedVideoIsShort ? 'Shorts' : '영상'}</small></div>
                  <iframe src={selectedVideoEmbedUrl} title={`${presentationMode ? selectedVideo.title : selectedVideo.publicTitle ?? selectedVideo.title} YouTube 원문 플레이어`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                  <p>{presentationMode ? '임베드가 제한되면 아래 원문 링크를 선택하세요. 플레이어 재생은 사람 감리·권위 확인·공개 승인을 의미하지 않습니다.' : '영상 전체 내용은 아래 YouTube 원문에서 확인할 수 있습니다.'}</p>
                </section> : null}
                <div className="video-db-detail__summary">
                  <p><strong>{presentationMode ? '무엇을 어떻게 소개했나' : '영상 요약'}</strong><br />{presentationMode ? selectedVideo.summary : selectedVideo.publicSummary ?? selectedVideo.summary}</p>
                  <p><strong>{presentationMode ? '인물 소개' : '출연자와 채널'}</strong><br />{presentationMode ? selectedVideo.personSummary : selectedVideo.publicPersonSummary ?? selectedVideo.personSummary}</p>
                </div>
                 <div className="video-db-detail__operator"><strong>{presentationMode ? '사업자 설명 한 문장' : '한 문장으로 정리하면'}</strong><p>{presentationMode ? selectedVideo.operatorSentence : selectedVideo.publicOperatorSentence ?? selectedVideo.operatorSentence}</p>{presentationMode ? <><div className="video-db-detail__operator-actions"><button type="button" onClick={() => copyVideoOperatorSentence(selectedVideo)}>설명 문장 복사</button><button type="button" onClick={() => copyVideoCustomerBrief(selectedVideo)}>고객 설명 3문장 복사</button><button type="button" data-copy-video-review-link onClick={() => copyVideoReviewLink(selectedVideo)}>이 영상 감리 링크 복사</button></div><details className="video-db-detail__customer-brief"><summary>고객 설명 3문장 미리 보기 <span aria-hidden="true">＋</span></summary><ol>{getVideoCustomerBrief(selectedVideo).map(sentence => <li key={sentence}>{sentence}</li>)}</ol></details><small className="video-db-detail__customer-guard">고객 전달용 문장은 미승인 영상을 ‘원문 확인 전’으로 자동 정리합니다.</small><span aria-live="polite">{videoCopyMessage}</span></> : null}</div>
                {presentationMode ? <dl className="video-db-audit" aria-label="영상 감리 필드">
                  <div><dt>요약 근거</dt><dd>{VIDEO_AUDIT_LABELS.contentBasis[selectedVideo.audit.contentBasis]}</dd></div>
                  <div><dt>권위</dt><dd>{VIDEO_AUDIT_LABELS.authorityLevel[selectedVideo.audit.authorityLevel]}</dd></div>
                  <div><dt>근거</dt><dd>{VIDEO_AUDIT_LABELS.evidenceLevel[selectedVideo.audit.evidenceLevel]}</dd></div>
                  <div><dt>사용 방식</dt><dd>{VIDEO_AUDIT_LABELS.usageMode[selectedVideo.audit.usageMode]}</dd></div>
                  <div><dt>권리</dt><dd>{VIDEO_AUDIT_LABELS.rightsStatus[selectedVideo.audit.rightsStatus]}</dd></div>
                  {presentationMode ? <div><dt>주장 범위</dt><dd>{selectedVideo.audit.claimCategories.map(category => VIDEO_CLAIM_LABELS[category]).join(' · ')}</dd></div> : null}
                  {presentationMode ? <div><dt>영상별 감리 규칙</dt><dd>{selectedVideo.reviewRule ?? selectedVideo.audit.nextAction}</dd></div> : null}
                </dl> : null}
                <p className="video-db-detail__next"><strong>{presentationMode ? '다음 감리 행동' : '더 알아보기'}</strong><br />{presentationMode ? selectedVideo.audit.nextAction : '영상의 전체 내용과 출연자 설명은 YouTube 원문에서 확인하세요.'}</p>
                <p className="info-panel__status">{presentationMode ? selectedVideo.statusReason : 'GABA를 이해하기 위한 참고 영상입니다.'}</p>
                <p className="video-db-detail__meta">{presentationMode ? <>확인일 {selectedVideo.checkedAt} · 채널 {selectedVideo.channel} · 화자 {selectedVideo.speaker}{selectedVideo.sourceChannelUrl ? <> · <a href={selectedVideo.sourceChannelUrl} target="_blank" rel="noopener noreferrer">채널 원문 보기 ↗</a></> : null}{selectedVideo.authorityEvidenceUrl ? <> · <a href={selectedVideo.authorityEvidenceUrl} target="_blank" rel="noopener noreferrer">화자·소속 확인 출처 ↗</a></> : null}{selectedVideo.researchEvidenceUrl ? <> · <a href={selectedVideo.researchEvidenceUrl} target="_blank" rel="noopener noreferrer">관련 연구 기록 ↗</a></> : null}</> : <>채널 {selectedVideo.channel} · 출연자 {selectedVideo.speaker}</>}</p>
                {presentationMode && selectedVideoReviewDraft ? <details className="video-review-draft">
                  <summary><span>이 영상 감리 기록 초안</span><strong>{selectedReviewCheckCount}/5 확인 <span aria-hidden="true">＋</span></strong></summary>
                  <div className="video-review-draft__body">
                    <p className="video-review-draft__note">원문·자막·화자·권리·주장 범위를 팀원이 확인하며 남기는 브라우저 로컬 초안입니다. 입력만으로 공개 승인이나 DB 상태는 바뀌지 않습니다.</p>
                    <ol className="video-review-progress" aria-label="영상별 감리 진행 상태">
                      {VIDEO_REVIEW_CHECKS.map(check => {
                        const checked = selectedVideoReviewDraft[check.key];
                        return <li key={check.key} className={checked ? 'is-checked' : ''}><span aria-hidden="true">{checked ? '✓' : '·'}</span><strong>{check.label}</strong><small>{checked ? '확인됨' : '확인 필요'}</small></li>;
                      })}
                    </ol>
                    <div className="video-review-draft__fields">
                      <label>담당자<input data-review-field="reviewer" type="text" value={selectedVideoReviewDraft.reviewer} onChange={event => updateVideoReviewDraft('reviewer', event.currentTarget.value)} placeholder="예: 홍길동" /></label>
                      <label>역할<select data-review-field="role" value={selectedVideoReviewDraft.role} onChange={event => updateVideoReviewDraft('role', event.currentTarget.value)}>{VIDEO_REVIEW_ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select></label>
                      <label>결정 초안<select data-review-field="decision" value={selectedVideoReviewDraft.decision} onChange={event => updateVideoReviewDraft('decision', event.currentTarget.value as VideoReviewDecision)}>{VIDEO_REVIEW_DECISIONS.map(decision => <option key={decision.id} value={decision.id} disabled={decision.id === 'PUBLISH_GENERAL' && selectedReviewCheckCount < VIDEO_REVIEW_CHECKS.length}>{decision.label}</option>)}</select></label>
                      <label>확인 타임코드<input data-review-field="timestamps" type="text" value={selectedVideoReviewDraft.timestamps} onChange={event => updateVideoReviewDraft('timestamps', event.currentTarget.value)} placeholder="예: 00:12–00:28" /></label>
                    </div>
                    <label className="video-review-draft__transcript">확인한 발언·자막 발췌<textarea data-review-field="transcriptExcerpt" value={selectedVideoReviewDraft.transcriptExcerpt ?? ''} onChange={event => updateVideoReviewDraft('transcriptExcerpt', event.currentTarget.value)} placeholder="예: 원문에서 확인한 문장을 그대로 기록하세요." rows={3} /></label>
                    <fieldset className="video-review-draft__checks">
                      <legend>확인 체크</legend>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.sourceChecked} onClick={() => updateVideoReviewDraft('sourceChecked', !selectedVideoReviewDraft.sourceChecked)} onChange={() => undefined} /> 원문/영상 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.transcriptChecked} onClick={() => updateVideoReviewDraft('transcriptChecked', !selectedVideoReviewDraft.transcriptChecked)} onChange={() => undefined} /> 자막/대본 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.speakerChecked} onClick={() => updateVideoReviewDraft('speakerChecked', !selectedVideoReviewDraft.speakerChecked)} onChange={() => undefined} /> 화자·자격 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.rightsChecked} onClick={() => updateVideoReviewDraft('rightsChecked', !selectedVideoReviewDraft.rightsChecked)} onChange={() => undefined} /> 권리·사용 방식 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.claimScopeChecked} onClick={() => updateVideoReviewDraft('claimScopeChecked', !selectedVideoReviewDraft.claimScopeChecked)} onChange={() => undefined} /> 주장 범위·연구 구분 확인</label>
                    </fieldset>
                    <p className="video-review-draft__guardrail">5개 확인 항목을 모두 마친 뒤에만 ‘일반 교육 공개 검토’를 선택할 수 있습니다. 일반 GABA 연구와 제품 효능은 별도로 구분해 기록합니다.</p>
                    <label className="video-review-draft__notes">팀 메모<textarea data-review-field="notes" value={selectedVideoReviewDraft.notes} onChange={event => updateVideoReviewDraft('notes', event.currentTarget.value)} placeholder="확인한 발언, 근거, 이견, 다음 질문을 기록하세요." rows={4} /></label>
                    <div className="video-review-draft__actions"><button type="button" onClick={copyVideoReviewDraft}>감리 기록 초안 복사</button><span aria-live="polite">{videoReviewMessage}</span></div>
                    <small className="video-review-draft__saved">{selectedVideoReviewDraft.updatedAt ? `마지막 저장 ${selectedVideoReviewDraft.updatedAt.replace('T', ' ').replace('Z', '')}` : '아직 입력하지 않았습니다.'}</small>
                  </div>
                </details> : null}
              </div> : null}
              <p className="info-panel__boundary">{presentationMode ? '공유 영상의 요약은 감리 전 예비 정리입니다. 원문·자막·인물·권리 상태를 확인하고 일반 GABA 연구나 제품 효능과 구분해 읽습니다.' : '이 영상은 GABA를 이해하기 위한 참고 자료입니다. 영상의 전체 내용은 YouTube 원문에서 확인하세요.'}</p>
            </> : null}
            {openPanel === 'ops' ? <>
              <p>이 보드는 공개 소비자용 내용이 아니라, 일반 GABA 교육 자료를 검토·회의·배포하는 사업자용 운영 화면입니다.</p>
              <section className="tf-board__today" aria-label="오늘 바로 할 일">
                <div className="tf-board__today-heading"><div><p className="eyebrow">오늘 바로 할 일</p><strong>15분 시작 순서</strong></div><span>자동 정렬 → 사람 판정</span></div>
                <ol>
                  <li><span>01</span><div><strong>감리 우선 영상</strong><small>{reviewPriorityVideos[0] ? `${reviewPriorityVideos[0].id} · ${reviewPriorityVideos[0].publicTitle ?? reviewPriorityVideos[0].title}` : '현재 감리 대상 없음'}</small></div><button type="button" data-today-task="video" disabled={!reviewPriorityVideos.length} onClick={openTodayVideoReview}>감리 시작</button></li>
                  <li><span>02</span><div><strong>과학 출처 5건</strong><small>{sourceReviewCompleted}/{RESEARCH_SOURCES.length}건 사람 검토 초안</small></div><button type="button" data-today-task="research" onClick={() => openInfoPanel(active, 'research')}>출처 열기</button></li>
                  <li><span>03</span><div><strong>팀 배정·토론</strong><small>{presenterMonitor?.humanRoleAssigned ?? 0}/{presenterMonitor?.humanRoleTotal ?? 0} 역할 · 첫 회의 {presenterMonitor?.firstMeetingReady ? '입력됨' : '필요'}</small></div><button type="button" data-today-task="assignment" onClick={() => revealOpsSection('.tf-board__assignment')}>배정 열기</button></li>
                </ol>
                <p className="tf-board__today-note">자동화는 후보를 정렬할 뿐입니다. 공개 판정은 원문·자막·화자·권리·주장 범위를 확인한 사람이 남깁니다.</p>
              </section>
              <div className="tf-board__metrics" aria-label="TF 운영 현황">
                <div><strong>{presenterMonitor?.humanRoleAssigned ?? 0}/{presenterMonitor?.humanRoleTotal ?? 0}</strong><span>핵심 역할 배정</span></div>
                <div><strong>{presenterMonitor?.humanSourceReviewed ?? 0}/{presenterMonitor?.humanSourceTotal ?? 0}</strong><span>출처 사람 검토</span></div>
                <div><strong>{presenterMonitor?.domesticPublicApproved ?? 0}/{presenterMonitor?.domesticVideoTotal ?? 0}</strong><span>국내 공개 승인 · DB 이력 {presenterMonitor?.registeredVideoApproved ?? 0}건</span></div>
                <div><strong>{presenterMonitor?.firstMeetingReady ? '입력됨' : '필요'}</strong><span>첫 회의 입력</span></div>
              </div>
              <details className="tf-board__assignment">
                <summary>팀 업무 배정 초안 만들기 <span aria-hidden="true">＋</span></summary>
                <div className="tf-board__assignment-body">
                  <p>주 담당자·백업·첫 회의 일시를 입력하면 이 브라우저에만 저장하고, 회의 전에 복사해 공유할 수 있습니다.</p>
                  <div className="tf-board__role-list">
                    {presenterTfRoles.map(role => <div key={role.id} className="tf-board__role-row">
                      <div className="tf-board__role-copy"><strong>{role.id}</strong><span>{role.title}</span><small>{role.responsibility}</small></div>
                      <label>주 담당<input type="text" value={tfAssignments[role.id]?.lead ?? ''} onChange={event => updateTfAssignment(role.id, 'lead', event.currentTarget.value)} placeholder="미배정" /></label>
                      <label>백업<input type="text" value={tfAssignments[role.id]?.backup ?? ''} onChange={event => updateTfAssignment(role.id, 'backup', event.currentTarget.value)} placeholder="미배정" /></label>
                    </div>)}
                  </div>
                  <label className="tf-board__meeting-draft">첫 회의 일시<input type="text" value={tfMeetingDraft} onChange={event => updateTfMeetingDraft(event.currentTarget.value)} placeholder="예: 2026-09-23 10:00" /></label>
                  <div className="tf-board__assignment-actions"><button type="button" onClick={copyTfAssignmentDraft}>배정 초안 복사</button><span aria-live="polite">{tfAssignmentMessage}</span></div>
                  <p className="tf-board__assignment-note">현재 상단 지표와 공식 문서의 `0/7` 상태는 자동으로 바뀌지 않습니다. 실제 담당자 확정 후 킥오프 문서에 반영해야 합니다.</p>
                </div>
              </details>
              <details className="tf-board__field-session">
                <summary>A/B/C 현장 검증 기록 · {FIELD_SESSION_SCENARIOS.filter(scenario => Boolean(fieldSessionDrafts[scenario.id]?.updatedAt)).length}/{FIELD_SESSION_SCENARIOS.length} <span aria-hidden="true">＋</span></summary>
                <div className="tf-board__field-session-body">
                  <p>실제 소비자·사업자 세션의 관찰 입력을 남기는 작업 공간입니다. 고객 개인정보·건강 상태·복용 약은 기록하지 않습니다. 기록만으로 현장 PASS나 최종 승인을 선언하지 않습니다.</p>
                  <div className="tf-board__field-session-list">
                    {FIELD_SESSION_SCENARIOS.map(scenario => {
                      const draft = fieldSessionDrafts[scenario.id] ?? makeEmptyFieldSessionDraft();
                      return <article key={scenario.id} className="tf-board__field-session-item">
                        <div className="tf-board__field-session-topline"><strong>{scenario.id}</strong><span>{draft.updatedAt ? '기록됨' : '기록 필요'}</span></div>
                        <h3>{scenario.title}</h3>
                        <p>{scenario.goal}</p>
                        <div className="tf-board__field-session-fields">
                          <label>설명자<input data-field-session={`${scenario.id}-facilitator`} type="text" value={draft.facilitator} onChange={event => updateFieldSessionDraft(scenario.id, 'facilitator', event.currentTarget.value)} placeholder="식별자만 입력" /></label>
                          <label>관찰자<input data-field-session={`${scenario.id}-observer`} type="text" value={draft.observer} onChange={event => updateFieldSessionDraft(scenario.id, 'observer', event.currentTarget.value)} placeholder="식별자만 입력" /></label>
                          <label>기기·브라우저<input data-field-session={`${scenario.id}-device`} type="text" value={draft.device} onChange={event => updateFieldSessionDraft(scenario.id, 'device', event.currentTarget.value)} placeholder="예: iPhone · Safari" /></label>
                          <label>다음 행동 명확도<select data-field-session={`${scenario.id}-clarity`} value={draft.clarity} onChange={event => updateFieldSessionDraft(scenario.id, 'clarity', event.currentTarget.value as FieldSessionClarity)}>{FIELD_SESSION_CLARITY_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                          <label>첫 행동까지(초)<input data-field-session={`${scenario.id}-firstActionSeconds`} type="text" value={draft.firstActionSeconds} onChange={event => updateFieldSessionDraft(scenario.id, 'firstActionSeconds', event.currentTarget.value)} placeholder="예: 12" /></label>
                          <label>외부 선행 이탈<select data-field-session={`${scenario.id}-externalExit`} value={draft.externalExit} onChange={event => updateFieldSessionDraft(scenario.id, 'externalExit', event.currentTarget.value as FieldSessionExit)}><option value="UNRECORDED">아직 기록하지 않음</option><option value="NONE">없음</option><option value="YES">있음</option></select></label>
                        </div>
                        <label>오해·문제<textarea data-field-session={`${scenario.id}-misunderstanding`} value={draft.misunderstanding} onChange={event => updateFieldSessionDraft(scenario.id, 'misunderstanding', event.currentTarget.value)} placeholder="오해가 생긴 장면·문장·P0 오류를 기록하세요." rows={2} /></label>
                        <div className="tf-board__field-session-fields tf-board__field-session-fields--followup">
                          <label>다음 액션<input data-field-session={`${scenario.id}-nextAction`} type="text" value={draft.nextAction} onChange={event => updateFieldSessionDraft(scenario.id, 'nextAction', event.currentTarget.value)} placeholder="예: 05번 문장 재검토" /></label>
                          <label>담당·기한<input data-field-session={`${scenario.id}-owner`} type="text" value={draft.owner} onChange={event => updateFieldSessionDraft(scenario.id, 'owner', event.currentTarget.value)} placeholder="예: UX · 다음 회의 전" /></label>
                        </div>
                        <small aria-live="polite">{draft.updatedAt ? `마지막 저장 ${draft.updatedAt.replace('T', ' ').replace('Z', '')}` : fieldSessionMessage || '아직 기록하지 않았습니다.'}</small>
                      </article>;
                    })}
                  </div>
                  <div className="tf-board__field-session-actions"><button type="button" onClick={copyFieldSessionDrafts}>현장 기록 초안 복사</button><span aria-live="polite">{fieldSessionMessage}</span></div>
                </div>
              </details>
              <details className="tf-board__discussion">
                <summary>오늘의 토론 논점 보기 · 기록 {Object.keys(tfDiscussionDrafts).length}/{presenterTfDiscussionItems.length} <span aria-hidden="true">＋</span></summary>
                <div className="tf-board__discussion-body">
                  <p>각 논점은 문제 → 관점 → 증거 → 결정 또는 HOLD → 다음 담당·기한·종료 조건 순서로 회의합니다. 아래 기록은 이 브라우저에 저장되며, 회의용 복사·감리 패킷에 포함할 수 있습니다. 기술 QA와 사람 검토를 섞지 않습니다.</p>
                  <div className="tf-board__discussion-list">
                    {presenterTfDiscussionItems.map(item => {
                      const draft = tfDiscussionDrafts[item.id] ?? makeEmptyTfDiscussionDraft();
                      const decisionLabel = TF_DISCUSSION_DECISIONS.find(option => option.id === draft.decision)?.label ?? '아직 결정하지 않음';
                      return <article key={item.id} className="tf-board__discussion-item">
                        <div className="tf-board__discussion-topline"><strong>{item.id}</strong><span>{item.status}</span></div>
                        <h3>{item.issue}</h3>
                        <p><b>필요 증거:</b> {item.evidence}</p>
                        <p><b>다음 담당:</b> {item.nextOwner}</p>
                        <p><b>종료 조건:</b> {item.exit}</p>
                        <details className="tf-board__discussion-draft">
                          <summary>이 논점 회의 기록 · {decisionLabel} <span aria-hidden="true">＋</span></summary>
                          <div className="tf-board__discussion-draft-body">
                            <div className="tf-board__discussion-draft-fields">
                              <label>회의 결정<select data-discussion-field={`${item.id}-decision`} value={draft.decision} onChange={event => updateTfDiscussionDraft(item.id, 'decision', event.currentTarget.value as TfDiscussionDecision)}>{TF_DISCUSSION_DECISIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                              <label>다음 담당<input data-discussion-field={`${item.id}-owner`} type="text" value={draft.owner} onChange={event => updateTfDiscussionDraft(item.id, 'owner', event.currentTarget.value)} placeholder="예: SCIENCE 담당" /></label>
                              <label>기한<input data-discussion-field={`${item.id}-due`} type="text" value={draft.due} onChange={event => updateTfDiscussionDraft(item.id, 'due', event.currentTarget.value)} placeholder="예: 다음 회의 전" /></label>
                            </div>
                            <label>팀 메모·근거·이견<textarea data-discussion-field={`${item.id}-notes`} value={draft.notes} onChange={event => updateTfDiscussionDraft(item.id, 'notes', event.currentTarget.value)} placeholder="회의에서 확인한 증거, 이견, 결정 이유를 기록하세요." rows={3} /></label>
                            <small aria-live="polite">{draft.updatedAt ? `마지막 저장 ${draft.updatedAt.replace('T', ' ').replace('Z', '')}` : tfDiscussionDraftMessage || '아직 기록하지 않았습니다.'}</small>
                          </div>
                        </details>
                      </article>;
                    })}
                  </div>
                  <div className="tf-board__discussion-actions"><button type="button" onClick={copyTfDiscussionBrief}>회의 논점·기록 복사</button><span aria-live="polite">{tfDiscussionMessage || tfDiscussionDraftMessage}</span></div>
                </div>
              </details>
              <div className="tf-board__list">
                {presenterTfWorkstreams.map(workstream => <article key={workstream.id} className="tf-board__item">
                  <div className="tf-board__item-topline"><span>{workstream.id}</span><strong>HOLD</strong></div>
                  <h3>{workstream.title}</h3>
                  <p><b>담당:</b> {workstream.owner}</p>
                  <p><b>다음 행동:</b> {workstream.action}</p>
                  <p className="tf-board__exit"><b>종료 조건:</b> {workstream.exit}</p>
                </article>)}
              </div>
              <details className="tf-board__meeting"><summary>첫 회의 진행 순서 <span aria-hidden="true">＋</span></summary><ol>{presenterTfMeetingSteps.map(step => <li key={step}>{step}</li>)}</ol></details>
              <p className="info-panel__boundary">AI-OPS는 문서·코드·QA·업무 추적을 실행하지만, 과학·의학·권리·현장·최종 공개 승인을 대신하지 않습니다.</p>
              <div className="tf-board__links"><a href={presenterMonitor?.kickoffUrl ?? '#'} target="_blank" rel="noopener noreferrer">첫 회의 준비서 ↗</a><a href={presenterMonitor?.sourceRegisterUrl ?? '#'} target="_blank" rel="noopener noreferrer">과학 출처 등록부 ↗</a></div>
            </> : null}
            <div className="info-panel__actions"><button type="button" className="info-panel__next" onClick={openPanel === 'video' && !presentationMode && nextVideo ? continueToNextVideo : continueToNextCard}>{openPanel === 'video' && !presentationMode && selectedVideo ? videoNextAction : panelNextAction}</button></div>
            <p className="info-panel__flow-note">현재 페이지의 흐름은 유지됩니다. 외부 링크는 원문 확인이 필요할 때만 선택하세요.</p>
            {openPanel === 'research' ? <div className="info-panel__source"><strong>출처</strong><p className="info-panel__source-title">Effects of Oral Gamma-Aminobutyric Acid (GABA) Administration on Stress and Sleep in Humans: A Systematic Review</p><p className="info-panel__source-meta">Hepsomali et al. · Front Neurosci. 2020;14:923 · PMID 33041752</p></div> : null}
            {presentationMode ? <div className="info-panel__customer-link"><button type="button" className="info-panel__customer-copy" onClick={copyPanelCardLink}>이 장면 고객용 링크 복사</button><p>복사한 링크는 발표자 모드 없이 이 장면에서 열립니다.</p><p className="info-panel__customer-message" aria-live="polite">{panelShareMessage}</p></div> : null}
            {openExternal ? <details className="info-panel__external-choice"><summary>외부 자료는 필요할 때만 확인 <span aria-hidden="true">＋</span></summary><a className="info-panel__external" href={openExternal} target="_blank" rel="noopener noreferrer">{panelExternalLabel} ↗</a></details> : null}
          </aside>
        </div> : null}
      </section>

      {!presentationMode && approvedVideo ? <section id="approved-video-showcase" className="approved-video-showcase video-showcase" aria-labelledby="approved-video-showcase-title">
        <div className="video-showcase__inner">
          <div className="video-showcase__heading">
            <div>
              <p className="eyebrow">GABA 영상</p>
              <h2 id="approved-video-showcase-title">GABA를 설명하는 영상만,<br /><em>쉽게 이어서 보세요.</em></h2>
            </div>
            <div>
              <p>GABA의 일반적인 내용을 설명하는 영상을 한 편씩 살펴볼 수 있습니다.</p>
              <p className="video-showcase__boundary">영상의 전체 내용은 YouTube 원문에서 확인하세요.</p>
            </div>
          </div>
          <div className="video-showcase__flow">
            <nav className="video-showcase__index" aria-label="GABA 영상 순서">
              <div className="video-showcase__index-heading"><span>GABA 영상 목록</span><strong>{String(approvedVideoIndex + 1).padStart(2, '0')} / {String(approvedVideos.length).padStart(2, '0')}</strong></div>
              <div className="video-showcase__index-list">
                {approvedVideos.map((video, index) => <button key={video.id} type="button" className={`video-showcase__index-button${index === approvedVideoIndex ? ' is-active' : ''}`} onClick={() => selectApprovedVideo(index)} aria-label={`${index + 1}번 GABA 영상 ${video.channel} 선택`} aria-current={index === approvedVideoIndex ? 'step' : undefined}>
                  <span>{String(index + 1).padStart(2, '0')}</span><strong>{video.channel}</strong><small>GABA 참고 영상</small>
                </button>)}
              </div>
              <p>한 편씩 넘겨 보며 GABA에 대한 설명을 확인하세요.</p>
            </nav>
            <article className="video-showcase__item" aria-live="polite">
              <button type="button" className="video-showcase__media" onClick={event => openVideoPanel(event.currentTarget, approvedVideo.id)} aria-label={`${approvedVideo.publicTitle ?? approvedVideo.title} 영상 정보 보기`}>
                {approvedVideo.previewImage ? <><img src={approvedVideo.previewImage} alt={approvedVideo.previewAlt ?? `${approvedVideo.title} 원문 미리보기`} loading="lazy" decoding="async" onError={event => {event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('is-image-missing');}} /><div className="video-showcase__source-mark video-showcase__source-mark--fallback"><span>공식 원문</span><strong>{approvedVideo.previewLabel}</strong><small>YouTube에서 전체 영상 보기</small></div></> : <div className="video-showcase__source-mark"><span>공식 원문</span><strong>{approvedVideo.previewLabel}</strong><small>YouTube에서 전체 영상 보기</small></div>}
                <span className="video-showcase__play" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.2v13.6L19 12 8 5.2Z" /></svg></span>
              </button>
              <div className="video-showcase__copy">
                <div className="video-showcase__meta"><span>GABA 참고 영상</span></div>
                <h3>{approvedVideo.publicTitle ?? approvedVideo.title}</h3>
                <p className="video-showcase__channel">{approvedVideo.channel} · {approvedVideo.speaker}</p>
                <p><strong>영상 요약</strong><br />{approvedVideo.publicSummary ?? approvedVideo.summary}</p>
                <p><strong>출연자와 채널</strong><br />{approvedVideo.publicPersonSummary ?? approvedVideo.personSummary}</p>
                <div className="video-showcase__actions"><button type="button" onClick={event => openVideoPanel(event.currentTarget, approvedVideo.id)}>영상 정보 보기 <span aria-hidden="true">＋</span></button><span className="video-showcase__source-note">YouTube에서 전체 영상 보기</span></div>
                <div className="video-showcase__pager" aria-label="영상 이동"><button type="button" onClick={() => selectApprovedVideo(approvedVideoIndex - 1)} disabled={approvedVideoIndex === 0}>이전 영상</button><button type="button" onClick={() => selectApprovedVideo(approvedVideoIndex + 1)} disabled={approvedVideoIndex === approvedVideos.length - 1}>다음 영상 <span aria-hidden="true">→</span></button></div>
              </div>
            </article>
          </div>
        </div>
      </section> : null}

      {!presentationMode ? <section id="video-showcase" className="video-showcase" aria-labelledby="video-showcase-title">
        <div className="video-showcase__inner">
          <div className="video-showcase__heading">
            <div>
              <p className="eyebrow">GABA 영상</p>
              <h2 id="video-showcase-title">영상은 짧게 보고,<br /><em>원문으로 확인하세요.</em></h2>
            </div>
            <div>
              <p>GABA를 설명하는 영상을 한 편씩 살펴봅니다. 영상 요약과 출연자·채널 정보를 먼저 보고, 전체 내용은 페이지 안에서 이어서 확인할 수 있습니다.</p>
              <p className="video-showcase__boundary">영상 요약은 제목과 설명을 바탕으로 정리했습니다. 전체 내용은 YouTube 원문에서 확인하세요.</p>
              <button type="button" className="video-showcase__db-button" onClick={event => openVideoPanel(event.currentTarget)}>영상 정보 보기 <span aria-hidden="true">↗</span></button>
            </div>
          </div>
          {showcaseVideo ? <div className="video-showcase__flow">
            <nav className="video-showcase__index" aria-label="GABA 영상 순서">
              <div className="video-showcase__index-heading"><span>영상 목록</span><strong>{String(showcaseVideoIndex + 1).padStart(2, '0')} / {String(SHARED_GABA_VIDEOS.length).padStart(2, '0')}</strong></div>
              <div className="video-showcase__index-list">
                {SHARED_GABA_VIDEOS.map((video, index) => <button key={video.id} type="button" className={`video-showcase__index-button${index === showcaseVideoIndex ? ' is-active' : ''}`} onClick={() => selectShowcaseVideo(index)} aria-label={`${index + 1}번 GABA 영상 ${video.channel} 선택`} aria-current={index === showcaseVideoIndex ? 'step' : undefined}>
                  <span>{String(index + 1).padStart(2, '0')}</span><strong>{video.channel}</strong><small>GABA 참고 영상</small>
                </button>)}
              </div>
              <p>한 편씩 넘겨 보며 내용을 확인하세요.</p>
            </nav>
            <article className="video-showcase__item" aria-live="polite">
              <section className="video-showcase__player" aria-label={`${showcaseVideo.publicTitle ?? showcaseVideo.title} 페이지 안에서 재생`}>
                <div className="video-showcase__player-heading"><span>GABA 설명 영상</span><small>페이지 안에서 재생</small></div>
                {showcaseVideoEmbedUrl && showcasePlayerStartedId === showcaseVideo.id ? <iframe src={showcaseVideoEmbedUrl} title={`${showcaseVideo.publicTitle ?? showcaseVideo.title} YouTube Shorts 원문 플레이어`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button type="button" className="video-showcase__player-poster" data-play-showcase-video onClick={() => setShowcasePlayerStartedId(showcaseVideo.id)} aria-label="페이지 안에서 YouTube 영상 재생 시작">
                  {showcaseVideo.previewImage ? <img className="video-showcase__player-poster-image" src={showcaseVideo.previewImage} alt="" loading="lazy" decoding="async" onError={event => {event.currentTarget.style.display = 'none';}} /> : null}
                  <span className="video-showcase__player-poster-label">GABA · YouTube Shorts</span><strong>{showcaseVideo.publicTitle ?? 'GABA 영상'}</strong><small>눌러서 페이지 안에서 영상 보기</small><span className="video-showcase__play" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.2v13.6L19 12 8 5.2Z" /></svg></span>
                </button>}
                <p className="video-showcase__player-note">영상 전체 내용은 YouTube 원문에서 확인할 수 있습니다.</p>
              </section>
              <div className="video-showcase__reel-controls" aria-label="영상 릴 이동">
                <button type="button" onClick={() => selectShowcaseVideo(showcaseVideoIndex - 1)} disabled={showcaseVideoIndex === 0}>← 이전</button>
                <span><strong>{String(showcaseVideoIndex + 1).padStart(2, '0')} / {String(SHARED_GABA_VIDEOS.length).padStart(2, '0')}</strong><small>다음 영상으로 이어보기</small></span>
                <button type="button" data-next-video-reel onClick={() => selectShowcaseVideo(showcaseVideoIndex + 1)} disabled={showcaseVideoIndex === SHARED_GABA_VIDEOS.length - 1}>다음 영상 →</button>
              </div>
              <div className="video-showcase__copy">
                <div className="video-showcase__meta"><span>GABA 참고 영상</span></div>
                <p className="video-showcase__candidate-note" role="note"><strong>GABA 알아보기 영상</strong><span>영상 전체 내용은 YouTube 원문에서 확인하세요.</span></p>
                <h3>{showcaseVideo.publicTitle ?? showcaseVideo.title}</h3>
                <p className="video-showcase__channel">{showcaseVideo.channel} · {showcaseVideo.speaker}</p>
                <p><strong>영상 요약</strong><br />{showcaseVideo.publicSummary ?? showcaseVideo.summary}</p>
                <p><strong>출연자와 채널</strong><br />{showcaseVideo.publicPersonSummary ?? showcaseVideo.personSummary}</p>
                <div className="video-showcase__actions"><button type="button" data-open-video-review onClick={event => openVideoPanel(event.currentTarget, showcaseVideo.id)}>영상 정보 보기 <span aria-hidden="true">＋</span></button><button type="button" data-share-video-link onClick={shareShowcaseVideo}>이 영상 링크 공유 <span aria-hidden="true">↗</span></button><span className="video-showcase__source-note">YouTube 원문은 영상 정보에서 보기</span><span className="video-showcase__share-message" aria-live="polite">{showcaseShareMessage}</span></div>
                <div className="video-showcase__pager" aria-label="영상 이동">
                  <button type="button" onClick={() => selectShowcaseVideo(showcaseVideoIndex - 1)} disabled={showcaseVideoIndex === 0}>이전 영상</button>
                  <button type="button" onClick={() => selectShowcaseVideo(showcaseVideoIndex + 1)} disabled={showcaseVideoIndex === SHARED_GABA_VIDEOS.length - 1}>다음 영상 <span aria-hidden="true">→</span></button>
                </div>
              </div>
            </article>
          </div> : null}
        </div>
      </section> : null}

      <section className="guardrail" aria-label="GABA 정보 안내">
        <div><span>01</span><h2>GABA의 역할</h2><p>뇌의 신호를 조절하는 GABA의 기본 기능을 알아봅니다.</p></div>
        <div><span>02</span><h2>연구로 확인하기</h2><p>스트레스·수면 관련 연구에서 확인된 변화를 살펴봅니다.</p></div>
        <div><span>03</span><h2>영상으로 더 보기</h2><p>GABA를 설명하는 영상을 함께 살펴봅니다.</p></div>
      </section>
    </main>

    <footer className="site-footer">
      <p>GABA의 역할과 연구를 차근차근 살펴보는 자료입니다.</p>
      <button type="button" className="site-footer__research-button" onClick={event => openInfoPanel(active, 'research', event.currentTarget)}>연구 출처 보기 ↗</button>
    </footer>
  </>;
}
