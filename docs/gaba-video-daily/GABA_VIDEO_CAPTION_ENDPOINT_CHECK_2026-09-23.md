# 2026-09-23 자막 본문 엔드포인트 재확인

사용자가 제공한 Shorts 8건을 대상으로 자막 본문 접근 주소를 별도로 재확인했다. 현재 자동 접근에서는 각 영상의 두 자막 요청 방식이 모두 HTTP 429를 반환했고 본문은 0바이트였다.

| 영상 ID | 공식 원문 | `video.google.com/timedtext` | `youtube.com/api/timedtext` | 판정 |
| --- | --- | ---: | ---: | --- |
| Cnk0PGn9YBM | [원문](https://www.youtube.com/shorts/Cnk0PGn9YBM) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| RLAU1VWGsaI | [원문](https://www.youtube.com/shorts/RLAU1VWGsaI) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| vnocd9ZVJj0 | [원문](https://www.youtube.com/shorts/vnocd9ZVJj0) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| BiZXS_ojLUA | [원문](https://www.youtube.com/shorts/BiZXS_ojLUA) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| 7Zsxm9Wh2Yg | [원문](https://www.youtube.com/shorts/7Zsxm9Wh2Yg) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| rOFkZg09AoY | [원문](https://www.youtube.com/shorts/rOFkZg09AoY) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| 4MTqi-bapLY | [원문](https://www.youtube.com/shorts/4MTqi-bapLY) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |
| 4xGSHxkMYew | [원문](https://www.youtube.com/shorts/4xGSHxkMYew) | 429 / 0바이트 | 429 / 0바이트 | 원문 사람 확인 전 |

## 운영 적용

- 자동 접근 결과는 자막·발언 확인으로 승격하지 않는다.
- DB의 `무엇을 어떻게 소개했나`와 `인물 소개`는 예비 요약과 사람 확인 요약을 분리한다.
- 8건 모두 `PUBLISH_GENERAL`로 전환하지 않고, 사람 검토자가 원문을 직접 재생해 타임코드·발언·화자·권리·주장 범위를 기록한다.
- 제목·채널명·공개 설명은 검색과 우선순위 판단에만 사용하며, 의사·과학자 자격이나 GABA 효능의 증거로 사용하지 않는다.
- 자막 본문을 확보하더라도 텍스트 존재만으로 과학적 타당성·제품 효능·공개 권리를 승인하지 않는다.

이 기록은 영상 원문을 내려받거나 재편집하기 위한 자료가 아니며, YouTube 원문 링크를 사람 감리하는 운영 증거로만 보관한다.
