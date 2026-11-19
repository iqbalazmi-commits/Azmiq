-- Product photo refresh. Removes photos that showed other brands, made health claims,
-- showed the wrong product or were duplicates; adds new photos; sets the gallery order.
-- Every statement matches photos by their file path, so a photo the owner added or
-- removed in the admin is left alone.
DELETE FROM "product_images" WHERE "url" IN ('/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/06-ball6.png', '/images/products/azmiq-pure-copper-water-bottle-500ml/07-dual4.jpg', '/images/products/azmiq-pure-copper-water-bottle-500ml/09-gemini_generated_image_ipc8vipc8vipc8vi.png', '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/01-sooonnew1.png', '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/04-spoon_new8.png', '/images/products/ayurvedic-copper-water-set/04-jug_combo.png', '/images/products/ayurvedic-copper-water-set/05-jug_photo_2.png', '/images/products/ayurvedic-copper-water-set/09-1mqjarr4bqrxmtup3qmwkas_1_gps_generated.png', '/images/products/ayurvedic-copper-water-set/11-1mqjarr4bqrxmtup3qmwkas_3_gps_generated.png', '/images/products/ayurvedic-copper-water-set/12-copper_oxidation.png', '/images/products/ayurvedic-copper-water-set/13-gemini_generated_image_ipc8vipc8vipc8vi_adb4d432-77c0-4399-a492-b6552f565aac.png', '/images/products/pure-copper-water-bottle/06-gemini_generated_image_ipc8vipc8vipc8vi_f14a2b7a-790b-42ae-87d1-229a3fd1af53.png', '/images/products/pure-copper-water-bottle/12-copper_2.png', '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/04-gemini_generated_image_ipc8vipc8vipc8vi_adb4d432-77c0-4399-a492-b6552f565aac.png', '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/05-hammered_copper_new6.jpg', '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/14-all_bottles.jpg', '/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/03-copper_bottle_infographic.jpg');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 0 WHERE "url" = '/images/products/pure-copper-water-bottle/00-shopify_plain_copper_1.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 1 WHERE "url" = '/images/products/pure-copper-water-bottle/01-matt7.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 2 WHERE "url" = '/images/products/pure-copper-water-bottle/02-matt2.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/pure-copper-water-bottle/03-matt1.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/pure-copper-water-bottle/04-matt4.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/pure-copper-water-bottle/05-matt8.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 6 WHERE "url" = '/images/products/pure-copper-water-bottle/08-mattplain_1.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 7 WHERE "url" = '/images/products/pure-copper-water-bottle/09-1-photoroom_1.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 8 WHERE "url" = '/images/products/pure-copper-water-bottle/10-chatgpt_image_sep_27_2025_10_22_24_pm.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 9 WHERE "url" = '/images/products/pure-copper-water-bottle/11-matte-copper-water-bottle.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 10 WHERE "url" = '/images/products/pure-copper-water-bottle/13-plain_copper.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 11 WHERE "url" = '/images/products/pure-copper-water-bottle/07-copper_oxidation_79ae5e9b-795e-4c11-ae84-edef8635010f.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'pure-copper-water-bottle');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 0 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/00-hammered_copper_new7.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 1 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/01-hammered_copper_bottle.webp' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 2 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/03-hammered_copper_new2.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/06-hammered_copper_new1.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/07-newhammered.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/08-hammerred_copper2.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 6 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/09-photoroom.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 7 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/10-copperbottle.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 8 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/11-hammerred_copper1.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 9 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/12-hammerred_copper3.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 10 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/13-hammerred_copper4.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 11 WHERE "url" = '/images/products/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant/02-copper_oxidation_79ae5e9b-795e-4c11-ae84-edef8635010f.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 0 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/00-500_ml_bottle.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 1 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/01-500_ml_hand_holding.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 2 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/02-500ml_with_measurement.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/03-pomelli_photoshoot-1.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/04-pomelli_photoshoot-2.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/05-pomelli_photoshoot-3.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 6 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/06-pomelli_photoshoot-4.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 7 WHERE "url" = '/images/products/azmiq-pure-copper-water-bottle-500ml/08-copper_oxidation.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-water-bottle-500ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 0 WHERE "url" = '/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/00-premium-dual-hammered-copper-water-bottle.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 1 WHERE "url" = '/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/01-dual_tone_bottle_300x300_e2b2b7de-9c0d-4605-ba0c-568305bfda7c.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 2 WHERE "url" = '/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/02-dual_bottle_white_background.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml/04-dualtonebottle.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'premium-dual-hammered-copper-water-bottle-100-pure-copper-ayurvedic-health-benefits-leak-proof-eco-friendly-design-950ml');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 0 WHERE "url" = '/images/products/ayurvedic-copper-water-set/00-copper-jug-set_d7bc5f9a-0bf4-4637-b6c2-7b6ec5d62ab9.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 1 WHERE "url" = '/images/products/ayurvedic-copper-water-set/01-jugcombo.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 2 WHERE "url" = '/images/products/ayurvedic-copper-water-set/02-jugphoto2.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/ayurvedic-copper-water-set/03-glass.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/ayurvedic-copper-water-set/06-jug_bottle.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/ayurvedic-copper-water-set/07-jug.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 6 WHERE "url" = '/images/products/ayurvedic-copper-water-set/08-1mqjarr4bqrxmtup3qmwkas_0_gps_generated.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 7 WHERE "url" = '/images/products/ayurvedic-copper-water-set/10-1mqjarr4bqrxmtup3qmwkas_2_gps_generated.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'ayurvedic-copper-water-set');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 0 WHERE "url" = '/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/00-ball_1.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-balls-handmade-with-cotton-pouch');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 1 WHERE "url" = '/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/01-ball2.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-balls-handmade-with-cotton-pouch');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 2 WHERE "url" = '/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/02-ball3.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-balls-handmade-with-cotton-pouch');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/03-ball4.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-balls-handmade-with-cotton-pouch');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/04-ball5.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-balls-handmade-with-cotton-pouch');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/azmiq-pure-copper-balls-handmade-with-cotton-pouch/05-ball7.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-pure-copper-balls-handmade-with-cotton-pouch');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/11-sooonnew3.jpg', 'Acacia wood kitchen utensil set standing in its matching holder on a kitchen worktop', 'hero', 848, 568, 0 FROM "products" p WHERE p."slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/11-sooonnew3.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/12-sooonnew7.jpg', 'The acacia utensils in their holder beside a chopping board and herbs', 'lifestyle', 499, 459, 1 FROM "products" p WHERE p."slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/12-sooonnew7.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/13-spoongreen.jpg', 'Acacia spoons and spatulas in their wooden holder, photographed in a garden', 'lifestyle', 1200, 1600, 2 FROM "products" p WHERE p."slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/13-spoongreen.jpg');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/00-sooonnew5.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/02-sooonnew4.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/03-sooonnew6.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 6 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/05-spoon105.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 7 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/06-spoon107.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 8 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/07-spoon108.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 9 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/08-spoon109.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 10 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/09-spoon102.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 11 WHERE "url" = '/images/products/azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder/10-measurements_2.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'azmiq-acacia-wood-kitchen-utensil-set-10-piece-with-holder');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/mens-leather-jacket/04-studio.jpg', 'Men''s black leather café-racer jacket with a stand collar and silver zips, studio view', 'hero', 1024, 1536, 0 FROM "products" p WHERE p."slug" = 'mens-leather-jacket' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/mens-leather-jacket/04-studio.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/mens-leather-jacket/05-street.jpg', 'The black leather jacket worn open over a grey tee on a cobbled street', 'lifestyle', 1024, 1024, 1 FROM "products" p WHERE p."slug" = 'mens-leather-jacket' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/mens-leather-jacket/05-street.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/mens-leather-jacket/06-back.jpg', 'Back view of the black leather jacket, showing the shoulder seams and hem', 'lifestyle', 1024, 1024, 2 FROM "products" p WHERE p."slug" = 'mens-leather-jacket' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/mens-leather-jacket/06-back.jpg');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 3 WHERE "url" = '/images/products/mens-leather-jacket/00-hero.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'mens-leather-jacket');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 4 WHERE "url" = '/images/products/mens-leather-jacket/01-flat.jpg' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'mens-leather-jacket');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 5 WHERE "url" = '/images/products/mens-leather-jacket/02-brand.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'mens-leather-jacket');
--> statement-breakpoint
UPDATE "product_images" SET "position" = 6 WHERE "url" = '/images/products/mens-leather-jacket/03-why.png' AND "product_id" = (SELECT "id" FROM "products" WHERE "slug" = 'mens-leather-jacket');
--> statement-breakpoint
-- New Shoes section with two Kolhapuri chappal listings. They are added as drafts
-- (hidden, no stock) so prices and stock can be set in the admin before they go live.
-- On a brand-new, empty database nothing is added here: the seed loads them, and
-- seed-if-empty only seeds a database that has no products yet.
INSERT INTO "categories" ("id","slug","title","subtitle","description","position") VALUES (gen_random_uuid()::text, 'shoes', 'Shoes', 'Kolhapuri chappals, handmade', 'Kolhapuri chappals for men and women: open-toe leather sandals cut, stitched and braided by hand in the tradition of Kolhapur, India. Comfortable on a hot day, smart enough for a wedding.', 6) ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "products" ("id","slug","title","subtitle","summary","description","care_instructions","material","finish","leak_proof","food_grade","handcrafted","status","featured","position","seo_title","seo_description") SELECT gen_random_uuid()::text, 'kolhapuri-chappal', 'Sahyadri · Men''s Handcrafted Kolhapuri Chappal', 'Made by hand. Worn with pride.', 'A classic men''s Kolhapuri in leather, hand-stitched with a braided toe ring. In natural, tan and brown.', 'The Kolhapuri is India''s most famous sandal: a flat leather sole, a wide hand-punched upper strap and a braided toe ring, made by families of artisans who have shaped it for generations.


