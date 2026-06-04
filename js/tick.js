import { BUILDINGS, PROD_ORDER, OUT_CAP, IN_CAP, BAY_CAP, TRUCK_BATCH, TRUCK_SPEED, MAX_TRUCKS_PER_ROUTE } from './constants.js';
import { S, rateOf, cleanTargets, inputQty, priceOf } from './state.js';

// Travel delay based on grid distance between two cell indices (4×4 grid).
function travelTime(i, j) {
  const dr = Math.floor(i / 4) - Math.floor(j / 4);
  const dc = (i % 4) - (j % 4);
  return Math.sqrt(dr * dr + dc * dc) / TRUCK_SPEED;
}

export function tick(dt) {
  const c0 = S.cash;
  cleanTargets();
  S.grid.forEach(s => { if (s && s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt); });

  const a = Math.min(1, dt / 0.5);

  // ── Production ────────────────────────────────────────────────────────────
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

  // ── Continuous drain: s.out → transit queue (items travel with a delay) ──
  S.grid.forEach((s, i) => {
    if (!s || s.type === 'shop' || s.out <= 0 || s.target == null) return;
    const ti = s.target, t = S.grid[ti];
    if (!t) return;
    const res = BUILDINGS[s.type].out;
    const accepts = t.type === 'shop' || BUILDINGS[t.type].inputs.some(x => x.res === res);
    if (!accepts) return;

    // Count room at destination (subtract what's already in transit to it)
    const inTransit = S.transit.reduce((sum, tr) => tr.to === ti && tr.res === res ? sum + tr.qty : sum, 0);
    const destCurrent = t.type === 'shop' ? baySum(t) : (t.inbuf[res] || 0);
    const destCap = t.type === 'shop' ? BAY_CAP : IN_CAP;
    const room = destCap - destCurrent - inTransit;
    if (room <= 0) return;

    const drain = Math.min(s.out, room);
    s.out -= drain;

    // Accumulate drain for visual truck spawning
    s.drainAcc = (s.drainAcc || 0) + drain;

    S.transit.push({ from: i, to: ti, res, qty: drain, ttl: travelTime(i, ti) });
  });

  // ── Deliver arrived transit items ─────────────────────────────────────────
  const deliv = {};
  function gotDelivered(ti, res, mv) { (deliv[ti] = deliv[ti] || {}); deliv[ti][res] = (deliv[ti][res] || 0) + mv; }

  S.transit.forEach(tr => { tr.ttl -= dt; });
  S.transit = S.transit.filter(tr => {
    if (tr.ttl > 0) return true;
    const t = S.grid[tr.to];
    if (!t) return false;
    if (t.type === 'shop') {
      const room = BAY_CAP - baySum(t), mv = Math.min(tr.qty, room);
      if (mv > 0) { t.bay[tr.res] = (t.bay[tr.res] || 0) + mv; gotDelivered(tr.to, tr.res, mv); }
      else { const src = S.grid[tr.from]; if (src) src.out = Math.min(OUT_CAP, src.out + tr.qty); }
    } else if (BUILDINGS[t.type].inputs.some(x => x.res === tr.res)) {
      const room = IN_CAP - (t.inbuf[tr.res] || 0), mv = Math.min(tr.qty, room);
      if (mv > 0) { t.inbuf[tr.res] = (t.inbuf[tr.res] || 0) + mv; gotDelivered(tr.to, tr.res, mv); }
      else { const src = S.grid[tr.from]; if (src) src.out = Math.min(OUT_CAP, src.out + tr.qty); }
    }
    return false;
  });

  // ── Shop selling ──────────────────────────────────────────────────────────
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

  // ── Visual trucks (spawn when enough drained, animate, no delivery) ────────
  S.grid.forEach((s, i) => {
    if (!s || s.type === 'shop' || s.cooldown > 0 || !(s.drainAcc >= TRUCK_BATCH)) return;
    const ti = s.target, t = ti == null ? null : S.grid[ti];
    if (!t) return;
    const onRoute = S.trucks.filter(tr => tr.from === i && tr.to === ti).length;
    if (onRoute >= MAX_TRUCKS_PER_ROUTE) return;
    s.drainAcc -= TRUCK_BATCH;
    S.trucks.push({ from: i, to: ti, res: BUILDINGS[s.type].out, progress: 0 });
  });

  S.trucks.forEach(tr => { tr.progress = Math.min(1, tr.progress + TRUCK_SPEED * dt); });
  S.trucks = S.trucks.filter(tr => tr.progress < 1);

  // ── Income rate: true average earnings over each 1-second window ──────────
  // The transit rework made cash flow smooth, so a measured average is both
  // accurate and stable. Recomputed once per second; never stuck at 0.
  S._earnAcc += S.cash - c0;
  S._earnTime += dt;
  if (S._earnTime >= 1.0) {
    S.cashRate = S._earnAcc / S._earnTime;
    S._earnAcc = 0;
    S._earnTime = 0;
  }
}

function baySum(b) { return Object.values(b.bay).reduce((a, c) => a + c, 0); }
