import {useEffect, useMemo, useRef, useState} from 'react';
import {ACTIVE_GABA_VIDEOS, DOMESTIC_PUBLIC_GABA_VIDEOS, GABA_VIDEO_DB, PUBLIC_GABA_VIDEOS, SHARED_GABA_VIDEOS, type GabaVideoRecord} from './gabaVideos';
import {GABA_MONITOR_SNAPSHOT} from './gabaMonitorSnapshot';
import {TF_MEETING_STEPS, TF_ROLES, TF_WORKSTREAMS} from './tfBoard';

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

type VideoFilter = 'ALL' | 'REVIEW' | GabaVideoRecord['status'];
type TfAssignment = Record<string, {lead: string; backup: string}>;
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
  notes: string;
  updatedAt: string;
};
type VideoReviewDrafts = Record<string, VideoReviewDraft>;

const TF_ASSIGNMENT_STORAGE_KEY = 'cellpinda-gaba-tf-assignment-draft-v1';
const VIDEO_REVIEW_STORAGE_KEY = 'cellpinda-gaba-video-review-draft-v1';
const VIDEO_REVIEW_ROLES = ['VIDEO', 'SCIENCE', 'MEDICAL', 'RIGHTS', 'PM'] as const;
const VIDEO_REVIEW_DECISIONS: Array<{id: VideoReviewDecision; label: string}> = [
  {id: 'UNDECIDED', label: '아직 결정하지 않음'},
  {id: 'HOLD', label: '보류'},
  {id: 'LIMITED_USE', label: '제한 사용 검토'},
  {id: 'PUBLISH_GENERAL', label: '일반 교육 공개 검토'},
  {id: 'EXCLUDE', label: '사용 제외'},
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
  notes: '',
  updatedAt: '',
});

const VIDEO_FILTERS: Array<{id: VideoFilter; label: string}> = [
  {id: 'ALL', label: '전체'},
  {id: 'REVIEW', label: '검토 필요'},
  {id: 'PUBLISH_GENERAL', label: '공개 승인'},
  {id: 'HOLD', label: '보류'},
  {id: 'LIMITED_USE', label: '제한 사용'},
  {id: 'EXCLUDE', label: '배제'},
];

