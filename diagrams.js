'use strict';
/* Small SVG renderers. Each renderer gets a data object and returns the inner
   markup for one 340 x 220 drawing. Colours come from CSS classes:
   c1..c6 = tinted box, f1..f6 = solid fill, s1..s6 = stroke colour. */

const W = 340, H = 220;
const E = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = v => Math.round(v * 10) / 10;
const sum = a => a.reduce((s, v) => s + v, 0);

/* ---------- primitives ---------- */

function T(x, y, s, o = {}) {
  const lines = String(s).split('\n'), lh = o.lh || 11.5, y0 = y - (lines.length - 1) * lh / 2;
  const rot = o.rot ? ` transform="rotate(${o.rot} ${f(x)} ${f(y)})"` : '';
  return lines.map((l, i) =>
    `<text x="${f(x)}" y="${f(y0 + i * lh)}" text-anchor="${o.a || 'middle'}" class="${o.cls || 't'}"${rot}>${E(l)}</text>`).join('');
}
const R = (x, y, w, h, cls, rx = 5) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" rx="${rx}" class="${cls}"/>`;
const B = (x, y, w, h, label, c = 1, rx = 5, tc) => R(x, y, w, h, 'c' + c, rx) + T(x + w / 2, y + h / 2, label, { cls: tc });
const L = (x1, y1, x2, y2, arrow, cls = 'ln') =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${cls}"${arrow ? ' marker-end="url(#ah)"' : ''}/>`;
const pts = p => p.map(q => f(q[0]) + ',' + f(q[1])).join(' ');
const PL = (p, arrow, cls = 'ln', marker = 'ah') =>
  `<polyline points="${pts(p)}" class="${cls}"${arrow ? ` marker-end="url(#${marker})"` : ''}/>`;
const PG = (p, cls) => `<polygon points="${pts(p)}" class="${cls}"/>`;
const C = (x, y, r, cls) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" class="${cls}"/>`;

/* Point on the border of node n (box or circle) in the direction of (tx, ty). */
function edgePt(n, tx, ty, pad = 2) {
  let dx = tx - n.x, dy = ty - n.y; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
  const t = n.r ? n.r : Math.min(dx ? n.w / 2 / Math.abs(dx) : 1e9, dy ? n.h / 2 / Math.abs(dy) : 1e9);
  return [n.x + dx * (t + pad), n.y + dy * (t + pad)];
}
/* Straight link between two nodes, with an optional parallel offset. */
function link(A, Bn, o = {}) {
  const len = Math.hypot(Bn.x - A.x, Bn.y - A.y) || 1, px = (Bn.y - A.y) / len, py = -(Bn.x - A.x) / len, off = o.off || 0;
  const [x1, y1] = edgePt(A, Bn.x, Bn.y), [x2, y2] = edgePt(Bn, A.x, A.y, o.arrow === false ? 2 : 3);
  return {
    svg: L(x1 + px * off, y1 + py * off, x2 + px * off, y2 + py * off, o.arrow !== false, o.cls),
    mx: (x1 + x2) / 2 + px * off, my: (y1 + y2) / 2 + py * off, px, py
  };
}
const sideAnchor = px => Math.abs(px) > .35 ? (px > 0 ? 'start' : 'end') : 'middle';

function legend(items, x, y) {
  let o = '';
  items.forEach(([name, c]) => { o += R(x, y - 4, 8, 8, 'f' + c, 2) + T(x + 12, y, name, { a: 'start', cls: 't ts' }); x += 26 + name.length * 5; });
  return o;
}
function axisY(x0, x1, y0, y1, min, max, step, fmt = v => v) {
  let o = '';
  for (let v = min; v <= max + 1e-9; v += step) {
    const y = y1 - (y1 - y0) * (v - min) / (max - min);
    o += L(x0, y, x1, y, false, v === min ? 'axis' : 'grid') + T(x0 - 5, y, fmt(v), { a: 'end', cls: 't ts' });
  }
  return o;
}
/* Repeatable pseudo-random points near the curve y = fn(x). */
function cloud(seed, n, xa, xb, fn, noise, c = 1) {
  let s = seed >>> 0;
  const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  return Array.from({ length: n }, () => { const x = xa + (xb - xa) * r(); return [x, fn(x) + (r() + r() + r() - 1.5) * noise, c]; });
}

/* ---------- process and time ---------- */

/* Boxes and arrows with right-angle routes. Used for flowcharts and block diagrams.
   node: [id, x, y, label, kind, colour, w, h]   edge: [from, to, label, route, labelPos] */
function graph(d) {
  const N = {};
  d.nodes.forEach(([id, x, y, label, kind = 'step', c, w, h]) => {
    N[id] = { x, y, label, kind, c, w: w || (kind === 'dec' ? 98 : 88), h: h || (kind === 'dec' ? 44 : kind === 'step' ? 30 : 26) };
  });
  let out = '';
  d.edges.forEach(([a, b, label, route, lp]) => {
    const A = N[a], Bn = N[b], sx = Math.sign(Bn.x - A.x), sy = Math.sign(Bn.y - A.y); let p;
    if (Array.isArray(route)) p = route;
    else if (route === 'hv') p = [[A.x + sx * A.w / 2, A.y], [Bn.x, A.y], [Bn.x, Bn.y - sy * (Bn.h / 2 + 1)]];
    else if (route === 'vh') p = [[A.x, A.y + sy * A.h / 2], [A.x, Bn.y], [Bn.x - sx * (Bn.w / 2 + 1), Bn.y]];
    else if (Math.abs(A.x - Bn.x) < 1) p = [[A.x, A.y + sy * A.h / 2], [Bn.x, Bn.y - sy * (Bn.h / 2 + 1)]];
    else p = [[A.x + sx * A.w / 2, A.y], [Bn.x - sx * (Bn.w / 2 + 1), A.y]];
    out += PL(p, true);
    if (label) {
      const horiz = Math.abs(p[1][1] - p[0][1]) < 1;
      const dir = Math.sign(p[1][0] - p[0][0]);
      const pos = lp || (horiz ? [p.length === 2 ? (p[0][0] + p[1][0]) / 2 - dir * 3 : p[0][0] + dir * 13, p[0][1] - 7] : [p[0][0] + 6, p[0][1] + Math.sign(p[1][1] - p[0][1]) * 9]);
      out += T(pos[0], pos[1], label, { cls: 't ts hl', a: horiz || lp ? 'middle' : 'start' });
    }
  });
  Object.values(N).forEach(n => {
    if (n.kind === 'dec') out += PG([[n.x, n.y - n.h / 2], [n.x + n.w / 2, n.y], [n.x, n.y + n.h / 2], [n.x - n.w / 2, n.y]], 'c2') + T(n.x, n.y, n.label);
    else if (n.kind === 'step') out += B(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, n.label, n.c || 1);
    else out += B(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, n.label, n.c || (n.kind === 'start' ? 3 : 4), 13);
  });
  return out;
}

/* lanes: [name], cols: number, steps: [lane, col, label] in sequence */
function swim(d) {
  const n = d.lanes.length, top = 6, lh = (H - 12) / n, lx = 70, cw = (W - 4 - lx) / d.cols, bw = 56, bh = 28;
  let out = '';
  d.lanes.forEach((name, i) => {
    out += R(4, top + i * lh, W - 8, lh, 'lane', 0) + R(4, top + i * lh, lx - 4, lh, 'lanehd', 0) + T(4 + (lx - 4) / 2, top + (i + .5) * lh, name, { cls: 't tb' });
  });
  const S = d.steps.map(([lane, col, label]) => ({ x: lx + cw * (col + .5), y: top + (lane + .5) * lh, lane, label }));
  S.slice(1).forEach((b, i) => {
    const a = S[i], sy = Math.sign(b.y - a.y);
    out += sy === 0 ? L(a.x + bw / 2, a.y, b.x - bw / 2 - 1, b.y, true)
      : PL([[a.x + bw / 2, a.y], [b.x, a.y], [b.x, b.y - sy * (bh / 2 + 1)]], true);
  });
  S.forEach(s => out += B(s.x - bw / 2, s.y - bh / 2, bw, bh, s.label, s.lane + 1));
  return out;
}

/* actors: [name], msgs: [from, to, label, isReply] */
function seq(d) {
  const n = d.actors.length, xs = d.actors.map((_, i) => W * (i + .5) / n);
  const step = Math.min(30, (H - 70) / Math.max(1, d.msgs.length - 1));
  let out = '';
  xs.forEach((x, i) => out += L(x, 30, x, H - 6, false, 'ln dash') + B(x - 42, 6, 84, 24, d.actors[i], i + 1));
  d.msgs.forEach(([a, b, label, reply], i) => {
    const y = 58 + i * step, x1 = xs[a], x2 = xs[b];
    out += L(x1, y, x2 - Math.sign(x2 - x1), y, true, reply ? 'ln dash' : 'ln') + T((x1 + x2) / 2, y - 7, label, { cls: 't ts hl' });
  });
  return out;
}

/* states: [id, x, y, label, colour], trans: [from, to, label, offset], init: [x, y, id] */
function state(d) {
  const N = {}; let out = '';
  d.states.forEach(([id, x, y, label, c = 1]) => N[id] = { x, y, w: 76, h: 26, label, c });
  d.trans.forEach(([a, b, label, off = 0]) => {
    const k = link(N[a], N[b], { off });
    out += k.svg + T(k.mx + k.px * 9, k.my + k.py * 9, label, { cls: 't ts hl', a: sideAnchor(k.px) });
  });
  if (d.init) { const [x, y, id] = d.init; out += link({ x, y, r: 4 }, N[id]).svg + C(x, y, 4, 'dot'); }
  Object.values(N).forEach(n => out += B(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, n.label, n.c, 13));
  return out;
}

/* units: [label], tasks: [label, start, end, colour] */
function gantt(d) {
  const x0 = 92, pw = W - x0 - 8, n = d.units.length, uw = pw / n, top = 26, rh = Math.min(42, (H - top - 8) / d.tasks.length);
  let out = '';
  for (let i = 0; i <= n; i++) out += L(x0 + uw * i, top - 4, x0 + uw * i, H - 6, false, 'grid');
  d.units.forEach((u, i) => out += T(x0 + uw * (i + .5), 12, u, { cls: 't ts' }));
  d.tasks.forEach(([label, a, b, c], i) => {
    const y = top + rh * (i + .5);
    out += T(x0 - 8, y, label, { a: 'end' }) + R(x0 + a * uw + 1, y - 7, (b - a) * uw - 2, 14, 'f' + c, 3);
  });
  return out;
}

/* ev: [when, what] */
function timeline(d) {
  const y = 110, n = d.ev.length, xa = 46, xb = W - 50;
  let out = L(12, y, W - 12, y, true, 'ln thick');
  d.ev.forEach(([when, what], i) => {
    const x = xa + (xb - xa) * i / (n - 1), up = i % 2 === 0, c = i % 6 + 1, half = (what.split('\n').length - 1) * 5.75;
    out += L(x, y, x, up ? y - 34 : y + 30, false, 'ln') + C(x, y, 5, 'f' + c + ' ring')
      + T(x, up ? y - 61 - 2 * half : y + 40, when, { cls: 't tb' }) + T(x, up ? y - 46 - half : y + 55 + half, what, { cls: 't ts' });
  });
  return out;
}

/* items: [label], center: text */
function cycle(d) {
  const n = d.items.length, cx = 170, cy = 110, rx = 112, ry = 78;
  const N = d.items.map((label, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), w: 88, h: 28, label }; });
  let out = '';
  N.forEach((a, i) => {
    const b = N[(i + 1) % n], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, qx = mx + (mx - cx) * .38, qy = my + (my - cy) * .38;
    const [x1, y1] = edgePt(a, qx, qy), [x2, y2] = edgePt(b, qx, qy, 3);
    out += `<path d="M${f(x1)},${f(y1)} Q${f(qx)},${f(qy)} ${f(x2)},${f(y2)}" class="ln" marker-end="url(#ah)"/>`;
  });
  N.forEach((p, i) => out += B(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, p.label, i % 6 + 1, 14));
  if (d.center) out += T(cx, cy, d.center, { cls: 't ts' });
  return out;
}

