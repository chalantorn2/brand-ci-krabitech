/* Krabi Digital Solutions · document engine for quotation.html / invoice.html / receipt.html
   Edit COMPANY and BANK once. Everything else is edited on the page and autosaved in this browser. */
const COMPANY = {
  name: 'Krabi Digital Solutions',
  legal: '[ชื่อนิติบุคคลตามที่จดทะเบียน]',
  address: '[ที่อยู่บริษัท] จ.กระบี่ [รหัสไปรษณีย์]',
  taxId: '[เลขประจำตัวผู้เสียภาษี 13 หลัก]',
  branch: 'สำนักงานใหญ่',
  phone: '080-893-0617',
  email: 'contact@krabitech.com',
  web: 'krabitech.com',
  line: '@982ghtqj',
};
const BANK = 'ธนาคาร [ชื่อธนาคาร] สาขา [สาขา]\nชื่อบัญชี [ชื่อบัญชี]\nเลขที่บัญชี [xxx-x-xxxxx-x]';
const VAT_RATE = 0.07, WHT_RATE = 0.03;

const TYPES = {
  quotation: {
    th: 'ใบเสนอราคา', en: 'QUOTATION', prefix: 'QT',
    meta: [['เลขที่', 'no'], ['วันที่', 'date'], ['ยืนราคาถึง', 'until'], ['ผู้ดูแลโปรเจกต์', 'owner']],
    until: 30,
    notesA: ['เงื่อนไข', '• ชำระมัดจำ [50]% เมื่อยืนยันงาน ส่วนที่เหลือเมื่อส่งมอบ\n• รับประกันแก้ไขข้อผิดพลาดหลังส่งมอบ [3] เดือน\n• ไม่รวมค่าโดเมน โฮสติ้ง และบริการภายนอก เว้นแต่ระบุในรายการ\n• เริ่มงานภายใน [7] วันหลังได้รับมัดจำ'],
    notesB: ['ช่องทางชำระเงิน', BANK],
    sign: [['ผู้เสนอราคา', COMPANY.name], ['ผู้อนุมัติสั่งงาน', 'ลูกค้า · วันที่ ____/____/______']],
  },
  invoice: {
    th: 'ใบแจ้งหนี้', en: 'INVOICE', prefix: 'INV', from: 'quotation',
    meta: [['เลขที่', 'no'], ['วันที่', 'date'], ['ครบกำหนดชำระ', 'until'], ['อ้างอิง', 'ref']],
    until: 7,
    notesA: ['หมายเหตุ', 'งวดที่ [1] จาก [2] · [มัดจำ 50%]\nกรุณาแจ้งหลักฐานการโอนทาง LINE @982ghtqj หรือ contact@krabitech.com'],
    notesB: ['ช่องทางชำระเงิน', BANK],
    sign: [['ผู้วางบิล', COMPANY.name], ['ผู้รับวางบิล', 'วันที่ ____/____/______']],
  },
  receipt: {
    th: 'ใบเสร็จรับเงิน', en: 'RECEIPT', prefix: 'RC', from: 'invoice', vatTitle: 'ใบเสร็จรับเงิน / ใบกำกับภาษี', thVat: 'RECEIPT / TAX INVOICE',
    meta: [['เลขที่', 'no'], ['วันที่', 'date'], ['อ้างอิง', 'ref']],
    notesA: ['ชำระโดย', null],
    notesB: ['หมายเหตุ', 'ได้รับเงินตามรายการข้างต้นเรียบร้อยแล้ว\nใบเสร็จนี้จะสมบูรณ์เมื่อเรียกเก็บเงินตามเช็คได้แล้ว'],
    sign: [['ผู้รับเงิน', COMPANY.name], ['ผู้มีอำนาจลงนาม', COMPANY.name]],
  },
};

const TYPE = document.body.dataset.doc;
const T = TYPES[TYPE];
const KEY = 'kd-doc-' + TYPE;

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = s => { const v = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isFinite(v) ? v : 0; };
const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const thDate = d => `${d.getDate()} ${TH_M[d.getMonth()]} ${d.getFullYear() + 543}`;
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

