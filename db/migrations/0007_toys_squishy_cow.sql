-- New Toys section with its first product, the Bluebell squishy cow, added live
-- with 15 in stock at £2.99. Every statement can run twice without harm, and a
-- product the owner has already edited in the admin is left alone.
-- On a brand-new, empty database the product is not added here: the seed loads
-- it, and seed-if-empty only seeds a database that has no products yet.
INSERT INTO "categories" ("id","slug","title","subtitle","description","position") VALUES (gen_random_uuid()::text, 'toys', 'Toys', 'Small joys to squeeze and give', 'Fun little toys for desks, pockets and party bags. Soft to squeeze, easy to give and priced as a small treat.', 7) ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "products" ("id","slug","title","subtitle","summary","description","care_instructions","material","finish","dimensions","weight_grams","leak_proof","food_grade","handcrafted","status","featured","position","seo_title","seo_description") SELECT gen_random_uuid()::text, 'squishy-cow', 'Bluebell · Shimmering Highland Squishy Cow', 'Squeeze it. Watch it sparkle.', 'A soft, stretchy squishy cow with a see-through blue body full of glitter. Squeeze it, squish it and watch it pop back into shape.', 'Meet Bluebell, a pocket-sized Highland cow with a see-through blue body full of shimmering glitter. Give her a squeeze and she squishes softly in your hand, then pops back into shape, ready for the next one.

• Soft, stretchy and satisfying to squeeze

• See-through blue body that sparkles in the light

• Shiny horns, little ears, clear legs and a cute cream snout

• Stands on her own four legs on a desk, shelf or bedside table

• About 10 × 7 × 4.5 cm and 110g, so she fits in a hand or a pocket

Keep her on your desk for busy days, squeeze her on long calls, or give her as a birthday treat, a party bag filler or a little gift for anyone who loves cows.

Not suitable for children under 3 years: contains small parts.', 'Wipe clean with a damp cloth and let her air-dry.

Keep her away from sharp objects, pets, direct sun and heat, and never put her in a microwave or oven. Squeeze her, but do not bite, pierce or overstretch her.

If the skin ever splits, stop using her and throw her away. Not suitable for children under 3 years: contains small parts. Adult supervision recommended.', 'Soft, stretchy rubber', 'Glitter-filled, see-through blue', '10 × 7 × 4.5 cm', 110, false, false, false, 'active', false, 18, 'Squishy Cow Toy | Sparkly Blue Highland Cow Squeeze Toy', 'A soft, stretchy squishy cow with a see-through blue body full of glitter. Squeeze it, squish it and watch it pop back into shape.' WHERE EXISTS (SELECT 1 FROM "products") ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_categories" ("product_id","category_id") SELECT p."id", c."id" FROM "products" p, "categories" c WHERE p."slug" = 'squishy-cow' AND c."slug" = 'toys' ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/squishy-cow/00-azmiq-studio.jpg', 'Bluebell, the blue squishy Highland cow, side view on white with the AZMIQ logo', 'hero', 1536, 1920, 0 FROM "products" p WHERE p."slug" = 'squishy-cow' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/squishy-cow/00-azmiq-studio.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/squishy-cow/01-front.jpg', 'Front view of the blue squishy cow, showing its eyes, cream snout and shiny horns', 'gallery', 1536, 1920, 1 FROM "products" p WHERE p."slug" = 'squishy-cow' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/squishy-cow/01-front.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/squishy-cow/02-three-quarter.jpg', 'The blue squishy cow from the front left, showing its glittery, bubbly texture', 'gallery', 1536, 1920, 2 FROM "products" p WHERE p."slug" = 'squishy-cow' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/squishy-cow/02-three-quarter.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/squishy-cow/03-on-a-rock.jpg', 'The sparkly blue squishy cow standing on a mossy rock in a garden', 'lifestyle', 1536, 1920, 3 FROM "products" p WHERE p."slug" = 'squishy-cow' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/squishy-cow/03-on-a-rock.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/squishy-cow/04-features.jpg', 'Feature guide for the squishy cow: soft and squeezable, sparkly texture, cute horns and ears, and clear legs', 'gallery', 1536, 1920, 4 FROM "products" p WHERE p."slug" = 'squishy-cow' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/squishy-cow/04-features.jpg');
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","weight_grams","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-TOY-COW-BLU', 'Blue', 299, 15, false, 110, 0 FROM "products" p WHERE p."slug" = 'squishy-cow' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variant_prices" ("variant_id","currency","amount") SELECT v."id", x.currency, x.amount FROM "variants" v JOIN "products" p ON p."id" = v."product_id" CROSS JOIN (VALUES ('EUR', 400), ('USD', 400), ('CAD', 500), ('AUD', 600)) AS x(currency, amount) WHERE p."slug" = 'squishy-cow' ON CONFLICT DO NOTHING;
