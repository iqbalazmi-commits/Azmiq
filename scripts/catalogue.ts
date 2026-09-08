/* ===========================================================================
   SEED CATALOGUE

   The starting catalogue. Every price rule the storefront has to handle is
   exercised here: compare-at pricing, per-litre unit pricing, multi-variant
   capacity, products with no capacity at all, and one line deliberately out
   of stock.

   Edit products in the admin panel once the site is running; this file only
   seeds a fresh database.
   =========================================================================== */

export type Shape = "bottle" | "jug" | "tumbler" | "ball" | "board" | "utensils" | "set";

export type SeedVariant = {
  sku: string;
  title: string;
  capacityMl?: number;
  priceGbp: number;      // pence
  compareAtGbp?: number; // pence
  inventory: number;
};

export type SeedProduct = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  wellnessStory?: string;
  careInstructions?: string;
  finish: string;
  dimensions: string;
  weightGrams: number;
  capacityMl?: number;
  leakProof: boolean;
  categories: string[];
  shape: Shape;
  featured?: boolean;
  variants: SeedVariant[];
};

const COPPER_CARE = `Hand wash only, in warm water with a little mild soap. Copper is a living metal: it darkens as it ages, and that patina is a sign of authenticity rather than a fault.

To bring back the shine, cut a lemon in half, dip it in salt and work it gently over the surface, then rinse thoroughly and dry with a soft cloth. A paste of equal parts flour, salt and white vinegar does the same job on heavier tarnish.

Never put copper in a dishwasher, never use abrasive scourers or bleach, and dry it fully before storing. Store with the cap off so air can circulate.`;

const ACACIA_CARE = `Hand wash in warm soapy water and dry immediately - never leave acacia to soak, and never put it in a dishwasher.

Every few weeks, rub in a thin coat of food-safe mineral oil with a soft cloth, leave it overnight and wipe away the excess. This keeps the grain sealed and stops it drying out or splitting.`;

const AYURVEDA_BOTTLE = `In Ayurveda, water stored overnight in copper is known as tamra jal. The practice is thousands of years old: fill the vessel in the evening, leave it to stand for six to eight hours at room temperature, and drink it first thing in the morning.

Copper is an essential trace mineral, and modern research supports what the tradition observed - copper surfaces are oligodynamic, meaning they are naturally antimicrobial. Ayurvedic practitioners hold that tamra jal helps balance the three doshas, supports digestion and aids the body's natural detoxification.

We make no medical claims. We make the vessel properly, from 100% pure copper with no lining or lacquer, so the tradition works the way it is supposed to.`;

export const CATEGORIES = [
  {
    slug: "copper-water-bottles",
    title: "Copper Water Bottles",
    subtitle: "Tamra jal, every morning",
    description:
      "Seamless, leak-proof bottles in 100% pure copper. Hammered, hand-etched, matte and dual-finish, from 500ml to 950ml - made for the Ayurvedic practice of storing water overnight.",
  },
  {
    slug: "copper-jugs-pitchers",
    title: "Copper Jugs & Pitchers",
    subtitle: "For the table, and for the night",
    description:
      "Generous copper jugs and lidded pitchers, hand-hammered by artisans who have worked the metal for generations. Beautiful enough for the table, practical enough for the bedside.",
  },
  {
    slug: "jug-tumbler-sets",
    title: "Jug & Tumbler Sets",
    subtitle: "Complete, and considered",
    description:
      "Matched sets of jug and tumblers - the traditional way copper is served. Our best value, and the gift people remember.",
  },
  {
    slug: "copper-wellness",
    title: "Copper Wellness",
    subtitle: "The quieter objects",
    description:
      "Solid copper balls and wellness pieces used in Ayurvedic practice for grounding, massage and daily ritual.",
  },
  {
    slug: "acacia-wood",
    title: "Acacia Wood Kitchen",
    subtitle: "Warm grain, honest tools",
    description:
      "Serving boards and utensils turned from sustainably sourced acacia - dense, close-grained and warm against copper.",
  },
];

