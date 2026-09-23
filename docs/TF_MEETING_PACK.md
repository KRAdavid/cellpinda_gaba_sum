# 일반 GABA 교육 TF 회의 패킷

제품 판매 회의가 아니라 일반 GABA 교육 공개본의 이해도·근거·영상 감리·운영을 결정하는 30분 패킷이다.

## 회의 전 확인

- 공개 URL: `https://kradavid.github.io/cellpinda_gaba_sum/`
- 발표 URL: `?mode=presenter&card=1#story`
- 최신 배포: [`RELEASE_HANDOFF.md`](RELEASE_HANDOFF.md)
- 운영 가이드: [`GENERAL_GABA_OPERATOR_GUIDE.md`](GENERAL_GABA_OPERATOR_GUIDE.md)
- 논점: [`TF_DISCUSSION_BOARD.md`](TF_DISCUSSION_BOARD.md)
- 결정: [`TF_DECISION_REGISTER.md`](TF_DECISION_REGISTER.md)
- 역할 입력: [`GABA_EDUCATION_KICKOFF.md`](GABA_EDUCATION_KICKOFF.md)

회의 전 `pnpm run qa:public`과 `pnpm run qa:education-tf`를 실행한다. 사람 담당자·현장 증거가 없으면 기술 PASS와 최종 승인을 구분한다.

## 역할별 질문

| 순서 | 역할 | 질문 |
| --- | --- | --- |
| 1 | PM | 이번 회의의 결정 논점과 보류 논점이 분리됐는가? |
| 2 | SCIENCE | GABA 일반 생리와 경구 GABA 연구가 분리됐는가? |
| 3 | MEDICAL | 진단·치료·결핍·안전성 오해가 남아 있는가? |
| 4 | VIDEO | 영상의 실제 발언·화자·발언 구간이 확인됐는가? |
| 5 | RIGHTS | 원문 링크·임베드·인용의 사용 방식이 확인됐는가? |
| 6 | UX | 한 화면 한 메시지와 다음 장면이 명확한가? |
| 7 | QA | 소비자·발표자·일일 모니터 상태가 같은 버전인가? |

## 30분 진행

| 시간 | 진행 | 산출물 |
| --- | --- | --- |
| 0~3분 | 커밋·Pages·현재 HOLD 확인 | 오늘 닫을 논점 1~2개 |
| 3~10분 | 소비자 8장 피드와 별도 영상 섹션 직접 확인 | 첫 혼선 1개 |
| 10~17분 | 출처·연구·영상 근거 확인 | 적용/관찰/HOLD |
| 17~23분 | 사업자 발표·영상 DB·일일 큐 확인 | 다음 담당·기한 |
| 23~27분 | 반대 관점·권리·접근성 확인 | 남은 리스크 |
| 27~30분 | 결정 대장·리뷰 로그 갱신 | 종료 조건·다음 검토일 |

## 고정 현장 시나리오

| 시나리오 | 시작점 | 확인할 것 |
| --- | --- | --- |
| A. 처음 보는 사람 | `card=1` | 01→08에서 GABA의 이름·기능·연구 읽는 기준을 이해하는가 |
| B. 권위 영상 질문 | `#video-showcase` 또는 영상 DB | 승인 영상과 검토 후보를 구분하는가 |
| C. 연구 질문 | `card=7` | 일반 GABA 연구와 개인·제품 효능을 구분하는가 |

## 회의 기록 형식

`문제 → 결정 → 변경 파일 → 검증 결과 → 다음 담당자·종료 조건`

결정은 `적용`, `관찰`, `HOLD` 중 하나만 사용한다. 실제 세션·실기기·사람 검토 없이 `최종 승인`을 쓰지 않는다.
