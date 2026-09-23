# 일반 GABA 교육 TF 결정·액션 대장

일반 GABA 교육 페이지의 범위·근거·영상·UX 결정을 한 곳에서 추적한다. 제품 판매·후기·제품 효능 관련 결정은 이 대장에 포함하지 않는다.

| ID | 결정 질문 | 결정권자 | 실행 담당·백업 | 증거·산출물 | 상태 | 다음 검토 |
| --- | --- | --- | --- | --- | --- | --- |
| SCOPE-01 | 제품·후기·판매 정보를 제외한 일반 GABA 교육 자료로 범위를 확정할 것인가? | PM + SCIENCE | AI-OPS / PM 미배정 | `GABA_EDUCATION_SCOPE.md` | DECIDED | 킥오프 |
| CLAIM-01 | GABA의 일반 정의와 신경 신호 조절을 어떤 용어로 설명할 것인가? | SCIENCE + MEDICAL | AI-OPS / UX 미배정 | `GABA_SOURCE_REGISTER.md` SRC-01~02 | OPEN | 첫 회의 |
| CLAIM-02 | 수면·스트레스 연구의 결과와 한계를 어떤 문장으로 보여줄 것인가? | SCIENCE + MEDICAL | AI-OPS / UX 미배정 | `GABA_SOURCE_REGISTER.md` SRC-03~05 | OPEN | 첫 회의 |
| VIDEO-01 | 제공된 Shorts 8건을 어떤 절차로 영상 DB와 소비자 검토 섹션에 연결할 것인가? | PM + VIDEO + SCIENCE + MEDICAL + RIGHTS | AI-OPS / 역할별 미배정 | `GABA_VIDEO_DB.md`, `GABA_VIDEO_REVIEW_RULES.md`, `GABA_VIDEO_REVIEW_LOG.md` | READY FOR FIELD | 영상별 원문·자막·화자·권리 감리 |
| OPS-01 | 매일 유사 숏츠를 찾아 다음 감리와 회의로 연결할 수 있는가? | PM + VIDEO + AI-OPS | AI-OPS / PM 미배정 | GitHub Actions·일일 리포트·발표자 스냅샷·감리 큐 CSV | READY FOR FIELD | 3일 연속 담당·판정 기록 |
| UX-01 | GABA를 모르는 사람이 8장 안에 기본 개념을 이해하는가? | UX + SCIENCE | AI-OPS / UX 미배정 | `docs/CONSUMER_REEL_REDESIGN.md`·한 화면 한 메시지·일반 GABA 연구 패널·320/390/1440px QA | READY FOR FIELD | 실제 iOS·Android·A 세션 |
| UX-02 | 모바일에서 다음 메시지로 바로 넘어가면서도 본문을 가리지 않는가? | UX + QA | AI-OPS / UX 미배정 | 세로 진행 레일·다음 장면·휠/키보드/스와이프 입력·390px 캡처·상호작용 QA | READY FOR FIELD | A 세션에서 행동 명확도·겹침 확인 |
| REMOVE-01 | 현재 공개 코드에서 제품·후기·판매 흐름을 제거할 것인가? | PM + QA | AI-OPS / QA 미배정 | 변경 diff·공개 URL QA·공개 번들 검사 | DECIDED | 사람 역할·현장 검증은 별도 HOLD |

## 기록 형식

`문제 → 결정 또는 HOLD → 변경 파일 → 검증 결과 → 담당자·기한 → 종료 조건`
