# Cellpinda GABA Sum

소비자가 모바일에서 세로로 읽고 원하는 장면으로 바로 이동하는 일반 GABA 소개 페이지입니다.

권위 영상 후보는 [GABA_VIDEO_DB.md](docs/GABA_VIDEO_DB.md)에 영상별 요약과 인물 소개를 기록하고, [GABA_VIDEO_REVIEW_RULES.md](docs/GABA_VIDEO_REVIEW_RULES.md)의 권위·근거·상업성·권리 감리를 거칩니다. 새 가바·GABA 숏츠는 [GABA_VIDEO_INBOX.md](docs/GABA_VIDEO_INBOX.md)에 PENDING_REVIEW로 수집되며, 사업자는 [GABA_VIDEO_TRIAGE.md](docs/GABA_VIDEO_TRIAGE.md)에서 제목 기반 주의 신호가 있는 후보부터 확인할 수 있습니다. 일일 운영은 [GABA_VIDEO_DAILY_MONITOR.md](docs/GABA_VIDEO_DAILY_MONITOR.md)에 정리했습니다. 자동 수집 후보는 검토 전 공개 페이지에 반영하지 않습니다.

매일 실행 요약과 채널 경고·신규 후보·다음 감리 순서는 [`docs/GABA_VIDEO_DAILY_REPORT.md`](docs/GABA_VIDEO_DAILY_REPORT.md)에 자동 기록됩니다.
일자별 리포트 원본은 [`docs/gaba-video-daily/`](docs/gaba-video-daily/)에 누적해 회의 전후의 변화와 반복 경고를 비교할 수 있습니다.

팀의 매일 검토 순서와 사업자 설명용 판정 문장은 [GABA_VIDEO_REVIEW_LOG.md](docs/GABA_VIDEO_REVIEW_LOG.md)에 기록합니다.

> 현재 공개본은 **제품과 완전히 분리된 일반 GABA 교육 자료**입니다. 제품·후기·판매 정보는 공개 읽기 흐름과 패널에서 다루지 않습니다. 현재 범위와 TF 운영 기준은 [`docs/GABA_EDUCATION_SCOPE.md`](docs/GABA_EDUCATION_SCOPE.md), [`docs/GABA_EDUCATION_TF.md`](docs/GABA_EDUCATION_TF.md), [`docs/GABA_EDUCATION_KICKOFF.md`](docs/GABA_EDUCATION_KICKOFF.md)에서 확인합니다.

기존 판매·영업용 TF 문서는 과거 구현의 기록으로 보관하며, 새 공개본의 범위·문안·승인 기준은 위 일반 GABA 교육 문서와 영상 감리 문서만 기준으로 삼습니다.

일반 GABA 교육 TF의 현재 준비 상태는 `pnpm run qa:education-tf`로 확인합니다. 이 명령은 AI-OPS 실행 상태와 인간 핵심 역할·과학 출처·권위 영상·제품 제외 범위를 별도로 점검합니다.

영상 DB 필드·제공 Shorts 등록·공개 승인 게이트는 `pnpm run qa:video-db`로 별도 점검합니다.
발표자용 영상 상세에는 영상별로 `무엇을 어떻게 소개했나`, 인물 소개, 사업자 설명 한 문장, 확인 기반, 권위·근거 등급, 주장 범위, 권리 상태, 사용 방식, 다음 감리 행동을 함께 표시하며 사업자 설명 한 문장 또는 고객 설명 3문장을 복사할 수 있습니다.

일반 교육 TF의 논점·결정·보류 사유는 [`docs/GABA_EDUCATION_DECISION_REGISTER.md`](docs/GABA_EDUCATION_DECISION_REGISTER.md)에 기록합니다.

