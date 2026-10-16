#!/usr/bin/env node
// Regenerates js/beaches-data.js from OpenStreetMap (Overpass API).
// Run: npm run update-beaches
// Recommended: once a year, or when a beach is reported missing.

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'js', 'beaches-data.js');

const CENTER = [39.62, 2.95];
const BBOX   = '39.25,2.30,40.10,3.55';
const QUERY  = `[out:json][timeout:30];(node["natural"="beach"](${BBOX});way["natural"="beach"](${BBOX});relation["natural"="beach"](${BBOX}););out center tags;`;

function bearing(lat, lng) {
  const p1 = CENTER[0] * Math.PI / 180;
  const p2 = lat       * Math.PI / 180;
  const dl  = (lng - CENTER[1]) * Math.PI / 180;
  const x   = Math.sin(dl) * Math.cos(p2);
  const y   = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
}

function zone(b) {
  const zones = ['Norte','Noreste','Este','Sureste','Sur','Suroeste','Oeste','Noroeste'];
  return zones[Math.round(b / 45) % 8];
}

function exp(b) {
  const b2 = Math.round(b / 45) * 45;
  return [(b2 + 315) % 360, b2 % 360, (b2 + 45) % 360];
}

console.log('Fetching beaches from Overpass API…');
const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'data=' + encodeURIComponent(QUERY),
  signal: AbortSignal.timeout(40_000),
});

if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
const data = await res.json();

const seen   = new Set();
const result = [];
for (const el of data.elements) {
  const name = el.tags?.name || el.tags?.['name:es'] || el.tags?.['name:ca'];
  if (!name) continue;
  const lat = el.type === 'node' ? el.lat : el.center?.lat;
  const lng = el.type === 'node' ? el.lon : el.center?.lon;
  if (!lat || !lng) continue;
  const key = `${name}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const b = bearing(lat, lng);
  result.push({ name, zone: zone(b), lat: +lat.toFixed(5), lng: +lng.toFixed(5), exp: exp(b) });
}
result.sort((a, b) => a.zone.localeCompare(b.zone) || a.name.localeCompare(b.name));

const today = new Date().toISOString().slice(0, 10);
const lines  = result.map(b => `  ${JSON.stringify(b)}`).join(',\n');
const output = `// Static beach data for Mallorca — generated ${today} from OpenStreetMap via Overpass API.\n// To refresh: npm run update-beaches\nconst BEACHES_STATIC = [\n${lines}\n];\n`;

writeFileSync(OUT, output, 'utf8');
console.log(`Done — ${result.length} beaches written to js/beaches-data.js`);
