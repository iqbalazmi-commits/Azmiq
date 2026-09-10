import "./load-env";
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";

/* ===========================================================================
   BUILD CATALOGUE FROM THE LIVE AZMIQ SHOPIFY EXPORT

   Input  : scripts/data/shopify-products.json  (a snapshot of azmiq.com/products.json)
   Output : scripts/catalogue.ts                (typed seed data)
            public/images/products/<handle>/*   (the real product photography)

   This is a one-way transform: the storefront never talks to Shopify at
   runtime. Re-run it only to refresh the snapshot. Nothing here invents a
   product — the catalogue is exactly the 13 products on azmiq.com.
   =========================================================================== */

type ShopifyVariant = {
  id: number; title: string;
  option1: string | null; option2: string | null; option3: string | null;
  sku: string | null; price: string; compare_at_price: string | null;
  grams: number; requires_shipping: boolean;
};
type ShopifyImage = {
  id: number; src: string; width: number; height: number;
  position: number; alt: string | null; variant_ids: number[];
};
type ShopifyProduct = {
  id: number; title: string; handle: string; body_html: string;
  product_type: string; tags: string[]; created_at: string; updated_at: string;
  options: { name: string; values: string[] }[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
};

const ROOT = join(import.meta.dirname, "..");
const SNAPSHOT = join(ROOT, "scripts/data/shopify-products.json");
const IMAGE_ROOT = join(ROOT, "public/images/products");

/* ------------------------------------------------------------ CATEGORIES */
/* Derived 1:1 from Shopify product_type. Titles are Shopify's own. */
const CATEGORY_BY_TYPE: Record<string, { slug: string; title: string; subtitle: string; description: string }> = {
  "Copper Water Bottles": {
    slug: "copper-water-bottles",
    title: "Copper Water Bottles",
    subtitle: "Tamra jal, every morning",
    description:
      "Handcrafted 100% pure copper bottles — hammered, hand-etched, matte and dual-finish, from 500ml to 950ml. Unlined, unlacquered and leak-proof, made for the Ayurvedic practice of storing water overnight.",
  },
  "Copper Jugs & Pitchers": {
    slug: "copper-jugs-pitchers",
    title: "Copper Jugs & Pitchers",
    subtitle: "For the table, and for the night",
    description:
      "Generous copper jugs and lidded pitchers, hand-hammered by artisans who have worked the metal for generations. Beautiful enough for the table, practical enough for the bedside.",
  },
  "Wellness Gift Sets": {
    slug: "wellness-gift-sets",
    title: "Wellness Gift Sets",
    subtitle: "Complete, and considered",
    description:
      "Matched sets of jug, bottle and tumblers — the traditional way copper is served, and the gift people remember. Our best value per piece.",
  },
  "Copper Accessories": {
    slug: "copper-accessories",
    title: "Copper Accessories",
    subtitle: "The quieter objects",
    description:
      "Solid copper pieces for the daily ritual — drop-in copper balls that bring the benefits of a copper vessel to the glass bottle you already own.",
  },
  "Kitchen Utensils": {
    slug: "kitchen-utensils",
    title: "Kitchen Utensils",
    subtitle: "Warm grain, honest tools",
    description:
      "Utensils turned from sustainably sourced acacia — dense, close-grained, non-stick safe and warm against copper.",
  },
};

/* -------------------------------------------------------------- EDITORIAL */
/* Per-product copy that Shopify has no field for: a one-line subtitle, and
   which four lead the home page. Everything else (description, features,
   wellness story) is taken from the real product description. */
const EDITORIAL: Record<string, { subtitle: string; summary: string; featured?: boolean }> = {
  "azmiq-pure-copper-balls-handmade-with-cotton-pouch": {
    subtitle: "The copper vessel, in your glass bottle",
    summary: "Drop them into the glass bottle you already own and store water the traditional way, in pure copper.",
  },
  "azmiq-pure-copper-water-bottle-500ml": {
    subtitle: "The everyday 500ml, in pure copper",
    summary: "The everyday size in 100% pure copper — smooth, seamless and leak-proof, made for tamra jal.",
    featured: true,
  },
  "hammered-copper-jug": {
    subtitle: "Hand-hammered, for the table",
    summary: "Hand-hammered from pure copper, for water served at the table or left overnight by the bed.",
    featured: true,
  },
  "azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder": {
    subtitle: "Ten pieces, one holder, sustainable acacia",
    summary: "Ten kitchen tools turned from sustainably sourced acacia, with a matching holder. Non-stick safe.",
  },
  "hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set": {
    subtitle: "Copper and brass, jug and tumblers",
    summary: "A hammered copper jug with brass handle and spout, and matching tumblers — a set made to be given.",
  },
  "hammered-copper-jug-tumbler-set-ayurvedic-drinkware-collection": {
    subtitle: "The classic jug-and-tumbler service",
    summary: "The classic service: a lidded hammered jug with tumblers, in 100% pure copper.",
  },
  "hammered-copper-jug-with-lid-ayurvedic-water-pitcher": {
    subtitle: "Lidded, from one to two litres",
    summary: "A lidded, hand-hammered copper pitcher in three sizes, from one to two litres. Keeps water dust-free.",
  },
  "ayurvedic-copper-water-set": {
    subtitle: "Jug, bottle and two glasses",
    summary: "A 1.1L jug, a bottle and two glasses in pure copper — the complete set for the daily ritual.",
    featured: true,
  },
  "pure-copper-water-bottle": {
    subtitle: "Matte, fingerprint-resistant, leak-proof",
    summary: "Pure copper inside, a matte lacquered finish outside that resists fingerprints and slows tarnish.",
  },
  "pure-copper-water-bottle-set": {
    subtitle: "Hammered and etched, a two-bottle bundle",
    summary: "Two 750ml pure copper bottles, one hammered and one etched — an Ayurvedic hydration bundle.",
  },
  "premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant": {
    subtitle: "The one that started it",
    summary: "Our most-bought bottle: seamless 100% pure copper, hand-hammered and leak-proof.",
  },
  "premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml": {
    subtitle: "Two textures, one 950ml vessel",
    summary: "A 950ml bottle in pure copper with two hammered textures — leak-proof and handcrafted.",
  },
  "ayurvedic-copper-water-bottle": {
    subtitle: "Hand-etched, antique finish",
    summary: "Hand-etched one at a time, with an antique finish. Pure copper, with a leak-proof cap.",
  },
};

const COPPER_CARE = `Hand wash only, in warm water with a little mild soap. Copper is a living metal: it darkens as it ages, and that patina is a sign of authenticity rather than a fault.

To bring back the shine, cut a lemon in half, dip it in salt and work it gently over the surface, then rinse thoroughly and dry with a soft cloth. A paste of equal parts flour, salt and white vinegar does the same job on heavier tarnish.

Never put copper in a dishwasher, never use abrasive scourers or bleach, and dry it fully before storing. Store with the cap off so air can circulate.`;

const ACACIA_CARE = `Hand wash in warm soapy water and dry immediately — never leave acacia to soak, and never put it in a dishwasher.

Every few weeks, rub in a thin coat of food-safe mineral oil with a soft cloth, leave it overnight and wipe away the excess. This keeps the grain sealed and stops it drying out or splitting.`;

const LEATHER_CARE = `Genuine leather is a natural material and softens and develops a patina with wear — that is the point of it.

Wipe with a dry or barely damp cloth. Every few months, work a small amount of leather conditioner in with a soft cloth and buff off the excess. Keep it away from prolonged rain and direct heat; if it does get wet, let it dry naturally, away from a radiator.

Store on a wide or padded hanger so the shoulders hold their shape. Do not wash, tumble dry or dry-clean.`;

/* --------------------------------------------------------------- LEATHER
   These are not on the copper Shopify feed — the leather line is authored
   here. Imagery already lives in public/images/products/<slug>/; five sizes,
   one price per product, no colour variants.
   -------------------------------------------------------------------------- */

const LEATHER_CATEGORY = {
  slug: "leather-jackets",
  title: "Leather",
  subtitle: "Genuine leather, made to last",
  description:
    "Genuine leather outerwear in clean, modern cuts — a café-racer jacket for men, and belted double-breasted trenches for women in black and deep burgundy. Full-grain hide, a soft full lining, a tailored fit. Five sizes, S to XXL.",
};

const LEATHER_SIZES: [string, string][] = [
  ["S", "S"], ["M", "M"], ["L", "L"], ["XL", "XL"], ["XXL", "XXL"],
];

type LeatherSpec = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  finish: string;
  priceGbp: number;
  skuPrefix: string;
  featured?: boolean;
  images: { file: string; kind: string; alt: string; width: number; height: number }[];
};

