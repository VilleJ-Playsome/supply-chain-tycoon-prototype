import {
  BUILDINGS,
  BASE_COST,
  COPY_GROWTH,
  SPEED_BASE_COST,
  SPEED_COST_GROWTH,
  UNLOCK_BASE_COST,
  UNLOCK_COST_GROWTH,
} from './constants.js';

export const S = {
  cash: 60,
  cashRate: 0,
  grid: Array(16).fill(null),
  speed: {},
  open: Array(16).fill(false),
};

for (const k in BUILDINGS) S.speed[k] = 0;
[5, 6, 9, 10].forEach(i => S.open[i] = true);

export const rateOf = s => BUILDINGS[s.type].rate * (1 + 0.25 * S.speed[s.type]);

export function newB(type, target) {
  const b = {type, target: (target == null ? null : target), load: 0, runF: 0, cooldown: 0};
  if (type === 'shop') { b.bay = {}; b.fedIn = 0; }
  else { b.out = 0; b.inbuf = {}; b.fed = {}; }
  return b;
}

export const baySum      = b => Object.values(b.bay).reduce((a, c) => a + c, 0);
export const firstShop   = () => S.grid.findIndex(s => s && s.type === 'shop');
export const openCount   = () => S.open.filter(Boolean).length;
export const unlockCost  = () => Math.round(UNLOCK_BASE_COST * Math.pow(UNLOCK_COST_GROWTH, openCount() - 4));
export const copies      = type => S.grid.filter(s => s && s.type === type).length;
export const cost        = type => Math.round(BASE_COST[type] * Math.pow(COPY_GROWTH[type], copies(type)));
export const speedCost   = type => Math.round(SPEED_BASE_COST[type] * Math.pow(SPEED_COST_GROWTH, S.speed[type]));

export function validTarget(srcIdx, tgtIdx) {
  const s = S.grid[srcIdx], t = S.grid[tgtIdx];
  if (!s || !t || tgtIdx === srcIdx) return false;
  if (t.type === 'shop') return true;
  return BUILDINGS[t.type].inputs.some(x => x.res === BUILDINGS[s.type].out);
}

export function cleanTargets() {
  S.grid.forEach(s => { if (s && s.target != null && !S.grid[s.target]) s.target = null; });
}

// Initial board state
S.grid[6] = newB('shop');
S.grid[5] = newB('mine', 6);
