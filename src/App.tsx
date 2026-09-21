import {useEffect, useMemo, useRef, useState} from 'react';

type Slide = {
  id: string;
  label: string;
  title: string;
  body: string;
  tone: string;
  note?: string;
  link?: {href: string; label: string; panel: PanelKey};
};

type PanelKey = 'research' | 'product' | 'review';

const RESEARCH_URL = 'https://pubmed.ncbi.nlm.nih.gov/33041752/';
const PRODUCT_URL = 'https://smartstore.naver.com/cellpinda/products/4701017202';

function makeSlides(): Slide[] {
  return [
    {
      id: 'hook',
      label: '01 · 일상에서 느끼는 순간',
      title: '하루를 보내다 보면, 잠깐 멈추고 싶은 순간이 찾아옵니다.',
      body: '생각이 이어지거나 마음이 분주한 날에는 내 상태를 먼저 돌아보는 것부터 시작해 보세요.',
      tone: 'deep',
    },
    {
      id: 'clear',
      label: '02 · 휴식 후 돌아보기',
      title: '쉬는 시간을 가진 뒤에는, 오늘 할 일을 다시 살펴볼 틈이 생깁니다.',
      body: '휴식감과 집중감은 사람마다 다를 수 있으니, 나의 생활 리듬을 먼저 확인해 보세요.',
      tone: 'fresh',
    },
    {
      id: 'overload',
      label: '03 · 생각이 이어지는 날',
      title: '쉬는 중에도 생각이 이어진다면, 잠깐 멈추는 루틴이 필요할 수 있습니다.',
      body: '피로와 집중감에는 여러 원인이 있습니다. 특정 성분이나 제품의 효과로 단정하지 마세요.',
      tone: 'warm',
    },
    {
      id: 'active-rest',
      label: '04 · 적극적인 휴식',
      title: '몸만 쉬는 것이 아니라, 머리를 쉬게 하는 시간도 필요합니다.',
      body: '5분 동안 화면을 내려놓고 물을 마시거나 창밖을 바라보는 것부터 시작해 보세요.',
      tone: 'green',
    },
    {
      id: 'gaba',
      label: '05 · 성분 일반정보',
      title: '이제 GABA라는 성분을 일반정보로 살펴보겠습니다.',
      body: 'GABA는 우리 몸에 원래 있는 성분으로, 몸속에서 신호를 주고받는 데 관여합니다.',
      tone: 'green-dark',
    },
    {
      id: 'research',
      label: '06 · 일반 GABA 연구',
      title: '일반 GABA 연구는 어떤 조건에서 진행됐는지 함께 읽어야 합니다.',
      body: '연구마다 참여자, 섭취량, 기간과 비교 조건이 달라 결과를 그대로 제품에 적용할 수는 없습니다.',
      tone: 'research',
      note: '중요: 아래 연구는 일반 GABA 원료 또는 GABA 섭취를 살펴본 자료입니다. 셀핀다 제품의 효능을 직접 입증하는 자료가 아닙니다.',
      link: {href: RESEARCH_URL, label: '일반 GABA 연구 내용 보기', panel: 'research'},
    },
    {
      id: 'product',
      label: '07 · 셀핀다 제품 정보',
      title: '제품 구성과 섭취 방법은 제품 표시사항에서 확인하세요.',
      body: '셀핀다 가바 1500의 상품 구성, 가격, 재고, 섭취 방법은 스마트스토어와 제품 포장을 기준으로 확인합니다.',
      tone: 'product',
      note: '제품 정보는 일반 GABA 연구 결과와 별도로 확인해야 합니다.',
      link: {href: PRODUCT_URL, label: '제품 정보 카드에서 보기', panel: 'product'},
    },
    {
      id: 'use',
      label: '08 · 활용 TIP',
      title: '활용 방법은 제품 표시사항을 먼저 확인하세요.',
      body: '물·요거트·두유·스무디 등에 섞는 방법은 제품 표시사항이나 제조·판매자의 안내가 확인된 경우에만 참고하세요.',
      tone: 'use',
    },
    {
      id: 'evening',
      label: '09 · 생활 루틴 참고',
      title: '저녁에는 카페인 섭취와 생활 루틴을 스스로 점검해 보세요.',
      body: '허브티를 선택한다면 제품별 원료와 주의사항을 확인하세요. 특정 조합이 수면이나 건강 효과를 보장하지는 않습니다.',
      tone: 'evening',
      note: '생활 루틴 참고이며 제품의 효능이나 수면 효과를 보장하는 안내가 아닙니다.',
    },
    {
      id: 'review',
      label: '10 · 구매자 후기',
      title: '후기는 다른 사람의 경험을 참고하는 자료입니다.',
      body: '나에게도 같은 결과가 나타난다는 뜻은 아니므로, 제품 정보와 후기를 나누어 살펴보세요.',
      tone: 'review',
      note: '후기는 개인 경험이며 제품 효능을 입증하는 연구자료가 아닙니다.',
      link: {href: `${PRODUCT_URL}#REVIEW_DIALOG`, label: '구매자 후기 안내 보기', panel: 'review'},
    },
    {
      id: 'finish',
      label: '11 · 마지막 확인',
      title: '일반 GABA 연구, 제품 정보, 구매자 후기를 각각 확인해 보세요.',
      body: '일반 연구·제품 정보·구매자 후기를 각각 확인한 뒤, 오늘 실천할 작은 휴식을 정해 보세요.',
      tone: 'finish',
      link: {href: PRODUCT_URL, label: '제품 정보 카드에서 보기', panel: 'product'},
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
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const panelTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLElement>(null);
  const panelCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(entries => {
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
    setActive(next);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slideRefs.current[next]?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest'});
  };

  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get('card'));
    if (!Number.isInteger(requested) || requested < 1 || requested > slides.length) return;
    window.requestAnimationFrame(() => goTo(requested - 1));
  }, [slides.length]);

  const copyCardLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('card', String(active + 1));
    url.hash = 'story';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
      } else {
        const field = document.createElement('textarea');
        field.value = url.toString();
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      setShareMessage('현재 카드 링크를 복사했습니다.');
    } catch {
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
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !openPanel) setPresentationMode(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => slideRefs.current[active]?.scrollIntoView({behavior: 'auto', inline: 'center', block: 'nearest'}));
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [presentationMode, openPanel, active]);

  const closePanel = () => {
    const sourceIndex = panelSourceIndex;
    setOpenPanel(null);
    setPanelSourceIndex(null);
    window.requestAnimationFrame(() => {
      if (sourceIndex !== null) panelTriggerRefs.current[sourceIndex]?.focus();
    });
  };

  const openInfoPanel = (index: number, panel: PanelKey) => {
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
          <h1 id="page-title">GABA를<br /><em>한 장씩</em> 알아보세요.</h1>
          <p className="intro-body">일상에서 GABA 정보를 연구·제품·후기로 나누어, 옆으로 넘기며 확인해 보세요.</p>
          <p className="separation-note">이 페이지는 기존 셀핀다 GABA 공식 배포 사이트와 구분되는 별도 소비자 안내 페이지입니다. 일반 GABA 연구는 셀핀다 제품의 효능을 직접 입증하지 않습니다.</p>
          <a className="text-button" href="#story">첫 카드부터 보기 <span aria-hidden="true">↓</span></a>
        </div>
        <div className="intro-orbit" aria-hidden="true"><span>GABA</span><i>일상<br />이해</i></div>
      </section>

      <section id="story" className={`story${presentationMode ? ' story--presentation' : ''}`} aria-labelledby="story-title">
        <div className="story-heading">
          <div>
            <p className="eyebrow">1 page · 1 message</p>
            <h2 id="story-title">GABA 정보를<br />나누어 확인하기</h2>
          </div>
          <p>모바일에서는 좌우로 밀어 보세요.<br />연구·제품·후기는 각각 다른 정보입니다.</p>
        </div>
        <div className="story-controls">
          <span aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div>
            <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="이전 카드">←</button>
            <button type="button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="다음 카드">→</button>
            <button type="button" className="story-share-button" onClick={copyCardLink}>현재 카드 링크 복사</button>
            <button type="button" className="story-presentation-toggle" onClick={() => setPresentationMode(value => !value)}>{presentationMode ? '발표 모드 종료' : '발표 모드'}</button>
          </div>
        </div>
        <p className="story-share-message" aria-live="polite">{shareMessage}</p>
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
              {slide.link ? <button type="button" className="card-link" ref={element => {panelTriggerRefs.current[index] = element;}} onClick={() => openInfoPanel(index, slide.link!.panel)}>{slide.link.label} <span aria-hidden="true">＋</span></button> : null}
              {slide.note ? <small>{slide.note}</small> : null}
            </div>
          </article>)}
        </div>
        <div className="story-dots" aria-hidden="true">{slides.map((slide, index) => <span key={slide.id} className={index === active ? 'active' : ''} />)}</div>
        {openPanel ? <div className="info-layer" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) closePanel();}}>
          <aside className="info-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="info-panel-title">
            <div className="info-panel__topline"><span>카드 흐름 안에서 확인</span><button ref={panelCloseRef} type="button" onClick={closePanel} aria-label="정보 패널 닫기">×</button></div>
            <p className="eyebrow">{openPanel === 'research' ? '일반 GABA 연구' : openPanel === 'product' ? '셀핀다 제품 정보' : '구매자 후기'}</p>
            <h2 id="info-panel-title">{panelTitle}</h2>
            {openPanel === 'research' ? <>
              <p>연구 결과를 볼 때는 ‘무엇을 살펴봤는지’와 ‘어떤 조건이었는지’를 함께 확인하세요.</p>
              <ul><li>참여자와 연구 대상이 누구였는지</li><li>GABA 섭취량과 기간이 어떻게 설정됐는지</li><li>비교 조건과 측정 방법이 무엇이었는지</li></ul>
              <p className="info-panel__boundary">이 자료는 일반 GABA 원료 또는 GABA 섭취 연구입니다. 셀핀다 제품의 효능을 직접 입증하는 자료가 아닙니다.</p>
            </> : null}
            {openPanel === 'product' ? <>
              <div className="product-facts"><dl><div><dt>제품명</dt><dd>셀핀다 가바 1500</dd></div><div><dt>공개 안내 범위</dt><dd>30포 구성</dd></div><div><dt>식품 유형</dt><dd>기타가공품</dd></div></dl></div>
              <p>제품을 소개할 때는 연구 결과와 분리해 아래 순서로 안내하면 이해가 쉽습니다.</p>
              <ol><li>제품명과 구성 확인</li><li>제품 표시사항의 섭취 방법·주의사항 확인</li><li>가격·재고·배송 등 판매 정보 확인</li></ol>
              <p className="info-panel__boundary">위 내용은 공개 안내 범위입니다. 최신 포장 표시사항의 섭취법·주의사항·로트 정보는 제품 포장과 스마트스토어에서 다시 확인해 주세요.</p>
            </> : null}
            {openPanel === 'review' ? <>
              <p>후기는 구매자가 남긴 개인 경험입니다. 고객 상담이나 영업 설명에서는 경험과 객관적 제품 정보를 나누어 전달하세요.</p>
              <ul><li>사용 기간과 섭취 맥락 확인</li><li>개인 느낌과 객관적 사실 구분</li><li>모든 사람에게 같은 결과가 나타난다고 해석하지 않기</li></ul>
              <p className="info-panel__boundary">후기는 개인 경험이며 제품 효능을 입증하는 연구자료가 아닙니다.</p>
            </> : null}
            <div className="info-panel__actions">
              <a className="info-panel__external" href={openExternal} target="_blank" rel="noreferrer">{panelExternalLabel} ↗</a>
              <button type="button" className="info-panel__next" onClick={() => {const next = Math.min(slides.length - 1, (panelSourceIndex ?? active) + 1); closePanel(); goTo(next);}}>{(panelSourceIndex ?? active) < slides.length - 1 ? '다음 카드로 계속 보기 →' : '카드 흐름으로 돌아가기'}</button>
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
      <button type="button" className="footer-product-button" onClick={() => {setPanelSourceIndex(6); setOpenPanel('product'); document.getElementById('story')?.scrollIntoView({behavior: 'smooth'});}}>제품 정보 패널 열기 ＋</button>
    </footer>
  </>;
}
