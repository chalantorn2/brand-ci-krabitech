// Every asset in the social kit. Each entry: { file, w, h, group, title, spec, svg }
const { C, THEME, mark, lockupH, pixels, T, icon, mountainDissolve, svg } = require('./lib');

const M = 88; // outer margin on 1080-wide posts
const A = [];
const add = (o) => A.push(o);

// ---------- shared post pieces (1080 x 1350) ----------
function eyebrow(th, text, y = 168, x = M) {
  const dot = th === THEME.blue ? C.cyan : th.accent;
  return `<rect x="${x}" y="${y - 21}" width="20" height="20" rx="4" fill="${dot}"/>` +
    T({ x: x + 36, y, size: 28, weight: 600, fill: th.fg, op: th.fg === C.white ? .8 : null, ls: 1 }, [text]);
}
function footer(th, W = 1080, H = 1350) {
  const y = H - M - 52;
  return `<rect x="${M}" y="${y - 44}" width="${W - 2 * M}" height="2" fill="${th.rule}"/>` +
    lockupH(M, y, 52, th.logo) +
    T({ x: W - M, y: y + 36, size: 26, weight: 500, fill: th.fg, op: .72, anchor: 'end' }, ['krabitech.com']);
}
function cornerPixels(th, x = 872, y = 96, u = 4) {
  const main = th === THEME.blue ? C.white : C.blue;
  return pixels(x, y, u, main, th.spark, 4);
}
function post(bg, body, { foot = true, px = true } = {}) {
  const th = THEME[bg];
  return svg(1080, 1350, (px ? cornerPixels(th) : '') + body + (foot ? footer(th) : ''), th.bg);
}

// Service post: icon, headline, body, checklist card
function servicePost({ bg, eb, ic, head, body, items, hs = head.length > 2 ? 88 : 96 }) {
  const th = THEME[bg];
  const acc = bg === 'white' || bg === 'mist' ? C.blue : C.cyan;
  let s = eyebrow(th, eb);
  const ch = items.length * 64 + 40;
  let y = 1112 - ch - 56 - (body.length - 1) * 33 * 1.6 - 96 - (head.length - 1) * hs * 1.22;
  s += icon(ic, M, y - hs * 0.95 - 144, 104, th.fg, acc);
  s += T({ x: M, y, size: hs, weight: 800, font: 'head', fill: th.fg, lh: 1.22, maxw: 904 }, head);
  y += (head.length - 1) * hs * 1.22 + 96;
  s += T({ x: M, y, size: 33, fill: th.fg, op: th.fg === C.white ? .85 : null, lh: 1.6, maxw: 904 }, body);
  y += (body.length - 1) * 33 * 1.6 + 56;
  s += `<rect x="${M}" y="${y}" width="904" height="${ch}" rx="24" fill="${th.card}"/>`;
  items.forEach((t, i) => {
    const by = y + 62 + i * 64;
    s += icon('check', M + 36, by - 29, 34, bg === 'blue' ? C.white : acc);
    s += T({ x: M + 92, y: by, size: 31, weight: 500, fill: th.fg, maxw: 780 }, [t]);
  });
  return post(bg, s);
}

// =====================================================================
// PROFILE (FB · IG · LINE OA share one file)
// =====================================================================
add({ group: 'profile', file: 'profile/profile-navy', w: 720, h: 720, title: 'รูปโปรไฟล์ · หลัก',
  spec: '720 × 720 · ใช้ร่วม Facebook / Instagram / LINE OA (แสดงเป็นวงกลม)',
  svg: svg(720, 720, mark(160, 160, 400, 'dark'), C.navy) });
add({ group: 'profile', file: 'profile/profile-blue', w: 720, h: 720, title: 'รูปโปรไฟล์ · สำรอง',
  spec: '720 × 720 · ใช้เมื่อพื้นหลังแพลตฟอร์มเป็นสีเข้ม',
  svg: svg(720, 720, mark(160, 160, 400, 'onblue'), C.blue) });