// Thai baht text, e.g. 1,250.50 -> หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์
function bahtText(n) {
  const D = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const P = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  const group = (s, hasHigher) => {
    let out = ''; const len = s.length;
    for (let i = 0; i < len; i++) {
      const d = +s[i], pos = len - i - 1;
      if (!d) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && (+s.slice(0, -1) > 0 || hasHigher)) out += 'เอ็ด';
      else out += D[d] + P[pos];
    }
    return out;
  };
  const read = s => {
    s = s.replace(/^0+/, '');
    if (!s) return '';
    if (s.length <= 6) return group(s, false);
    const hi = s.slice(0, -6), lo = s.slice(-6);
    return read(hi) + 'ล้าน' + group(lo.replace(/^0+/, ''), true);
  };
  n = Math.round(Math.abs(n) * 100) / 100;
  const [b, st] = n.toFixed(2).split('.');
  if (+b === 0 && +st === 0) return 'ศูนย์บาทถ้วน';
  return (+b ? read(b) + 'บาท' : '') + (+st ? read(st) + 'สตางค์' : 'ถ้วน');
}

/* ---------- state ---------- */
function defaults() {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return {
    no: `${T.prefix}-${ym}-001`, date: thDate(d), until: T.until ? thDate(addDays(T.until)) : '',
    owner: '[ชื่อผู้ดูแลโปรเจกต์]', ref: T.from ? `[เลขที่ ${TYPES[T.from].prefix}]` : '',
    client: { name: 'บริษัท [ชื่อลูกค้า] จำกัด (สำนักงานใหญ่)', addr: '[ที่อยู่ลูกค้า]', tax: 'เลขประจำตัวผู้เสียภาษี [13 หลัก]', contact: 'คุณ[ผู้ติดต่อ] · [เบอร์โทร]' },
    items: [
      { t: 'เว็บไซต์พร้อมระบบจองห้องพัก', d: 'ออกแบบ UX/UI 2 ภาษา (ไทย / อังกฤษ)\nระบบจองตรงพร้อมปฏิทินห้องว่าง\nOn-page SEO เบื้องต้น', q: 1, u: 'งาน', p: 85000 },
      { t: 'ตั้งค่าโดเมน อีเมลบริษัท และ SSL', d: '', q: 1, u: 'งาน', p: 3500 },
      { t: 'ดูแลเซิร์ฟเวอร์และสำรองข้อมูล', d: 'อัปเดตระบบ ตรวจสอบความปลอดภัย สำรองข้อมูลรายวัน', q: 12, u: 'เดือน', p: 2500 },
    ],
    discount: 0, vat: false, wht: false, copy: false,
    notesA: T.notesA[1], notesB: T.notesB[1],
    pay: { cash: false, transfer: true, cheque: false, bank: '[ธนาคาร]', chequeNo: '[เลขที่เช็ค]' },
  };
}
let S = Object.assign(defaults(), store.get(KEY) || {});
const save = () => store.set(KEY, S);

function totals() {
  const sub = S.items.reduce((a, it) => a + num(it.q) * num(it.p), 0);
  const base = Math.max(0, sub - num(S.discount));
  const vat = S.vat ? base * VAT_RATE : 0;
  const grand = base + vat;
  const wht = S.wht ? base * WHT_RATE : 0;
  return { sub, base, vat, grand, wht, net: grand - wht };
}