/* ---------- structure ---------- */

/* root: [label, [children]] */
function tree(d) {
  let leaves = 0, maxD = 0; const all = [];
  const walk = (n, depth) => {
    const kids = (n[1] || []).map(k => walk(k, depth + 1));
    const node = { label: n[0], depth, kids, span: kids.length ? sum(kids.map(k => k.span)) : 1, pos: kids.length ? (kids[0].pos + kids[kids.length - 1].pos) / 2 : leaves++ };
    maxD = Math.max(maxD, depth); all.push(node); return node;
  };
  walk(d.root, 0);
  const lw = (W - 8) / leaves, bh = 24, gap = (H - 20 - bh) / maxD;
  all.forEach(n => { n.x = 4 + lw * (n.pos + .5); n.y = 10 + bh / 2 + n.depth * gap; n.w = Math.min(n.span * lw - 6, 94); });
  let out = '';
  all.forEach(n => n.kids.forEach(k => { const my = n.y + gap / 2; out += PL([[n.x, n.y + bh / 2], [n.x, my], [k.x, my], [k.x, k.y - bh / 2]]); }));
  all.forEach(n => out += B(n.x - n.w / 2, n.y - bh / 2, n.w, bh, n.label, n.depth + 1, 5, d.mono ? 't tm' : 't'));
  return out;
}

