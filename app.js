// 내 단지 시세 — data/prices.json을 읽어 최신 시세와 추이를 렌더한다.
const app = document.getElementById("app");
const statusEl = document.getElementById("status");
const metaEl = document.getElementById("meta");

// 만원 단위 금액 → 사람이 읽는 형식
function fmt(manwon) {
  if (manwon == null) return "-";
  if (manwon >= 10000) return (manwon / 10000).toFixed(1) + "억";
  return manwon.toLocaleString() + "만원";
}

// 거래 배열 → 월별 평균(만원) { "2026-06": 150000, ... }
function monthlyAvg(deals) {
  const byMonth = {};
  for (const d of deals) {
    (byMonth[d.date] ||= []).push(d.amount);
  }
  const out = {};
  for (const m of Object.keys(byMonth).sort()) {
    const arr = byMonth[m];
    out[m] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }
  return out;
}

function complexCard(c) {
  const deals = [...(c.deals || [])].sort((a, b) => a.date.localeCompare(b.date));
  const card = document.createElement("section");
  card.className = "card";

  const title = document.createElement("h2");
  title.textContent = c.name || c.aptName || "단지";
  card.appendChild(title);

  const sub = document.createElement("p");
  sub.className = "sub";
  sub.textContent = [c.region, c.aptName].filter(Boolean).join(" · ");
  card.appendChild(sub);

  if (!deals.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "최근 실거래 없음";
    card.appendChild(empty);
    return card;
  }

  const last = deals[deals.length - 1];
  const price = document.createElement("div");
  price.className = "price";
  price.innerHTML = fmt(last.amount) + `<small>${last.date} · ${last.area}㎡` +
    (last.floor ? ` · ${last.floor}층` : "") + `</small>`;
  card.appendChild(price);

  const wrap = document.createElement("div");
  wrap.className = "chart-wrap";
  const canvas = document.createElement("canvas");
  wrap.appendChild(canvas);
  card.appendChild(wrap);

  const avg = monthlyAvg(deals);
  const labels = Object.keys(avg);
  const values = labels.map((m) => +(avg[m] / 10000).toFixed(2)); // 억 단위
  new Chart(canvas, {
    type: "line",
    data: { labels, datasets: [{ data: values, borderColor: "#2f6fed", tension: 0.25, pointRadius: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (i) => i.parsed.y + "억" } } },
      scales: { y: { ticks: { callback: (v) => v + "억" } } },
    },
  });
  return card;
}

async function main() {
  try {
    const res = await fetch("data/prices.json", { cache: "no-store" });
    if (!res.ok) throw new Error("데이터 파일을 찾을 수 없습니다 (" + res.status + ")");
    const data = await res.json();
    statusEl.remove();
    metaEl.textContent = [
      data.updated ? "갱신 " + data.updated : "",
      data.note || "",
    ].filter(Boolean).join(" · ");
    const list = data.complexes || [];
    if (!list.length) {
      app.innerHTML = '<p class="empty">등록된 단지가 없습니다. config/complexes.json에 단지를 추가하세요.</p>';
      return;
    }
    for (const c of list) app.appendChild(complexCard(c));
  } catch (e) {
    statusEl.className = "err";
    statusEl.textContent = "오류: " + e.message;
  }
}
main();
