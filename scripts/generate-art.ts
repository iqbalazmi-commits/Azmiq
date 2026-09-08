import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* ===========================================================================
   PLACEHOLDER ART GENERATOR

   These are illustrations, not photographs. They exist so the layout can be
   judged on its real proportions - a grey box tells you nothing about whether
   copper on warm white works - and so the site is presentable before the shoot.

   They follow the photography direction: copper on warm neutral linen, natural
   side light from the left, generous negative space, and a macro view that
   actually shows the hammered facets.

   Replace them by uploading real photography in the admin panel. Nothing in
   the application depends on this script.
   =========================================================================== */

const OUT = join(process.cwd(), "public", "images", "products");
mkdirSync(OUT, { recursive: true });

/** Deterministic PRNG - regenerating must not reshuffle every facet. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

const LINEN = "#EFE9E0";
const LINEN_DEEP = "#E3DACD";
const INK = "#14181A";

function defs(seed: number) {
  return `
  <defs>
    <linearGradient id="copper" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0"    stop-color="#7E4318"/>
      <stop offset="0.18" stop-color="#C98346"/>
      <stop offset="0.34" stop-color="#F0BE86"/>
      <stop offset="0.46" stop-color="#C77F3F"/>
      <stop offset="0.72" stop-color="#A25F26"/>
      <stop offset="0.88" stop-color="#D69A5C"/>
      <stop offset="1"    stop-color="#6E3A15"/>
    </linearGradient>
    <linearGradient id="copperSoft" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0"    stop-color="#8A4C1C"/>
      <stop offset="0.3"  stop-color="#D79A5E"/>
      <stop offset="0.55" stop-color="#B87333"/>
      <stop offset="1"    stop-color="#753F17"/>
    </linearGradient>
    <linearGradient id="acacia" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0"   stop-color="#9C6B3F"/>
      <stop offset="0.5" stop-color="#C08E5A"/>
      <stop offset="1"   stop-color="#7E5330"/>
    </linearGradient>
    <linearGradient id="linen" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${LINEN}"/>
      <stop offset="1" stop-color="${LINEN_DEEP}"/>
    </linearGradient>
    <radialGradient id="sidelight" cx="0.28" cy="0.28" r="0.85">
      <stop offset="0"   stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.10"/>
      <stop offset="1"   stop-color="#8A7F70" stop-opacity="0.16"/>
    </radialGradient>
    <radialGradient id="contactShadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"   stop-color="${INK}" stop-opacity="0.36"/>
      <stop offset="0.6" stop-color="${INK}" stop-opacity="0.12"/>
      <stop offset="1"   stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
    </filter>
    <filter id="weave">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.6" numOctaves="2" seed="${seed + 7}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.07"/></feComponentTransfer>
    </filter>
    <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="16" dy="26" stdDeviation="22" flood-color="${INK}" flood-opacity="0.20"/>
    </filter>
  </defs>`;
}

/** Hammered facets, clipped to the vessel silhouette. This is the texture the
    brief asks the macro shot to show, so it is generated, not faked with blur. */
function hammered(seed: number, x: number, y: number, w: number, h: number, scale = 26) {
  const r = rng(seed);
  const cells: string[] = [];
  const step = scale;
  for (let cy = y; cy < y + h; cy += step * 0.86) {
    const offset = (Math.round((cy - y) / (step * 0.86)) % 2) * (step / 2);
    for (let cx = x - step; cx < x + w + step; cx += step) {
      const px = cx + offset + (r() - 0.5) * step * 0.28;
      const py = cy + (r() - 0.5) * step * 0.28;
      const rad = step * (0.42 + r() * 0.2);
      // Light from the left: highlight arc top-left, shade bottom-right.
      const light = 0.06 + r() * 0.16;
      const dark = 0.05 + r() * 0.14;
      cells.push(
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rad.toFixed(1)}" fill="#FFE7CC" opacity="${light.toFixed(3)}"/>`,
        `<circle cx="${(px + rad * 0.32).toFixed(1)}" cy="${(py + rad * 0.34).toFixed(1)}" r="${(rad * 0.72).toFixed(1)}" fill="#5A2E0C" opacity="${dark.toFixed(3)}"/>`,
      );
    }
  }
  return cells.join("");
}