/* center: text, branches: [name, [leaf, leaf]] (four branches) */
function mind(d) {
  const cx = 170, cy = 110, slots = [[86, 62, -1], [254, 62, -1], [86, 158, 1], [254, 158, 1]];
  let out = '';
  d.branches.forEach(([name, leaves], i) => {
    const [bx, by, dir] = slots[i], c = i + 1;
    out += `<path d="M${cx},${cy} Q${(cx + bx) / 2},${by} ${bx},${by}" class="ln thick s${c}"/>`;
    leaves.forEach((lf, j) => {
      const lx = bx + (j ? 42 : -42), ly = by + dir * 36;
      out += `<path d="M${bx},${by} Q${lx},${by + dir * 12} ${lx},${ly - dir * 8}" class="ln s${c}"/>` + T(lx, ly, lf, { cls: 't ts' });
    });
    out += B(bx - 40, by - 12, 80, 24, name, c, 12);
  });
  return out + `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="24" class="cn"/>` + T(cx, cy, d.center, { cls: 't tb' });
}

/* nodes: [x, y, label, colour, radius, labelPos], links: [a, b] */
function net(d) {
  const N = d.nodes.map(([x, y, label, c = 1, r = 12, lp = 'b']) => ({ x, y, label, c, r, lp }));
  let out = '';
  d.links.forEach(([a, b]) => out += L(N[a].x, N[a].y, N[b].x, N[b].y));
  N.forEach(n => {
    out += C(n.x, n.y, n.r, 'c' + n.c);
    if (n.lp === 'in') out += T(n.x, n.y, n.label, { cls: 't ts tk' });
    else if (n.lp === 'r') out += T(n.x + n.r + 5, n.y, n.label, { cls: 't ts', a: 'start' });
    else if (n.lp === 'l') out += T(n.x - n.r - 5, n.y, n.label, { cls: 't ts', a: 'end' });
    else out += T(n.x, n.y + (n.lp === 't' ? -1 : 1) * (n.r + 9), n.label, { cls: 't ts' });
  });
  return out;
}

