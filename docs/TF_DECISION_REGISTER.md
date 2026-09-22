# 일반 GABA 교육 TF 결정 대장

공개 교육본의 결정·담당·증거·종료 조건을 한 줄 단위로 추적한다. 사람 입력 전에는 `미배정`·`HOLD`를 유지한다.

| ID | 논점 | 현재 결정 | 증거 | 담당 | 종료 조건 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| CONTENT-01 | 일상 도입 오해 방지 | 기술 문장 유지, 현장 관찰 | `src/App.tsx`, A 세션 패킷 | UX + MEDICAL | A/B/C 각 이해도 4점 이상 | READY FOR FIELD |
| CONTENT-02 | GABA 일반 기능·연구 경계 | 일반 GABA 연구 표기 유지 | `GABA_SOURCE_REGISTER.md`, 연구 패널 | SCIENCE + MEDICAL | 출처 사람 검토 | HOLD |
| VIDEO-01 | 영상별 감리 구조 | 요약·인물·권위·근거·권리 필드 적용 | `src/gabaVideos.ts`, `GABA_VIDEO_DB.md` | VIDEO + RIGHTS | 14건 원문·권리 기록 | HOLD |
| VIDEO-02 | 제공 Shorts 8건 | 공개 승인 전 검토 상태 유지 | `GABA_VIDEO_REVIEW_LOG.md` | VIDEO | 타임코드·자막·주장 판정 | HOLD |
| OPS-01 | 매일 유사 후보 운영 | 09:00 KST 자동 수집·PENDING_REVIEW | GitHub Actions·일일 리포트 | AI-OPS + VIDEO | 사람 감리 3일 연속 기록 | READY FOR FIELD |
| OPS-02 | 사업자 영상 탐색 | 필터·검색·설명 문장 복사 제공 | 발표 모드 QA | UX + QA | 실제 세션 오선택 0건 | READY FOR FIELD |
| RIGHTS-01 | 영상 사용 방식 | 원문 링크 우선, 권리 확인 전 임베드 금지 | 영상별 `rightsStatus` | RIGHTS | 각 영상 사용 조건 확인 | HOLD |
| TF-01 | 핵심 역할 배정 | AI-OPS 실행, 인간 역할 미배정 | `GABA_EDUCATION_TF.md` | PM | PM/SCIENCE/MEDICAL/VIDEO/RIGHTS/UX/QA 입력 | HOLD |
| UX-01 | 실기기·현장 흐름 | Chrome 기술 QA 통과 | 공개 320/390/1440px 매트릭스 | QA | iOS/Android·A/B/C 검증 | HOLD |

## 결정 규칙

1. 일반 GABA 연구를 특정 제품 효능으로 확장하지 않는다.
2. 영상의 권위와 영상 주장 근거를 같은 것으로 취급하지 않는다.
3. 자동 수집 후보를 사람 검토 전 공개하지 않는다.
4. 기술 QA 통과만으로 사람·현장·권리 승인으로 바꾸지 않는다.
5. 변경 후 `TF_REVIEW_LOG.md`에 문제·결정·변경 파일·검증 결과·다음 액션을 남긴다.