function ground(w: number, h: number, horizon = 0.66) {
  return `
  <rect width="${w}" height="${h}" fill="url(#linen)"/>
  <rect width="${w}" height="${h}" filter="url(#weave)" opacity="0.9"/>
  <rect y="${h * horizon}" width="${w}" height="${h * (1 - horizon)}" fill="${LINEN_DEEP}" opacity="0.55"/>
  <rect width="${w}" height="${h}" fill="url(#sidelight)"/>`;
}

function grainOverlay(w: number, h: number) {
  return `<rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.5"/>`;
}

function contactShadow(cx: number, cy: number, rx: number, ry: number) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#contactShadow)"/>`;
}

/* ------------------------------------------------------------ VESSEL SHAPES */

type Shape = "bottle" | "jug" | "tumbler" | "ball" | "board" | "utensils" | "set";

function bottlePath(cx: number, top: number, bottom: number, halfW: number) {
  const neckW = halfW * 0.30;
  const shoulder = top + (bottom - top) * 0.17;
  const neckTop = top + (bottom - top) * 0.045;
  return `M ${cx - neckW} ${neckTop}
    L ${cx - neckW} ${shoulder - 46}
    C ${cx - neckW} ${shoulder - 12}, ${cx - halfW} ${shoulder - 30}, ${cx - halfW} ${shoulder + 18}
    L ${cx - halfW} ${bottom - 30}
    Q ${cx - halfW} ${bottom}, ${cx - halfW + 30} ${bottom}
    L ${cx + halfW - 30} ${bottom}
    Q ${cx + halfW} ${bottom}, ${cx + halfW} ${bottom - 30}
    L ${cx + halfW} ${shoulder + 18}
    C ${cx + halfW} ${shoulder - 30}, ${cx + neckW} ${shoulder - 12}, ${cx + neckW} ${shoulder - 46}
    L ${cx + neckW} ${neckTop} Z`;
}

function jugPath(cx: number, top: number, bottom: number, halfW: number) {
  return `M ${cx - halfW * 0.78} ${top}
    L ${cx + halfW * 0.72} ${top}
    Q ${cx + halfW * 1.02} ${top + 8}, ${cx + halfW * 0.92} ${top + 46}
    L ${cx + halfW} ${bottom - 60}
    Q ${cx + halfW} ${bottom}, ${cx + halfW - 44} ${bottom}
    L ${cx - halfW + 44} ${bottom}
    Q ${cx - halfW} ${bottom}, ${cx - halfW} ${bottom - 60}
    L ${cx - halfW * 0.78} ${top} Z`;
}

function tumblerPath(cx: number, top: number, bottom: number, halfW: number) {
  const base = halfW * 0.82;
  return `M ${cx - halfW} ${top} L ${cx + halfW} ${top}
    L ${cx + base} ${bottom - 18} Q ${cx + base} ${bottom}, ${cx + base - 16} ${bottom}
    L ${cx - base + 16} ${bottom} Q ${cx - base} ${bottom}, ${cx - base} ${bottom - 18} Z`;
}

