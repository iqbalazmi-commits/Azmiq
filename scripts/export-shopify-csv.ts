/* Writes shopify-theme/shopify-products.csv: the starting catalogue in
   Shopify's product import format (Products → Import in Shopify admin).

   Images are referenced by their public GitHub URL, which Shopify downloads
   during the import. Each product is tagged with its collection handles, so
   automated collections ("Product tag is equal to copper-water-bottles")
   reproduce the site's sections. Run: npx tsx scripts/export-shopify-csv.ts */

import fs from "node:fs";
import path from "node:path";
import { CATALOGUE } from "./catalogue";

const IMAGE_BASE = "https://raw.githubusercontent.com/iqbalazmi-commits/Azmiq/main/public";
const OUT = path.join(__dirname, "..", "shopify-theme", "shopify-products.csv");

// Collections each product should appear in on Shopify. The copper balls were
// added to Copperware in the admin after the catalogue was seeded.
const EXTRA_TAGS: Record<string, string[]> = {
  "azmiq-pure-copper-balls-handmade-with-cotton-pouch": ["copper-water-bottles"],
};

const HEADERS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value",
  "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
  "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price",
  "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
  "Image Src", "Image Position", "Image Alt Text", "Gift Card",
  "SEO Title", "SEO Description", "Variant Weight Unit", "Status",
];

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Paragraphs become <p>; runs of "•" lines become a <ul>. */
function toHtml(text: string): string {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(`<ul>${list.map((li) => `<li>${li}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const block of blocks) {
    if (block.startsWith("•")) {
      list.push(escapeHtml(block.replace(/^•\s*/, "")));
    } else {
      flush();
      out.push(`<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`);
    }
  }
  flush();
  return out.join("");
}

const pounds = (pence?: number) => (pence ? (pence / 100).toFixed(2) : "");
const csvCell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows: Record<string, string | number>[] = [];
for (const p of CATALOGUE) {
  const single = p.variants.length === 1 && /^(standard|default title)$/i.test(p.variants[0].title);
  const optionName = single ? "Title" : p.categories.includes("leather-jackets") ? "Size" : "Size";
  const tags = [...new Set([...p.categories, ...(EXTRA_TAGS[p.slug] ?? [])])].join(", ");
  const count = Math.max(p.variants.length, p.images.length);

  for (let i = 0; i < count; i++) {
    const v = p.variants[i];
    const img = p.images[i];
    const row: Record<string, string | number> = { Handle: p.slug };

    if (i === 0) {
      Object.assign(row, {
        Title: p.title,
        "Body (HTML)": toHtml(p.description),
        Vendor: "AZMIQ",
        Type: p.finish,
        Tags: tags,
        Published: "TRUE",
        "Option1 Name": optionName,
        "Gift Card": "FALSE",
        "SEO Title": p.seoTitle,
        "SEO Description": p.summary,
        Status: "active",
      });
    }
    if (v) {
      Object.assign(row, {
        "Option1 Value": single ? "Default Title" : v.title,
        "Variant SKU": v.sku,
        "Variant Grams": p.weightGrams ?? 0,
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": v.inventory,
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": pounds(v.priceGbp),
        "Variant Compare At Price": v.compareAtGbp && v.compareAtGbp > v.priceGbp ? pounds(v.compareAtGbp) : "",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Variant Weight Unit": "g",
      });
    }
    if (img) {
      Object.assign(row, {
        "Image Src": IMAGE_BASE + encodeURI(img.file),
        "Image Position": i + 1,
        "Image Alt Text": img.alt,
      });
    }
    rows.push(row);
  }
}

const csv = [HEADERS.join(","), ...rows.map((r) => HEADERS.map((h) => csvCell(r[h])).join(","))].join("\r\n") + "\r\n";
fs.writeFileSync(OUT, csv);
console.log(`Wrote ${CATALOGUE.length} products, ${rows.length} rows to ${path.relative(process.cwd(), OUT)}`);
