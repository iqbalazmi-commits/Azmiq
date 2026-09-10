/* ===========================================================================
   SEED CATALOGUE  —  GENERATED, DO NOT EDIT BY HAND

   Source : scripts/data/shopify-products.json (snapshot of azmiq.com/products.json)
            + the leather line, authored in scripts/build-catalogue.ts
   Rebuild: npm run catalogue:build

   The 13 copper products are exactly those on azmiq.com — nothing added; their
   prices, compare-at prices, variants and descriptions come from the live store.
   The 3 leather jackets are authored in the build script. All imagery lives in
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

const COPPER_CARE = "Hand wash only, in warm water with a little mild soap. Copper is a living metal: it darkens as it ages, and that patina is a sign of authenticity rather than a fault.\n\nTo bring back the shine, cut a lemon in half, dip it in salt and work it gently over the surface, then rinse thoroughly and dry with a soft cloth. A paste of equal parts flour, salt and white vinegar does the same job on heavier tarnish.\n\nNever put copper in a dishwasher, never use abrasive scourers or bleach, and dry it fully before storing. Store with the cap off so air can circulate.";

const ACACIA_CARE = "Hand wash in warm soapy water and dry immediately — never leave acacia to soak, and never put it in a dishwasher.\n\nEvery few weeks, rub in a thin coat of food-safe mineral oil with a soft cloth, leave it overnight and wipe away the excess. This keeps the grain sealed and stops it drying out or splitting.";

const LEATHER_CARE = "Genuine leather is a natural material and softens and develops a patina with wear — that is the point of it.\n\nWipe with a dry or barely damp cloth. Every few months, work a small amount of leather conditioner in with a soft cloth and buff off the excess. Keep it away from prolonged rain and direct heat; if it does get wet, let it dry naturally, away from a radiator.\n\nStore on a wide or padded hanger so the shoulders hold their shape. Do not wash, tumble dry or dry-clean.";

export const CATEGORIES = [
  {
    slug: "copper-water-bottles",
    title: "Copper Water Bottles",
    subtitle: "Tamra jal, every morning",
    description: "Handcrafted 100% pure copper bottles — hammered, hand-etched, matte and dual-finish, from 500ml to 950ml. Unlined, unlacquered and leak-proof, made for the Ayurvedic practice of storing water overnight.",
  },
  {
    slug: "copper-jugs-pitchers",
    title: "Copper Jugs & Pitchers",
    subtitle: "For the table, and for the night",
    description: "Generous copper jugs and lidded pitchers, hand-hammered by artisans who have worked the metal for generations. Beautiful enough for the table, practical enough for the bedside.",
  },
  {
    slug: "wellness-gift-sets",
    title: "Wellness Gift Sets",
    subtitle: "Complete, and considered",
    description: "Matched sets of jug, bottle and tumblers — the traditional way copper is served, and the gift people remember. Our best value per piece.",
  },
  {
    slug: "copper-accessories",
    title: "Copper Accessories",
    subtitle: "The quieter objects",
    description: "Solid copper pieces for the daily ritual — drop-in copper balls that bring the benefits of a copper vessel to the glass bottle you already own.",
  },
  {
    slug: "kitchen-utensils",
    title: "Kitchen Utensils",
    subtitle: "Warm grain, honest tools",
    description: "Utensils turned from sustainably sourced acacia — dense, close-grained, non-stick safe and warm against copper.",
  },
  {
    slug: "leather-jackets",
    title: "Leather",
    subtitle: "Genuine leather, made to last",
    description: "Genuine leather outerwear in clean, modern cuts — a café-racer jacket for men, and belted double-breasted trenches for women in black and deep burgundy. Full-grain hide, a soft full lining, a tailored fit. Five sizes, S to XXL.",
  },
];

export const CATALOGUE: SeedProduct[] = [
  {
    slug: "azmiq-pure-copper-balls-handmade-with-cotton-pouch",
    title: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch",
    seoTitle: "AZMIQ Pure Copper Balls",
    subtitle: "The copper vessel, in your glass bottle",
    summary: "Drop them into the glass bottle you already own and store water the traditional way, in pure copper.",
    description: "Enjoy the ancient practice of storing drinking water in copper with AZMIQ's handcrafted Pure Copper Balls. Simply drop them into your glass water bottle to infuse your water with the natural benefits of copper — the traditional way, reimagined for everyday modern life.\n\n• 100% Pure Copper – Made from solid copper, free from alloys or coatings\n\n• Handmade – Crafted by skilled artisans with precision and care\n\n• Reusable – Designed for daily use, built to last\n\n• Lightweight & Portable – Easy to carry anywhere, perfect for travel\n\n• Cotton Pouch Included – Comes with a premium cotton drawstring pouch for safe storage and travel\n\nA beautiful wellness gift or a daily ritual upgrade — these copper balls are as elegant as they are functional.",
    careInstructions: COPPER_CARE,
    finish: "Solid pure copper",
    weightGrams: null,
    dimensions: null,
    leakProof: false,
    categories: ["copper-accessories"],
    position: 0,
    images: [
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/00-ball_1.png", alt: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch, photographed on warm linen", kind: "hero", width: 417, height: 514 },
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/01-ball2.png", alt: "Close-up of the surface texture on the AZMIQ Pure Copper Balls – Handmade with Cotton Pouch", kind: "macro", width: 496, height: 517 },
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/02-ball3.png", alt: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch in use", kind: "lifestyle", width: 524, height: 507 },
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/03-ball4.png", alt: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch shown for scale", kind: "scale", width: 354, height: 518 },
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/04-ball5.png", alt: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch — view 5", kind: "gallery", width: 384, height: 517 },
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/05-ball7.png", alt: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch — view 6", kind: "gallery", width: 407, height: 498 },
      { file: "/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/06-ball6.png", alt: "AZMIQ Pure Copper Balls – Handmade with Cotton Pouch — view 7", kind: "gallery", width: 1536, height: 1024 },
    ],
    variants: [
      { sku: "AZMIQ-PURCOPBALHANWITCOTPO", title: "Standard", priceGbp: 2500, compareAtGbp: 3500, inventory: 40 },
    ],
  },
  {
    slug: "azmiq-pure-copper-water-bottle-500ml",
    title: "AZMIQ Pure Copper Water Bottle 500ml",
    seoTitle: "AZMIQ Pure Copper Water Bottle 500ml",
    subtitle: "The everyday 500ml, in pure copper",
    summary: "The everyday size in 100% pure copper — smooth, seamless and leak-proof, made for tamra jal.",
    description: "Its smooth, polished finish and minimalist silhouette make it as elegant on your desk as it is in your gym bag. Fill it the night before, wake up to naturally copper-charged water, and feel the difference.\n\n• 100% Pure Copper Body – No lining, no coating; pure copper in direct contact with your water for maximum Ayurvedic benefit\n\n• Handmade Plain Finish – Clean, smooth, and polished for a premium, understated look\n\n• 500ml Capacity – The ideal size for daily hydration at home, work, or on the go\n\n• Leakproof Cap – Secure, food-grade sealing component for a reliable, leak-resistant closure\n\n• Lightweight & Portable – Easy to carry in any bag or bottle holder\n\nDrink pure. Live well. The AZMIQ way.",
    wellnessStory: "Carry the ancient wisdom of Ayurveda wherever you go. The AZMIQ Pure Copper Water Bottle is a sleek, handcrafted 500ml bottle made entirely from pure copper — designed for those who take their wellness seriously without compromising on style.\n\nStoring water in a copper vessel overnight — known as Tamra Jal — is a centuries-old Ayurvedic practice. Copper naturally ionises the water, which is believed to support digestion, boost immunity, and promote overall vitality.",
    careInstructions: COPPER_CARE,
    finish: "Smooth pure copper",
    capacityMl: 500,
    weightGrams: null,
    dimensions: null,
    leakProof: true,
    categories: ["copper-water-bottles"],
    featured: true,
    position: 1,
    images: [
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/00-500_ml_bottle.png", alt: "AZMIQ Pure Copper Water Bottle 500ml, photographed on warm linen", kind: "hero", width: 1254, height: 1254 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/01-500_ml_hand_holding.png", alt: "Close-up of the surface texture on the AZMIQ Pure Copper Water Bottle 500ml", kind: "macro", width: 1122, height: 1402 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/02-500ml_with_measurement.png", alt: "AZMIQ Pure Copper Water Bottle 500ml in use", kind: "lifestyle", width: 908, height: 1731 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/03-pomelli_photoshoot-1.png", alt: "AZMIQ Pure Copper Water Bottle 500ml shown for scale", kind: "scale", width: 768, height: 1365 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/04-pomelli_photoshoot-2.png", alt: "AZMIQ Pure Copper Water Bottle 500ml — view 5", kind: "gallery", width: 768, height: 1365 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/05-pomelli_photoshoot-3.png", alt: "AZMIQ Pure Copper Water Bottle 500ml — view 6", kind: "gallery", width: 768, height: 1365 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/06-pomelli_photoshoot-4.png", alt: "AZMIQ Pure Copper Water Bottle 500ml — view 7", kind: "gallery", width: 768, height: 1365 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/07-dual4.jpg", alt: "AZMIQ Pure Copper Water Bottle 500ml — view 8", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/08-copper_oxidation.png", alt: "AZMIQ Pure Copper Water Bottle 500ml — view 9", kind: "gallery", width: 1254, height: 1254 },
      { file: "/images/products/azmiq-pure-copper-water-bottle-500ml/09-gemini_generated_image_ipc8vipc8vipc8vi.png", alt: "AZMIQ Pure Copper Water Bottle 500ml — view 10", kind: "gallery", width: 2048, height: 2048 },
    ],
    variants: [
      { sku: "AZMIQ-CWB-500", title: "Standard", capacityMl: 500, priceGbp: 2500, compareAtGbp: 3200, inventory: 40 },
    ],
  },
  {
    slug: "hammered-copper-jug",
    title: "Hammered Copper Jug",
    seoTitle: "Hammered Copper Jug",
    subtitle: "Hand-hammered, for the table",
    summary: "Hand-hammered from pure copper, for water served at the table or left overnight by the bed.",
    description: "• Pure Copper Construction — Naturally antimicrobial and Ayurvedic-approved for copper-charged water\n\n• Hand-Hammered Finish — Each dimple is individually crafted, making every jug uniquely beautiful\n\n• Elegant Lidded Design — Keeps water clean and free from dust and contaminants\n\n• Ergonomic Handle — Comfortable, balanced grip for effortless pouring\n\n• Polished Copper Lustre — A warm, radiant finish that looks stunning on any table or countertop\n\nA statement piece for the wellness-conscious home. Perfect as a gift or a luxurious addition to your own kitchen.",
    wellnessStory: "Elevate your daily hydration ritual with this exquisitely crafted Hammered Copper Jug. Inspired by centuries of Ayurvedic tradition, this jug is designed to store and naturally infuse water with the health-enhancing properties of pure copper.\n\nStoring water overnight in a copper vessel — known as Tamra Jal — is a time-honoured Ayurvedic practice believed to support digestion, immunity, and overall vitality.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered",
    weightGrams: 1200,
    dimensions: null,
    leakProof: false,
    categories: ["copper-jugs-pitchers"],
    featured: true,
    position: 2,
    images: [
      { file: "/images/products/hammered-copper-jug/00-dbfac89b-65db-4146-a9c0-9fb1f6f43ddb.png", alt: "Hammered Copper Jug, photographed on warm linen", kind: "hero", width: 1254, height: 1254 },
      { file: "/images/products/hammered-copper-jug/01-06c8b413-171d-4550-bf1e-8fad4bcce5f3.png", alt: "Close-up of the surface texture on the Hammered Copper Jug", kind: "macro", width: 1536, height: 1024 },
      { file: "/images/products/hammered-copper-jug/02-15722797-9d33-4f02-baa2-8754ee51ee37.png", alt: "Hammered Copper Jug in use", kind: "lifestyle", width: 1536, height: 1024 },
      { file: "/images/products/hammered-copper-jug/03-37620a7b-1f62-4804-8f45-235ad264256a.png", alt: "Hammered Copper Jug shown for scale", kind: "scale", width: 1536, height: 1024 },
      { file: "/images/products/hammered-copper-jug/04-70255e22-d5b6-44b0-86ca-ffb8ba21ba90.png", alt: "Hammered Copper Jug — view 5", kind: "gallery", width: 1536, height: 1024 },
      { file: "/images/products/hammered-copper-jug/05-de11df3b-8563-41f7-bad7-e7048a2fd38e.png", alt: "Hammered Copper Jug — view 6", kind: "gallery", width: 1402, height: 1122 },
      { file: "/images/products/hammered-copper-jug/06-e9301581-9ff8-43da-aa4d-1848d2bafb0d.png", alt: "Hammered Copper Jug — view 7", kind: "gallery", width: 1536, height: 1024 },
    ],
    variants: [
      { sku: "AZMIQ-HAMCOPJUG", title: "Standard", priceGbp: 8000, compareAtGbp: 9500, inventory: 40 },
    ],
  },
  {
    slug: "azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder",
    title: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece",
    seoTitle: "Azmiq Acacia Wood Kitchen Utensil Set",
    subtitle: "Ten pieces, one holder, sustainable acacia",
    summary: "Ten kitchen tools turned from sustainably sourced acacia, with a matching holder. Non-stick safe.",
    description: "Elevate your kitchen with the Azmiq Acacia Wood Kitchen Utensil Set — a beautifully crafted 10-piece collection made from premium natural acacia wood. Each utensil is hand-finished to bring warmth, elegance, and functionality to your cooking space.\n\nThe set includes a slotted spoon, solid spoon, slotted spatula, solid spatula, slotted turner, pasta server, skimmer, and more.\n\n• Natural Acacia Wood — sustainably sourced, durable, and beautiful\n\n• Eco-Friendly — free from harmful chemicals and plastics\n\n• Safe for Non-Stick Cookware — won't scratch your pans\n\n• 10-Piece Set — everything you need in one elegant set\n\n• Easy to Clean — hand wash recommended to preserve the natural wood grain\n\nA perfect gift for home cooks and a timeless addition to any kitchen.",
    careInstructions: ACACIA_CARE,
    finish: "Sustainably sourced acacia",
    weightGrams: 1200,
    dimensions: null,
    leakProof: false,
    categories: ["kitchen-utensils"],
    position: 3,
    images: [
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/00-sooonnew5.png", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece, photographed on warm linen", kind: "hero", width: 515, height: 443 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/01-sooonnew1.png", alt: "Close-up of the surface texture on the Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece", kind: "macro", width: 1536, height: 1024 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/02-sooonnew4.png", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece in use", kind: "lifestyle", width: 695, height: 559 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/03-sooonnew6.png", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece shown for scale", kind: "scale", width: 512, height: 455 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/04-spoon_new8.png", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 5", kind: "gallery", width: 1536, height: 1024 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/05-spoon105.jpg", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 6", kind: "gallery", width: 1024, height: 559 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/06-spoon107.jpg", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 7", kind: "gallery", width: 1024, height: 683 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/07-spoon108.jpg", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 8", kind: "gallery", width: 1024, height: 683 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/08-spoon109.jpg", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 9", kind: "gallery", width: 1024, height: 559 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/09-spoon102.png", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 10", kind: "gallery", width: 1536, height: 1024 },
      { file: "/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/10-measurements_2.jpg", alt: "Azmiq Acacia Wood Kitchen Utensil Set – 10 Piece — view 11", kind: "gallery", width: 1500, height: 1483 },
    ],
    variants: [
      { sku: "AZMIQ-ACAWOOKITUTESET10PIE", title: "Standard", priceGbp: 3200, compareAtGbp: 4000, inventory: 40 },
    ],
  },
  {
    slug: "hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set",
    title: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set",
    seoTitle: "Hammered Copper Jug with Brass Accents & Tumblers",
    subtitle: "Copper and brass, jug and tumblers",
    summary: "A hammered copper jug with brass handle and spout, and matching tumblers — a set made to be given.",
    description: "The warm rose-gold of the copper body, paired with gleaming brass handle, spout, and base, makes this far more than a water jug. It is a statement piece.\n\n• 1 x Large Hammered Copper Jug with brass handle, spout & pedestal base\n\n• 2 x Hammered Copper Tumblers\n\n• 100% pure copper body — no lining, no coating\n\n• Brass handle, spout tip & pedestal base — for a regal, antique finish\n\n• Hand-hammered texture — every piece is unique\n\n• Wide-mouth opening for easy filling and cleaning\n\n• Develops a natural patina over time — a hallmark of authentic copper\n\n• Includes 2 matching hammered copper tumblers\n\nPicture your morning: sunlight catching the warm glow of your copper jug, pouring cool, copper-charged water into a matching tumbler. It is not just hydration — it is a ritual worth waking up for.\n\nA perfect luxury gift for wellness enthusiasts, yoga practitioners, and those who appreciate artisan craftsmanship and conscious living.",
    wellnessStory: "Elevate your daily hydration ritual with our luxury hammered copper jug with brass accents. Inspired by centuries of Ayurvedic tradition, this stunning pure copper water pitcher is hand-crafted by master artisans — each dimple pressed by hand, each curve shaped with intention.\n\nStoring water overnight in a pure copper vessel naturally infuses it with beneficial copper ions — a practice rooted in Ayurvedic medicine and supported by modern science. Copper is naturally antimicrobial and is believed to support digestion, boost immunity, and promote overall wellness.",
    careInstructions: COPPER_CARE,
    finish: "Copper with brass accents",
    weightGrams: 1200,
    dimensions: null,
    leakProof: false,
    categories: ["wellness-gift-sets"],
    position: 4,
    images: [
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/00-jug7.png", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set, photographed on warm linen", kind: "hero", width: 1254, height: 1254 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/01-mug_jug3.jpg", alt: "Close-up of the surface texture on the Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set", kind: "macro", width: 1000, height: 1000 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/02-mug_jug2.png", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set in use", kind: "lifestyle", width: 1122, height: 1402 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/03-mug_jug4.png", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set shown for scale", kind: "scale", width: 1122, height: 1402 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/04-muglai_jug_1.png", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set — view 5", kind: "gallery", width: 1159, height: 1356 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/05-jug8.png", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set — view 6", kind: "gallery", width: 1402, height: 1122 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/06-matt4.jpg", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set — view 7", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/hammered-copper-jug-with-brass-accents-tumblers-luxury-ayurvedic-set/07-gemini_generated_image_ipc8vipc8vipc8vi_f14a2b7a-790b-42ae-87d1-229a3fd1af53.png", alt: "Hammered Copper Jug with Brass Accents & Tumblers – Luxury Ayurvedic Set — view 8", kind: "gallery", width: 2048, height: 2048 },
    ],
    variants: [
      { sku: "AZMIQ-HAMCOPJUGWITBRAACCTU", title: "Standard", priceGbp: 6500, compareAtGbp: 7500, inventory: 40 },
    ],
  },
  {
    slug: "hammered-copper-jug-tumbler-set-ayurvedic-drinkware-collection",
    title: "Hammered Copper Jug & Tumbler Set – Ayurvedic Drinkware Collection",
    seoTitle: "Hammered Copper Jug & Tumbler Set",
    subtitle: "The classic jug-and-tumbler service",
    summary: "The classic service: a lidded hammered jug with tumblers, in 100% pure copper.",
    description: "• 1 x Large Hammered Copper Jug with fitted lid & brass knob\n\n• 3 x Hammered Copper Tumblers\n\n• 100% pure copper — no lining, no coating\n\n• Hand-hammered antique finish — each piece is unique\n\n• Secure fitted lid with brass knob to keep water clean\n\n• Ergonomic handles for a comfortable, drip-free pour\n\n• Develops a beautiful natural patina over time\n\n• Ideal for daily Ayurvedic wellness rituals\n\nA perfect gift for wellness lovers, yoga practitioners, and those who appreciate artisan craftsmanship.",
    wellnessStory: "Bring the timeless wisdom of Ayurveda into your home with our hand-hammered pure copper jug and tumbler set. Crafted by skilled artisans using traditional techniques, each piece is hammered by hand — making every set truly one of a kind.\n\nStoring water in pure copper vessels overnight infuses it with natural copper ions — a practice rooted in Ayurvedic tradition and supported by modern science. Copper is naturally antimicrobial and is believed to support digestion, immunity, and overall wellness.\n\nFill your copper jug each evening. Wake up to naturally charged water and pour into your copper tumbler to start the day the Ayurvedic way. A simple, beautiful habit with lasting benefits.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered",
    weightGrams: null,
    dimensions: null,
    leakProof: false,
    categories: ["wellness-gift-sets"],
    position: 5,
    images: [
      { file: "/images/products/hammered-copper-jug-tumbler-set-ayurvedic-drinkware-collection/00-il_1588xn.7847039660_53v9.webp", alt: "Hammered Copper Jug & Tumbler Set – Ayurvedic Drinkware Collection, photographed on warm linen", kind: "hero", width: 1588, height: 1588 },
      { file: "/images/products/hammered-copper-jug-tumbler-set-ayurvedic-drinkware-collection/01-il_1588xn.7895005591_mfya.webp", alt: "Close-up of the surface texture on the Hammered Copper Jug & Tumbler Set – Ayurvedic Drinkware Collection", kind: "macro", width: 1588, height: 1447 },
      { file: "/images/products/hammered-copper-jug-tumbler-set-ayurvedic-drinkware-collection/02-il_1588xn.7847039660_53v9_fd3b188d-bb03-48ca-a70d-2bb10731f930.webp", alt: "Hammered Copper Jug & Tumbler Set – Ayurvedic Drinkware Collection in use", kind: "lifestyle", width: 1588, height: 1588 },
    ],
    variants: [
      { sku: "AZMIQ-HAMCOPJUGTUMSETAYUDR", title: "Standard", priceGbp: 5000, compareAtGbp: 6500, inventory: 40 },
    ],
  },
  {
    slug: "hammered-copper-jug-with-lid-ayurvedic-water-pitcher",
    title: "Hammered Copper Jug with Lid – Ayurvedic Water Pitcher",
    seoTitle: "Hammered Copper Jug with Lid",
    subtitle: "Lidded, from one to two litres",
    summary: "A lidded, hand-hammered copper pitcher in three sizes, from one to two litres. Keeps water dust-free.",
    description: "• 100% pure copper — no lining, no coating\n\n• Hand-hammered antique finish — each jug is unique\n\n• Secure fitted lid with brass knob — keeps water dust-free\n\n• Ergonomic curved handle — comfortable, drip-free pour\n\n• Develops a natural patina — a sign of authentic copper\n\n• Large capacity — ideal for family use\n\nPerfect as a wellness gift, a kitchen centrepiece, or a daily health ritual. Loved by those who value quality, heritage, and conscious living.",
    wellnessStory: "Discover the ancient art of copper hydration with our hand-hammered pure copper jug. Trusted by Ayurvedic tradition for centuries, a copper water pitcher naturally purifies water, supports digestion, and promotes overall wellness — all while looking stunning on your kitchen counter.\n\nCopper is naturally antimicrobial. Storing water overnight in a pure copper vessel infuses it with beneficial copper ions, a practice backed by both Ayurvedic medicine and modern science. It is one of the simplest wellness upgrades you can make.\n\nFill your copper water jug each evening. Wake up to naturally charged water, ready to start your day the Ayurvedic way. A simple habit with lasting benefits.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered",
    weightGrams: null,
    dimensions: null,
    leakProof: false,
    categories: ["copper-jugs-pitchers"],
    position: 6,
    images: [
      { file: "/images/products/hammered-copper-jug-with-lid-ayurvedic-water-pitcher/00-jugant1.png", alt: "Hammered Copper Jug with Lid – Ayurvedic Water Pitcher, photographed on warm linen", kind: "hero", width: 1254, height: 1254 },
      { file: "/images/products/hammered-copper-jug-with-lid-ayurvedic-water-pitcher/01-jugantique.png", alt: "Close-up of the surface texture on the Hammered Copper Jug with Lid – Ayurvedic Water Pitcher", kind: "macro", width: 1254, height: 1254 },
      { file: "/images/products/hammered-copper-jug-with-lid-ayurvedic-water-pitcher/02-jug3.png", alt: "Hammered Copper Jug with Lid – Ayurvedic Water Pitcher in use", kind: "lifestyle", width: 1254, height: 1254 },
      { file: "/images/products/hammered-copper-jug-with-lid-ayurvedic-water-pitcher/03-jug4.png", alt: "Hammered Copper Jug with Lid – Ayurvedic Water Pitcher shown for scale", kind: "scale", width: 1254, height: 1254 },
      { file: "/images/products/hammered-copper-jug-with-lid-ayurvedic-water-pitcher/04-jug5.png", alt: "Hammered Copper Jug with Lid – Ayurvedic Water Pitcher — view 5", kind: "gallery", width: 1254, height: 1254 },
    ],
    variants: [
      { sku: "AZMIQ-HAMCOPJUGWITLIDAYUWA-1000ML", title: "1000 ML", capacityMl: 1000, priceGbp: 4500, compareAtGbp: 5500, inventory: 40 },
      { sku: "AZMIQ-HAMCOPJUGWITLIDAYUWA-1500ML", title: "1500 ML", capacityMl: 1500, priceGbp: 4800, compareAtGbp: 6500, inventory: 40 },
      { sku: "AZMIQ-HAMCOPJUGWITLIDAYUWA-2000ML", title: "2000 ML", capacityMl: 2000, priceGbp: 5200, compareAtGbp: 6900, inventory: 40 },
    ],
  },
  {
    slug: "ayurvedic-copper-water-set",
    title: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift",
    seoTitle: "Ayurvedic Copper Water Set",
    subtitle: "Jug, bottle and two glasses",
    summary: "A 1.1L jug, a bottle and two glasses in pure copper — the complete set for the daily ritual.",
    description: "Each piece is artisan‑made with a warm, lustrous finish. The exterior is lightly lacquered to help preserve shine; the interior remains raw copper for traditional use. Expect subtle variations—your set is genuinely one of a kind.\n\n• Complete copper water set: 1 x Jug (1.1L), 1 x Bottle, 2 x Glasses\n\n• Pure copper interior for Ayurveda‑inspired water storage\n\n• Leak‑resistant, quiet‑close bottle cap\n\n• Handcrafted detail—no two sets are exactly alike\n\n• Lacquered exterior slows tarnishing; easy to polish as needed\n\n• Thoughtful wellness gift for home, office, or entertaining\n\nBring timeless craft and naturally refreshing hydration into your day—make this copper jug set part of your daily ritual now.",
    wellnessStory: "Our Ayurvedic Copper Water Set turns everyday sipping into a calming wellness ritual. Handcrafted from pure copper, this elegant trio—1.1L jug, matching copper bottle, and two copper glasses—brings fresh, clean-tasting water to your counter, desk, or dining table.\n\nInspired by time‑honoured Ayurveda, storing water in a copper water jug can naturally enhance freshness, while copper's antimicrobial properties help keep the vessel cleaner between washes. It's a beautiful, plastic‑free upgrade that encourages you to drink more, stay hydrated, and feel good about your routine.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered",
    capacityMl: 1100,
    weightGrams: 1200,
    dimensions: null,
    leakProof: false,
    categories: ["wellness-gift-sets"],
    featured: true,
    position: 7,
    images: [
      { file: "/images/products/ayurvedic-copper-water-set/00-copper-jug-set_d7bc5f9a-0bf4-4637-b6c2-7b6ec5d62ab9.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift, photographed on warm linen", kind: "hero", width: 1024, height: 1024 },
      { file: "/images/products/ayurvedic-copper-water-set/01-jugcombo.png", alt: "Close-up of the surface texture on the Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift", kind: "macro", width: 1024, height: 1536 },
      { file: "/images/products/ayurvedic-copper-water-set/02-jugphoto2.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift in use", kind: "lifestyle", width: 1024, height: 1536 },
      { file: "/images/products/ayurvedic-copper-water-set/03-glass.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift shown for scale", kind: "scale", width: 399, height: 672 },
      { file: "/images/products/ayurvedic-copper-water-set/04-jug_combo.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 5", kind: "gallery", width: 1024, height: 1536 },
      { file: "/images/products/ayurvedic-copper-water-set/05-jug_photo_2.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 6", kind: "gallery", width: 1024, height: 1536 },
      { file: "/images/products/ayurvedic-copper-water-set/06-jug_bottle.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 7", kind: "gallery", width: 372, height: 334 },
      { file: "/images/products/ayurvedic-copper-water-set/07-jug.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 8", kind: "gallery", width: 377, height: 672 },
      { file: "/images/products/ayurvedic-copper-water-set/08-1mqjarr4bqrxmtup3qmwkas_0_gps_generated.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 9", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/ayurvedic-copper-water-set/09-1mqjarr4bqrxmtup3qmwkas_1_gps_generated.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 10", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/ayurvedic-copper-water-set/10-1mqjarr4bqrxmtup3qmwkas_2_gps_generated.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 11", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/ayurvedic-copper-water-set/11-1mqjarr4bqrxmtup3qmwkas_3_gps_generated.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 12", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/ayurvedic-copper-water-set/12-copper_oxidation.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 13", kind: "gallery", width: 1254, height: 1254 },
      { file: "/images/products/ayurvedic-copper-water-set/13-gemini_generated_image_ipc8vipc8vipc8vi_adb4d432-77c0-4399-a492-b6552f565aac.png", alt: "Ayurvedic Copper Water Set — Handcrafted Pure Copper Jug (1.1L), Bottle & 2 Glasses | Natural Hydration Wellness Gift — view 14", kind: "gallery", width: 2048, height: 2048 },
    ],
    variants: [
      { sku: "AZMIQ-AYUCOPWATSET", title: "Standard", capacityMl: 1100, priceGbp: 5900, compareAtGbp: 6900, inventory: 40 },
    ],
  },
  {
    slug: "pure-copper-water-bottle",
    title: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration",
    seoTitle: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid",
    subtitle: "Matte, fingerprint-resistant, leak-proof",
    summary: "Pure copper inside, a matte lacquered finish outside that resists fingerprints and slows tarnish.",
    description: "Meet your new daily ritual: a pure copper water bottle that blends ancient wisdom with modern ease. Handcrafted from 100% copper and finished with a sleek, fingerprint‑resistant matte coat, it keeps hydration simple, stylish, and leak‑proof—whether you’re at your desk, in the studio, or commuting.\n\n• 100% pure copper interior for the classic copper vessel experience\n\n• Matte, lacquered exterior slows tarnish and resists fingerprints\n\n• Leak‑proof screw cap with food‑grade lining—no squeaks, no spills\n\n• Comfortable, carry‑friendly silhouette with ideal daily capacity\n\n• Reusable, plastic‑free alternative to disposable bottles\n\n• Easy care: clean with lemon and salt; natural patina is normal\n\nElevate your hydration ritual with a matte, leak‑proof copper bottle that looks as good as it performs—add this copper drink bottle to your cart and sip with intention every day.",
    wellnessStory: "Rooted in Ayurveda, many enjoy storing water overnight to prepare traditional Tamra Jal and sip first thing in the morning. If you use RO or filtered water, this Ayurvedic copper bottle adds a mindful, heritage‑inspired touch to your routine. Copper’s naturally antimicrobial surface helps keep things fresh, and every bottle is uniquely handcrafted with subtle variations for character.",
    careInstructions: COPPER_CARE,
    finish: "Matte lacquered",
    weightGrams: 600,
    dimensions: null,
    leakProof: true,
    categories: ["copper-water-bottles"],
    position: 8,
    images: [
      { file: "/images/products/pure-copper-water-bottle/00-shopify_plain_copper_1.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration, photographed on warm linen", kind: "hero", width: 1024, height: 1536 },
      { file: "/images/products/pure-copper-water-bottle/01-matt7.jpg", alt: "Close-up of the surface texture on the Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration", kind: "macro", width: 908, height: 1024 },
      { file: "/images/products/pure-copper-water-bottle/02-matt2.jpg", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration in use", kind: "lifestyle", width: 1024, height: 1024 },
      { file: "/images/products/pure-copper-water-bottle/03-matt1.jpg", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration shown for scale", kind: "scale", width: 1024, height: 1024 },
      { file: "/images/products/pure-copper-water-bottle/04-matt4.jpg", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 5", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/pure-copper-water-bottle/05-matt8.jpg", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 6", kind: "gallery", width: 908, height: 1024 },
      { file: "/images/products/pure-copper-water-bottle/06-gemini_generated_image_ipc8vipc8vipc8vi_f14a2b7a-790b-42ae-87d1-229a3fd1af53.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 7", kind: "gallery", width: 2048, height: 2048 },
      { file: "/images/products/pure-copper-water-bottle/07-copper_oxidation_79ae5e9b-795e-4c11-ae84-edef8635010f.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 8", kind: "gallery", width: 1254, height: 1254 },
      { file: "/images/products/pure-copper-water-bottle/08-mattplain_1.jpg", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 9", kind: "gallery", width: 794, height: 896 },
      { file: "/images/products/pure-copper-water-bottle/09-1-photoroom_1.jpg", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 10", kind: "gallery", width: 794, height: 896 },
      { file: "/images/products/pure-copper-water-bottle/10-chatgpt_image_sep_27_2025_10_22_24_pm.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 11", kind: "gallery", width: 1024, height: 1536 },
      { file: "/images/products/pure-copper-water-bottle/11-matte-copper-water-bottle.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 12", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/pure-copper-water-bottle/12-copper_2.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 13", kind: "gallery", width: 1024, height: 1536 },
      { file: "/images/products/pure-copper-water-bottle/13-plain_copper.png", alt: "Pure Copper Water Bottle with Matte Finish & Leak-Proof Lid - Ayurvedic-Inspired Hydration — view 14", kind: "gallery", width: 1024, height: 1536 },
    ],
    variants: [
      { sku: "AZMIQ-PURCOPWATBOT", title: "Standard", priceGbp: 3200, compareAtGbp: 3499, inventory: 40 },
    ],
  },
  {
    slug: "pure-copper-water-bottle-set",
    title: "Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration",
    seoTitle: "Pure Copper Water Bottle Set",
    subtitle: "Hammered and etched, a two-bottle bundle",
    summary: "Two 750ml pure copper bottles, one hammered and one etched — an Ayurvedic hydration bundle.",
    description: "Fill and rest overnight to enjoy crisp‑tasting water, naturally. Each 750ml bottle features a 100% pure, unlined copper interior and a protective exterior lacquer to help preserve the finish as a rich patina develops. The leak‑resistant, easy‑twist cap with a quiet inner liner delivers a smooth, anti‑squeak close. Because they're artisan‑made, subtle variations, light marks, and hammering patterns make every copper water bottle uniquely yours.\n\n• Pure copper interior; no lining or coatings inside\n\n• Handcrafted finishes; natural variations add character\n\n• Leak‑resistant, easy‑twist cap; quiet close\n\n• Protective outer lacquer slows tarnish; patina with use\n\n• Plastic‑free, eco‑friendly hydration; easy to clean\n\n• Ideal for home, office, gym, travel, and gifting\n\n• 2‑bottle flexibility — rotate, keep one at work, or share\n\n• Thoughtful, wellness‑led design inspired by Ayurveda\n\nMake hydration a habit you love. Add this copper water bottle set to your cart and sip with purpose—style, substance, and tradition in one smart bundle.",
    wellnessStory: "Meet your daily ritual upgrade: our Pure Copper Water Bottle Set pairs a handcrafted hammered bottle with an elegantly etched twin for Ayurvedic‑inspired, plastic‑free hydration. Rotate them between home, office, or gym, or share the wellness—beautifully made pieces that make drinking water feel intentional, fresh, and effortless.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered",
    weightGrams: 1000,
    dimensions: null,
    leakProof: false,
    categories: ["wellness-gift-sets"],
    position: 9,
    images: [
      { file: "/images/products/pure-copper-water-bottle-set/00-download_1.jpg", alt: "Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration, photographed on warm linen", kind: "hero", width: 487, height: 487 },
      { file: "/images/products/pure-copper-water-bottle-set/01-copper-water-bottle-bundle.png", alt: "Close-up of the surface texture on the Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration", kind: "macro", width: 331, height: 869 },
      { file: "/images/products/pure-copper-water-bottle-set/02-copperbottle.jpg", alt: "Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration in use", kind: "lifestyle", width: 945, height: 1280 },
      { file: "/images/products/pure-copper-water-bottle-set/03-newhammered.png", alt: "Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration shown for scale", kind: "scale", width: 1024, height: 1536 },
      { file: "/images/products/pure-copper-water-bottle-set/04-photoroom.jpg", alt: "Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration — view 5", kind: "gallery", width: 1500, height: 1500 },
      { file: "/images/products/pure-copper-water-bottle-set/05-copper_bottle_300x399_461ca99f-b8d2-494a-9f57-d788df573e45.png", alt: "Pure Copper Water Bottle Set | Handcrafted Hammered & Etched 2-Bottle Bundle for Ayurvedic Hydration — view 6", kind: "gallery", width: 300, height: 399 },
    ],
    variants: [
      { sku: "AZMIQ-PURCOPWATBOTSET", title: "Standard", priceGbp: 7000, compareAtGbp: 9000, inventory: 40 },
    ],
  },
  {
    slug: "premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant",
    title: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design",
    seoTitle: "Hammered Copper Water Bottle",
    subtitle: "The one that started it",
    summary: "Our most-bought bottle: seamless 100% pure copper, hand-hammered and leak-proof.",
    description: "Meet your everyday upgrade: our Hammered Copper Water Bottle. Handcrafted from 100% pure copper with a striking hammered finish, it blends timeless craftsmanship with a modern, leak‑proof design you can trust at the gym, office, or bedside.\n\n• 100% pure copper interior (no inner lining)\n\n• Hand‑hammered finish for durability and character\n\n• Leak‑proof cap with smooth inner lining for a secure, quiet seal\n\n• Naturally antimicrobial metal; odor‑resistant and easy to maintain\n\n• Eco‑friendly, reusable alternative to plastic bottles\n\n• Protective lacquer on the exterior to help preserve shine\n\nHow to use: Fill with cool or room‑temp water and let it rest 6–8 hours for a traditional copper infusion; sip throughout the day. Care: Hand wash with warm water and mild soap; polish weekly with lemon and salt. Avoid dishwasher and abrasives. A natural patina and subtle marks are normal—each bottle is uniquely yours.\n\nIf you value thoughtful design, clean materials, and everyday rituals that feel good, this handcrafted copper water bottle is the one you’ll reach for again and again. Add it to your routine today.",
    wellnessStory: "Rooted in centuries‑old Ayurvedic practice, this pure copper bottle makes hydration feel intentional. It’s reusable, naturally antimicrobial, and thoughtfully made to replace single‑use plastics—so you drink cleaner and live lighter.",
    careInstructions: COPPER_CARE,
    finish: "Hand-hammered",
    weightGrams: null,
    dimensions: null,
    leakProof: true,
    categories: ["copper-water-bottles"],
    position: 10,
    images: [
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/00-hammered_copper_new7.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design, photographed on warm linen", kind: "hero", width: 1024, height: 1024 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/01-hammered_copper_bottle.webp", alt: "Close-up of the surface texture on the Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design", kind: "macro", width: 1588, height: 1588 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/02-copper_oxidation_79ae5e9b-795e-4c11-ae84-edef8635010f.png", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design in use", kind: "lifestyle", width: 1254, height: 1254 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/03-hammered_copper_new2.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design shown for scale", kind: "scale", width: 1024, height: 1024 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/04-gemini_generated_image_ipc8vipc8vipc8vi_adb4d432-77c0-4399-a492-b6552f565aac.png", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 5", kind: "gallery", width: 2048, height: 2048 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/05-hammered_copper_new6.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 6", kind: "gallery", width: 1080, height: 1080 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/06-hammered_copper_new1.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 7", kind: "gallery", width: 1024, height: 1024 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/07-newhammered.png", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 8", kind: "gallery", width: 1024, height: 1536 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/08-hammerred_copper2.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 9", kind: "gallery", width: 388, height: 1280 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/09-photoroom.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 10", kind: "gallery", width: 1500, height: 1500 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/10-copperbottle.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 11", kind: "gallery", width: 945, height: 1280 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/11-hammerred_copper1.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 12", kind: "gallery", width: 520, height: 1367 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/12-hammerred_copper3.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 13", kind: "gallery", width: 1080, height: 1084 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/13-hammerred_copper4.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 14", kind: "gallery", width: 1500, height: 1500 },
      { file: "/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/14-all_bottles.jpg", alt: "Hammered Copper Water Bottle – Handcrafted 100% Pure Copper, Leak‑Proof Design — view 15", kind: "gallery", width: 681, height: 1024 },
    ],
    variants: [
      { sku: "AZMIQ-PREHANHAMCOPWATBOTLE", title: "Standard", priceGbp: 3500, compareAtGbp: 4000, inventory: 40 },
    ],
  },
  {
    slug: "premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml",
    title: "Dual Hammered Copper Water Bottle (950ml) - 100% Pure Copper, Leak-Proof, Handcrafted",
    seoTitle: "Dual Hammered Copper Water Bottle (950ml)",
    subtitle: "Two textures, one 950ml vessel",
    summary: "A 950ml bottle in pure copper with two hammered textures — leak-proof and handcrafted.",
    description: "From morning commutes to evening wind-downs, this pure copper water bottle helps you drink more water and waste less. The durable threaded cap prevents leaks in your bag, the eco-friendly build replaces disposable plastic, and the artisan texture offers a comfortable, slip-resistant grip—beauty, function, and sustainability in one refined copper bottle.\n\n• 100% pure copper interior (no lining) for traditional water storage\n\n• Dual-hammered artisan finish; each piece is uniquely handcrafted\n\n• 950ml (32 oz) capacity for all-day hydration\n\n• Leak-proof, rust-resistant threaded cap\n\n• Sustainable, reusable alternative to plastic bottles\n\n• Natural variations and minor marks celebrate handcraft\n\n• Protective outer lacquer preserves exterior shine; interior stays pure copper\n\n• Cap’s inner lining ensures a smooth, quiet, secure seal\n\nCare is simple: hand-wash daily, polish weekly with lemon and salt, and let a graceful patina develop over time. Pro tip: fill at night, enjoy in the morning, then refill throughout the day.\n\nBring home the beauty of real copper—choose the bottle that looks stunning, performs daily, and helps you hydrate mindfully.",
    wellnessStory: "Meet your new everyday essential: a premium dual hammered copper water bottle that blends timeless craftsmanship with modern convenience. Handcrafted from 100% pure copper and finished in a striking dual-hammered pattern, it holds a generous 950ml—perfect for all-day hydration—while honoring Ayurvedic-inspired water storage in a sleek, leak-proof design.",
    careInstructions: COPPER_CARE,
    finish: "Dual-hammered",
    capacityMl: 950,
    weightGrams: 450,
    dimensions: null,
    leakProof: true,
    categories: ["copper-water-bottles"],
    position: 11,
    images: [
      { file: "/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/00-premium-dual-hammered-copper-water-bottle.png", alt: "Dual Hammered Copper Water Bottle (950ml) - 100% Pure Copper, Leak-Proof, Handcrafted, photographed on warm linen", kind: "hero", width: 1024, height: 1024 },
      { file: "/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/01-dual_tone_bottle_300x300_e2b2b7de-9c0d-4605-ba0c-568305bfda7c.png", alt: "Close-up of the surface texture on the Dual Hammered Copper Water Bottle (950ml) - 100% Pure Copper, Leak-Proof, Handcrafted", kind: "macro", width: 300, height: 300 },
      { file: "/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/02-dual_bottle_white_background.png", alt: "Dual Hammered Copper Water Bottle (950ml) - 100% Pure Copper, Leak-Proof, Handcrafted in use", kind: "lifestyle", width: 1024, height: 1024 },
      { file: "/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/03-copper_bottle_infographic.jpg", alt: "Dual Hammered Copper Water Bottle (950ml) - 100% Pure Copper, Leak-Proof, Handcrafted shown for scale", kind: "scale", width: 1024, height: 1536 },
      { file: "/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/04-dualtonebottle.png", alt: "Dual Hammered Copper Water Bottle (950ml) - 100% Pure Copper, Leak-Proof, Handcrafted — view 5", kind: "gallery", width: 1024, height: 1024 },
    ],
    variants: [
      { sku: "AZMIQ-PREDUAHAMCOPWATBOT10", title: "Standard", capacityMl: 950, priceGbp: 3800, compareAtGbp: 4500, inventory: 40 },
    ],
  },
  {
    slug: "ayurvedic-copper-water-bottle",
    title: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof",
    seoTitle: "Ayurvedic Copper Water Bottle",
    subtitle: "Hand-etched, antique finish",
    summary: "Hand-etched one at a time, with an antique finish. Pure copper, with a leak-proof cap.",
    description: "• 100% pure copper interior (no inner coating) for traditional copper drinking\n\n• Hand‑etched antique pattern—each bottle’s markings are uniquely artisan‑made\n\n• Leak‑proof, quiet‑twist cap with inner lining to prevent squeaks and spills\n\n• Protective lacquer on the outside preserves shine; interior remains pure copper\n\n• Durable, rust‑resistant build; a sustainable, plastic‑free alternative\n\n• Natural antimicrobial copper surface for fresher, cleaner‑tasting water\n\n• Thoughtful gift for wellness seekers and design lovers alike\n\nCare is simple: hand wash with mild soap, polish with lemon‑salt as needed, and avoid acidic drinks. Subtle surface variations and patina are normal hallmarks of real copper and hand craftsmanship.",
    wellnessStory: "This Ayurvedic copper water bottle turns everyday hydration into a simple wellness ritual. Hand‑etched by artisans and crafted from pure, unlined copper, it blends timeless beauty with practical, leak‑proof performance in a bottle you’ll love to carry.\n\nFill it at night, let the water rest for 6–8 hours, then sip in the morning to start fresh. For centuries, copper has been valued in Ayurveda for its naturally antimicrobial surface and support of healthy digestion and metabolism. While experiences vary, many enjoy the crisper taste and a lighter, more balanced feel throughout the day.\n\nBring artistry and Ayurveda‑inspired hydration into your day. Elevate your routine with this hand‑etched copper drinking bottle—and feel the difference. Add it to cart now.",
    careInstructions: COPPER_CARE,
    finish: "Hand-etched, antique",
    weightGrams: 450,
    dimensions: null,
    leakProof: true,
    categories: ["copper-water-bottles"],
    position: 12,
    images: [
      { file: "/images/products/ayurvedic-copper-water-bottle/00-antique_new_shape.png", alt: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof, photographed on warm linen", kind: "hero", width: 1023, height: 1537 },
      { file: "/images/products/ayurvedic-copper-water-bottle/01-bag_antique.jpg", alt: "Close-up of the surface texture on the Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof", kind: "macro", width: 505, height: 452 },
      { file: "/images/products/ayurvedic-copper-water-bottle/02-hand_antique.jpg", alt: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof in use", kind: "lifestyle", width: 502, height: 496 },
      { file: "/images/products/ayurvedic-copper-water-bottle/03-mountain_antique.jpg", alt: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof shown for scale", kind: "scale", width: 500, height: 534 },
      { file: "/images/products/ayurvedic-copper-water-bottle/04-office_table_antique.jpg", alt: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof — view 5", kind: "gallery", width: 504, height: 534 },
      { file: "/images/products/ayurvedic-copper-water-bottle/05-tea_antique.jpg", alt: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof — view 6", kind: "gallery", width: 509, height: 501 },
      { file: "/images/products/ayurvedic-copper-water-bottle/06-pouring_antique.jpg", alt: "Ayurvedic Copper Water Bottle - Hand-Etched, Pure Copper, Leak-Proof — view 7", kind: "gallery", width: 494, height: 464 },
    ],
    variants: [
      { sku: "AZMIQ-AYUCOPWATBOT", title: "Standard", priceGbp: 4000, compareAtGbp: 5000, inventory: 40 },
    ],
  },
  {
    slug: "mens-leather-jacket",
    title: "Men's Leather Jacket",
    seoTitle: "Men's Leather Jacket",
    subtitle: "Genuine leather, café-racer cut",
    summary: "A clean-lined café-racer in genuine leather — low stand collar, twin zip pockets, a tailored modern fit.",
    description: "Cut as a café-racer: a low stand collar, a clean centre zip and twin zip hand pockets, with almost no extra hardware. It is made to sit close without pulling, and to layer over a tee or a light knit.\n\n• Genuine leather outer with a soft full lining\n• Low stand collar with a single stud tab\n• Metal zips at the front and pockets\n• Tailored modern fit — size up for a relaxed fit\n• Interior pocket\n\nEvery jacket is cut and finished by hand, so the grain and the break of the leather vary slightly from one to the next.",
    careInstructions: LEATHER_CARE,
    material: "Genuine leather",
    finish: "Genuine sheepskin leather",
    dimensions: null,
    weightGrams: 1400,
    leakProof: false,
    foodGrade: false,
    categories: ["leather-jackets"],
    featured: true,
    position: 13,
    images: [
      { file: "/images/products/mens-leather-jacket/00-hero.png", alt: "Men's black leather jacket, front view on a plain ground", kind: "hero", width: 1024, height: 1536 },
      { file: "/images/products/mens-leather-jacket/01-flat.jpg", alt: "The jacket laid flat, showing the cut, collar and zip hardware", kind: "gallery", width: 1600, height: 1192 },
      { file: "/images/products/mens-leather-jacket/02-brand.png", alt: "AZMIQ leather — crafted for confidence, durability and refined style", kind: "lifestyle", width: 512, height: 512 },
      { file: "/images/products/mens-leather-jacket/03-why.png", alt: "Why AZMIQ leather: genuine hide, durable metal zips, soft inner lining, tailored fit", kind: "gallery", width: 512, height: 512 },
      { file: "/images/products/mens-leather-jacket/04-size.jpg", alt: "Men's leather jacket size chart with chest, shoulder, sleeve and length measurements", kind: "gallery", width: 1800, height: 1200 },
    ],
    variants: [
      { sku: "AZMIQ-MLJ-S", title: "S", priceGbp: 13900, inventory: 20 },
      { sku: "AZMIQ-MLJ-M", title: "M", priceGbp: 13900, inventory: 20 },
      { sku: "AZMIQ-MLJ-L", title: "L", priceGbp: 13900, inventory: 20 },
      { sku: "AZMIQ-MLJ-XL", title: "XL", priceGbp: 13900, inventory: 20 },
      { sku: "AZMIQ-MLJ-XXL", title: "XXL", priceGbp: 13900, inventory: 20 },
    ],
  },
  {
    slug: "womens-leather-jacket",
    title: "Women's Leather Trench",
    seoTitle: "Women's Leather Trench",
    subtitle: "Double-breasted, self-tie belt, black",
    summary: "A black leather trench in the classic register — double-breasted, notch lapels and a soft self-tie belt, cut close and worn open or knotted.",
    description: "A leather trench that keeps the codes and loses the bulk: double-breasted front, notch lapels with a back storm flap, and a soft self-tie belt rather than a buckle. Softly structured through the shoulder, close through the waist, and cut to sit between the hip and the knee.\n\n• Full-grain black leather outer, fully lined\n• Double-breasted, with tonal buttons\n• Soft self-tie belt; buttoned cuff tabs\n• Notch lapels and a back storm flap\n• Flap hip pockets\n• Size up to layer a knit underneath\n\nCut and finished by hand, so the grain and the fall of the leather vary a little from one to the next.",
    careInstructions: LEATHER_CARE,
    material: "Genuine leather",
    finish: "Black full-grain leather",
    dimensions: null,
    weightGrams: 1400,
    leakProof: false,
    foodGrade: false,
    categories: ["leather-jackets"],
    position: 14,
    images: [
      { file: "/images/products/womens-leather-jacket/00-hero.jpg", alt: "Women's black leather trench with a self-tie belt, front view on a dark ground", kind: "hero", width: 1200, height: 1351 },
      { file: "/images/products/womens-leather-jacket/01-editorial.jpg", alt: "The black leather trench shown full length against a concrete wall", kind: "gallery", width: 1700, height: 932 },
      { file: "/images/products/womens-leather-jacket/02-london.jpg", alt: "AZMIQ leather styled with boots and a portfolio on a London street", kind: "lifestyle", width: 1700, height: 950 },
    ],
    variants: [
      { sku: "AZMIQ-WLT-S", title: "S", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-M", title: "M", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-L", title: "L", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-XL", title: "XL", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-XXL", title: "XXL", priceGbp: 15000, inventory: 20 },
    ],
  },
  {
    slug: "womens-burgundy-leather-jacket",
    title: "Women's Burgundy Leather Trench",
    seoTitle: "Women's Burgundy Leather Trench",
    subtitle: "Double-breasted, belted, wine burgundy",
    summary: "A double-breasted leather trench in deep wine burgundy — notch lapels, a buckled self-belt and a knee-skimming line, cut for a woman's frame.",
    description: "A leather trench in the classic register: double-breasted front, notch lapels with a storm flap, and a self-belt drawn through an antique-brass buckle. Knee-length, softly structured through the shoulder, and cut close through the waist.\n\n• Full-grain leather outer in a deep wine burgundy, fully lined\n• Double-breasted, with horn-look buttons\n• Self-belt with an antique-brass buckle; buttoned cuff tabs\n• Notch lapels and a back storm flap\n• Flap hip pockets\n• Knee-length — size up to layer a knit underneath\n\nCut and finished by hand, so the grain and the depth of colour vary a little from one to the next.",
    careInstructions: LEATHER_CARE,
    material: "Genuine leather",
    finish: "Burgundy full-grain leather",
    dimensions: null,
    weightGrams: 1400,
    leakProof: false,
    foodGrade: false,
    categories: ["leather-jackets"],
    position: 15,
    images: [
      { file: "/images/products/womens-burgundy-leather-jacket/00-hero.jpg", alt: "Burgundy leather trench coat on a wooden hanger in a linen-lined display niche", kind: "hero", width: 1180, height: 1264 },
      { file: "/images/products/womens-burgundy-leather-jacket/01-flat.jpg", alt: "The burgundy leather trench laid flat, showing the double-breasted front, belt and lapels", kind: "gallery", width: 1300, height: 1457 },
      { file: "/images/products/womens-burgundy-leather-jacket/02-detail.jpg", alt: "Close detail of the antique-brass belt buckle, horn-look buttons and topstitching", kind: "macro", width: 1600, height: 900 },
      { file: "/images/products/womens-burgundy-leather-jacket/03-boutique.jpg", alt: "The burgundy leather trench displayed on a form in a wood-panelled boutique", kind: "lifestyle", width: 1600, height: 898 },
    ],
    variants: [
      { sku: "AZMIQ-WLT-BUR-S", title: "S", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-BUR-M", title: "M", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-BUR-L", title: "L", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-BUR-XL", title: "XL", priceGbp: 15000, inventory: 20 },
      { sku: "AZMIQ-WLT-BUR-XXL", title: "XXL", priceGbp: 15000, inventory: 20 },
    ],
  },
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
