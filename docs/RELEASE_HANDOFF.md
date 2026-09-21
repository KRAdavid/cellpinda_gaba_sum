# 공개용 GABA 페이지 릴리스 인수인계

## 릴리스 식별

| 항목 | 값 |
| --- | --- |
| 공개 소비자 안내 | <https://kradavid.github.io/cellpinda_gaba_sum/> |
| 기존 공식 배포 사이트 | <https://kradavid.github.io/cellpinda_GABA/> |
| 저장소 | <https://github.com/KRAdavid/cellpinda_gaba_sum> |
| 앱 최신 커밋 | `c4cf2b3` (`feat: stabilize presenter entry and focus flow`) |
| 최신 운영 문서 기준 | `main` 브랜치의 `docs/`와 Pages workflow 문서 게이트 (`qa:docs`) |
| 최신 Pages 배포 확인 | [run 35632091059](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35632091059) (커밋 `c4cf2b3`, 사업자 설명 시작점 01번 고정·패널 포커스 순환·외부 링크 `noopener` 포함, build·deploy 성공) |
| 릴리스 검증 기준 Pages 배포 | [run 35611131797](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35611131797) (발표 모드 제품 우선 전환·다음 설명 힌트·현재 단계 자동 정렬·인페이지 흐름 안내·고객용 링크 확인 문구·접근 가능한 carousel·TF 문서 게이트를 포함한 보완본, 정적 번들 QA 및 공개 URL 320·390·1440px 매트릭스 통과) |
| 운영 문서 동기화 확인 | `main`에 push할 때마다 Pages workflow의 `qa:docs` 단계가 영업 가이드·릴리스 인수인계를 함께 검증 |
| 최신 앱 공개 자산 직접 확인 | `index-hG9UAs0X.js` 및 `index-DNvIhvLy.css` HTTP 200, `c4cf2b3`의 사업자 설명 시작점 01번 고정·닫힌 외부 링크 포커스 제외·외부 링크 `noopener`와 기존 제품 정보 진입 명칭·제품 패널 `제품 안내를 이어서 보기: 08 · 활용 TIP`·표시사항 확인 순서·프로그램 이동 카드 확정·데스크톱 중앙 카드 판정·초기 01번 카드 유지·SALES-01 토론 게이트·기존 GABA 정의·소비자 `다음 카드` 명시·공유/발표 기능 `더 보기` 접힘·발표 모드 `제품부터 설명`·`자주 묻는 질문에 답하기`·승인 답변 `답변 복사`·모바일 발표자 컨트롤 3행 정렬·인페이지 CTA sticky 고정·외부 자료 접힘·접근성 라벨·연구 경계 문구 확인, 공개 URL 320·390·1440px 매트릭스 통과 |
| 운영 문서 동기화 | `main`에 반영된 TF 문서와 Pages workflow가 동일 저장소에서 관리되며, 문서-only push도 workflow로 검증 |

두 사이트는 저장소·URL·배포 설정을 분리한다. 이 공개본은 소비자 안내와 사업자 발표를 위한 별도 페이지이며, 기존 공식 배포 사이트를 대체하거나 수정하지 않는다.

사업자가 상담 직전에 확인할 요약 경로는 [`SALES_ONE_PAGE_GUIDE.md`](SALES_ONE_PAGE_GUIDE.md), 세션 결과 기록은 [`SALES_SESSION_VALIDATION.md`](SALES_SESSION_VALIDATION.md)를 사용한다.

## 현재 확인된 범위