function vessel(shape: Shape, seed: number, w: number, h: number) {
  const cx = w / 2;
  const parts: string[] = [];

  if (shape === "bottle") {
    const top = h * 0.13, bottom = h * 0.80, halfW = w * 0.145;
    parts.push(contactShadow(cx + 14, bottom + 12, halfW * 1.7, 26));
    parts.push(`<g filter="url(#softShadow)">`);
    parts.push(`<clipPath id="clipV"><path d="${bottlePath(cx, top, bottom, halfW)}"/></clipPath>`);
    parts.push(`<path d="${bottlePath(cx, top, bottom, halfW)}" fill="url(#copper)"/>`);
    parts.push(`<g clip-path="url(#clipV)">${hammered(seed, cx - halfW, top, halfW * 2, bottom - top, 30)}</g>`);
    // Cap
    const capW = halfW * 0.40, capTop = h * 0.085;
    parts.push(`<rect x="${cx - capW}" y="${capTop}" width="${capW * 2}" height="${top - capTop + 14}" rx="8" fill="url(#copperSoft)"/>`);
    parts.push(`<rect x="${cx - capW}" y="${capTop}" width="${capW * 0.5}" height="${top - capTop + 14}" rx="8" fill="#FFE7CC" opacity="0.22"/>`);
    parts.push(`</g>`);
  } else if (shape === "jug") {
    const top = h * 0.26, bottom = h * 0.80, halfW = w * 0.20;
    parts.push(contactShadow(cx + 14, bottom + 12, halfW * 1.6, 26));
    parts.push(`<g filter="url(#softShadow)">`);
    // Handle behind the body
    parts.push(`<path d="M ${cx + halfW * 0.95} ${top + 70} C ${cx + halfW * 2.05} ${top + 60}, ${cx + halfW * 2.05} ${bottom - 80}, ${cx + halfW * 0.95} ${bottom - 70}"
      fill="none" stroke="url(#copperSoft)" stroke-width="26" stroke-linecap="round"/>`);
    parts.push(`<clipPath id="clipV"><path d="${jugPath(cx, top, bottom, halfW)}"/></clipPath>`);
    parts.push(`<path d="${jugPath(cx, top, bottom, halfW)}" fill="url(#copper)"/>`);
    parts.push(`<g clip-path="url(#clipV)">${hammered(seed, cx - halfW, top, halfW * 2, bottom - top, 34)}</g>`);
    // Spout lip
    parts.push(`<path d="M ${cx - halfW * 0.82} ${top} Q ${cx - halfW * 1.16} ${top - 26}, ${cx - halfW * 0.5} ${top - 16} L ${cx + halfW * 0.76} ${top - 4} Z" fill="url(#copperSoft)"/>`);
    parts.push(`<ellipse cx="${cx - halfW * 0.03}" cy="${top}" rx="${halfW * 0.79}" ry="14" fill="#5A2E0C" opacity="0.42"/>`);
    parts.push(`</g>`);
  } else if (shape === "tumbler" || shape === "set") {
    const bottom = h * 0.79;
    const drawT = (ox: number, sc: number, s: number) => {
      const top = bottom - (h * 0.30) * sc, halfW = w * 0.10 * sc;
      return `<g transform="translate(${ox},0)">
        ${contactShadow(cx + 8, bottom + 10, halfW * 1.7, 20)}
        <g filter="url(#softShadow)">
        <clipPath id="ct${s}"><path d="${tumblerPath(cx, top, bottom, halfW)}"/></clipPath>
        <path d="${tumblerPath(cx, top, bottom, halfW)}" fill="url(#copper)"/>
        <g clip-path="url(#ct${s})">${hammered(seed + s * 31, cx - halfW, top, halfW * 2, bottom - top, 22)}</g>
        <ellipse cx="${cx}" cy="${top}" rx="${halfW}" ry="11" fill="#5A2E0C" opacity="0.40"/>
        </g></g>`;
    };
    if (shape === "set") {
      const top = h * 0.30, halfW = w * 0.17;
      parts.push(contactShadow(cx - w * 0.06, bottom + 12, halfW * 1.5, 24));
      parts.push(`<g transform="translate(${-w * 0.10},0)" filter="url(#softShadow)">`);
      parts.push(`<path d="M ${cx + halfW * 0.95} ${top + 60} C ${cx + halfW * 2.0} ${top + 54}, ${cx + halfW * 2.0} ${bottom - 70}, ${cx + halfW * 0.95} ${bottom - 62}" fill="none" stroke="url(#copperSoft)" stroke-width="22" stroke-linecap="round"/>`);
      parts.push(`<clipPath id="clipV"><path d="${jugPath(cx, top, bottom, halfW)}"/></clipPath>`);
      parts.push(`<path d="${jugPath(cx, top, bottom, halfW)}" fill="url(#copper)"/>`);
      parts.push(`<g clip-path="url(#clipV)">${hammered(seed, cx - halfW, top, halfW * 2, bottom - top, 30)}</g>`);
      parts.push(`<ellipse cx="${cx}" cy="${top}" rx="${halfW * 0.79}" ry="13" fill="#5A2E0C" opacity="0.42"/>`);
      parts.push(`</g>`);
      parts.push(drawT(w * 0.22, 0.62, 2));
      parts.push(drawT(w * 0.33, 0.62, 3));
    } else {
      parts.push(drawT(-w * 0.11, 1, 1));
      parts.push(drawT(w * 0.11, 1, 2));
    }
  } else if (shape === "ball") {
    const cy = h * 0.55, r = w * 0.19;
    parts.push(contactShadow(cx + 10, cy + r + 8, r * 1.5, 20));
    parts.push(`<g filter="url(#softShadow)">`);
    parts.push(`<clipPath id="clipV"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#copper)"/>`);
    parts.push(`<g clip-path="url(#clipV)">${hammered(seed, cx - r, cy - r, r * 2, r * 2, 24)}</g>`);
    parts.push(`<ellipse cx="${cx - r * 0.34}" cy="${cy - r * 0.40}" rx="${r * 0.30}" ry="${r * 0.20}" fill="#FFF3E4" opacity="0.42" transform="rotate(-28 ${cx - r * 0.34} ${cy - r * 0.40})"/>`);
    parts.push(`</g>`);
  } else if (shape === "board") {
    const bw = w * 0.62, bh = h * 0.30, x = cx - bw / 2, y = h * 0.42;
    parts.push(contactShadow(cx + 12, y + bh + 10, bw * 0.56, 22));
    parts.push(`<g filter="url(#softShadow)">`);
    parts.push(`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="26" fill="url(#acacia)"/>`);
    const r = rng(seed);
    for (let i = 0; i < 26; i++) {
      const gy = y + 12 + r() * (bh - 24);
      parts.push(`<path d="M ${x + 8} ${gy.toFixed(1)} Q ${cx} ${(gy + (r() - 0.5) * 26).toFixed(1)}, ${x + bw - 8} ${gy.toFixed(1)}" stroke="#5E3D22" stroke-opacity="${(0.06 + r() * 0.13).toFixed(3)}" stroke-width="${(1 + r() * 2.4).toFixed(1)}" fill="none"/>`);
    }
    parts.push(`<circle cx="${x + bw - 52}" cy="${y + 44}" r="13" fill="#5E3D22" opacity="0.5"/>`);
    parts.push(`</g>`);
  } else if (shape === "utensils") {
    const baseY = h * 0.80;
    const r = rng(seed);
    for (let i = 0; i < 3; i++) {
      const ox = cx + (i - 1) * w * 0.155;
      const topY = h * 0.24 + r() * 24;
      parts.push(`<g filter="url(#softShadow)" transform="rotate(${(i - 1) * 7} ${ox} ${baseY})">`);
      parts.push(`<rect x="${ox - 13}" y="${topY + 120}" width="26" height="${baseY - topY - 120}" rx="13" fill="url(#acacia)"/>`);
      if (i === 1) {
        parts.push(`<ellipse cx="${ox}" cy="${topY + 78}" rx="52" ry="82" fill="url(#acacia)"/>`);
      } else {
        parts.push(`<path d="M ${ox - 52} ${topY + 150} L ${ox - 44} ${topY + 20} Q ${ox} ${topY - 10}, ${ox + 44} ${topY + 20} L ${ox + 52} ${topY + 150} Z" fill="url(#acacia)"/>`);
      }
      parts.push(`</g>`);
    }
  }
  return parts.join("");
}

