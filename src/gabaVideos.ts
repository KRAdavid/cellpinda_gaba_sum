export type GabaVideoStatus =
  | 'PUBLISH_GENERAL'
  | 'LIMITED_USE'
  | 'HOLD'
  | 'EXCLUDE'
  | 'PENDING_REVIEW'
  | 'AUTO_FILTERED';

export type GabaVideoAudit = {
  contentBasis: 'ORIGINAL_PAGE_TRANSCRIPT' | 'OFFICIAL_EVENT_PAGE' | 'TITLE_AND_PUBLIC_DESCRIPTION' | 'UNREVIEWED';
  authorityLevel: 'VERIFIED' | 'PARTIAL' | 'UNVERIFIED';
  evidenceLevel: 'A' | 'B' | 'C' | 'D' | 'UNREVIEWED';
  claimCategories: Array<'GENERAL_PHYSIOLOGY' | 'ORAL_GABA_HUMAN_RESEARCH' | 'SLEEP_STRESS' | 'DISEASE_TREATMENT' | 'PRODUCT_COMMERCIAL' | 'UNREVIEWED'>;
  rightsStatus: 'SOURCE_PAGE' | 'CHECK_REQUIRED' | 'NOT_FOR_USE';
  usageMode: 'SOURCE_LINK' | 'EMBED_IF_ALLOWED' | 'REVIEW_ONLY' | 'EXCLUDE';
  nextAction: string;
};

export type GabaVideoRecord = {
  id: string;
  title: string;
  publicTitle?: string;
  publicSummary?: string;
  publicPersonSummary?: string;
  publicOperatorSentence?: string;
  url: string;
  previewImage?: string;
  previewAlt?: string;
  previewLabel?: string;
  channel: string;
  sourceChannelUrl?: string;
  speaker: string;
  authorityEvidenceUrl?: string;
  researchEvidenceUrl?: string;
  summary: string;
  operatorSentence: string;
  personSummary: string;
  status: GabaVideoStatus;
  statusReason: string;
  checkedAt: string;
  audit: GabaVideoAudit;
};