| 영역 | 확인 결과 | 근거 |
| --- | --- | --- |
| 카드 흐름 | 11개 카드, 모바일 좌우 스냅, 1페이지 1메시지, 현재 단계 안내 | 공개 URL 및 Chrome CDP 확인 |
| 외부 이탈 방지 | 연구·제품·후기 버튼은 인페이지 패널을 먼저 열고 외부 링크는 접힌 보조 선택으로만 제공 | `src/App.tsx`, `PUBLISHING_TF.md` |
| 발표 모드 | 이전·다음 버튼, 키보드 이동, 다음 설명 힌트, 발표자용 진행 포인트(질문·경계 문장), 접힌 FAQ와 `답변 복사`, `?mode=presenter&card=N#story` | 공개 URL 확인 |
| 제품·연구 경계 | 일반 GABA 연구 결론과 셀핀다 제품 표시 정보를 분리 | 연구·제품 패널 |
| 릴리스 가드 | 필수 경계 문구, 금지 표현, 제품 이미지, 기존 공식 URL, favicon을 빌드 전에 검사 | `pnpm run qa:public`, Pages workflow |
| 상호작용 QA | 320·390·1440px 발표 딥링크·발표자 진행 포인트·키보드·Escape·연구·제품·후기 패널·다음 카드 전환·영업 시작점 01/07·카드 링크 공유·제품 사실 경계 | 공개 URL 대상 `pnpm run qa:matrix` 전체 통과 |
| 기본 마감 품질 | favicon HTTP 200, 공개 페이지 HTTP 200 | 공개 URL 읽기 전용 확인 |

## 사업자 사용 순서

1. 전체 설명은 일반 URL 또는 `?mode=presenter&card=1#story`로 01번부터 시작한다. 제품 문의가 먼저 나온 경우에만 `card=7` 딥링크를 사용한다.
2. 발표 모드에서 01~05번 카드로 일상 상태·휴식·GABA 일반정보를 설명한다. 고객이 제품을 먼저 묻는 경우에는 발표 모드의 `제품부터 설명` 버튼으로 07번 카드로 이동한다.
3. 06번 연구 카드의 패널에서 연구 조건과 제한적 결론을 확인한다.
4. `다음 카드로 계속 보기`로 07번 제품 카드와 제품 패널로 이동한다.
5. 제품명·구성·식품 유형은 공개 범위로만 설명하고, 최신 표시사항이 필요한 질문은 답을 확정하지 않는다.
6. 전체 설명에서는 08번 활용 TIP과 09번 생활 루틴 참고까지 이어서 보여준다. 시간 제한이 있거나 고객 질문이 없으면 핵심 경로로 진행하되, 섭취법·조합·저녁 루틴 질문이 나오면 해당 카드로 돌아간다.
7. 질문이 채팅·문자로 이어지면 FAQ의 `답변 복사`로 승인된 보류 문장만 전달하고, 10번 구매자 후기와 11번 마지막 선택지에서 고객이 원하는 다음 행동을 고르게 한다. 후기 원문·외부 판매처는 고객이 원할 때만 패널의 `외부 자료는 필요할 때만 확인`을 열어 선택하게 한다.

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

2026-09-21 재검증: 공개 URL을 대상으로 `pnpm run qa:public`과 `QA_URL=https://kradavid.github.io/cellpinda_gaba_sum/ pnpm run qa:matrix`를 실행했다. 번들 가드와 실제 Pages 자산의 320·390·1440px 발표 딥링크·제품 우선 전환·패널 sticky CTA·카드 공유·연구→제품→후기 흐름이 모두 통과했다. 이 결과는 기술 QA 증거이며, 실제 영업 세션·실기기 검증을 대체하지 않는다.

2026-09-21 외부 링크 이탈 방지 재검증: `8e6e2a8` 반영 후 공개 자산 `index-BX4owlcY.js`와 `index-DSvsQn3n.css`의 HTTP 200을 확인했다. 실제 공개 URL의 320·390·1440px 매트릭스에서 외부 자료 기본 닫힘·요청 시 링크 열기·페이지 안 다음 카드 전환·연구·제품·후기 패널·발표 모드를 모두 통과했으며, 390px 공개 캡처에서 `다음 카드` 우선 노출을 확인했다. 이 결과는 기술 QA 증거이며, 실제 영업 세션·실기기 검증을 대체하지 않는다.