const LEATHER: LeatherSpec[] = [
  {
    slug: "mens-leather-jacket",
    title: "Men's Leather Jacket",
    subtitle: "Genuine leather, café-racer cut",
    summary:
      "A clean-lined café-racer in genuine leather — low stand collar, twin zip pockets, a tailored modern fit.",
    description:
      "Cut as a café-racer: a low stand collar, a clean centre zip and twin zip hand pockets, with almost no extra hardware. It is made to sit close without pulling, and to layer over a tee or a light knit.\n\n• Genuine leather outer with a soft full lining\n• Low stand collar with a single stud tab\n• Metal zips at the front and pockets\n• Tailored modern fit — size up for a relaxed fit\n• Interior pocket\n\nEvery jacket is cut and finished by hand, so the grain and the break of the leather vary slightly from one to the next.",
    finish: "Genuine sheepskin leather",
    priceGbp: 13900,
    skuPrefix: "AZMIQ-MLJ",
    featured: true,
    images: [
      { file: "/images/products/mens-leather-jacket/00-hero.png", kind: "hero", alt: "Men's black leather jacket, front view on a plain ground", width: 1024, height: 1536 },
      { file: "/images/products/mens-leather-jacket/01-flat.jpg", kind: "gallery", alt: "The jacket laid flat, showing the cut, collar and zip hardware", width: 1600, height: 1192 },
      { file: "/images/products/mens-leather-jacket/02-brand.png", kind: "lifestyle", alt: "AZMIQ leather — crafted for confidence, durability and refined style", width: 512, height: 512 },
      { file: "/images/products/mens-leather-jacket/03-why.png", kind: "gallery", alt: "Why AZMIQ leather: genuine hide, durable metal zips, soft inner lining, tailored fit", width: 512, height: 512 },
      { file: "/images/products/mens-leather-jacket/04-size.jpg", kind: "gallery", alt: "Men's leather jacket size chart with chest, shoulder, sleeve and length measurements", width: 1800, height: 1200 },
    ],
  },
  {
    slug: "womens-leather-jacket",
    title: "Women's Leather Trench",
    subtitle: "Double-breasted, self-tie belt, black",
    summary:
      "A black leather trench in the classic register — double-breasted, notch lapels and a soft self-tie belt, cut close and worn open or knotted.",
    description:
      "A leather trench that keeps the codes and loses the bulk: double-breasted front, notch lapels with a back storm flap, and a soft self-tie belt rather than a buckle. Softly structured through the shoulder, close through the waist, and cut to sit between the hip and the knee.\n\n• Full-grain black leather outer, fully lined\n• Double-breasted, with tonal buttons\n• Soft self-tie belt; buttoned cuff tabs\n• Notch lapels and a back storm flap\n• Flap hip pockets\n• Size up to layer a knit underneath\n\nCut and finished by hand, so the grain and the fall of the leather vary a little from one to the next.",
    finish: "Black full-grain leather",
    priceGbp: 15000,
    skuPrefix: "AZMIQ-WLT",
    images: [
      { file: "/images/products/womens-leather-jacket/00-hero.jpg", kind: "hero", alt: "Women's black leather trench with a self-tie belt, front view on a dark ground", width: 1200, height: 1351 },
      { file: "/images/products/womens-leather-jacket/01-editorial.jpg", kind: "gallery", alt: "The black leather trench shown full length against a concrete wall", width: 1700, height: 932 },
      { file: "/images/products/womens-leather-jacket/02-london.jpg", kind: "lifestyle", alt: "AZMIQ leather styled with boots and a portfolio on a London street", width: 1700, height: 950 },
    ],
  },
  {
    slug: "womens-burgundy-leather-jacket",
    title: "Women's Burgundy Leather Trench",
    subtitle: "Double-breasted, belted, wine burgundy",
    summary:
      "A double-breasted leather trench in deep wine burgundy — notch lapels, a buckled self-belt and a knee-skimming line, cut for a woman's frame.",
    description:
      "A leather trench in the classic register: double-breasted front, notch lapels with a storm flap, and a self-belt drawn through an antique-brass buckle. Knee-length, softly structured through the shoulder, and cut close through the waist.\n\n• Full-grain leather outer in a deep wine burgundy, fully lined\n• Double-breasted, with horn-look buttons\n• Self-belt with an antique-brass buckle; buttoned cuff tabs\n• Notch lapels and a back storm flap\n• Flap hip pockets\n• Knee-length — size up to layer a knit underneath\n\nCut and finished by hand, so the grain and the depth of colour vary a little from one to the next.",
    finish: "Burgundy full-grain leather",
    priceGbp: 15000,
    skuPrefix: "AZMIQ-WLT-BUR",
    images: [
      { file: "/images/products/womens-burgundy-leather-jacket/00-hero.jpg", kind: "hero", alt: "Burgundy leather trench coat on a wooden hanger in a linen-lined display niche", width: 1180, height: 1264 },
      { file: "/images/products/womens-burgundy-leather-jacket/01-flat.jpg", kind: "gallery", alt: "The burgundy leather trench laid flat, showing the double-breasted front, belt and lapels", width: 1300, height: 1457 },
      { file: "/images/products/womens-burgundy-leather-jacket/02-detail.jpg", kind: "macro", alt: "Close detail of the antique-brass belt buckle, horn-look buttons and topstitching", width: 1600, height: 900 },
      { file: "/images/products/womens-burgundy-leather-jacket/03-boutique.jpg", kind: "lifestyle", alt: "The burgundy leather trench displayed on a form in a wood-panelled boutique", width: 1600, height: 898 },
    ],
  },
];

