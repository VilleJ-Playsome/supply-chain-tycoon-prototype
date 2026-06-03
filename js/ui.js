import {
  BUILDINGS,
  EFFICIENCY_MAX_LEVEL,
  EFFICIENCY_STEP,
  ICON,
  MOVE_COOLDOWN,
  QUALITY_INPUT_STEP,
  QUALITY_VALUE_STEP,
  RESICON,
  RNAME,
  TIERCOL,
} from './constants.js';
import {
  S,
  cost,
  copies,
  efficiencyCost,
  firstShop,
  hasEfficiencyUpgrade,
  inputQty,
  isEfficiencyMaxed,
  priceOf,
  qualityCost,
  rateOf,
  speedCost,
  unlockCost,
  validTarget,
} from './state.js';

// Shared UI state — mutated by both this module and events.js
export const ui = { menuFor: null, moveFrom: null, routeMode: null };
function clearUiState() {
  ui.menuFor = null;
  ui.moveFrom = null;
  ui.routeMode = null;
}

export const $ = id => document.getElementById(id);

const money     = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? Math.round(n).toLocaleString() : n.toFixed(n < 100 ? 1 : 0);
const qtyText   = n => Number.isInteger(n) ? n : n.toFixed(n < 10 ? 2 : 1).replace(/\.?0+$/, '');
const loadColor = l => l >= 0.85 ? 'var(--teal)' : l >= 0.5 ? 'var(--amber)' : 'var(--red)';
const tierTag   = b => b.short === 'Shop' ? 'shop' : 'd' + b.depth;
const catLabel  = b => b.short === 'Shop' ? 'shop' : (b.depth === 0 ? 'raw' : b.depth === 3 ? 'final' : 'part');
const tname     = idx => { const t = S.grid[idx]; return t ? BUILDINGS[t.type].short + ' ·s' + idx : '?'; };
export const clamp01 = x => Math.max(0, Math.min(1, x || 0));
const runText   = s => { const full = rateOf(s); return `${(clamp01(s.runF) * full).toFixed(1)}/${full.toFixed(1)}/s`; };

function feedHTML(s) {
  const b = BUILDINGS[s.type], full = rateOf(s);
  if (s.type === 'shop') return `taking in ${(s.fedIn || 0).toFixed(1)}/s`;
  if (!b.inputs.length) return 'no inputs';
  return 'fed ' + b.inputs.map(inp => {
    const need = inputQty(s.type, inp) * full, f = (s.fed && s.fed[inp.res]) || 0, stock = (s.inbuf && s.inbuf[inp.res]) || 0;
    const col = (f >= need * 0.97) ? 'var(--teal)' : (stock > 1 ? 'var(--amber)' : 'var(--red)');
    return `<span style="color:${col}">${inp.res.slice(0, 4)} ${f.toFixed(1)}/${need.toFixed(1)}</span>`;
  }).join(' · ');
}