/* ----------------------------------------------------------------- VARIANTS */

function heroSvg(shape: Shape, seed: number, w = 1200, h = 1500) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
${defs(seed)}${ground(w, h, 0.74)}${vessel(shape, seed, w, h)}${grainOverlay(w, h)}</svg>`;
}

/** Macro: crop hard into the facets. This is the shot that sells "handcrafted". */
function macroSvg(seed: number, w = 1200, h = 1200) {
  const r = rng(seed + 5);
  const highlights = Array.from({ length: 5 }, () => {
    const cx = r() * w, cy = r() * h, rad = 120 + r() * 200;
    return `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rad.toFixed(0)}" ry="${(rad * 0.7).toFixed(0)}" fill="#FFE7CC" opacity="0.07"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
${defs(seed)}
<rect width="${w}" height="${h}" fill="url(#copper)"/>
${hammered(seed, -40, -40, w + 80, h + 80, 118)}
${highlights}
<rect width="${w}" height="${h}" fill="url(#sidelight)" opacity="0.5"/>
${grainOverlay(w, h)}</svg>`;
}

/** In use: a table edge, a wall, and the product actually placed in a setting. */
function lifestyleSvg(shape: Shape, seed: number, w = 1200, h = 1500) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
${defs(seed)}
<rect width="${w}" height="${h}" fill="#DED5C8"/>
<rect width="${w}" height="${h * 0.62}" fill="#CFC5B6"/>
<rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="url(#linen)"/>
<rect y="${h * 0.62}" width="${w}" height="10" fill="#B8AC9A" opacity="0.6"/>
<rect x="${w * 0.06}" y="${h * 0.10}" width="${w * 0.30}" height="${h * 0.40}" rx="4" fill="#C6BCAC" opacity="0.55"/>
<rect width="${w}" height="${h}" fill="url(#sidelight)"/>
${vessel(shape, seed + 11, w, h)}
${grainOverlay(w, h)}</svg>`;
}