/* ents: [x, y, name, [fields], colour], rels: [a, b, cardA, cardB, verb] */
function er(d) {
  const N = d.ents.map(([x, y, name, attrs, c = 1]) => ({ x, y, w: 88, h: 25 + attrs.length * 13, name, attrs, c }));
  let out = '';
  d.rels.forEach(([a, b, ca, cb, verb]) => {
    const A = N[a], Bn = N[b], [x1, y1] = edgePt(A, Bn.x, Bn.y, 0), [x2, y2] = edgePt(Bn, A.x, A.y, 0);
    const len = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / len, dy = (y2 - y1) / len, px = dy, py = -dx;
    const card = (n, x, y, s) => {
      const gapTo = q => Math.max(Math.abs(q[0] - n.x) - n.w / 2, Math.abs(q[1] - n.y) - n.h / 2);
      const c1 = [x + px * 9, y + py * 9], c2 = [x - px * 9, y - py * 9], q = gapTo(c1) >= gapTo(c2) ? c1 : c2;
      return T(q[0], q[1], s, { cls: 't tb' });
    };
    out += L(x1, y1, x2, y2) + card(A, x1 + dx * 13, y1 + dy * 13, ca) + card(Bn, x2 - dx * 13, y2 - dy * 13, cb);
    if (verb) out += T((x1 + x2) / 2 - px * 8, (y1 + y2) / 2 - py * 8, verb, { cls: 't ts', a: sideAnchor(-px) });
  });
  N.forEach(n => {
    const x = n.x - n.w / 2, y = n.y - n.h / 2;
    out += R(x, y, n.w, n.h, 'c' + n.c, 4) + L(x, y + 20, x + n.w, y + 20, false, 'ln s' + n.c) + T(n.x, y + 10, n.name, { cls: 't tb' })
      + n.attrs.map((a, i) => T(x + 8, y + 23 + 13 * (i + .5), a, { a: 'start', cls: 't tm' })).join('');
  });
  return out;
}

/* classes: [x, top, name, [data], [operations], colour], rels: [a, b, 'inh' | 'assoc', label] */
function classd(d) {
  const N = d.classes.map(([x, top, name, attrs, ops, c = 1]) => {
    const h = 20 + (attrs.length ? attrs.length * 12 + 6 : 0) + (ops.length ? ops.length * 12 + 6 : 0);
    return { x, top, y: top + h / 2, w: 108, h, name, attrs, ops, c };
  });
  let out = '';
  d.rels.forEach(([a, b, kind, label]) => {
    const A = N[a], P = N[b];
    if (kind === 'inh') { const my = (A.top + P.top + P.h) / 2; out += PL([[A.x, A.top], [A.x, my], [P.x, my], [P.x, P.top + P.h + 1]], true, 'ln', 'tri'); }
    else { const k = link(A, P); out += k.svg + (label ? T(k.mx, k.my - 9, label, { cls: 't ts' }) : ''); }
  });
  N.forEach(n => {
    const x = n.x - n.w / 2; let y = n.top + 20;
    out += R(x, n.top, n.w, n.h, 'c' + n.c, 3) + T(n.x, n.top + 10, n.name, { cls: 't tb' });
    [n.attrs, n.ops].forEach(rows => {
      if (!rows.length) return;
      out += L(x, y, x + n.w, y, false, 'ln s' + n.c);
      rows.forEach((r, i) => out += T(x + 6, y + 3 + 12 * (i + .5), r, { a: 'start', cls: 't tm' }));
      y += rows.length * 12 + 6;
    });
  });
  return out;
}

/* An object and its parts, each part a button (a page shows its text when tapped).
   outline: [x, y, w, h, label] (the body, centre), notes: [x, y, text],
   parts: [label, x, y, w, h, colour, text, shape, labelPos]
   shape: 'box' (default), 'round', 'dot' (circle, w = diameter), 'pins' (a row or column of dots)
   colour: 0 = plain (default), 1-6; labelPos: 'in' (default; 'b' for pins), 'b', 't', 'l', 'r', 'none' */
function parts(d) {
  let out = '';
  if (d.outline) { const [x, y, w, h, label] = d.outline; out += R(x - w / 2, y - h / 2, w, h, 'body', 8) + (label ? T(x - w / 2 + 7, y + h / 2 - 9, label, { a: 'start', cls: 't ts' }) : ''); }
  (d.notes || []).forEach(([x, y, s]) => out += T(x, y, s, { cls: 't ts' }));
  d.parts.forEach(([label, x, y, w, h, c = 0, , shape = 'box', lp], i) => {
    const cls = c ? 'c' + c : 'pp', x0 = x - w / 2, y0 = y - h / 2;
    lp = lp || (shape === 'pins' ? 'b' : 'in');
    let g = R(x0 - 3, y0 - 3, w + 6, h + 6, 'hit', 0);
    if (shape === 'dot') g += C(x, y, w / 2, cls);
    else if (shape === 'pins') {
      const across = w >= h, len = across ? w : h, n = Math.max(1, Math.floor(len / 9)), st = len / n;
      for (let k = 0; k < n; k++) g += C(across ? x0 + st * (k + .5) : x, across ? y : y0 + st * (k + .5), 2.8, cls);
    } else g += R(x0, y0, w, h, cls, shape === 'round' ? Math.min(h / 2, 9) : 3);
    const ex = shape === 'dot' ? w / 2 : 0;
    if (lp === 'in') g += T(x, y, label);
    else if (lp === 'b') g += T(x, y + (ex || h / 2) + 9, label, { cls: 't ts' });
    else if (lp === 't') g += T(x, y - (ex || h / 2) - 9, label, { cls: 't ts' });
    else if (lp === 'r') g += T(x + (ex || w / 2) + 5, y, label, { a: 'start', cls: 't ts' });
    else if (lp === 'l') g += T(x - (ex || w / 2) - 5, y, label, { a: 'end', cls: 't ts' });
    out += `<g class="part" data-i="${i}" tabindex="0" role="button" aria-label="${E(String(label).replace(/\n/g, ' '))}">${g}</g>`;
  });
  return out;
}

