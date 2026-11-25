// Generates favicons, the Open Graph image and the sticker image from the
// source files in design/ and docs/. Run with: npm run brand:assets
//
// Sources:
//   design/logo-mark.svg   single-colour logo mark (uses currentColor)
//   docs/sticker.png       original sticker artwork
//
// Outputs (committed to the repo):
//   src/assets/favicons/favicon.svg, favicon.ico, apple-touch-icon.png
//   src/assets/images/sticker.png   (palette-compressed copy; Astro converts it to WebP at build)
//   src/assets/images/og-default.png (1200x628 social preview)
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const WALNUT = '#5C3010';
const CREAM = '#F7F2EA';

const markSvg = await readFile('design/logo-mark.svg', 'utf8');
const markInner = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Favicon: cream mark on a walnut rounded square.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${WALNUT}"/>
  <g transform="translate(6 6) scale(0.8125)" fill="none" stroke="${CREAM}" color="${CREAM}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${markInner.replace(/<title>.*?<\/title>/, '')}</g>
</svg>
`;
await writeFile('src/assets/favicons/favicon.svg', faviconSvg);

const render = (size) =>
  sharp(Buffer.from(faviconSvg), { density: 72 * (size / 64) * 2 })
    .resize(size, size)
    .png();

await render(180).toFile('src/assets/favicons/apple-touch-icon.png');

// favicon.ico with embedded 32x32 and 48x48 PNGs (PNG-in-ICO is supported by all current browsers).
const pngs = await Promise.all(
  [32, 48].map((s) =>
    render(s)
      .toBuffer()
      .then((buf) => ({ s, buf }))
  )
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map(({ s, buf }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
await writeFile('src/assets/favicons/favicon.ico', Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]));

// Sticker copy for the site.
await sharp('docs/sticker.png')
  .resize(1024, 1024)
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile('src/assets/images/sticker.png');

// Open Graph image: sticker on cream, 1200x628.
const sticker = await sharp('docs/sticker.png').resize(560, 560).toBuffer();
await sharp({ create: { width: 1200, height: 628, channels: 4, background: CREAM } })
  .composite([{ input: sticker, top: 34, left: 320 }])
  .png()
  .toFile('src/assets/images/og-default.png');

console.log('Brand assets generated.');
