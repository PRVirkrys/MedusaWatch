let bsOpen = false;
let curTab = "playas";

const bs = document.getElementById("bs");

// Init bottom sheet collapsed
bs.style.transform = "translateY(calc(100% - 44px))";

function toggleBS() {
  bsOpen = !bsOpen;
  bs.style.transform = bsOpen
    ? "translateY(0)"
    : "translateY(calc(100% - 44px))";

  document.getElementById("fab").textContent = bsOpen ? "✕" : "☰";
}

function collapseBS() {
  bsOpen = false;
  bs.style.transform = "translateY(calc(100% - 44px))";
  document.getElementById("fab").textContent = "☰";
}

function switchTab(tab) {
  curTab = tab;

  document
    .getElementById("tab-playas")
    .classList.toggle("active", tab === "playas");

  document
    .getElementById("tab-leyenda")
    .classList.toggle("active", tab === "leyenda");

  const c = document.getElementById("bsContent");
  c.replaceChildren();

  if (tab === "playas") {
    const list = document.createElement("div");
    list.className = "blist";
    list.id = "beachListMobile";

    c.appendChild(list);

    if (window._lastBD) buildList(window._lastBD, "beachListMobile");
  } else {
    c.appendChild(createBsLeg());
  }
}

function openMapSearch() {
  document.getElementById("fabSearch").style.display = "none";
  document.getElementById("mapSearch").classList.add("open");
  document.getElementById("searchMobile").focus();
}

function closeMapSearch() {
  document.getElementById("mapSearch").classList.remove("open");
  const searchMobile = document.getElementById("searchMobile");
  searchMobile.value = "";
  searchMobile.blur();
  document.getElementById("mapSearchResults").replaceChildren();
  document.getElementById("fabSearch").style.display = "";
}

function updateMapSearchResults(query) {
  const container = document.getElementById("mapSearchResults");
  if (!container || !window._lastBD) return;

  const q = query.trim().toLowerCase();
  container.replaceChildren();

  if (!q) return;

  const filtered = window._lastBD.filter(({ beach }) =>
    beach.name.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "msr-empty";
    empty.textContent = "Sin resultados";
    container.appendChild(empty);
    return;
  }

  filtered.slice(0, 8).forEach((beachData) => {
    const originalIndex = window._lastBD.indexOf(beachData);
    const { beach, risk } = beachData;

    const item = document.createElement("div");
    item.className = "msr-item";
    item.addEventListener("click", () => {
      focusBeach(originalIndex);
      closeMapSearch();
    });

    const dot = document.createElement("div");
    dot.className = "msr-dot";
    dot.style.background = risk.hex;

    const info = document.createElement("div");
    info.className = "msr-info";

    const name = document.createElement("div");
    name.className = "msr-name";
    name.textContent = beach.name;

    const zone = document.createElement("div");
    zone.className = "msr-zone";
    zone.textContent = beach.zone;

    info.appendChild(name);
    info.appendChild(zone);
    item.appendChild(dot);
    item.appendChild(info);
    container.appendChild(item);
  });
}

const _mapSearch = document.getElementById("mapSearch");
if (_mapSearch) {
  _mapSearch.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  _mapSearch.addEventListener("touchmove", (e) => {
    e.stopPropagation();
    document.getElementById("searchMobile").blur();
  }, { passive: true });
}

document.addEventListener("click", (e) => {
  const mapSearch = document.getElementById("mapSearch");
  const fabSearch = document.getElementById("fabSearch");
  if (mapSearch && mapSearch.classList.contains("open")) {
    if (!mapSearch.contains(e.target) && !fabSearch.contains(e.target)) {
      closeMapSearch();
    }
  }
});

function filterBeaches(query, elId) {
  if (!window._lastBD) return;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? window._lastBD.filter(({ beach }) => beach.name.toLowerCase().includes(q))
    : window._lastBD;

  const container = document.getElementById(elId);
  if (!container) return;
  container.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.style.cssText = "color: var(--muted); font-size: 12px; padding: 16px; text-align: center;";
    empty.textContent = "Sin resultados";
    container.appendChild(empty);
    return;
  }

  filtered.forEach((beachData) => {
    const originalIndex = window._lastBD.indexOf(beachData);
    container.appendChild(createBeachItem(beachData, originalIndex, elId));
  });
}

function createLegendItem(colorVar, title, subtitle) {
  const legItem = document.createElement("div");
  legItem.className = "leg-item";

  const legDot = document.createElement("div");
  legDot.className = "leg-dot";
  legDot.style.background = colorVar;

  const contentWrap = document.createElement("div");

  const titleEl = document.createElement("div");
  titleEl.className = "leg-title";
  titleEl.textContent = title;

  const subEl = document.createElement("div");
  subEl.className = "leg-sub";
  subEl.textContent = subtitle;

  contentWrap.appendChild(titleEl);
  contentWrap.appendChild(subEl);

  legItem.appendChild(legDot);
  legItem.appendChild(contentWrap);

  return legItem;
}

function createBsLeg() {
  const items = [
    {
      color: "var(--safe)",
      title: "Bajo riesgo",
      subtitle: "Viento en contra · Medusas improbables",
    },
    {
      color: "var(--warn)",
      title: "Riesgo moderado",
      subtitle: "Viento lateral · Precaución recomendada",
    },
    {
      color: "var(--danger)",
      title: "Alto riesgo",
      subtitle: "Viento hacia costa · Evitar la zona",
    },
  ];

  const bsLeg = document.createElement("div");
  bsLeg.className = "bs-leg";

  items.forEach((item) => {
    bsLeg.appendChild(createLegendItem(item.color, item.title, item.subtitle));
  });

  const info = document.createElement("div");
  info.className = "leg-info";
  info.textContent =
    "El riesgo se calcula según la dirección del viento relativa a la orientación de cada playa. A mayor velocidad del viento, mayor arrastre de medusas hacia la costa.";

  bsLeg.appendChild(info);

  return bsLeg;
}

function createBeachItem(beachData, i, elId) {
  const { beach, risk } = beachData;

  const item = document.createElement("div");
  item.className = "bitem";
  item.id = `${elId}-${i}`;
  item.addEventListener("click", () => focusBeach(i));

  const dot = document.createElement("div");
  dot.className = "bdot";
  dot.style.background = risk.hex;

  const info = document.createElement("div");
  info.className = "binfo";

  const name = document.createElement("div");
  name.className = "bname";
  name.textContent = beach.name;

  const zone = document.createElement("div");
  zone.className = "bzone";
  zone.textContent = beach.zone;

  info.appendChild(name);
  info.appendChild(zone);

  const pct = document.createElement("div");
  pct.className = `bpct pct-${risk.color}`;
  pct.textContent = `${risk.pct}%`;

  item.appendChild(dot);
  item.appendChild(info);
  item.appendChild(pct);

  return item;
}

function buildList(bd, elId) {
  const container = document.getElementById(elId);
  if (!container) return;

  container.replaceChildren();

  bd.forEach((beachData, i) => {
    container.appendChild(createBeachItem(beachData, i, elId));
  });
}
