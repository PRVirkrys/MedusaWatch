let map, markers = [];

function initMap() {
  map = L.map('map', {center:[39.62,2.95], zoom:10, zoomControl:true, attributionControl:false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:18}).addTo(map);
}

function updateMarkers(bd) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  bd.forEach(({beach, risk}, i) => {
    const html = `<div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:0;background:${risk.hex};border-radius:50%;animation:bp 2s ${(i%5)*0.4}s infinite;opacity:0.2;"></div>
      <div style="position:absolute;top:4px;left:4px;width:14px;height:14px;background:${risk.hex};border-radius:50%;border:2.5px solid rgba(255,255,255,0.9);"></div>
    </div>
    <style>@keyframes bp{0%,100%{transform:scale(1);opacity:0.2}50%{transform:scale(2.4);opacity:0}}</style>`;
    const icon = L.divIcon({html, className:'', iconSize:[22,22], iconAnchor:[11,11]});
    const m = L.marker([beach.lat, beach.lng], {icon})
      .bindPopup(`<div class="ppop-inner">
        <div class="ppop-name">${beach.name}</div>
        <div class="ppop-row"><span class="pl">Zona</span><span>${beach.zone}</span></div>
        <div class="ppop-row"><span class="pl">Riesgo</span><span style="color:${risk.hex};font-weight:600">${risk.level}</span></div>
        <div class="ppop-row"><span class="pl">Probabilidad</span><span style="color:${risk.hex};font-weight:600">${risk.pct}%</span></div>
        <div class="ppop-row"><span class="pl">Viento</span><span>${curSpeed} km/h ${compass(curDeg)}</span></div>
        <div class="ppop-bar" style="background:linear-gradient(90deg,${risk.hex} ${risk.pct}%,rgba(255,255,255,0.08) ${risk.pct}%)"></div>
        <a class="ppop-maps-btn" href="https://www.google.com/maps?q=${beach.lat},${beach.lng}" target="_blank" rel="noopener">
          <span>📍</span> Ver en Maps
        </a>
      </div>`, {className:'ppop'}).addTo(map);
    markers.push(m);
  });
}

function focusBeach(i) {
  ['beachList','beachListMobile'].forEach(id => {
    document.querySelectorAll(`#${id} .bitem`).forEach(el => el.classList.remove('active'));
    document.getElementById(`${id}-${i}`)?.classList.add('active');
  });
  map.flyTo([beaches[i].lat, beaches[i].lng], 13, {duration:0.8});
  markers[i]?.openPopup();
  if (bsOpen) collapseBS();
}
