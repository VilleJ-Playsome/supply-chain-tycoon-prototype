import { S, newB } from './state.js';
import { BUILDINGS } from './constants.js';

const KEY = 'supply_line_save';

export function saveGame() {
  const data = {
    v: 1,
    cash: S.cash,
    cashRate: S.cashRate,
    speed: { ...S.speed },
    efficiency: { ...S.efficiency },
    quality: { ...S.quality },
    open: [...S.open],
    grid: S.grid.map(s => {
      if (!s) return null;
      const base = { type: s.type, target: s.target, load: s.load, runF: s.runF, cooldown: s.cooldown };
      if (s.type === 'shop') { base.bay = { ...s.bay }; base.fedIn = s.fedIn; }
      else { base.out = s.out; base.inbuf = { ...s.inbuf }; base.fed = { ...s.fed }; }
      return base;
    }),
    savedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadGame() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (data.v !== 1) return false;

    S.cash = data.cash;
    S.cashRate = data.cashRate;
    for (const k in BUILDINGS) {
      S.speed[k] = data.speed?.[k] || 0;
      S.efficiency[k] = data.efficiency?.[k] || 0;
      S.quality[k] = data.quality?.[k] || 0;
    }
    data.open.forEach((v, i) => S.open[i] = v);
    data.grid.forEach((saved, i) => {
      if (!saved) { S.grid[i] = null; return; }
      const b = newB(saved.type, saved.target);
      b.load = saved.load; b.runF = saved.runF; b.cooldown = saved.cooldown;
      if (saved.type === 'shop') { b.bay = { ...saved.bay }; b.fedIn = saved.fedIn; }
      else { b.out = saved.out; b.inbuf = { ...saved.inbuf }; b.fed = { ...saved.fed }; }
      S.grid[i] = b;
    });
    return true;
  } catch { return false; }
}

export function hasSave() { return !!localStorage.getItem(KEY); }
export function deleteSave() { localStorage.removeItem(KEY); }
