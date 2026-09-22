import {useEffect, useMemo, useRef, useState} from 'react';
import {GABA_VIDEO_DB, PUBLIC_GABA_VIDEOS, type GabaVideoRecord} from './gabaVideos';

type PanelKey = 'research' | 'video';
type SlideLink = {href: string; label: string; panel: PanelKey};

type Slide = {
  id: string;
  label: string;
  title: string;
  body: string;
  tone: string;
  note?: string;
  presenterPrompt: string;
  presenterBoundary: string;
  link?: SlideLink;
  links?: SlideLink[];
};

type VideoFilter = 'ALL' | 'REVIEW' | GabaVideoRecord['status'];

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
    boundary: '스트레스 근거는 제한적이고 수면 근거는 매우 제한적이며, 특정 제품의 효능을 입증하지 않습니다.',
    url: RESEARCH_URL,
  },
  {
    id: 'SRC-04',
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

const STORY_PHASES = [
  {id: 'everyday', label: '일상 상태', start: 0, end: 2},
  {id: 'rest', label: '회복', start: 3, end: 3},
  {id: 'ingredient', label: 'GABA 기능', start: 4, end: 5},
  {id: 'research', label: '일반 연구', start: 6, end: 6},
  {id: 'video', label: '권위 영상', start: 7, end: 7},
  {id: 'finish', label: '한 문장 정리', start: 8, end: 8},
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
  const publicVideo = PUBLIC_GABA_VIDEOS[0];
  return [
    {
      id: 'hook',
      label: '01 · 쉽게 흥분한 날',
      title: '화가 많아 쉽게 흥분하고, 실수한 적이 있다면 알아둘 성분이 있습니다.',
      body: '그날의 감정이나 실수를 하나의 원인으로 단정하지 않고, 몸과 뇌가 쉬는 시간부터 살펴봅니다.',
      tone: 'deep',
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
      presenterPrompt: 'GABA가 무엇을 뜻하는지부터 짧게 확인한 뒤 기능으로 넘어가겠습니다.',
      presenterBoundary: 'GABA라는 생리 성분의 설명이며 보충제 효능으로 연결하지 않습니다.',
    },
    {
      id: 'function',
      label: '06 · 뇌의 신호 조절',
      title: 'GABA는 신경 신호를 낮추는 방향으로 작용하는 대표적인 억제성 신경전달물질입니다.',
      body: '쉽게 말하면 뇌의 신호가 계속 커지지 않도록 조절하는 쪽에 가깝습니다. 흥분을 켜는 신호와 억제하는 신호의 균형 속에서 이해해야 합니다.',
      tone: 'research',
      note: '“뇌의 브레이크”는 이해를 위한 비유이며, 개인의 감정·수면·집중을 진단하는 표현이 아닙니다.',
      presenterPrompt: '가속 페달과 브레이크가 함께 있어야 속도를 조절할 수 있다는 비유로 설명해 보세요.',
      presenterBoundary: '일반적인 신경생리 기능 설명이며 GABA를 섭취하면 뇌가 즉시 안정된다는 뜻이 아닙니다.',
    },
    {
      id: 'research',
      label: '07 · 일반 GABA 연구',
      title: '연구는 가능성을 보여주지만, 결론은 조건과 한계까지 읽어야 합니다.',
      body: '일반 GABA 섭취를 살펴본 14개 위약대조 인체시험을 검토한 문헌고찰에서 스트레스 관련 근거는 제한적이고 수면 관련 근거는 매우 제한적이었습니다.',
      tone: 'research',
      note: '일반 GABA 연구 결과는 특정 제품의 효능을 입증하지 않습니다.',
      presenterPrompt: '연구 대상·섭취량·기간·비교 조건을 먼저 확인해 보시겠어요?',
      presenterBoundary: '일반 GABA 연구라는 표기를 고정하고 개인 결과로 확장하지 않습니다.',
      link: {href: RESEARCH_URL, label: '일반 GABA 연구 읽기', panel: 'research'},
    },
    {
      id: 'video',
      label: '08 · 권위 있는 설명 영상',
      title: '과학자·의사가 설명한 GABA 영상을 같은 기준으로 확인해 보세요.',
      body: `${PUBLIC_GABA_VIDEOS.length}건의 공개 승인 영상을 원문·인물·발언·권리 기준으로 큐레이션했습니다. 영상도 연구를 대신하지 않으며, 공개 후보와 승인 자료를 구분합니다.`,
      tone: 'evening',
      presenterPrompt: '영상의 권위보다 먼저 원문·발언 구간·근거·권리 상태를 함께 보시겠어요?',
      presenterBoundary: '권위자의 설명도 개인별 결과를 보증하지 않습니다.',
      link: {href: publicVideo?.url ?? '', label: '공개 승인 영상 확인하기', panel: 'video'},
    },
    {
      id: 'finish',
      label: '09 · 한 문장 정리',
      title: 'GABA는 뇌의 신호 균형을 이해할 때 만나는 성분입니다.',
      body: '무엇인지, 어떤 기능으로 알려졌는지, 일반 연구가 어디까지 말하는지를 차례로 확인하면 과장 없이 이해할 수 있습니다.',
      tone: 'finish',
      presenterPrompt: 'GABA를 오늘 한 문장으로 설명한다면 어떻게 말하시겠어요?',
      presenterBoundary: '마지막도 교육적 요약으로 끝내며 구매나 효능 약속으로 연결하지 않습니다.',
      links: [
        {href: RESEARCH_URL, label: '일반 GABA 연구 다시 보기', panel: 'research'},
        {href: publicVideo?.url ?? '', label: '권위 영상 다시 보기', panel: 'video'},
      ],
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
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('ALL');
  const [videoQuery, setVideoQuery] = useState('');
  const railRef = useRef<HTMLDivElement>(null);
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
  const phaseNavRef = useRef<HTMLElement>(null);
  const activePhase = STORY_PHASES.find(phase => active >= phase.start && active <= phase.end) ?? STORY_PHASES[0];
  const nextSlide = slides[active + 1];
  const publicVideo = PUBLIC_GABA_VIDEOS[0] ?? null;
  const panelVideos = presentationMode ? GABA_VIDEO_DB : PUBLIC_GABA_VIDEOS;
  const selectedVideo = panelVideoId ? GABA_VIDEO_DB.find(video => video.id === panelVideoId) ?? null : null;
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

  const goTo = (index: number) => {
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
    slideRefs.current[next]?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', inline: 'nearest', block: 'start'});
    window.setTimeout(() => {
      if (programmaticTargetRef.current === next) programmaticTargetRef.current = null;
    }, reduceMotion ? 80 : 850);
  };

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

  const copyPresenterAnswer = async (label: string, answer: string) => {
    try {
      await copyText(answer);
      setPresenterCopyMessage(`${label} 답변을 복사했습니다.`);
    } catch {
      setPresenterCopyMessage(`${label} 답변 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.`);
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
        await navigator.share({title: 'GABA 한 장씩 알아보기', text: '현재 카드부터 이어서 확인해 보세요.', url: link});
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

  const openInfoPanel = (index: number, panel: PanelKey, returnElement?: HTMLElement | null) => {
    panelReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPanelSourceIndex(index);
    setPanelVideoId(panel === 'video' && !presentationMode ? publicVideo?.id ?? null : null);
    setVideoFilter('ALL');
    setVideoQuery('');
    setPanelShareMessage('');
    setOpenPanel(panel);
  };

  const openVideoPanel = (returnElement?: HTMLElement | null) => {
    panelReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPanelSourceIndex(active);
    setPanelVideoId(null);
    setVideoFilter('ALL');
    setVideoQuery('');
    setPanelShareMessage('');
    setOpenPanel('video');
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

  const panelTitle = openPanel === 'research' ? '일반 GABA 연구를 읽는 방법' : 'GABA 영상 DB 검토';
  const openExternal = openPanel === 'research' ? RESEARCH_URL : selectedVideo?.url ?? (presentationMode ? '' : publicVideo?.url ?? '');
  const panelExternalLabel = openPanel === 'research' ? '연구 원문을 새 탭에서 보기' : '선택 영상 원문 보기';
  const panelSource = panelSourceIndex ?? active;
  const panelNext = slides[Math.min(slides.length - 1, panelSource + 1)];
  const panelNextAction = panelSource < slides.length - 1 ? `다음 카드: ${panelNext.label} →` : '카드 흐름으로 돌아가기';

  return <>
    <header className="site-header">
      <a className="brand" href="#top">GABA<span>.</span></a>
      <p>일반 GABA 교육 자료</p>
    </header>

    <main id="top">
      <section className="intro" aria-labelledby="page-title">
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
      </section>

      <section id="story" ref={presentationRef} className={`story${presentationMode ? ' story--presentation' : ''}`} role={presentationMode ? 'dialog' : undefined} aria-labelledby="story-title" aria-modal={presentationMode ? 'true' : undefined} aria-keyshortcuts={presentationMode ? 'ArrowLeft ArrowRight PageUp PageDown Home End Escape' : undefined}>
        <div className="story-heading">
          <div>
            <p className="eyebrow">1 page · 1 message</p>
            <h2 id="story-title">GABA를<br />나누어 이해하기</h2>
          </div>
          <p>{presentationMode ? <>← → 또는 PageUp/PageDown으로 넘기고<br />Esc로 발표 모드를 종료하세요.</> : <>모바일에서는 위아래로 넘겨 보세요.<br />일상·기능·연구·영상은 각각 다른 정보입니다.</>}</p>
        </div>
        <nav ref={phaseNavRef} className="story-sequence" aria-label="카드 흐름 단계">
          {STORY_PHASES.map((phase, index) => <span key={phase.id} data-phase={phase.id} className={phase.id === activePhase.id ? 'is-active' : ''} aria-current={phase.id === activePhase.id ? 'step' : undefined}>
            {phase.label}{index < STORY_PHASES.length - 1 ? <i aria-hidden="true">→</i> : null}
          </span>)}
        </nav>
        <div className="story-controls">
          <span aria-live="polite" aria-label={`현재 ${active + 1}번째 카드, 총 ${slides.length}장`}>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div>
            {presentationMode ? <button type="button" className="story-start-button story-video-db-button" onClick={event => openVideoPanel(event.currentTarget)}>영상 DB</button> : null}
            <button type="button" className="story-nav-button story-prev-button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="이전 카드"><span aria-hidden="true">←</span><span className="nav-label">이전 카드</span></button>
            <button type="button" className="story-nav-button story-next-button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="다음 카드"><span className="nav-label">다음 카드</span><span aria-hidden="true">→</span></button>
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
        <div className="story-rail" ref={railRef} onScroll={syncActiveFromRail} tabIndex={0} role="region" aria-roledescription="세로 피드" aria-label="GABA 소개 카드 흐름">
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
        {openPanel ? <div className="info-layer" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) closePanel();}}>
          <aside className="info-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="info-panel-title">
            <div className="info-panel__topline"><span>카드 흐름 안에서 확인</span><button ref={panelCloseRef} type="button" onClick={() => closePanel()} aria-label="정보 패널 닫기">×</button></div>
            <p className="eyebrow">{openPanel === 'research' ? '일반 GABA 연구' : '권위 영상 DB'}</p>
            <h2 id="info-panel-title">{panelTitle}</h2>
            {openPanel === 'research' ? <>
              <p>연구 결과를 볼 때는 무엇을 살펴봤는지와 어떤 조건이었는지를 함께 확인하세요.</p>
              <p className="info-panel__evidence">연결된 문헌고찰은 일반 GABA 섭취를 살펴본 14개 위약대조 인체시험을 검토했습니다. 스트레스 관련 근거는 제한적이고 수면 관련 근거는 매우 제한적이었습니다.</p>
              <ul><li>참여자와 연구 대상이 누구였는지</li><li>섭취량과 기간이 어떻게 설정됐는지</li><li>비교 조건과 측정 방법이 무엇이었는지</li></ul>
              <p className="info-panel__boundary">이 자료는 일반 GABA 원료 또는 GABA 섭취 연구입니다. 개인별 결과를 보장하는 자료가 아닙니다.</p>
              <details className="info-panel__research-sources">
                <summary>근거 출처 4건 펼쳐 보기 <span aria-hidden="true">＋</span></summary>
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
              <p>{presentationMode ? '발표자용 영상 DB입니다. 공개 후보를 원문·자막·인물·근거·권리 기준으로 감리한 뒤 공개 여부를 결정합니다.' : '공개 승인된 일반 GABA 설명 영상만 보여드립니다. 영상의 권위와 주장의 근거를 따로 확인하고, 원문 보기는 보조 행동으로 제공합니다.'}</p>
              <p className="info-panel__status">{presentationMode ? `관리 중 DB ${GABA_VIDEO_DB.length}건 · 공개 승인 ${PUBLIC_GABA_VIDEOS.length}건 · 현재 보기 ${filteredPanelVideos.length}건` : `현재 공개 승인 영상 ${PUBLIC_GABA_VIDEOS.length}건`}</p>
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
                  <h3>{video.title}</h3>
                  <p>{video.channel}</p>
                  <button type="button" className="video-db-item__select" aria-pressed={panelVideoId === video.id} onClick={() => setPanelVideoId(video.id)}>{panelVideoId === video.id ? '선택된 영상' : '이 영상 검토'}</button>
                </article>) : <p className="info-panel__flow-note">현재 조건에 맞는 영상이 없습니다. 검색어를 지우거나 다른 상태를 선택하세요.</p>}
              </div>
              {selectedVideo ? <div className="video-db-detail">
                <p className="eyebrow">선택 영상 상세 · {VIDEO_STATUS_LABELS[selectedVideo.status]}</p>
                <h3>{selectedVideo.title}</h3>
                <p>{selectedVideo.summary}</p>
                <p><strong>인물 소개</strong><br />{selectedVideo.personSummary}</p>
                <p className="info-panel__status">{selectedVideo.statusReason}</p>
                <p className="video-db-detail__meta">확인일 {selectedVideo.checkedAt} · 채널 {selectedVideo.channel} · 화자 {selectedVideo.speaker}</p>
              </div> : null}
              <p className="info-panel__boundary">영상의 설명은 일반 GABA 교육을 돕는 보조 자료이며, 개인별 효과나 의료적 판단을 대신하지 않습니다.</p>
            </> : null}
            <div className="info-panel__actions"><button type="button" className="info-panel__next" onClick={continueToNextCard}>{panelNextAction}</button></div>
            <p className="info-panel__flow-note">현재 페이지의 흐름은 유지됩니다. 외부 링크는 원문 확인이 필요할 때만 선택하세요.</p>
            {openPanel === 'research' ? <div className="info-panel__source"><strong>출처</strong><p className="info-panel__source-title">Effects of Oral Gamma-Aminobutyric Acid (GABA) Administration on Stress and Sleep in Humans: A Systematic Review</p><p className="info-panel__source-meta">Hepsomali et al. · Front Neurosci. 2020;14:923 · PMID 33041752</p></div> : null}
            {presentationMode ? <div className="info-panel__customer-link"><button type="button" className="info-panel__customer-copy" onClick={copyPanelCardLink}>이 카드 고객용 링크 복사</button><p>복사한 링크는 발표자 모드 없이 이 카드에서 열립니다.</p><p className="info-panel__customer-message" aria-live="polite">{panelShareMessage}</p></div> : null}
            {openExternal ? <details className="info-panel__external-choice"><summary>외부 자료는 필요할 때만 확인 <span aria-hidden="true">＋</span></summary><a className="info-panel__external" href={openExternal} target="_blank" rel="noopener noreferrer">{panelExternalLabel} ↗</a></details> : null}
          </aside>
        </div> : null}
      </section>

      <section className="guardrail" aria-label="정보 구분 안내">
        <div><span>01</span><h2>일반 생리</h2><p>GABA가 신경전달물질로 어떤 역할을 하는지 설명합니다.</p></div>
        <div><span>02</span><h2>일반 인체 연구</h2><p>연구 조건과 근거의 범위를 함께 확인합니다.</p></div>
        <div><span>03</span><h2>권위 영상 감리</h2><p>인물·발언·자막·권리 상태를 확인한 뒤 공개합니다.</p></div>
      </section>
    </main>

    <footer className="site-footer">
      <p>일반 GABA 교육 자료 · 의료정보나 개인별 결과를 보증하지 않습니다.</p>
      <a href={RESEARCH_URL} target="_blank" rel="noopener noreferrer">일반 연구 출처 보기 ↗</a>
    </footer>
  </>;
}
