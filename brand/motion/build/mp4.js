// Minimal MP4 writer: one H.264 track, constant frame rate, no B-frames, moov before mdat (fast start).
// samples: [{ data: Buffer, key: bool }], avcC: Buffer (VideoEncoder decoderConfig.description)
function box(type, ...parts) {
  const body = Buffer.concat(parts.map(p => (Buffer.isBuffer(p) ? p : Buffer.from(p))));
  const head = Buffer.alloc(8);
  head.writeUInt32BE(8 + body.length, 0);
  head.write(type, 4, 'ascii');
  return Buffer.concat([head, body]);
}
const full = (type, version, flags, ...parts) => {
  const vf = Buffer.alloc(4);
  vf.writeUInt32BE(((version & 0xff) << 24) | (flags & 0xffffff), 0);
  return box(type, vf, ...parts);
};
const u32 = (...n) => { const b = Buffer.alloc(4 * n.length); n.forEach((v, i) => b.writeUInt32BE(v >>> 0, i * 4)); return b; };
const u16 = (...n) => { const b = Buffer.alloc(2 * n.length); n.forEach((v, i) => b.writeUInt16BE(v & 0xffff, i * 2)); return b; };
const MATRIX = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);

function mux({ samples, avcC, width, height, fps }) {
  const n = samples.length;
  const durMs = Math.round((n / fps) * 1000);
  const ftyp = box('ftyp', 'isom', u32(512), 'isomiso2avc1mp41');

  const build = mdatOffset => {
    const avc1 = box('avc1',
      Buffer.alloc(6), u16(1),                  // reserved, data_reference_index
      Buffer.alloc(16),                          // pre_defined / reserved
      u16(width, height), u32(0x480000, 0x480000, 0), u16(1),
      Buffer.alloc(32),                          // compressor name
      u16(0x18, 0xffff),
      box('avcC', avcC));
    const stbl = box('stbl',
      full('stsd', 0, 0, u32(1), avc1),
      full('stts', 0, 0, u32(1, n, 1)),
      full('stss', 0, 0, u32(samples.filter(s => s.key).length), u32(...samples.map((s, i) => (s.key ? i + 1 : 0)).filter(Boolean))),
      full('stsc', 0, 0, u32(1, 1, n, 1)),
      full('stsz', 0, 0, u32(0, n), u32(...samples.map(s => s.data.length))),
      full('stco', 0, 0, u32(1, mdatOffset)));
    const minf = box('minf',
      full('vmhd', 0, 1, u16(0, 0, 0, 0)),
      box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
      stbl);
    const mdia = box('mdia',
      full('mdhd', 0, 0, u32(0, 0, fps, n), u16(0x55c4, 0)),
      full('hdlr', 0, 0, u32(0), 'vide', Buffer.alloc(12), 'VideoHandler\0'),
      minf);
    const trak = box('trak',
      full('tkhd', 0, 3, u32(0, 0, 1, 0, durMs), Buffer.alloc(8), u16(0, 0, 0, 0), MATRIX, u32(width << 16, height << 16)),
      mdia);
    return box('moov',
      full('mvhd', 0, 0, u32(0, 0, 1000, durMs, 0x10000), u16(0x100, 0), Buffer.alloc(8), MATRIX, Buffer.alloc(24), u32(2)),
      trak);
  };
  const moovLen = build(0).length;
  const moov = build(ftyp.length + moovLen + 8);
  const payload = Buffer.concat(samples.map(s => s.data));
  return Buffer.concat([ftyp, moov, box('mdat', payload)]);
}

module.exports = { mux };
