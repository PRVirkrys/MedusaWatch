let curDeg = 0, curSpeed = 0;

async function loadData() {
  const btn = document.getElementById('btnRefresh');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin">↻</span>';
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.62&longitude=2.95&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=sea_surface_temperature&timezone=Europe%2FMadrid&forecast_days=1');
    const d = await r.json();
    curSpeed = d.current.wind_speed_10m;
    curDeg = d.current.wind_direction_10m;
    const gusts = d.current.wind_gusts_10m;
    const wt = d.hourly?.sea_surface_temperature?.[0];

    document.getElementById('wDir').textContent = `${compass(curDeg)} (${curDeg}°)`;
    document.getElementById('wSpeed').textContent = `${curSpeed} km/h`;
    document.getElementById('wGusts').textContent = `${gusts} km/h`;
    document.getElementById('wTemp').textContent = wt ? `${wt.toFixed(1)}°C` : '~18°C';
    document.getElementById('wArrow').style.transform = `rotate(${curDeg}deg)`;

    const bd = beaches.map(b => ({beach:b, risk:calcRisk(b, curDeg, curSpeed)}));
    window._lastBD = bd;

    const safe = bd.filter(b => b.risk.color==='safe').length;
    const avg = bd.reduce((s,b) => s+b.risk.pct, 0) / bd.length;
    document.getElementById('wSafe').textContent = `${safe}/${beaches.length}`;

    let rc, rt;
    if (avg >= 60) { rc='r-alto'; rt='🔴 Alto riesgo'; }
    else if (avg >= 30) { rc='r-medio'; rt='🟡 Moderado'; }
    else { rc='r-bajo'; rt='🟢 Bajo riesgo'; }
    document.getElementById('wRisk').innerHTML = `<span class="rbadge ${rc}">${rt}</span>`;
    document.getElementById('updTime').textContent = new Date().toLocaleTimeString('es-ES');

    updateMarkers(bd);
    buildList(bd, 'beachList');
    if (curTab === 'playas') {
      const el = document.getElementById('beachListMobile');
      if (el) buildList(bd, 'beachListMobile');
    }

    document.getElementById('loader').classList.add('out');
  } catch(e) {
    console.error(e);
    document.getElementById('loader').classList.add('out');
    document.getElementById('updTime').textContent = 'Error';
  }
  btn.disabled = false;
  btn.innerHTML = '↻ Actualizar';
}

window.addEventListener('load', async () => {
  initMap();
  document.querySelector('.lsub').textContent = 'Cargando playas (OpenStreetMap)...';
  await loadBeaches();
  document.querySelector('.lsub').textContent = 'Obteniendo datos de viento...';
  await loadData();
  setInterval(loadData, 600000);
});