export function render() {
  $('cash').textContent = money(S.cash);
  $('rate').textContent = (S.cashRate >= 0 ? '+' : '') + S.cashRate.toFixed(2);
  $('rate').style.color = S.cashRate >= 0 ? 'var(--teal)' : 'var(--red)';

  let h = '';
  S.grid.forEach((s, i) => {
    let cls = 'slot';
    if (ui.routeMode != null) {
      if (i === ui.routeMode) cls += ' sel';
      else if (validTarget(ui.routeMode, i)) cls += ' valid';
      else cls += ' dim';
    } else if (ui.moveFrom != null) {
      if (i === ui.moveFrom) cls += ' sel';
      else if (S.open[i] && !S.grid[i]) cls += ' valid';
      else cls += ' dim';
    } else if (ui.menuFor === i) cls += ' sel';

    if (!S.open[i]) {
      h += `<div class="${cls} locked" data-i="${i}"><span class="lockico">🔒</span><span class="elbl">locked</span><span class="lockcost">$${money(unlockCost())}</span></div>`;
      return;
    }
    if (!s) {
      const mv = ui.moveFrom != null && ui.moveFrom !== i;
      h += `<div class="${cls} empty" data-i="${i}"><span class="plus">${mv ? '↳' : '＋'}</span><span class="elbl">${mv ? 'move here' : 'build'}</span></div>`;
      return;
    }

    const b = BUILDINGS[s.type], isShop = s.type === 'shop', frac = clamp01(s.runF), tc = TIERCOL[tierTag(b)];
    let sub;
    if (isShop) {
      sub = `sells up to ${rateOf(s).toFixed(1)}/s · L${S.speed[s.type]}`;
    } else {
      const tgt = s.target == null ? '<b class="un">unrouted</b>' : '→ <b>' + tname(s.target) + '</b>';
      const recipe = b.inputs.length ? b.inputs.map(x => qtyText(inputQty(s.type, x)) + '·' + x.res.slice(0, 3)).join(' ') + '►' + b.out : b.out + ' source';
      sub = `${recipe} · L${S.speed[s.type]} ${tgt}`;
    }

    h += `<div class="${cls} ${isShop ? 'shop' : ''}" data-i="${i}">
      <span class="stripe" style="background:${tc.s}"></span>
      <div class="hd"><span class="ico" style="background:${tc.c}">${ICON[s.type]}</span>
        <div class="ttl"><span class="tag ${tierTag(b)}">${catLabel(b)}</span><div class="nm">${b.short}</div></div></div>
      <div class="lvl">${sub}</div>
      <div class="feed">${feedHTML(s)}</div>
      <div class="barwrap"><div class="bar"><i class="lf" style="width:${Math.round(frac * 100)}%;background:${loadColor(frac)}"></i></div>
        <div class="loadpct"><span>${isShop ? 'selling' : 'running'}</span><span class="lp" style="color:${loadColor(frac)}">${runText(s)}</span></div></div>
      ${s.cooldown > 0 ? `<div class="cool">MOVING ${s.cooldown.toFixed(1)}s</div>` : ''}
    </div>`;
  });
  $('grid').innerHTML = h;
  drawRoutes();

  let p = '';
  ['ore', 'rubber', 'steel', 'wheel', 'body', 'car'].forEach(r => {
    p += `<div class="prow"><span class="pemoji">${RESICON[r]}</span><span class="pname">${RNAME[r]}</span><span class="pv">$${priceOf(r).toFixed(2)}</span></div>`;
  });
  $('parts').innerHTML = p;

  renderMenu(); renderHint(); renderBottleneck();
}

function rectOf(i) {
  const el = document.querySelector('.slot[data-i="' + i + '"]');
  if (!el) return null;
  const base = $('roads').getBoundingClientRect(), r = el.getBoundingClientRect();
  const L = r.left - base.left, T = r.top - base.top, W = r.width, H = r.height;
  return {L, T, W, H, R: L + W, B: T + H, cx: L + W / 2, cy: T + H / 2};
}

