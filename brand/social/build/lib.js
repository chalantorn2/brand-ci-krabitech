// Shared drawing helpers for the social kit. Everything returns SVG strings.
const fs = require('fs');
const path = require('path');

const C = {
  navy: '#041A53', blue: '#0059FF', cyan: '#09FFFF', sky: '#7FAEFF',
  mist: '#EEF3FC', line: '#DCE3F0', slate: '#56627F', ink: '#0B1633',
  deep: '#020E30', white: '#FFFFFF', wm: '#E3EAF8',
};
const HEAD = "'Red Hat Display','LINE Seed Sans TH',sans-serif";
const BODY = "'Plus Jakarta Sans','IBM Plex Sans Thai',sans-serif";

// Theme per background: text, muted text, accent (pixels/sparks), logo variant
const THEME = {
  white: { bg: C.white, fg: C.navy, muted: C.slate, accent: C.blue, spark: C.sky, logo: 'light', card: C.mist, rule: C.line },
  mist:  { bg: C.mist,  fg: C.navy, muted: C.slate, accent: C.blue, spark: C.sky, logo: 'light', card: C.white, rule: C.line },
  navy:  { bg: C.navy,  fg: C.white, muted: 'rgba(255,255,255,.72)', accent: C.blue, spark: C.cyan, logo: 'dark', card: 'rgba(255,255,255,.06)', rule: 'rgba(255,255,255,.16)' },
  blue:  { bg: C.blue,  fg: C.white, muted: 'rgba(255,255,255,.82)', accent: C.white, spark: C.cyan, logo: 'onblue', card: 'rgba(255,255,255,.10)', rule: 'rgba(255,255,255,.28)' },
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- Pixel K symbol (source geometry: brand/logo/k8-symbol.svg, units 12..92) ----
const MARK_COLORS = {
  light:  { stem: C.navy,  arm: C.blue,  spark: C.sky },
  dark:   { stem: C.white, arm: C.blue,  spark: C.cyan },
  onblue: { stem: C.white, arm: C.white, spark: C.cyan },
  mono:   { stem: C.navy,  arm: C.navy,  spark: C.navy },
  white:  { stem: C.white, arm: C.white, spark: C.white },
};
function markInner(v) {
  const m = MARK_COLORS[v];
  return `<rect x="12" y="12" width="22" height="76" rx="2" fill="${m.stem}"/><path d="M34 50 L62 12 H88 L52 62 H34Z" fill="${m.arm}"/><rect x="52" y="58" width="14" height="14" rx="2" fill="${m.arm}"/><rect x="69" y="71" width="12" height="12" rx="2" fill="${m.arm}"/><rect x="84" y="84" width="8" height="8" rx="1.5" fill="${m.spark}"/><rect x="72" y="56" width="7" height="7" rx="1.5" fill="${m.spark}"/>`;
}
// size = rendered width/height of the 80u symbol
function mark(x, y, size, v = 'light') {
  const s = size / 80;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(-12 -12)">${markInner(v)}</g>`;
}
// Horizontal lockup, source viewBox 330 x 88. h = rendered height.
function lockupH(x, y, h, v = 'light') {
  const s = h / 88;
  const t = v === 'light' || v === 'mono' ? C.navy : C.white;
  return `<g transform="translate(${x} ${y}) scale(${s})"><g transform="translate(-8,-8)">${markInner(v)}</g>` +
    `<text x="102" y="47" font-family="Red Hat Display, sans-serif" font-weight="700" font-size="37" letter-spacing="-0.55" fill="${t}">Krabi Digital</text>` +
    `<text x="103" y="69" font-family="Red Hat Display, sans-serif" font-weight="600" font-size="14" letter-spacing="6.2" fill="${t}" fill-opacity=".72">SOLUTIONS</text></g>`;
}
lockupH.ratio = 330 / 88;

// ---- Pixel trail: follows the K's lower arm, big → small, down-right (14 → 12 → 8 → 7) ----
// u = size of one unit in px. Returns blocks anchored at (x,y) = top-left of the first block.
function pixels(x, y, u, main, spark, n = 4) {
  const B = [[0, 0, 14, 'm'], [17, 17, 12, 'm'], [32, 32, 8, 's'], [20, -4, 7, 's'], [46, 44, 7, 'm'], [36, 12, 6, 'm']].slice(0, n);
  return B.map(([dx, dy, s, k]) => `<rect x="${x + dx * u}" y="${y + dy * u}" width="${s * u}" height="${s * u}" rx="${(s <= 8 ? 1.5 : 2) * u}" fill="${k === 'm' ? main : spark}"/>`).join('');
}

// ---- Text ----
// lines: array of strings, or arrays of [text, fill] segments for inline colour.
// data-maxw lets the build flag lines that overflow their box.
function T(o, lines) {
  const { x, y, size, lh = 1.25, weight = 400, font = 'body', fill = C.navy, anchor = 'start', ls = 0, op, maxw } = o;
  const fam = font === 'head' ? HEAD : font === 'mono' ? "'JetBrains Mono',monospace" : BODY;
  const attrs = `font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}"` +
    (anchor !== 'start' ? ` text-anchor="${anchor}"` : '') + (ls ? ` letter-spacing="${ls}"` : '') +
    (op != null ? ` fill-opacity="${op}"` : '') + (maxw ? ` data-maxw="${maxw}"` : '');
  const spans = lines.map((ln, i) => {
    const body = Array.isArray(ln) ? ln.map(([t, f]) => f ? `<tspan fill="${f}">${esc(t)}</tspan>` : esc(t)).join('') : esc(ln);
    return `<tspan x="${x}" y="${y + i * size * lh}">${body}</tspan>`;
  }).join('');
  return `<text ${attrs}>${spans}</text>`;
}

// ---- Icons (24u grid, 2u stroke, one Blue pixel accent) ----
const ICON_DIR = path.join(__dirname, '..', '..', 'icons');
function iconFromFile(name) {
  const s = fs.readFileSync(path.join(ICON_DIR, `icon-${name}.svg`), 'utf8');
  return s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/<rect([^>]*)fill="#0059FF" stroke="none"\/>/, '<rect$1data-accent="1"/>');
}
const EXTRA = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><rect x="16" y="3" width="3" height="3" rx=".6" data-accent="1"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><rect x="13.5" y="8.5" width="3" height="3" rx=".6" data-accent="1"/>',
  quote: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h4"/><rect x="14" y="15.5" width="3" height="3" rx=".6" data-accent="1"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><rect x="16.6" y="5.6" width="3" height="3" rx=".6" data-accent="1"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2" data-accent="1"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect x="16" y="14" width="3" height="3" rx=".6" data-accent="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><rect x="6" y="14" width="3" height="3" rx=".6" data-accent="1"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><rect x="10.5" y="8.5" width="3" height="3" rx=".6" data-accent="1"/>',
  line: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><rect x="10.5" y="10.5" width="3" height="3" rx=".6" data-accent="1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};
