# 공개용 GABA 페이지 릴리스 인수인계

## 현재 릴리스

| 항목 | 값 |
| --- | --- |
| 공개 소비자 안내 | <https://kradavid.github.io/cellpinda_gaba_sum/> |
| 발표자·TF 운영 | <https://kradavid.github.io/cellpinda_gaba_sum/?mode=presenter&card=1#story> |
| 기존 공식 배포 사이트 | <https://kradavid.github.io/cellpinda_GABA/> |
| 저장소 | <https://github.com/KRAdavid/cellpinda_gaba_sum> |
| 최신 커밋 | `main`의 최신 성공 Pages 실행 기준. 앱 변경·자동 감리 커밋을 포함한다. |
| Pages 배포 | [Deploy consumer GABA page workflow](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/workflows/deploy-pages.yml) · 성공한 실행을 기준으로 확인 |

두 사이트는 저장소·URL·배포 설정을 분리한다. 공개본에는 제품·후기·판매 정보가 들어가지 않는다.

## AI 사용자 승인 대리 상태

사용자의 2026-09-23 명시적 위임에 따라 공개본의 기술·편집 운영 유지와 자동 공개 방지 상태를 `AI-PROXY-APPROVED_WITH_HUMAN_GATES`로 대리 승인했다. 이 상태는 [`AI_PROXY_APPROVAL_2026-09-23.md`](AI_PROXY_APPROVAL_2026-09-23.md)에 판단 근거와 범위를 기록한다. 과학·의학 출처, 영상 권위·발언·권리, 준법, 실기기, 현장 세션, 실명 역할 배정, 실제 예약 실행 증거는 계속 `HOLD`이며 대리 승인 범위에 포함하지 않는다.

## 공개본 구성

1. 일상에서 생기는 변화
2. 여유가 생기는 날
3. 머리가 계속 바쁜 날
4. 뇌가 쉬는 시간
5. GABA란 무엇일까
6. GABA가 하는 일
7. 일반 GABA 연구는 어디까지 알까
8. 한 문장으로 정리하면

소비자 모드는 카드 나열 대신 좌측 장면 레일·중앙 세로 읽기·현재 장면 안내를 결합한 밝은 편집형 흐름이다. 모바일에서는 한 장면에 한 메시지를 유지하고 상단 진행선과 하단 `다음 메시지` 행동으로 릴스처럼 바로 넘길 수 있다. 연구는 인페이지 패널에서 먼저 보여주고, 08번 뒤 오늘 공유된 영상 검토 후보는 별도 섹션에서 썸네일이 포함된 현재 영상 한 편의 공식 플레이어·예비 요약·인물 소개를 제공한다. compact 인덱스와 이전·다음 이동으로 후보를 한 편씩 확인하며, 원문 링크는 상세 감리 패널 안에서만 선택한다. 사람 검토 전에는 권위 영상으로 확정하지 않는다.

YouTube Shorts 후보는 상세 감리 패널 안에서 `youtube-nocookie` 공식 플레이어로 먼저 재생할 수 있다. 임베드가 제한되는 영상은 원문 링크를 보조 선택으로 제공하며, 플레이어의 존재는 화자 권위·과학적 타당성·권리·공개 승인을 의미하지 않는다.

국내 영상이 사람 검토 후 `PUBLISH_GENERAL`로 확정되면 `검토 완료 영상` 별도 섹션에 자동 연결된다. 승인 건이 없을 때는 이 섹션을 숨겨 검토 후보와 공개 승인 영상을 혼동하지 않는다. 해외 `AUTH-*` 승인 이력은 공개 연결 대상이 아니다.

## 영상 운영 상태

- 관리 DB 14건, 제공 Shorts 8건, 국내 연구기관·의료진 후보 VID-02·VID-03·VID-04 3건
- DB 승인 이력 2건(해외 AUTH, 현재 국내 공개 섹션 미노출)
- 현재 국내 공개 승인 영상 0건
- 신규 후보는 `PENDING_REVIEW`로만 수집
- 영상 DB에는 요약·인물 소개·사업자 설명 한 문장·권위·근거·권리·사용 방식·다음 감리 행동이 기록됨
- 날짜별 일일 리포트·리뷰 세션·영상별 자막 접근 감사 파일을 함께 보관함
- 자동 공개는 0건
- 일일 모니터는 8개 등록 채널과 12개 유사 검색어(가바 정식명칭·의사·과학자·대학병원·연구기관 권위 후보 포함)를 확인하고 날짜별 리포트를 보관함
<!-- GABA_RELEASE_MONITOR_STATUS:START -->
- 최신 감리: 2026-09-23 20:01:48 KST · GitHub Actions 수동 실행 · 실행 현재 스냅샷 · 오늘 누적 신규 후보 27건 · 이번 실행 3건 · 제품·브랜드 격리 18건 · 자동 공개 0건
<!-- GABA_RELEASE_MONITOR_STATUS:END -->

## 사업자 운영

사업자는 [`GENERAL_GABA_OPERATOR_GUIDE.md`](GENERAL_GABA_OPERATOR_GUIDE.md)의 발표 링크와 8장 순서를 사용한다. 영상 요약 섹션과 영상 DB에서 후보를 찾을 때는 상태·검색·감리 필드를 먼저 확인하고, `PUBLISH_GENERAL`이 아닌 영상은 승인 영상처럼 소개하지 않는다. TF 운영 보드의 `팀 업무 배정 초안 만들기`는 주 담당·백업·첫 회의 일시를 회의용으로 복사하는 보조 도구이며, 브라우저 로컬 초안일 뿐 공식 역할 배정이나 공개 승인 기록이 아니다.

일반 연구 출처는 연구 패널 안의 `과학 출처 사람 검토 초안`에서 SCIENCE·MEDICAL 담당자가 출처별 원문 범위·한계·공개 문장 확인과 메모를 남긴다. 이 초안은 브라우저 로컬 저장 및 감리 패킷 전달용이며 `HUMAN_REVIEWED`, 등록부 상태, 공개 승인을 자동으로 만들지 않는다.

TF 회의는 [`GABA_EDUCATION_KICKOFF.md`](GABA_EDUCATION_KICKOFF.md), 반복 논의는 [`TF_DISCUSSION_BOARD.md`](TF_DISCUSSION_BOARD.md), 실제 사용성은 [`GENERAL_GABA_FIELD_SESSION.md`](GENERAL_GABA_FIELD_SESSION.md)에 기록한다.

## 릴리스 검증

```bash
pnpm run qa:public
pnpm run qa:education-tf
pnpm run qa:video-db
QA_URL=https://kradavid.github.io/cellpinda_gaba_sum/ pnpm run qa:matrix
```

최근 확인 결과: 정적 QA·빌드·문서 QA·공개 320·390·1440px 상호작용 QA 통과, 실제 Pages 390px 상호작용 QA 통과, Chrome CDP 콘솔 오류 없음.

## 남은 HOLD

- PM·SCIENCE·MEDICAL·VIDEO·RIGHTS·UX·QA 실제 담당자·백업 입력
- 과학 출처 사람 검토
- 영상 원문·자막·권리의 사람 검토
- 실제 iOS·Android 확인
- 일반 소비자·사업자 A/B/C 세션
- 2026-09-24 09:17 KST 예약 감리 실행 확인 전

위 증거가 제출되기 전에는 기술 PASS를 최종 사업·과학·의학·권리 승인으로 표시하지 않는다.
