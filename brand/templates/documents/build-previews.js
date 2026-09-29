// Render sample PDFs + PNG previews of each document (print styles, default sample data).
// Usage: node build-previews.js   ->  samples/<doc>.pdf, samples/<doc>.png
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('../../social/build/node_modules/puppeteer-core');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const OUT = path.join(__dirname, 'samples');
// receipt is shown as a tax invoice with withholding tax, to cover every total line
const DOCS = [['quotation', []], ['invoice', []], ['receipt', ['#vat', '#wht']]];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });
  for (const [doc, clicks] of DOCS) {
    await p.goto(pathToFileURL(path.join(__dirname, `${doc}.html`)).href, { waitUntil: 'networkidle0' });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: 'networkidle0' });
    for (const c of clicks) await p.click(c);
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(OUT, `${doc}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await p.emulateMediaType('print');
    await (await p.$('#paper')).screenshot({ path: path.join(OUT, `${doc}.png`) });
    await p.emulateMediaType('screen');
    console.log(doc);
  }
  await b.close();
})();