// =====================================================================
// FACEBOOK COVER 1640 x 624 · mobile shows centre ~1110 px (x 265–1375)
// =====================================================================
{
  const th = THEME.navy, mw = 740, mh = mw * mountainDissolve.ratio;
  let s = mountainDissolve(1640 - mw - 30, 624 - mh + 1, mw, C.blue, 'fbc');
  s += eyebrow(th, 'ทีม digital จากกระบี่', 190, 300);
  s += T({ x: 300, y: 300, size: 84, weight: 800, font: 'head', fill: C.white, lh: 1.2, maxw: 620 },
    [[['เทคโนโลยีที่'], ['พอดี', C.cyan]], 'กับธุรกิจคุณ']);
  s += T({ x: 300, y: 468, size: 30, weight: 500, fill: C.white, op: .75, maxw: 700 }, ['เว็บ · แอป · ออกแบบ · การตลาด · ระบบ · เซิร์ฟเวอร์']);
  add({ group: 'facebook', file: 'facebook/fb-cover', w: 1640, h: 624, title: 'Facebook · ภาพหน้าปก',
    spec: '1640 × 624 · ข้อความอยู่ใน safe zone มือถือ (กลาง 1110 px) · มุมซ้ายล่างเว้นให้รูปโปรไฟล์', svg: svg(1640, 624, s, C.navy), margin: 0 });
}

// =====================================================================
// LINE OA
// =====================================================================
{
  const mh = 1080 * mountainDissolve.ratio;
  let s = mountainDissolve(0, 878 - mh + 1, 1080, C.blue, 'lnc');
  s += T({ x: 540, y: 190, size: 30, weight: 600, fill: C.white, op: .8, anchor: 'middle' }, ['ทีม digital จากกระบี่']);
  s += T({ x: 540, y: 290, size: 76, weight: 800, font: 'head', fill: C.white, anchor: 'middle', lh: 1.2, maxw: 900 },
    [[['เทคโนโลยีที่'], ['พอดี', C.cyan]], 'กับธุรกิจคุณ']);
  add({ group: 'line', file: 'line-oa/line-cover', w: 1080, h: 878, title: 'LINE OA · ภาพหน้าปก',
    spec: '1080 × 878 · ข้อความอยู่ครึ่งบน รูปโปรไฟล์ทับด้านล่างได้', svg: svg(1080, 878, s, C.navy) });
}

function menuCard(x, y, w, h, { ic, label, sub, hot }, k = 1) {
  const bg = hot ? C.blue : C.white, fg = hot ? C.white : C.navy;
  const cx = x + w / 2, is = 200 * k;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${48 * k}" fill="${bg}"/>` +
    icon(ic, cx - is / 2, y + h * 0.17, is, fg, hot ? C.cyan : C.blue) +
    T({ x: cx, y: y + h * 0.17 + is + 150 * k, size: 92 * k, weight: 800, font: 'head', fill: fg, anchor: 'middle', maxw: w - 80 }, [label]) +
    T({ x: cx, y: y + h * 0.17 + is + 238 * k, size: 50 * k, weight: 500, fill: fg, op: hot ? .85 : null, anchor: 'middle', maxw: w - 80 }, [sub]);
}
{
  const cells = [
    { ic: 'grid', label: 'บริการของเรา', sub: 'เว็บ · ดีไซน์ · การตลาด · ระบบ' },
    { ic: 'tourism', label: 'ระบบจอง / ทัวร์', sub: 'โรงแรม · ที่พัก · ทัวร์' },
    { ic: 'quote', label: 'ขอใบเสนอราคา', sub: 'ตอบภายใน 1 วันทำการ', hot: true },
    { ic: 'chat', label: 'คุยกับทีม', sub: 'จันทร์–เสาร์ 09:00–18:00' },
    { ic: 'phone', label: 'โทรหาเรา', sub: '080-893-0617' },
    { ic: 'globe', label: 'เว็บไซต์', sub: 'krabitech.com' },
  ];
  const g = 24, W = 2500, H = 1686, cw = (W - g * 4) / 3, ch = (H - g * 3) / 2;
  let s = '';
  cells.forEach((c, i) => { s += menuCard(g + (i % 3) * (cw + g), g + Math.floor(i / 3) * (ch + g), cw, ch, c); });
  add({ group: 'line', file: 'line-oa/richmenu-large', w: W, h: H, title: 'LINE OA · Rich menu (ใหญ่ 6 ช่อง)',
    spec: '2500 × 1686 · ตั้ง template 6 ช่อง (3 × 2) · action ดูใน copy', svg: svg(W, H, s, C.navy), margin: 0 });

  const cells2 = [cells[0], cells[2], cells[3]];
  const H2 = 843, ch2 = H2 - g * 2;
  let s2 = '';
  cells2.forEach((c, i) => { s2 += menuCard(g + i * (cw + g), g, cw, ch2, c, 0.96); });
  add({ group: 'line', file: 'line-oa/richmenu-compact', w: W, h: H2, title: 'LINE OA · Rich menu (เล็ก 3 ช่อง)',
    spec: '2500 × 843 · ตั้ง template 3 ช่อง', svg: svg(W, H2, s2, C.navy), margin: 0 });
}