const RESEARCH_URL = 'https://pubmed.ncbi.nlm.nih.gov/33041752/';
const RESEARCH_SOURCES = [
  {
    id: 'SRC-01',
    topic: '일반 생리',
    title: 'Synaptic inhibition and γ-aminobutyric acid in the mammalian central nervous system',
    meta: 'Obata · Proc Jpn Acad Ser B. 2013 · PMID 23574805',
    summary: 'GABA를 척추동물 억제성 시냅스의 주요 신경전달물질로 설명하는 리뷰입니다.',
    boundary: '일반 신경생리 자료이며 경구 섭취·수면 개선·제품 효능을 검증한 연구가 아닙니다.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23574805/',
  },
  {
    id: 'SRC-02',
    topic: '신경 신호 조절',
    title: 'GABA tone regulation and its cognitive functions in the brain',
    meta: 'Koh et al. · Nat Rev Neurosci. 2023 · PMID 37495761',
    summary: '빠른 억제성 신호와 tonic GABA current가 신경활동을 조절하는 기전을 다루는 리뷰입니다.',
    boundary: '기전·신경과학 리뷰이며 식품 GABA의 섭취 후 결과나 특정 제품을 말하는 자료가 아닙니다.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37495761/',
  },
  {
    id: 'SRC-03',
    topic: '경구 GABA 인체 연구',
    title: 'Effects of Oral Gamma-Aminobutyric Acid (GABA) Administration on Stress and Sleep in Humans',
    meta: 'Hepsomali et al. · Front Neurosci. 2020 · PMID 33041752',
    summary: '자연 유래·발효 GABA를 살핀 14개 위약대조 인체시험을 검토한 체계적 문헌고찰입니다.',
    boundary: '스트레스와 수면 관련 지표를 살펴본 일반 GABA 문헌고찰입니다. 연구 조건은 특정 제품의 효능과 구분해 읽습니다.',
    url: RESEARCH_URL,
  },
  {
    id: 'SRC-04',
    topic: '스트레스와 GABA 일반 연구',
    title: 'Oral intake of γ-aminobutyric acid affects mood and activities of central nervous system during stressed condition induced by mental tasks',
    meta: 'Yoto et al. · Amino Acids. 2012 · PMID 22203366',
    summary: '정신적 과제를 이용한 스트레스 조건에서 경구 GABA를 살핀 무작위·위약대조 교차 연구입니다.',
    boundary: '단일 인체시험의 조건부 결과이며 개인의 스트레스·기분이나 특정 제품의 효과로 확정하지 않습니다.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22203366/',
  },
  {
    id: 'SRC-05',
    topic: '수면과 회복',
    title: 'About Sleep',
    meta: 'NICHD · National Institutes of Health',
    summary: '수면이 학습·기억·대사·면역과 연결되고 뇌가 수면 중에도 활동한다는 일반 생리 자료입니다.',
    boundary: '수면의 중요성을 설명하는 공공기관 자료이며 GABA 섭취 효과를 입증하지 않습니다.',
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
const VIDEO_CLAIM_LABELS: Record<GabaVideoRecord['audit']['claimCategories'][number], string> = {
  GENERAL_PHYSIOLOGY: '일반 생리',
  ORAL_GABA_HUMAN_RESEARCH: '경구 GABA 인체 연구',
  SLEEP_STRESS: '수면·스트레스',
  DISEASE_TREATMENT: '질환·치료',
  PRODUCT_COMMERCIAL: '제품·상업성',
  UNREVIEWED: '미검토',
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
    answer: 'GABA는 중추신경계에서 신경 신호를 억제하는 방향으로 작용하는 대표적 신경전달물질입니다. 일상적인 진정감이나 개인의 상태를 바로 진단하는 말은 아닙니다.',
  },
  {
    label: '수면·스트레스',
    answer: '수면과 스트레스는 여러 요인의 영향을 받습니다. 일반 GABA 섭취 연구가 있다고 해서 모든 사람의 수면이나 스트레스가 개선된다고 말하지 않습니다.',
  },
  {
    label: '일반 연구',
    answer: '연구 대상·섭취량·기간·비교 조건을 함께 확인하고, 연구 결과가 특정 제품의 효능을 입증하는 것으로 확장되지 않게 설명합니다.',
  },
  {
    label: '영상 사용',
    answer: '권위자의 영상이라도 원문·자막·발언 구간·권리를 확인합니다. 공개 승인 전 후보 영상은 소비자 화면에 노출하지 않습니다.',
  },
] as const;

function makeSlides(): Slide[] {
  return [
    {
      id: 'hook',
      label: '01 · 쉽게 흥분한 날',
      title: '쉽게 흥분하고 실수가 이어지는 날, 알아둘 성분이 있습니다.',
      body: '그날의 감정이나 실수를 하나의 원인으로 단정하지 않고, 몸과 뇌가 쉬는 시간부터 살펴봅니다.',
      tone: 'deep',
      visual: STORY_VISUALS.overload,
      presenterPrompt: '최근 작은 일에 반응이 커졌거나 실수가 이어진 날이 있었나요?',
      presenterBoundary: '일상 장면을 공감하기 위한 도입이며 감정·질환·성분 부족을 진단하는 카드가 아닙니다.',
    },
    {
      id: 'recovered',
      label: '02 · 충분히 쉰 날',
      title: '충분히 쉬고 난 날에는 작은 일에도 한 번 더 생각할 여유가 생깁니다.',
      body: '말을 바로 내뱉기보다 고르고, 해야 할 일을 차분히 이어가고, 작은 실수를 알아차리는 일상으로 표현해 봅니다.',
      tone: 'fresh',
      presenterPrompt: '충분히 쉰 날에 말·집중·실수에서 무엇이 달랐는지 떠올려 보세요.',
      presenterBoundary: '좋은 컨디션의 일상 예시이며 GABA 섭취 효과를 말하는 카드가 아닙니다.',
    },
    {
      id: 'overload',
      label: '03 · 뇌 과부하 상태',
      title: '반대로 뇌가 과부하인 날에는 몸이 쉬어도 생각이 계속 다음 일로 달려갑니다.',
      body: '같은 문장을 다시 읽고, 알림에 쉽게 끌리고, 사소한 일에도 반응이 커지는 모습으로 공감할 수 있습니다.',
      tone: 'warm',
      visual: STORY_VISUALS.overload,
      presenterPrompt: '몸은 쉬고 있는데 머리가 계속 켜져 있었던 순간이 있었나요?',
      presenterBoundary: '뇌 과부하를 일상의 표현으로 사용하며, 개인의 상태를 의료적으로 판단하지 않습니다.',
    },
    {
      id: 'sleep',
      label: '04 · 회복의 시간',
      title: '잠을 자는 동안 뇌와 몸은 다음 날을 준비합니다.',
      body: '수면은 기억·대사·면역 등 여러 생리 과정과 관련된 회복 시간입니다. 부족한 회복을 한 가지 성분으로 대신할 수 있다고 단정하지 않습니다.',
      tone: 'green',
      note: '수면과 회복의 일반 정보는 공공기관 자료와 함께 확인합니다.',
      presenterPrompt: '수면이 줄어들었을 때 일상에서 가장 먼저 달라지는 것은 무엇인가요?',
      presenterBoundary: '수면 부족을 GABA 부족으로 바꾸어 설명하지 않습니다.',
    },
    {
      id: 'gaba',
      label: '05 · GABA가 등장하는 이유',
      title: '이때 자주 등장하는 성분이 GABA입니다.',
      body: 'GABA는 감마아미노부티르산을 줄여 부르는 이름입니다. 우리 몸과 뇌에서 자연스럽게 쓰이는 신경전달물질을 가리키는 일반 용어입니다.',
      tone: 'green-dark',
      visual: STORY_VISUALS.neural,
      presenterPrompt: 'GABA가 무엇을 뜻하는지부터 짧게 확인한 뒤 기능으로 넘어가겠습니다.',
      presenterBoundary: 'GABA라는 생리 성분의 설명이며 보충제 효능으로 연결하지 않습니다.',
    },
    {
      id: 'function',
      label: '06 · 뇌의 신호 조절',
      title: 'GABA는 신경 신호를 낮추는 방향으로 작용하는 대표적인 억제성 신경전달물질입니다.',
      body: '쉽게 말하면 뇌의 신호가 계속 커지지 않도록 조절하는 쪽에 가깝습니다. 흥분을 켜는 신호와 억제하는 신호의 균형 속에서 이해해야 합니다.',
      tone: 'research',
      visual: STORY_VISUALS.neural,
      note: '“뇌의 브레이크”는 이해를 위한 비유이며, 개인의 감정·수면·집중을 진단하는 표현이 아닙니다.',
      presenterPrompt: '가속 페달과 브레이크가 함께 있어야 속도를 조절할 수 있다는 비유로 설명해 보세요.',
      presenterBoundary: '일반적인 신경생리 기능 설명이며 GABA를 섭취하면 뇌가 즉시 안정된다는 뜻이 아닙니다.',
    },
    {
      id: 'research',
      label: '07 · 일반 GABA 연구',
      title: '일반 GABA 연구는 스트레스와 수면에 관한 질문을 살펴봅니다.',
      body: '14개 위약대조 인체시험을 검토한 문헌고찰처럼, 연구 대상·섭취량·기간·비교 조건을 함께 볼 때 GABA 연구를 정확하게 이해할 수 있습니다.',
      tone: 'research',
      note: '일반 GABA 연구를 읽는 기준과 상세 출처는 아래 패널에서 확인합니다.',
      presenterPrompt: '연구 대상·섭취량·기간·비교 조건을 먼저 확인해 보시겠어요?',
      presenterBoundary: '일반 GABA 연구라는 표기를 고정하고 개인 결과로 확장하지 않습니다.',
      link: {href: RESEARCH_URL, label: '일반 GABA 연구 읽기', panel: 'research'},
    },
    {
      id: 'finish',
      label: '08 · 한 문장 정리',
      title: 'GABA는 뇌의 신호 균형을 이해할 때 만나는 성분입니다.',
      body: '무엇인지, 어떤 기능으로 알려졌는지, 일반 연구가 무엇을 살펴보는지를 차례로 확인하면 과장 없이 이해할 수 있습니다. 영상 검토 후보 요약은 아래 별도 섹션에서 이어집니다.',
      tone: 'finish',
      presenterPrompt: 'GABA를 오늘 한 문장으로 설명한다면 어떻게 말하시겠어요?',
      presenterBoundary: '마지막도 교육적 요약으로 끝내며 구매나 효능 약속으로 연결하지 않습니다.',
      link: {href: RESEARCH_URL, label: '일반 GABA 연구 다시 보기', panel: 'research'},
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
  const [shareMessage, setShareMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [panelShareMessage, setPanelShareMessage] = useState('');
  const [presenterCopyMessage, setPresenterCopyMessage] = useState('');
  const [videoCopyMessage, setVideoCopyMessage] = useState('');
  const [previewImageError, setPreviewImageError] = useState(false);
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('ALL');
  const [videoQuery, setVideoQuery] = useState('');
  const [showcaseVideoIndex, setShowcaseVideoIndex] = useState(0);
  const [tfAssignments, setTfAssignments] = useState<TfAssignment>({});
  const [tfMeetingDraft, setTfMeetingDraft] = useState('');
  const [tfAssignmentMessage, setTfAssignmentMessage] = useState('');
  const [videoReviewDrafts, setVideoReviewDrafts] = useState<VideoReviewDrafts>({});
  const [videoReviewMessage, setVideoReviewMessage] = useState('');
  const railRef = useRef<HTMLDivElement>(null);
  const readerStreamRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const panelTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLElement>(null);
  const panelCloseRef = useRef<HTMLButtonElement>(null);
  const presentationRef = useRef<HTMLElement>(null);
  const presentationModeRef = useRef(false);
  const presentationReturnRef = useRef<HTMLElement | null>(null);
  const panelReturnRef = useRef<HTMLElement | null>(null);
  const shareRequestRef = useRef(0);
  const programmaticTargetRef = useRef<number | null>(null);
  const railScrollFrameRef = useRef<number | null>(null);
  const readerScrollFrameRef = useRef<number | null>(null);
  const phaseNavRef = useRef<HTMLElement>(null);
  const activePhase = STORY_PHASES.find(phase => active >= phase.start && active <= phase.end) ?? STORY_PHASES[0];
  const nextSlide = slides[active + 1];
  const publicVideo = SHARED_GABA_VIDEOS[0] ?? null;
  const showcaseVideo = SHARED_GABA_VIDEOS[showcaseVideoIndex] ?? SHARED_GABA_VIDEOS[0] ?? null;
  const panelVideos = presentationMode ? ACTIVE_GABA_VIDEOS : SHARED_GABA_VIDEOS;
  const selectedVideo = panelVideoId ? panelVideos.find(video => video.id === panelVideoId) ?? GABA_VIDEO_DB.find(video => video.id === panelVideoId) ?? null : null;
  const selectedVideoIndex = selectedVideo ? panelVideos.findIndex(video => video.id === selectedVideo.id) : -1;
  const nextVideo = selectedVideoIndex >= 0 ? panelVideos[selectedVideoIndex + 1] ?? null : null;
  const selectedVideoReviewDraft = selectedVideo ? videoReviewDrafts[selectedVideo.id] ?? makeEmptyVideoReviewDraft() : null;

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
      const saved = window.localStorage.getItem(VIDEO_REVIEW_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as VideoReviewDrafts;
      if (parsed && typeof parsed === 'object') setVideoReviewDrafts(parsed);
    } catch {
      // A local review draft is optional and must never block the public page.
    }
  }, []);
  const filteredPanelVideos = useMemo(() => {
    const query = videoQuery.trim().toLocaleLowerCase();
    const matchesFilter = (video: GabaVideoRecord) => videoFilter === 'ALL'
      || (videoFilter === 'REVIEW' && video.status !== 'PUBLISH_GENERAL')
      || video.status === videoFilter;
    return [...panelVideos]
      .filter(video => matchesFilter(video))
      .filter(video => !query || [video.id, video.title, video.channel, video.speaker].join(' ').toLocaleLowerCase().includes(query));
  }, [panelVideos, videoFilter, videoQuery]);

  const videoFilterCount = (filter: VideoFilter) => panelVideos.filter(video => filter === 'ALL'
    || (filter === 'REVIEW' && video.status !== 'PUBLISH_GENERAL')
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
      target?.scrollIntoView({behavior, inline: 'nearest', block: 'start'});
    }
    const settleDelay = behavior === 'auto' ? 80 : 850;
    window.setTimeout(() => {
      if (programmaticTargetRef.current === next) programmaticTargetRef.current = null;
    }, settleDelay);
  };

  useEffect(() => {
    if (presentationMode) return;
    const syncReader = () => {
      if (programmaticTargetRef.current !== null) return;
      if (readerScrollFrameRef.current !== null) cancelAnimationFrame(readerScrollFrameRef.current);
      readerScrollFrameRef.current = requestAnimationFrame(() => {
        readerScrollFrameRef.current = null;
        const focusLine = window.innerHeight * 0.32;
        const scenes = slideRefs.current
          .map((slide, index) => ({slide, index, rect: slide?.getBoundingClientRect()}))
          .filter(({rect}) => rect && rect.height > 0);
        const focused = scenes.find(({rect}) => rect && rect.top <= focusLine && rect.bottom >= focusLine)
          ?? scenes.sort((left, right) => Math.abs(left.rect!.top - focusLine) - Math.abs(right.rect!.top - focusLine))[0];
        if (focused) setActive(focused.index);
      });
    };
    window.addEventListener('scroll', syncReader, {passive: true});
    window.addEventListener('resize', syncReader);
    window.requestAnimationFrame(syncReader);
    return () => {
      window.removeEventListener('scroll', syncReader);
      window.removeEventListener('resize', syncReader);
      if (readerScrollFrameRef.current !== null) cancelAnimationFrame(readerScrollFrameRef.current);
    };
  }, [presentationMode, slides.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = Number(params.get('card'));
    const presenterRequested = params.get('mode') === 'presenter' || params.get('presenter') === '1';
    if (presenterRequested) {
      presentationModeRef.current = true;
      setPresentationMode(true);
    }
    if (Number.isInteger(requested) && requested >= 1 && requested <= slides.length) {
      window.requestAnimationFrame(() => goTo(requested - 1));
    }
  }, [slides.length]);

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

  const persistVideoReviewDrafts = (drafts: VideoReviewDrafts) => {
    try {
      window.localStorage.setItem(VIDEO_REVIEW_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Keep the in-memory draft when browser storage is unavailable.
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
      `타임코드: ${draft.timestamps.trim() || '미입력'}`,
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
    const entries = GABA_VIDEO_DB
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
        `타임코드: ${draft.timestamps.trim() || '미입력'}`,
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

  const copyTfAssignmentDraft = async () => {
    const lines = [
      'GABA 교육 TF 업무 배정 초안',
      `첫 회의: ${tfMeetingDraft.trim() || '미정'}`,
      '',
      ...TF_ROLES.map(role => {
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

  const copyPresenterAnswer = async (label: string, answer: string) => {
    try {
      await copyText(answer);
      setPresenterCopyMessage(`${label} 답변을 복사했습니다.`);
    } catch {
      setPresenterCopyMessage(`${label} 답변 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.`);
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

  const copyVideoCustomerBrief = async (video: GabaVideoRecord) => {
    const approvedForCustomerSummary = video.status === 'PUBLISH_GENERAL';
    const brief = [
      approvedForCustomerSummary ? `이 영상은 ${video.title}을(를) 다룹니다.` : '이 영상은 GABA 관련 영상 검토 후보입니다.',
      approvedForCustomerSummary ? video.summary : '현재 요약은 제목·공개 설명 기반의 예비 정보이며, 원문·자막·발언 구간 확인 전입니다.',
      `${video.operatorSentence} 현재 상태는 ${VIDEO_STATUS_LABELS[video.status]}이며, 이 내용을 특정 제품의 효능이나 개인의 결과로 확대해 설명하지 않습니다.`,
    ].join(' ');
    try {
      await copyText(brief);
      setVideoCopyMessage('고객 설명 3문장을 복사했습니다.');
    } catch {
      setVideoCopyMessage('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
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
      if (shareRequest === shareRequestRef.current) setPanelShareMessage('고객용 카드 링크를 복사했습니다.');
    } catch {
      if (shareRequest === shareRequestRef.current) setPanelShareMessage('고객용 카드 링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
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

  const selectShowcaseVideo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(SHARED_GABA_VIDEOS.length - 1, index));
    setShowcaseVideoIndex(nextIndex);
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

  const panelTitle = openPanel === 'research' ? '일반 GABA 연구를 읽는 방법' : openPanel === 'video' ? 'GABA 영상 DB 검토' : 'TF 운영 보드';
  const openExternal = openPanel === 'research' ? RESEARCH_URL : openPanel === 'video' ? selectedVideo?.url ?? (presentationMode ? '' : publicVideo?.url ?? '') : '';
  const panelExternalLabel = openPanel === 'research' ? '연구 원문을 새 탭에서 보기' : '선택 영상 원문 보기';
  const panelSource = panelSourceIndex ?? active;
  const panelNext = slides[Math.min(slides.length - 1, panelSource + 1)];
  const panelNextAction = panelSource < slides.length - 1
    ? `${presentationMode ? '다음 카드' : '다음 장면'}: ${panelNext.label} →`
    : presentationMode ? '카드 흐름으로 돌아가기' : '읽기 흐름으로 돌아가기';
  const videoNextAction = nextVideo ? `다음 영상: ${nextVideo.id} →` : '영상 목록으로 돌아가기';
  const introSection = <section className="intro" aria-labelledby="page-title">
    <div className="intro-copy">
      <p className="eyebrow">일반 GABA 교육 · 제품 정보 제외</p>
      <h1 id="page-title">GABA를<br /><em>한 장씩</em><br />알아보세요.</h1>
      <p className="intro-body">일상에서 느끼는 뇌의 과부하부터 GABA의 일반 기능과 연구 한계까지, 한 장에 한 메시지씩 확인해 보세요.</p>
      <p className="separation-note">이 페이지는 제품 판매나 개인별 섭취 판단을 위한 자료가 아닙니다. GABA가 무엇인지 이해하기 위한 일반 교육 흐름입니다.</p>
      <div className="intro-entry-actions">
        <a className="text-button intro-primary-button" href="#story">전체 카드부터 보기 <span aria-hidden="true">↓</span></a>
        <button type="button" className="text-button intro-presentation-button" onClick={event => enterPresentation(event.currentTarget, 0)}>발표자용 설명 시작 <span aria-hidden="true">↗</span></button>
      </div>
    </div>
    <div className="intro-orbit" aria-hidden="true"><span>GABA</span><i>일상<br />이해</i></div>
  </section>;
  const readerSlide = slides[active];
  const consumerStory = <>
    <div className="story-reader-heading">
      <div>
        <p className="eyebrow">한 흐름으로 읽는 일반 GABA</p>
        <h2 id="story-title">GABA를<br /><em>8개의 장면으로</em></h2>
        <p>아래로 읽고, 궁금한 장면으로 바로 이동하세요.<br />일상·기능·연구·영상은 각각 다른 정보입니다.</p>
      </div>
      <div className="story-reader-heading__count" aria-live="polite"><span>현재 장면</span><strong>{String(active + 1).padStart(2, '0')}</strong><small>/ 08</small></div>
    </div>
    <div className="story-reader-tools">
      <button type="button" onClick={shareCardLink}>현재 장면 링크 공유 <span aria-hidden="true">↗</span></button>
      <button type="button" onClick={event => enterPresentation(event.currentTarget, active)}>발표자용 화면 <span aria-hidden="true">→</span></button>
    </div>
    <p className="story-share-message" aria-live="polite">{shareMessage}</p>
    {shareUrl ? <div className="story-share-row"><input className="story-share-url" value={shareUrl} readOnly aria-label="고객에게 전달할 장면 링크" onFocus={event => event.currentTarget.select()} /><button type="button" className="story-share-copy-button" onClick={copySharedCardLink}>링크 복사</button></div> : null}
    <div className="story-reader-phase-wrap">
      <nav ref={phaseNavRef} className="story-reader-phase" aria-label="장면 흐름 단계">
        {STORY_PHASES.map((phase, index) => <span key={phase.id} data-phase={phase.id} className={phase.id === activePhase.id ? 'is-active' : ''} aria-current={phase.id === activePhase.id ? 'step' : undefined}>
          {phase.label}{index < STORY_PHASES.length - 1 ? <i aria-hidden="true">→</i> : null}
        </span>)}
      </nav>
    </div>
    <div className="story-reader-layout">
      <aside className="story-reader-index" aria-label="GABA 소개 장면 목록">
        <p className="story-reader-index__label">전체 흐름</p>
        <ol>
          {slides.map((slide, index) => <li key={slide.id}>
            <button type="button" className={index === active ? 'is-active' : ''} aria-current={index === active ? 'step' : undefined} onClick={() => goTo(index, 'auto')}>
              <span>{String(index + 1).padStart(2, '0')}</span><strong>{slide.label.replace(/^\d+\s·\s/, '')}</strong>
            </button>
          </li>)}
        </ol>
        <p className="story-reader-index__hint">읽은 위치는 자동으로 기억됩니다.<br />원하는 장면을 눌러 다시 볼 수 있어요.</p>
      </aside>
      <div className="story-reader-stream" ref={readerStreamRef}>
        {slides.map((slide, index) => <article
          key={slide.id}
          id={`story-scene-${slide.id}`}
          ref={element => {slideRefs.current[index] = element;}}
          data-index={index}
          className={`story-reader-scene story-reader-scene--${slide.tone}${index === active ? ' is-active' : ''}`}
          aria-labelledby={`reader-slide-${slide.id}`}
        >
          <div className="story-reader-scene__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
          <div className="story-reader-scene__copy">
            <p className="story-reader-scene__label">{slide.label}</p>
            <h3 id={`reader-slide-${slide.id}`} tabIndex={-1}>{slide.title}</h3>
            <p>{slide.body}</p>
            {slide.link ? <button type="button" className="reader-link" ref={element => {panelTriggerRefs.current[index] = element;}} onClick={event => openInfoPanel(index, slide.link!.panel, event.currentTarget)}>{slide.link.label} <span aria-hidden="true">↗</span></button> : null}
            {slide.note ? <p className="story-reader-scene__note">{slide.note}</p> : null}
          </div>
          {slide.visual ? <div className="story-reader-scene__visual" aria-hidden="true" style={{backgroundImage: `url("${slide.visual}")`}} /> : <div className="story-reader-scene__rule" aria-hidden="true" />}
        </article>)}
      </div>
      <aside className="story-reader-aside" aria-label="현재 장면의 핵심 안내">
        <div className="story-reader-aside__block story-reader-aside__block--current">
          <p className="story-reader-aside__kicker">지금 읽는 장면</p>
          <strong>{readerSlide.label.replace(/^\d+\s·\s/, '')}</strong>
          <p>{readerSlide.note ?? readerSlide.body}</p>
        </div>
        <div className="story-reader-aside__block">
          <p className="story-reader-aside__kicker">일반 GABA 연구</p>
          <p>이 페이지는 GABA의 일반 기능과 연구를 소개합니다. 연구 결과는 조건과 한계를 확인하고, 특정 제품의 효능으로 확장하지 않습니다.</p>
          <button type="button" onClick={event => openInfoPanel(active, 'research', event.currentTarget)}>연구 읽는 기준 보기 <span aria-hidden="true">↗</span></button>
        </div>
      </aside>
    </div>
    <div className="story-reader-next" aria-live="polite">
      <div><span>{nextSlide ? '다음 장면' : '다음 섹션'}</span><strong>{nextSlide ? nextSlide.label : '영상 검토 후보'}</strong></div>
      {nextSlide ? <button type="button" onClick={() => goTo(active + 1)}>다음 장면 <span aria-hidden="true">↓</span></button> : <a href="#video-showcase">영상 요약으로 이어가기 <span aria-hidden="true">↓</span></a>}
    </div>
  </>;

  return <>
    <header className={`site-header${presentationMode ? '' : ' site-header--consumer'}`}>
      <a className="brand" href="#top">GABA<span>.</span></a>
      <p>일반 GABA 교육 자료</p>
    </header>

    <main id="top" className={presentationMode ? 'presenter-main' : 'consumer-main'}>
      {presentationMode ? introSection : null}

      <section id="story" ref={presentationRef} className={`story${presentationMode ? ' story--presentation' : ' story--reader'}`} role={presentationMode ? 'dialog' : undefined} aria-labelledby="story-title" aria-modal={presentationMode ? 'true' : undefined} aria-keyshortcuts={presentationMode ? 'ArrowLeft ArrowRight PageUp PageDown Home End Escape' : undefined}>
        {presentationMode ? <>
        <div className="story-heading">
          <div>
            <p className="eyebrow">장면마다 한 메시지</p>
            <h2 id="story-title">GABA를<br />8개의 장면으로</h2>
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
          <span aria-live="polite" aria-label={`현재 ${active + 1}번째 카드, 총 ${slides.length}장`}>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div>
            {presentationMode ? <button type="button" className="story-start-button story-video-db-button" onClick={event => openVideoPanel(event.currentTarget)}>영상 DB</button> : null}
            {presentationMode ? <button type="button" className="story-start-button story-ops-board-button" onClick={event => openInfoPanel(active, 'ops', event.currentTarget)}>운영 보드</button> : null}
            <button type="button" className="story-nav-button story-prev-button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="이전 장면"><span aria-hidden="true">←</span><span className="nav-label">이전 장면</span></button>
            <button type="button" className="story-nav-button story-next-button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="다음 장면"><span className="nav-label">다음 장면</span><span aria-hidden="true">→</span></button>
            {presentationMode ? <>
              <button type="button" className="story-share-button" onClick={shareCardLink}>현재 카드 링크 공유</button>
              <button type="button" className="story-presentation-toggle" onClick={exitPresentation}>발표 모드 종료</button>
            </> : <details className="story-secondary-controls">
              <summary>더 보기 <span aria-hidden="true">＋</span></summary>
              <button type="button" className="story-share-button" onClick={shareCardLink}>현재 카드 링크 공유</button>
              <button type="button" className="story-presentation-toggle" onClick={event => enterPresentation(event.currentTarget)}>발표 모드</button>
            </details>}
          </div>
        </div>
        <p className="story-share-message" aria-live="polite">{shareMessage}</p>
        {shareUrl ? <div className="story-share-row"><input className="story-share-url" value={shareUrl} readOnly aria-label="고객에게 전달할 카드 링크" onFocus={event => event.currentTarget.select()} /><button type="button" className="story-share-copy-button" onClick={copySharedCardLink}>고객용 링크 복사</button></div> : null}
        {presentationMode ? <>
          <p className="presenter-next-hint" aria-live="polite">{nextSlide ? <>다음 설명: <strong>{nextSlide.label}</strong></> : '마지막 설명 카드입니다.'}</p>
          <details className="presenter-note"><summary>발표자용 진행 포인트</summary><div className="presenter-note__grid"><div><strong>고객에게 물어보기</strong><p>{slides[active].presenterPrompt}</p></div><div><strong>이어서 말할 때</strong><p>{slides[active].presenterBoundary}</p></div></div></details>
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
          <aside className="info-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="info-panel-title">
            <div className="info-panel__topline"><span>{presentationMode ? '카드 흐름 안에서 확인' : '읽기 흐름 안에서 확인'}</span><button ref={panelCloseRef} type="button" onClick={() => closePanel()} aria-label="정보 패널 닫기">×</button></div>
            <p className="eyebrow">{openPanel === 'research' ? '일반 GABA 연구' : openPanel === 'video' ? (presentationMode ? '영상 DB 감리' : '영상 검토 DB') : '발표자 운영'}</p>
            <h2 id="info-panel-title">{panelTitle}</h2>
            {openPanel === 'research' ? <>
              <p>연구 결과를 볼 때는 무엇을 살펴봤는지와 어떤 조건이었는지를 함께 확인하세요.</p>
              <p className="info-panel__evidence">연결된 문헌고찰은 일반 GABA 섭취를 살펴본 14개 위약대조 인체시험을 검토했습니다. 연구 대상·섭취량·기간·비교 조건을 함께 확인하는 자료입니다.</p>
              <ul><li>참여자와 연구 대상이 누구였는지</li><li>섭취량과 기간이 어떻게 설정됐는지</li><li>비교 조건과 측정 방법이 무엇이었는지</li></ul>
              <p className="info-panel__boundary">이 자료는 일반 GABA 원료와 GABA 섭취 연구를 구분해 읽도록 돕는 일반 교육 자료입니다.</p>
              <details className="info-panel__research-sources">
                <summary>근거 출처 5건 펼쳐 보기 <span aria-hidden="true">＋</span></summary>
                <div className="research-source-list">
                  {RESEARCH_SOURCES.map(source => <article key={source.id}>
                    <p className="research-source-list__topic">{source.id} · {source.topic}</p>
                    <h3>{source.title}</h3>
                    <p>{source.summary}</p>
                    <p className="research-source-list__meta">{source.meta}</p>
                    <p className="research-source-list__boundary">{source.boundary}</p>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">원문 출처 보기 ↗</a>
                  </article>)}
                </div>
              </details>
            </> : null}
            {openPanel === 'video' ? <>
              <p>{presentationMode ? '발표자용 영상 DB 감리 화면입니다. 공개 후보를 원문·자막·인물·근거·권리 기준으로 확인하고, 영상별 권위 수준과 공개 여부를 따로 결정합니다.' : '오늘 공유하신 국내 YouTube Shorts를 원문 확인용으로 소개합니다. 영상의 권위와 주장은 감리 상태를 따로 확인해 주세요.'}</p>
              <p className="info-panel__status">{presentationMode ? `감리 대장 ${GABA_VIDEO_DB.length}건 · 현재 국내 큐 ${filteredPanelVideos.length}건 · DB 승인 이력 ${PUBLIC_GABA_VIDEOS.length}건 · 국내 공개 승인 ${DOMESTIC_PUBLIC_GABA_VIDEOS.length}건 · 감리 초안 ${Object.keys(videoReviewDrafts).length}건` : `오늘 공유 영상 ${SHARED_GABA_VIDEOS.length}건 · 원문 확인 필요`}</p>
              {presentationMode ? <div className="video-review-summary" aria-label="감리 초안 전체 복사"><span>현재 브라우저 감리 초안 {Object.keys(videoReviewDrafts).length}건</span><button type="button" disabled={!Object.keys(videoReviewDrafts).length} onClick={copyAllVideoReviewDrafts}>작성 초안 전체 복사</button><small aria-live="polite">{videoReviewMessage}</small></div> : null}
              {presentationMode ? <div className="monitor-snapshot">
                <p className="eyebrow">일일 감리 상태</p>
                <p><strong>{GABA_MONITOR_SNAPSHOT.checkedAt}</strong> 마지막 자동 확인 · 채널 {GABA_MONITOR_SNAPSHOT.sourceChannels}/{GABA_MONITOR_SNAPSHOT.registeredChannels} · 검색어 {GABA_MONITOR_SNAPSHOT.discoveryQueries}/{GABA_MONITOR_SNAPSHOT.totalDiscoveryQueries}</p>
                <p>검토 대기 {GABA_MONITOR_SNAPSHOT.pendingReview}건 · SCIENCE/MEDICAL 우선 {GABA_MONITOR_SNAPSHOT.scienceMedicalPriority}건 · 신규 후보 {GABA_MONITOR_SNAPSHOT.newCandidates}건 · 자동 공개 {GABA_MONITOR_SNAPSHOT.autoPublish}건</p>
                <p>등록 영상 원문 링크 {GABA_MONITOR_SNAPSHOT.registeredVideoLinksHealthy}/{GABA_MONITOR_SNAPSHOT.registeredVideoLinksChecked} 접근 확인 · 링크 경고 {GABA_MONITOR_SNAPSHOT.registeredVideoLinkWarnings}건</p>
                <p>등록 YouTube 메타데이터 {GABA_MONITOR_SNAPSHOT.registeredVideoMetadataHealthy}/{GABA_MONITOR_SNAPSHOT.registeredVideoMetadataChecked} 제목·채널 확인 · 메타데이터 경고 {GABA_MONITOR_SNAPSHOT.registeredVideoMetadataWarnings}건</p>
                <p>등록 YouTube 자막 트랙 {GABA_MONITOR_SNAPSHOT.registeredVideoCaptionTracksAvailable}/{GABA_MONITOR_SNAPSHOT.registeredVideoCaptionTracksChecked} 발견 · 자막 경고 {GABA_MONITOR_SNAPSHOT.registeredVideoCaptionTrackWarnings}건</p>
                <p>등록 YouTube 자막 본문 {GABA_MONITOR_SNAPSHOT.registeredVideoCaptionBodiesAvailable}/{GABA_MONITOR_SNAPSHOT.registeredVideoCaptionBodiesChecked} 확인 · 본문 경고 {GABA_MONITOR_SNAPSHOT.registeredVideoCaptionBodyWarnings}건</p>
                <div className="monitor-snapshot__queue" aria-label="오늘 먼저 검토할 후보">
                  <p className="eyebrow">오늘 먼저 검토할 후보</p>
                  {GABA_MONITOR_SNAPSHOT.pendingQueue.length ? <ol>{GABA_MONITOR_SNAPSHOT.pendingQueue.map(candidate => <li key={candidate.id}><details><summary><strong>{candidate.priority}</strong><span>{candidate.title}</span></summary><div><small>상태: PENDING_REVIEW · 첫 담당: {candidate.reviewer}</small><small>다음 행동: {candidate.nextAction}</small><small>발견 경로: {candidate.channel}</small><small>주의 신호: {candidate.signals.join(' · ')}</small><small>원문·자막·화자·권리 확인 전에는 공개하지 않습니다.</small></div></details></li>)}</ol> : <p>현재 검토 대기 후보가 없습니다.</p>}
                  <small>제목·공개 설명 기반 우선순위입니다. 영상 원문·자막·화자·권리 확인 전 공개 승인으로 보지 않습니다.</small>
                </div>
                <div className="monitor-snapshot__authority-queue" aria-label="권위 후보 확인 큐">
                  <p className="eyebrow">권위 후보 확인</p>
                  {GABA_MONITOR_SNAPSHOT.authorityQueue.length ? <ol>{GABA_MONITOR_SNAPSHOT.authorityQueue.map(candidate => <li key={candidate.id}><details><summary><strong>{candidate.id.replace(/^PENDING-\d+-/, '')}</strong><span>{candidate.title}</span></summary><div><small>발견 신호: {candidate.signals.join(' · ')}</small><small>다음 행동: {candidate.nextAction}</small><small>발견 경로: {candidate.channel}</small><small>자격·실제 화자·원문·자막·권리 확인 전에는 권위 영상으로 공개하지 않습니다.</small></div></details></li>)}</ol> : <p>현재 권위 후보 신호가 있는 영상이 없습니다.</p>}
                  <small>검색어·제목 기반의 발견 신호일 뿐, 의사·과학자 자격이나 영상의 과학적 타당성을 승인하지 않습니다.</small>
                </div>
                <div className="monitor-snapshot__links"><a href={GABA_MONITOR_SNAPSHOT.triageUrl} target="_blank" rel="noopener noreferrer">감리 우선순위 보드 원문 ↗</a><a href={GABA_MONITOR_SNAPSHOT.reportUrl} target="_blank" rel="noopener noreferrer">일일 리포트 ↗</a><a href={GABA_MONITOR_SNAPSHOT.reviewSessionUrl} target="_blank" rel="noopener noreferrer">오늘 리뷰 세션 ↗</a></div>
              </div> : null}
              {presentationMode ? <div className="video-db-tools">
                <label className="video-db-search">영상 DB 검색
                  <input type="search" value={videoQuery} onChange={event => setVideoQuery(event.currentTarget.value)} placeholder="제목·채널·화자·ID" aria-label="영상 DB 검색" />
                </label>
                <div className="video-db-filters" role="group" aria-label="영상 DB 상태 필터">
                  {VIDEO_FILTERS.map(filter => <button key={filter.id} type="button" className={videoFilter === filter.id ? 'is-active' : ''} aria-pressed={videoFilter === filter.id} onClick={() => setVideoFilter(filter.id)}>
                    {filter.label}<span>{videoFilterCount(filter.id)}</span>
                  </button>)}
                </div>
              </div> : null}
              <div className="video-db-list" aria-label="GABA 영상 DB 목록">
                {filteredPanelVideos.length ? filteredPanelVideos.map(video => <article key={video.id} className={'video-db-item' + (panelVideoId === video.id ? ' is-selected' : '')}>
                  <div className="video-db-item__topline"><span>{video.id}</span><strong>{VIDEO_STATUS_LABELS[video.status]}</strong></div>
                  <h3>{presentationMode ? video.title : video.publicTitle ?? video.title}</h3>
                  <p>{video.channel}</p>
                  <button type="button" className="video-db-item__select" aria-pressed={panelVideoId === video.id} onClick={() => setPanelVideoId(video.id)}>{panelVideoId === video.id ? '선택된 영상' : '이 영상 검토'}</button>
                </article>) : <p className="info-panel__flow-note">현재 조건에 맞는 영상이 없습니다. 검색어를 지우거나 다른 상태를 선택하세요.</p>}
              </div>
              {selectedVideo ? <div className="video-db-detail">
                <p className="eyebrow">선택 영상 상세 · {VIDEO_STATUS_LABELS[selectedVideo.status]}</p>
                <h3 tabIndex={-1}>{presentationMode ? selectedVideo.title : selectedVideo.publicTitle ?? selectedVideo.title}</h3>
                {selectedVideo.previewImage || selectedVideo.previewLabel ? <figure className={'video-db-preview' + (!selectedVideo.previewImage || previewImageError ? ' video-db-preview--source' : '')}>
                  {selectedVideo.previewImage && !previewImageError ? <img src={selectedVideo.previewImage} alt={selectedVideo.previewAlt ?? `${selectedVideo.title} 공식 원문 미리보기`} loading="lazy" decoding="async" onError={() => setPreviewImageError(true)} /> : <div className="video-db-preview__source-mark"><span>공식 교육기관</span><strong>{selectedVideo.previewLabel}</strong><small>원문 페이지·대본 확인</small></div>}
                  <figcaption>공식 원문 페이지 미리보기 · 영상 재생과 전체 맥락은 원문에서 확인합니다.</figcaption>
                </figure> : null}
                <div className="video-db-detail__summary">
                  <p><strong>무엇을 어떻게 소개했나</strong><br />{presentationMode ? selectedVideo.summary : selectedVideo.publicSummary ?? selectedVideo.summary}</p>
                  <p><strong>인물 소개</strong><br />{presentationMode ? selectedVideo.personSummary : selectedVideo.publicPersonSummary ?? selectedVideo.personSummary}</p>
                </div>
                <div className="video-db-detail__operator"><strong>사업자 설명 한 문장</strong><p>{presentationMode ? selectedVideo.operatorSentence : selectedVideo.publicOperatorSentence ?? selectedVideo.operatorSentence}</p>{presentationMode ? <><div className="video-db-detail__operator-actions"><button type="button" onClick={() => copyVideoOperatorSentence(selectedVideo)}>설명 문장 복사</button><button type="button" onClick={() => copyVideoCustomerBrief(selectedVideo)}>고객 설명 3문장 복사</button></div><span aria-live="polite">{videoCopyMessage}</span></> : null}</div>
                <dl className="video-db-audit" aria-label="영상 감리 필드">
                  <div><dt>확인 기반</dt><dd>{VIDEO_AUDIT_LABELS.contentBasis[selectedVideo.audit.contentBasis]}</dd></div>
                  <div><dt>권위</dt><dd>{VIDEO_AUDIT_LABELS.authorityLevel[selectedVideo.audit.authorityLevel]}</dd></div>
                  <div><dt>근거</dt><dd>{VIDEO_AUDIT_LABELS.evidenceLevel[selectedVideo.audit.evidenceLevel]}</dd></div>
                  <div><dt>사용 방식</dt><dd>{VIDEO_AUDIT_LABELS.usageMode[selectedVideo.audit.usageMode]}</dd></div>
                  <div><dt>권리</dt><dd>{VIDEO_AUDIT_LABELS.rightsStatus[selectedVideo.audit.rightsStatus]}</dd></div>
                  {presentationMode ? <div><dt>주장 범위</dt><dd>{selectedVideo.audit.claimCategories.map(category => VIDEO_CLAIM_LABELS[category]).join(' · ')}</dd></div> : null}
                </dl>
                <p className="video-db-detail__next"><strong>다음 감리 행동</strong><br />{presentationMode ? selectedVideo.audit.nextAction : '원문·자막·화자·권리 확인 전에는 영상 내용이나 효능으로 확장하지 않습니다.'}</p>
                <p className="info-panel__status">{presentationMode ? selectedVideo.statusReason : '이 영상은 일반 GABA 교육에 활용할 수 있는지 확인 중인 검토 후보입니다.'}</p>
                <p className="video-db-detail__meta">확인일 {selectedVideo.checkedAt} · 채널 {selectedVideo.channel} · 화자 {selectedVideo.speaker}{selectedVideo.sourceChannelUrl ? <> · <a href={selectedVideo.sourceChannelUrl} target="_blank" rel="noopener noreferrer">채널 원문 보기 ↗</a></> : null}{selectedVideo.authorityEvidenceUrl ? <> · <a href={selectedVideo.authorityEvidenceUrl} target="_blank" rel="noopener noreferrer">화자·소속 확인 출처 ↗</a></> : null}{selectedVideo.researchEvidenceUrl ? <> · <a href={selectedVideo.researchEvidenceUrl} target="_blank" rel="noopener noreferrer">관련 연구 기록 ↗</a></> : null}</p>
                {presentationMode && selectedVideoReviewDraft ? <details className="video-review-draft">
                  <summary>이 영상 감리 기록 초안 <span aria-hidden="true">＋</span></summary>
                  <div className="video-review-draft__body">
                    <p className="video-review-draft__note">원문·자막·화자·권리·주장 범위를 팀원이 확인하며 남기는 브라우저 로컬 초안입니다. 입력만으로 공개 승인이나 DB 상태는 바뀌지 않습니다.</p>
                    <div className="video-review-draft__fields">
                      <label>담당자<input data-review-field="reviewer" type="text" value={selectedVideoReviewDraft.reviewer} onChange={event => updateVideoReviewDraft('reviewer', event.currentTarget.value)} placeholder="예: 홍길동" /></label>
                      <label>역할<select data-review-field="role" value={selectedVideoReviewDraft.role} onChange={event => updateVideoReviewDraft('role', event.currentTarget.value)}>{VIDEO_REVIEW_ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select></label>
                      <label>결정 초안<select data-review-field="decision" value={selectedVideoReviewDraft.decision} onChange={event => updateVideoReviewDraft('decision', event.currentTarget.value as VideoReviewDecision)}>{VIDEO_REVIEW_DECISIONS.map(decision => <option key={decision.id} value={decision.id}>{decision.label}</option>)}</select></label>
                      <label>확인 타임코드<input data-review-field="timestamps" type="text" value={selectedVideoReviewDraft.timestamps} onChange={event => updateVideoReviewDraft('timestamps', event.currentTarget.value)} placeholder="예: 00:12–00:28" /></label>
                    </div>
                    <fieldset className="video-review-draft__checks">
                      <legend>확인 체크</legend>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.sourceChecked} onClick={() => updateVideoReviewDraft('sourceChecked', !selectedVideoReviewDraft.sourceChecked)} onChange={() => undefined} /> 원문/영상 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.transcriptChecked} onClick={() => updateVideoReviewDraft('transcriptChecked', !selectedVideoReviewDraft.transcriptChecked)} onChange={() => undefined} /> 자막/대본 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.speakerChecked} onClick={() => updateVideoReviewDraft('speakerChecked', !selectedVideoReviewDraft.speakerChecked)} onChange={() => undefined} /> 화자·자격 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.rightsChecked} onClick={() => updateVideoReviewDraft('rightsChecked', !selectedVideoReviewDraft.rightsChecked)} onChange={() => undefined} /> 권리·사용 방식 확인</label>
                      <label><input type="checkbox" checked={selectedVideoReviewDraft.claimScopeChecked} onClick={() => updateVideoReviewDraft('claimScopeChecked', !selectedVideoReviewDraft.claimScopeChecked)} onChange={() => undefined} /> 주장 범위·연구 구분 확인</label>
                    </fieldset>
                    <label className="video-review-draft__notes">팀 메모<textarea data-review-field="notes" value={selectedVideoReviewDraft.notes} onChange={event => updateVideoReviewDraft('notes', event.currentTarget.value)} placeholder="확인한 발언, 근거, 이견, 다음 질문을 기록하세요." rows={4} /></label>
                    <div className="video-review-draft__actions"><button type="button" onClick={copyVideoReviewDraft}>감리 기록 초안 복사</button><span aria-live="polite">{videoReviewMessage}</span></div>
                    <small className="video-review-draft__saved">{selectedVideoReviewDraft.updatedAt ? `마지막 저장 ${selectedVideoReviewDraft.updatedAt.replace('T', ' ').replace('Z', '')}` : '아직 입력하지 않았습니다.'}</small>
                  </div>
                </details> : null}
              </div> : null}
              <p className="info-panel__boundary">{presentationMode ? '공유 영상의 요약은 감리 전 예비 정리입니다. 원문·자막·인물·권리 상태를 확인하고 일반 GABA 연구나 제품 효능과 구분해 읽습니다.' : '소비자 화면에서는 원본의 건강·상업 주장을 재전달하지 않고, 일반 GABA 교육과 영상 검토 상태만 안내합니다. 전체 맥락은 상세 패널의 원문 선택에서 확인하세요.'}</p>
            </> : null}
            {openPanel === 'ops' ? <>
              <p>이 보드는 공개 소비자용 내용이 아니라, 일반 GABA 교육 자료를 검토·회의·배포하는 사업자용 운영 화면입니다.</p>
              <div className="tf-board__metrics" aria-label="TF 운영 현황">
                <div><strong>{GABA_MONITOR_SNAPSHOT.humanRoleAssigned}/{GABA_MONITOR_SNAPSHOT.humanRoleTotal}</strong><span>핵심 역할 배정</span></div>
                <div><strong>{GABA_MONITOR_SNAPSHOT.humanSourceReviewed}/{GABA_MONITOR_SNAPSHOT.humanSourceTotal}</strong><span>출처 사람 검토</span></div>
                <div><strong>{GABA_MONITOR_SNAPSHOT.domesticPublicApproved}/{GABA_MONITOR_SNAPSHOT.domesticVideoTotal}</strong><span>국내 공개 승인 · DB 이력 {GABA_MONITOR_SNAPSHOT.registeredVideoApproved}건</span></div>
                <div><strong>{GABA_MONITOR_SNAPSHOT.firstMeetingReady ? '입력됨' : '필요'}</strong><span>첫 회의 입력</span></div>
              </div>
              <details className="tf-board__assignment">
                <summary>팀 업무 배정 초안 만들기 <span aria-hidden="true">＋</span></summary>
                <div className="tf-board__assignment-body">
                  <p>주 담당자·백업·첫 회의 일시를 입력하면 이 브라우저에만 저장하고, 회의 전에 복사해 공유할 수 있습니다.</p>
                  <div className="tf-board__role-list">
                    {TF_ROLES.map(role => <div key={role.id} className="tf-board__role-row">
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
              <div className="tf-board__list">
                {TF_WORKSTREAMS.map(workstream => <article key={workstream.id} className="tf-board__item">
                  <div className="tf-board__item-topline"><span>{workstream.id}</span><strong>HOLD</strong></div>
                  <h3>{workstream.title}</h3>
                  <p><b>담당:</b> {workstream.owner}</p>
                  <p><b>다음 행동:</b> {workstream.action}</p>
                  <p className="tf-board__exit"><b>종료 조건:</b> {workstream.exit}</p>
                </article>)}
              </div>
              <details className="tf-board__meeting"><summary>첫 회의 진행 순서 <span aria-hidden="true">＋</span></summary><ol>{TF_MEETING_STEPS.map(step => <li key={step}>{step}</li>)}</ol></details>
              <p className="info-panel__boundary">AI-OPS는 문서·코드·QA·업무 추적을 실행하지만, 과학·의학·권리·현장·최종 공개 승인을 대신하지 않습니다.</p>
              <div className="tf-board__links"><a href={GABA_MONITOR_SNAPSHOT.kickoffUrl} target="_blank" rel="noopener noreferrer">첫 회의 준비서 ↗</a><a href={GABA_MONITOR_SNAPSHOT.sourceRegisterUrl} target="_blank" rel="noopener noreferrer">과학 출처 등록부 ↗</a></div>
            </> : null}
            <div className="info-panel__actions"><button type="button" className="info-panel__next" onClick={openPanel === 'video' && !presentationMode && nextVideo ? continueToNextVideo : continueToNextCard}>{openPanel === 'video' && !presentationMode && selectedVideo ? videoNextAction : panelNextAction}</button></div>
            <p className="info-panel__flow-note">현재 페이지의 흐름은 유지됩니다. 외부 링크는 원문 확인이 필요할 때만 선택하세요.</p>
            {openPanel === 'research' ? <div className="info-panel__source"><strong>출처</strong><p className="info-panel__source-title">Effects of Oral Gamma-Aminobutyric Acid (GABA) Administration on Stress and Sleep in Humans: A Systematic Review</p><p className="info-panel__source-meta">Hepsomali et al. · Front Neurosci. 2020;14:923 · PMID 33041752</p></div> : null}
            {presentationMode ? <div className="info-panel__customer-link"><button type="button" className="info-panel__customer-copy" onClick={copyPanelCardLink}>이 카드 고객용 링크 복사</button><p>복사한 링크는 발표자 모드 없이 이 카드에서 열립니다.</p><p className="info-panel__customer-message" aria-live="polite">{panelShareMessage}</p></div> : null}
            {openExternal ? <details className="info-panel__external-choice"><summary>외부 자료는 필요할 때만 확인 <span aria-hidden="true">＋</span></summary><a className="info-panel__external" href={openExternal} target="_blank" rel="noopener noreferrer">{panelExternalLabel} ↗</a></details> : null}
          </aside>
        </div> : null}
      </section>

      {!presentationMode ? <section id="video-showcase" className="video-showcase" aria-labelledby="video-showcase-title">
        <div className="video-showcase__inner">
          <div className="video-showcase__heading">
            <div>
              <p className="eyebrow">별도 섹션 · 영상 요약</p>
              <h2 id="video-showcase-title">영상은 짧게 보고,<br /><em>원문으로 확인하세요.</em></h2>
            </div>
            <div>
              <p>오늘 공유하신 국내 YouTube Shorts를 히어로 샷과 요약 버전으로 소개합니다. 아래 내용은 원문 확인 전 예비 정리이며, 각 영상의 원문 링크에서 전체 맥락을 확인할 수 있습니다.</p>
              <p className="video-showcase__boundary">오늘 공유된 검토 후보입니다. 화자 자격·발언 근거·권리 상태를 별도로 감리하며, 일반 GABA 연구나 특정 제품의 효능을 보증하지 않습니다.</p>
              <p className="video-showcase__freshness">영상 DB 자동 확인 {GABA_MONITOR_SNAPSHOT.checkedAt} · 공개 승인은 사람 검토 후</p>
              <button type="button" className="video-showcase__db-button" onClick={event => openVideoPanel(event.currentTarget)}>영상 DB 상세 감리 보기 <span aria-hidden="true">↗</span></button>
            </div>
          </div>
          {showcaseVideo ? <div className="video-showcase__flow">
            <nav className="video-showcase__index" aria-label="오늘 공유 영상 순서">
              <div className="video-showcase__index-heading"><span>오늘의 검토 흐름</span><strong>{String(showcaseVideoIndex + 1).padStart(2, '0')} / {String(SHARED_GABA_VIDEOS.length).padStart(2, '0')}</strong></div>
              <div className="video-showcase__index-list">
                {SHARED_GABA_VIDEOS.map((video, index) => <button key={video.id} type="button" className={`video-showcase__index-button${index === showcaseVideoIndex ? ' is-active' : ''}`} onClick={() => selectShowcaseVideo(index)} aria-current={index === showcaseVideoIndex ? 'step' : undefined}>
                  <span>{String(index + 1).padStart(2, '0')}</span><strong>{video.channel}</strong><small>{VIDEO_STATUS_LABELS[video.status]}</small>
                </button>)}
              </div>
              <p>한 편씩 확인하고, 필요한 경우에만 상세 감리에서 원문을 엽니다.</p>
            </nav>
            <article className="video-showcase__item" aria-live="polite">
              <button type="button" className="video-showcase__media" onClick={event => openVideoPanel(event.currentTarget, showcaseVideo.id)} aria-label={`${showcaseVideo.publicTitle ?? showcaseVideo.title} 상세 감리 보기`}>
                {showcaseVideo.previewImage ? <><img src={showcaseVideo.previewImage} alt={showcaseVideo.previewAlt ?? `${showcaseVideo.title} YouTube Shorts 미리보기`} loading="eager" decoding="async" onError={event => {event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('is-image-missing');}} /><div className="video-showcase__source-mark video-showcase__source-mark--fallback"><span>YouTube Shorts</span><strong>{showcaseVideo.previewLabel}</strong><small>원문 링크·대본 확인</small></div></> : <div className="video-showcase__source-mark"><span>YouTube Shorts</span><strong>{showcaseVideo.previewLabel}</strong><small>원문 링크·대본 확인</small></div>}
                <span className="video-showcase__play" aria-hidden="true">＋</span>
              </button>
              <div className="video-showcase__copy">
                <div className="video-showcase__meta"><span>{showcaseVideo.id}</span><span className="video-showcase__status">오늘 공유 · {VIDEO_STATUS_LABELS[showcaseVideo.status]}</span></div>
                <h3>{showcaseVideo.publicTitle ?? showcaseVideo.title}</h3>
                <p className="video-showcase__channel">{showcaseVideo.channel} · {showcaseVideo.speaker}</p>
                <div className="video-showcase__audit" aria-label="영상 공개 감리 상태">
                  <span>권위 확인: {VIDEO_AUDIT_LABELS.authorityLevel[showcaseVideo.audit.authorityLevel]}</span>
                  <span>근거: {VIDEO_AUDIT_LABELS.evidenceLevel[showcaseVideo.audit.evidenceLevel]}</span>
                  <span>사용: {VIDEO_AUDIT_LABELS.usageMode[showcaseVideo.audit.usageMode]}</span>
                </div>
                <p><strong>무엇을 어떻게 소개했나 · 예비</strong><br />{showcaseVideo.publicSummary ?? showcaseVideo.summary}</p>
                <p><strong>인물 소개</strong><br />{showcaseVideo.publicPersonSummary ?? showcaseVideo.personSummary}</p>
                <div className="video-showcase__actions"><button type="button" onClick={event => openVideoPanel(event.currentTarget, showcaseVideo.id)}>상세 감리 먼저 보기 <span aria-hidden="true">＋</span></button><span className="video-showcase__source-note">원문 링크는 상세 패널에서 선택</span></div>
                <div className="video-showcase__pager" aria-label="영상 이동">
                  <button type="button" onClick={() => selectShowcaseVideo(showcaseVideoIndex - 1)} disabled={showcaseVideoIndex === 0}>이전 영상</button>
                  <button type="button" onClick={() => selectShowcaseVideo(showcaseVideoIndex + 1)} disabled={showcaseVideoIndex === SHARED_GABA_VIDEOS.length - 1}>다음 영상 <span aria-hidden="true">→</span></button>
                </div>
              </div>
            </article>
          </div> : null}
        </div>
      </section> : null}

      {!presentationMode ? introSection : null}

      <section className="guardrail" aria-label="정보 구분 안내">
        <div><span>01</span><h2>일반 생리</h2><p>GABA가 신경전달물질로 어떤 역할을 하는지 설명합니다.</p></div>
        <div><span>02</span><h2>일반 인체 연구</h2><p>연구 조건과 근거의 범위를 함께 확인합니다.</p></div>
        <div><span>03</span><h2>권위 영상 감리</h2><p>인물·발언·자막·권리 상태를 확인한 뒤 공개합니다.</p></div>
      </section>
    </main>

    <footer className="site-footer">
      <p>일반 GABA 교육 자료 · 일반 기능과 연구 조건을 구분해 확인합니다.</p>
      <a href={RESEARCH_URL} target="_blank" rel="noopener noreferrer">일반 연구 출처 보기 ↗</a>
    </footer>
  </>;
}