/* ---------- concepts and analysis ---------- */

/* sets: [name] (two or three), only: [text], both: text, all: text */
function venn(d) {
  let out = '';
  if (d.sets.length === 2) {
    const xs = [128, 212], y = 120, r = 76;
    xs.forEach((x, i) => out += C(x, y, r, 'v' + (i ? 3 : 1)));
    out += T(100, 30, d.sets[0], { cls: 't tb' }) + T(240, 30, d.sets[1], { cls: 't tb' })
      + T(90, y, d.only[0]) + T(250, y, d.only[1]) + T(170, y, d.both, { cls: 't tb' });
  } else {
    const P = [[132, 82], [208, 82], [170, 144]], r = 56, cs = [1, 3, 2];
    P.forEach(([x, y], i) => out += C(x, y, r, 'v' + cs[i]));
    out += T(104, 14, d.sets[0], { cls: 't tb' }) + T(236, 14, d.sets[1], { cls: 't tb' }) + T(170, 211, d.sets[2], { cls: 't tb' })
      + T(106, 70, d.only[0]) + T(234, 70, d.only[1]) + T(170, 172, d.only[2])
      + L(170, 102, 262, 160, false, 'ln') + C(170, 102, 3.5, 'dot') + T(266, 162, d.all, { a: 'start', cls: 't tb' });
  }
  return out;
}

/* xl, yl: axis names, q: [top left, top right, bottom left, bottom right], pts: [x, y, label, colour] */
function quad(d) {
  const x0 = 24, y0 = 8, x1 = W - 8, y1 = H - 24, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, cs = [3, 4, 6, 2];
  let out = '';
  [[x0, y0], [mx, y0], [x0, my], [mx, my]].forEach(([x, y], i) => out += R(x, y, mx - x0, my - y0, 'qd c' + cs[i], 0));
  out += L(mx, y0, mx, y1, false, 'axis') + L(x0, my, x1, my, false, 'axis')
    + L(x0, y1, x1, y1, true, 'axis') + L(x0, y1, x0, y0, true, 'axis')
    + T(mx, H - 9, d.xl, { cls: 't ts' }) + T(10, my, d.yl, { cls: 't ts', rot: -90 })
    + T(x0 + 7, y0 + 11, d.q[0], { a: 'start', cls: 't tb' }) + T(x1 - 7, y0 + 11, d.q[1], { a: 'end', cls: 't tb' })
    + T(x0 + 7, y1 - 11, d.q[2], { a: 'start', cls: 't tb' }) + T(x1 - 7, y1 - 11, d.q[3], { a: 'end', cls: 't tb' });
  d.pts.forEach(([x, y, label]) => {
    const px = x0 + (x1 - x0) * x, py = y1 - (y1 - y0) * y, left = x > .6;
    out += C(px, py, 4, 'dot') + T(px + (left ? -8 : 8), py, label, { a: left ? 'end' : 'start', cls: 't ts' });
  });
  return out;
}

/* effect: text, cats: [name, [cause, cause]] (four categories) */
function fish(d) {
  const y = 110, hx = 262;
  let out = L(14, y, hx, y, true, 'ln thick') + B(hx + 2, y - 21, 72, 42, d.effect, 4, 5, 't tb');
  d.cats.forEach(([name, causes], i) => {
    const top = i % 2 === 0, bx = i < 2 ? 122 : 238, sx = bx - 44, sy = top ? 31 : 189, c = [1, 3, 5, 2][i];
    out += L(sx, sy, bx, y, false, 'ln');
    causes.forEach((cause, j) => { const t = .3 + j * .38; out += T(sx + (bx - sx) * t - 6, sy + (y - sy) * t, cause, { a: 'end', cls: 't ts' }); });
    out += B(sx - 38, top ? 9 : 189, 76, 22, name, c);
  });
  return out;
}

/* levels: [label] from top to bottom, notes: [text] */
function pyramid(d) {
  const n = d.levels.length, cx = d.notes ? 118 : 170, top = 10, bot = H - 8, hwT = 30, hwB = d.notes ? 108 : 150, lh = (bot - top) / n;
  const hw = y => hwT + (hwB - hwT) * (y - top) / (bot - top);
  let out = '';
  d.levels.forEach((label, i) => {
    const ya = top + i * lh, yb = ya + lh - 3;
    out += PG([[cx - hw(ya), ya], [cx + hw(ya), ya], [cx + hw(yb), yb], [cx - hw(yb), yb]], 'c' + (i % 6 + 1)) + T(cx, (ya + yb) / 2, label);
    if (d.notes) out += L(cx + hw((ya + yb) / 2) + 4, (ya + yb) / 2, 246, (ya + yb) / 2, false, 'grid') + T(250, (ya + yb) / 2, d.notes[i], { a: 'start', cls: 't ts' });
  });
  return out;
}

/* ---------- data and quantity ---------- */