// =====================================================================
// INSTAGRAM HIGHLIGHT COVERS 1080 x 1080 (shown as circle)
// =====================================================================
[['web-app', 'เว็บ & แอป'], ['design', 'ออกแบบ'], ['marketing', 'การตลาด'], ['systems', 'ระบบ'], ['server', 'เซิร์ฟเวอร์'], ['tourism', 'ท่องเที่ยว'], ['chat', 'ติดต่อ']]
  .forEach(([ic, name], i) => add({
    group: 'highlight', file: `instagram/highlight-${String(i + 1).padStart(2, '0')}-${ic}`, w: 1080, h: 1080,
    title: `Highlight · ${name}`, spec: '1080 × 1080 · ไอคอนอยู่ในวงกลมกลางภาพ', label: name,
    svg: svg(1080, 1080, icon(ic, 320, 320, 440, C.white, C.cyan), C.navy),
  }));

// =====================================================================
// FIRST 9 POSTS 1080 x 1350 (4:5) — FB + IG
// Grid (newest top-left): 9 8 7 / 6 5 4 / 3 2 1  → dark diagonal 1·5·7(ish), checker light/dark
// =====================================================================
{ // 01 intro
  const th = THEME.navy, mh = 1080 * mountainDissolve.ratio;
  let s = lockupH(M, 96, 64, 'dark');
  s += eyebrow(th, 'สวัสดีจากกระบี่', 330);
  s += T({ x: M, y: 450, size: 104, weight: 800, font: 'head', fill: C.white, lh: 1.22, maxw: 904 },
    ['เทคโนโลยี', [['ที่'], ['พอดี', C.cyan]], 'กับธุรกิจคุณ']);
  s += T({ x: M, y: 810, size: 33, fill: C.white, op: .85, lh: 1.6, maxw: 904 },
    ['Krabi Digital คือทีม digital จากกระบี่ ทำครบ', 'ตั้งแต่ออกแบบแบรนด์ เว็บ แอป ระบบ เซิร์ฟเวอร์', 'จนถึงการตลาดออนไลน์ ให้ธุรกิจในภาคใต้']);
  s += mountainDissolve(0, 1350 - mh + 1, 1080, C.blue, 'p1');
  add({ group: 'post', n: 1, file: 'posts/post-01-intro', w: 1080, h: 1350, title: '01 · แนะนำตัว', spec: '1080 × 1350 (4:5)', svg: post('navy', s, { foot: false, px: false }) });
}
add({ group: 'post', n: 2, file: 'posts/post-02-web-app', w: 1080, h: 1350, title: '02 · เว็บไซต์และแอป', spec: '1080 × 1350 (4:5)',
  svg: servicePost({ bg: 'white', eb: 'บริการ · เว็บไซต์และแอป', ic: 'web-app',
    head: ['เว็บและแอป', [['ที่ธุรกิจ'], ['ใช้ได้จริง', C.blue]]],
    body: ['เว็บไซต์ Web App / SaaS และแอป iOS / Android', 'ออกแบบและพัฒนาตามงานของธุรกิจคุณ'],
    items: ['เว็บไซต์ธุรกิจ บริษัท ร้านค้า', 'Web App และระบบเฉพาะองค์กร', 'แก้ไขและต่อยอดเว็บไซต์เดิม'] }) });
