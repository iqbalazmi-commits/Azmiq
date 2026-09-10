import "./load-env";
import { sql } from "drizzle-orm";
import { db, closeDb } from "../db";
import * as t from "../db/schema";
import { hashPassword } from "../lib/auth";
import { CATALOGUE, CATEGORIES, PRESENTMENT_MULTIPLIERS, presentmentPrice } from "./catalogue";

/* Seeds a complete, browsable store: catalogue, imagery, reviews, shipping
   zones, discounts and a staff login. Re-runnable - it clears the tables it
   owns first. */

const REVIEWERS = [
  ["Priya N.", "London"], ["James H.", "Bristol"], ["Aisha K.", "Manchester"],
  ["Tom W.", "Edinburgh"], ["Meera S.", "Leeds"], ["Daniel O.", "Dublin"],
  ["Charlotte B.", "Bath"], ["Rohan P.", "Birmingham"], ["Elena V.", "Brighton"],
  ["Sam T.", "Cardiff"], ["Nadia R.", "Glasgow"], ["Oliver M.", "York"],
  ["Fatima A.", "Leicester"], ["Grace L.", "Norwich"], ["Arjun D.", "Reading"],
];

const REVIEW_BODIES: [number, string, string][] = [
  [5, "Exactly as described", "The weight of it is the first thing you notice - this is not thin plated stuff. Two months in and the patina is coming through beautifully."],
  [5, "Beautiful object, genuinely useful", "Bought it for the Ayurvedic side of things and stayed for how nice it is to drink from. No metallic taste at all, which I had half expected."],
  [4, "Lovely, needs a little care", "It does tarnish, but that is copper doing what copper does. The lemon and salt trick takes about a minute and it comes up like new."],
  [5, "No leaks whatsoever", "Been in the bottom of a rucksack on its side for weeks. Not a drop. That alone was worth the money."],
  [5, "The hammering is the real thing", "You can see the individual strikes when the light catches it. Photographs do not quite capture it."],
  [4, "Slightly smaller than I pictured", "My fault for not reading the dimensions properly. Still perfect for a desk, just check the measurements first."],
  [5, "Gift that landed well", "Bought as a wedding present and it was the thing they talked about. The box it arrives in is nice enough to give as-is."],
  [5, "Better than the one I paid more for", "Had a similar piece from a well-known brand at nearly double the price. This is the better made of the two."],
  [4, "Good weight, good finish", "Feels substantial without being awkward to hold. Cap threads smoothly, which is where cheaper ones usually fail."],
  [5, "Six months in", "Still going strong, daily use. It has darkened to a deep bronze which I actually prefer to the shine it arrived with."],
  [3, "Nice, but patinas fast", "No complaints about the build. Just be aware it will not stay bright unless you polish it regularly."],
  [5, "Genuinely handmade", "Small variations in the surface that make it obvious a person made this. I like that."],
];

