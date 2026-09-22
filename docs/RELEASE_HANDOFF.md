# 공개용 GABA 페이지 릴리스 인수인계

## 현재 릴리스

| 항목 | 값 |
| --- | --- |
| 공개 소비자 안내 | <https://kradavid.github.io/cellpinda_gaba_sum/> |
| 발표자·TF 운영 | <https://kradavid.github.io/cellpinda_gaba_sum/?mode=presenter&card=1#story> |
| 기존 공식 배포 사이트 | <https://kradavid.github.io/cellpinda_GABA/> |
| 저장소 | <https://github.com/KRAdavid/cellpinda_gaba_sum> |
| 최신 커밋 | `main`의 최신 성공 Pages workflow가 가리키는 커밋 |
| Pages 배포 | [Deploy consumer GABA page workflow](https://github.com/KRAdavid/cellpinda_gaba_sum/actions/workflows/deploy-pages.yml) · 성공한 실행을 기준으로 확인 |

두 사이트는 저장소·URL·배포 설정을 분리한다. 공개본에는 제품·후기·판매 정보가 들어가지 않는다.

## 공개본 구성

1. 일상 속 쉽게 흥분한 날
2. 충분히 쉰 날
3. 뇌 과부하 상태
4. 회복의 시간
5. GABA 이름
6. 뇌의 신호 조절
7. 일반 GABA 연구
8. 한 문장 정리

소비자 모드는 한 화면에 한 메시지를 보여주는 풀스크린 세로 릴스 피드다. 연구는 인페이지 패널에서 먼저 보여주고, 08번 뒤 오늘 공유된 영상 검토 후보는 별도 섹션에서 히어로 샷·예비 요약·인물 소개·공식 원문 링크로 제공한다. 사람 검토 전에는 권위 영상으로 확정하지 않는다.

## 영상 운영 상태

- 관리 DB 11건, 제공 Shorts 8건
- DB 승인 이력 2건(해외 AUTH, 현재 국내 공개 섹션 미노출)
- 현재 국내 공개 승인 영상 0건
- 신규 후보는 `PENDING_REVIEW`로만 수집
- 영상 DB에는 요약·인물 소개·사업자 설명 한 문장·권위·근거·권리·사용 방식·다음 감리 행동이 기록됨
- 자동 공개는 0건
- 일일 모니터는 8개 등록 채널과 4개 유사 검색어를 확인하고 날짜별 리포트를 보관함

## 사업자 운영

사업자는 [`GENERAL_GABA_OPERATOR_GUIDE.md`](GENERAL_GABA_OPERATOR_GUIDE.md)의 발표 링크와 8장 순서를 사용한다. 영상 요약 섹션과 영상 DB에서 후보를 찾을 때는 상태·검색·감리 필드를 먼저 확인하고, `PUBLISH_GENERAL`이 아닌 영상은 승인 영상처럼 소개하지 않는다.

TF 회의는 [`GABA_EDUCATION_KICKOFF.md`](GABA_EDUCATION_KICKOFF.md), 반복 논의는 [`TF_DISCUSSION_BOARD.md`](TF_DISCUSSION_BOARD.md), 실제 사용성은 [`GENERAL_GABA_FIELD_SESSION.md`](GENERAL_GABA_FIELD_SESSION.md)에 기록한다.

## 릴리스 검증

```bash
pnpm run qa:public
pnpm run qa:education-tf
pnpm run qa:video-db
QA_URL=https://kradavid.github.io/cellpinda_gaba_sum/ pnpm run qa:matrix
```

최근 확인 결과: 정적 QA·빌드·문서 QA·공개 320·390·1440px 상호작용 QA 통과, Chrome CDP 콘솔 오류 없음.

## 남은 HOLD

- PM·SCIENCE·MEDICAL·VIDEO·RIGHTS·UX·QA 실제 담당자·백업 입력
- 과학 출처 사람 검토
- 영상 원문·자막·권리의 사람 검토
- 실제 iOS·Android 확인
- 일반 소비자·사업자 A/B/C 세션

위 증거가 제출되기 전에는 기술 PASS를 최종 사업·과학·의학·권리 승인으로 표시하지 않는다.
