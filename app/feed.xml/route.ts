import { getCatalogue } from "@/lib/data";
import { SITE } from "@/lib/site";

/* ===========================================================================
   GOOGLE MERCHANT CENTER FEED

   RSS 2.0 with the g: namespace, which is what Merchant Center and therefore
   Shopping ads and free listings read. One entry per VARIANT, because that is
   what a shopper actually buys, tied together by item_group_id so Google knows
   the 1 litre and 500ml bottles are the same product rather than duplicates.

   These are handmade goods with no barcodes, so identifier_exists is no and
   the SKU stands in as the MPN. Claiming a GTIN we do not have gets items
   disapproved.
   =========================================================================== */

export const revalidate = 3600;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const money = (minor: number, currency: string) => (minor / 100).toFixed(2) + " " + currency;

export async function GET() {
  const products = await getCatalogue("GBP");
  const entries: string[] = [];

  for (const product of products) {
    const image = product.images[0];
    const extra = product.images.slice(1, 11);
    const description = (product.seoDescription || product.summary || product.description)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4900);

    for (const variant of product.variants) {
      const name = variant.title && variant.title.toLowerCase() !== "standard"
        ? product.title + " - " + variant.title
        : product.title;

      // A compare-at above the price means the price IS the sale price, and
      // Google wants the original in price with the discount in sale_price.
      const onSale = variant.price.compareAt !== null && variant.price.compareAt > variant.price.amount;
      const priceTag = onSale
        ? "      <g:price>" + money(variant.price.compareAt as number, variant.price.currency) + "</g:price>\n" +
          "      <g:sale_price>" + money(variant.price.amount, variant.price.currency) + "</g:sale_price>"
        : "      <g:price>" + money(variant.price.amount, variant.price.currency) + "</g:price>";

      entries.push(
        [
          "    <item>",
          "      <g:id>" + esc(variant.sku) + "</g:id>",
          "      <g:item_group_id>" + esc(product.slug) + "</g:item_group_id>",
          "      <g:title>" + esc(name) + "</g:title>",
          "      <g:description>" + esc(description) + "</g:description>",
          "      <g:link>" + SITE.url + "/products/" + esc(product.slug) + "</g:link>",
          image ? "      <g:image_link>" + SITE.url + esc(image.url) + "</g:image_link>" : "",
          ...extra.map((i) => "      <g:additional_image_link>" + SITE.url + esc(i.url) + "</g:additional_image_link>"),
          "      <g:availability>" + (variant.available ? "in_stock" : "out_of_stock") + "</g:availability>",
          priceTag,
          "      <g:brand>" + esc(SITE.name) + "</g:brand>",
          "      <g:condition>new</g:condition>",
          "      <g:mpn>" + esc(variant.sku) + "</g:mpn>",
          "      <g:identifier_exists>no</g:identifier_exists>",
          product.material ? "      <g:material>" + esc(product.material) + "</g:material>" : "",
          "      <g:shipping>",
          "        <g:country>GB</g:country>",
          "        <g:service>Tracked</g:service>",
          "        <g:price>5.00 GBP</g:price>",
          "      </g:shipping>",
          "    </item>",
        ].filter(Boolean).join("\n"),
      );
    }
  }

  const xml =
    [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\">",
      "  <channel>",
      "    <title>" + esc(SITE.name) + "</title>",
      "    <link>" + SITE.url + "</link>",
      "    <description>" + esc(SITE.description) + "</description>",
      entries.join("\n"),
      "  </channel>",
      "</rss>",
    ].join("\n") + "\n";

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
