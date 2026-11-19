/* ===========================================================================
   "WATCH IT AGE" IMAGES  -  npm run patina:build

   Makes the aged versions of a real product photo for the ageing slider on
   copper product pages: one "after a few months" and one "after a year".
   They are illustrations, not photographs, and the page labels them so.

   Only the copper is aged. Each pixel is tested for copper colour (warm hue,
   real saturation), and only those pixels are darkened, desaturated and
   shifted towards brown, with soft uneven blotches the way a real patina
   forms. The white or grey background is left untouched.
   =========================================================================== */

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = join(ROOT, "public/images/patina");

const PATINA_SOURCES: { slug: string; photo: string }[] = [
  {
    slug: "azmiq-pure-copper-water-bottle-500ml",
    photo: "public/images/products/azmiq-pure-copper-water-bottle-500ml/00-500_ml_bottle.png",
  },
  {
    slug: "pure-copper-water-bottle",
    photo: "public/images/products/pure-copper-water-bottle/11-matte-copper-water-bottle.png",
  },
  {
    slug: "premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant",
    photo:
      "public/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/08-hammerred_copper2.jpg",
  },
];

const STAGES = [
  { name: "new", darken: 1, desaturate: 1, hueShift: 0, blotch: 0 },
  { name: "months", darken: 0.76, desaturate: 0.95, hueShift: -2, blotch: 0.12 },
  { name: "year", darken: 0.46, desaturate: 0.8, hueShift: -7, blotch: 0.22 },
] as const;

/* ------------------------------------------------------------ colour math */

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}

/** How copper-coloured a pixel is, 0..1, with soft edges so the ageing has
    no hard outline against the background. */
function copperWeight(h: number, s: number, v: number): number {
  const ramp = (x: number, a: number, b: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  const hue = h <= 50 ? ramp(h, -10, 4) * (1 - ramp(h, 40, 52)) : h >= 345 ? ramp(h, 345, 360) : 0;
  return hue * ramp(s, 0.12, 0.3) * ramp(v, 0.08, 0.2);
}

/** Smooth value noise, for blotchy, uneven patina. */
function makeNoise(width: number, height: number, cell: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const gw = Math.ceil(width / cell) + 2;
  const gh = Math.ceil(height / cell) + 2;
  const grid = Float32Array.from({ length: gw * gh }, rand);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const gx = x / cell;
    const gy = y / cell;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = smooth(gx - x0);
    const ty = smooth(gy - y0);
    const v = (i: number, j: number) => grid[(y0 + j) * gw + (x0 + i)];
    const top = v(0, 0) + (v(1, 0) - v(0, 0)) * tx;
    const bottom = v(0, 1) + (v(1, 1) - v(0, 1)) * tx;
    return top + (bottom - top) * ty;
  };
}

/* ------------------------------------------------------------------ build */

async function build(slug: string, photo: string) {
  const { data, info } = await sharp(join(ROOT, photo))
    .flatten({ background: "#ffffff" })
    .resize(900, 1200, { fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const noise = makeNoise(width, height, Math.max(width, height) / 9, 11);
  const fine = makeNoise(width, height, Math.max(width, height) / 40, 23);

  for (const stage of STAGES) {
    const out = Buffer.alloc(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 3;
        const r = data[o] / 255;
        const g = data[o + 1] / 255;
        const b = data[o + 2] / 255;
        const [h, s, v] = rgbToHsv(r, g, b);
        const w = stage.name === "new" ? 0 : copperWeight(h, s, v);
        if (!w) {
          out[o] = data[o];
          out[o + 1] = data[o + 1];
          out[o + 2] = data[o + 2];
          continue;
        }
        // Patina is never even: some areas darken faster than others.
        const blotch = 1 - stage.blotch * (0.6 * noise(x, y) + 0.4 * fine(x, y));
        const nh = (((h + stage.hueShift) % 360) + 360) % 360;
        const ns = Math.min(1, s * stage.desaturate);
        const nv = v * stage.darken * blotch;
        const [ar, ag, ab] = hsvToRgb(nh, ns, nv);
        out[o] = Math.round((r + (ar - r) * w) * 255);
        out[o + 1] = Math.round((g + (ag - g) * w) * 255);
        out[o + 2] = Math.round((b + (ab - b) * w) * 255);
      }
    }
    const file = join(OUT, `${slug}-${stage.name}.jpg`);
    await sharp(out, { raw: { width, height, channels: 3 } }).jpeg({ quality: 84, mozjpeg: true }).toFile(file);
    console.log(`  ${slug}-${stage.name}.jpg  ${width}x${height}`);
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log("Building patina images:");
  for (const { slug, photo } of PATINA_SOURCES) await build(slug, photo);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
