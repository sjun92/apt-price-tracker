# apt-price-tracker

내 아파트 단지의 실거래가 시세와 추이를 보는 정적 웹페이지. GitHub Pages로 호스팅하고, GitHub Actions가 국토교통부 실거래가 API를 주기적으로 받아온다.

## 구성
- `index.html`, `app.js`, `styles.css` — 화면. `data/prices.json`을 읽어 단지별 최신 시세와 추이 차트를 표시한다.
- `data/prices.json` — 수집된 시세 데이터. 현재는 샘플이 들어 있다.
- `config/complexes.json` — 추적할 단지 목록.
- `scripts/fetch-prices.mjs` + `.github/workflows/update-data.yml` — 국토부 API 수집 파이프라인 (M2, 아래 참고).

## 지금 할 것 (M1: 화면 띄우기)
GitHub Pages를 켜면 샘플 데이터로 화면이 뜬다.
1. 이 repo → **Settings → Pages**
2. **Source: Deploy from a branch**, Branch: **main / (root)** 선택 후 Save
3. 1~2분 뒤 상단에 뜨는 주소로 접속 → 샘플 단지 2개의 시세·추이가 보이면 성공

## 다음 (M2: 실제 데이터 수집)
1. 공공데이터포털에서 "국토교통부_아파트 매매 실거래가 자료" API 키 발급
2. 이 repo → Settings → Secrets and variables → Actions → New secret
   - Name: `MOLIT_API_KEY`, Value: 발급받은 키
3. `config/complexes.json`에 내 단지들 입력 (lawdCd = 법정동코드 5자리, aptName = 국토부상 아파트명)
4. Actions에서 update-data 워크플로우 실행 → `data/prices.json`이 실제 데이터로 갱신됨

## 데이터 한계
실거래가라 거래가 있는 달만 나온다. 거래 없는 달은 공백이고, 호가가 아니라 체결가다.
