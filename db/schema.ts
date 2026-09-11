import {
  pgTable, text, integer, boolean, timestamp, jsonb, uniqueIndex,
  index, primaryKey, serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ===========================================================================
   MONEY RULE
   Every monetary column is an INTEGER in the currency's minor unit (pence,
   cents). There are no floats and no decimals anywhere in this schema. A
   float total is a rounding bug waiting for a customer to find it.
   =========================================================================== */

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const created = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/* --------------------------------------------------------------- CATALOGUE */

export const categories = pgTable("categories", {
  id: id(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  heroImage: text("hero_image"),
  position: integer("position").notNull().default(0),
  createdAt: created(),
}, (t) => [uniqueIndex("categories_slug_idx").on(t.slug)]);

export const products = pgTable("products", {
  id: id(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  /** Short line used on cards and in meta descriptions. */
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  /** The Ayurvedic benefit story - its own field so it renders as editorial. */
  wellnessStory: text("wellness_story"),
  /** Copper-specific care instructions. */
  careInstructions: text("care_instructions"),
  material: text("material").notNull().default("100% pure copper"),
  finish: text("finish"),
  dimensions: text("dimensions"),
  weightGrams: integer("weight_grams"),
  /** Nullable: acacia boards have no capacity, so no per-litre price either. */
  capacityMl: integer("capacity_ml"),
  leakProof: boolean("leak_proof").notNull().default(false),
  foodGrade: boolean("food_grade").notNull().default(true),
  handcrafted: boolean("handcrafted").notNull().default(true),
  status: text("status").notNull().default("draft"), // draft | active | archived
  featured: boolean("featured").notNull().default(false),
  position: integer("position").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: created(),
  updatedAt: updated(),
}, (t) => [
  uniqueIndex("products_slug_idx").on(t.slug),
  index("products_status_idx").on(t.status),
]);

export const productCategories = pgTable("product_categories", {
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.productId, t.categoryId] })]);

export const productImages = pgTable("product_images", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  /** hero | macro | lifestyle | scale - the PDP gallery is ordered by intent,
      because "show the hammered texture" is a merchandising requirement. */
  kind: text("kind").notNull().default("hero"),
  width: integer("width").notNull().default(1200),
  height: integer("height").notNull().default(1500),
  position: integer("position").notNull().default(0),
}, (t) => [index("product_images_product_idx").on(t.productId)]);

export const variants = pgTable("variants", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  title: text("title").notNull(),            // "950ml", "Set of 4"
  capacityMl: integer("capacity_ml"),
  /** Base price in GBP pence. Other currencies live in variantPrices. */
  priceGbp: integer("price_gbp").notNull(),
  compareAtGbp: integer("compare_at_gbp"),
  inventory: integer("inventory").notNull().default(0),
  /** Allows selling a made-to-order line without faking a stock number. */
  allowBackorder: boolean("allow_backorder").notNull().default(false),
  weightGrams: integer("weight_grams"),
  position: integer("position").notNull().default(0),
  createdAt: created(),
}, (t) => [
  uniqueIndex("variants_sku_idx").on(t.sku),
  index("variants_product_idx").on(t.productId),
]);

/** Hand-set prices per currency. Deliberately NOT runtime FX: GBP 29 becomes
    EUR 35, never EUR 33.87. Rounded prices look intentional; converted ones
    look like a spreadsheet leaked onto the storefront. */
