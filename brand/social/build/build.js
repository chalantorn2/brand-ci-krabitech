// Build the social kit: SVG + PNG for every asset, preview page, copy.md
//   cd brand/social/build && npm install && node build.js [filter]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const OUT = path.join(__dirname, '..');
const FONTS = path.join(__dirname, '..', '..', 'fonts');
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(p => fs.existsSync(p));

const GF = 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=block';
const LS = 'https://cdn.jsdelivr.net/npm/@fontpkg/line-seed-sans-th@1.0.1';
// Embedded in each exported SVG so it renders correctly when opened in a browser.
// Figma/Illustrator use installed fonts instead (see README).
const SVG_FONT_STYLE = `<style>@import url('${GF.replace(/&/g, '&amp;')}');` +
  `@font-face{font-family:"LINE Seed Sans TH";font-weight:700;src:url(${LS}/LINESeedSansTH_Bd.ttf)}` +
  `@font-face{font-family:"LINE Seed Sans TH";font-weight:800;src:url(${LS}/LINESeedSansTH_XBd.ttf)}</style>`;

const fileUrl = p => 'file:///' + p.replace(/\\/g, '/');

(async () => {
  const filter = process.argv[2];
  const assets = require('./assets').filter(a => !filter || a.file.includes(filter));

  // 1. SVG files
  for (const a of assets) {
    const f = path.join(OUT, a.file + '.svg');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, a.svg.replace(/(<svg[^>]*>)/, `$1${SVG_FONT_STYLE}`).replace(/ data-maxw="\d+(\.\d+)?"/g, ''));
  }

  // 2. PNG render
  const stage = path.join(__dirname, '.stage.html');
  fs.writeFileSync(stage, `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${GF}"><style>
@font-face{font-family:"LINE Seed Sans TH";font-weight:700;src:url(${fileUrl(path.join(FONTS, 'LINESeedSansTH_Bd.woff2'))})}
@font-face{font-family:"LINE Seed Sans TH";font-weight:800;src:url(${fileUrl(path.join(FONTS, 'LINESeedSansTH_XBd.woff2'))})}
html,body{margin:0;background:#fff}#s{position:absolute;left:0;top:0;line-height:0}</style><div id="s"></div>`);

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.goto(fileUrl(stage), { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    const want = ['800 40px "LINE Seed Sans TH"', '700 40px "LINE Seed Sans TH"', '400 40px "IBM Plex Sans Thai"', '500 40px "IBM Plex Sans Thai"',
      '600 40px "IBM Plex Sans Thai"', '700 40px "Red Hat Display"', '800 40px "Red Hat Display"', '600 40px "Red Hat Display"',
      '400 40px "Plus Jakarta Sans"', '500 40px "Plus Jakarta Sans"', '600 40px "Plus Jakarta Sans"'];
    await Promise.all(want.map(f => document.fonts.load(f, 'กขA1')));
    await document.fonts.ready;
  });

  const warns = [];
  for (const a of assets) {
    await page.setViewport({ width: a.w, height: a.h, deviceScaleFactor: 1 });
    const issues = await page.evaluate((svgStr, W, H, margin) => {
      const s = document.getElementById('s'); s.innerHTML = svgStr;
      const out = [];
      s.querySelectorAll('text').forEach(t => {
        const maxw = +t.getAttribute('data-maxw') || 0;
        t.querySelectorAll(':scope > tspan').forEach(ts => {
          const b = ts.getBBox(), txt = ts.textContent.slice(0, 30);
          if (maxw && ts.getComputedTextLength() > maxw) out.push(`"${txt}" ${Math.round(ts.getComputedTextLength())} > maxw ${maxw}`);
          if (b.x < margin - 1 || b.x + b.width > W - margin + 1) out.push(`"${txt}" x ${Math.round(b.x)}–${Math.round(b.x + b.width)} outside margin ${margin}`);
        });
      });
      return out;
    }, a.svg, a.w, a.h, a.margin ?? 60);
    issues.forEach(i => warns.push(`${a.file}: ${i}`));
    await page.screenshot({ path: path.join(OUT, a.file + '.png'), clip: { x: 0, y: 0, width: a.w, height: a.h } });
    process.stdout.write('.');
  }
  await browser.close();
  fs.unlinkSync(stage);
  console.log(`\n${assets.length} assets`);
  if (warns.length) console.log('WARN\n' + warns.join('\n'));

  // 3. preview + copy (only on full builds)
  if (!filter) require('./preview')(require('./assets'), OUT);
})().catch(e => { console.error(e); process.exit(1); });
