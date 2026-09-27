# 사용자 제공 Shorts 원문 메타데이터 재확인

## 확인 범위

- 확인일: 2026-09-27
- 대상: 사용자가 제공한 국내 Shorts 8건의 YouTube 원문 페이지
- 확인한 항목: YouTube oEmbed 공개 제목·게시 채널·원문 링크
- 확인하지 않은 항목: 영상 전체 발언·자막·실제 화자·과학적 근거·권리·`PUBLISH_GENERAL`

YouTube 페이지의 제목이나 채널이 확인되어도 영상의 내용·화자 자격·과학적 타당성·사용 권리를 승인한 것으로 보지 않는다. 아래 결과는 제목 수준의 감리 신호만 추가한 기록이며 영상 상태를 자동 변경하지 않는다.

## 결과

| ID | 원문 | 제목 수준 확인 | 운영 판정 |
| --- | --- | --- | --- |
| SHORT-01 | [YouTube Shorts](https://www.youtube.com/shorts/Cnk0PGn9YBM) | `여에스더 "갱년기 잠 못 자면 노화 빨라져요" 수면제보다 안전한 영양제` · 셀럽의 건강비결 | 수면제·안전성 프레임과 재게시 여부를 확인하기 전 `EXCLUDE` 유지 |
| SHORT-02 | [YouTube Shorts](https://www.youtube.com/shorts/RLAU1VWGsaI) | `잠자기 어렵다면 수면제 말고 이것으로 해결하세요. #가바` 제목 확인 | 수면제 대체 프레임이므로 `HOLD` 유지 · 공개 카피에 재전달하지 않음 |
| SHORT-03 | [YouTube Shorts](https://www.youtube.com/shorts/vnocd9ZVJj0) | `신경을 안정시켜 수면에 도움되는 '가바' (GABA, 졸피뎀, 자낙스, 가바수용체)` 제목 확인 | 약물·수면 도움 프레임이므로 `HOLD` 유지 · 일반 GABA 기능과 분리 |
| SHORT-04 | [YouTube Shorts](https://www.youtube.com/shorts/BiZXS_ojLUA) | `불면증에 가바 영양제가 좋다는 이유` · 브레인튜브 Brain Doctor | 불면증·영양제 효과 프레임을 원문에서 분리 확인하기 전 `LIMITED_USE` 유지 |
| SHORT-05 | [YouTube Shorts](https://www.youtube.com/shorts/7Zsxm9Wh2Yg) | `자율신경건강을 지켜줄 음식 - GABA 성분 #shorts` · 30년 자율신경, 정이안한의원TV | 음식·건강 결과 연결을 확인하기 전 `LIMITED_USE` 유지 |
| SHORT-06 | [YouTube Shorts](https://www.youtube.com/shorts/rOFkZg09AoY) | `영양제로 먹는 가바(GABA), 정말 효과 있을까? 부작용 없는 천연 수면 보충제의 비밀` · SLEEP Dr. 신원철 꿀잠튜브 | 효과·부작용 없음·수면 보충제 프레임이므로 `HOLD` 유지 |
| SHORT-07 | [YouTube Shorts](https://www.youtube.com/shorts/4MTqi-bapLY) | `불안 완화를 위한 GABA 활용법` · 마음 튼튼, 뇌연구소 바이탈라이즈 | 불안 완화·활용법 프레임이므로 `HOLD` 유지 |
| SHORT-08 | [YouTube Shorts](https://www.youtube.com/shorts/4xGSHxkMYew) | `가바는 어떤 역할을 하는 걸까? #gaba` · 비엠한방내과 [bm_k_clinic] | 일반 역할 구간과 개인 조언을 분리하기 전 `LIMITED_USE` 유지 |

## 첫 사람 감리 우선순위

자동 우선순위가 아니라 첫 회의에서 검토 시간을 줄이기 위한 제안 순서다. 아래 순서는 권위·과학성·권리·공개 승인을 의미하지 않는다.

1. **SHORT-08** — 제목이 GABA의 일반 역할을 직접 묻고 있어 일반 기능 구간과 개인 조언을 먼저 분리한다. 화자·자막·권리를 함께 확인한다.
2. **SHORT-04** — 신경과 관련 채널 후보지만 제목이 불면증·영양제 효과를 암시하므로 일반 GABA 정의 구간이 실제로 있는지 확인한다.
3. **SHORT-05** — 인물 출처 단서는 있으나 음식 속 GABA와 사람에게 나타나는 결과를 분리하고, 출처 페이지의 이용 조건을 확인한다.
4. **SHORT-02·03·06·07** — 수면제 대체·약물명·효과·부작용 없음·불안 완화 표현이 있어 원문·자막·주장 범위를 별도 감리한다.
5. **SHORT-01** — 재게시·수면제보다 안전하다는 표현이 있어 원출처와 권리 확인 전 공개 후보에서 제외한다.

우선순위가 끝나도 `PUBLISH_GENERAL`은 사람이 원문·자막·화자·권리·주장 범위를 모두 확인하고 결정 대장에 기록하기 전에는 선택하지 않는다.

## 공개 카피 적용

- SHORT-02·03의 원문 제목에 있는 수면제 대체·약물명·수면 도움 표현은 소비자용 `publicTitle`·`publicSummary`에 복사하지 않는다.
- 두 영상은 원문·자막·화자·권리·주장 범위를 사람이 확인하기 전까지 일반 GABA 기능을 뒷받침하는 권위 영상으로 소개하지 않는다.
- 현재 국내 `PUBLISH_GENERAL` 승인 수와 소비자용 검토 후보 수는 변경하지 않는다.

## 다음 감리

1. VIDEO 담당자가 원문을 직접 재생해 실제 발언과 제목의 일치 여부를 타임코드로 기록한다.
2. SCIENCE/MEDICAL 담당자가 일반 GABA 생리 설명과 약물 대체·수면 결과 주장을 분리한다.
3. RIGHTS 담당자가 YouTube 임베드·원문 링크·재사용 범위를 확인한다.
4. 세 확인이 끝나기 전에는 `HOLD`를 `PUBLISH_GENERAL`로 바꾸지 않는다.
