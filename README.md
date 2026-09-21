# Cellpinda GABA Sum

소비자가 모바일에서 한 장씩 넘겨 보는 GABA 소개 페이지입니다.

이 저장소는 기존 [cellpinda_GABA](https://github.com/KRAdavid/cellpinda_GABA) 공식 배포 사이트와 구분되는 별도 소비자용 소개 페이지입니다. 일반 GABA 연구, 셀핀다 제품 정보, 구매자 후기를 같은 근거처럼 섞지 않도록 화면에서 분리했습니다.

카드의 연구·제품·후기 버튼은 먼저 페이지 안의 정보 패널을 열어 설명 흐름을 유지합니다. `다음 카드`가 기본 행동이며, 원문과 스마트스토어 링크는 패널을 읽은 뒤 `외부 자료는 필요할 때만 확인`을 열어 선택하는 보조 경로입니다. 소비자 화면의 공유·발표 도구는 `더 보기` 안에 접혀 있어 카드 흐름을 우선하고, 사업자 발표 모드에서는 필요한 조작부를 바로 사용할 수 있습니다. 퍼블리싱 TF의 역할, 검토 기준, 공개 전 수용 기준은 [`docs/PUBLISHING_TF.md`](docs/PUBLISHING_TF.md)에 기록합니다.

사업자 설명 상황에서는 카드 컨트롤의 `발표 모드`를 사용해 한 장씩 보여줄 수 있습니다. 고객이 제품을 먼저 물으면 발표 모드의 `제품부터 설명`으로 현재 화면 안에서 07번 제품 카드로 이동할 수 있습니다. 05번 카드에서는 GABA가 감마아미노부티르산을 줄여 부르는 성분 이름이라는 점을 먼저 설명합니다. `Escape`로 발표 모드를 종료하고, 연구·제품·후기 상세는 현재 화면의 패널에서 먼저 설명합니다. `현재 카드 링크 공유`는 모바일 기본 공유 메뉴를 우선 사용하고, 지원하지 않는 환경에서는 링크를 복사합니다.

발표 중 질문이 나오면 `자주 묻는 질문에 답하기`를 열어 수면·섭취량·병용·후기에 대한 보류 문장을 확인합니다. 필요하면 각 답변의 `답변 복사`로 승인된 문장을 전달할 수 있으며, 현재 카드 흐름을 벗어나지 않습니다. 이 보조 정보는 소비자 화면에는 표시하지 않습니다.

TF 회의를 같은 순서로 진행하려면 [`docs/TF_MEETING_PACK.md`](docs/TF_MEETING_PACK.md)를 사용합니다. 역할별 질문, A/B/C 영업 시나리오, 근거 게이트, 결정 기록 형식을 한 문서에 모았습니다.

회의에서 다룰 논점과 필요한 증거는 [`docs/TF_DISCUSSION_BOARD.md`](docs/TF_DISCUSSION_BOARD.md)에서 관리합니다. 기술 QA와 실제 사업자 평가를 분리하고, 이견·결정·다음 검증을 계속 누적합니다.

실제 주 담당자·백업·결정권 배정은 [`docs/TF_ROSTER.md`](docs/TF_ROSTER.md)에서 확인하고 입력합니다. 역할 정의만으로 실제 TF 구성 완료를 선언하지 않습니다.

담당자·첫 회의·A/B/C 세션 진행자를 한 번에 입력하려면 [`docs/TF_KICKOFF_INPUT.md`](docs/TF_KICKOFF_INPUT.md)를 사용합니다.

전체 설명용 발표 북마크는 `https://kradavid.github.io/cellpinda_gaba_sum/?mode=presenter&card=1#story`로 01번부터 시작합니다. 제품 문의가 먼저 나온 경우에는 `card=7`을 지정해 제품 카드부터 열 수 있습니다.

실제 상담 순서와 권장·보류 표현은 [`docs/SALES_WALKTHROUGH.md`](docs/SALES_WALKTHROUGH.md)를 따릅니다.

상담 직전에 볼 요약본은 [`docs/SALES_ONE_PAGE_GUIDE.md`](docs/SALES_ONE_PAGE_GUIDE.md)에서 확인합니다.

UX·영업·근거/준법·접근성·QA의 반복 검토 결과는 [`docs/TF_REVIEW_LOG.md`](docs/TF_REVIEW_LOG.md)에 기록합니다.

실제 사업자 상담 3회 검증은 [`docs/SALES_SESSION_VALIDATION.md`](docs/SALES_SESSION_VALIDATION.md) 양식으로 기록합니다.

세션 진행자·관찰자·준법 검토자가 같은 순서로 진행할 때는 [`docs/SALES_SESSION_QUICKSTART.md`](docs/SALES_SESSION_QUICKSTART.md)를 사용합니다.

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
pnpm run qa:docs
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
