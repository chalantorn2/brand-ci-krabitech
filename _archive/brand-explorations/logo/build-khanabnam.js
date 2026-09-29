// Inline the left/right mountain paths from เขาขนาบน้ำ.svg into each *.template.html
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..', '..', 'brand', 'source'); // moved to brand/source on 2026-09-29
const src = fs.readFileSync(path.join(root, 'เขาขนาบน้ำ.svg'), 'utf8');

// Paths may or may not be grouped depending on the export, so split by the
// x of each path's start point: the river gap sits around x=600 of 1200.
const paths = [...src.matchAll(/<path[^>]*\bd="([^"]+)"[^>]*\/>/g)].map(m => m[1]);
const left = [], right = [];
for (const d of paths) {
  const x = parseFloat(d.slice(1));
  (x < 600 ? left : right).push(`<path d="${d}"/>`);
}
if (!left.length || !right.length) throw new Error(`bad split: ${left.length} left, ${right.length} right`);

// Build every *.template.html in this folder into its .html counterpart
for (const name of fs.readdirSync(__dirname).filter(f => f.endsWith('.template.html'))) {
  const tpl = fs.readFileSync(path.join(__dirname, name), 'utf8');
  const out = tpl.replace('/*LEFT*/', left.join('')).replace('/*RIGHT*/', right.join(''));
  const dest = name.replace('.template.html', '.html');
  fs.writeFileSync(path.join(__dirname, dest), out);
  console.log(`wrote ${dest} (${left.length} left, ${right.length} right paths)`);
}