add({ group: 'post', n: 3, file: 'posts/post-03-design', w: 1080, h: 1350, title: '03 · ออกแบบและแบรนด์', spec: '1080 × 1350 (4:5)',
  svg: servicePost({ bg: 'blue', eb: 'บริการ · ออกแบบและแบรนด์', ic: 'design',
    head: ['แบรนด์ที่จำได้', 'ทุกช่องทาง'],
    body: ['ตั้งแต่โลโก้ ไปจนถึงสื่อทุกชิ้น', 'หน้าตาเป็นชุดเดียวกันทั้งออนไลน์และหน้าร้าน'],
    items: ['Logo และ Brand Identity', 'Artwork Facebook / Instagram', 'Poster Banner Booth และป้าย'] }) });
add({ group: 'post', n: 4, file: 'posts/post-04-marketing', w: 1080, h: 1350, title: '04 · การตลาดออนไลน์', spec: '1080 × 1350 (4:5)',
  svg: servicePost({ bg: 'mist', eb: 'บริการ · การตลาดออนไลน์', ic: 'marketing',
    head: ['เพจที่มีคนดูแล', [['และ'], ['วัดผลได้', C.blue]]],
    body: ['ดูแล Facebook Page ทำ Content', 'และยิงโฆษณาพร้อมรายงานผล'],
    items: ['ดูแลเพจ ทำ Content และ Caption', 'Facebook Ads และวิเคราะห์ผล', 'วางแผนการตลาดออนไลน์'] }) });
add({ group: 'post', n: 5, file: 'posts/post-05-systems', w: 1080, h: 1350, title: '05 · ระบบธุรกิจ', spec: '1080 × 1350 (4:5)',
  svg: servicePost({ bg: 'navy', eb: 'บริการ · ระบบธุรกิจและการเชื่อมต่อ', ic: 'systems',
    head: ['ระบบหลังบ้าน', 'ที่คุยกันได้', [['ทุกระบบ', C.cyan]]],
    body: ['ออกแบบ Workflow ทำ Dashboard', 'และเชื่อมระบบที่ธุรกิจใช้อยู่แล้ว'],
    items: ['ระบบหลังบ้าน Dashboard ฐานข้อมูล', 'Payment Gateway · LINE OA · Google API', 'ระบบสมาชิก และแจ้งเตือน Email / SMS / LINE'] }) });
add({ group: 'post', n: 6, file: 'posts/post-06-server', w: 1080, h: 1350, title: '06 · เซิร์ฟเวอร์และคลาวด์', spec: '1080 × 1350 (4:5)',
  svg: servicePost({ bg: 'white', eb: 'บริการ · เซิร์ฟเวอร์และคลาวด์', ic: 'server',
    head: ['เซิร์ฟเวอร์เสถียร', [['มีคน', C.blue], ['ดูแล', C.blue]]],
    body: ['ตั้งค่า Deploy และดูแลระบบบน VPS / Cloud', 'ให้เว็บและระบบของคุณไม่สะดุด'],
    items: ['Domain DNS SSL และ Hosting', 'Backup Recovery และ Monitoring', 'ปรับความเร็ว และย้ายระบบ (Migration)'] }) });
