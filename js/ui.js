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
