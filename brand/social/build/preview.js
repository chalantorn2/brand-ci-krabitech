// Writes social-kit.html (preview + copy buttons) and copy.md next to the exported assets.
const fs = require('fs');
const path = require('path');
const copy = require('./copy');
const { esc } = require('./lib');

const len = s => [...s].length;

module.exports = function (assets, OUT) {
  const by = g => assets.filter(a => a.group === g);
  const find = f => assets.find(a => a.file === f);
  const img = (a, cls = '') => `<img src="${a.file}.png" alt="${esc(a.title)}" class="${cls}" loading="lazy">`;
  const card = a => `<figure class="asset">${img(a)}<figcaption><b>${esc(a.title)}</b><span>${esc(a.spec)}</span>
    <span class="dl"><a href="${a.file}.png" download>PNG</a><a href="${a.file}.svg" download>SVG</a></span></figcaption></figure>`;
  const field = f => {
    const n = len(f.value), over = f.limit && n > f.limit;
    return `<div class="field"><div class="fh"><b>${esc(f.label)}</b>${f.limit ? `<span class="cnt${over ? ' over' : ''}">${n} / ${f.limit}</span>` : ''}<button class="cp">คัดลอก</button></div>
      <pre>${esc(f.value)}</pre>${f.note ? `<p class="note">${esc(f.note)}</p>` : ''}</div>`;
  };
  const posts = by('post').sort((a, b) => a.n - b.n);
  const gridOrder = [...posts].reverse();

  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Social Kit · Krabi Digital</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@font-face{font-family:"LINE Seed Sans TH";font-weight:700;src:url(../fonts/LINESeedSansTH_Bd.woff2) format("woff2")}
@font-face{font-family:"LINE Seed Sans TH";font-weight:800;src:url(../fonts/LINESeedSansTH_XBd.woff2) format("woff2")}
:root{--navy:#041A53;--blue:#0059FF;--cyan:#09FFFF;--sky:#7FAEFF;--mist:#EEF3FC;--line:#DCE3F0;--slate:#56627F;--ink:#0B1633;
--head:"Red Hat Display","LINE Seed Sans TH",system-ui,sans-serif;--body:"Plus Jakarta Sans","IBM Plex Sans Thai",system-ui,sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:400 15px/1.65 var(--body)}
a{color:var(--blue)}
header.top{background:var(--navy);color:#fff;padding:56px 24px 40px}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
header.top .wrap{padding:0}
.eb{font:600 12px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--sky);display:flex;gap:10px;align-items:center}
.eb:before{content:"";width:10px;height:10px;border-radius:2px;background:var(--blue)}
header.top .eb:before{background:var(--cyan)}
h1{font:800 44px/1.15 var(--head);margin:14px 0 10px}
h2{font:800 30px/1.2 var(--head);margin:0 0 6px;color:var(--navy)}
h3{font:700 19px/1.3 var(--head);margin:28px 0 12px;color:var(--navy)}
.lead{max-width:680px;opacity:.8;margin:0}
nav.toc{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
nav.toc .wrap{display:flex;gap:4px;overflow-x:auto;padding-top:10px;padding-bottom:10px}
nav.toc a{font:600 13px/1 var(--body);color:var(--slate);text-decoration:none;padding:9px 12px;border-radius:8px;white-space:nowrap}
nav.toc a:hover{background:var(--mist);color:var(--navy)}
section{padding:56px 0;border-bottom:1px solid var(--line)}section.tint{background:var(--mist)}
.sub{color:var(--slate);margin:0 0 24px;max-width:720px}
.grid{display:grid;gap:20px}.g2{grid-template-columns:repeat(2,minmax(0,1fr))}.g3{grid-template-columns:repeat(3,minmax(0,1fr))}.g4{grid-template-columns:repeat(4,minmax(0,1fr))}
.asset{margin:0;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 12px 28px -18px rgb(4 26 83/.35)}
.asset img{display:block;width:100%;height:auto;background:var(--mist)}
.asset figcaption{padding:12px 14px;display:flex;flex-direction:column;gap:2px;font-size:13px}
.asset figcaption b{font:700 14px/1.4 var(--head);color:var(--navy)}.asset figcaption span{color:var(--slate)}
.dl{display:flex;gap:8px;margin-top:6px}.dl a{font:600 12px/1 var(--body);padding:6px 10px;border:1px solid var(--line);border-radius:6px;text-decoration:none;color:var(--navy)}
.dl a:hover{border-color:var(--blue);color:var(--blue)}
.field{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:12px}
.fh{display:flex;align-items:center;gap:10px}.fh b{font:600 14px/1.4 var(--body);color:var(--navy);flex:1}
.cnt{font:600 12px/1 var(--body);color:var(--slate);background:var(--mist);padding:5px 8px;border-radius:6px}.cnt.over{background:#FFE4E4;color:#B00020}
button.cp{font:600 12px/1 var(--body);border:0;background:var(--navy);color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer}
button.cp:hover{background:var(--blue)}button.cp.ok{background:#0A7A45}
pre{white-space:pre-wrap;word-break:break-word;font:400 14px/1.7 var(--body);margin:10px 0 0;color:var(--ink)}
.note{font-size:13px;color:var(--slate);margin:8px 0 0;padding-left:10px;border-left:2px solid var(--sky)}
/* mockups */
.mock{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.fb .cv{position:relative}.fb .cv img{display:block;width:100%}
.fb .safe{position:absolute;top:0;bottom:0;left:16.16%;right:16.16%;border-left:2px dashed var(--cyan);border-right:2px dashed var(--cyan);display:none}
.fb.show .safe{display:block}
.fb .pp{position:relative;padding:0 24px 20px;display:flex;align-items:flex-end;gap:16px;margin-top:-56px}
.fb .pp img{width:132px;height:132px;border-radius:50%;border:4px solid #fff}
.fb .pp div b{display:block;font:800 26px/1.2 var(--head);color:var(--ink)}.fb .pp div span{color:var(--slate);font-size:14px}
.tg{font:600 13px/1 var(--body);margin:12px 0 0;display:inline-flex;gap:8px;align-items:center;cursor:pointer;color:var(--slate)}
.ig{padding:24px;max-width:520px}
.ig .hd{display:flex;gap:20px;align-items:center}.ig .hd img{width:88px;height:88px;border-radius:50%}
.ig .hd b{font:700 16px/1.3 var(--body)}.ig .bio{white-space:pre-line;font-size:14px;margin:12px 0 16px}
.ig .hl{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px}.ig .hl figure{margin:0;text-align:center;font-size:12px;flex:none;width:64px}
.ig .hl img{width:64px;height:64px;border-radius:50%;border:2px solid var(--line);padding:2px;background:#fff}
.ig .gr{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin:16px -24px -24px}
.ig .gr img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.ln{max-width:380px;margin:0 auto;border-radius:36px;border:10px solid var(--ink);overflow:hidden;background:#8CABD9}
.ln .bar{background:#fff;padding:12px 16px;font:700 14px/1 var(--body);display:flex;gap:10px;align-items:center}
.ln .bar img{width:28px;height:28px;border-radius:50%}
.ln .chat{padding:16px;min-height:220px;display:flex;flex-direction:column;gap:10px}
.ln .msg{background:#fff;border-radius:16px;padding:10px 12px;font-size:12.5px;line-height:1.55;max-width:88%;white-space:pre-line}
.ln .rm img{display:block;width:100%}.ln .cb{background:#fff;text-align:center;font:600 12px/1 var(--body);padding:10px;color:var(--slate)}
.post{display:grid;grid-template-columns:260px 1fr;gap:20px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px}
.post img{width:100%;border-radius:10px;display:block}.post .when{font:600 12px/1 var(--body);color:var(--blue);letter-spacing:.06em}
.post .pin{background:var(--navy);color:#fff;border-radius:6px;padding:4px 8px;margin-left:8px;font-size:11px}
.post pre{max-height:340px;overflow:auto}
ol.chk{padding-left:22px;margin:0}ol.chk li{margin:6px 0}
.cols{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px;align-items:start}
footer{padding:32px 0;color:var(--slate);font-size:13px}
@media (max-width:860px){.g3,.g4{grid-template-columns:repeat(2,minmax(0,1fr))}.cols,.g2{grid-template-columns:1fr}.post{grid-template-columns:1fr}h1{font-size:34px}}
@media (max-width:480px){.g3,.g4{grid-template-columns:1fr}}
</style></head><body>
<header class="top"><div class="wrap"><div class="eb">Social Kit · v1.0</div><h1>ชุดตั้งค่าเพจ Krabi Digital</h1>
<p class="lead">Facebook · Instagram · LINE OA ครบทั้งภาพและข้อความ ภาพทุกชิ้นมีทั้ง PNG ขนาดตรง spec และ SVG สำหรับแก้ใน Figma ข้อความกดคัดลอกไปวางได้ทันที</p></div></header>
<nav class="toc"><div class="wrap"><a href="#start">เช็กลิสต์</a><a href="#fb">Facebook</a><a href="#ig">Instagram</a><a href="#line">LINE OA</a><a href="#posts">9 โพสต์แรก</a><a href="#tpl">Templates</a><a href="#files">ไฟล์ทั้งหมด</a></div></nav>

<section id="start"><div class="wrap cols"><div><div class="eb">เริ่มตรงนี้</div><h2>เช็กลิสต์ตั้งค่า</h2><p class="sub">ทำตามลำดับ ใช้เวลาประมาณ 1–2 ชั่วโมง</p>
<ol class="chk">${copy.checklist.map(c => `<li>${esc(c)}</li>`).join('')}</ol></div>
<div class="grid g2">${by('profile').map(card).join('')}</div></div></section>

<section id="fb" class="tint"><div class="wrap"><div class="eb">Facebook Page</div><h2>Facebook</h2><p class="sub">ภาพหน้าปกบนมือถือจะถูกตัดซ้ายขวา ข้อความทั้งหมดอยู่ในเส้นประ (safe zone)</p>
<div class="mock fb" id="fbm"><div class="cv">${img(find('facebook/fb-cover'))}<div class="safe"></div></div>
<div class="pp">${img(find('profile/profile-navy'))}<div><b>Krabi Digital Solutions</b><span>นักออกแบบเว็บไซต์ · กระบี่</span></div></div></div>
<label class="tg"><input type="checkbox" onchange="document.getElementById('fbm').classList.toggle('show',this.checked)"> แสดง safe zone มือถือ</label>
<div class="cols" style="margin-top:28px"><div><h3>ข้อมูลเพจ</h3>${copy.facebook.map(field).join('')}</div><div><h3>Messenger</h3>${copy.messenger.map(field).join('')}</div></div>
</div></section>

<section id="ig"><div class="wrap"><div class="eb">Instagram</div><h2>Instagram</h2><p class="sub">โพสต์ 4:5 แสดงบน grid เป็น 3:4 ขอบซ้ายขวาถูกตัดเล็กน้อย เนื้อหาทุกโพสต์เว้นขอบไว้แล้ว</p>
<div class="cols"><div class="mock ig"><div class="hd">${img(find('profile/profile-navy'))}<div><b>krabitech</b><br><span style="color:var(--slate);font-size:14px">Krabi Digital | เว็บ แอป AI</span></div></div>
<div class="bio">${esc(copy.instagram.find(f => f.label === 'Bio').value)}\n<a href="https://krabitech.com/th">krabitech.com/th</a></div>
<div class="hl">${by('highlight').map(h => `<figure>${img(h)}<figcaption>${esc(h.label)}</figcaption></figure>`).join('')}</div>
<div class="gr">${gridOrder.map(p => img(p)).join('')}</div></div>
<div>${copy.instagram.map(field).join('')}</div></div>
<h3>Highlight covers</h3><div class="grid g4">${by('highlight').map(card).join('')}</div></div></section>

<section id="line" class="tint"><div class="wrap"><div class="eb">LINE Official Account</div><h2>LINE OA</h2><p class="sub">Rich menu ใหญ่ 6 ช่องเป็นค่าหลัก ถ้าอยากให้เห็นแชตมากขึ้นใช้แบบเล็ก 3 ช่อง</p>
<div class="cols"><div class="ln"><div class="bar">${img(find('profile/profile-navy'))}Krabi Digital Solutions</div>
<div class="chat"><div class="msg">${esc(copy.line.find(f => f.label.startsWith('ข้อความทักทาย')).value.replace('{Nickname}', 'สมศรี'))}</div></div>
<div class="rm">${img(find('line-oa/richmenu-large'))}</div><div class="cb">เมนูบริการ ▾</div></div>
<div>${copy.line.map(field).join('')}</div></div>
<div class="grid g3" style="margin-top:28px">${by('line').map(card).join('')}</div></div></section>

<section id="posts"><div class="wrap"><div class="eb">Content</div><h2>9 โพสต์แรก</h2><p class="sub">โพสต์ 01 → 09 ตามลำดับ ลงพร้อมกันทั้ง FB และ IG สัปดาห์ละ 3 โพสต์ เวลาเริ่มต้นแนะนำ 19:00–20:00 แล้วปรับตาม Insights เมื่อครบเดือน</p>
${posts.map(p => { const c = copy.posts.find(x => x.n === p.n); return `<div class="post"><div>${img(p)}<span class="dl"><a href="${p.file}.png" download>PNG</a><a href="${p.file}.svg" download>SVG</a></span></div>
<div><div class="fh"><span class="when">${esc(c.when)}${c.pin ? '<span class="pin">ปักหมุด</span>' : ''}</span><b style="flex:1"></b><button class="cp">คัดลอก caption</button></div><h3 style="margin:10px 0 0">${esc(p.title)}</h3><pre>${esc(c.caption)}</pre></div></div>`; }).join('')}
</div></section>

<section id="tpl" class="tint"><div class="wrap"><div class="eb">Reusable</div><h2>Templates</h2><p class="sub">ข้อความใน [วงเล็บ] คือช่องให้แทนที่ เปิดไฟล์ SVG ใน Figma (ติดตั้งฟอนต์ทั้ง 4 ตัวก่อน) แก้ข้อความ แล้ว export PNG ขนาดเดิม</p>
<div class="grid g4">${by('template').map(card).join('')}</div></div></section>

<section id="files"><div class="wrap"><div class="eb">Files</div><h2>ไฟล์ทั้งหมด</h2><p class="sub">อยู่ในโฟลเดอร์ brand/social/ แก้ข้อความหรือเลย์เอาต์ที่ build/assets.js และ build/copy.js แล้วรัน node build.js</p>
<pre style="background:var(--mist);padding:16px;border-radius:12px">${assets.map(a => `${a.file}.png / .svg   ${a.w} × ${a.h}`).join('\n')}</pre></div></section>
<footer><div class="wrap">Krabi Digital Solutions · Social Kit v1.0 · ${new Date().toISOString().slice(0, 10)}</div></footer>
<script>
document.querySelectorAll('button.cp').forEach(b=>b.addEventListener('click',async()=>{
  const pre=b.closest('.field,.post').querySelector('pre');
  try{await navigator.clipboard.writeText(pre.textContent)}catch(e){const r=document.createRange();r.selectNodeContents(pre);const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('copy')}
  const t=b.textContent;b.textContent='คัดลอกแล้ว';b.classList.add('ok');setTimeout(()=>{b.textContent=t;b.classList.remove('ok')},1400);
}));
</script></body></html>`;
  fs.writeFileSync(path.join(OUT, 'social-kit.html'), html);

  // copy.md — same text, plain
  const sec = (t, arr) => `## ${t}\n\n` + arr.map(f => `### ${f.label}${f.limit ? ` (${len(f.value)}/${f.limit})` : ''}\n\n${f.value}\n${f.note ? `\n> ${f.note}\n` : ''}`).join('\n') + '\n';
  const md = `# Krabi Digital · ข้อความตั้งค่าเพจ\n\nสร้างจาก build/copy.js — แก้ที่นั่นแล้วรัน node build.js\n\n## เช็กลิสต์\n\n${copy.checklist.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
    sec('Facebook', copy.facebook) + '\n' + sec('Messenger', copy.messenger) + '\n' + sec('Instagram', copy.instagram) + '\n' + sec('LINE OA', copy.line) + '\n' +
    `## 9 โพสต์แรก\n\n` + copy.posts.map(p => `### โพสต์ ${String(p.n).padStart(2, '0')} · ${p.when}${p.pin ? ' · ปักหมุด' : ''}\n\nภาพ: posts/${posts.find(a => a.n === p.n).file.split('/')[1]}.png\n\n${p.caption}\n`).join('\n');
  fs.writeFileSync(path.join(OUT, 'copy.md'), md);
  console.log('preview + copy.md written');
};