/* cats, series: [{name, vals}], max, step, unit, hi: index, horiz */
function bars(d) {
  const u = d.unit || '', n = d.cats.length; let out = '';
  if (d.horiz) {
    const lx = 76, x1 = W - 40, rh = (H - 20) / n, bh = Math.min(20, rh * .62);
    d.cats.forEach((c, i) => {
      const y = 10 + rh * (i + .5), v = d.series[0].vals[i], w = (x1 - lx) * v / d.max;
      out += T(lx - 7, y, c, { a: 'end' }) + R(lx, y - bh / 2, w, bh, 'f' + (i === d.hi ? 4 : 1), 2) + T(lx + w + 6, y, v + u, { a: 'start', cls: 't ts' });
    });
    return out + L(lx, 8, lx, H - 8, false, 'axis');
  }
  const m = d.series.length, x0 = 36, x1 = W - 8, y0 = m > 1 ? 32 : 22, y1 = H - 26, gw = (x1 - x0) / n, bw = Math.min(36, gw * .72 / m);
  out += axisY(x0, x1, y0, y1, 0, d.max, d.step);
  d.cats.forEach((c, i) => {
    const gx = x0 + gw * (i + .5);
    out += T(gx, y1 + 12, c, { cls: 't ts' });
    d.series.forEach((s, k) => {
      const v = s.vals[i], h = (y1 - y0) * v / d.max;
      out += R(gx - bw * m / 2 + k * bw + 1, y1 - h, bw - 2, h, 'f' + (m > 1 ? [6, 1][k] || k + 1 : i === d.hi ? 4 : 1), 2);
      if (m === 1) out += T(gx, y1 - h - 8, v + u, { cls: 't ts' });
    });
  });
  if (m > 1) out += legend(d.series.map((s, k) => [s.name, [6, 1][k] || k + 1]), x0, 14);
  return out;
}

/* x: [label], series: [{name, vals, c}], max, step, every, limit: [value, label] */
function lines(d) {
  const multi = d.series.length > 1, x0 = 36, x1 = W - (multi ? 44 : 12), y0 = 14, y1 = H - 26, n = d.x.length;
  const X = i => x0 + 8 + (x1 - x0 - 14) * i / (n - 1), Y = v => y1 - (y1 - y0) * v / d.max;
  let out = axisY(x0, x1, y0, y1, 0, d.max, d.step);
  d.x.forEach((l, i) => { if (i % (d.every || 1) === 0) out += T(X(i), y1 + 12, l, { cls: 't ts' }); });
  if (d.limit) out += L(x0, Y(d.limit[0]), x1, Y(d.limit[0]), false, 'ln dash s4') + T(x1 - 4, Y(d.limit[0]) - 8, d.limit[1], { a: 'end', cls: 't ts' });
  d.series.forEach((s, k) => {
    const c = s.c || k + 1;
    out += PL(s.vals.map((v, i) => [X(i), Y(v)]), false, 'ln thick s' + c) + s.vals.map((v, i) => C(X(i), Y(v), 2.4, 'f' + c)).join('');
    if (multi) out += T(x1 + 2, Y(s.vals[n - 1]), s.name, { a: 'start', cls: 't ts' });
  });
  return out;
}

/* slices: [label, value], donut: centre text */
function pie(d) {
  const cx = 92, cy = 110, r = 76, tot = sum(d.slices.map(s => s[1])), n = d.slices.length;
  const P = a => f(cx + r * Math.cos(a)) + ',' + f(cy + r * Math.sin(a));
  let a = -Math.PI / 2, out = '';
  d.slices.forEach(([label, v], i) => {
    const b = a + 2 * Math.PI * v / tot, y = cy - (n - 1) * 11 + i * 22;
    out += `<path d="M${cx},${cy} L${P(a)} A${r},${r} 0 ${b - a > Math.PI ? 1 : 0} 1 ${P(b)}Z" class="sl f${i + 1}"/>`
      + R(194, y - 5, 10, 10, 'f' + (i + 1), 2) + T(210, y, label, { a: 'start' }) + T(W - 10, y, Math.round(v / tot * 100) + '%', { a: 'end', cls: 't tb' });
    a = b;
  });
  if (d.donut) out += C(cx, cy, r * .56, 'hole') + T(cx, cy, d.donut, { cls: 't tb' });
  return out;
}

/* pts: [x, y, colour], xr, yr: [min, max], xt, yt: ticks, xl, yl, trend: [x1, y1, x2, y2], note: [x, y, label] */
function scatter(d) {
  const x0 = 40, x1 = W - 12, y0 = 10, y1 = H - 32;
  const X = v => x0 + (x1 - x0) * (v - d.xr[0]) / (d.xr[1] - d.xr[0]);
  const Y = v => y1 - (y1 - y0) * (Math.min(d.yr[1], Math.max(d.yr[0], v)) - d.yr[0]) / (d.yr[1] - d.yr[0]);
  let out = '';
  d.yt.forEach(v => out += L(x0, Y(v), x1, Y(v), false, v === d.yr[0] ? 'axis' : 'grid') + T(x0 - 5, Y(v), v, { a: 'end', cls: 't ts' }));
  d.xt.forEach(v => out += T(X(v), y1 + 10, v, { cls: 't ts' }));
  out += L(x0, y0, x0, y1, false, 'axis') + T((x0 + x1) / 2, H - 7, d.xl, { cls: 't ts' }) + T(9, (y0 + y1) / 2, d.yl, { cls: 't ts', rot: -90 });
  if (d.trend) out += L(X(d.trend[0]), Y(d.trend[1]), X(d.trend[2]), Y(d.trend[3]), false, 'ln dash');
  d.pts.forEach(([x, y, c]) => out += C(X(x), Y(y), 3.2, 'pt f' + c));
  if (d.note) out += C(X(d.note[0]), Y(d.note[1]), 7, 'ln s4') + T(X(d.note[0]) - 11, Y(d.note[1]), d.note[2], { a: 'end', cls: 't ts' });
  return out;
}

