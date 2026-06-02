import { MOVE_COOLDOWN, OFFLINE_STEP } from './constants.js';
import { S, newB, cost, speedCost, unlockCost, validTarget, firstShop } from './state.js';
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

  // Right-click: primary action — upgrade a building or unlock a plot
  $('grid').addEventListener('contextmenu', e => {
    const slot = e.target.closest('.slot'); if (!slot) return;
    e.preventDefault(); const i = +slot.dataset.i;
    if (ui.routeMode != null || ui.moveFrom != null) { ui.routeMode = null; ui.moveFrom = null; render(); return; }
    const s = S.grid[i];
    if (!S.open[i]) { const c = unlockCost(); if (S.cash >= c) { S.cash -= c; S.open[i] = true; } ui.menuFor = i; render(); return; }
    if (!s) { ui.menuFor = i; render(); return; }
    const sc = speedCost(s.type);
    if (S.cash >= sc) { S.cash -= sc; S.speed[s.type]++; ui.menuFor = null; } else { ui.menuFor = i; }
    render();
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

  window.addEventListener('resize', () => render());
  window.addEventListener('scroll', () => {
    if (ui.menuFor != null && ui.routeMode == null && ui.moveFrom == null) positionMenu(ui.menuFor);
  }, true);
}
