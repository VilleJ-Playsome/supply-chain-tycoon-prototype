import {
  BUILDINGS,
  BASE_COST,
  COPY_GROWTH,
  EFFICIENCY_BASE_COST,
  EFFICIENCY_COST_GROWTH,
  EFFICIENCY_MAX_LEVEL,
  EFFICIENCY_STEP,
  EFFICIENCY_TYPES,
  PRICE,
  QUALITY_BASE_COST,
  QUALITY_COST_GROWTH,
  QUALITY_INPUT_STEP,
  QUALITY_VALUE_STEP,
  SPEED_BASE_COST,
  SPEED_COST_GROWTH,
  UNLOCK_BASE_COST,
  UNLOCK_COST_GROWTH,
} from './constants.js';

export const S = {
  cash: 0,
  cashRate: 0,
  grid: Array(16).fill(null),
  speed: {},
  efficiency: {},
  quality: {},
  open: Array(16).fill(false),
  trucks: [],
};

export const rateOf = s => BUILDINGS[s.type].rate * (1 + 0.25 * S.speed[s.type]);
export const hasEfficiencyUpgrade = type => EFFICIENCY_TYPES.includes(type);
export const isEfficiencyMaxed = type => !hasEfficiencyUpgrade(type) || S.efficiency[type] >= EFFICIENCY_MAX_LEVEL;
export const efficiencyInputMultiplier = type => hasEfficiencyUpgrade(type)
  ? 1 - Math.min(EFFICIENCY_STEP * (S.efficiency[type] || 0), EFFICIENCY_STEP * EFFICIENCY_MAX_LEVEL)
  : 1;
export const qualityInputMultiplier = type => 1 + QUALITY_INPUT_STEP * (S.quality[type] || 0);
export const qualityValueMultiplier = type => 1 + QUALITY_VALUE_STEP * (S.quality[type] || 0);
export const inputQty = (type, inp) => inp.qty * qualityInputMultiplier(type) * efficiencyInputMultiplier(type);

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
export const efficiencyCost = type => EFFICIENCY_BASE_COST[type] == null
  ? Infinity
  : Math.round(EFFICIENCY_BASE_COST[type] * Math.pow(EFFICIENCY_COST_GROWTH, S.efficiency[type] || 0));
export const qualityCost = type => QUALITY_BASE_COST[type] == null
  ? Infinity
  : Math.round(QUALITY_BASE_COST[type] * Math.pow(QUALITY_COST_GROWTH, S.quality[type] || 0));
export const outputTypeFor = res => Object.keys(BUILDINGS).find(type => BUILDINGS[type].out === res);
export const priceOf = res => {
  const type = outputTypeFor(res);
  return PRICE[res] * (type ? qualityValueMultiplier(type) : 1);
};

export function validTarget(srcIdx, tgtIdx) {
  const s = S.grid[srcIdx], t = S.grid[tgtIdx];
  if (!s || !t || tgtIdx === srcIdx) return false;
  if (t.type === 'shop') return true;
  return BUILDINGS[t.type].inputs.some(x => x.res === BUILDINGS[s.type].out);
}

export function cleanTargets() {
  S.grid.forEach(s => { if (s && s.target != null && !S.grid[s.target]) s.target = null; });
}

export function resetGame() {
  S.cash = 0;
  S.cashRate = 0;
  S.grid = Array(16).fill(null);
  S.open = Array(16).fill(false);
  S.trucks = [];
  for (const k in BUILDINGS) {
    S.speed[k] = 0;
    S.efficiency[k] = 0;
    S.quality[k] = 0;
  }
  [5, 6, 9, 10].forEach(i => S.open[i] = true);
  S.grid[6] = newB('shop');
  S.grid[5] = newB('mine', 6);
}

resetGame();