function drawRoutes() {
  const wrap = $('grid').parentElement, roadsSvg = $('roads'), svg = $('routes');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  [roadsSvg, svg].forEach(el => { el.setAttribute('width', W); el.setAttribute('height', H); });

  const r0 = rectOf(0), r1 = rectOf(1), r2 = rectOf(2), r3 = rectOf(3);
  const c4 = rectOf(4), c8 = rectOf(8), c12 = rectOf(12);
  if (!r0 || !r1 || !r2 || !r3 || !c4 || !c8 || !c12) { roadsSvg.innerHTML = ''; svg.innerHTML = ''; return; }

  const g  = Math.max(3, r1.L - r0.R);
  const vx = [r0.L - g / 2, (r0.R + r1.L) / 2, (r1.R + r2.L) / 2, (r2.R + r3.L) / 2, r3.R + g / 2];
  const hy = [r0.T - g / 2, (r0.B + c4.T) / 2, (c4.B + c8.T) / 2, (c8.B + c12.T) / 2, c12.B + g / 2];
  const X0 = vx[0], X1 = vx[4], Y0 = hy[0], Y1 = hy[4];

  const seg = (x1, y1, x2, y2, sw, col, dash) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${sw}" stroke-linecap="butt"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

  let roads = '';
  vx.forEach(x => roads += seg(x, Y0, x, Y1, 2, '#5e6b7c', '8 11'));
  hy.forEach(y => roads += seg(X0, y, X1, y, 2, '#5e6b7c', '8 11'));
  roadsSvg.innerHTML = roads;

  const defs = `<defs>
    <marker id="rha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="#e6a23c" stroke-width="1.9"/></marker>
    <marker id="rht" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="#3fb6a0" stroke-width="1.9"/></marker>
  </defs>`;

  let paths = '';
  S.grid.forEach((s, i) => {
    if (!s || s.type === 'shop' || s.target == null || !S.grid[s.target]) return;
    const A = rectOf(i), B = rectOf(s.target);
    if (!A || !B) return;
    const ac = i % 4, ar = (i / 4) | 0, bc = s.target % 4, br = (s.target / 4) | 0;
    const shop = S.grid[s.target].type === 'shop', col = shop ? '#e6a23c' : '#3fb6a0', mk = shop ? 'rha' : 'rht';
    let d;
    if (ac === bc) {
      if (Math.abs(ar - br) === 1) {
        d = ar < br ? `M ${A.cx} ${A.B} L ${A.cx} ${B.T}` : `M ${A.cx} ${A.T} L ${A.cx} ${B.B}`;
      } else {
        const Rx = (ac < 3) ? vx[ac + 1] : vx[ac], exitX = (ac < 3) ? A.R : A.L;
        const Ry = (ar < br) ? hy[br] : hy[br + 1], entryY = (ar < br) ? B.T : B.B;
        d = `M ${exitX} ${A.cy} L ${Rx} ${A.cy} L ${Rx} ${Ry} L ${B.cx} ${Ry} L ${B.cx} ${entryY}`;
      }
    } else if (ar === br) {
      if (Math.abs(bc - ac) === 1) {
        d = bc > ac ? `M ${A.R} ${A.cy} L ${B.L} ${B.cy}` : `M ${A.L} ${A.cy} L ${B.R} ${B.cy}`;
      } else {
        const Ry = hy[ar];
        d = `M ${A.cx} ${A.T} L ${A.cx} ${Ry} L ${B.cx} ${Ry} L ${B.cx} ${B.T}`;
      }
    } else {
      let Rx, exitX;
      if (bc > ac) { Rx = vx[ac + 1]; exitX = A.R; } else { Rx = vx[ac]; exitX = A.L; }
      let Ry, entryY;
      if (ar < br) { Ry = hy[br]; entryY = B.T; } else { Ry = hy[br + 1]; entryY = B.B; }
      d = `M ${exitX} ${A.cy} L ${Rx} ${A.cy} L ${Rx} ${Ry} L ${B.cx} ${Ry} L ${B.cx} ${entryY}`;
    }
    paths += `<path class="flow" d="${d}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" marker-end="url(#${mk})"/>`;
  });
  svg.innerHTML = defs + paths;
}

export function positionMenu(i) {
  const el = document.querySelector('.slot[data-i="' + i + '"]');
  const m = $('menu');
  if (!el) return;
  const r = el.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight, pad = 8;
  let left = r.right + 10;
  if (left + mw > innerWidth - pad) left = r.left - mw - 10;
  left = Math.max(pad, Math.min(left, innerWidth - mw - pad));
  let top = r.top;
  top = Math.max(pad, Math.min(top, innerHeight - mh - pad));
  m.style.left = left + 'px';
  m.style.top  = top  + 'px';
}

