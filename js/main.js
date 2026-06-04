import { tick } from './tick.js';
import { render, renderLive, ui } from './ui.js';
import { initEvents } from './events.js';
import { resetGame } from './state.js';
import { saveGame, loadGame, deleteSave } from './save.js';

initEvents();
loadGame();
render();

function clearUiState() {
  ui.menuFor = null;
  ui.moveFrom = null;
  ui.routeMode = null;
}

document.getElementById('btn-save').addEventListener('click', () => { saveGame(); flashSave('Saved!'); });
document.getElementById('btn-reset').addEventListener('click', () => {
  deleteSave();
  clearUiState();
  resetGame();
  saveGame();
  render();
  flashSave('Reset!');
});

function flashSave(msg) {
  const el = document.getElementById('save-status');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

// Auto-save every 30 s and on unload
setInterval(saveGame, 30_000);
window.addEventListener('beforeunload', saveGame);

let last = performance.now(), acc = 0, slowAcc = 0;
function loop(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.5) dt = 0.5;
  tick(dt);
  acc += dt; slowAcc += dt;
  if (acc >= 0.1) {
    const slow = slowAcc >= 1.0;
    if (slow) slowAcc = 0;
    renderLive(slow);
    acc = 0;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