export const GABA_VIDEO_DB: GabaVideoRecord[] = [
  {
    id: 'AUTH-01',
    title: 'GABA Neurotransmitter',
    url: 'https://dnalc.cshl.edu/view/485-GABA-Neurotransmitter.html',
    previewLabel: 'CSHL DNA Learning Center · 공식 교육 영상 페이지',
    channel: 'Cold Spring Harbor Laboratory DNA Learning Center',
    speaker: 'Professor Trevor Robbins',
    summary: 'GABA를 중추신경계의 대표적인 억제성 신경전달물질로 설명하고, 신경세포의 활동을 조절하는 기본 원리를 교육 영상과 transcript로 소개합니다.',
    operatorSentence: 'GABA가 신경 신호를 조절하는 일반 원리를 보여주는 교육 자료입니다.',
    personSummary: 'CSHL DNA Learning Center 공개 페이지가 Professor Trevor Robbins의 GABAergic system 설명 영상으로 소개합니다. 일반 생리 설명 중심이며 제품·구매 주장은 확인되지 않습니다.',
    status: 'PUBLISH_GENERAL',
    statusReason: '교육기관 공개 페이지, 영상과 transcript 확인 가능, 일반 GABA 기능 중심, 제품 효능·구매 유도 없음. 원문 링크 방식으로 공개합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'ORIGINAL_PAGE_TRANSCRIPT',
      authorityLevel: 'VERIFIED',
      evidenceLevel: 'A',
      claimCategories: ['GENERAL_PHYSIOLOGY'],
      rightsStatus: 'SOURCE_PAGE',
      usageMode: 'SOURCE_LINK',
      nextAction: '일반 생리 설명 카드에서 교육기관 원문 링크로 제공',
    },
  },
  {
    id: 'AUTH-02',
    title: 'Molecular regulation of synaptic inhibition',
    url: 'https://videocast.nih.gov/watch=51064',
    previewImage: 'https://nihcit.rev.vbrick.com/api/v2/media/videos/thumbnails/481c6ac0-a2b8-4155-9eb5-5586edb95d83.jpg',
    previewAlt: 'NIH VideoCast GABA 시냅스 억제 강의 미리보기',
    previewLabel: 'NIH VideoCast · 공식 연구 세미나',
    channel: 'NIH VideoCast · NINDS Director’s Seminar Series',
    speaker: 'Wei Lu, Ph.D., NINDS, NIH',
    summary: 'GABA가 GABAA 수용체를 통해 빠른 억제성 신호를 매개하고, 흥분성 신호와 균형을 이루며 신경 출력을 조절하는 원리를 강의 형식으로 소개합니다.',
    operatorSentence: 'GABA와 시냅스 억제의 분자 원리를 설명하는 NIH 연구 세미나입니다.',
    personSummary: 'NIH VideoCast가 NINDS의 Wei Lu, Ph.D. 강의로 공개한 공식 연구 세미나입니다. 분자·시냅스 수준의 과학 설명이며 제품이나 구매 주장은 다루지 않습니다.',
    status: 'PUBLISH_GENERAL',
    statusReason: 'NIH 공식 VideoCast, 발표자·소속·강의 설명 확인 가능, GABA 일반 생리 중심. 일반 소비자에게는 핵심 구간을 선별해 원문 링크로 제공합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'OFFICIAL_EVENT_PAGE',
      authorityLevel: 'VERIFIED',
      evidenceLevel: 'A',
      claimCategories: ['GENERAL_PHYSIOLOGY'],
      rightsStatus: 'SOURCE_PAGE',
      usageMode: 'SOURCE_LINK',
      nextAction: '분자·시냅스 일반 설명 구간을 확인한 뒤 NIH 원문 링크로 제공',
    },
  },
  {
    id: 'VID-01',
    title: '수면에 도움이 되는 성분, 가바(GABA)를 아시나요?',
    url: 'https://www.youtube.com/watch?v=z-VLanhugWI&t=152s',
    channel: '의학채널 비온뒤',
    speaker: '여에스더 박사',
    summary: '수면과 GABA를 연결해 설명하는 장편 영상의 후보 구간입니다. 현재는 제목·등록부 기록 기반의 예비 요약이며, 실제 발언과 전체 맥락은 원문 확인이 필요합니다.',
    operatorSentence: '수면 관련 표현과 원출처·발언 구간을 확인하기 전에는 공개 설명 영상으로 사용하지 않는 후보입니다.',
    personSummary: '등록부는 여에스더 박사와 의학채널 비온뒤 영상으로 기록하지만, 이 후보의 실제 발언 구간·자막·권리 상태는 별도 확인이 필요합니다.',
    status: 'HOLD',
    statusReason: '수면 도움 표현이 일반 GABA 기능·경구 섭취·제품 주장과 어떻게 연결되는지 원문·자막·과학 근거·권리 확인이 필요합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'PARTIAL',
      evidenceLevel: 'C',
      claimCategories: ['SLEEP_STRESS', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '152초 전후 발언·전체 자막·원출처·상업 링크를 확인한 뒤 공개 여부를 재검토',
    },
  },
  {
    id: 'SHORT-01',
    title: '여에스더 "갱년기 잠 못 자면 노화 빨라져요" 수면제보다 안전한 영양제',
    url: 'https://www.youtube.com/shorts/Cnk0PGn9YBM',
    channel: '셀럽의 건강비결',
    sourceChannelUrl: 'https://www.youtube.com/@Celeb_tip',
    speaker: '제목에 여에스더를 내세운 재게시 채널',
    summary: '갱년기 수면을 도입으로 식품·GABA·수면 관련 원료를 나열하는 방식으로 소개합니다. 제목·공개 설명 기반 예비 요약입니다.',
    operatorSentence: '원출처와 발언을 확인하기 전에는 고객 설명 자료로 사용하지 않는 후보입니다.',
    personSummary: '원출연자·원본 방송·해당 발언의 원출처를 이 영상만으로 확인하지 못했습니다.',
    status: 'EXCLUDE',
    statusReason: '재게시 여부와 다중 건강효과 표현을 확인하기 전에는 권위 영상으로 사용하지 않습니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'UNVERIFIED',
      evidenceLevel: 'C',
      claimCategories: ['SLEEP_STRESS', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'NOT_FOR_USE',
      usageMode: 'EXCLUDE',
      nextAction: '원출처와 재사용 권리를 확인하기 전 공개 자료에서 제외',
    },
  },
  {
    id: 'SHORT-02',
    title: '잠자기 어렵다면 수면제 말고 이것으로 해결하세요. #가바',
    url: 'https://www.youtube.com/shorts/RLAU1VWGsaI',
    channel: '교육하는 의사! 이동환TV',
    sourceChannelUrl: 'https://www.youtube.com/@doctorLeeTV',
    speaker: '이동환',
    summary: '수면제 말고 GABA를 살펴보자는 대안 프레임으로 소개합니다. 정확한 발언은 원문 확인 전입니다.',
    operatorSentence: '수면제 대체로 오해될 수 있어 원문과 자막 확인 전에는 소개하지 않는 후보입니다.',
    personSummary: '직무스트레스연구소 공식 프로필은 이동환을 가정의학과 전문의·직무스트레스연구소 대표로 소개합니다. 이 출처는 인물·경력 확인용이며 수면제 대체 표현, 영상 발언, GABA 연구·제품 효능을 승인하지 않습니다.',
    authorityEvidenceUrl: 'https://www.stressmanagement.co.kr/page/49jdfx45',
    status: 'HOLD',
    statusReason: '수면제 대체로 읽히는 표현, 자막, 연구 근거와 사용 권리를 추가 확인해야 합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'PARTIAL',
      evidenceLevel: 'C',
      claimCategories: ['SLEEP_STRESS', 'DISEASE_TREATMENT', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '전체 자막에서 수면제 대체 표현과 근거·상업 링크를 확인',
    },
  },
  {
    id: 'SHORT-03',
    title: "신경을 안정시켜 수면에 도움되는 '가바' (GABA, 졸피뎀, 자낙스, 가바수용체)",
    url: 'https://www.youtube.com/shorts/vnocd9ZVJj0',
    channel: '영양과학자 양과자',
    sourceChannelUrl: 'https://www.youtube.com/@snack-yang',
    speaker: '채널명 기반 화자',
    summary: 'GABA를 신경 안정과 수면의 연결고리로 소개하고 영양제 리뷰 콘텐츠로 연결합니다. 원문 확인 전입니다.',
    operatorSentence: '신경 안정·수면과 보충제 연결이 있어 화자와 전체 발언 확인이 필요한 후보입니다.',
    personSummary: '화자의 실명·학위·소속을 독립적인 원출처로 확인하지 못했습니다.',
    status: 'HOLD',
    statusReason: '보충제 추천과 약물 비교가 일반 GABA 연구와 분리되는지 확인해야 합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'UNVERIFIED',
      evidenceLevel: 'C',
      claimCategories: ['SLEEP_STRESS', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '화자 자격·전체 발언·보충제 추천 구간과 상업성을 확인',
    },
  },
  {
    id: 'SHORT-04',
    title: '불면증에 가바 영양제가 좋다는 이유',
    url: 'https://www.youtube.com/shorts/BiZXS_ojLUA',
    channel: '브레인튜브 Brain Doctor',
    sourceChannelUrl: 'https://www.youtube.com/@%EB%B8%8C%EB%A0%88%EC%9D%B8%ED%8A%9C%EB%B8%8CBrainDoctor',
    speaker: '실제 화자 확인 필요',
    summary: 'GABA를 뇌의 진정·안정 작용과 관련된 신경전달물질로 한 문장 정의한 뒤 불면증·영양제로 확장합니다.',
    operatorSentence: '일반 GABA 정의 구간만 확인한 뒤 제한적으로 검토할 수 있는 후보입니다.',
    personSummary: '서울정형외과·신경과 공식 사이트는 손유리를 병원 대표로 표시하며 신경과 진료기관 정보를 제공합니다. 이 출처는 실제 쇼츠 화자·자격·GABA 발언의 범위를 대신 확인하지 않습니다.',
    authorityEvidenceUrl: 'https://www.seoulsangok.com/',
    status: 'LIMITED_USE',
    statusReason: '일반 GABA 정의 구간만 자막·타임코드 확인 후 검토할 수 있습니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'PARTIAL',
      evidenceLevel: 'B',
      claimCategories: ['GENERAL_PHYSIOLOGY', 'SLEEP_STRESS'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '일반 정의 구간의 자막·타임코드·실제 화자를 확인',
    },
  },
  {
    id: 'SHORT-05',
    title: '자율신경건강을 지켜줄 음식 - GABA 성분 #shorts',
    url: 'https://www.youtube.com/shorts/7Zsxm9Wh2Yg',
    channel: '30년 자율신경, 정이안한의원TV',
    sourceChannelUrl: 'https://www.youtube.com/@JeongianTV',
    speaker: '정이안',
    summary: '자율신경 건강을 음식과 GABA 성분의 관계로 설명하는 프레임입니다. 제목·채널 설명 기반 예비 요약입니다.',
    operatorSentence: '음식 속 GABA와 섭취 후 효과를 분리 확인하기 전에는 공개 설명에 사용하지 않는 후보입니다.',
    personSummary: '서울시 공개 소개 자료는 정이안을 한의학 박사·한의원 원장·동국대 외래교수로 소개합니다. 이 확인은 영상 발언과 GABA 연구 근거를 승인하는 자료가 아닙니다.',
    authorityEvidenceUrl: 'https://mediahub.seoul.go.kr/archives/1114317',
    status: 'LIMITED_USE',
    statusReason: 'GABA 함유 식품과 섭취 후 인체 효과를 분리 확인해야 합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'PARTIAL',
      evidenceLevel: 'C',
      claimCategories: ['GENERAL_PHYSIOLOGY', 'ORAL_GABA_HUMAN_RESEARCH', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '음식 속 GABA와 경구 섭취 연구·개인 효과 주장을 분리',
    },
  },
  {
    id: 'SHORT-06',
    title: '영양제로 먹는 가바(GABA), 정말 효과 있을까? 부작용 없는 천연 수면 보충제의 비밀',
    url: 'https://www.youtube.com/shorts/rOFkZg09AoY',
    channel: 'SLEEP Dr. 신원철 꿀잠튜브',
    sourceChannelUrl: 'https://www.youtube.com/@sleepdoctor1',
    speaker: '신원철',
    summary: 'GABA가 뇌로 직접 가지 않는데 효과가 있는지를 질문으로 제시하고 수면 보충제의 작용과 안전성을 설명하겠다고 안내합니다.',
    operatorSentence: '경구 GABA와 수면·안전성 주장을 원문과 연구 조건으로 다시 확인해야 하는 후보입니다.',
    personSummary: '대한수면연구학회 공식 학술행사 안내는 신원철을 강동경희대학교병원 신경과 소속으로 표시하고, KCI 논문 기록은 그를 현미쌀눈 유래 GABA 수면 연구의 공저자로 등록합니다. 이 출처들은 인물·소속·연구 경력 확인용이며, 이 쇼츠의 실제 화자·발언·상업성·제품 효능을 자동 승인하지 않습니다.',
    authorityEvidenceUrl: 'https://www.sleepnet.or.kr/workshop/monthly/view?idx=150',
    researchEvidenceUrl: 'https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002182911',
    status: 'HOLD',
    statusReason: '부작용 없음·안전한 수면 보충제 같은 표현과 상업적 이해관계를 확인해야 합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'PARTIAL',
      evidenceLevel: 'C',
      claimCategories: ['ORAL_GABA_HUMAN_RESEARCH', 'SLEEP_STRESS', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '안전성 단정·복용 권고·이해관계와 경구 연구 조건을 확인',
    },
  },
  {
    id: 'SHORT-07',
    title: '불안 완화를 위한 GABA 활용법',
    url: 'https://www.youtube.com/shorts/4MTqi-bapLY',
    channel: '마음 튼튼, 뇌연구소 바이탈라이즈',
    sourceChannelUrl: 'https://www.youtube.com/@vitalize866',
    speaker: '공개 설명에 화자 자격 미기재',
    summary: '몸의 긴장과 뇌 신호를 연결하고 GABA·스트레스·불안 완화를 해시태그로 제시합니다.',
    operatorSentence: '불안 완화로 읽힐 수 있어 화자·자막·근거를 확인하기 전에는 사용하지 않는 후보입니다.',
    personSummary: '실제 화자 이름·학위·면허·소속을 확인하지 못했습니다.',
    status: 'HOLD',
    statusReason: '불안 완화가 치료·보충제 사용 지시로 읽히는지 먼저 감리해야 합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'UNVERIFIED',
      evidenceLevel: 'C',
      claimCategories: ['SLEEP_STRESS', 'DISEASE_TREATMENT', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '화자·자막·불안 완화 표현과 보충제 권고 여부를 확인',
    },
  },
  {
    id: 'SHORT-08',
    title: '가바는 어떤 역할을 하는 걸까? #gaba',
    url: 'https://www.youtube.com/shorts/4xGSHxkMYew',
    channel: '비엠한방내과 [bm_k_clinic]',
    sourceChannelUrl: 'https://www.youtube.com/@bm_k_clinic',
    speaker: '이제원',
    summary: 'GABA의 역할을 직접 묻고 한방내과 진료 철학과 연결해 소개합니다. 제목·공개 설명 기반 예비 요약입니다.',
    operatorSentence: '일반 역할 설명과 진료·약물·보충제 조언을 분리 확인해야 하는 후보입니다.',
    personSummary: '비엠한방내과 공식 게시물은 이제원 원장과 한방내과 전문의로서의 활동을 소개합니다. 공식 게시물은 영상 속 실제 화자와 GABA 발언의 근거·범위를 대신 확인하지 않습니다.',
    authorityEvidenceUrl: 'https://www.bmkclinic.com/bm-posts/a-scientists-perspective---bm-k-clinic-director-lee-je-wons-akomnews-interview',
    status: 'LIMITED_USE',
    statusReason: '일반 역할 설명과 진료·약물·보충제 조언 구간을 분리해야 합니다.',
    checkedAt: '2026-09-22',
    audit: {
      contentBasis: 'TITLE_AND_PUBLIC_DESCRIPTION',
      authorityLevel: 'PARTIAL',
      evidenceLevel: 'C',
      claimCategories: ['GENERAL_PHYSIOLOGY', 'DISEASE_TREATMENT', 'PRODUCT_COMMERCIAL'],
      rightsStatus: 'CHECK_REQUIRED',
      usageMode: 'REVIEW_ONLY',
      nextAction: '자격·실제 화자와 일반 역할 설명 구간을 먼저 확인',
    },
  },
];

