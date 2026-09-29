// Render each stage of social-motion.html frame by frame, encode H.264 with WebCodecs in Chrome, mux to MP4 (build/mp4.js).
// Frames are seeked, not recorded in real time, so timing is exact.
// Usage: node build/export.js [stageId ...]      (needs Chrome; reuses puppeteer-core from ../social/build)
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('../../social/build/node_modules/puppeteer-core');
const { mux } = require('./mp4');

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find(p => fs.existsSync(p));
const FPS = 30;
const PAGE = pathToFileURL(path.join(__dirname, '..', 'social-motion.html')).href;
const OUT = path.join(__dirname, '..', 'export');

// id, output file, extra query, background override
const JOBS = [
  { id: 'sting', file: 'logo-sting-1920x1080.mp4' },
  { id: 'post', file: 'post-local-ai-1080x1350.mp4' },
  { id: 'story', file: 'story-services-1080x1920.mp4' },
  { id: 'lower', file: 'lower-third-1920x1080.mp4', q: '&demo' },
  { id: 'lower', file: 'lower-third-greenscreen-1920x1080.mp4', bg: '#00FF00' },
];

(async () => {
  const only = process.argv.slice(2);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
  for (const job of JOBS.filter(j => !only.length || only.includes(j.id))) {
    const page = await browser.newPage();
    await page.goto(`${PAGE}?only=${job.id}${job.q || ''}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const { w, h, dur, poster } = await page.evaluate(id => {
      const s = document.getElementById(id);
      return { w: s.offsetWidth, h: s.offsetHeight, dur: +s.dataset.dur, poster: +(s.dataset.poster || s.dataset.dur) };
    }, job.id);
    if (job.bg) await page.evaluate((id, bg) => { document.getElementById(id).style.background = bg; }, job.id, job.bg);
    await page.setViewport({ width: w, height: h });

    await page.evaluate((w, h, fps) => {
      const e = window.__enc = { chunks: [], avcC: null, err: null };
      e.encoder = new VideoEncoder({
        output: (chunk, meta) => {
          const d = new Uint8Array(chunk.byteLength); chunk.copyTo(d);
          e.chunks.push({ d, key: chunk.type === 'key', ts: chunk.timestamp });
          if (meta && meta.decoderConfig && meta.decoderConfig.description) e.avcC = new Uint8Array(meta.decoderConfig.description);
        },
        error: err => { e.err = String(err); },
      });
      e.encoder.configure({ codec: 'avc1.640028', width: w, height: h, bitrate: 10e6, framerate: fps, avc: { format: 'avc' }, latencyMode: 'quality' });
    }, w, h, FPS);

    const n = Math.round(dur / 1000 * FPS);
    let last, posterPng;
    for (let f = 0; f <= n; f++) {
      await page.evaluate((id, t) => window.seek(id, t), job.id, f * 1000 / FPS);
      last = await page.screenshot({ type: 'png', encoding: 'base64' });
      if (!posterPng && f * 1000 / FPS >= poster) posterPng = last;
      await page.evaluate(async (png, f, fps) => {
        const bmp = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
        const frame = new VideoFrame(bmp, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
        window.__enc.encoder.encode(frame, { keyFrame: f % (fps * 2) === 0 });
        frame.close(); bmp.close();
        while (window.__enc.encoder.encodeQueueSize > 4) await new Promise(r => setTimeout(r, 5));
      }, last, f, FPS);
    }
    const out = await page.evaluate(async () => {
      const e = window.__enc; await e.encoder.flush();
      const b64 = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
      const ordered = e.chunks.every((c, i) => !i || c.ts > e.chunks[i - 1].ts);
      return { err: e.err, ordered, avcC: e.avcC && b64(e.avcC), samples: e.chunks.map(c => ({ d: b64(c.d), key: c.key })) };
    });
    await page.close();
    if (out.err || !out.ordered || !out.avcC) throw new Error(`${job.file}: ${out.err || (!out.ordered ? 'encoder reordered frames (B-frames)' : 'no avcC')}`);

    const samples = out.samples.map(s => ({ data: Buffer.from(s.d, 'base64'), key: s.key }));
    const file = path.join(OUT, job.file);
    fs.writeFileSync(file, mux({ samples, avcC: Buffer.from(out.avcC, 'base64'), width: w, height: h, fps: FPS }));
    // poster frame (data-poster ms, default last frame) for thumbnails and previews
    fs.writeFileSync(file.replace('.mp4', '.png'), Buffer.from(posterPng || last, 'base64'));
    console.log(`${job.file}  ${w}x${h}  ${samples.length} frames  ${(fs.statSync(file).size / 1e6).toFixed(1)} MB`);
  }
  await browser.close();
})();
