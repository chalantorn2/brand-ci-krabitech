// Build social & contact icons from social-icons.src.js
//   node brand/icons/social/build.js
// 1. writes <icon>-<variant>.svg for every icon x variant
// 2. writes social-sprite.svg + social-icons.css (+ social-icons.html usage snippet)
// 3. injects social-icons.src.js into the brand book between // SOCIAL:BEGIN and // SOCIAL:END
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = __dirname;
const BOOK = path.join(DIR, '..', '..', 'k8-brand-guidelines.html');
const src = fs.readFileSync(path.join(DIR, 'social-icons.src.js'), 'utf8');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + '\nthis.api={SOCIAL,SI_VARIANTS,siSVG,siSprite,SI_CSS,SI_HTML};', ctx);
const { SOCIAL, SI_VARIANTS, siSVG, siSprite, SI_CSS, SI_HTML } = ctx.api;

for (const f of fs.readdirSync(DIR)) if (f.endsWith('.svg')) fs.unlinkSync(path.join(DIR, f));

let n = 0;
for (const ic of SOCIAL) {
  for (const vk of Object.keys(SI_VARIANTS)) {
    fs.writeFileSync(path.join(DIR, `${ic.k}-${vk}.svg`), siSVG(ic, vk, 48, 1) + '\n');
    n++;
  }
}
fs.writeFileSync(path.join(DIR, 'social-sprite.svg'), siSprite(1).replace(' style="position:absolute;width:0;height:0;overflow:hidden"', '') + '\n');
fs.writeFileSync(path.join(DIR, 'social-icons.css'), SI_CSS + '\n');
fs.writeFileSync(path.join(DIR, 'social-icons.html'), SI_HTML + '\n');

const book = fs.readFileSync(BOOK, 'utf8');
const re = /\/\/ SOCIAL:BEGIN[\s\S]*?\/\/ SOCIAL:END/;
if (!re.test(book)) throw new Error('SOCIAL markers not found in brand book');
fs.writeFileSync(BOOK, book.replace(re, () => `// SOCIAL:BEGIN (generated from icons/social/social-icons.src.js, do not edit here)\n${src.trim()}\n// SOCIAL:END`));

console.log(`wrote ${n} icon SVGs + sprite + css, injected into ${path.basename(BOOK)}`);