/* ---------- render ---------- */
const MARK = '<svg viewBox="12 12 80 80" aria-hidden="true"><rect x="12" y="12" width="22" height="76" rx="2" fill="#041A53"/><path d="M34 50 L62 12 H88 L52 62 H34Z" fill="#0059FF"/><rect x="52" y="58" width="14" height="14" rx="2" fill="#0059FF"/><rect x="69" y="71" width="12" height="12" rx="2" fill="#0059FF"/><rect x="84" y="84" width="8" height="8" rx="1.5" fill="#7FAEFF"/><rect x="72" y="56" width="7" height="7" rx="1.5" fill="#7FAEFF"/></svg>';
const ed = (k, v, cls = '') => `<span contenteditable="plaintext-only" spellcheck="false" data-k="${k}" class="${cls}${/\[/.test(v) ? ' ph' : ''}">${esc(v)}</span>`;
const edB = (k, v, cls = '') => `<div contenteditable="plaintext-only" spellcheck="false" data-k="${k}" class="${cls}${/\[/.test(v) ? ' ph' : ''}">${esc(v)}</div>`;
const ph = v => (/\[/.test(v) ? ' class="ph"' : '');

function render() {
  const title = S.vat && T.vatTitle ? T.vatTitle : T.th;
  const en = S.vat && T.thVat ? T.thVat : T.en;
  document.title = `${title} ${S.no} · Krabi Digital Solutions`;
  const rows = S.items.map((it, i) => `<tr>
      <td>${i + 1}<button class="del" type="button" data-del="${i}" aria-label="ลบรายการ ${i + 1}">×</button></td>
      <td>${edB(`items.${i}.t`, it.t, 't')}${edB(`items.${i}.d`, it.d, 'd')}</td>
      <td class="n">${ed(`items.${i}.q`, it.q)}</td>
      <td>${ed(`items.${i}.u`, it.u)}</td>
      <td class="n">${ed(`items.${i}.p`, money(num(it.p)))}</td>
      <td class="n" data-amt="${i}">${money(num(it.q) * num(it.p))}</td></tr>`).join('');

  const payBox = TYPE === 'receipt'
    ? `<div class="pay"><label><i data-pay="cash"${S.pay.cash ? ' class="on"' : ''}></i>เงินสด</label><label><i data-pay="transfer"${S.pay.transfer ? ' class="on"' : ''}></i>โอนเงิน ${ed('pay.bank', S.pay.bank)}</label><label><i data-pay="cheque"${S.pay.cheque ? ' class="on"' : ''}></i>เช็ค ${ed('pay.chequeNo', S.pay.chequeNo)}</label></div>`
    : edB('notesA', S.notesA);

  $('#paper').innerHTML = `
  <div class="head">
    <div class="lock">${MARK}<div><div class="a">Krabi Digital</div><div class="b">SOLUTIONS</div></div></div>
    <div class="title"><div class="en">${en}</div><h1${title.length > 14 ? ' class="long"' : ''}>${title}</h1>${TYPE === 'receipt' ? `<div class="copy">${S.copy ? 'สำเนา' : 'ต้นฉบับ'}</div>` : ''}</div>
  </div>
  <div class="parties">
    <div><div class="lbl">ผู้ออกเอกสาร</div><div class="nm">${esc(COMPANY.name)}</div>
      <p${ph(COMPANY.legal)}>${esc(COMPANY.legal)}</p><p${ph(COMPANY.address)}>${esc(COMPANY.address)}</p>
      <p class="muted"><span${ph(COMPANY.taxId)}>เลขประจำตัวผู้เสียภาษี ${esc(COMPANY.taxId)}</span> · ${esc(COMPANY.branch)}</p>
      <p class="muted">${COMPANY.phone} · ${COMPANY.email}</p></div>
    <div><div class="lbl">${TYPE === 'receipt' ? 'ได้รับเงินจาก' : 'ลูกค้า'}</div>${edB('client.name', S.client.name, 'nm')}${edB('client.addr', S.client.addr)}${edB('client.tax', S.client.tax, 'muted')}${edB('client.contact', S.client.contact, 'muted')}</div>
    <dl class="meta">${T.meta.map(([l, k]) => `<dt>${l}</dt><dd class="${k === 'no' || k === 'ref' ? 'no' : ''}">${ed(k, S[k])}</dd>`).join('')}</dl>
  </div>
  <table class="items">
    <thead><tr><th>#</th><th>รายละเอียด</th><th class="n">จำนวน</th><th>หน่วย</th><th class="n">ราคาต่อหน่วย</th><th class="n">จำนวนเงิน (บาท)</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <button class="add" type="button" id="add">+ เพิ่มรายการ</button>
  <div class="sum">
    <div class="words"><div class="lbl">จำนวนเงินตัวอักษร</div><div class="bt" id="words"></div></div>
    <div class="tot" id="tot"></div>
  </div>
  <div class="notes">
    <div class="box"><div class="lbl">${T.notesA[0]}</div>${payBox}</div>
    <div class="box"><div class="lbl">${T.notesB[0]}</div>${edB('notesB', S.notesB)}</div>
  </div>
  <div class="sign">${T.sign.map(([r, n]) => `<div><div class="ln"></div><b>${r}</b>${esc(n)}</div>`).join('')}</div>
  <div class="foot"><span>${COMPANY.name} · ${COMPANY.web} · ${COMPANY.phone} · LINE ${COMPANY.line}</span><span class="mono">${esc(S.no)}</span></div>
  <svg class="px-br" viewBox="0 0 100 100" aria-hidden="true"><rect x="0" y="0" width="46" height="46" rx="6" fill="#0059FF"/><rect x="58" y="58" width="42" height="42" rx="6" fill="#7FAEFF"/></svg>`;
  renderTotals();
}

function renderTotals() {
  const t = totals();
  const disc = num(S.discount);
  $('#tot').innerHTML = `
    <span>รวมเป็นเงิน</span><b>${money(t.sub)}</b>
    <span>ส่วนลด</span><b>${ed('discount', money(disc))}</b>
    ${disc ? `<span>ยอดหลังหักส่วนลด</span><b>${money(t.base)}</b>` : ''}
    ${S.vat ? `<span>ภาษีมูลค่าเพิ่ม 7%</span><b>${money(t.vat)}</b>` : ''}
    <div class="grand"><span>ยอดรวมทั้งสิ้น</span><b>${money(t.grand)}</b></div>
    ${S.wht ? `<span>หัก ณ ที่จ่าย 3% (จากยอดก่อน VAT)</span><b>−${money(t.wht)}</b><div class="net"><span>ยอดชำระสุทธิ</span><b>${money(t.net)}</b></div>` : ''}`;
  $('#words').textContent = bahtText(t.grand);
  S.items.forEach((it, i) => { const c = document.querySelector(`[data-amt="${i}"]`); if (c) c.textContent = money(num(it.q) * num(it.p)); });
}

/* ---------- editing ---------- */
function setPath(path, v) {
  const ks = path.split('.'); let o = S;
  ks.slice(0, -1).forEach(k => { o = o[k]; });
  o[ks[ks.length - 1]] = v;
}
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.k; if (!k) return;
  const v = e.target.innerText.replace(/\n$/, '');
  setPath(k, /\.(q|p)$/.test(k) || k === 'discount' ? num(v) : v);
  e.target.classList.toggle('ph', /\[/.test(v));
  if (/\.(q|p)$/.test(k) || k === 'discount') renderTotals0(e.target);
  if (k === 'no') document.querySelector('.foot .mono').textContent = v;
  save();
});
// recompute without re-rendering the field being typed in
function renderTotals0(active) {
  if (active.closest('#tot')) {
    const t = totals();
    $('#words').textContent = bahtText(t.grand);
    return;
  }
  renderTotals();
}
document.addEventListener('focusout', e => {
  const k = e.target.dataset && e.target.dataset.k; if (!k) return;
  if (/\.p$/.test(k) || k === 'discount') { e.target.textContent = money(num(e.target.textContent)); renderTotals(); }
});
document.addEventListener('keydown', e => {
  const k = e.target.dataset && e.target.dataset.k;
  if (k && e.key === 'Enter' && !/\.d$|notes|addr/.test(k)) { e.preventDefault(); e.target.blur(); }
});
document.addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (del) { S.items.splice(+del.dataset.del, 1); save(); render(); return; }
  if (e.target.id === 'add') { S.items.push({ t: 'รายการใหม่', d: '', q: 1, u: 'งาน', p: 0 }); save(); render(); return; }
  const pay = e.target.closest('label') && e.target.closest('label').querySelector('[data-pay]');
  if (pay && !e.target.dataset.k) { S.pay[pay.dataset.pay] = !S.pay[pay.dataset.pay]; save(); render(); }
});