/* bins: [count], e0: first edge, es: edge step, every, dec: decimals, max, step, xl, marks */
function hist(d) {
  const x0 = 36, x1 = W - 12, y0 = 12, y1 = H - 36, n = d.bins.length, bw = (x1 - x0) / n;
  let out = axisY(x0, x1, y0, y1, 0, d.max, d.step);
  d.bins.forEach((v, i) => { const h = (y1 - y0) * v / d.max; out += R(x0 + i * bw + .5, y1 - h, bw - 1, h, 'f' + (d.c || 1), 1); });
  for (let i = 0; i <= n; i += d.every || 1) { const v = d.e0 + d.es * i; out += L(x0 + i * bw, y1, x0 + i * bw, y1 + 3, false, 'axis') + T(x0 + i * bw, y1 + 11, d.dec ? v.toFixed(d.dec) : v, { cls: 't ts' }); }
  return out + T((x0 + x1) / 2, H - 7, d.xl, { cls: 't ts' });
}

/* groups: [label, low, q1, median, q3, high, [outliers]], min, max, step */
function boxp(d) {
  const x0 = 40, x1 = W - 10, y0 = 12, y1 = H - 26, n = d.groups.length, gw = (x1 - x0) / n, bw = Math.min(44, gw * .5);
  const Y = v => y1 - (y1 - y0) * (v - d.min) / (d.max - d.min);
  let out = axisY(x0, x1, y0, y1, d.min, d.max, d.step);
  d.groups.forEach(([label, lo, q1, med, q3, hi, outl = []], i) => {
    const x = x0 + gw * (i + .5), c = i % 6 + 1;
    out += L(x, Y(lo), x, Y(hi), false, 'ln') + L(x - bw / 4, Y(lo), x + bw / 4, Y(lo), false, 'ln') + L(x - bw / 4, Y(hi), x + bw / 4, Y(hi), false, 'ln')
      + R(x - bw / 2, Y(q3), bw, Y(q1) - Y(q3), 'c' + c, 2) + L(x - bw / 2, Y(med), x + bw / 2, Y(med), false, 'ln thick s' + c)
      + outl.map(v => C(x, Y(v), 2.6, 'ln s' + c)).join('') + T(x, y1 + 12, label, { cls: 't ts' });
  });
  return out;
}

/* rows, cols: [label], vals: matrix, lw: label width, show: print the values, c: colour */
function heat(d) {
  const lx = d.lw || 40, top = 22, cw = (W - lx - 8) / d.cols.length, ch = (H - top - 8) / d.rows.length;
  const flat = d.vals.flat(), min = Math.min(...flat), max = Math.max(...flat);
  let out = d.cols.map((c, j) => T(lx + cw * (j + .5), 12, c, { cls: 't ts' })).join('');
  d.rows.forEach((r, i) => {
    out += T(lx - 6, top + ch * (i + .5), r, { a: 'end', cls: 't ts' });
    d.vals[i].forEach((v, j) => {
      const t = (v - min) / (max - min);
      out += `<rect x="${f(lx + cw * j + 1)}" y="${f(top + ch * i + 1)}" width="${f(cw - 2)}" height="${f(ch - 2)}" rx="2" class="f${d.c || 1}" fill-opacity="${f(.08 + .92 * t)}"/>`;
      if (d.show) out += T(lx + cw * (j + .5), top + ch * (i + .5), v, { cls: t > .55 ? 't tb ton' : 't tb' });
    });
  });
  return out;
}

/* axes: [label], max, series: [{name, vals, c}] */
function radar(d) {
  const cx = 170, cy = 114, Rr = 70, n = d.axes.length;
  const P = (i, t) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Rr * t * Math.cos(a), cy + Rr * t * Math.sin(a)]; };
  let out = '';
  [1 / 3, 2 / 3, 1].forEach(t => out += PG(d.axes.map((_, i) => P(i, t)), 'grid'));
  d.axes.forEach((label, i) => {
    const [x, y] = P(i, 1), [tx, ty] = P(i, 1.17), co = (tx - cx) / Rr;
    out += L(cx, cy, x, y, false, 'grid') + T(tx, ty, label, { cls: 't ts', a: Math.abs(co) < .3 ? 'middle' : co > 0 ? 'start' : 'end' });
  });
  d.series.forEach((s, k) => {
    const c = s.c || [1, 4][k], p = s.vals.map((v, i) => P(i, v / d.max));
    out += PG(p, 'rd f' + c + ' s' + c) + p.map(q => C(q[0], q[1], 2.4, 'f' + c)).join('');
  });
  if (d.series.length > 1) d.series.forEach((s, k) => out += legend([[s.name, s.c || [1, 4][k]]], 8, 12 + k * 14));
  return out;
}

