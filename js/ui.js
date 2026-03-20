let bsOpen = false, curTab = 'playas';
const bs = document.getElementById('bs');

// Init bottom sheet collapsed
bs.style.transform = 'translateY(calc(100% - 44px))';

function toggleBS() {
  bsOpen = !bsOpen;
  bs.style.transform = bsOpen ? 'translateY(0)' : 'translateY(calc(100% - 44px))';
  document.getElementById('fab').textContent = bsOpen ? '✕' : '☰';
}

function collapseBS() {
  bsOpen = false;
  bs.style.transform = 'translateY(calc(100% - 44px))';
  document.getElementById('fab').textContent = '☰';
}

function switchTab(tab) {
  curTab = tab;
  document.getElementById('tab-playas').classList.toggle('active', tab==='playas');
  document.getElementById('tab-leyenda').classList.toggle('active', tab==='leyenda');
  const c = document.getElementById('bsContent');
  if (tab === 'playas') {
    c.innerHTML = `<div class="blist" id="beachListMobile"></div>`;
    if (window._lastBD) buildList(window._lastBD, 'beachListMobile');
  } else {
    c.innerHTML = `<div class="bs-leg">
      <div class="leg-item"><div class="leg-dot" style="background:var(--safe)"></div><div><div style="font-size:13px">Bajo riesgo</div><div class="leg-sub">Viento en contra · Medusas improbables</div></div></div>
      <div class="leg-item"><div class="leg-dot" style="background:var(--warn)"></div><div><div style="font-size:13px">Riesgo moderado</div><div class="leg-sub">Viento lateral · Precaución recomendada</div></div></div>
      <div class="leg-item"><div class="leg-dot" style="background:var(--danger)"></div><div><div style="font-size:13px">Alto riesgo</div><div class="leg-sub">Viento hacia costa · Evitar la zona</div></div></div>
      <div style="margin-top:12px;padding:10px;background:var(--card);border-radius:8px;font-size:11px;color:var(--muted);line-height:1.6">
        El riesgo se calcula según la dirección del viento relativa a la orientación de cada playa. A mayor velocidad del viento, mayor arrastre de medusas hacia la costa.
      </div>
    </div>`;
  }
}

function buildList(bd, elId) {
  document.getElementById(elId).innerHTML = bd.map(({beach, risk}, i) =>
    `<div class="bitem" onclick="focusBeach(${i})" id="${elId}-${i}">
      <div class="bdot" style="background:${risk.hex}"></div>
      <div class="binfo">
        <div class="bname">${beach.name}</div>
        <div class="bzone">${beach.zone}</div>
      </div>
      <div class="bpct pct-${risk.color}">${risk.pct}%</div>
    </div>`
  ).join('');
}
