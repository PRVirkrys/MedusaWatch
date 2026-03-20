// Beach data via OpenStreetMap Overpass API
// Cached in localStorage for 24h to avoid saturating the API

let beaches = [];

const BEACHES_CACHE_KEY = 'medusawatch_beaches_v1';
const BEACHES_CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 hours

// Geographic center of Mallorca
const ISLAND_CENTER = { lat: 39.62, lng: 2.95 };

// Bounding box for Mallorca (south, west, north, east)
const MALLORCA_BBOX = '39.25,2.30,40.10,3.55';

const OVERPASS_QUERY = `
[out:json][timeout:30];
(
  node["natural"="beach"](${MALLORCA_BBOX});
  way["natural"="beach"](${MALLORCA_BBOX});
  relation["natural"="beach"](${MALLORCA_BBOX});
);
out center tags;
`.trim();

// Compute bearing (degrees) from island center to a beach
function bearingFromCenter(lat, lng) {
  const φ1 = ISLAND_CENTER.lat * Math.PI / 180;
  const φ2 = lat * Math.PI / 180;
  const Δλ = (lng - ISLAND_CENTER.lng) * Math.PI / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
}

// Wind directions that push jellyfish toward a beach facing `bearing`
function computeExp(bearing) {
  const b = Math.round(bearing / 45) * 45;
  return [(b + 315) % 360, b % 360, (b + 45) % 360];
}

// Human-readable zone based on bearing from island center
function zoneFromBearing(bearing) {
  const zones = ['Norte','Noreste','Este','Sureste','Sur','Suroeste','Oeste','Noroeste'];
  return zones[Math.round(bearing / 45) % 8];
}

function parseOverpassResult(data) {
  const seen = new Set();
  const result = [];

  for (const el of data.elements) {
    const name = el.tags?.name || el.tags?.['name:es'] || el.tags?.['name:ca'];
    if (!name) continue;

    const lat = el.type === 'node' ? el.lat : el.center?.lat;
    const lng = el.type === 'node' ? el.lon : el.center?.lon;
    if (!lat || !lng) continue;

    // Deduplicate by name+coords
    const key = `${name}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const bearing = bearingFromCenter(lat, lng);
    result.push({
      name,
      zone: zoneFromBearing(bearing),
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5)),
      exp: computeExp(bearing)
    });
  }

  return result.sort((a, b) => a.zone.localeCompare(b.zone) || a.name.localeCompare(b.name));
}

async function fetchFromOverpass() {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(OVERPASS_QUERY)
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  const data = await res.json();
  const parsed = parseOverpassResult(data);
  if (parsed.length === 0) throw new Error('Overpass returned 0 beaches');
  return parsed;
}

function getCached() {
  try {
    const raw = localStorage.getItem(BEACHES_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw); // { timestamp, beaches }
  } catch { return null; }
}

function setCache(beachList) {
  try {
    localStorage.setItem(BEACHES_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      beaches: beachList
    }));
  } catch { /* localStorage full or blocked */ }
}

async function loadBeaches() {
  const cached = getCached();

  // Fresh cache — use it directly
  if (cached && Date.now() - cached.timestamp < BEACHES_CACHE_TTL) {
    console.log(`[MedusaWatch] Beaches from cache (${cached.beaches.length})`);
    beaches = cached.beaches;
    return beaches;
  }

  // Try Overpass API
  try {
    const fresh = await fetchFromOverpass();
    setCache(fresh);
    console.log(`[MedusaWatch] Beaches from Overpass API (${fresh.length})`);
    beaches = fresh;
    return beaches;
  } catch (err) {
    console.warn('[MedusaWatch] Overpass failed:', err.message);
  }

  // Fallback: use expired cache rather than nothing
  if (cached?.beaches?.length > 0) {
    console.warn('[MedusaWatch] Using expired cache as fallback');
    beaches = cached.beaches;
    return beaches;
  }

  console.error('[MedusaWatch] No beach data available');
  beaches = [];
  return beaches;
}
