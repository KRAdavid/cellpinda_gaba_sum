import {useEffect, useMemo, useRef, useState} from 'react';

type Slide = {
  id: string;
  label: string;
  title: string;
  body: string;
  tone: string;
  note?: string;
  link?: {href: string; label: string};
};

const RESEARCH_URL = 'https://pubmed.ncbi.nlm.nih.gov/33041752/';
const PRODUCT_URL = 'https://smartstore.naver.com/cellpinda/products/4701017202';

function makeSlides(): Slide[] {
  return [
    {
      id: 'hook',
      label: '01 · 지금 내 상태',
      title: '별일 아닌데 짜증이 나고, 말이 먼저 나와서 후회한 적 있으신가요?',
      body: '몸은 쉬었는데 머리는 계속 돌아가는 날이 있습니다.',
      tone: 'deep',
    },
    {
      id: 'clear',
      label: '02 · 충분히 쉰 날',
      title: '잘 쉬고 난 날은 머리가 맑고 집중하기 쉽습니다.',
      body: '해야 할 일과 잠깐 미뤄도 될 일을 구분하기가 한결 편해집니다.',
      tone: 'fresh',
    },
    {
      id: 'overload',
      label: '03 · 뇌가 과부하인 날',
      title: '쉬어도 생각이 멈추지 않고, 작은 일에도 예민해집니다.',
      body: '몸이 지친 것처럼 느껴져도, 머리가 계속 켜져 있는 상태일 수 있습니다.',
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
      label: '05 · 알아두면 좋은 성분',
      title: '이럴 때 알아두면 좋은 성분이 있습니다. GABA입니다.',
      body: 'GABA는 우리 몸에 원래 있는 성분으로, 몸속에서 신호를 주고받는 데 관여합니다.',
      tone: 'green-dark',
    },
    {
      id: 'research',
      label: '06 · 일반 GABA 연구',
      title: '일반 GABA 연구에서는 뇌파·스트레스·수면 관련 변화를 살펴봤습니다.',
      body: '연구마다 참여자, 섭취량, 기간이 달라 결과를 그대로 제품에 적용할 수는 없습니다.',
      tone: 'research',
      note: '중요: 아래 연구는 일반 GABA 원료 또는 GABA 섭취를 살펴본 자료입니다. 셀핀다 제품의 효능을 직접 입증하는 자료가 아닙니다.',
      link: {href: RESEARCH_URL, label: '일반 GABA 연구 원문 보기'},
    },
    {
      id: 'product',
      label: '07 · 셀핀다 제품 정보',
      title: '제품 구성과 섭취 방법은 제품 표시사항에서 확인하세요.',
      body: '셀핀다 가바 1500의 상품 구성, 가격, 재고, 섭취 방법은 스마트스토어와 제품 포장을 기준으로 확인합니다.',
      tone: 'product',
      note: '제품 정보는 일반 GABA 연구 결과와 별도로 확인해야 합니다.',
      link: {href: PRODUCT_URL, label: '스마트스토어 제품 정보 보기'},
    },
    {
      id: 'use',
      label: '08 · 활용 TIP',
      title: '맛과 향이 부담스럽지 않다면 평소 음식에 섞어 활용할 수 있습니다.',
      body: '물·요거트·두유·스무디 등에 넣는 방법을 생각해 볼 수 있습니다. 실제 섭취량과 방법은 제품 표시를 먼저 확인하세요.',
      tone: 'use',
    },
    {
      id: 'evening',
      label: '09 · 저녁 루틴 TIP',
      title: '저녁에는 카페인 없는 허브티와 함께 차분한 루틴을 만들어 보세요.',
      body: '캐모마일·자스민 등 허브티는 제품별 원료와 주의사항이 다를 수 있으니 표시사항을 확인하세요.',
      tone: 'evening',
      note: '허브티와 함께 먹는다고 수면 효과가 보장되는 것은 아닙니다.',
    },
    {
      id: 'review',
      label: '10 · 구매자 후기',
      title: '후기는 다른 사람의 경험을 참고하는 자료입니다.',
      body: '나에게도 같은 결과가 나타난다는 뜻은 아니므로, 제품 정보와 후기를 나누어 살펴보세요.',
      tone: 'review',
      note: '후기는 개인 경험이며 제품 효능을 입증하는 연구자료가 아닙니다.',
      link: {href: `${PRODUCT_URL}#REVIEW_DIALOG`, label: '스마트스토어 후기 보기'},
    },
    {
      id: 'finish',
      label: '11 · 마지막 확인',
      title: '일반 GABA 연구, 제품 정보, 구매자 후기를 각각 확인해 보세요.',
      body: '내 상태를 먼저 돌아보고, 오늘 실천할 작은 휴식부터 정해 보세요.',
      tone: 'finish',
      link: {href: PRODUCT_URL, label: '제품 정보 확인하기'},
    },
  ];
}

