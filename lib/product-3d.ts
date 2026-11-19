/* Products that have a 3D model in public/models/ (built by
   scripts/build-3d-models.ts at real size). Listed by slug so the product
   page can offer "View in 3D" only where a model exists. */

export type Product3D = {
  src: string;
  /** Read out by screen readers and shown if the model cannot load. */
  alt: string;
};

const MODELS: Record<string, Product3D> = {
  "azmiq-pure-copper-water-bottle-500ml": {
    src: "/models/azmiq-pure-copper-water-bottle-500ml.glb",
    alt: "3D model of the 500ml pure copper bottle, 19cm tall and 6cm across",
  },
  "pure-copper-water-bottle": {
    src: "/models/pure-copper-water-bottle.glb",
    alt: "3D model of the matte copper water bottle, 26cm tall and 8cm across",
  },
  "premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant": {
    src: "/models/premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant.glb",
    alt: "3D model of the hand-hammered copper water bottle, 26cm tall and 8cm across",
  },
};

export function product3dFor(slug: string): Product3D | null {
  return MODELS[slug] ?? null;
}
