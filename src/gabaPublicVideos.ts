// Keep the consumer bundle limited to fields needed by the public,
// product-independent video showcase. Detailed claims, review status, rights,
// evidence, and next actions stay in the presenter-only video database.
export type PublicGabaVideoRecord = {
  id: string;
  title: string;
  publicTitle: string;
  publicSummary: string;
  publicPersonSummary: string;
  publicOperatorSentence: string;
  url: string;
  previewImage?: string;
  previewAlt?: string;
  previewLabel?: string;
  channel: string;
  speaker: string;
};

const sharedVideos: PublicGabaVideoRecord[] = [
  {
    id: 'SHORT-08',
    title: 'GABA의 역할을 묻는 영상 후보',
    publicTitle: 'GABA의 역할을 소개하는 영상',
    publicSummary: 'GABA가 뇌와 신경 신호에서 어떤 역할을 하는지 쉽게 소개합니다.',
    publicPersonSummary: '채널 소개에서는 이제원 원장·한방내과 전문의로 소개된 화자가 설명합니다.',
    publicOperatorSentence: 'GABA가 뇌와 신경 신호를 조절하는 역할을 알아봅니다.',
    url: 'https://www.youtube.com/shorts/4xGSHxkMYew',
    previewImage: 'https://i.ytimg.com/vi/4xGSHxkMYew/hqdefault.jpg',
    previewAlt: 'GABA의 역할을 소개하는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: '비엠한방내과 공식 채널',
    speaker: '공식 게시물상 이제원 원장·한방내과 전문의',
  },
  {
    id: 'SHORT-04',
    title: 'GABA의 일반 역할을 소개하는 영상 후보',
    publicTitle: 'GABA와 뇌 신호를 알아보는 영상',
    publicSummary: 'GABA가 뇌에서 신호를 조절하는 과정을 일상적인 말로 설명합니다.',
    publicPersonSummary: '채널 소개에서는 손유리 신경과 전문의로 소개된 화자가 GABA와 뇌 신호를 설명합니다.',
    publicOperatorSentence: 'GABA와 뇌 신호가 어떻게 연결되는지 살펴봅니다.',
    url: 'https://www.youtube.com/shorts/BiZXS_ojLUA',
    previewImage: 'https://i.ytimg.com/vi/BiZXS_ojLUA/hqdefault.jpg',
    previewAlt: 'GABA와 뇌 신호를 알아보는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: '브레인튜브 공식 채널',
    speaker: '채널 프로필상 손유리 신경과 전문의',
  },
  {
    id: 'SHORT-05',
    title: '음식과 GABA의 관계를 설명하는 영상 후보',
    publicTitle: '음식 속 GABA를 알아보는 영상',
    publicSummary: '음식 속 GABA와 우리 몸의 관계를 쉽게 설명합니다.',
    publicPersonSummary: '채널 소개에서는 정이안 한의학 박사·한의원 원장으로 소개된 화자가 음식 속 GABA를 설명합니다.',
    publicOperatorSentence: '음식 속 GABA와 우리 몸의 관계를 알아봅니다.',
    url: 'https://www.youtube.com/shorts/7Zsxm9Wh2Yg',
    previewImage: 'https://i.ytimg.com/vi/7Zsxm9Wh2Yg/hqdefault.jpg',
    previewAlt: '음식 속 GABA를 알아보는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: '30년 자율신경, 정이안한의원TV',
    speaker: '공식 소개 자료상 정이안 한의학 박사',
  },
  {
    id: 'SHORT-02',
    title: 'GABA와 수면을 연결해 질문하는 영상 후보',
    publicTitle: 'GABA와 수면을 알아보는 영상',
    publicSummary: 'GABA와 수면이 어떤 관계로 설명되는지 살펴봅니다.',
    publicPersonSummary: '채널 소개에서는 이동환 가정의학과 전문의로 소개된 화자가 GABA와 수면을 설명합니다.',
    publicOperatorSentence: 'GABA와 수면의 연결을 쉽게 알아봅니다.',
    url: 'https://www.youtube.com/shorts/RLAU1VWGsaI',
    previewImage: 'https://i.ytimg.com/vi/RLAU1VWGsaI/hqdefault.jpg',
    previewAlt: 'GABA와 수면을 알아보는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: '의학 설명 채널',
    speaker: '채널 프로필상 이동환 가정의학과 전문의',
  },
  {
    id: 'SHORT-03',
    title: 'GABA와 신경 신호를 연결해 설명하는 영상 후보',
    publicTitle: 'GABA와 신경 신호를 알아보는 영상',
    publicSummary: 'GABA가 신경 신호를 조절하는 성분으로 어떻게 소개되는지 살펴봅니다.',
    publicPersonSummary: '채널 소개에서는 약학박사·제약 연구 경력자로 소개된 화자가 GABA와 신경 신호를 설명합니다.',
    publicOperatorSentence: 'GABA와 신경 신호의 관계를 쉽게 알아봅니다.',
    url: 'https://www.youtube.com/shorts/vnocd9ZVJj0',
    previewImage: 'https://i.ytimg.com/vi/vnocd9ZVJj0/hqdefault.jpg',
    previewAlt: 'GABA와 신경 신호를 알아보는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: '영양과학 관련 채널',
    speaker: '채널 프로필상 약학박사·제약 연구 경력자',
  },
  {
    id: 'SHORT-06',
    title: '경구 GABA와 일반 연구를 질문하는 영상 후보',
    publicTitle: 'GABA와 수면 연구를 알아보는 영상',
    publicSummary: '섭취한 GABA와 수면 연구가 어떻게 연결되는지 살펴봅니다.',
    publicPersonSummary: '공개 학술자료에서 연구자 신원철로 소개된 화자가 GABA와 수면 연구를 설명합니다.',
    publicOperatorSentence: '섭취한 GABA와 수면 연구의 연결을 알아봅니다.',
    url: 'https://www.youtube.com/shorts/rOFkZg09AoY',
    previewImage: 'https://i.ytimg.com/vi/rOFkZg09AoY/hqdefault.jpg',
    previewAlt: 'GABA와 수면 연구를 알아보는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: 'SLEEP Dr. 신원철 꿀잠튜브',
    speaker: '공식 학술자료에 연구자로 기재된 신원철',
  },
  {
    id: 'SHORT-07',
    title: 'GABA와 긴장·뇌 신호를 연결하는 영상 후보',
    publicTitle: 'GABA와 긴장·뇌 신호를 알아보는 영상',
    publicSummary: 'GABA와 긴장, 뇌 신호의 관계를 쉽게 살펴봅니다.',
    publicPersonSummary: '공개 채널은 GABA와 긴장·뇌 신호를 다루는 영상으로 소개합니다.',
    publicOperatorSentence: 'GABA와 긴장, 뇌 신호의 연결을 알아봅니다.',
    url: 'https://www.youtube.com/shorts/4MTqi-bapLY',
    previewImage: 'https://i.ytimg.com/vi/4MTqi-bapLY/hqdefault.jpg',
    previewAlt: 'GABA와 긴장·뇌 신호를 알아보는 영상 미리보기',
    previewLabel: 'YouTube Shorts',
    channel: '뇌 건강 관련 채널',
    speaker: '공개 설명에 화자 자격 미기재',
  },
];

export const SHARED_GABA_VIDEOS = sharedVideos;

// No domestic record has passed the human publication gate yet.
export const DOMESTIC_PUBLIC_GABA_VIDEOS: PublicGabaVideoRecord[] = [];