• Leather upper and sole, stitched by hand

• Hand-punched and braided detailing on the strap

• Braided toe loop for a secure, barefoot feel

• Natural, tan or brown

• Wear with linen trousers, jeans or a kurta

Every pair is made by hand, so the colour, punching and stitching vary a little from one to the next. The leather softens and shapes to your foot as you wear it.', 'Wipe with a soft, dry cloth after wearing. Kolhapuri leather is a natural material: it softens and moulds to your foot with wear, and darkens a little with age.

Keep them out of heavy rain. If they get wet, stuff them with paper and let them dry naturally, away from a radiator or direct sun. Every couple of months, rub in a little leather conditioner or a drop of coconut oil with a soft cloth.

The first few wears can feel firm while the leather breaks in; that is normal.', 'Leather', 'Hand-stitched leather', false, false, true, 'draft', false, 16, 'Kolhapuri Chappal for Men | Handmade Leather Sandals', 'A classic men''s Kolhapuri in leather, hand-stitched with a braided toe ring. In natural, tan and brown.' WHERE EXISTS (SELECT 1 FROM "products") ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_categories" ("product_id","category_id") SELECT p."id", c."id" FROM "products" p, "categories" c WHERE p."slug" = 'kolhapuri-chappal' AND c."slug" = 'shoes' ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/kolhapuri-chappal/00-tan-studio.jpg', 'A pair of tan Kolhapuri chappals with gold-thread detailing, from above', 'hero', 853, 1280, 0 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/kolhapuri-chappal/00-tan-studio.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/kolhapuri-chappal/01-natural-worn.jpg', 'Natural Kolhapuri chappals worn with linen trousers', 'lifestyle', 378, 687, 1 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/kolhapuri-chappal/01-natural-worn.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/kolhapuri-chappal/02-brown-top-and-sole.jpg', 'Brown Kolhapuri chappal from above beside its leather sole', 'gallery', 1216, 1567, 2 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/kolhapuri-chappal/02-brown-top-and-sole.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/kolhapuri-chappal/03-brown-single.jpg', 'A single brown Kolhapuri chappal showing the braided strap and toe ring', 'gallery', 899, 1599, 3 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/kolhapuri-chappal/03-brown-single.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/kolhapuri-chappal/04-natural-heritage.jpg', 'Natural leather Kolhapuri chappals on a stone ledge', 'gallery', 668, 687, 4 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/kolhapuri-chappal/04-natural-heritage.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/kolhapuri-chappal/05-craftsmanship.jpg', 'The stitched leather sole and an artisan hand-making a Kolhapuri', 'gallery', 489, 546, 5 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/kolhapuri-chappal/05-craftsmanship.jpg');
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-NAT-6', 'Natural · UK 6', 4500, 0, false, 0 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-NAT-7', 'Natural · UK 7', 4500, 0, false, 1 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-NAT-8', 'Natural · UK 8', 4500, 0, false, 2 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-NAT-9', 'Natural · UK 9', 4500, 0, false, 3 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-NAT-10', 'Natural · UK 10', 4500, 0, false, 4 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-NAT-11', 'Natural · UK 11', 4500, 0, false, 5 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-TAN-6', 'Tan · UK 6', 4500, 0, false, 6 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-TAN-7', 'Tan · UK 7', 4500, 0, false, 7 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-TAN-8', 'Tan · UK 8', 4500, 0, false, 8 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-TAN-9', 'Tan · UK 9', 4500, 0, false, 9 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-TAN-10', 'Tan · UK 10', 4500, 0, false, 10 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-TAN-11', 'Tan · UK 11', 4500, 0, false, 11 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-BRO-6', 'Brown · UK 6', 4500, 0, false, 12 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-BRO-7', 'Brown · UK 7', 4500, 0, false, 13 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-BRO-8', 'Brown · UK 8', 4500, 0, false, 14 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-BRO-9', 'Brown · UK 9', 4500, 0, false, 15 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-BRO-10', 'Brown · UK 10', 4500, 0, false, 16 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLM-BRO-11', 'Brown · UK 11', 4500, 0, false, 17 FROM "products" p WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variant_prices" ("variant_id","currency","amount") SELECT v."id", x.currency, x.amount FROM "variants" v JOIN "products" p ON p."id" = v."product_id" CROSS JOIN (VALUES ('EUR', 5300), ('USD', 5800), ('CAD', 7800), ('AUD', 8700)) AS x(currency, amount) WHERE p."slug" = 'kolhapuri-chappal' ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "products" ("id","slug","title","subtitle","summary","description","care_instructions","material","finish","leak_proof","food_grade","handcrafted","status","featured","position","seo_title","seo_description") SELECT gen_random_uuid()::text, 'ladies-kolhapuri-chappal', 'Sahyadri Belle · Women''s Handcrafted Kolhapuri Chappal', 'Light on the foot. Rich in heritage.', 'A slim women''s Kolhapuri in tan leather, hand-stitched with a braided toe ring and a medallion strap.', 'A lighter, slimmer take on the Kolhapuri: a narrow leather strap with a hand-tooled medallion, a braided toe ring and a flat leather sole, made by hand in the Kolhapur tradition.