add({ group: 'post', n: 7, file: 'posts/post-07-tourism', w: 1080, h: 1350, title: '07 · ท่องเที่ยวและระบบจอง', spec: '1080 × 1350 (4:5)',
  svg: servicePost({ bg: 'navy', eb: 'บริการ · ท่องเที่ยวและระบบจอง', ic: 'tourism',
    head: ['ระบบสำหรับ', [['ธุรกิจท่องเที่ยว', C.cyan]]],
    body: ['ให้แขกจองตรงผ่านเว็บของคุณเอง', 'ไม่ต้องเสียค่าคอมมิชชัน OTA ทุกรายการ'],
    items: ['ระบบ Booking โรงแรม ที่พัก กิจกรรม', 'ระบบสำหรับบริษัททัวร์', 'โปรแกรมทัวร์ ราคา และ Promotion'] }) });
{ // 08 why us
  const th = THEME.mist;
  let s = eyebrow(th, 'ทำไมต้องเรา');
  s += T({ x: M, y: 318, size: 88, weight: 800, font: 'head', fill: C.navy, lh: 1.22 }, ['ทำไมต้อง', [['Krabi Digital', C.blue]]]);
  const P = [['ใกล้ตัว', ['คนกระบี่ คุยภาษาเดียวกับ', 'เจ้าของธุรกิจ นัดเจอได้']],
    ['พอดี', ['เสนอสิ่งที่ธุรกิจใช้จริง', 'พอดีกับงบ ไม่ยัดฟีเจอร์']],
    ['ชัดเจน', ['อธิบายเรื่องเทคนิคให้เข้าใจง่าย', 'ราคาและขั้นตอนบอกตรงๆ']],
    ['อยู่ยาว', ['มีประกันหลังส่งงาน', 'และแผนดูแลรายเดือน']]];
  P.forEach(([t, d], i) => {
    const x = M + (i % 2) * 464, y = 484 + Math.floor(i / 2) * 318;
    s += `<rect x="${x}" y="${y}" width="440" height="294" rx="24" fill="${C.white}"/>`;
    s += `<rect x="${x + 40}" y="${y + 44}" width="22" height="22" rx="4" fill="${C.blue}"/>`;
    s += T({ x: x + 76, y: y + 64, size: 24, weight: 700, font: 'head', fill: C.slate }, [String(i + 1).padStart(2, '0')]);
    s += T({ x: x + 40, y: y + 150, size: 52, weight: 800, font: 'head', fill: C.navy }, [t]);
    s += T({ x: x + 40, y: y + 210, size: 26, fill: C.slate, lh: 1.55, maxw: 370 }, d);
  });
  add({ group: 'post', n: 8, file: 'posts/post-08-why-us', w: 1080, h: 1350, title: '08 · ทำไมต้องเรา', spec: '1080 × 1350 (4:5)', svg: post('mist', s) });
}
function contactRows(x, y, pitch, size, fg, acc) {
  const R = [['phone', '080-893-0617'], ['line', 'LINE  @982ghtqj'], ['mail', 'contact@krabitech.com'], ['globe', 'krabitech.com'], ['clock', 'จันทร์–เสาร์ 09:00–18:00']];
  return R.map(([ic, t], i) => icon(ic, x, y + i * pitch - size * 1.2, size * 1.3, fg, acc) +
    T({ x: x + size * 2.1, y: y + i * pitch, size, weight: 600, fill: fg }, [t])).join('');
}
{ // 09 contact
  const th = THEME.blue;
  let s = eyebrow(th, 'ติดต่อเรา');
  s += T({ x: M, y: 340, size: 104, weight: 800, font: 'head', fill: C.white, lh: 1.2 }, ['พร้อมเริ่ม', 'โปรเจกต์?']);
  s += T({ x: M, y: 600, size: 33, fill: C.white, op: .9 }, ['คุยกับทีมจากกระบี่ ตอบกลับภายใน 1 วันทำการ']);
  s += `<rect x="${M}" y="656" width="904" height="460" rx="24" fill="${th.card}"/>`;
  s += contactRows(M + 44, 752, 84, 34, C.white, C.cyan);
  add({ group: 'post', n: 9, file: 'posts/post-09-contact', w: 1080, h: 1350, title: '09 · ติดต่อเรา', spec: '1080 × 1350 (4:5)', svg: post('blue', s) });
}

