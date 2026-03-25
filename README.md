# 🪼 MedusaWatch Mallorca

Real-time jellyfish risk alerts for beaches in Mallorca, Spain. The app analyzes wind direction and speed relative to each beach's orientation to predict jellyfish presence and help beachgoers decide where to swim safely.

**Live at:** [medusawatch.netlify.app](https://medusawatch.netlify.app) *(Netlify)*

---

## How it works

Jellyfish are carried by ocean currents pushed by the wind. When the wind blows toward a beach, jellyfish are more likely to be pushed ashore. MedusaWatch calculates the angle between the current wind direction and each beach's exposure angle, then combines it with wind speed to produce a risk percentage.

| Risk level | Color | Condition |
|---|---|---|
| Low | 🟢 Green | Wind blowing away from shore |
| Moderate | 🟡 Yellow | Wind blowing laterally |
| High | 🔴 Red | Wind blowing directly toward shore |

---

## Features

- **Real-time wind data** — direction, speed, gusts, and sea surface temperature from Open-Meteo API, updated every 10 minutes
- **Per-beach risk calculation** — each beach is evaluated individually based on its coastal orientation
- **Interactive map** — Leaflet map with animated, color-coded markers for every beach in Mallorca
- **Searchable beach list** — filter and jump to any beach instantly
- **Responsive design** — desktop sidebar panel and mobile bottom sheet with search overlay
- **Offline-friendly caching** — beach data is cached in localStorage for 24 hours to reduce API calls

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Map | [Leaflet.js](https://leafletjs.com/) v1.9.4 + CartoDB Dark tiles |
| Weather API | [Open-Meteo](https://open-meteo.com/) (free, no key needed) |
| Beach data | [OpenStreetMap Overpass API](https://overpass-api.de/) |
| Fonts | Google Fonts — Bebas Neue, DM Sans |
| Hosting | Netlify |

No build step. No framework. No dependencies to install.

---

## Project structure

```
MedusaWatch/
├── index.html
├── css/
│   ├── variables.css       # Design tokens (colors, spacing)
│   ├── base.css            # Global reset
│   ├── header.css          # Header & wind bar
│   ├── panel.css           # Desktop sidebar
│   ├── mobile.css          # Mobile bottom sheet & FAB
│   ├── loader.css          # Loading animation
│   ├── popup.css           # Map popup styles
│   └── leaflet-overrides.css
└── js/
    ├── app.js              # Entry point, data orchestration
    ├── beaches.js          # Beach fetching & caching
    ├── map.js              # Leaflet map, markers, popups
    ├── ui.js               # UI interactions
    └── utils.js            # Risk calculation algorithm
```

---

## Running locally

No build process required — just serve the files with any static server:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

---

## Risk algorithm

The risk percentage for each beach is calculated in `js/utils.js`:

1. The minimum angular distance between the wind direction and the beach's exposure angles is computed
2. That angle is mapped to a base risk (closer to shore-facing = higher risk)
3. Wind speed is factored in as a multiplier (capped at 20 km/h for full effect)
4. The result is a percentage: **< 30%** = low, **30–59%** = moderate, **≥ 60%** = high

---

## Data sources

- **Wind & temperature** — [Open-Meteo Forecast API](https://open-meteo.com/en/docs) · Mallorca center (39.62°N, 2.95°E)
- **Beach locations** — [OpenStreetMap](https://www.openstreetmap.org/) via Overpass API · `natural=beach` nodes/ways in Mallorca bounding box
- **Map tiles** — [CartoDB](https://carto.com/basemaps/) Dark Matter (free, no key needed)

---

Made with 💙 by [@ByPaulaRodas](https://github.com/PRVirkrys) · *Para tu viaje, Zabi*
