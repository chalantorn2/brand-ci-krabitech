// Render the horizontal lockup to a transparent PNG for Word/Excel (live Red Hat Display text -> pixels).
const fs = require('fs');
const path = require('path');
const puppeteer = require('../../../social/build/node_modules/puppeteer-core');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const svg = fs.readFileSync(path.join(__dirname, '../../../logo/k8-logo-horizontal.svg'), 'utf8');
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const p = await b.newPage();
  await p.setViewport({ width: 660, height: 176, deviceScaleFactor: 2 });
  await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@600;700&display=swap" rel="stylesheet">
    <style>html,body{margin:0;background:transparent}svg{display:block;width:660px;height:176px}</style>${svg}`, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(__dirname, 'logo-horizontal.png'), omitBackground: true });
  await b.close();
  console.log('logo-horizontal.png 1320x352');
})();