// =====================================================================
// TEMPLATES (placeholder text in [brackets] — replace in Figma)
// =====================================================================
{ // process (template, was post 07)
  const th = THEME.navy;
  let s = eyebrow(th, 'วิธีทำงาน');
  s += T({ x: M, y: 318, size: 88, weight: 800, font: 'head', fill: C.white, lh: 1.22 }, ['ทำงานกับเรา', [['8 ขั้นตอน', C.cyan]]]);
  const steps = [
    ['ปรึกษา', 'เข้าใจธุรกิจและเป้าหมายจริง'], ['วิเคราะห์', 'เลือกทางที่คุ้มที่สุด'],
    ['วางแผน', 'ขอบเขต ฟีเจอร์ เทคโนโลยี'], ['ออกแบบ UX/UI', 'prototype ให้กดลองได้'],
    ['พัฒนา', 'อัปเดตความคืบหน้าเป็นระยะ'], ['ทดสอบ', 'ฟังก์ชัน ความเร็ว ความปลอดภัย'],
    ['ขึ้นระบบ', 'เซิร์ฟเวอร์ โดเมน SSL'], ['ดูแลต่อ', 'อัปเดตและพัฒนาต่อ'],
  ];
  steps.forEach(([t, d], i) => {
    const x = M + (i % 2) * 468, y = 590 + Math.floor(i / 2) * 134;
    s += `<rect x="${x}" y="${y - 58}" width="436" height="2" fill="${th.rule}"/>`;
    s += T({ x, y, size: 30, weight: 800, font: 'head', fill: C.cyan }, [String(i + 1).padStart(2, '0')]);
    s += T({ x: x + 60, y, size: 36, weight: 700, font: 'head', fill: C.white, maxw: 370 }, [t]);
    s += T({ x: x + 60, y: y + 44, size: 25, fill: C.white, op: .72, maxw: 376 }, [d]);
  });
  s += T({ x: M, y: 1110, size: 28, weight: 500, fill: C.white, op: .85 }, ['ใบเสนอราคาเป็นลายลักษณ์อักษร ก่อนเริ่มงานทุกครั้ง']);
  add({ group: 'template', file: 'templates/tpl-process', w: 1080, h: 1350, title: 'Template · 8 ขั้นตอนการทำงาน', spec: '1080 × 1350 (4:5)', svg: post('navy', s) });
}
{ // tip
  const th = THEME.white;
  let s = eyebrow(th, 'เคล็ดลับ #[00]');
  s += T({ x: M, y: 318, size: 80, weight: 800, font: 'head', fill: C.navy, lh: 1.22, maxw: 904 }, ['[หัวข้อเคล็ดลับ', 'ไม่เกิน 2 บรรทัด]']);
  [0, 1, 2].forEach(i => {
    const y = 590 + i * 200;
    s += T({ x: M, y: y + 10, size: 80, weight: 800, font: 'head', fill: C.blue }, [String(i + 1)]);
    s += T({ x: M + 96, y: y - 18, size: 36, weight: 700, font: 'head', fill: C.navy, maxw: 800 }, [`[ข้อที่ ${i + 1} สั้นๆ]`]);
    s += T({ x: M + 96, y: y + 30, size: 28, fill: C.slate, lh: 1.55, maxw: 800 }, ['[อธิบาย 1–2 บรรทัด ใส่ตัวเลขจริงถ้ามี]']);
  });
  add({ group: 'template', file: 'templates/tpl-tip', w: 1080, h: 1350, title: 'Template · เคล็ดลับ 3 ข้อ', spec: '1080 × 1350', svg: post('white', s) });
}
{ // review
  const th = THEME.navy;
  let s = eyebrow(th, 'เสียงจากลูกค้า');
  const q = x => `<rect x="${x}" y="300" width="60" height="60" rx="8" fill="${C.cyan}"/><path d="M${x + 30} 352 L${x + 60} 352 L${x + 36} 410 L${x + 14} 410Z" fill="${C.cyan}"/>`;
  s += q(M) + q(M + 84);
  s += T({ x: M, y: 560, size: 56, weight: 700, font: 'head', fill: C.white, lh: 1.3, maxw: 904 },
    ['[ข้อความรีวิวจากลูกค้า', 'ยกคำพูดจริง ไม่เกิน', '4 บรรทัด]']);
  s += `<rect x="${M}" y="900" width="64" height="4" fill="${C.cyan}"/>`;
  s += T({ x: M, y: 972, size: 36, weight: 700, font: 'head', fill: C.white }, ['[ชื่อ นามสกุล]']);
  s += T({ x: M, y: 1022, size: 28, fill: C.white, op: .72 }, ['[ตำแหน่ง · ชื่อธุรกิจ]']);
  add({ group: 'template', file: 'templates/tpl-review', w: 1080, h: 1350, title: 'Template · รีวิวลูกค้า', spec: '1080 × 1350', svg: post('navy', s) });
}
{ // case study
  let s = `<rect width="1080" height="700" fill="${C.mist}"/>` +
    `<rect x="40" y="40" width="1000" height="620" rx="24" fill="none" stroke="${C.line}" stroke-width="4" stroke-dasharray="16 12"/>` +
    T({ x: 540, y: 360, size: 32, weight: 600, fill: C.slate, anchor: 'middle' }, ['[วางภาพผลงาน 1080 × 700]']) +
    pixels(958, 646, 4, C.blue, C.sky, 3);
  s += eyebrow(THEME.white, 'ผลงาน · [ประเภทงาน]', 800);
  s += T({ x: M, y: 890, size: 64, weight: 800, font: 'head', fill: C.navy, lh: 1.22, maxw: 904 }, ['[ผลลัพธ์ที่ลูกค้าได้', 'เช่น ยอดจองตรงเพิ่มขึ้น]']);
  s += T({ x: M, y: 1080, size: 28, fill: C.slate, maxw: 904 }, ['[ชื่อลูกค้า · จังหวัด · เทคโนโลยีที่ใช้]']);
  add({ group: 'template', file: 'templates/tpl-case', w: 1080, h: 1350, title: 'Template · ผลงาน', spec: '1080 × 1350 · ช่องภาพ 1080 × 700', svg: post('white', s, { px: false }) });
}
{ // announcement
  const th = THEME.blue;
  let s = eyebrow(th, 'ประกาศ');
  s += T({ x: M, y: 420, size: 96, weight: 800, font: 'head', fill: C.white, lh: 1.2, maxw: 904 }, ['[หัวข้อประกาศ', 'สั้น ชัด', 'ไม่เกิน 3 บรรทัด]']);
  s += T({ x: M, y: 800, size: 33, fill: C.white, op: .9, lh: 1.6, maxw: 904 }, ['[รายละเอียด 1–2 บรรทัด]', '[วันที่ / เงื่อนไข]']);
  s += `<rect x="${M}" y="950" width="360" height="96" rx="48" fill="${C.white}"/>` +
    T({ x: M + 180, y: 1010, size: 32, weight: 700, font: 'head', fill: C.blue, anchor: 'middle' }, ['[ทักแชตเลย]']);
  add({ group: 'template', file: 'templates/tpl-announce', w: 1080, h: 1350, title: 'Template · ประกาศ', spec: '1080 × 1350', svg: post('blue', s) });
}
{ // carousel cover / inner / end
  const n = THEME.navy;
  let s = eyebrow(n, '[หมวด · เช่น เว็บโรงแรม]');
  s += T({ x: M, y: 480, size: 100, weight: 800, font: 'head', fill: C.white, lh: 1.2, maxw: 904 }, ['[หัวข้อ carousel', [['คำสำคัญ', C.cyan], [']']], 'ไม่เกิน 3 บรรทัด]']);
  s += T({ x: 992, y: 1080, size: 30, weight: 600, fill: C.white, op: .85, anchor: 'end' }, ['ปัดเพื่ออ่านต่อ  →']);
  add({ group: 'template', file: 'templates/tpl-carousel-1-cover', w: 1080, h: 1350, title: 'Carousel · หน้าปก', spec: '1080 × 1350', svg: post('navy', s) });

  let s2 = T({ x: M, y: 330, size: 180, weight: 800, font: 'head', fill: C.blue }, ['01']);
  s2 += T({ x: M, y: 500, size: 64, weight: 800, font: 'head', fill: C.navy, lh: 1.22, maxw: 904 }, ['[หัวข้อย่อยของหน้านี้', 'ไม่เกิน 2 บรรทัด]']);
  s2 += T({ x: M, y: 700, size: 32, fill: C.slate, lh: 1.65, maxw: 904 }, ['[เนื้อหา 3–5 บรรทัด ประโยคสั้น', 'บอกผลลัพธ์ก่อน แล้วค่อยบอกวิธี', 'ศัพท์เทคนิคให้อธิบายสั้นๆ ทุกครั้ง]']);
  s2 += T({ x: 992, y: 1110, size: 28, weight: 600, fill: C.slate, anchor: 'end' }, ['[2 / 6]']);
  add({ group: 'template', file: 'templates/tpl-carousel-2-inner', w: 1080, h: 1350, title: 'Carousel · หน้าเนื้อหา', spec: '1080 × 1350', svg: post('white', s2) });

  const b = THEME.blue;
  let s3 = eyebrow(b, 'สนใจเรื่องนี้?');
  s3 += T({ x: M, y: 330, size: 88, weight: 800, font: 'head', fill: C.white, lh: 1.2 }, ['คุยกับทีม', 'จากกระบี่ได้เลย']);
  s3 += `<rect x="${M}" y="520" width="904" height="460" rx="24" fill="${b.card}"/>`;
  s3 += contactRows(M + 44, 616, 84, 34, C.white, C.cyan);
  s3 += T({ x: M, y: 1080, size: 28, weight: 500, fill: C.white, op: .85 }, ['กดบันทึกโพสต์นี้ไว้อ่านทีหลังได้']);
  add({ group: 'template', file: 'templates/tpl-carousel-3-end', w: 1080, h: 1350, title: 'Carousel · หน้าปิด (ใช้ซ้ำได้)', spec: '1080 × 1350', svg: post('blue', s3) });
}
{ // story 1080 x 1920 · safe: y 250–1580
  const th = THEME.navy, mh = 1080 * mountainDissolve.ratio;
  let s = pixels(872, 280, 4, C.blue, C.cyan, 4);
  s += lockupH(M, 270, 60, 'dark');
  s += eyebrow(th, '[หมวด]', 560);
  s += T({ x: M, y: 700, size: 104, weight: 800, font: 'head', fill: C.white, lh: 1.2, maxw: 904 }, ['[หัวข้อสตอรี่', [['คำสำคัญ', C.cyan]], 'ไม่เกิน 3 บรรทัด]']);
  s += T({ x: M, y: 1080, size: 34, fill: C.white, op: .85, lh: 1.6, maxw: 904 }, ['[รายละเอียด 1–2 บรรทัด]']);
  s += `<rect x="${M}" y="1180" width="400" height="104" rx="52" fill="${C.blue}"/>` +
    T({ x: M + 200, y: 1245, size: 34, weight: 700, font: 'head', fill: C.white, anchor: 'middle' }, ['[ทักแชตเลย]']);
  s += mountainDissolve(0, 1920 - mh + 1, 1080, C.blue, 'st');
  add({ group: 'template', file: 'templates/tpl-story', w: 1080, h: 1920, title: 'Template · Story', spec: '1080 × 1920 · เนื้อหาใน y 250–1580 (บน/ล่างโดน UI บัง)', svg: svg(1080, 1920, s, C.navy) });
}

module.exports = A;
