import { BUILDINGS, PROD_ORDER, OUT_CAP, IN_CAP, BAY_CAP } from './constants.js';
import { S, rateOf, cleanTargets, inputQty, priceOf } from './state.js';

export function tick(dt) {
  const c0 = S.cash;
  cleanTargets();
  S.grid.forEach(s => { if (s && s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt); });

  const a = Math.min(1, dt / 0.5), deliv = {};
  function gotDelivered(ti, res, mv) { (deliv[ti] = deliv[ti] || {}); deliv[ti][res] = (deliv[ti][res] || 0) + mv; }

  S.grid.forEach((s, i) => {
    if (!s || s.type === 'shop' || s.cooldown > 0 || !s.out) return;
    const res = BUILDINGS[s.type].out, ti = s.target, t = ti == null ? null : S.grid[ti];
    if (!t) return;
    if (t.type === 'shop') {
      const room = BAY_CAP - baySum(t), mv = Math.min(s.out, room);
      if (mv > 0) { t.bay[res] = (t.bay[res] || 0) + mv; s.out -= mv; gotDelivered(ti, res, mv); }
    } else if (BUILDINGS[t.type].inputs.some(x => x.res === res)) {
      const room = IN_CAP - (t.inbuf[res] || 0), mv = Math.min(s.out, room);
      if (mv > 0) { t.inbuf[res] = (t.inbuf[res] || 0) + mv; s.out -= mv; gotDelivered(ti, res, mv); }
    }
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
