# Cellpinda GABA Sum

소비자가 모바일에서 한 장씩 넘겨 보는 GABA 소개 페이지입니다.

이 저장소는 기존 [cellpinda_GABA](https://github.com/KRAdavid/cellpinda_GABA) 공식 배포 사이트와 구분되는 별도 소비자용 소개 페이지입니다. 일반 GABA 연구, 셀핀다 제품 정보, 구매자 후기를 같은 근거처럼 섞지 않도록 화면에서 분리했습니다.

카드의 연구·제품·후기 버튼은 먼저 페이지 안의 정보 패널을 열어 설명 흐름을 유지합니다. 원문과 스마트스토어 링크는 패널을 읽은 뒤 선택하는 보조 경로입니다. 퍼블리싱 TF의 역할, 검토 기준, 공개 전 수용 기준은 [`docs/PUBLISHING_TF.md`](docs/PUBLISHING_TF.md)에 기록합니다.

사업자 설명 상황에서는 카드 컨트롤의 `발표 모드`를 사용해 한 장씩 보여줄 수 있습니다. `Escape`로 발표 모드를 종료하고, 연구·제품·후기 상세는 현재 화면의 패널에서 먼저 설명합니다.

실제 상담 순서와 권장·보류 표현은 [`docs/SALES_WALKTHROUGH.md`](docs/SALES_WALKTHROUGH.md)를 따릅니다.

## Local preview

```bash
npm install
npm run dev
```

## Deployment

`main`에 push하면 GitHub Pages workflow가 `https://kradavid.github.io/cellpinda_gaba_sum/` 경로를 기준으로 정적 페이지를 빌드합니다. GitHub 저장소 설정에서 Pages의 Source가 `GitHub Actions`인지 확인해야 합니다.
