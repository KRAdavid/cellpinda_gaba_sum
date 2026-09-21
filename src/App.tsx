import {useEffect, useMemo, useRef, useState} from 'react';

type PanelKey = 'research' | 'product' | 'review';
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

const RESEARCH_URL = 'https://pubmed.ncbi.nlm.nih.gov/33041752/';
const PRODUCT_URL = 'https://smartstore.naver.com/cellpinda/products/4701017202';

const STORY_PHASES = [
  {id: 'everyday', label: '일상 상태', start: 0, end: 2},
  {id: 'rest', label: '휴식', start: 3, end: 3},
  {id: 'ingredient', label: '성분 일반정보', start: 4, end: 4},
  {id: 'research', label: '일반 연구', start: 5, end: 5},
  {id: 'product', label: '제품 정보', start: 6, end: 7},
  {id: 'review', label: '후기·마무리', start: 8, end: 10},
] as const;

function makeSlides(): Slide[] {
  return [
    {
      id: 'hook',
      label: '01 · 말이 먼저 세게 나온 날',
      title: '괜찮다고 생각했는데, 말이 먼저 세게 나온 날이 있죠.',
      body: '작은 실수가 이어지고 사소한 일에도 예민해졌다면, 바로 제품을 찾기보다 오늘의 상태와 쉬는 시간을 먼저 돌아보세요.',
      tone: 'deep',
      presenterPrompt: '최근 사소한 일에 반응이 커졌거나 말이 먼저 나온 순간이 있었나요?',
      presenterBoundary: '이 카드는 감정이나 상태를 진단하거나 제품 필요성을 말하는 카드가 아닙니다.',
    },
    {
      id: 'clear',
      label: '02 · 쉬어도 여유가 안 생길 때',
      title: '잠깐 쉬었는데도, 머릿속 알림이 계속 켜져 있는 날이 있습니다.',
      body: '잘 쉬고 난 뒤의 여유와 생각이 이어지는 날을 비교해 보세요. 성분 이야기 전에 일상의 차이를 살펴봅니다.',
      tone: 'fresh',
      presenterPrompt: '충분히 쉬고 난 뒤와 그렇지 않은 날, 일상에서 무엇이 달랐나요?',
      presenterBoundary: '휴식 경험은 사람마다 다르며 특정 성분의 효과나 진단으로 해석하지 않습니다.',
    },
    {
      id: 'overload',
      label: '03 · 생각이 다음 일로 달려가는 날',
      title: '몸은 쉬고 있는데, 생각은 다음 일로 먼저 달려갑니다.',
      body: '수면·스트레스·생활 리듬 등 여러 요인이 있을 수 있으며, 한 가지 성분이나 제품으로 설명하지 않습니다.',
      tone: 'warm',
      presenterPrompt: '몸은 쉬고 있는데 생각이 다음 일로 달려간다고 느낀 적이 있나요?',
      presenterBoundary: '수면·스트레스의 원인을 한 가지 성분이나 제품으로 단정하지 않습니다.',
    },
    {
      id: 'active-rest',
      label: '04 · 적극적인 휴식',
      title: '먼저 5분, 화면을 내려놓고 휴식 시간을 만들어 보세요.',
      body: '물을 마시거나 창밖을 바라보는 것처럼 지금 바로 할 수 있는 생활 속 행동부터 시작합니다.',
      tone: 'green',
      note: '이 생활 루틴은 특정 성분이나 제품의 효과를 뜻하지 않습니다.',
      presenterPrompt: '지금 5분을 비울 수 있다면 무엇을 해볼 수 있을까요?',
      presenterBoundary: '이 생활 루틴은 특정 성분·제품의 효과를 뜻하지 않습니다.',
    },
    {
      id: 'gaba',
      label: '05 · 성분 일반정보',
      title: '이제 GABA라는 성분의 일반정보부터 살펴보겠습니다.',
      body: '이 페이지에서 GABA는 일반 성분 정보로 소개합니다. 셀핀다 제품의 효능이나 섭취 판단으로 연결하지 않습니다.',
      tone: 'green-dark',
      presenterPrompt: 'GABA라는 이름을 들어보셨다면, 이제 성분 일반정보만 확인해 보겠습니다.',
      presenterBoundary: '여기서는 제품 효능이나 섭취 판단으로 연결하지 않습니다.',
    },
    {
      id: 'research',
      label: '06 · 일반 GABA 연구',
      title: '일반 GABA 연구는 어떤 조건과 결론인지 함께 읽어야 합니다.',
      body: '연결된 문헌고찰은 일반 GABA 섭취를 살펴본 14개 위약대조 인체시험을 검토했습니다. 스트레스 관련 근거는 제한적이고 수면 관련 근거는 매우 제한적이었습니다.',
      tone: 'research',
      note: '중요: 셀핀다 제품의 동일 제형·동일 섭취량 효능을 검증한 연구가 아닙니다.',
      presenterPrompt: '연구에서 누구를 어떤 조건으로 살폈는지부터 보시겠어요?',
      presenterBoundary: '일반 GABA 연구이며 셀핀다 제품의 동일 제형·용량 효능을 입증하지 않습니다.',
      link: {href: RESEARCH_URL, label: '일반 GABA 연구 내용 보기', panel: 'research'},
    },
    {
      id: 'product',
      label: '07 · 셀핀다 제품 정보',
      title: '제품 구성과 섭취 방법은 제품 표시사항에서 확인하세요.',
      body: '제품 구성·가격·재고·섭취 방법은 이 카드에서 확정하지 않고, 최신 포장과 스마트스토어에서 확인합니다.',
      tone: 'product',
      note: '제품 정보는 일반 GABA 연구 결과와 별도로 확인해야 합니다.',
      presenterPrompt: '제품명·구성·식품 유형 중 먼저 확인할 항목은 무엇인가요?',
      presenterBoundary: '최신 포장·판매 SKU 대조 전에는 공개 안내 범위로만 설명합니다.',
      link: {href: PRODUCT_URL, label: '제품 정보 카드에서 보기', panel: 'product'},
    },
    {
      id: 'use',
      label: '08 · 활용 TIP',
      title: '섭취 방법은 제품 포장에 적힌 표시사항을 따르세요.',
      body: '표시사항으로 확인되지 않은 혼합 방법은 안내하지 않습니다.',
      tone: 'use',
      presenterPrompt: '제품을 실제로 안내할 때는 포장 표시사항을 함께 확인하시겠어요?',
      presenterBoundary: '섭취량·혼합 방법·주의사항은 표시 확인 전 확정하지 않습니다.',
    },
    {
      id: 'evening',
      label: '09 · 생활 루틴 참고',
      title: '저녁 루틴은 카페인과 생활 습관부터 점검해 보세요.',
      body: '허브티 등 다른 제품을 선택할 때는 각 제품의 원료와 주의사항을 따로 확인하세요. 이 페이지는 특정 제품 조합이나 수면 개선을 안내하지 않습니다.',
      tone: 'evening',
      note: '특정 제품 조합이나 수면 효과를 보장하지 않습니다.',
      presenterPrompt: '저녁에 점검해 볼 생활 습관은 무엇이 있을까요?',
      presenterBoundary: '허브티나 다른 제품과의 조합·수면 효과를 보장하지 않습니다.',
    },
    {
      id: 'review',
      label: '10 · 구매자 후기',
      title: '후기는 다른 사람의 경험을 참고하는 자료입니다.',
      body: '판매처에 게시된 후기는 작성자의 개인 경험입니다. 객관적 연구 결과나 모든 사람에게 동일한 결과가 나타난다는 의미는 아닙니다.',
      tone: 'review',
      note: '후기는 개인 경험이며 제품 효능을 입증하는 연구자료가 아닙니다.',
      presenterPrompt: '후기를 볼 때 개인 경험과 객관적 사실을 어떻게 구분할까요?',
      presenterBoundary: '후기는 효능 연구가 아니며 원문·이미지 사용권 확인 전 재게시하지 않습니다.',
      link: {href: `${PRODUCT_URL}#REVIEW_DIALOG`, label: '구매자 후기 안내 보기', panel: 'review'},
    },
    {
      id: 'finish',
      label: '11 · 마지막 확인',
      title: '일반 GABA 연구, 제품 정보, 구매자 후기를 각각 확인해 보세요.',
      body: '일반 연구·제품 정보·구매자 후기를 각각 확인한 뒤, 오늘 실천할 작은 휴식을 정해 보세요.',
      tone: 'finish',
      presenterPrompt: '연구·제품 정보·후기 중 무엇을 더 확인하고 싶으신가요?',
      presenterBoundary: '다음 행동을 선택하게 하되 효과를 약속하는 결론으로 마무리하지 않습니다.',
      links: [
        {href: RESEARCH_URL, label: '일반 GABA 연구 다시 보기', panel: 'research'},
        {href: PRODUCT_URL, label: '제품 정보 다시 보기', panel: 'product'},
        {href: `${PRODUCT_URL}#REVIEW_DIALOG`, label: '구매자 후기 다시 보기', panel: 'review'},
      ],
    },
  ];
}