function leatherLiterals(startPosition: number) {
  const productLiterals = LEATHER.map((p, i) => {
    const images = p.images
      .map(
        (im) =>
          `      { file: ${JSON.stringify(im.file)}, alt: ${JSON.stringify(im.alt)}, kind: ${JSON.stringify(im.kind)}, width: ${im.width}, height: ${im.height} },`,
      )
      .join("\n");
    const variants = LEATHER_SIZES
      .map(
        ([code, title]) =>
          `      { sku: ${JSON.stringify(`${p.skuPrefix}-${code}`)}, title: ${JSON.stringify(title)}, priceGbp: ${p.priceGbp}, inventory: 20 },`,
      )
      .join("\n");
    return [
      "  {",
      `    slug: ${JSON.stringify(p.slug)},`,
      `    title: ${JSON.stringify(p.title)},`,
      `    seoTitle: ${JSON.stringify(p.title)},`,
      `    subtitle: ${JSON.stringify(p.subtitle)},`,
      `    summary: ${JSON.stringify(p.summary)},`,
      `    description: ${JSON.stringify(p.description)},`,
      `    careInstructions: LEATHER_CARE,`,
      `    material: "Genuine leather",`,
      `    finish: ${JSON.stringify(p.finish)},`,
      `    dimensions: null,`,
      `    weightGrams: 1400,`,
      `    leakProof: false,`,
      `    foodGrade: false,`,
      `    categories: ["leather-jackets"],`,
      p.featured ? "    featured: true," : null,
      `    position: ${startPosition + i},`,
      "    images: [",
      images,
      "    ],",
      "    variants: [",
      variants,
      "    ],",
      "  },",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const categoryLiteral = `  {\n    slug: ${JSON.stringify(LEATHER_CATEGORY.slug)},\n    title: ${JSON.stringify(LEATHER_CATEGORY.title)},\n    subtitle: ${JSON.stringify(LEATHER_CATEGORY.subtitle)},\n    description: ${JSON.stringify(LEATHER_CATEGORY.description)},\n  },`;
  return { categoryLiteral, productLiterals };
}

/* --------------------------------------------------------------- HELPERS */

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&rsquo;": "’", "&lsquo;": "‘", "&rdquo;": "”", "&ldquo;": "“",
  "&mdash;": "—", "&ndash;": "–", "&nbsp;": " ", "&hellip;": "…",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

/** Shopify body_html -> plain text with blank-line paragraph breaks and
    bullet lines, which is exactly the shape the PDP renders. Headings are
    dropped: the AZMIQ PDP supplies its own section structure, and the store's
    descriptions are full of SEO sub-headings ("Why Choose a Copper Jug?")
    that read as clutter in that layout. */
function htmlToBlocks(html: string): string[] {
  let s = html
    .replace(/<img[^>]*>/gi, "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "\n\n")
    .replace(/<li[^>]*>\s*/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<\/(p|ul|ol|div|table|tr)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  s = decodeEntities(s);
  return s
    .split(/\n\s*\n/)
    .map((b) =>
      b
        .replace(/[ \t]+/g, " ")
        .replace(/•\s*\n\s*/g, "• ")     // bullet followed by its own line break
        .replace(/\n[ \t]+/g, "\n")
        .replace(/ *\n */g, "\n")
        .trim(),
    )
    .filter(Boolean);
}

/** A sentence-shaped lead line for cards and meta descriptions. Prefers the
    first real sentence; never a bullet, never a bare fragment. */
function summarise(blocks: string[], fallback: string): string {
  const prose = blocks.find((b) => !b.startsWith("•") && b.length >= 40);
  const source = (prose ?? blocks[0] ?? fallback).replace(/^•\s*/, "").replace(/\n+/g, " ").trim();
  const sentence = source.match(/^(.{40,180}?[.!?])(\s|$)/);
  if (sentence) return sentence[1].trim();
  return source.length > 158 ? source.slice(0, 155).replace(/\s+\S*$/, "") + "…" : source;
}

const WELLNESS_RE = /ayurved|tamra\s*jal|dosha|antimicrobial|oligodynam/i;

function deriveCapacityMl(...sources: (string | null | undefined)[]): number | null {
  for (const src of sources) {
    if (!src) continue;
    const m = src.match(/(\d+(?:[.,]\d+)?)\s*(ml|l|litre|liter|ltr)\b/i);
    if (!m) continue;
    const value = parseFloat(m[1].replace(",", "."));
    const unit = m[2].toLowerCase();
    return Math.round(unit === "ml" ? value : value * 1000);
  }
  return null;
}

function deriveFinish(p: ShopifyProduct): string {
  const hay = `${p.title} ${p.tags.join(" ")} ${p.handle}`.toLowerCase();
  if (p.product_type === "Kitchen Utensils") return "Sustainably sourced acacia";
  if (/dual[\s-]?hammer/.test(hay)) return "Dual-hammered";
  if (/brass/.test(hay)) return "Copper with brass accents";
  if (/hammer/.test(hay)) return "Hand-hammered";
  if (/etch|antique/.test(hay)) return "Hand-etched, antique";
  if (/matte|matt\b/.test(hay)) return "Matte lacquered";
  if (/\bball/.test(hay)) return "Solid pure copper";
  if (/\bset\b|bundle|collection/.test(hay)) return "Hand-hammered";
  return "Smooth pure copper";
}

function deriveLeakProof(p: ShopifyProduct): boolean {
  const hay = `${p.title} ${p.tags.join(" ")}`.toLowerCase();
  return /leak[\s-]?proof/.test(hay) || p.product_type === "Copper Water Bottles";
}

/** A concise <title>. Shopify's titles are long keyword strings; take the part
    before the first " – ", " - ", " | " or ", ". The layout appends " | AZMIQ". */
function shortTitle(title: string): string {
  const head = title.split(/\s+[|–—-]\s+|,\s+/)[0].trim();
  return head.length >= 12 ? head : title.slice(0, 60).trim();
}

const usedSkus = new Set<string>();

function skuFor(p: ShopifyProduct, v: ShopifyVariant, index: number, variantCount: number): string {
  let sku: string;
  if (v.sku && v.sku.trim()) {
    sku = v.sku.trim();
  } else {
    const base = p.handle
      .replace(/^azmiq-?/, "")
      .split("-")
      .filter(Boolean)
      .map((w) => w.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase())
      .join("")
      .slice(0, 20);
    const token = v.title && v.title !== "Default Title"
      ? v.title.replace(/[^0-9a-z]+/gi, "").toUpperCase()
      : variantCount > 1 ? String(index + 1).padStart(2, "0") : "";
    sku = `AZMIQ-${base}${token ? `-${token}` : ""}`;
  }
  // Guarantee uniqueness even if two handles reduce to the same base.
  let unique = sku;
  for (let n = 2; usedSkus.has(unique); n++) unique = `${sku}-${n}`;
  usedSkus.add(unique);
  return unique;
}

const KIND_BY_POSITION = ["hero", "macro", "lifestyle", "scale"];

function basename(src: string): string {
  const path = src.split("?")[0];
  return (path.split("/").pop() || "image")
    .replace(/[^0-9a-z._-]+/gi, "-")
    .toLowerCase();
}

async function download(src: string, dest: string): Promise<boolean> {
  if (existsSync(dest) && statSync(dest).size > 0) return true;
  try {
    const res = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0 (AZMIQ catalogue build)" } });
    if (!res.ok) {
      console.warn(`  ! ${res.status} ${src}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    return true;
  } catch (err) {
    console.warn(`  ! ${(err as Error).message} ${src}`);
    return false;
  }
}

function altFor(title: string, kind: string, position: number): string {
  switch (kind) {
    case "hero": return `${title}, photographed on warm linen`;
    case "macro": return `Close-up of the surface texture on the ${title}`;
    case "lifestyle": return `${title} in use`;
    case "scale": return `${title} shown for scale`;
    default: return `${title} — view ${position + 1}`;
  }
}

/* ------------------------------------------------------------------ MAIN */

async function main() {
  const products: ShopifyProduct[] = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  console.log(`Building catalogue from ${products.length} Shopify products\n`);

  const usedCategories = new Map<string, (typeof CATEGORY_BY_TYPE)[string]>();
  const seedProducts: string[] = [];

  for (const [pi, p] of products.entries()) {
    const category = CATEGORY_BY_TYPE[p.product_type];
    if (!category) throw new Error(`No category mapping for product_type "${p.product_type}" (${p.handle})`);
    usedCategories.set(category.slug, category);

    const blocks = htmlToBlocks(p.body_html);
    const wellnessBlocks = blocks.filter((b) => WELLNESS_RE.test(b) && !b.startsWith("•"));
    const descriptionBlocks = blocks.filter((b) => !wellnessBlocks.includes(b));
    const summary = EDITORIAL[p.handle]?.summary ?? summarise(descriptionBlocks, p.title);

    const isAcacia = p.product_type === "Kitchen Utensils";
    const productCapacity = deriveCapacityMl(p.title, p.handle);

    // Images -----------------------------------------------------------
    console.log(`• ${p.title}  (${p.images.length} images)`);
    const images: string[] = [];
    for (const [ii, img] of p.images.entries()) {
      const file = `${String(ii).padStart(2, "0")}-${basename(img.src)}`;
      const rel = `/images/products/${p.handle}/${file}`;
      await download(img.src, join(IMAGE_ROOT, p.handle, file));
      const kind = KIND_BY_POSITION[ii] ?? "gallery";
      images.push(
        `      { file: ${JSON.stringify(rel)}, alt: ${JSON.stringify(
          img.alt?.trim() || altFor(p.title, kind, ii),
        )}, kind: ${JSON.stringify(kind)}, width: ${img.width}, height: ${img.height} },`,
      );
    }

    // Variants -------------------------------------------------------
    const variants = p.variants.map((v, vi) => {
      const priceGbp = Math.round(parseFloat(v.price) * 100);
      const compareAt = v.compare_at_price ? Math.round(parseFloat(v.compare_at_price) * 100) : null;
      const vTitle = v.title && v.title !== "Default Title" ? v.title : "Standard";
      const capacityMl = deriveCapacityMl(v.title, v.option1) ?? (p.variants.length === 1 ? productCapacity : null);
      const parts = [
        `sku: ${JSON.stringify(skuFor(p, v, vi, p.variants.length))}`,
        `title: ${JSON.stringify(vTitle)}`,
        capacityMl ? `capacityMl: ${capacityMl}` : null,
        `priceGbp: ${priceGbp}`,
        compareAt ? `compareAtGbp: ${compareAt}` : null,
        `inventory: 40`,
      ].filter(Boolean);
      return `      { ${parts.join(", ")} },`;
    });

    const weightGrams = p.variants[0]?.grams && p.variants[0].grams > 20 ? p.variants[0].grams : null;

    const fields = [
      `    slug: ${JSON.stringify(p.handle)},`,
      `    title: ${JSON.stringify(p.title)},`,
      `    seoTitle: ${JSON.stringify(shortTitle(p.title))},`,
      `    subtitle: ${JSON.stringify(EDITORIAL[p.handle]?.subtitle ?? "")},`,
      `    summary: ${JSON.stringify(summary)},`,
      `    description: ${JSON.stringify(descriptionBlocks.join("\n\n"))},`,
      wellnessBlocks.length ? `    wellnessStory: ${JSON.stringify(wellnessBlocks.join("\n\n"))},` : null,
      `    careInstructions: ${isAcacia ? "ACACIA_CARE" : "COPPER_CARE"},`,
      `    finish: ${JSON.stringify(deriveFinish(p))},`,
      productCapacity ? `    capacityMl: ${productCapacity},` : null,
      weightGrams ? `    weightGrams: ${weightGrams},` : `    weightGrams: null,`,
      `    dimensions: null,`,
      `    leakProof: ${deriveLeakProof(p)},`,
      `    categories: ${JSON.stringify([category.slug])},`,
      EDITORIAL[p.handle]?.featured ? `    featured: true,` : null,
      `    position: ${pi},`,
      `    images: [`,
      ...images,
      `    ],`,
      `    variants: [`,
      ...variants,
      `    ],`,
    ].filter(Boolean);

    seedProducts.push(`  {\n${fields.join("\n")}\n  },`);
  }

  // Emit categories in a stable order.
  const order = ["copper-water-bottles", "copper-jugs-pitchers", "wellness-gift-sets", "copper-accessories", "kitchen-utensils"];
  const categoryLiterals = order
    .filter((slug) => usedCategories.has(slug))
    .map((slug) => {
      const c = usedCategories.get(slug)!;
      return `  {\n    slug: ${JSON.stringify(c.slug)},\n    title: ${JSON.stringify(c.title)},\n    subtitle: ${JSON.stringify(c.subtitle)},\n    description: ${JSON.stringify(c.description)},\n  },`;
    });

  // The leather line, authored in this script (not on the copper Shopify feed).
  const leather = leatherLiterals(products.length);
  categoryLiterals.push(leather.categoryLiteral);
  seedProducts.push(...leather.productLiterals);

  const file = `/* ===========================================================================
   SEED CATALOGUE  —  GENERATED, DO NOT EDIT BY HAND

   Source : scripts/data/shopify-products.json (snapshot of azmiq.com/products.json)
            + the leather line, authored in scripts/build-catalogue.ts
   Rebuild: npm run catalogue:build

   The ${products.length} copper products are exactly those on azmiq.com — nothing added; their
   prices, compare-at prices, variants and descriptions come from the live store.
   The ${LEATHER.length} leather jackets are authored in the build script. All imagery lives in
   public/images/products/<slug>/. Edit products in the admin panel once the
   site is running; re-running the build overwrites this file.
   =========================================================================== */

export type SeedVariant = {
  sku: string;
  title: string;
  capacityMl?: number;
  priceGbp: number;      // pence
  compareAtGbp?: number; // pence
  inventory: number;
};

export type SeedImage = {
  file: string;   // path under /public
  alt: string;
  kind: string;   // hero | macro | lifestyle | scale | gallery
  width: number;
  height: number;
};

export type SeedProduct = {
  slug: string;
  title: string;
  seoTitle: string;
  subtitle: string;
  summary: string;
  description: string;
  wellnessStory?: string;
  careInstructions: string | null;
  /** Overrides the category default ("100% pure copper" / acacia). */
  material?: string;
  /** Drinkware is food-grade; apparel is not. Defaults to true. */
  foodGrade?: boolean;
  finish: string;
  dimensions: string | null;
  weightGrams: number | null;
  capacityMl?: number;
  leakProof: boolean;
  categories: string[];
  featured?: boolean;
  position: number;
  images: SeedImage[];
  variants: SeedVariant[];
};

const COPPER_CARE = ${JSON.stringify(COPPER_CARE)};

const ACACIA_CARE = ${JSON.stringify(ACACIA_CARE)};

const LEATHER_CARE = ${JSON.stringify(LEATHER_CARE)};

export const CATEGORIES = [
${categoryLiterals.join("\n")}
];

export const CATALOGUE: SeedProduct[] = [
${seedProducts.join("\n")}
];

/* ---------------------------------------------------------------------------
   PRESENTMENT PRICING

   Hand-set, rounded prices per currency, derived from the live GBP price. Not
   a live FX feed — merchandising can override any row in the admin panel.
   ------------------------------------------------------------------------- */
export const PRESENTMENT_MULTIPLIERS: Record<string, number> = {
  EUR: 1.18,
  USD: 1.28,
  CAD: 1.74,
  AUD: 1.94,
};

/** Round to a whole major unit so the result looks deliberate, not converted. */
export function presentmentPrice(gbpMinor: number, multiplier: number): number {
  const major = (gbpMinor / 100) * multiplier;
  return Math.round(major) * 100;
}
`;

  writeFileSync(join(ROOT, "scripts/catalogue.ts"), file);
  console.log(
    `\nWrote scripts/catalogue.ts — ${products.length + LEATHER.length} products ` +
      `(${products.length} copper + ${LEATHER.length} leather), ${categoryLiterals.length} categories`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
