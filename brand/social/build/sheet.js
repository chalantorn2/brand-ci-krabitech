// dev helper: contact sheet of PNGs  →  node sheet.js out.png cols width files...
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const url = p => 'file:///' + path.resolve(p).split(path.sep).join('/');
(async () => {
  const [out, cols, w, ...files] = process.argv.slice(2);
  const html = `<body style="margin:0;background:#888;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;padding:8px;align-items:start">` +
    files.map(f => `<img src="${url(f)}" style="width:${w}px">`).join('') + '</body>';
  const t = path.join(__dirname, '.sheet.html'); fs.writeFileSync(t, html);
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage(); await p.setViewport({ width: cols * (+w + 8) + 8, height: 400 });
  await p.goto(url(t), { waitUntil: 'networkidle0' });
  await p.screenshot({ path: out, fullPage: true }); await b.close(); fs.unlinkSync(t);
})();