export default function App() {
  const slides = useMemo(makeSlides, []);
  const [active, setActive] = useState(0);
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null);
  const [panelSourceIndex, setPanelSourceIndex] = useState<number | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const programmaticTargetRef = useRef<number | null>(null);
  const panelTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLElement>(null);
  const panelCloseRef = useRef<HTMLButtonElement>(null);
  const presentationRef = useRef<HTMLElement>(null);
  const presentationModeRef = useRef(false);
  const presentationDidFocusRef = useRef(false);
  const presentationReturnRef = useRef<HTMLElement | null>(null);
  const panelReturnRef = useRef<HTMLElement | null>(null);
  const shareRequestRef = useRef(0);
  const activePhase = STORY_PHASES.find(phase => active >= phase.start && active <= phase.end) ?? STORY_PHASES[0];

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(entries => {
      if (presentationModeRef.current) return;
      const programmaticTarget = programmaticTargetRef.current;
      if (programmaticTarget !== null) {
        const targetReached = entries.some(entry => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          return index === programmaticTarget && entry.isIntersecting && entry.intersectionRatio >= 0.65;
        });
        if (!targetReached) return;
        programmaticTargetRef.current = null;
      }
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset.index);
      if (Number.isInteger(index)) setActive(index);
    }, {root: rail, threshold: [0.65]});
    slideRefs.current.forEach(slide => slide && observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    if (next !== active) {
      programmaticTargetRef.current = next;
      shareRequestRef.current += 1;
      // Clear immediately as well as in the active-card effect; navigation and
      // the async share callback can otherwise briefly show a stale link.
      setShareUrl('');
      setShareMessage('');
    }
    if (presentationModeRef.current) {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'presenter');
      url.searchParams.set('card', String(next + 1));
      url.hash = 'story';
      window.history.replaceState({}, '', url);
    }
    setActive(next);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slideRefs.current[next]?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest'});
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = Number(params.get('card'));
    const presenterRequested = params.get('mode') === 'presenter' || params.get('presenter') === '1';
    if (presenterRequested) {
      presentationModeRef.current = true;
      setPresentationMode(true);
    }
    if (!Number.isInteger(requested) || requested < 1 || requested > slides.length) return;
    window.requestAnimationFrame(() => goTo(requested - 1));
  }, [slides.length]);

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fall through to the selection-based fallback when clipboard permission is unavailable.
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

  const shareCardLink = async () => {
    const shareRequest = ++shareRequestRef.current;
    const url = new URL(window.location.href);
    url.searchParams.set('card', String(active + 1));
    // Customer-facing shares must never expose presenter notes or controls.
    url.searchParams.delete('mode');
    url.searchParams.delete('presenter');
    url.hash = 'story';
    const link = url.toString();
    setShareUrl(link);
    if (navigator.share) {
      try {
        await navigator.share({title: '셀핀다 GABA 한 장씩 보기', text: '현재 카드부터 이어서 확인해 보세요.', url: link});
        if (shareRequest !== shareRequestRef.current) return;
        setShareMessage('현재 카드 링크를 공유했습니다.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          if (shareRequest !== shareRequestRef.current) return;
          setShareMessage('공유를 취소했습니다.');
          return;
        }
      }
    }
    try {
      await copyText(link);
      if (shareRequest !== shareRequestRef.current) return;
      setShareMessage('현재 카드 링크를 복사했습니다.');
    } catch {
      if (shareRequest !== shareRequestRef.current) return;
      setShareMessage('링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const copySharedCardLink = async () => {
    const link = shareUrl;
    if (!link) return;
    const shareRequest = shareRequestRef.current;
    try {
      await copyText(link);
      if (shareRequest !== shareRequestRef.current) return;
      setShareMessage('현재 카드 링크를 복사했습니다.');
    } catch {
      if (shareRequest !== shareRequestRef.current) return;
      setShareMessage('링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  useEffect(() => {
    if (!openPanel) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => panelCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [openPanel]);

  useEffect(() => {
    if (!presentationMode) return;
    const previousOverflow = document.body.style.overflow;
    const outside = [
      document.querySelector<HTMLElement>('.site-header'),
      document.querySelector<HTMLElement>('.intro'),
      document.querySelector<HTMLElement>('.guardrail'),
      document.querySelector<HTMLElement>('.site-footer'),
    ].filter(Boolean) as HTMLElement[];
    const previousOutsideState = outside.map(element => ({
      element,
      inert: element.getAttribute('inert'),
      ariaHidden: element.getAttribute('aria-hidden'),
    }));
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !openPanel) {
        exitPresentation();
        return;
      }
      const eventTarget = event.target instanceof HTMLElement ? event.target : null;
      const isTextEntry = eventTarget?.matches('input, textarea, [contenteditable="true"]');
      if (isTextEntry && event.key !== 'Tab') return;
      if (openPanel) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        goTo(active + 1);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(active - 1);
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        goTo(slides.length - 1);
        return;
      }
      if (event.key !== 'Tab') return;
      const presentation = presentationRef.current;
      if (!presentation) return;
      const focusable = Array.from(presentation.querySelectorAll<HTMLElement>('summary, a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(element => {
          const style = window.getComputedStyle(element);
          return !element.closest('[inert], .story-card--presentation-hidden') && style.display !== 'none' && style.visibility !== 'hidden';
        });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    outside.forEach(element => {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => {
      presentationRef.current?.scrollTo({top: 0, behavior: 'auto'});
      if (!presentationDidFocusRef.current && !openPanel) {
        const focusTarget = presentationRef.current?.querySelector<HTMLElement>('.story-presentation-toggle');
        if (focusTarget && !presentationRef.current?.contains(document.activeElement)) focusTarget.focus();
        presentationDidFocusRef.current = true;
      }
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      previousOutsideState.forEach(({element, inert, ariaHidden}) => {
        if (inert === null) element.removeAttribute('inert');
        else element.setAttribute('inert', inert);
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
    };
  }, [presentationMode, openPanel, active]);

  useEffect(() => {
    if (!presentationMode) presentationDidFocusRef.current = false;
  }, [presentationMode]);

  useEffect(() => {
    // A link is only valid for the card it was created from. Clear it when
    // navigation changes the active card so a presenter cannot resend stale context.
    setShareUrl('');
    setShareMessage('');
  }, [active]);

  const enterPresentation = (returnElement?: HTMLElement | null) => {
    presentationReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'presenter');
    url.searchParams.set('card', String(active + 1));
    url.hash = 'story';
    window.history.replaceState({}, '', url);
    presentationModeRef.current = true;
    setPresentationMode(true);
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
      slideRefs.current[currentActive]?.scrollIntoView({behavior: 'auto', inline: 'center', block: 'nearest'});
      if (returnElement?.isConnected) returnElement.focus();
      presentationReturnRef.current = null;
    });
  };

  const closePanel = (restoreFocus = true) => {
    const sourceIndex = panelSourceIndex;
    const returnElement = panelReturnRef.current;
    setOpenPanel(null);
    setPanelSourceIndex(null);
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        if (returnElement?.isConnected) returnElement.focus();
        else if (sourceIndex !== null) panelTriggerRefs.current[sourceIndex]?.focus();
      });
    }
    panelReturnRef.current = null;
  };

  const continueToNextCard = () => {
    const sourceIndex = panelSourceIndex ?? active;
    const next = Math.min(slides.length - 1, sourceIndex + 1);
    const returnElement = panelReturnRef.current;
    closePanel(false);
    goTo(next);
    window.requestAnimationFrame(() => {
      const focusTarget = presentationMode
        ? presentationRef.current?.querySelector<HTMLElement>('.story-presentation-toggle')
        : next === sourceIndex && returnElement?.isConnected
          ? returnElement
        : panelTriggerRefs.current[next] ?? railRef.current;
      focusTarget?.focus();
    });
  };

  const openInfoPanel = (index: number, panel: PanelKey, returnElement?: HTMLElement | null) => {
    panelReturnRef.current = returnElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPanelSourceIndex(index);
    setOpenPanel(panel);
  };

  const panelTitle = openPanel === 'research'
    ? '일반 GABA 연구를 읽는 방법'
    : openPanel === 'product'
      ? '셀핀다 제품 정보 확인 순서'
      : '구매자 후기를 읽는 방법';

  const openExternal = openPanel === 'research'
    ? RESEARCH_URL
    : `${PRODUCT_URL}${openPanel === 'review' ? '#REVIEW_DIALOG' : ''}`;

  const panelExternalLabel = openPanel === 'research'
    ? '연구 원문을 새 탭에서 보기'
    : openPanel === 'review'
      ? '스마트스토어 후기 열기'
      : '스마트스토어 제품 정보 열기';

  return <>
    <header className="site-header">
      <a className="brand" href="#top">Cellpinda<span>.</span></a>
      <p>GABA 소비자용 한 장 요약</p>
    </header>

    <main id="top">
      <section className="intro" aria-labelledby="page-title">
        <div className="intro-copy">
          <p className="eyebrow">셀핀다 제품 관련 소비자 안내 · 광고성 정보 포함</p>
          <h1 id="page-title">GABA를<br /><em>한 장씩</em><br />알아보세요.</h1>
          <p className="intro-body">일상에서 GABA 정보를 연구·제품·후기로 나누어, 옆으로 넘기며 확인해 보세요.</p>
          <p className="separation-note">이 페이지는 기존 셀핀다 GABA 공식 배포 사이트와 구분되는 별도 소비자 안내 페이지입니다. 일반 GABA 연구는 셀핀다 제품의 효능을 직접 입증하지 않습니다.</p>
          <a className="text-button" href="#story">전체 카드부터 보기 <span aria-hidden="true">↓</span></a>
          <button type="button" className="text-button intro-presentation-button" onClick={event => enterPresentation(event.currentTarget)}>사업자용 설명 시작 <span aria-hidden="true">↗</span></button>
          <button type="button" className="text-button intro-product-button" onClick={() => {goTo(6); document.getElementById('story')?.scrollIntoView({behavior: 'smooth'});}}>제품 문의가 먼저라면 <span aria-hidden="true">→</span></button>
        </div>
        <div className="intro-orbit" aria-hidden="true"><span>GABA</span><i>일상<br />이해</i></div>
      </section>

      <section id="story" ref={presentationRef} className={`story${presentationMode ? ' story--presentation' : ''}`} role={presentationMode ? 'dialog' : undefined} aria-labelledby="story-title" aria-modal={presentationMode ? 'true' : undefined} aria-keyshortcuts={presentationMode ? 'ArrowLeft ArrowRight PageUp PageDown Home End Escape' : undefined}>
        <div className="story-heading">
          <div>
            <p className="eyebrow">1 page · 1 message</p>
            <h2 id="story-title">GABA 정보를<br />나누어 확인하기</h2>
          </div>
          <p>{presentationMode ? <>← → 또는 PageUp/PageDown으로 넘기고<br />Esc로 발표 모드를 종료하세요.</> : <>모바일에서는 좌우로 밀어 보세요.<br />연구·제품·후기는 각각 다른 정보입니다.</>}</p>
        </div>
        <nav className="story-sequence" aria-label="카드 흐름 단계">
          {STORY_PHASES.map((phase, index) => <span key={phase.id} className={phase.id === activePhase.id ? 'is-active' : ''} aria-current={phase.id === activePhase.id ? 'step' : undefined}>
            {phase.label}{index < STORY_PHASES.length - 1 ? <i aria-hidden="true">→</i> : null}
          </span>)}
        </nav>
        <div className="story-controls">
          <span aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div>
            {presentationMode ? <button type="button" className="story-restart-button" onClick={() => goTo(0)} disabled={active === 0}>처음부터</button> : null}
            <button type="button" className="story-nav-button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="이전 카드"><span aria-hidden="true">←</span><span className="nav-label">이전 카드</span></button>
            <button type="button" className="story-nav-button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="다음 카드"><span className="nav-label">다음 카드</span><span aria-hidden="true">→</span></button>
            <button type="button" className="story-share-button" onClick={shareCardLink}>현재 카드 링크 공유</button>
            <button type="button" className="story-presentation-toggle" onClick={event => presentationMode ? exitPresentation() : enterPresentation(event.currentTarget)}>{presentationMode ? '발표 모드 종료' : '발표 모드'}</button>
          </div>
        </div>
        <p className="story-share-message" aria-live="polite">{shareMessage}</p>
        {shareUrl ? <div className="story-share-row"><input className="story-share-url" value={shareUrl} readOnly aria-label="현재 카드 공유 링크" onFocus={event => event.currentTarget.select()} /><button type="button" className="story-share-copy-button" onClick={copySharedCardLink}>링크 복사</button></div> : null}
        {presentationMode ? <details className="presenter-note"><summary>발표자용 진행 포인트</summary><div className="presenter-note__grid"><div><strong>고객에게 물어보기</strong><p>{slides[active].presenterPrompt}</p></div><div><strong>이어서 말할 때</strong><p>{slides[active].presenterBoundary}</p></div></div></details> : null}
        <div className="story-rail" ref={railRef} tabIndex={0} aria-label="GABA 소개 카드 목록">
          {slides.map((slide, index) => <article
            key={slide.id}
            id={`story-card-${slide.id}`}
            ref={element => {slideRefs.current[index] = element;}}
            data-index={index}
            className={`story-card story-card--${slide.tone}${presentationMode && index !== active ? ' story-card--presentation-hidden' : ''}`}
            aria-labelledby={`slide-${slide.id}`}
          >
            <div className="card-label"><span>{slide.label}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div className="card-content">
              <h3 id={`slide-${slide.id}`}>{slide.title}</h3>
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
            <p className="eyebrow">{openPanel === 'research' ? '일반 GABA 연구' : openPanel === 'product' ? '셀핀다 제품 정보' : '구매자 후기'}</p>
            <h2 id="info-panel-title">{panelTitle}</h2>
            {openPanel === 'research' ? <>
              <p>연구 결과를 볼 때는 ‘무엇을 살펴봤는지’와 ‘어떤 조건이었는지’를 함께 확인하세요.</p>
              <p className="info-panel__evidence">연결된 문헌고찰은 일반 GABA 섭취를 살펴본 14개 위약대조 인체시험을 검토했습니다. 스트레스 관련 근거는 제한적이고 수면 관련 근거는 매우 제한적이었습니다.</p>
              <ul><li>참여자와 연구 대상이 누구였는지</li><li>GABA 섭취량과 기간이 어떻게 설정됐는지</li><li>비교 조건과 측정 방법이 무엇이었는지</li></ul>
              <p className="info-panel__boundary">이 자료는 일반 GABA 원료 또는 GABA 섭취 연구입니다. 셀핀다 제품의 효능을 직접 입증하는 자료가 아닙니다.</p>
              <div className="info-panel__source"><strong>출처</strong><p className="info-panel__source-title">Effects of Oral Gamma-Aminobutyric Acid (GABA) Administration on Stress and Sleep in Humans: A Systematic Review</p><p className="info-panel__source-meta">Hepsomali et al. · Front Neurosci. 2020;14:923 · PMID 33041752</p></div>
            </> : null}
            {openPanel === 'product' ? <>
              <p className="info-panel__transition">여기서부터는 연구가 아닌 판매 제품의 표시 정보입니다.</p>
              <p className="info-panel__status">확인 상태: 제한적 공개 안내 범위 · 최신 포장·판매 SKU 대조 전 최종 제품 사실로 확정하지 않습니다.</p>
              <div className="product-facts"><dl><div><dt>제품명</dt><dd>셀핀다 가바 1500</dd></div><div><dt>공개 안내 범위</dt><dd>30포 구성</dd></div><div><dt>식품 유형</dt><dd>기타가공품</dd></div></dl></div>
              <p>제품을 소개할 때는 연구 결과와 분리해 아래 순서로 안내하면 이해가 쉽습니다.</p>
              <ol><li>제품명과 구성 확인</li><li>제품 표시사항의 섭취 방법·주의사항 확인</li><li>가격·재고·배송 등 판매 정보 확인</li></ol>
              <p className="info-panel__boundary">위 내용은 공개 안내 범위입니다. 최신 포장 표시사항의 섭취법·주의사항·로트 정보는 제품 포장과 스마트스토어에서 다시 확인해 주세요.</p>
            </> : null}
            {openPanel === 'review' ? <>
              <p>판매처에 게시된 후기는 작성자의 개인 경험입니다. 고객 상담이나 영업 설명에서는 경험과 객관적 제품 정보를 나누어 전달하세요.</p>
              <p className="info-panel__status">공개 상태: 개인 경험 안내 · 원문·이미지 사용권 확인 전 재게시하지 않음</p>
              <ul><li>사용 기간과 섭취 맥락 확인</li><li>개인 느낌과 객관적 사실 구분</li><li>모든 사람에게 같은 결과가 나타난다고 해석하지 않기</li></ul>
              <p className="info-panel__boundary">후기는 개인 경험이며 제품 효능을 입증하는 연구자료가 아닙니다.</p>
            </> : null}
            <div className="info-panel__actions">
              <a className="info-panel__external" href={openExternal} target="_blank" rel="noreferrer">{panelExternalLabel} ↗</a>
              <button type="button" className="info-panel__next" onClick={continueToNextCard}>{(panelSourceIndex ?? active) < slides.length - 1 ? '다음 카드로 계속 보기 →' : '카드 흐름으로 돌아가기'}</button>
            </div>
          </aside>
        </div> : null}
      </section>

      <section className="guardrail" aria-label="정보 구분 안내">
        <div><span>01</span><h2>일반 GABA 연구</h2><p>GABA 원료 또는 GABA 섭취를 살펴본 연구입니다.</p></div>
        <div><span>02</span><h2>셀핀다 제품 정보</h2><p>제품 표시사항과 스마트스토어에서 확인합니다.</p></div>
        <div><span>03</span><h2>구매자 후기</h2><p>개인 경험을 참고하는 자료입니다.</p></div>
      </section>
    </main>

    <footer className="site-footer">
      <p>셀핀다 제품 관련 소비자 안내 · 광고성 정보 포함 · 의료정보나 제품 효능 보증이 아닙니다.</p>
      <button type="button" className="footer-product-button" onClick={event => {panelReturnRef.current = event.currentTarget; setPanelSourceIndex(6); setOpenPanel('product'); document.getElementById('story')?.scrollIntoView({behavior: 'smooth'});}}>제품 정보 패널 열기 ＋</button>
    </footer>
  </>;
}