export const CATALOGUE: SeedProduct[] = [
  /* ------------------------------------------------------------- BOTTLES */
  {
    slug: "hammered-copper-water-bottle",
    title: "Hammered Copper Water Bottle",
    subtitle: "The one that started it",
    summary: "Hand-hammered, seamless and leak-proof. Our most-bought bottle.",
    description:
      "Each bottle is raised from a single sheet of pure copper and hammered by hand - somewhere between two and three thousand strikes - until the surface carries that unmistakable dimpled texture. There is no seam, no lining and no lacquer, so the water meets nothing but copper.\n\nThe threaded cap seals against a food-grade silicone ring: you can put it in a bag on its side and nothing will move. It fits a standard bottle cage and most cup holders.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "26cm tall x 7.5cm diameter",
    weightGrams: 320,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    featured: true,
    variants: [
      { sku: "AZ-HAM-500", title: "500ml", capacityMl: 500, priceGbp: 2500, compareAtGbp: 3300, inventory: 48 },
      { sku: "AZ-HAM-750", title: "750ml", capacityMl: 750, priceGbp: 2900, compareAtGbp: 3900, inventory: 62 },
      { sku: "AZ-HAM-950", title: "950ml", capacityMl: 950, priceGbp: 3400, compareAtGbp: 4500, inventory: 35 },
    ],
  },
  {
    slug: "hand-etched-copper-bottle",
    title: "Hand-Etched Copper Bottle",
    subtitle: "Chased by hand, one at a time",
    summary: "A traditional chased pattern, cut into the copper by hand.",
    description:
      "The pattern on this bottle is not printed or pressed. It is chased - cut into the surface with a fine punch, line by line, by a single artisan. A bottle takes the better part of a day, which is why no two are quite identical and why we cannot make very many of them.\n\nThe etching also does something practical: it gives the bottle real grip, wet or dry.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions: COPPER_CARE,
    finish: "Hand-etched, chased pattern",
    dimensions: "27cm tall x 7.5cm diameter",
    weightGrams: 355,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    featured: true,
    variants: [
      { sku: "AZ-ETC-750", title: "750ml", capacityMl: 750, priceGbp: 3800, compareAtGbp: 5200, inventory: 24 },
      { sku: "AZ-ETC-900", title: "900ml", capacityMl: 900, priceGbp: 4200, compareAtGbp: 5800, inventory: 18 },
    ],
  },
  {
    slug: "matte-copper-water-bottle",
    title: "Matte Copper Water Bottle",
    subtitle: "Softer light, fewer fingerprints",
    summary: "A brushed matte finish that stays quiet on a desk.",
    description:
      "The same seamless body as our hammered bottle, finished with a fine brushed matte instead of a polish. It reads softer in daylight, holds fingerprints far less, and ages into a deep bronze rather than a bright shine.\n\nThe practical choice if the bottle lives on a desk in an open-plan office.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions: COPPER_CARE,
    finish: "Brushed matte",
    dimensions: "25.5cm tall x 7cm diameter",
    weightGrams: 300,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    variants: [
      { sku: "AZ-MAT-750", title: "750ml", capacityMl: 750, priceGbp: 3200, compareAtGbp: 4200, inventory: 40 },
      { sku: "AZ-MAT-950", title: "950ml", capacityMl: 950, priceGbp: 3600, compareAtGbp: 4700, inventory: 27 },
    ],
  },
  {
    slug: "dual-hammered-copper-bottle",
    title: "Dual-Hammered Copper Bottle",
    subtitle: "Two textures, one vessel",
    summary: "Coarse hammering below, fine above - a harder thing to make well.",
    description:
      "A coarse hammer on the lower body, a fine hammer on the shoulder, and a clean band where the two meet. Getting that band straight on a curved surface is genuinely difficult, and it is the detail our workshop is proudest of.\n\nThe heaviest gauge copper we use, at 0.8mm. It has real weight in the hand.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions: COPPER_CARE,
    finish: "Dual hammered, natural",
    dimensions: "27cm tall x 7.8cm diameter",
    weightGrams: 410,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    featured: true,
    variants: [
      { sku: "AZ-DUA-950", title: "950ml", capacityMl: 950, priceGbp: 3900, compareAtGbp: 5200, inventory: 22 },
    ],
  },
  {
    slug: "slim-copper-bottle",
    title: "Slim Copper Bottle",
    subtitle: "For a handbag, or a bike cage",
    summary: "500ml, narrow enough for a bottle cage and a small bag.",
    description:
      "A narrower profile than the rest of the range at 6.4cm across, which is what it takes to sit properly in a standard bottle cage or slide into a handbag without dominating it.\n\nSame pure copper, same seamless body, same leak-proof cap. Simply less of it.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "24cm tall x 6.4cm diameter",
    weightGrams: 245,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    variants: [
      { sku: "AZ-SLM-500", title: "500ml", capacityMl: 500, priceGbp: 2500, compareAtGbp: 3300, inventory: 55 },
    ],
  },
  {
    slug: "smooth-copper-bottle",
    title: "Smooth Copper Bottle",
    subtitle: "Nothing to distract from the metal",
    summary: "A plain polished body - the most understated bottle we make.",
    description:
      "No hammering, no etching. A plain, polished, seamless body that shows the copper itself and nothing else. It is the hardest finish to get right, because a polished surface hides no mistakes at all.\n\nIf you find hammered copper a little busy, this is the one.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions: COPPER_CARE,
    finish: "Polished smooth",
    dimensions: "26cm tall x 7.2cm diameter",
    weightGrams: 295,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    variants: [
      { sku: "AZ-SMO-900", title: "900ml", capacityMl: 900, priceGbp: 3000, compareAtGbp: 4000, inventory: 31 },
    ],
  },
  {
    slug: "antique-finish-copper-bottle",
    title: "Antique Finish Copper Bottle",
    subtitle: "Aged on purpose, by hand",
    summary: "A deep, deliberately aged patina that will not brighten back up.",
    description:
      "Copper darkens with time. This bottle starts there: the surface is oxidised by hand and then sealed on the outside only, so it holds a deep, even, near-bronze tone instead of gradually getting there over a year.\n\nThe inside is bare, unlined pure copper, exactly like the rest of the range - the treatment is cosmetic and stops at the neck.",
    wellnessStory: AYURVEDA_BOTTLE,
    careInstructions:
      "Hand wash the inside in warm water with mild soap. Do not use the lemon-and-salt method on the outside of this bottle - it will strip the antique finish back to bright copper. Wipe the exterior with a damp cloth only, and dry it.",
    finish: "Hand-oxidised antique",
    dimensions: "26.5cm tall x 7.5cm diameter",
    weightGrams: 330,
    leakProof: true,
    categories: ["copper-water-bottles"],
    shape: "bottle",
    variants: [
      { sku: "AZ-ANT-850", title: "850ml", capacityMl: 850, priceGbp: 3600, compareAtGbp: 4800, inventory: 0 },
    ],
  },

  /* ---------------------------------------------------------------- JUGS */
  {
    slug: "hammered-copper-jug",
    title: "Hammered Copper Jug",
    subtitle: "1.5 litres, for the table",
    summary: "A hand-hammered jug with a cast handle and a clean-pouring lip.",
    description:
      "Big enough to serve a table of four without refilling, and balanced so it pours cleanly at any angle - the lip is formed by hand and tested with water before it leaves the workshop, because a jug that dribbles is simply a bad jug.\n\nThe handle is cast separately and brazed, not spot-welded, so it will not work loose.",
    wellnessStory:
      "A copper jug on the table is the older, more sociable form of the same Ayurvedic practice: water poured for everyone, from a vessel that has been storing it since the morning.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "22cm tall x 14cm diameter",
    weightGrams: 680,
    capacityMl: 1500,
    leakProof: false,
    categories: ["copper-jugs-pitchers"],
    shape: "jug",
    featured: true,
    variants: [
      { sku: "AZ-JUG-1500", title: "1.5L", capacityMl: 1500, priceGbp: 4800, compareAtGbp: 6500, inventory: 26 },
    ],
  },
  {
    slug: "lidded-copper-pitcher",
    title: "Lidded Copper Pitcher",
    subtitle: "2 litres, covered",
    summary: "A generous lidded pitcher for overnight storage.",
    description:
      "Two litres, with a close-fitting lid that keeps dust out overnight - the traditional shape for storing water from evening to morning, and the reason it is taller and narrower than a serving jug.\n\nThe lid sits on a rolled rim so it will not slip when you pour.",
    wellnessStory:
      "This is the vessel the overnight practice was built around: filled at night, covered, left at room temperature, and poured in the morning.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "27cm tall x 13cm diameter",
    weightGrams: 820,
    capacityMl: 2000,
    leakProof: false,
    categories: ["copper-jugs-pitchers"],
    shape: "jug",
    variants: [
      { sku: "AZ-PIT-2000", title: "2L", capacityMl: 2000, priceGbp: 5500, compareAtGbp: 7200, inventory: 19 },
    ],
  },
  {
    slug: "matte-copper-jug",
    title: "Matte Copper Jug",
    subtitle: "1.2 litres, brushed",
    summary: "The brushed matte finish, in a smaller everyday jug.",
    description:
      "A little over a litre - the size that actually fits on a bedside table or a desk without looking like catering. Brushed matte, so it stays quiet in a room and shows fingerprints far less than a polish.",
    careInstructions: COPPER_CARE,
    finish: "Brushed matte",
    dimensions: "20cm tall x 12.5cm diameter",
    weightGrams: 590,
    capacityMl: 1200,
    leakProof: false,
    categories: ["copper-jugs-pitchers"],
    shape: "jug",
    variants: [
      { sku: "AZ-MJG-1200", title: "1.2L", capacityMl: 1200, priceGbp: 4400, compareAtGbp: 5800, inventory: 23 },
    ],
  },
  {
    slug: "hand-etched-copper-pitcher",
    title: "Hand-Etched Copper Pitcher",
    subtitle: "1.8 litres, chased by hand",
    summary: "Our chased pattern on the largest piece we make.",
    description:
      "The chased pattern from our etched bottle, worked across a far larger surface. It takes an artisan close to two days, and it is the piece we are asked about most often when it is on a table.\n\nMade in small batches. When a batch sells out the next one is usually six weeks away.",
    careInstructions: COPPER_CARE,
    finish: "Hand-etched, chased pattern",
    dimensions: "25cm tall x 14cm diameter",
    weightGrams: 790,
    capacityMl: 1800,
    leakProof: false,
    categories: ["copper-jugs-pitchers"],
    shape: "jug",
    variants: [
      { sku: "AZ-EPT-1800", title: "1.8L", capacityMl: 1800, priceGbp: 6200, compareAtGbp: 8200, inventory: 11 },
    ],
  },

  /* ---------------------------------------------------------------- SETS */
  {
    slug: "copper-jug-two-tumbler-set",
    title: "Copper Jug & Two Tumblers",
    subtitle: "The set for two",
    summary: "A 1.5L hammered jug with two 300ml tumblers.",
    description:
      "Our hammered jug with two matching tumblers, hammered from the same gauge of copper and finished to the same standard. Bought together it is meaningfully cheaper than buying the pieces separately, which is how a set should work.\n\nArrives in a recycled kraft gift box with a printed care card.",
    wellnessStory:
      "Copper tumblers are the traditional companion to the jug - water poured and drunk from the same metal, the way the practice was meant to be kept.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "Jug 22cm; tumblers 9cm x 7cm",
    weightGrams: 1120,
    capacityMl: 1500,
    leakProof: false,
    categories: ["jug-tumbler-sets", "copper-jugs-pitchers"],
    shape: "set",
    featured: true,
    variants: [
      { sku: "AZ-SET-2", title: "Jug + 2 tumblers", capacityMl: 1500, priceGbp: 7800, compareAtGbp: 9500, inventory: 17 },
    ],
  },
  {
    slug: "copper-jug-four-tumbler-set",
    title: "Copper Jug & Four Tumblers",
    subtitle: "The set for a table",
    summary: "A 2L lidded pitcher with four 300ml tumblers.",
    description:
      "The lidded two-litre pitcher with four tumblers - enough for a dinner table, and the version most people choose as a wedding or housewarming gift.\n\nArrives in a recycled kraft gift box with a printed care card.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "Pitcher 27cm; tumblers 9cm x 7cm",
    weightGrams: 1740,
    capacityMl: 2000,
    leakProof: false,
    categories: ["jug-tumbler-sets"],
    shape: "set",
    variants: [
      { sku: "AZ-SET-4", title: "Pitcher + 4 tumblers", capacityMl: 2000, priceGbp: 9500, compareAtGbp: 12500, inventory: 9 },
    ],
  },
  {
    slug: "hammered-copper-tumblers",
    title: "Hammered Copper Tumblers",
    subtitle: "A pair, 300ml each",
    summary: "Two hand-hammered tumblers, sold as a pair.",
    description:
      "Three hundred millilitres each, with a rolled rim that is comfortable to drink from - an unrolled edge on copper is sharp, and skipping that step is the most common shortcut in cheap copperware.\n\nAlso the correct vessel for a Moscow Mule, if that is why you are here.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered, natural",
    dimensions: "9cm tall x 7cm diameter",
    weightGrams: 300,
    capacityMl: 300,
    leakProof: false,
    categories: ["jug-tumbler-sets"],
    shape: "tumbler",
    variants: [
      { sku: "AZ-TUM-2", title: "Pair", capacityMl: 300, priceGbp: 2800, compareAtGbp: 3600, inventory: 44 },
      { sku: "AZ-TUM-4", title: "Set of four", capacityMl: 300, priceGbp: 5200, compareAtGbp: 6800, inventory: 21 },
    ],
  },

  /* ------------------------------------------------------------ WELLNESS */
  {
    slug: "solid-copper-ball",
    title: "Solid Copper Ball",
    subtitle: "65mm, and heavier than it looks",
    summary: "A solid, turned copper sphere for grounding and hand exercise.",
    description:
      "Solid copper, turned and polished, 65mm across and just over 1.2kg. It is used in Ayurvedic practice for grounding and for working the small muscles of the hand, and it is a genuinely pleasant object to hold and turn while thinking.\n\nSupplied with a small felt-lined ring so it will not roll off a desk.",
    wellnessStory:
      "Held in the palm, a copper ball is used in Ayurvedic practice as a grounding object - a physical anchor for the attention, and a way of working the hand and wrist. Copper is also an essential trace mineral, and warm to the touch far more quickly than steel or stone.",
    careInstructions:
      "Wipe with a soft dry cloth. To restore the shine, use half a lemon dipped in salt, then rinse and dry thoroughly. Handling will darken the surface over time, which is normal and reversible.",
    finish: "Turned and polished",
    dimensions: "65mm diameter",
    weightGrams: 1240,
    leakProof: false,
    categories: ["copper-wellness"],
    shape: "ball",
    variants: [
      { sku: "AZ-BAL-65", title: "65mm", priceGbp: 2600, compareAtGbp: 3400, inventory: 33 },
    ],
  },
  {
    slug: "copper-ball-and-stand",
    title: "Copper Ball & Stand",
    subtitle: "With a turned acacia rest",
    summary: "The 65mm copper ball on a turned acacia stand.",
    description:
      "The same solid copper ball, with a turned acacia stand so it has somewhere to live on a desk or shelf. Copper against warm wood grain is the pairing that runs through the whole range.",
    wellnessStory:
      "Held in the palm, a copper ball is used in Ayurvedic practice as a grounding object - a physical anchor for the attention, and a way of working the hand and wrist.",
    careInstructions:
      "Wipe the copper with a soft dry cloth; restore the shine with lemon and salt, then rinse and dry. Wipe the acacia stand with a barely damp cloth and re-oil it occasionally with food-safe mineral oil.",
    finish: "Turned and polished, acacia stand",
    dimensions: "Ball 65mm; stand 90mm diameter",
    weightGrams: 1420,
    leakProof: false,
    categories: ["copper-wellness", "acacia-wood"],
    shape: "ball",
    variants: [
      { sku: "AZ-BAL-STD", title: "Ball + stand", priceGbp: 3400, compareAtGbp: 4400, inventory: 20 },
    ],
  },

  /* -------------------------------------------------------------- ACACIA */
  {
    slug: "acacia-serving-board",
    title: "Acacia Serving Board",
    subtitle: "Close-grained, and properly thick",
    summary: "A 40cm acacia board, 2cm thick, with a hanging hole.",
    description:
      "Forty centimetres of sustainably sourced acacia, two centimetres thick - thick enough not to cup or warp the first time it gets wet, which is where most inexpensive boards fail.\n\nFinished with food-safe mineral oil, never lacquer. The grain in acacia varies a great deal, so no two boards look the same.",
    careInstructions: ACACIA_CARE,
    finish: "Oiled acacia",
    dimensions: "40cm x 22cm x 2cm",
    weightGrams: 1150,
    leakProof: false,
    categories: ["acacia-wood"],
    shape: "board",
    variants: [
      { sku: "AZ-ACB-40", title: "40cm", priceGbp: 3800, compareAtGbp: 4900, inventory: 29 },
    ],
  },
  {
    slug: "acacia-utensil-set",
    title: "Acacia Utensil Set",
    subtitle: "Five pieces, shaped by hand",
    summary: "Spoon, slotted spoon, spatula, turner and fork in oiled acacia.",
    description:
      "Five pieces, each shaped and sanded by hand: a solid spoon, a slotted spoon, a spatula, a turner and a fork. Acacia is dense enough to stand up to a hot pan and soft enough never to mark a non-stick surface.\n\nFinished with food-safe mineral oil, never lacquer.",
    careInstructions: ACACIA_CARE,
    finish: "Oiled acacia",
    dimensions: "30cm each",
    weightGrams: 540,
    leakProof: false,
    categories: ["acacia-wood"],
    shape: "utensils",
    variants: [
      { sku: "AZ-ACU-5", title: "Set of five", priceGbp: 4200, compareAtGbp: 5500, inventory: 26 },
    ],
  },
  {
    slug: "acacia-copper-salad-servers",
    title: "Acacia & Copper Salad Servers",
    subtitle: "Two materials, one object",
    summary: "Acacia servers with hand-formed copper inlay handles.",
    description:
      "Acacia servers with a copper inlay running the length of each handle - set in by hand, then sanded flush so the join is smooth to the touch.\n\nThe piece that best shows what the workshop can do when the two materials are worked together.",
    careInstructions: ACACIA_CARE,
    finish: "Oiled acacia with copper inlay",
    dimensions: "28cm each",
    weightGrams: 240,
    leakProof: false,
    categories: ["acacia-wood"],
    shape: "utensils",
    variants: [
      { sku: "AZ-ACS-2", title: "Pair", priceGbp: 2900, compareAtGbp: 3800, inventory: 34 },
    ],
  },
];

/* ---------------------------------------------------------------------------
   PRESENTMENT PRICING

   Hand-set, rounded prices per currency. The multipliers below produce the
   *starting point* for a price list; the rounding to a whole unit is what
   makes the result look deliberate. Merchandising can override any row in the
   admin panel afterwards - these are defaults, not a live FX feed.
   ------------------------------------------------------------------------- */
export const PRESENTMENT_MULTIPLIERS: Record<string, number> = {
  EUR: 1.18,
  USD: 1.28,
  CAD: 1.74,
  AUD: 1.94,
};

/** Round to a whole major unit, then nudge to the nearest sensible price point. */
export function presentmentPrice(gbpMinor: number, multiplier: number): number {
  const major = (gbpMinor / 100) * multiplier;
  return Math.round(major) * 100;
}
