// Run this once: node create-assets.js
const fs = require('fs');
const zlib = require('zlib');

function makePNG(w, h, r, g, b) {
  function u32(n) { const buf = Buffer.alloc(4); buf.writeUInt32BE(n); return buf; }
  function chunk(name, data) {
    const nb = Buffer.from(name, 'ascii');
    const crcInput = Buffer.concat([nb, data]);
    let crc = 0xffffffff;
    for (const byte of crcInput) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc ^= 0xffffffff;
    return Buffer.concat([u32(data.length), nb, data, u32(crc >>> 0)]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const rowBuf = Buffer.alloc(1 + w * 3);
  for (let i = 0; i < w; i++) { rowBuf[1 + i*3] = r; rowBuf[2 + i*3] = g; rowBuf[3 + i*3] = b; }
  const raw = Buffer.concat(Array(h).fill(null).map(() => Buffer.from(rowBuf)));
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))
  ]);
}

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/icon.png',              makePNG(1024, 1024, 27, 79, 114));
fs.writeFileSync('assets/splash-icon.png',       makePNG(200,  200,  27, 79, 114));
fs.writeFileSync('assets/adaptive-icon.png',     makePNG(1024, 1024, 27, 79, 114));
fs.writeFileSync('assets/notification-icon.png', makePNG(96,   96,  255,255,255));
console.log('✅ Assets created:', fs.readdirSync('assets'));
