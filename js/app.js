let curDeg = 0,
  curSpeed = 0;

async function loadData() {
  const btn = document.getElementById("btnRefresh");
  btn.disabled = true;
  const spinSpan = document.createElement("span");
  spinSpan.className = "spin";
  spinSpan.textContent = "↻";
  btn.replaceChildren(spinSpan);
  try {
    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=39.62&longitude=2.95&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,sea_surface_temperature&timezone=Europe%2FMadrid&forecast_days=2",
    );
    const d = await r.json();

    const wt = d.hourly?.sea_surface_temperature?.[0];
    document.getElementById("wTemp").textContent = wt
      ? `${wt.toFixed(1)}°C`
      : "~18°C";

    // Find the index in the hourly array that matches the current hour
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

    // Pre-compute beach risks for each of the next 24 hours
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

    // Full marker recreate on every data load
    updateMarkers(window._forecast[0].bd);

    // Apply current hour to UI and reset slider
    applyForecastHour(0);
    document.querySelectorAll(".ts-input").forEach((el) => (el.value = 0));

    document.getElementById("updTime").textContent =
      new Date().toLocaleTimeString("es-ES");
    document.getElementById("loader").classList.add("out");
  } catch (e) {
    console.error(e);
    document.getElementById("loader").classList.add("out");
    document.getElementById("updTime").textContent = "Error";
  }
  btn.disabled = false;
  btn.textContent = "↻ Actualizar";
}

window.addEventListener("load", async () => {
  initMap();
  document.querySelector(".lsub").textContent =
    "Cargando playas (OpenStreetMap)...";
  await loadBeaches();
  document.querySelector(".lsub").textContent = "Obteniendo datos de viento...";
  await loadData();
  setInterval(loadData, 600000);
});
