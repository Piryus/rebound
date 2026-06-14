/**
 * Generates Rebound's app icon set from the brand mark (coral upward arc + apex
 * dot on Paper Dawn). Run: node scripts/gen-icons.mjs  (requires sharp).
 */
import sharp from 'sharp';

const CORAL = '#FF6F61';
const PAPER = '#FBF7F0';
const OUT = new URL('../assets/images/', import.meta.url).pathname;

// The mark, drawn on a 1024×1024 canvas, centered, sized to sit inside the
// Android adaptive-icon safe zone (central ~66%).
const mark = (color, groundOpacity = 0.22) => `
  <line x1="290" y1="628" x2="734" y2="628" stroke="${color}" stroke-opacity="${groundOpacity}" stroke-width="50" stroke-linecap="round"/>
  <path d="M307 604 A 205 205 0 0 1 717 604" fill="none" stroke="${color}" stroke-width="70" stroke-linecap="round"/>
  <circle cx="512" cy="399" r="80" fill="${color}"/>
`;

const svg = (inner, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${
    bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''
  }${inner}</svg>`;

async function render(svgStr, file, size = 1024) {
  await sharp(Buffer.from(svgStr)).resize(size, size).png().toFile(OUT + file);
  console.log('wrote', file, size);
}

await render(svg(mark(CORAL), PAPER), 'icon.png'); // iOS + fallback (opaque)
await render(svg(mark(CORAL), null), 'android-icon-foreground.png'); // adaptive fg (transparent)
await render(svg(mark('#FFFFFF', 0.5), null), 'android-icon-monochrome.png'); // themed icon
await render(svg(mark(CORAL), null), 'splash-icon.png'); // splash mark
await render(svg(mark(CORAL), PAPER), 'favicon.png', 64); // web favicon

console.log('done');
