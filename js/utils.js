function calcRisk(beach, deg, speed) {
  let minD = 360;
  for (const e of beach.exp) {
    let d = Math.abs(deg - e);
    if (d > 180) d = 360 - d;
    if (d < minD) minD = d;
  }
  const sf = Math.min(speed / 20, 1);
  let pct = minD < 45 ? 70 + sf*25 : minD < 90 ? 35 + sf*25 : 5 + sf*20;
  pct = Math.min(Math.round(pct), 98);
  let level, color, hex;
  if (pct >= 60) { level="Alto"; color="danger"; hex="#ff4055"; }
  else if (pct >= 30) { level="Moderado"; color="warn"; hex="#ffaa00"; }
  else { level="Bajo"; color="safe"; hex="#22d46a"; }
  return {pct, level, color, hex};
}

function compass(deg) {
  return ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"][Math.round(deg/22.5)%16];
}