function icon(name, x, y, size, stroke = C.navy, accent = C.blue) {
  let inner = EXTRA[name] || iconFromFile(name);
  inner = inner.replace(/<rect([^>]*)data-accent="1"\/>/, `<rect$1fill="${accent}" stroke="none"/>`);
  const s = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
}

// ---- Signature illustration: เขาขนาบน้ำ ----
const ILL_DIR = path.join(__dirname, '..', '..', 'illustration');
let _dissolve;
// Pixel-dissolve (L1 + pixels), native 1200 x 446.17. Mountain paths have no fill: colour via parent g.
function mountainDissolve(x, y, w, fill, uid) {
  if (!_dissolve) _dissolve = fs.readFileSync(path.join(ILL_DIR, 'kn-pixel-dissolve.svg'), 'utf8')
    .replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const s = w / 1200;
  const inner = _dissolve.replace(/knc8vkr2/g, 'knc-' + uid);
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">${inner}</g>`;
}
mountainDissolve.ratio = 446.17 / 1200;
// L3 smooth (viewBox -2 -2 124 48.6) for small placements
function mountainSmooth(x, y, w, fill) {
  const s = w / 120;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="M0 44.6 V34 C6 33 10 30 14 25 C20 14 26 8 32 8 C38 8 42 16 46 26 C48 34 51 40 59 43 V44.6Z"/><path d="M62 44.6 V43 C66 41 71 38 74 34 C82 22 92 10 100 2 Q104 -1 108 1.5 L111 7 L113 32 Q114 34.5 120 35 V44.6Z"/></g>`;
}
mountainSmooth.ratio = 44.6 / 120;

function svg(w, h, body, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    (bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '') + body + `</svg>`;
}

module.exports = { C, HEAD, BODY, THEME, esc, mark, lockupH, pixels, T, icon, mountainDissolve, mountainSmooth, svg };