export const variantPrices = pgTable("variant_prices", {
  variantId: text("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
  currency: text("currency").notNull(),      // ISO-4217, uppercase
  amount: integer("amount").notNull(),       // minor units
  compareAt: integer("compare_at"),
}, (t) => [primaryKey({ columns: [t.variantId, t.currency] })]);

/* ------------------------------------------------------------------ PEOPLE */

export const customers = pgTable("customers", {
  id: id(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  acceptsMarketingAt: timestamp("accepts_marketing_at", { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex("customers_email_idx").on(t.email)]);

export const addresses = pgTable("addresses", {
  id: id(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  region: text("region"),
  postcode: text("postcode").notNull(),
  country: text("country").notNull(),        // ISO-3166-1 alpha-2
  phone: text("phone"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: created(),
});

/** Opaque server-side sessions. No customer state is ever trusted from a token
    the browser could tamper with. */
export const sessions = pgTable("sessions", {
  id: id(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  adminUserId: text("admin_user_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: created(),
}, (t) => [index("sessions_customer_idx").on(t.customerId)]);

/** Single-use, short-lived, hashed. The raw token only ever exists in the email. */
export const loginTokens = pgTable("login_tokens", {
  id: id(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: created(),
}, (t) => [index("login_tokens_hash_idx").on(t.tokenHash)]);

export const adminUsers = pgTable("admin_users", {
  id: id(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("staff"), // owner | staff
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex("admin_users_email_idx").on(t.email)]);

/* -------------------------------------------------------------------- CART */

export const carts = pgTable("carts", {
  id: id(),
  token: text("token").notNull(),            // cookie value, not the row id
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  currency: text("currency").notNull().default("GBP"),
  discountCode: text("discount_code"),
  createdAt: created(),
  updatedAt: updated(),
}, (t) => [uniqueIndex("carts_token_idx").on(t.token)]);

/** Quantity only. No price column, by design - the client cannot propose a
    price, so it cannot forge one. Totals are recomputed from `variants` on
    every read and again immediately before the PaymentIntent is created. */
export const cartItems = pgTable("cart_items", {
  id: id(),
  cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  variantId: text("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: created(),
}, (t) => [
  uniqueIndex("cart_items_unique").on(t.cartId, t.variantId),
  index("cart_items_cart_idx").on(t.cartId),
]);

/* ------------------------------------------------------------------ ORDERS */

export const orders = pgTable("orders", {
  id: id(),
  /** Human-facing, sequential. Never show a UUID on an invoice. */
  number: serial("number").notNull(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  // pending | paid | fulfilled | cancelled | refunded | partially_refunded
  paymentStatus: text("payment_status").notNull().default("awaiting_payment"),
  // card | bank_transfer. Bank transfers are confirmed by hand in the admin
  // once the money lands, so they never reach the Stripe webhook.
  paymentMethod: text("payment_method").notNull().default("card"),
  fulfillmentStatus: text("fulfillment_status").notNull().default("unfulfilled"),
  currency: text("currency").notNull().default("GBP"),
  subtotal: integer("subtotal").notNull(),
  discountTotal: integer("discount_total").notNull().default(0),
  shippingTotal: integer("shipping_total").notNull().default(0),
  taxTotal: integer("tax_total").notNull().default(0),
  grandTotal: integer("grand_total").notNull(),
  refundedTotal: integer("refunded_total").notNull().default(0),
  discountCode: text("discount_code"),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  shippingMethod: text("shipping_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  customerNote: text("customer_note"),
  internalNote: text("internal_note"),
  // Abandoned-basket recovery. The token is what the reminder links to; it is
  // random rather than the order id, so the id never appears in an email URL.
  // recoverySentAt doubles as the "only ever one reminder" guard.
  recoveryToken: text("recovery_token"),
  recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true }),
  placedAt: timestamp("placed_at", { withTimezone: true }),
  createdAt: created(),
  updatedAt: updated(),
}, (t) => [
  index("orders_customer_idx").on(t.customerId),
  index("orders_email_idx").on(t.email),
  uniqueIndex("orders_payment_intent_idx").on(t.stripePaymentIntentId),
  index("orders_status_idx").on(t.status),
  uniqueIndex("orders_recovery_token_idx").on(t.recoveryToken),
]);

/** Addresses that asked not to receive basket reminders. Keyed by address
    rather than by order, so opting out once covers every future basket too. */
export const emailSuppressions = pgTable("email_suppressions", {
  email: text("email").primaryKey(),              // always stored lowercase
  reason: text("reason").notNull().default("basket_reminder_unsubscribe"),
  createdAt: created(),
});

/** Line items snapshot title, sku and unit price at the moment of payment.
    Renaming a product next year must not rewrite last year's invoices. */
export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => variants.id, { onDelete: "set null" }),
  productSlug: text("product_slug").notNull(),
  productTitle: text("product_title").notNull(),
  variantTitle: text("variant_title").notNull(),
  sku: text("sku").notNull(),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull(),
  unitAmount: integer("unit_amount").notNull(),
  compareAtAmount: integer("compare_at_amount"),
  lineTotal: integer("line_total").notNull(),
}, (t) => [index("order_items_order_idx").on(t.orderId)]);

export const refunds = pgTable("refunds", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  stripeRefundId: text("stripe_refund_id"),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  createdByAdminId: text("created_by_admin_id"),
  createdAt: created(),
}, (t) => [uniqueIndex("refunds_stripe_idx").on(t.stripeRefundId)]);

export const returnRequests = pgTable("return_requests", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  rma: text("rma").notNull(),
  status: text("status").notNull().default("requested"),
  // requested | approved | rejected | received | refunded
  reason: text("reason").notNull(),
  comment: text("comment"),
  items: jsonb("items").notNull(),           // [{orderItemId, quantity}]
  resolution: text("resolution").notNull().default("refund"), // refund | exchange
  adminNote: text("admin_note"),
  createdAt: created(),
  updatedAt: updated(),
}, (t) => [uniqueIndex("return_rma_idx").on(t.rma)]);

/* --------------------------------------------------------------- DISCOUNTS */

export const discounts = pgTable("discounts", {
  id: id(),
  code: text("code").notNull(),
  type: text("type").notNull(),                 // percentage | fixed | free_shipping
  value: integer("value").notNull().default(0), // percent*100, or minor units
  minSubtotal: integer("min_subtotal").notNull().default(0),
  currency: text("currency").notNull().default("GBP"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  oncePerCustomer: boolean("once_per_customer").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: created(),
}, (t) => [uniqueIndex("discounts_code_idx").on(t.code)]);

export const discountRedemptions = pgTable("discount_redemptions", {
  id: id(),
  discountId: text("discount_id").notNull().references(() => discounts.id, { onDelete: "cascade" }),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  createdAt: created(),
});

/* ----------------------------------------------------------------- REVIEWS */

export const reviews = pgTable("reviews", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  authorLocation: text("author_location"),
  rating: integer("rating").notNull(),        // 1..5
  title: text("title"),
  body: text("body").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(false),
  status: text("status").notNull().default("pending"), // pending|published|rejected
  /** native, or the name of whichever tool a CSV was imported from, so an
      import can be audited or rolled back later. */
  source: text("source").notNull().default("native"),
  externalId: text("external_id"),
  reply: text("reply"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: created(),
}, (t) => [
  index("reviews_product_idx").on(t.productId),
  index("reviews_status_idx").on(t.status),
  uniqueIndex("reviews_source_external_idx").on(t.source, t.externalId),
]);

/* --------------------------------------------------------- SHIPPING & TAX */

export const shippingZones = pgTable("shipping_zones", {
  id: id(),
  name: text("name").notNull(),
  /** ISO alpha-2 codes; "*" is the catch-all rest-of-world zone. */
  countries: jsonb("countries").notNull().$type<string[]>(),
  /** Shown at checkout for non-UK/EU: goods ship DDU, duties on delivery. */
  dutiesNotice: text("duties_notice"),
  position: integer("position").notNull().default(0),
});

export const shippingRates = pgTable("shipping_rates", {
  id: id(),
  zoneId: text("zone_id").notNull().references(() => shippingZones.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  currency: text("currency").notNull().default("GBP"),
  amount: integer("amount").notNull(),
  freeOver: integer("free_over"),
  minDeliveryDays: integer("min_delivery_days"),
  maxDeliveryDays: integer("max_delivery_days"),
  position: integer("position").notNull().default(0),
});

/* -------------------------------------------------------- MIGRATION & OPS */

/** URL redirects, managed from the admin panel and written automatically when
    a product slug changes. `toPath` is NEVER "/" - sending a dead product URL
    to the homepage throws away the ranking that URL earned and tells the
    visitor nothing, so an unmatched path falls through to a 404 that lists
    real alternatives instead. */
export const redirects = pgTable("redirects", {
  id: id(),
  fromPath: text("from_path").notNull(),
  toPath: text("to_path"),
  statusCode: integer("status_code").notNull().default(301),
  source: text("source").notNull().default("manual"),        // manual | auto
  note: text("note"),
  hits: integer("hits").notNull().default(0),
  lastHitAt: timestamp("last_hit_at", { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex("redirects_from_idx").on(t.fromPath)]);

/** Idempotency ledger. A Stripe event id inserted here a second time violates
    the primary key, the handler catches that, and the side effects never run
    twice. Stripe retries for days; this is what makes that safe. */
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),               // Stripe event id, e.g. evt_...
  type: text("type").notNull(),
  status: text("status").notNull().default("processing"), // processing|done|failed
  attempts: integer("attempts").notNull().default(1),
  error: text("error"),
  receivedAt: created(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updated(),
});

/* --------------------------------------------------------------- RELATIONS */

export const productRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  variants: many(variants),
  categories: many(productCategories),
  reviews: many(reviews),
}));
export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
export const variantRelations = relations(variants, ({ one, many }) => ({
  product: one(products, { fields: [variants.productId], references: [products.id] }),
  prices: many(variantPrices),
}));
export const variantPriceRelations = relations(variantPrices, ({ one }) => ({
  variant: one(variants, { fields: [variantPrices.variantId], references: [variants.id] }),
}));
export const productCategoryRelations = relations(productCategories, ({ one }) => ({
  product: one(products, { fields: [productCategories.productId], references: [products.id] }),
  category: one(categories, { fields: [productCategories.categoryId], references: [categories.id] }),
}));
export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(productCategories),
}));
export const cartRelations = relations(carts, ({ many }) => ({ items: many(cartItems) }));
export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(variants, { fields: [cartItems.variantId], references: [variants.id] }),
}));
export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  refunds: many(refunds),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}));
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
export const reviewRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));
export const shippingZoneRelations = relations(shippingZones, ({ many }) => ({
  rates: many(shippingRates),
}));
export const shippingRateRelations = relations(shippingRates, ({ one }) => ({
  zone: one(shippingZones, { fields: [shippingRates.zoneId], references: [shippingZones.id] }),
}));

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
