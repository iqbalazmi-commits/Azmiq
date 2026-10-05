# AZMIQ Shopify theme

A Shopify theme that reproduces the azmiq.com design: the announcement bar,
centred-logo header, frosted hero over rotating photography, category grid
with gold hairlines, featured carousel, dark leather editorial, value points,
the product page (gallery, options, About this piece, Specification, Why
copper, care, reviews, related) and the filterable collection pages.

Checked with Shopify Theme Check: 0 errors, 0 warnings.

## Install

1. Zip the **contents** of this folder (not the folder itself), or use the
   ready-made `azmiq-shopify-theme.zip`.
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
3. Click **Customize** to preview, then **Publish** when you're happy.

## One-time setup in Shopify admin

### Menus — Online Store → Navigation

| Menu handle   | Used for              | Links                                                                 |
|---------------|-----------------------|-----------------------------------------------------------------------|
| `main-menu`   | Header                | Home, Leather, Copperware, Jugs & Pitchers, Kitchen, Gifts            |
| `footer-shop` | Footer "Shop" column  | All products, Water bottles, Jugs & pitchers, Gift sets, Leather, Kitchen |
| `footer-help` | Footer "Help" column  | Shipping, Returns & refunds, Copper care guide, Track your order      |
| `footer-about`| Footer "About" column | Our story, Contact, Fair pricing                                      |
| `footer`      | Footer "Legal" column | Privacy, Terms, Cookies (Shopify's policy pages)                      |

### Collections

The homepage is pre-wired to these collection handles; create them (or pick
different ones in the theme editor):
`leather-jackets`, `copper-water-bottles`, `copper-jugs-pitchers`,
`kitchen-utensils`, `wellness-gift-sets`.

### Filters

Install Shopify's free **Search & Discovery** app and choose the filters
(availability, price, finish, capacity…) shown on collection pages.

### Optional product fields — Settings → Custom data → Products

Add these metafield definitions (namespace `custom`) to get the extra
product-page sections. Anything left empty is simply hidden.

| Key                  | Type                 | Shows as                               |
|----------------------|----------------------|----------------------------------------|
| `subtitle`           | Single line text     | Strapline under the title and on cards |
| `summary`            | Multi-line text      | Short summary above the price          |
| `finish`             | Single line text     | Eyebrow above the title                |
| `material`           | Single line text     | Specification row                      |
| `dimensions`         | Single line text     | Specification row                      |
| `leak_proof`         | Single line text     | Specification row                      |
| `food_grade`         | Single line text     | Specification row                      |
| `made`               | Single line text     | Specification row                      |
| `wellness_story`     | Multi-line / rich text | Dark "Why copper" band               |
| `care_instructions`  | Multi-line / rich text | "Looking after it" section           |

Collections can have `custom.subtitle` (single line text) for the strapline
under the collection title.

### Reviews and star ratings

Install a review app (e.g. Judge.me). It fills Shopify's standard rating
fields, which this theme shows as stars on cards and product pages; add the
app's review widget to the **Reviews** section in the theme editor.

### Order emails to shop@azmiq.com

Settings → Notifications → Staff order notifications → add `shop@azmiq.com`.