async function main() {
  console.log("Seeding AZMIQ...");

  await db.execute(sql`
    truncate table
      ${t.variantPrices}, ${t.cartItems}, ${t.carts}, ${t.reviews},
      ${t.productImages}, ${t.productCategories}, ${t.variants},
      ${t.products}, ${t.categories}, ${t.shippingRates}, ${t.shippingZones},
      ${t.discounts}, ${t.redirects}
    restart identity cascade
  `);

  /* ---------------------------------------------------------- CATEGORIES */
  const categoryRows = await db
    .insert(t.categories)
    .values(CATEGORIES.map((c, i) => ({ ...c, position: i, heroImage: null })))
    .returning();
  const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, c]));
  console.log(`  ${categoryRows.length} categories`);

  /* ------------------------------------------------------------ PRODUCTS */
  let variantCount = 0;
  let reviewCount = 0;

  for (const [index, item] of CATALOGUE.entries()) {
    const [product] = await db
      .insert(t.products)
      .values({
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle,
        summary: item.summary,
        description: item.description,
        wellnessStory: item.wellnessStory ?? null,
        careInstructions: item.careInstructions ?? null,
        material:
          item.material ??
          (item.categories.includes("kitchen-utensils")
            ? "Sustainably sourced acacia wood"
            : "100% pure copper"),
        finish: item.finish,
        dimensions: item.dimensions,
        weightGrams: item.weightGrams,
        capacityMl: item.capacityMl ?? null,
        leakProof: item.leakProof,
        foodGrade: item.foodGrade ?? true,
        handcrafted: true,
        status: "active",
        featured: item.featured ?? false,
        position: index,
        seoTitle: item.seoTitle,
        seoDescription: item.summary,
      })
      .returning();

    await db.insert(t.productCategories).values(
      item.categories
        .map((slug) => categoryBySlug.get(slug))
        .filter(Boolean)
        .map((category) => ({ productId: product.id, categoryId: category!.id })),
    );

    await db.insert(t.productImages).values(
      item.images.map((image, position) => ({
        productId: product.id,
        position,
        kind: image.kind,
        url: image.file,
        alt: image.alt,
        width: image.width,
        height: image.height,
      })),
    );

    const variantRows = await db
      .insert(t.variants)
      .values(
        item.variants.map((v, i) => ({
          productId: product.id,
          sku: v.sku,
          title: v.title,
          capacityMl: v.capacityMl ?? null,
          priceGbp: v.priceGbp,
          compareAtGbp: v.compareAtGbp ?? null,
          inventory: v.inventory,
          allowBackorder: false,
          weightGrams: item.weightGrams,
          position: i,
        })),
      )
      .returning();
    variantCount += variantRows.length;

    // Presentment prices, rounded to whole units per currency.
    await db.insert(t.variantPrices).values(
      variantRows.flatMap((v) =>
        Object.entries(PRESENTMENT_MULTIPLIERS).map(([currency, multiplier]) => ({
          variantId: v.id,
          currency,
          amount: presentmentPrice(v.priceGbp, multiplier),
          compareAt: v.compareAtGbp ? presentmentPrice(v.compareAtGbp, multiplier) : null,
        })),
      ),
    );

    // Reviews: deterministic per product so the seed is reproducible.
    const howMany = 3 + ((index * 7) % 8);
    const reviews = Array.from({ length: howMany }, (_, i) => {
      const [rating, title, body] = REVIEW_BODIES[(index * 3 + i) % REVIEW_BODIES.length];
      const [authorName, authorLocation] = REVIEWERS[(index * 5 + i) % REVIEWERS.length];
      const daysAgo = 6 + ((index * 11 + i * 17) % 300);
      const at = new Date(Date.now() - daysAgo * 864e5);
      return {
        productId: product.id,
        authorName,
        authorLocation,
        rating,
        title,
        body,
        verifiedPurchase: i % 3 !== 2,
        status: "published",
        source: "native",
        externalId: `seed-${item.slug}-${i}`,
        publishedAt: at,
        createdAt: at,
      };
    });
    await db.insert(t.reviews).values(reviews);
    reviewCount += reviews.length;

  }
  console.log(`  ${CATALOGUE.length} products, ${variantCount} variants, ${reviewCount} reviews`);


  /* ------------------------------------------------------------ SHIPPING */
  const [uk] = await db.insert(t.shippingZones).values({
    name: "United Kingdom", countries: ["GB", "IM", "JE", "GG"], position: 0, dutiesNotice: null,
  }).returning();
  const [eu] = await db.insert(t.shippingZones).values({
    name: "Europe",
    countries: ["IE", "FR", "DE", "ES", "IT", "NL", "BE", "AT", "PT", "SE", "DK", "FI", "PL", "CH", "NO"],
    position: 1,
    dutiesNotice: "Import VAT is collected at checkout for orders under EUR 150.",
  }).returning();
  const [row] = await db.insert(t.shippingZones).values({
    name: "Rest of world",
    countries: ["*"],
    position: 2,
    dutiesNotice: "Shipped duties unpaid. Import duties and local taxes are payable on delivery.",
  }).returning();

  await db.insert(t.shippingRates).values([
    // One promise everywhere: a flat £5 and 7-11 working days, wherever it is
    // going. Stock ships from a single place, so a next-day option would have
    // been a promise we could not keep.
    { zoneId: uk.id, name: "Standard", description: "Tracked", amount: 500, freeOver: 5000, minDeliveryDays: 7, maxDeliveryDays: 11, position: 0 },
    { zoneId: eu.id, name: "Europe tracked", description: "DHL, fully tracked", amount: 500, freeOver: 12000, minDeliveryDays: 7, maxDeliveryDays: 11, position: 0 },
    { zoneId: row.id, name: "International tracked", description: "DHL Express, fully tracked", amount: 500, freeOver: null, minDeliveryDays: 7, maxDeliveryDays: 11, position: 0 },
  ]);
  console.log("  3 shipping zones, 4 rates");

  /* ----------------------------------------------------------- DISCOUNTS */
  await db.insert(t.discounts).values([
    { code: "WELCOME10", type: "percentage", value: 1000, minSubtotal: 0, active: true, oncePerCustomer: true },
    { code: "COPPER15", type: "percentage", value: 1500, minSubtotal: 6000, active: true },
    { code: "FREESHIP", type: "free_shipping", value: 0, minSubtotal: 3000, active: true },
  ]);
  console.log("  3 discount codes");

  /* --------------------------------------------------------- ADMIN USER */
  const email = (process.env.ADMIN_EMAIL ?? "owner@azmiq.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-me-before-launch";
  const existing = await db.select().from(t.adminUsers).limit(1);
  if (existing.length === 0) {
    await db.insert(t.adminUsers).values({
      email, name: "AZMIQ Owner", passwordHash: await hashPassword(password), role: "owner",
    });
    console.log(`  admin user ${email}`);
  } else {
    console.log("  admin user already exists, left alone");
  }

  console.log("\nDone. Run `npm run dev` and open http://localhost:3000");
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb().catch(() => {});
  process.exit(1);
});