export function renderMenu() {
  const m = $('menu');
  if (ui.menuFor == null || ui.routeMode != null || ui.moveFrom != null) { m.hidden = true; m.innerHTML = ''; return; }
  const i = ui.menuFor, s = S.grid[i];
  let html;
  if (!S.open[i]) {
    const uc = unlockCost();
    html = `<div class="mhead">Locked plot</div>
      <button class="go" data-act="unlock" data-cost="${uc}" ${S.cash < uc ? 'disabled' : ''}>🔓 Unlock · $${money(uc)}</button>
      <div class="mnote">Expands your buildable area. Cost rises with each unlock.</div>`;
  } else if (!s) {
    let btns = '';
    for (const k of ['shop', 'mine', 'tapper', 'smelter', 'wheelworks', 'bodyshop', 'assembler']) {
      const b = BUILDINGS[k], c = cost(k);
      btns += `<button class="placebtn" data-place="${k}" data-cost="${c}" ${S.cash < c ? 'disabled' : ''}>
        <span><span class="pemoji">${ICON[k]}</span><span class="tag ${tierTag(b)}">${k === 'shop' ? 'shop' : 'T' + b.depth}</span> ${b.name} · $${c}</span>
        <span class="pc">${k === 'shop' ? 'sells ' + b.rate + '/s' : ((b.inputs.length ? b.inputs.map(x => { const q = inputQty(k, x); return (q > 1 ? qtyText(q) + '×' : '') + RESICON[x.res]; }).join(' + ') + ' → ' : ' → ') + RESICON[b.out] + ' · ' + b.rate + '/s')}</span></button>`;
    }
    html = `<div class="mhead">Build here</div><div class="placegrid col">${btns}</div>`;
  } else {
    const b = BUILDINGS[s.type], sc = speedCost(s.type), n = copies(s.type), next = (b.rate * (1 + 0.25 * (S.speed[s.type] + 1))).toFixed(1);
    const upLabel = (s.type === 'shop' ? 'sell rate' : 'speed') + ` → ${next}/s · $${sc}`;
    const eLevel = S.efficiency[s.type] || 0, ec = efficiencyCost(s.type);
    const eMax = isEfficiencyMaxed(s.type);
    const effBtn = hasEfficiencyUpgrade(s.type)
      ? `<button class="go" data-act="eff" data-cost="${ec}" data-max="${eMax}" ${S.cash < ec || eMax ? 'disabled' : ''}>${eMax ? `Efficiency max · -${Math.round(EFFICIENCY_STEP * EFFICIENCY_MAX_LEVEL * 100)}% inputs` : `⬇ Upgrade efficiency · -${Math.round(EFFICIENCY_STEP * 100)}% inputs · $${ec}`}</button>`
      : '';
    const qc = qualityCost(s.type);
    const qInputs = b.inputs.length ? `, +${Math.round(QUALITY_INPUT_STEP * 100)}% inputs` : '';
    const qualBtn = s.type === 'shop'
      ? ''
      : `<button class="go" data-act="qual" data-cost="${qc}" ${S.cash < qc ? 'disabled' : ''}>✦ Upgrade quality · +${Math.round(QUALITY_VALUE_STEP * 100)}% value${qInputs} · $${qc}</button>`;
    html = `<div class="mhead">${b.name}${n > 1 ? ` · all ${n}` : ''}<span class="mnow">${s.type === 'shop' ? 'sell point' : 'now ' + rateOf(s).toFixed(2) + '/s'}</span></div>
      <button class="go" data-act="up" data-cost="${sc}" ${S.cash < sc ? 'disabled' : ''}>⏫ Upgrade ${upLabel}</button>
      ${effBtn}
      ${qualBtn}
      ${s.type === 'shop' ? '' : `<button data-act="route">↗ Set route</button>`}
      <button data-act="move">✥ Move (${MOVE_COOLDOWN}s downtime)</button>
      <button class="danger" data-act="remove">✕ Remove</button>`;
  }
  m.innerHTML = html; m.hidden = false; positionMenu(i);
}

