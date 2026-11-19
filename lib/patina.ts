/* Copper products with "watch it age" images in public/images/patina/
   (built by scripts/build-patina-images.ts from a real product photo). */

const PATINA = new Set([
  "azmiq-pure-copper-water-bottle-500ml",
  "pure-copper-water-bottle",
  "premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant",
]);

export type PatinaImages = { new: string; months: string; year: string };

export function patinaFor(slug: string): PatinaImages | null {
  if (!PATINA.has(slug)) return null;
  const base = `/images/patina/${slug}`;
  return { new: `${base}-new.jpg`, months: `${base}-months.jpg`, year: `${base}-year.jpg` };
}
