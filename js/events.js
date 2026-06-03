import { MOVE_COOLDOWN, OFFLINE_STEP } from './constants.js';
import {
  S,
  cost,
  efficiencyCost,
  firstShop,
  hasEfficiencyUpgrade,
  isEfficiencyMaxed,
  newB,
  qualityCost,
  speedCost,
  unlockCost,
  validTarget,
} from './state.js';
import { ui, $, render, positionMenu } from './ui.js';
import { tick } from './tick.js';

export function initEvents() {
  // Left-click: complete active route/move, or open the tile context menu
  $('grid').addEventListener('click', e => {
    const slot = e.target.closest('.slot'); if (!slot) return;
    const i = +slot.dataset.i;
    e.stopPropagation();
    if (ui.routeMode != null) {
      if (validTarget(ui.routeMode, i)) S.grid[ui.routeMode].target = i;
      ui.routeMode = null; render(); return;
    }
    if (ui.moveFrom != null) {
      if (S.open[i] && !S.grid[i] && S.grid[ui.moveFrom]) {
        S.grid[i] = S.grid[ui.moveFrom]; S.grid[i].cooldown = MOVE_COOLDOWN; S.grid[ui.moveFrom] = null;
      }
      ui.moveFrom = null; render(); return;
    }
    ui.menuFor = (ui.menuFor === i ? null : i); render();
  });

  // Right-click opens the same menu without spending cash.
  $('grid').addEventListener('contextmenu', e => {
    const slot = e.target.closest('.slot'); if (!slot) return;
    e.preventDefault(); const i = +slot.dataset.i;
    if (ui.routeMode != null || ui.moveFrom != null) { ui.routeMode = null; ui.moveFrom = null; render(); return; }
    ui.menuFor = (ui.menuFor === i ? null : i); render();
  });

  // Context-menu button actions
  $('menu').addEventListener('click', e => {
    e.stopPropagation();
    if (ui.menuFor == null) return;
    const pb = e.target.closest('[data-place]');
    if (pb) {
      const k = pb.dataset.place, c = cost(k);
      if (S.cash >= c) { S.cash -= c; S.grid[ui.menuFor] = newB(k, k === 'shop' ? null : (firstShop() < 0 ? null : firstShop())); render(); }
      return;
    }
    const ab = e.target.closest('[data-act]'); if (!ab) return;
    const act = ab.dataset.act, i = ui.menuFor, s = S.grid[i];
    if      (act === 'unlock') { const c = unlockCost(); if (S.cash >= c) { S.cash -= c; S.open[i] = true; render(); } }
    else if (act === 'up')     { const sc = speedCost(s.type); if (S.cash >= sc) { S.cash -= sc; S.speed[s.type]++; render(); } }
    else if (act === 'eff')    { const ec = efficiencyCost(s.type); if (hasEfficiencyUpgrade(s.type) && !isEfficiencyMaxed(s.type) && S.cash >= ec) { S.cash -= ec; S.efficiency[s.type]++; render(); } }
    else if (act === 'qual')   { const qc = qualityCost(s.type); if (s.type !== 'shop' && S.cash >= qc) { S.cash -= qc; S.quality[s.type]++; render(); } }
    else if (act === 'route')  { ui.routeMode = i; ui.menuFor = null; render(); }
    else if (act === 'move')   { ui.moveFrom  = i; ui.menuFor = null; render(); }
    else if (act === 'remove') { S.grid[i] = null; ui.menuFor = null; render(); }
  });

  $('hint').addEventListener('click', e => {
    if (e.target.closest('[data-h]')) { ui.routeMode = null; ui.moveFrom = null; render(); }
  });

  // Click outside dismisses menu / cancels pending mode
  document.addEventListener('click', e => {
    if (ui.menuFor == null && ui.routeMode == null && ui.moveFrom == null) return;
    if (e.target.closest('#grid') || e.target.closest('#menu') || e.target.closest('#hint')) return;
    ui.menuFor = null; ui.routeMode = null; ui.moveFrom = null; render();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (ui.menuFor != null || ui.routeMode != null || ui.moveFrom != null)) {
      ui.menuFor = null; ui.routeMode = null; ui.moveFrom = null; render();
    }
  });

  const simAway = h => { for (let k = 0, n = h * 3600 / OFFLINE_STEP; k < n; k++) tick(OFFLINE_STEP); render(); };
  $('away1').onclick = () => simAway(1);
  $('away8').onclick = () => simAway(8);

  $('cheat-set-cash').onclick = () => {
    const v = Number($('cheat-cash').value);
    if (Number.isFinite(v) && v >= 0) { S.cash = v; S.cashRate = 0; render(); }
  };
  $('cheat-add-10k').onclick = () => { S.cash += 10000; render(); };
  $('cheat-add-1m').onclick = () => { S.cash += 1000000; render(); };
  $('cheat-unlock').onclick = () => { S.open = S.open.map(() => true); render(); };

  window.addEventListener('resize', () => render());
  window.addEventListener('scroll', () => {
    if (ui.menuFor != null && ui.routeMode == null && ui.moveFrom == null) positionMenu(ui.menuFor);
  }, true);
}