export const PUBLIC_GABA_VIDEOS = GABA_VIDEO_DB.filter(video => video.status === 'PUBLISH_GENERAL');

// Keep overseas authority records for audit history, but do not surface them in
// the current presenter queue after the domestic-video curation decision.
export const ACTIVE_GABA_VIDEOS = GABA_VIDEO_DB.filter(video => !video.id.startsWith('AUTH-'));
export const DOMESTIC_PUBLIC_GABA_VIDEOS = ACTIVE_GABA_VIDEOS.filter(video => video.status === 'PUBLISH_GENERAL');

// The consumer showcase now uses the Shorts shared by the user today. These are
// link-only review candidates, not general-efficacy endorsements. EXCLUDE records
// stay out of the consumer surface until their source and rights are resolved.
const SHARED_GABA_VIDEO_ORDER = ['SHORT-08', 'SHORT-04', 'SHORT-05', 'SHORT-02', 'SHORT-03', 'SHORT-06', 'SHORT-07'];
const CONSUMER_GABA_VIDEO_COPY: Record<string, Pick<GabaVideoRecord, 'publicTitle' | 'publicSummary' | 'publicPersonSummary' | 'publicOperatorSentence'>> = {
  'SHORT-02': {
    publicTitle: 'GABA와 수면을 연결해 질문하는 영상 후보',
    publicSummary: '수면과 GABA를 연결해 질문을 던지는 방식의 영상입니다. 이 페이지에서는 원문 확인 전 검토 후보로만 소개합니다.',
    publicPersonSummary: '채널은 이동환을 의사로 소개하지만, 이 기록은 인물 확인용이며 영상의 실제 발언·근거·권위를 대신 승인하지 않습니다.',
    publicOperatorSentence: 'GABA와 수면을 연결한 영상 후보이며, 원문·자막·화자·권리 확인 후 일반 교육 자료로 사용할 수 있는지 판단합니다.',
  },
  'SHORT-03': {
    publicTitle: 'GABA와 신경 신호를 연결해 설명하는 영상 후보',
    publicSummary: 'GABA를 신경 신호와 연결해 설명하는 방식의 영상입니다. 정확한 내용과 맥락은 원문 확인이 필요합니다.',
    publicPersonSummary: '채널명으로 화자를 소개하고 있으나 실명·학위·소속은 이 기록만으로 확인되지 않았습니다.',
    publicOperatorSentence: 'GABA의 일반 기능을 설명하는 부분이 있는지 원문·자막·화자 확인 후 제한적으로 검토합니다.',
  },
  'SHORT-04': {
    publicTitle: 'GABA의 일반 역할을 소개하는 영상 후보',
    publicSummary: 'GABA를 뇌의 신호 조절과 연결해 설명하는 영상 후보입니다. 일반 생리 설명과 그 밖의 주장은 구분해 확인합니다.',
    publicPersonSummary: '관련 의료기관 출처가 있으나, 그 출처가 실제 영상 화자·발언·근거의 범위를 자동으로 확인해 주지는 않습니다.',
    publicOperatorSentence: 'GABA의 일반 정의·기능에 해당하는 구간만 원문과 자막으로 확인한 뒤 사용 범위를 판단합니다.',
  },
  'SHORT-05': {
    publicTitle: '음식과 GABA의 관계를 설명하는 영상 후보',
    publicSummary: '음식과 GABA 성분의 관계를 설명하는 방식의 영상입니다. 음식 속 성분과 사람에게 나타나는 결과는 따로 확인합니다.',
    publicPersonSummary: '정이안의 소속·경력 확인 출처가 있으나, 영상 발언과 GABA 연구 근거를 자동 승인하는 자료는 아닙니다.',
    publicOperatorSentence: '음식 속 GABA와 일반 인체 연구를 구분해 원문·자막·근거를 확인합니다.',
  },
  'SHORT-06': {
    publicTitle: '경구 GABA와 일반 연구를 질문하는 영상 후보',
    publicSummary: '섭취한 GABA가 어떻게 이해되는지를 질문하는 영상 후보입니다. 일반 연구의 조건과 영상의 설명을 따로 비교합니다.',
    publicPersonSummary: '신원철의 소속·연구 경력 확인 출처가 있으나, 이는 영상 발언·상업성·특정 결과를 자동 승인하지 않습니다.',
    publicOperatorSentence: '경구 GABA에 관한 영상 설명을 일반 연구의 조건·한계와 대조한 뒤 공개 범위를 판단합니다.',
  },
  'SHORT-07': {
    publicTitle: 'GABA와 긴장·뇌 신호를 연결하는 영상 후보',
    publicSummary: 'GABA와 긴장·뇌 신호의 관계를 연결해 설명하는 영상 후보입니다. 화자와 실제 발언은 원문 확인이 필요합니다.',
    publicPersonSummary: '공개 설명에서 실제 화자의 이름·학위·면허·소속을 확인하지 못했습니다.',
    publicOperatorSentence: '일반 GABA 기능 설명인지, 개인의 상태나 치료를 말하는지 원문과 자막을 먼저 확인합니다.',
  },
  'SHORT-08': {
    publicTitle: 'GABA의 역할을 묻는 영상 후보',
    publicSummary: 'GABA가 어떤 역할을 하는지 묻고 설명하는 영상 후보입니다. 일반 생리 설명과 진료·개인 조언은 구분해 확인합니다.',
    publicPersonSummary: '이제원의 소속·경력 확인 출처가 있으나, 영상 속 실제 화자와 발언의 근거·범위를 대신 확인하지는 않습니다.',
    publicOperatorSentence: 'GABA의 일반 역할 설명을 원문·자막·화자 확인 후 일반 교육 자료로 사용할 수 있는지 판단합니다.',
  },
};

export const SHARED_GABA_VIDEOS = GABA_VIDEO_DB
  .filter(video => video.id.startsWith('SHORT-') && video.status !== 'EXCLUDE')
  .sort((left, right) => SHARED_GABA_VIDEO_ORDER.indexOf(left.id) - SHARED_GABA_VIDEO_ORDER.indexOf(right.id))
  .map(video => {
    const videoId = video.url.match(/\/shorts\/([^?&#/]+)/)?.[1];
    return {
      ...video,
      ...CONSUMER_GABA_VIDEO_COPY[video.id],
      previewImage: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : video.previewImage,
      previewAlt: `${video.title} YouTube Shorts 미리보기`,
      previewLabel: 'YouTube Shorts · 오늘 공유 영상',
    };
  });