/* ---------- toolbar ---------- */
function tools() {
  const links = Object.entries(TYPES).map(([k, v]) => `<a href="${k}.html"${k === TYPE ? ' aria-current="page"' : ''}>${v.th}</a>`).join('');
  const src = T.from && TYPES[T.from];
  $('#tools').innerHTML = `<div class="in">${links}<span class="sp"></span>
    <label><input type="checkbox" id="vat"${S.vat ? ' checked' : ''}> VAT 7%</label>
    <label><input type="checkbox" id="wht"${S.wht ? ' checked' : ''}> หัก ณ ที่จ่าย 3%</label>
    ${TYPE === 'receipt' ? `<label><input type="checkbox" id="copy"${S.copy ? ' checked' : ''}> สำเนา</label>` : ''}
    ${src ? `<button type="button" id="pull">ดึงข้อมูลจาก${src.th}</button>` : ''}
    <button type="button" id="reset">ล้างเป็นค่าเริ่มต้น</button>
    <button type="button" class="pri" id="print">พิมพ์ / PDF</button></div>`;
  $('#vat').onchange = e => { S.vat = e.target.checked; save(); render(); };
  $('#wht').onchange = e => { S.wht = e.target.checked; save(); render(); };
  if ($('#copy')) $('#copy').onchange = e => { S.copy = e.target.checked; save(); render(); };
  $('#print').onclick = () => window.print();
  $('#reset').onclick = () => { if (confirm('ล้างข้อมูลในเอกสารนี้กลับเป็นค่าเริ่มต้น?')) { store.del(KEY); S = defaults(); render(); tools(); } };
  if (src) $('#pull').onclick = () => {
    const o = store.get('kd-doc-' + T.from);
    if (!o) { alert(`ยังไม่มีข้อมูล${src.th}ที่บันทึกในเบราว์เซอร์นี้`); return; }
    Object.assign(S, { client: o.client, items: o.items, discount: o.discount, vat: o.vat, wht: o.wht, ref: o.no });
    save(); render(); tools();
  };
}

tools();
render();
