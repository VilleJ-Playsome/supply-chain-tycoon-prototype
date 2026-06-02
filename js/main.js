import { tick } from './tick.js';
import { render, renderLive } from './ui.js';
import { initEvents } from './events.js';
import { saveGame, loadGame, deleteSave, hasSave } from './save.js';

initEvents();
loadGame();
render();

document.getElementById('btn-save').addEventListener('click', () => { saveGame(); flashSave('Saved!'); });
document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('Delete save and reset? This cannot be undone.')) { deleteSave(); location.reload(); }
});

function flashSave(msg) {
  const el = document.getElementById('save-status');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

// Auto-save every 30 s and on unload
setInterval(saveGame, 30_000);
window.addEventListener('beforeunload', saveGame);

let last = performance.now(), acc = 0;
function loop(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.5) dt = 0.5;
  tick(dt);
  acc += dt;
  if (acc >= 0.1) { renderLive(); acc = 0; }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