/** Scale: the product beside a hand silhouette, because "950ml" means nothing
    to most people until they see it held. */
function scaleSvg(shape: Shape, seed: number, w = 1200, h = 1500) {
  const handX = w * 0.70, handY = h * 0.46;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
${defs(seed)}${ground(w, h, 0.74)}
<g opacity="0.30" fill="${INK}">
  <path d="M ${handX} ${handY + 300}
    C ${handX - 40} ${handY + 210}, ${handX - 44} ${handY + 120}, ${handX - 20} ${handY + 60}
    C ${handX - 8} ${handY + 18}, ${handX + 26} ${handY + 10}, ${handX + 34} ${handY + 54}
    L ${handX + 44} ${handY + 130}
    C ${handX + 62} ${handY + 96}, ${handX + 96} ${handY + 104}, ${handX + 92} ${handY + 152}
    L ${handX + 84} ${handY + 214}
    C ${handX + 96} ${handY + 250}, ${handX + 84} ${handY + 300}, ${handX + 54} ${handY + 322} Z"/>
</g>
${vessel(shape, seed, w, h)}
${grainOverlay(w, h)}</svg>`;
}

/* --------------------------------------------------------------------- RUN */

export type ArtSpec = { slug: string; shape: Shape };

export function generateArtFor(specs: ArtSpec[]) {
  let count = 0;
  specs.forEach((spec, i) => {
    const seed = 1000 + i * 137;
    const files: [string, string][] = [
      [`${spec.slug}-hero.svg`, heroSvg(spec.shape, seed)],
      [`${spec.slug}-macro.svg`, macroSvg(seed)],
      [`${spec.slug}-lifestyle.svg`, lifestyleSvg(spec.shape, seed)],
      [`${spec.slug}-scale.svg`, scaleSvg(spec.shape, seed)],
    ];
    for (const [name, svg] of files) {
      writeFileSync(join(OUT, name), svg, "utf8");
      count++;
    }
  });
  return count;
}

// Also generate the editorial imagery the home page needs.
function editorial() {
  const dir = join(process.cwd(), "public", "images");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "hero-pour.svg"), lifestyleSvg("jug", 4242, 2000, 1200), "utf8");
  writeFileSync(join(dir, "editorial-texture.svg"), macroSvg(777, 1600, 1000), "utf8");
  writeFileSync(join(dir, "editorial-ayurveda.svg"), heroSvg("bottle", 5150, 1400, 1000), "utf8");
  writeFileSync(join(dir, "og-default.svg"), lifestyleSvg("set", 9001, 1200, 630), "utf8");
}

if (process.argv[1] && process.argv[1].includes("generate-art")) {
  // Imported lazily so this script has no dependency on the database.
  import("./catalogue").then(({ CATALOGUE }) => {
    const n = generateArtFor(CATALOGUE.map((p) => ({ slug: p.slug, shape: p.shape })));
    editorial();
    console.log(`Generated ${n + 4} placeholder images in public/images`);
  });
}
