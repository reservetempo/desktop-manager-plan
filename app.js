'use strict';
/* Builds the list from ITEMS, and opens one item at a time. */

const list = document.getElementById('list');
const find = document.getElementById('find');
const empty = document.getElementById('empty');
const byId = Object.fromEntries(ITEMS.map(t => [t.id, t]));
const unitEl = document.getElementById('unit');
const units = n => `${n} ${E(n === 1 ? unitEl.dataset.one || unitEl.textContent : unitEl.textContent)}`;
const capLabel = typeof CAPTION === 'string' ? CAPTION : 'Key point';

const typeName = ex => DIAGRAMS[ex.type][0];
/* The type name is a link to the reference page. A type that the page adds (third value in DIAGRAMS) has no link. */
const typeLink = ex => DIAGRAMS[ex.type][2] ? E(typeName(ex)) : `<a href="${REF}#${ex.type}" title="About this diagram type">${E(typeName(ex))}</a>`;
/* A parts diagram is a group of buttons in an open item; in the list picture its parts are not buttons. */
const draw = (ex, label) => {
  let body = RENDER[DIAGRAMS[ex.type][1]](ex.d);
  if (!label) body = body.replace(/ tabindex="0" role="button" aria-label="[^"]*"/g, '');
  const role = ex.type === 'parts' ? 'group' : 'img';
  return `<svg viewBox="0 0 ${W} ${H}"${label ? ` role="${role}" aria-label="${E(label)}"` : ' aria-hidden="true"'}>${body}</svg>`;
};
const partTag = (ex, c) => (ex.d.tags || {})[c || 0] || '';
const caption = ex => ex.type !== 'parts'
  ? `<figcaption><b>${E(capLabel)}:</b> ${E(ex.why)}</figcaption>`
  : `<figcaption class="pinfo" aria-live="polite"><div class="phd"><span class="ph"><b>${E(capLabel)}:</b> ${E(ex.why)} Tap a part to read what it does.</span>`
    + `<span class="pnav"><button type="button" class="pp-prev" aria-label="Previous part">‹</button><span class="pn">${ex.d.parts.length} parts</span>`
    + `<button type="button" class="pp-next" aria-label="Next part">›</button></span></div><div class="pb"></div></figcaption>`;

/* Shows part i of the parts diagram in figure fig. */
function showPart(fig, i) {
  const t = byId[fig.closest('.item').id], ex = t.ex[+fig.dataset.ex], n = ex.d.parts.length;
  i = (i + n) % n; fig.dataset.cur = i;
  const [name, , , , , c, text = ''] = ex.d.parts[i], tag = partTag(ex, c);
  fig.querySelectorAll('.part').forEach(g => g.classList.toggle('sel', +g.dataset.i === i));
  fig.querySelector('.ph').innerHTML = `<b>${E(String(name).replace(/\n/g, ' '))}</b>${tag ? `<span class="ptag">${E(tag)}</span>` : ''}`;
  fig.querySelector('.pb').innerHTML = String(text).split(/\n\s*\n/).map(p => `<p>${E(p)}</p>`).join('');
  fig.querySelector('.pn').textContent = `${i + 1} / ${n}`;
}

function buildList() {
  const cats = [...new Set(ITEMS.map(t => t.cat))];
  document.getElementById('count').textContent = ITEMS.length;
  list.innerHTML = cats.map((cat, ci) => {
    const items = ITEMS.filter(t => t.cat === cat);
    return `<section class="cat"><h2><span class="num">${String(ci + 1).padStart(2, '0')}</span>${E(cat)}<span class="n">${units(items.length)}</span></h2><ul>`
      + items.map(t => {
        const words = [t.name, t.tag, ...t.ex.map(e => typeName(e) + ' ' + e.title)].join(' ').toLowerCase();
        return `<li class="item" id="${t.id}" data-q="${E(words)}">`
          + `<button class="row" type="button" aria-expanded="false" aria-controls="p-${t.id}">`
          + `<span class="thumb">${draw(t.ex[0])}</span>`
          + `<span><span class="name">${E(t.name)}</span><span class="tag">${E(t.tag)}</span></span>`
          + `<span class="chev" aria-hidden="true"></span></button>`
          + `<div class="panel" id="p-${t.id}" hidden></div></li>`;
      }).join('') + '</ul></section>';
  }).join('');
}

function panelHtml(t) {
  const links = Array.isArray(t.links) && t.links.length
    ? '<p class="links"><span class="k">Read the source</span>' + t.links.map(([label, url]) =>
        `<a href="${E(url)}" target="_blank" rel="noopener">${E(label)}</a>`).join(' · ') + '</p>' : '';
  return '<div class="about">' + t.about.map(([k, text]) => `<p><span class="k">${E(k)}</span>${E(text)}</p>`).join('') + links + '</div>'
    + '<div class="examples">' + t.ex.map((ex, j) =>
      `<figure class="ex" data-ex="${j}"><header><p class="ctx">${typeLink(ex)}</p><h3>${E(ex.title)}</h3></header>`
      + `<div class="fig">${draw(ex, typeName(ex) + ': ' + ex.title)}</div>`
      + caption(ex) + '</figure>').join('') + '</div>';
}

function setOpen(item, open) {
  const panel = item.querySelector('.panel');
  if (open && !panel.firstChild) panel.innerHTML = panelHtml(byId[item.id]);
  item.classList.toggle('open', open);
  item.querySelector('.row').setAttribute('aria-expanded', open);
  panel.hidden = !open;
}

function openOnly(item, open) {
  document.querySelectorAll('.item.open').forEach(i => { if (i !== item) setOpen(i, false); });
  if (item) setOpen(item, open);
}

list.addEventListener('click', e => {
  const part = e.target.closest('.fig .part'), nav = e.target.closest('.pp-prev, .pp-next');
  if (part || nav) {
    const fig = (part || nav).closest('.ex'), cur = fig.dataset.cur === undefined ? -1 : +fig.dataset.cur;
    return showPart(fig, part ? +part.dataset.i : nav.classList.contains('pp-next') ? cur + 1 : cur < 0 ? -1 : cur - 1);
  }
  const row = e.target.closest('.row');
  if (!row) return;
  const item = row.parentElement, wasOpen = item.classList.contains('open'), before = row.getBoundingClientRect().top;
  openOnly(item, !wasOpen);
  /* Keep the selected row at the same position when a panel above it closes. */
  window.scrollBy(0, row.getBoundingClientRect().top - before);
  history.replaceState(null, '', wasOpen ? location.pathname + location.search : '#' + item.id);
});

list.addEventListener('keydown', e => {
  const part = e.target.closest('.fig .part');
  if (part && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showPart(part.closest('.ex'), +part.dataset.i); }
});

find.addEventListener('input', () => {
  const q = find.value.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('.item').forEach(i => { const ok = !q || i.dataset.q.includes(q); i.hidden = !ok; if (ok) shown++; });
  document.querySelectorAll('.cat').forEach(c => { c.hidden = !c.querySelector('.item:not([hidden])'); });
  empty.hidden = shown > 0;
});

function openFromHash() {
  const item = byId[location.hash.slice(1)] && document.getElementById(location.hash.slice(1));
  if (!item) return;
  openOnly(item, true);
  item.scrollIntoView();
}

buildList();
openFromHash();
window.addEventListener('hashchange', openFromHash);
