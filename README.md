# Cellpinda GABA Sum

소비자가 모바일에서 한 장씩 넘겨 보는 GABA 소개 페이지입니다.

이 저장소는 기존 [cellpinda_GABA](https://github.com/KRAdavid/cellpinda_GABA) 공식 배포 사이트와 구분되는 별도 소비자용 소개 페이지입니다. 일반 GABA 연구, 셀핀다 제품 정보, 구매자 후기를 같은 근거처럼 섞지 않도록 화면에서 분리했습니다.

카드의 연구·제품·후기 버튼은 먼저 페이지 안의 정보 패널을 열어 설명 흐름을 유지합니다. 원문과 스마트스토어 링크는 패널을 읽은 뒤 선택하는 보조 경로입니다. 퍼블리싱 TF의 역할, 검토 기준, 공개 전 수용 기준은 [`docs/PUBLISHING_TF.md`](docs/PUBLISHING_TF.md)에 기록합니다.

사업자 설명 상황에서는 카드 컨트롤의 `발표 모드`를 사용해 한 장씩 보여줄 수 있습니다. `Escape`로 발표 모드를 종료하고, 연구·제품·후기 상세는 현재 화면의 패널에서 먼저 설명합니다. `현재 카드 링크 공유`는 모바일 기본 공유 메뉴를 우선 사용하고, 지원하지 않는 환경에서는 링크를 복사합니다.

전체 설명용 발표 북마크는 `https://kradavid.github.io/cellpinda_gaba_sum/?mode=presenter&card=1#story`로 01번부터 시작합니다. 제품 문의가 먼저 나온 경우에는 `card=7`을 지정해 제품 카드부터 열 수 있습니다.

실제 상담 순서와 권장·보류 표현은 [`docs/SALES_WALKTHROUGH.md`](docs/SALES_WALKTHROUGH.md)를 따릅니다.

UX·영업·근거/준법·접근성·QA의 반복 검토 결과는 [`docs/TF_REVIEW_LOG.md`](docs/TF_REVIEW_LOG.md)에 기록합니다.

실제 사업자 상담 3회 검증은 [`docs/SALES_SESSION_VALIDATION.md`](docs/SALES_SESSION_VALIDATION.md) 양식으로 기록합니다.

공개본의 배포·검증·승인 게이트 인수인계는 [`docs/RELEASE_HANDOFF.md`](docs/RELEASE_HANDOFF.md)에 정리합니다.

목표별 PASS·HOLD 기준과 종료 조건은 [`docs/GOAL_ACCEPTANCE_MATRIX.md`](docs/GOAL_ACCEPTANCE_MATRIX.md)에서 확인합니다.

## Local preview

```bash
npm install
npm run dev
```

## Deployment

`main`에 push하면 GitHub Pages workflow가 `https://kradavid.github.io/cellpinda_gaba_sum/` 경로를 기준으로 정적 페이지를 빌드합니다. GitHub 저장소 설정에서 Pages의 Source가 `GitHub Actions`인지 확인해야 합니다.

배포 전 공개 번들 문구와 금지 표현은 다음 명령으로 검사합니다.

```bash
pnpm run qa:public
```

로컬 Vite 서버와 Chrome 원격 디버깅 포트(9223)가 실행 중이면 발표·패널·딥링크 상호작용도 검사할 수 있습니다.

```bash
pnpm run qa:interaction
```

320px·390px·1440px 화면에서 같은 흐름을 반복하는 릴리스 매트릭스는 다음 명령으로 실행합니다.

```bash
pnpm run qa:matrix
```