이 저장소는 기존 [cellpinda_GABA](https://github.com/KRAdavid/cellpinda_GABA) 공식 배포 사이트와 구분되는 별도 일반 GABA 교육 페이지입니다. 공개 화면에는 일반 생리·일반 인체 연구·영상 검토 후보가 포함되며, 사람 검토를 마친 권위 영상만 승인 영상으로 별도 판정합니다.

소비자 화면의 핵심 흐름은 접속 즉시 첫 메시지가 보이고, 모바일에서는 상단 8개 장면 진행선과 자연스러운 세로 읽기로 이어집니다. 데스크톱에서는 왼쪽 전체 장면 목차·중앙 읽기 흐름·오른쪽 현재 장면과 일반 GABA 연구 경계를 함께 보여 원하는 장면을 바로 찾을 수 있습니다. 각 장면은 한 메시지로 유지하며 연구 링크는 먼저 페이지 안의 정보 패널로 열고, `다음 장면`으로 읽기 흐름을 이어갑니다. 원문 링크는 패널을 읽은 뒤 선택하는 보조 경로입니다. 8개 장면 뒤에는 오늘 공유된 영상 검토 후보를 별도 섹션으로 분리해 현재 영상 한 편의 히어로 샷·예비 요약·인물 소개와 compact한 영상 순서 인덱스를 제공합니다. `이전 영상`·`다음 영상` 또는 인덱스로 한 편씩 이동하고, `상세 감리 먼저 보기`를 거친 뒤 패널 안에서 원문 링크를 선택하게 합니다. `PUBLISH_GENERAL` 승인 영상으로 확정되기 전에는 권위·효능 근거처럼 소개하지 않습니다. 소비자 화면의 공유·발표 도구는 상단 보조 행동으로 제한하고, 사업자 발표 모드에서는 소개 화면·카드형 발표 화면·영상 DB·운영 보드를 별도로 확인할 수 있습니다. 퍼블리싱 TF의 역할, 검토 기준, 공개 전 수용 기준은 [`docs/PUBLISHING_TF.md`](docs/PUBLISHING_TF.md)에 기록합니다.

사업자 설명 상황에서는 카드 컨트롤의 `발표 모드`를 사용해 한 장씩 보여줄 수 있습니다. 첫 화면의 `발표자용 설명 시작`은 01번부터 일반 교육 흐름을 시작하고, 발표 중 `영상 DB`에서 승인·보류·제외 후보와 영상별 요약·인물 소개·감리 사유를 확인할 수 있습니다. 영상 DB 패널에는 자동 모니터의 마지막 확인일·검토 대기 수·우선 감리 수·신규 후보 수가 함께 표시되며, 상세 후보 원문은 감리 보드 링크에서 확인합니다. `운영 보드`에서는 사람 역할 배정·과학 출처 검토·영상 공개 판정·A/B/C 사용성 검증의 담당·다음 행동·종료 조건을 확인할 수 있고, `팀 업무 배정 초안 만들기`에서 주 담당·백업·첫 회의 일시를 입력해 회의용 초안을 복사할 수 있습니다. 이 초안은 현재 브라우저에만 저장되며 공식 `0/7` 역할 지표나 공개 승인 상태를 바꾸지 않습니다. 영상 후보가 많을 때는 `검토 필요` 상태 필터나 제목·채널·화자 검색을 사용합니다. 05번 카드에서는 GABA가 감마아미노부티르산을 줄여 부르는 성분 이름이라는 점을 먼저 설명합니다. `Escape`로 발표 모드를 종료하고, 연구·영상 상세는 현재 화면의 패널에서 먼저 설명합니다. `현재 카드 링크 공유`는 모바일 기본 공유 메뉴를 우선 사용하고, 지원하지 않는 환경에서는 링크를 복사합니다.

발표 중 질문이 나오면 `자주 묻는 질문에 답하기`를 열어 GABA 기능·수면·일반 연구·영상 사용에 대한 승인 문장을 확인합니다. 필요하면 각 답변의 `답변 복사`로 전달할 수 있으며, 정보 패널에서는 `이 카드 고객용 링크 복사`로 발표자 모드가 없는 이어보기 링크를 보낼 수 있습니다. 두 기능 모두 현재 카드 흐름을 벗어나지 않으며 소비자 화면에는 표시하지 않습니다.

TF 회의를 같은 순서로 진행하려면 [`docs/TF_MEETING_PACK.md`](docs/TF_MEETING_PACK.md)를 사용합니다. 제품 판매가 아닌 일반 GABA 교육 기준으로 역할별 질문, 영상 감리, 일일 모니터, 현장 검증을 모았습니다.

회의에서 다룰 논점과 필요한 증거는 [`docs/TF_DISCUSSION_BOARD.md`](docs/TF_DISCUSSION_BOARD.md)에서 관리합니다. 기술 QA와 실제 사업자 평가를 분리하고, 이견·결정·다음 검증을 계속 누적합니다.

회의 후 결정·담당·제출 기한은 [`docs/TF_DECISION_REGISTER.md`](docs/TF_DECISION_REGISTER.md)에서 한 줄 단위로 추적하고, A/B/C 현장 세션은 [`docs/GENERAL_GABA_FIELD_SESSION.md`](docs/GENERAL_GABA_FIELD_SESSION.md)의 고정 진행·관찰 기준을 사용합니다.

실제 주 담당자·백업·결정권 배정은 [`docs/TF_ROSTER.md`](docs/TF_ROSTER.md)에서 확인하고 입력합니다. 역할 정의만으로 실제 TF 구성 완료를 선언하지 않습니다.

담당자·첫 회의·A/B/C 세션 진행자를 한 번에 입력하려면 [`docs/TF_KICKOFF_INPUT.md`](docs/TF_KICKOFF_INPUT.md)를 사용합니다.

실제 TF 참가자를 모집하고 첫 회의에 초대할 때는 [`docs/TF_TEAM_INVITE.md`](docs/TF_TEAM_INVITE.md)의 전달문과 회신 양식을 사용합니다.

TF 배정·현장 세션·영상·실기기 게이트의 현재 상태는 다음 명령으로 확인합니다. 기본 점검은 HOLD 상태를 설명하고 종료되며, 엄격 모드는 최종 승인 조건이 채워지지 않으면 실패합니다.

```bash
pnpm run qa:tf
pnpm run qa:tf:strict
```

전체 설명용 발표 북마크는 `https://kradavid.github.io/cellpinda_gaba_sum/?mode=presenter&card=1#story`로 01번부터 시작합니다. 영상 DB는 발표 모드의 `영상 DB` 버튼에서 확인합니다.

실제 일반 GABA 교육 설명 순서와 권장·보류 표현은 [`docs/GENERAL_GABA_OPERATOR_GUIDE.md`](docs/GENERAL_GABA_OPERATOR_GUIDE.md)를 따릅니다.

제품·후기·판매 흐름이 포함된 `SALES_*`, `PRODUCT_EVIDENCE_INTAKE.md`, `REVIEW_RIGHTS_REGISTER.md`는 레거시 보관 문서이며 현재 공개본의 운영 기준이 아닙니다.

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

숏츠 후보를 로컬에서 확인하려면 다음 명령을 사용합니다. 기본 실행은 파일을 바꾸지 않으며, 검토 대기함에 기록할 때만 write 명령을 사용합니다.

~~~bash
pnpm run monitor:gaba-shorts
pnpm run monitor:gaba-shorts:write
~~~

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
