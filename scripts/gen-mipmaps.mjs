/**
 * Regenerates the Android launcher mipmaps directly from the Rebound mark,
 * bypassing Expo's prebuild fingerprint (which skips when only asset *contents*
 * change). Run: node scripts/gen-mipmaps.mjs
 */
import sharp from 'sharp';

const R = new URL('../android/app/src/main/res/', import.meta.url).pathname;
const CORAL = '#FF6F61';
const PAPER = '#FBF7F0';

const FG = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
const LC = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const SPLASH = { mdpi: 288, hdpi: 432, xhdpi: 576, xxhdpi: 864, xxxhdpi: 1152 };

// Mark drawn in a 1024 space, center (512, 486), ~444 wide. Scaled + centered
// into an S×S canvas at `frac` of its width.
function markSvg(S, color, frac, { bg = null, groundOp = 0.22 } = {}) {
  const markW = 444;
  const s = (frac * S) / markW;
  const inner = `
    <line x1="290" y1="628" x2="734" y2="628" stroke="${color}" stroke-opacity="${groundOp}" stroke-width="50" stroke-linecap="round"/>
    <path d="M307 604 A 205 205 0 0 1 717 604" fill="none" stroke="${color}" stroke-width="70" stroke-linecap="round"/>
    <circle cx="512" cy="399" r="80" fill="${color}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
    ${bg ? `<rect width="${S}" height="${S}" fill="${bg}"/>` : ''}
    <g transform="translate(${S / 2} ${S / 2}) scale(${s}) translate(-512 -486)">${inner}</g>
  </svg>`;
}

async function toWebp(svg, out, size, { circle = false } = {}) {
  let img = sharp(Buffer.from(svg));
  if (circle) {
    const mask = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`;
    img = img.composite([{ input: Buffer.from(mask), blend: 'dest-in' }]);
  }
  await img.webp({ quality: 95, alphaQuality: 100 }).toFile(out);
}

for (const [d, size] of Object.entries(FG)) {
  await toWebp(markSvg(size, CORAL, 0.62), `${R}mipmap-${d}/ic_launcher_foreground.webp`, size);
  await toWebp(markSvg(size, '#FFFFFF', 0.62, { groundOp: 0.5 }), `${R}mipmap-${d}/ic_launcher_monochrome.webp`, size);
}
for (const [d, size] of Object.entries(LC)) {
  await toWebp(markSvg(size, CORAL, 0.52, { bg: PAPER }), `${R}mipmap-${d}/ic_launcher.webp`, size);
  await toWebp(markSvg(size, CORAL, 0.52, { bg: PAPER }), `${R}mipmap-${d}/ic_launcher_round.webp`, size, { circle: true });
}
for (const [d, size] of Object.entries(SPLASH)) {
  await sharp(Buffer.from(markSvg(size, CORAL, 0.55)))
    .png()
    .toFile(`${R}drawable-${d}/splashscreen_logo.png`);
}

console.log('mipmaps + splash regenerated');
