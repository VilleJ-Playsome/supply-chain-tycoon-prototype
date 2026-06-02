import { tick } from './tick.js';
import { render, renderLive } from './ui.js';
import { initEvents } from './events.js';

initEvents();
render();

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
