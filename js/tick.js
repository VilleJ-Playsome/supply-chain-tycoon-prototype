import { BUILDINGS, PROD_ORDER, OUT_CAP, IN_CAP, BAY_CAP, TRUCK_BATCH, TRUCK_SPEED, MAX_TRUCKS_PER_ROUTE } from './constants.js';
import { S, rateOf, cleanTargets, inputQty, priceOf } from './state.js';

export function tick(dt) {
  const c0 = S.cash;
  cleanTargets();
  S.grid.forEach(s => { if (s && s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt); });

  const a = Math.min(1, dt / 0.5), deliv = {};
  function gotDelivered(ti, res, mv) { (deliv[ti] = deliv[ti] || {}); deliv[ti][res] = (deliv[ti][res] || 0) + mv; }

  // Spawn trucks from buildings that have output ready
  S.grid.forEach((s, i) => {
    if (!s || s.type === 'shop' || s.cooldown > 0 || s.out < TRUCK_BATCH) return;
    const res = BUILDINGS[s.type].out, ti = s.target, t = ti == null ? null : S.grid[ti];
    if (!t) return;
    const accepts = t.type === 'shop'
      ? true
      : BUILDINGS[t.type].inputs.some(x => x.res === res);
    if (!accepts) return;
    const onRoute = S.trucks.filter(tr => tr.from === i && tr.to === ti).length;
    if (onRoute >= MAX_TRUCKS_PER_ROUTE) return;
    s.out -= TRUCK_BATCH;
    S.trucks.push({ from: i, to: ti, res, qty: TRUCK_BATCH, progress: 0 });
  });

  // Advance trucks and deliver on arrival
  S.trucks.forEach(tr => { tr.progress = Math.min(1, tr.progress + TRUCK_SPEED * dt); });
  S.trucks = S.trucks.filter(tr => {
    if (tr.progress < 1) return true;
    const t = S.grid[tr.to];
    if (t) {
      if (t.type === 'shop') {
        const room = BAY_CAP - baySum(t), mv = Math.min(tr.qty, room);
        if (mv > 0) { t.bay[tr.res] = (t.bay[tr.res] || 0) + mv; gotDelivered(tr.to, tr.res, mv); }
        else { const src = S.grid[tr.from]; if (src) src.out = Math.min(OUT_CAP, src.out + tr.qty); }
      } else if (BUILDINGS[t.type].inputs.some(x => x.res === tr.res)) {
        const room = IN_CAP - (t.inbuf[tr.res] || 0), mv = Math.min(tr.qty, room);
        if (mv > 0) { t.inbuf[tr.res] = (t.inbuf[tr.res] || 0) + mv; gotDelivered(tr.to, tr.res, mv); }
        else { const src = S.grid[tr.from]; if (src) src.out = Math.min(OUT_CAP, src.out + tr.qty); }
      }
    }
    return false;
  });

  for (const type of PROD_ORDER) {
    S.grid.forEach((s, i) => {
      if (!s || s.type !== type || s.cooldown > 0) return;
      const def = BUILDINGS[type], cap = rateOf(s) * dt;
      if (!def.inputs.length) {
        const p = Math.max(0, Math.min(cap, OUT_CAP - s.out));
        s.out += p; s.load = cap > 0 ? p / cap : 0;
      } else {
        let mo = cap;
        for (const inp of def.inputs) mo = Math.min(mo, (s.inbuf[inp.res] || 0) / inputQty(type, inp));
        mo = Math.min(mo, OUT_CAP - s.out); mo = Math.max(0, mo);
        for (const inp of def.inputs) s.inbuf[inp.res] = (s.inbuf[inp.res] || 0) - mo * inputQty(type, inp);
        s.out += mo; s.load = cap > 0 ? mo / cap : 0;
      }
      s.runF += (s.load - s.runF) * a;
    });
  }

  S.grid.forEach((s, i) => {
    if (!s || s.type !== 'shop' || s.cooldown > 0) return;
    let sellable = rateOf(s) * dt, sold = 0;
    for (const res in s.bay) {
      if (sold >= sellable) break;
      const take = Math.min(s.bay[res], sellable - sold);
      s.bay[res] -= take; S.cash += take * priceOf(res); sold += take;
    }
    s.load = sellable > 0 ? sold / sellable : 0;
    s.runF += (s.load - s.runF) * a;
    const inTot = Object.values(deliv[i] || {}).reduce((x, y) => x + y, 0);
    s.fedIn += ((inTot / dt) - s.fedIn) * a;
  });

  S.grid.forEach((s, i) => {
    if (!s || s.cooldown > 0 || s.type === 'shop' || !BUILDINGS[s.type].inputs.length) return;
    const d = deliv[i] || {};
    for (const inp of BUILDINGS[s.type].inputs) {
      const inst = (d[inp.res] || 0) / dt;
      s.fed[inp.res] = (s.fed[inp.res] || 0) + (inst - (s.fed[inp.res] || 0)) * a;
    }
  });

  const r = (S.cash - c0) / dt;
  if (isFinite(r)) S.cashRate = S.cashRate * 0.85 + r * 0.15;
}

function baySum(b) { return Object.values(b.bay).reduce((a, c) => a + c, 0); }