2026-09-21 발표자 모바일 컨트롤 재검증: `5001ed4` 반영 후 공개 자산 `index-DpSpNWnQ.js`와 `index-BHwfNGnH.css`의 HTTP 200을 확인했다. 실제 공개 URL의 320·390·1440px 매트릭스에서 발표자 컨트롤 경계·3행 정렬·첫 카드 제목/본문 가시성·제품 우선 전환·페이지 안 연구→제품→후기 흐름을 모두 통과했고, 390px 공개 캡처에서 버튼 겹침이 없는 것을 확인했다. 이 결과는 기술 QA 증거이며, 실제 영업 세션·실기기 검증을 대체하지 않는다.

2026-09-21 소비자 다음 행동 재검증: `8c9bdf2` 반영 후 공개 자산 `index-DoaqEEu4.js`와 `index-CZCNL243.css`의 HTTP 200을 확인했다. 실제 공개 URL의 320·390·1440px 매트릭스에서 소비자 화면의 `다음 카드` 라벨·01→02 이동·모바일 스냅·외부 자료 기본 닫힘·연구·제품·후기 인페이지 흐름을 모두 통과했고, 390px 공개 캡처에서 `다음 카드`가 카드 흐름의 기본 행동으로 보이는 것을 확인했다. 이 결과는 기술 QA 증거이며, 실제 영업 세션·실기기 검증을 대체하지 않는다.

2026-09-21 소비자 도구 정리 재검증: `4bdfa6b` 반영 후 공개 자산 `index-DbLKjYyd.js`와 `index-BR4qDsaX.css`의 HTTP 200을 확인했다. 실제 공개 URL의 320·390·1440px 매트릭스에서 소비자 화면의 `다음 카드` 기본 행동·`더 보기` 기본 닫힘·요청 시 공유/발표 기능 노출·연구·제품·후기 인페이지 흐름을 모두 통과했고, 390px 공개 캡처에서 도구보다 카드 흐름이 먼저 보이는 것을 확인했다. 이 결과는 기술 QA 증거이며, 실제 영업 세션·실기기 검증을 대체하지 않는다.

2026-09-21 GABA 일반 정의 재검증: `e2f10dd` 반영 후 공개 자산 `index-COltLXbP.js`와 `index-BR4qDsaX.css`의 HTTP 200을 확인했다. 공개 번들에서 `감마아미노부티르산을 줄여 부르는 이름`을 확인했고, 공개 URL 320·390·1440px 매트릭스에서 소비자 다음 카드·더 보기·연구·제품·후기 인페이지 흐름을 모두 통과했다. 이 결과는 일반 성분명 설명과 기술 QA 증거이며, 제품 효능이나 최종 준법 승인을 의미하지 않는다.

2026-09-22 운영 문서 게이트 배포 재검증: `4178377`에 대해 수동 실행한 [Pages run 35619219760](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35619219760)이 `build success`와 `deploy success`로 종료됐다. 공개 URL은 HTTP 200으로 응답했으며, 이번 변경은 사업자 런치 가이드와 TF 문서 게이트를 강화한 문서 변경이다. 앱 기능·제품 사실·현장 사용성·실기기 검증의 상태는 기존 수용 매트릭스대로 별도 판단한다.

2026-09-22 발표자 질문 대응 배포 재검증: `4cdee2c`에 대해 [Pages run 35620765382](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35620765382)이 `build success`와 `deploy success`로 종료됐다. 공개 자산 `index-CW_4Aac-.js`·`index-zx9Rrhzz.css`가 HTTP 200으로 응답했고, 실제 공개 URL 320·390·1440px 매트릭스에서 발표자 질문 disclosure 기본 닫힘·요청 시 안전 답변·소비자 화면 비노출·카드 본문 가시성을 확인했다. 이 결과는 기술 QA 증거이며 실제 사업자 세션·실기기 검증을 대체하지 않는다.

2026-09-22 발표자 답변 전달성 배포 재검증: `9136463`에 대해 [Pages run 35624970546](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35624970546)이 `build success`와 `deploy success`로 종료됐다. 공개 자산 `index-CAyqHzeZ.js`·`index-DNvIhvLy.css`가 HTTP 200으로 응답했고, 번들에서 `답변 복사`와 병용 관련 보류 문장을 확인했다. 공개 URL 320·390·1440px 매트릭스에서 FAQ 기본 닫힘·4개 답변 복사·발표 모드 유지·소비자 비노출·첫 카드 본문 가시성을 통과했다. 이 결과는 기술 QA 증거이며 실제 사업자 세션·실기기 검증을 대체하지 않는다.

