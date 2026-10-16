let curDeg = 0,
  curSpeed = 0;

const CACHE_KEY = "medusawatch_wind_cache_v1";
const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 min
const API_TIMEOUT_MS = 10000; // 10s
const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=39.62&longitude=2.95&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,sea_surface_temperature&timezone=Europe%2FMadrid&forecast_days=2";

function openDisclaimer() {
  document.getElementById("disclaimerOverlay").classList.add("visible");
}

function closeDisclaimer(save) {
  if (save) localStorage.setItem("medusawatch_disclaimer_v1", "accepted");
  document.getElementById("disclaimerOverlay").classList.remove("visible");
}

function checkDisclaimer() {
  if (localStorage.getItem("medusawatch_disclaimer_v1") !== "accepted") {
    openDisclaimer();
  }
}

function showErrorBanner(msg) {
  if (msg) {
    const el = document.getElementById("errorBannerMsg");
    if (el) el.textContent = msg;
  }
  document.getElementById("errorBanner").classList.add("visible");
}

function hideErrorBanner() {
  document.getElementById("errorBanner").classList.remove("visible");
}

function setLoaderMsg(msg) {
  const el = document.querySelector(".lsub");
  if (el) el.textContent = msg;
}

function saveCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch (_) {}
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_MAX_AGE_MS) return null;
    return data;
  } catch (_) {
    return null;
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return r;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function fetchWindData() {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt === 1) setLoaderMsg("Reintentando conexión…");
      const r = await fetchWithTimeout(API_URL, API_TIMEOUT_MS);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      saveCache(d);
      return { data: d, fromCache: false };
    } catch (e) {
      lastError = e;
    }
  }
  // Both attempts failed — try cache (any age)
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { data } = JSON.parse(raw);
      return { data, fromCache: true };
    }
  } catch (_) {}
  throw lastError;
}

function applyWindData(d, fromCache) {
  const now = new Date();
  const hourlyTimes = d.hourly.time;
  let currentHourIdx = hourlyTimes.findIndex((t) => {
    const h = new Date(t);
    return (
      h.getFullYear() === now.getFullYear() &&
      h.getMonth() === now.getMonth() &&
      h.getDate() === now.getDate() &&
      h.getHours() === now.getHours()
    );
  });
  if (currentHourIdx === -1) currentHourIdx = 0;

  const wt = d.hourly?.sea_surface_temperature?.[currentHourIdx];
  document.getElementById("wTemp").textContent = wt
    ? `${wt.toFixed(1)}°C`
    : "~18°C";

  window._forecast = [];
  for (let i = 0; i < 24; i++) {
    const idx = currentHourIdx + i;
    if (idx >= hourlyTimes.length) break;
    const snapDeg = d.hourly.wind_direction_10m[idx];
    const snapSpeed = d.hourly.wind_speed_10m[idx];
    window._forecast.push({
      time: new Date(hourlyTimes[idx]),
      speed: snapSpeed,
      deg: snapDeg,
      gusts: d.hourly.wind_gusts_10m[idx],
      bd: beaches.map((b) => ({ beach: b, risk: calcRisk(b, snapDeg, snapSpeed) })),
    });
  }

  updateMarkers(window._forecast[0].bd);
  applyForecastHour(0);
  document.querySelectorAll(".ts-input").forEach((el) => (el.value = 0));

  const timeLabel = fromCache
    ? "Datos guardados · sin conexión"
    : new Date().toLocaleTimeString("es-ES");
  document.getElementById("updTime").textContent = timeLabel;
}

async function loadData() {
  hideErrorBanner();
  const btn = document.getElementById("btnRefresh");
  btn.disabled = true;
  const spinSpan = document.createElement("span");
  spinSpan.className = "spin";
  spinSpan.textContent = "↻";
  btn.replaceChildren(spinSpan);

  // Show cached data immediately if available (any age)
  const cached = loadCache();
  if (cached) {
    try {
      applyWindData(cached, false);
      document.getElementById("loader").classList.add("out");
    } catch (_) {}
  }

  try {
    setLoaderMsg("Obteniendo datos de viento…");
    const { data, fromCache } = await fetchWindData();
    applyWindData(data, fromCache);
    if (fromCache) showErrorBanner("Sin conexión · mostrando últimos datos guardados.");
    document.getElementById("loader").classList.add("out");
    checkDisclaimer();
  } catch (e) {
    console.error(e);
    document.getElementById("loader").classList.add("out");
    document.getElementById("updTime").textContent = "Sin conexión";
    showErrorBanner();
  }

  btn.disabled = false;
  btn.textContent = "↻ Actualizar";
}

window.addEventListener("load", async () => {
  initMap();
  setLoaderMsg("Cargando playas (OpenStreetMap)…");
  await loadBeaches();
  setLoaderMsg("Obteniendo datos de viento…");
  await loadData();
  setInterval(loadData, 600000);
});