/* items: [label, value], unit */
function treemap(d) {
  const items = d.items.map(([label, v], i) => ({ label, v, c: i % 6 + 1 })).sort((a, b) => b.v - a.v);
  let out = '';
  (function split(list, x, y, w, h) {
    if (list.length === 1) {
      const it = list[0];
      out += R(x + 1, y + 1, w - 2, h - 2, 'c' + it.c, 3);
      if (w > 46 && h > 30) out += T(x + w / 2, y + h / 2 - 6, it.label, { cls: w > 62 ? 't tb' : 't' }) + T(x + w / 2, y + h / 2 + 6, it.v + (d.unit || ''), { cls: 't ts' });
      else if (w > 26 && h > 14) out += T(x + w / 2, y + h / 2, it.label, { cls: 't ts' });
      return;
    }
    const tot = sum(list.map(i => i.v)); let acc = 0, k = 0;
    do { acc += list[k].v; k++; } while (k < list.length - 1 && acc + list[k].v <= tot / 2);
    const t = acc / tot;
    if (w >= h) { split(list.slice(0, k), x, y, w * t, h); split(list.slice(k), x + w * t, y, w * (1 - t), h); }
    else { split(list.slice(0, k), x, y, w, h * t); split(list.slice(k), x, y + h * t, w, h * (1 - t)); }
  })(items, 4, 4, W - 8, H - 8);
  return out;
}

/* stages: [label, value] */
function funnel(d) {
  const cx = 212, maxHw = 116, top = 10, n = d.stages.length, sh = (H - 20) / n, max = d.stages[0][1];
  const hw = v => Math.max(.1, v / max) * maxHw;
  let out = '';
  d.stages.forEach(([label, v], i) => {
    const a = hw(v), b = d.stages[i + 1] ? hw(d.stages[i + 1][1]) : a * .82, y = top + i * sh, my = y + sh / 2 - 1;
    out += PG([[cx - a, y], [cx + a, y], [cx + b, y + sh - 3], [cx - b, y + sh - 3]], 'c' + (i % 6 + 1))
      + T(cx, my, v, { cls: 't tb' }) + T(8, my - 6, label, { a: 'start' }) + T(8, my + 6, Math.round(v / max * 100) + '%', { a: 'start', cls: 't ts' });
  });
  return out;
}

/* left, right: [name, value], flows: [leftIndex, rightIndex, value] */
function sankey(d) {
  const xl = 80, xr = 250, nw = 9, gap = 8, tot = sum(d.left.map(n => n[1]));
  const sc = (H - 24 - gap * (Math.max(d.left.length, d.right.length) - 1)) / tot;
  const place = col => { let y = (H - (tot * sc + gap * (col.length - 1))) / 2; return col.map(([name, v]) => { const n = { name, v, y, h: v * sc, o: 0 }; y += n.h + gap; return n; }); };
  const Ls = place(d.left), Rs = place(d.right);
  let out = '';
  d.flows.forEach(([a, b, v]) => {
    const A = Ls[a], Bn = Rs[b], h = v * sc, y1 = A.y + A.o, y2 = Bn.y + Bn.o, x1 = xl + nw, mx = (x1 + xr) / 2;
    A.o += h; Bn.o += h;
    out += `<path d="M${x1},${f(y1)} C${mx},${f(y1)} ${mx},${f(y2)} ${xr},${f(y2)} L${xr},${f(y2 + h)} C${mx},${f(y2 + h)} ${mx},${f(y1 + h)} ${x1},${f(y1 + h)}Z" class="rb f${a + 1}"/>`;
  });
  const label = (n, x, a) => n.h >= 24 ? T(x, n.y + n.h / 2 - 6, n.name, { a }) + T(x, n.y + n.h / 2 + 6, n.v + (d.unit || ''), { a, cls: 't ts' }) : T(x, n.y + n.h / 2, n.name, { a });
  Ls.forEach((n, i) => out += R(xl, n.y, nw, n.h, 'f' + (i + 1), 2) + label(n, xl - 7, 'end'));
  Rs.forEach(n => out += R(xr, n.y, nw, n.h, 'fn', 2) + label(n, xr + nw + 7, 'start'));
  return out;
}

const RENDER = { graph, swim, seq, state, gantt, timeline, cycle, tree, mind, net, er, classd, parts, venn, quad, fish, pyramid, bars, lines, pie, scatter, hist, boxp, heat, radar, treemap, funnel, sankey };

/* Diagram types: id -> [name, renderer]. The id is also the anchor on the reference page. */
const REF = 'https://reservetempo.github.io/diagram-types/';
const DIAGRAMS = {
  flowchart: ['Flowchart', 'graph'], swimlane: ['Swimlane diagram', 'swim'], sequence: ['Sequence diagram', 'seq'],
  state: ['State diagram', 'state'], gantt: ['Gantt chart', 'gantt'], timeline: ['Timeline', 'timeline'], cycle: ['Cycle diagram', 'cycle'],
  tree: ['Tree diagram', 'tree'], 'mind-map': ['Mind map', 'mind'], block: ['Block diagram', 'graph'], network: ['Network diagram', 'net'],
  er: ['Entity-relationship diagram', 'er'], class: ['Class diagram', 'classd'], parts: ['Parts diagram', 'parts', 1],
  venn: ['Venn diagram', 'venn'], quadrant: ['Quadrant matrix', 'quad'], fishbone: ['Fishbone diagram', 'fish'], pyramid: ['Pyramid diagram', 'pyramid'],
  bar: ['Bar chart', 'bars'], line: ['Line chart', 'lines'], pie: ['Pie chart', 'pie'], scatter: ['Scatter plot', 'scatter'],
  histogram: ['Histogram', 'hist'], 'box-plot': ['Box plot', 'boxp'], 'heat-map': ['Heat map', 'heat'], radar: ['Radar chart', 'radar'],
  treemap: ['Treemap', 'treemap'], funnel: ['Funnel diagram', 'funnel'], sankey: ['Sankey diagram', 'sankey']
};
