# 공개용 GABA 페이지 릴리스 인수인계

## 릴리스 식별

| 항목 | 값 |
| --- | --- |
| 공개 소비자 안내 | <https://kradavid.github.io/cellpinda_gaba_sum/> |
| 기존 공식 배포 사이트 | <https://kradavid.github.io/cellpinda_GABA/> |
| 저장소 | <https://github.com/KRAdavid/cellpinda_gaba_sum> |
| 앱 최신 커밋 | `d21733c` |
| 릴리스 검증 기준 Pages 배포 | [run 35602498730](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35602498730) (제품 카드 사실 확정 경계 보완본, 정적 번들 QA 및 공개 URL HTTP 200 확인) |
| 운영 문서 동기화 | `main`에 반영된 TF 문서와 Pages workflow가 동일 저장소에서 관리되며, 문서-only push도 workflow로 검증 |

두 사이트는 저장소·URL·배포 설정을 분리한다. 이 공개본은 소비자 안내와 사업자 발표를 위한 별도 페이지이며, 기존 공식 배포 사이트를 대체하거나 수정하지 않는다.

## 현재 확인된 범위

| 영역 | 확인 결과 | 근거 |
| --- | --- | --- |
| 카드 흐름 | 11개 카드, 모바일 좌우 스냅, 1페이지 1메시지 | 공개 URL 및 Chrome CDP 확인 |
| 외부 이탈 방지 | 연구·제품·후기 버튼은 인페이지 패널을 먼저 열고 외부 링크는 보조 CTA로만 제공 | `src/App.tsx`, `PUBLISHING_TF.md` |
| 발표 모드 | 이전·다음 버튼, 키보드 이동, 발표자용 진행 포인트(질문·경계 문장), `?mode=presenter&card=N#story` | 공개 URL 확인 |
| 제품·연구 경계 | 일반 GABA 연구 결론과 셀핀다 제품 표시 정보를 분리 | 연구·제품 패널 |
| 릴리스 가드 | 필수 경계 문구, 금지 표현, 제품 이미지, 기존 공식 URL, favicon을 빌드 전에 검사 | `pnpm run qa:public`, Pages workflow |
| 상호작용 QA | 320·390·1440px 발표 딥링크·발표자 진행 포인트·키보드·Escape·연구·제품·후기 패널·다음 카드 전환·영업 시작점 01/07·카드 링크 공유·제품 사실 경계 | 공개 URL 대상 `pnpm run qa:matrix` 전체 통과 |
| 기본 마감 품질 | favicon HTTP 200, 공개 페이지 HTTP 200 | 공개 URL 읽기 전용 확인 |

## 사업자 사용 순서

1. 전체 설명은 일반 URL 또는 `?mode=presenter&card=1#story`로 01번부터 시작한다. 제품 문의가 먼저 나온 경우에만 `card=7` 딥링크를 사용한다.
2. 발표 모드에서 01~05번 카드로 일상 상태·휴식·GABA 일반정보를 설명한다.
3. 06번 연구 카드의 패널에서 연구 조건과 제한적 결론을 확인한다.
4. `다음 카드로 계속 보기`로 07번 제품 패널로 이동한다.
5. 제품명·구성·식품 유형은 공개 범위로만 설명하고, 최신 표시사항이 필요한 질문은 답을 확정하지 않는다.
6. 후기 원문·외부 판매처는 고객이 원할 때만 패널의 보조 링크로 연다.

## 최종 승인 전 HOLD

| 게이트 | 필요한 증거 | 담당 |
| --- | --- | --- |
| 사업자 상담 3회 | `SALES_SESSION_VALIDATION.md` 3건 작성, P0 오류 0건 | 사업·영업 리드 |
| 제품 사실 | 최신 포장·로트 또는 제조사 자료로 제품명·30포·식품 유형 대조 | 제품 책임자 |
| 후기 사용 | 원문·이미지 사용권, 작성 맥락, 경제적 이해관계 확인 | 사업·준법 리드 |
| 전체 광고 인상 | 일상 상태·휴식·GABA·연구·제품의 암시효능 검토 | 근거·준법 리드 |
| 실기기 확인 | 실제 iOS/Android에서 스냅·패널·발표 모드 확인 | 릴리스 QA 리드 |

위 증거가 채워지기 전에는 “최종 사업·준법 승인 완료”로 표시하지 않는다.

## 재검증 명령

```bash
pnpm run qa:public
```

로컬 Vite 서버와 Chrome 원격 디버깅 포트 `9223`가 실행 중인 릴리스 QA 환경에서는 다음으로 발표·패널·딥링크 상호작용을 재검증한다.

```bash
pnpm run qa:interaction
```

공개 URL의 실제 동작 검증은 [SALES_SESSION_VALIDATION.md](SALES_SESSION_VALIDATION.md)와 [TF_REVIEW_LOG.md](TF_REVIEW_LOG.md)에 이어서 기록한다.

2026-09-21 재검증: 공개 URL을 대상으로 `pnpm run qa:public`과 `QA_URL=... pnpm run qa:matrix`를 실행했다. 번들 가드와 320·390·1440px의 발표 딥링크·패널·카드 공유·연구→제품→후기 흐름이 모두 통과했다. 이 결과는 기술 QA 증거이며, 실제 영업 세션·실기기 검증을 대체하지 않는다.

요구사항별 완료·보류 판단은 [GOAL_ACCEPTANCE_MATRIX.md](GOAL_ACCEPTANCE_MATRIX.md)를 기준으로 한다.