2026-09-22 TF 실제 배정 게이트 배포 재검증: `886e90a`에 대해 [Pages run 35626689111](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35626689111)이 `build success`와 `deploy success`로 종료됐다. `TF_ROSTER.md`의 11개 역할 배정 슬롯, 핵심 참석자, 실명 입력 전 `HOLD` 규칙이 문서 QA에 포함됐고, 공개 URL은 HTTP 200으로 응답했다. 앱 코드는 변경하지 않았으며, 공개 흐름·발표·인페이지 패널은 기존 공개 매트릭스 증거를 유지한다. 실제 담당자 배정·사업자 세션·제품·후기·실기기 게이트는 여전히 HOLD다.

2026-09-22 카드 딥링크·제품 문의 논점 배포 재검증: `d225157`에 대해 [Pages run 35628559496](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35628559496)이 `build success`와 `deploy success`로 종료됐다. 프로그램 이동 중 요청 카드를 우선 확정하고, 일반 스크롤에서는 레일 중앙 카드를 활성 상태로 판단하도록 보강했다. 공개 URL은 HTTP 200, `index-BYoC8dEl.js`·`index-DNvIhvLy.css`는 공개 자산으로 제공되며, 실제 320·390·1440px 매트릭스와 1440px interaction QA를 통과했다. `SALES-01` 제품 문의 후 행동 논점은 B 시나리오 현장 검증 대기로 남겼고, 실제 담당자 배정·사업자 세션·제품·후기·실기기 게이트는 여전히 HOLD다.

2026-09-22 제품 정보 진입·다음 행동 배포 재검증: `03fc16f`에 대해 [Pages run 35629859977](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35629859977)이 `build success`와 `deploy success`로 종료됐다. 첫 화면의 실제 동작과 일치하도록 `제품 정보가 먼저라면`으로 라벨을 정정했고, 제품 패널의 주 CTA를 `제품 안내를 이어서 보기: 08 · 활용 TIP`으로 구체화했다. 공개 URL은 HTTP 200, `index-C65rRWBJ.js`·`index-DNvIhvLy.css`는 공개 자산으로 제공되며, 공개 320·390·1440px 매트릭스에서 제품 패널 다음 행동·외부 자료 보조 순서·연구·제품·후기 인페이지 흐름을 통과했다. 구매·상담·효능 CTA와 최신 제품 사실 확장은 추가하지 않았고, 실제 B 시나리오 영업 적합성·제품·후기·실기기 게이트는 여전히 HOLD다.

2026-09-22 사업자 설명 시작점·패널 포커스 배포 재검증: `c4cf2b3`에 대해 [Pages run 35632091059](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/runs/35632091059)이 `build success`와 `deploy success`로 종료됐다. `?card=7#story` 상태에서 첫 화면의 `사업자용 설명 시작`을 눌러도 01번 발표 모드로 시작하도록 고정했고, 제품 우선 경로는 기존 `제품부터 설명`으로 분리했다. 닫힌 외부 자료 링크는 패널 키보드 포커스 순환에서 제외하고 새 탭 외부 링크에는 `noopener`를 명시했다. 공개 자산 `index-hG9UAs0X.js`·`index-DNvIhvLy.css`는 HTTP 200이며, 공개 URL 320·390·1440px 매트릭스에서 발표 시작점·포커스·연구·제품·후기 인페이지 흐름과 외부 자료 보조 순서를 모두 통과했다. 이 결과는 기술·배포 PASS이며, 실제 TF 참석자·A/B/C 사업자 세션·제품 사실·후기 권리·iOS/Android 실기기·전체 광고 인상 승인은 계속 HOLD다.

요구사항별 완료·보류 판단은 [GOAL_ACCEPTANCE_MATRIX.md](GOAL_ACCEPTANCE_MATRIX.md)를 기준으로 한다.