export default function App() {
  const slides = useMemo(makeSlides, []);
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slideRefs.current[next]?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest'});
  };

  return <>
    <header className="site-header">
      <a className="brand" href="#top">Cellpinda<span>.</span></a>
      <p>GABA 소비자용 한 장 요약</p>
    </header>

    <main id="top">
      <section className="intro" aria-labelledby="page-title">
        <div className="intro-copy">
          <p className="eyebrow">별도 소비자용 소개 페이지</p>
          <h1 id="page-title">GABA를<br /><em>한 장씩</em> 알아보세요.</h1>
          <p className="intro-body">일상 속 뇌 과부하에서 GABA 설명, 일반 연구, 제품 정보와 활용 팁까지 옆으로 넘기며 확인해 보세요.</p>
          <p className="separation-note">이 페이지는 기존 셀핀다 GABA 공식 배포 사이트와 구분되는 별도 소비자용 소개 페이지입니다.</p>
          <a className="text-button" href="#story">첫 카드부터 보기 <span aria-hidden="true">↓</span></a>
        </div>
        <div className="intro-orbit" aria-hidden="true"><span>GABA</span><i>일상<br />이해</i></div>
      </section>

      <section id="story" className="story" aria-labelledby="story-title">
        <div className="story-heading">
          <div>
            <p className="eyebrow">1 page · 1 message</p>
            <h2 id="story-title">오늘 내 상태에서<br />GABA까지 이어서 보기</h2>
          </div>
          <p>모바일에서는 좌우로 밀어 보세요.<br />연구·제품·후기는 각각 다른 정보입니다.</p>
        </div>
        <div className="story-controls">
          <span aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div>
            <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="이전 카드">←</button>
            <button type="button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="다음 카드">→</button>
          </div>
        </div>
        <div className="story-rail" ref={railRef} tabIndex={0} aria-label="GABA 소개 카드 목록">
          {slides.map((slide, index) => <article
            key={slide.id}
            ref={element => {slideRefs.current[index] = element;}}
            data-index={index}
            className={`story-card story-card--${slide.tone}`}
            aria-labelledby={`slide-${slide.id}`}
          >
            <div className="card-label"><span>{slide.label}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div className="card-content">
              <h3 id={`slide-${slide.id}`}>{slide.title}</h3>
              <p>{slide.body}</p>
              {slide.link ? <a className="card-link" href={slide.link.href} target="_blank" rel="noreferrer">{slide.link.label} <span aria-hidden="true">↗</span></a> : null}
              {slide.note ? <small>{slide.note}</small> : null}
            </div>
          </article>)}
        </div>
        <div className="story-dots" aria-hidden="true">{slides.map((slide, index) => <span key={slide.id} className={index === active ? 'active' : ''} />)}</div>
      </section>

      <section className="guardrail" aria-label="정보 구분 안내">
        <div><span>01</span><h2>일반 GABA 연구</h2><p>GABA 원료 또는 GABA 섭취를 살펴본 연구입니다.</p></div>
        <div><span>02</span><h2>셀핀다 제품 정보</h2><p>제품 표시사항과 스마트스토어에서 확인합니다.</p></div>
        <div><span>03</span><h2>구매자 후기</h2><p>개인 경험을 참고하는 자료입니다.</p></div>
      </section>
    </main>

    <footer className="site-footer">
      <p>셀핀다 GABA 소비자용 소개 · 기존 공식 배포 사이트와 별도 운영</p>
      <a href={PRODUCT_URL} target="_blank" rel="noreferrer">스마트스토어 제품 정보 ↗</a>
    </footer>
  </>;
}