• Leather upper and sole, stitched by hand

• Slim strap with a hand-tooled medallion

• Braided toe loop

• Pairs with a summer dress, jeans or a salwar suit

Every pair is made by hand, so small variations in colour and stitching are part of its character. The leather softens with wear.', 'Wipe with a soft, dry cloth after wearing. Kolhapuri leather is a natural material: it softens and moulds to your foot with wear, and darkens a little with age.

Keep them out of heavy rain. If they get wet, stuff them with paper and let them dry naturally, away from a radiator or direct sun. Every couple of months, rub in a little leather conditioner or a drop of coconut oil with a soft cloth.

The first few wears can feel firm while the leather breaks in; that is normal.', 'Leather', 'Hand-stitched leather', false, false, true, 'draft', false, 17, 'Kolhapuri Chappal for Women | Handmade Leather Sandals', 'A slim women''s Kolhapuri in tan leather, hand-stitched with a braided toe ring and a medallion strap.' WHERE EXISTS (SELECT 1 FROM "products") ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_categories" ("product_id","category_id") SELECT p."id", c."id" FROM "products" p, "categories" c WHERE p."slug" = 'ladies-kolhapuri-chappal' AND c."slug" = 'shoes' ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/ladies-kolhapuri-chappal/00-tan-steps.jpg', 'Women''s tan Kolhapuri chappals worn with jeans on stone steps', 'hero', 559, 678, 0 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/ladies-kolhapuri-chappal/00-tan-steps.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/ladies-kolhapuri-chappal/01-tan-seated.jpg', 'Tan Kolhapuri chappals worn with an embroidered dress', 'lifestyle', 561, 728, 1 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/ladies-kolhapuri-chappal/01-tan-seated.jpg');
--> statement-breakpoint
INSERT INTO "product_images" ("id","product_id","url","alt","kind","width","height","position") SELECT gen_random_uuid()::text, p."id", '/images/products/ladies-kolhapuri-chappal/02-tan-close.jpg', 'Close view of the tan Kolhapuri''s medallion strap and braided toe ring', 'lifestyle', 559, 662, 2 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' AND NOT EXISTS (SELECT 1 FROM "product_images" x WHERE x."product_id" = p."id" AND x."url" = '/images/products/ladies-kolhapuri-chappal/02-tan-close.jpg');
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLW-TAN-3', 'UK 3', 3900, 0, false, 0 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLW-TAN-4', 'UK 4', 3900, 0, false, 1 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLW-TAN-5', 'UK 5', 3900, 0, false, 2 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLW-TAN-6', 'UK 6', 3900, 0, false, 3 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLW-TAN-7', 'UK 7', 3900, 0, false, 4 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variants" ("id","product_id","sku","title","price_gbp","inventory","allow_backorder","position") SELECT gen_random_uuid()::text, p."id", 'AZMIQ-KOLW-TAN-8', 'UK 8', 3900, 0, false, 5 FROM "products" p WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT ("sku") DO NOTHING;
--> statement-breakpoint
INSERT INTO "variant_prices" ("variant_id","currency","amount") SELECT v."id", x.currency, x.amount FROM "variants" v JOIN "products" p ON p."id" = v."product_id" CROSS JOIN (VALUES ('EUR', 4600), ('USD', 5000), ('CAD', 6800), ('AUD', 7600)) AS x(currency, amount) WHERE p."slug" = 'ladies-kolhapuri-chappal' ON CONFLICT DO NOTHING;