export function renderHint() {
  const el = $('hint');
  if (ui.routeMode != null) {
    if (!S.grid[ui.routeMode]) { clearUiState(); el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = `<span>Routing <b>${BUILDINGS[S.grid[ui.routeMode].type].short}</b> — click a highlighted building or shop.</span><button data-h="cancel">Cancel</button>`;
  } else if (ui.moveFrom != null) {
    if (!S.grid[ui.moveFrom]) { clearUiState(); el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = `<span>Moving <b>${BUILDINGS[S.grid[ui.moveFrom].type].short}</b> — click an open empty plot.</span><button data-h="cancel">Cancel</button>`;
  } else {
    el.hidden = true; el.innerHTML = '';
  }
}

export function renderBottleneck() {
  const el = $('bottleneck');
  if (firstShop() < 0) { el.innerHTML = '<b>No shop placed.</b> Nothing sells until you place a Shop and route a part to it.'; return; }
  let worst = null;
  S.grid.forEach((s, i) => { if (!s || s.cooldown > 0) return; if (!worst || (s.load || 0) < worst.s.load) worst = {i, s, b: BUILDINGS[s.type]}; });
  if (!worst) { el.innerHTML = 'Place a producer to begin.'; return; }
  const {i, s, b} = worst;
  if (s.type === 'shop') {
    if (s.load >= 0.9) { el.innerHTML = `<b>Shop maxed at 100%.</b> It can't sell fast enough — upgrade its sell rate or add another shop.`; return; }
  }
  if ((s.load || 0) >= 0.85) { el.innerHTML = `<b>Line balanced.</b> Lowest is ${b.short} at ${Math.round((s.load || 0) * 100)}%. To grow income: push a part one stage deeper, scale a slow stage, or upgrade the shop.`; return; }
  let why = '';
  if (s.type === 'shop') {
    why = `it isn't being fed — route more parts into it.`;
  } else if (s.target == null) {
    why = `it's <b>unrouted</b> — set a route to a downstream building or a shop.`;
  } else if (b.inputs.length) {
    const low = b.inputs.filter(x => (s.inbuf[x.res] || 0) < inputQty(s.type, x));
    if (low.length) why = `starved of <b>${low.map(x => x.res).join(', ')}</b> — route ${low.length > 1 ? 'producers' : 'a producer'} into it, or add/upgrade upstream capacity.`;
    else why = `its output is backing up — its target can't take more (upgrade or duplicate the target, or upgrade the shop).`;
  } else {
    const t = S.grid[s.target];
    if (t && t.type === 'shop' && (t.load || 0) >= 0.9) why = `its shop is maxed — upgrade the shop or add another.`;
    else why = `its target can't accept more — that downstream stage is the limit.`;
  }
  el.innerHTML = `<b>${b.short} at ${Math.round((s.load || 0) * 100)}%.</b> ${why}`;
}

export function renderLive() {
  $('cash').textContent = money(S.cash);
  const r = $('rate');
  r.textContent = (S.cashRate >= 0 ? '+' : '') + S.cashRate.toFixed(2);
  r.style.color = S.cashRate >= 0 ? 'var(--teal)' : 'var(--red)';

  let rebuild = false;
  document.querySelectorAll('.slot[data-i]').forEach(el => {
    const s = S.grid[+el.dataset.i]; if (!s) return;
    const lf = el.querySelector('.lf');
    if (lf) {
      const frac = clamp01(s.runF), c = loadColor(frac);
      lf.style.width = Math.round(frac * 100) + '%'; lf.style.background = c;
      const lp = el.querySelector('.lp'); if (lp) { lp.textContent = runText(s); lp.style.color = c; }
      const fe = el.querySelector('.feed'); if (fe) fe.innerHTML = feedHTML(s);
    }
    const cool = el.querySelector('.cool');
    if (s.cooldown > 0) { if (cool) cool.textContent = 'MOVING ' + s.cooldown.toFixed(1) + 's'; else rebuild = true; }
    else if (cool) { rebuild = true; }
  });
  document.querySelectorAll('#menu [data-cost]').forEach(btn => { btn.disabled = btn.dataset.max === 'true' || S.cash < +btn.dataset.cost; });
  renderBottleneck();
  if (rebuild) render();
}
