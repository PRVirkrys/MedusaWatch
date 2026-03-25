let map;
let markers = [];

function initMap() {
  map = L.map("map", {
    center: [39.62, 2.95],
    zoom: 10,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 18,
  }).addTo(map);
}

function clearMarkers() {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
}

function createPulseIcon(riskHex, delayIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "marker-wrap";

  const pulse = document.createElement("div");
  pulse.className = "marker-pulse";
  pulse.style.background = riskHex;
  pulse.style.animationDelay = `${(delayIndex % 5) * 0.4}s`;

  const dot = document.createElement("div");
  dot.className = "marker-dot";
  dot.style.background = riskHex;

  wrapper.appendChild(pulse);
  wrapper.appendChild(dot);

  return L.divIcon({
    html: wrapper,
    className: "custom-marker-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function createPopupRow(labelText, valueNodeOrText) {
  const row = document.createElement("div");
  row.className = "ppop-row";

  const label = document.createElement("span");
  label.className = "pl";
  label.textContent = labelText;

  const value = document.createElement("span");

  if (valueNodeOrText instanceof Node) {
    value.appendChild(valueNodeOrText);
  } else {
    value.textContent = valueNodeOrText;
  }

  row.appendChild(label);
  row.appendChild(value);

  return row;
}

function createPopupContent(beach, risk) {
  const wrapper = document.createElement("div");
  wrapper.className = "ppop-inner";

  const name = document.createElement("div");
  name.className = "ppop-name";
  name.textContent = beach.name;

  const riskValue = document.createElement("span");
  riskValue.textContent = risk.level;
  riskValue.style.color = risk.hex;
  riskValue.style.fontWeight = "600";

  const pctValue = document.createElement("span");
  pctValue.textContent = `${risk.pct}%`;
  pctValue.style.color = risk.hex;
  pctValue.style.fontWeight = "600";

  const windText = `${curSpeed} km/h ${compass(curDeg)}`;

  const bar = document.createElement("div");
  bar.className = "ppop-bar";
  bar.style.background = `linear-gradient(90deg, ${risk.hex} ${risk.pct}%, rgba(255,255,255,0.08) ${risk.pct}%)`;

  const mapsBtn = document.createElement("a");
  mapsBtn.className = "ppop-maps-btn";
  mapsBtn.href = `https://www.google.com/maps?q=${beach.lat},${beach.lng}`;
  mapsBtn.target = "_blank";
  mapsBtn.rel = "noopener";

  const mapsIcon = document.createElement("span");
  mapsIcon.textContent = "📍";

  const mapsText = document.createTextNode(" Ver en Maps");

  mapsBtn.appendChild(mapsIcon);
  mapsBtn.appendChild(mapsText);

  wrapper.appendChild(name);
  wrapper.appendChild(createPopupRow("Zona", beach.zone));
  wrapper.appendChild(createPopupRow("Riesgo", riskValue));
  wrapper.appendChild(createPopupRow("Probabilidad", pctValue));
  wrapper.appendChild(createPopupRow("Viento", windText));
  wrapper.appendChild(bar);
  wrapper.appendChild(mapsBtn);

  return wrapper;
}

function updateMarkers(bd) {
  clearMarkers();

  bd.forEach(({ beach, risk }, i) => {
    const icon = createPulseIcon(risk.hex, i);

    const marker = L.marker([beach.lat, beach.lng], { icon })
      .bindPopup(() => {
        const currentBd = window._lastBD;
        const current = currentBd ? currentBd.find((d) => d.beach === beach) : null;
        return createPopupContent(beach, current ? current.risk : risk);
      }, { className: "ppop" })
      .addTo(map);

    markers.push(marker);
  });
}

function updateMarkerColors(bd) {
  bd.forEach(({ beach, risk }, i) => {
    const marker = markers[i];
    if (!marker || !marker._icon) return;
    const dot = marker._icon.querySelector(".marker-dot");
    const pulse = marker._icon.querySelector(".marker-pulse");
    if (dot) dot.style.background = risk.hex;
    if (pulse) pulse.style.background = risk.hex;
    if (marker.isPopupOpen()) {
      marker.setPopupContent(createPopupContent(beach, risk));
    }
  });
}

function setActiveBeachItem(i) {
  ["beachList", "beachListMobile"].forEach((id) => {
    const container = document.getElementById(id);
    if (!container) return;

    container.querySelectorAll(".bitem").forEach((el) => {
      el.classList.remove("active");
    });

    const activeItem = document.getElementById(`${id}-${i}`);
    if (activeItem) {
      activeItem.classList.add("active");
    }
  });
}

function focusBeach(i) {
  setActiveBeachItem(i);

  map.flyTo([beaches[i].lat, beaches[i].lng], 13, {
    duration: 0.8,
  });

  if (markers[i]) {
    markers[i].openPopup();
  }

  if (bsOpen) {
    collapseBS();
  }
}
