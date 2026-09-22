# GABA Shorts 자막 접근 감사

## 감사 범위

- 감사일: 2026-09-22
- 대상: 사용자가 제공한 YouTube Shorts 8건
- 목적: 자막 트랙의 존재와 실제 자막 본문 확보 여부를 분리 기록
- 전체 결과: 자막 트랙 8/8건 발견, 자막 본문 자동 확보는 HTTP 429로 실패
- 공개 판정: 이 문서는 공개 승인 기록이 아니며, `PENDING_REVIEW`·`HOLD`·`LIMITED_USE` 상태를 바꾸지 않는다.

## 결과

| ID | 영상 ID | watch 페이지 자막 트랙 | 언어·형식 | 자막 본문 자동 확보 | 다음 감리 |
| --- | --- | --- | --- | --- | --- |
| SHORT-01 | Cnk0PGn9YBM | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-02 | RLAU1VWGsaI | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-03 | vnocd9ZVJj0 | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-04 | BiZXS_ojLUA | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-05 | 7Zsxm9Wh2Yg | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-06 | rOFkZg09AoY | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-07 | 4MTqi-bapLY | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |
| SHORT-08 | 4xGSHxkMYew | 발견 | 한국어 자동 생성 | 실패 · caption endpoint HTTP 429 | 사람이 원문 재생·자막·발언 구간 확인 |

## 해석 경계

`captionTracks`가 watch 페이지에 존재한다는 것은 자막 트랙 안내가 노출됐다는 뜻일 뿐, 자동 생성 자막의 정확성·완전성·화자 확인을 의미하지 않는다. 자동 자막 본문을 확보하지 못했으므로 현재 DB의 `무엇을 어떻게 소개했나`와 `인물 소개`는 제목·공개 설명 기반 예비 요약으로 유지한다.

사람 검토자는 원문을 직접 재생해 다음을 기록해야 한다.

1. 실제 화자와 영상 속 소속·자격
2. GABA를 어떤 맥락과 순서로 설명했는지
3. 수면·스트레스·불안·질환·제품 효능을 단정하는 발언과 타임코드
4. 일반 GABA 생리 설명으로 제한 가능한 구간
5. 원문 링크·임베드·인용의 사용 조건
