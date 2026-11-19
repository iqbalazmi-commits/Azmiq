/* ===========================================================================
   3D PRODUCT MODELS  -  npm run models:build

   Builds the "View in 3D" / "See it in your room" models for the copper
   bottles, as GLB files in public/models/. Copper bottles are turned shapes,
   so each one is a profile (radius against height, in metres, measured from
   the product photos) spun round its axis. Sizes are real, which is what makes
   "see it in your room" show the bottle at its true size.

   Materials are physically based copper: fully metallic, with roughness for
   the finish (polished, brushed satin, matte lacquer). The hammered finish is
   a generated normal map of overlapping dimples, so the light breaks across it
   the way it does on a hand-hammered surface.

   Re-run after changing a profile. The output is committed, so the site build
   does not need this script or its dev dependency.
   =========================================================================== */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { Document, NodeIO, type Material, type Texture } from "@gltf-transform/core";

const OUT = join(process.cwd(), "public/models");

/* Copper in linear RGB, tuned against the product photos: the textbook
   measured value reads as pale rose gold under a studio environment, while
   the bottles themselves are a deeper, warmer orange. */
const COPPER: [number, number, number, number] = [0.78, 0.33, 0.14, 1];
const COPPER_MATTE: [number, number, number, number] = [0.62, 0.27, 0.12, 1];

type Point = [radius: number, y: number];
type Part = { points: Point[]; finish: "polished" | "satin" | "matte" | "hammered" };
type Model = { slug: string; parts: Part[] };

/* ------------------------------------------------------------- profiles */

/** Evenly sampled smooth curve between two profile points (cosine ease). */
function curve(from: Point, to: Point, steps: number): Point[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = (i + 1) / steps;
    const e = (1 - Math.cos(Math.PI * t)) / 2;
    return [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * t] as Point;
  });
}

/** Quarter-round edge, so no rim is a knife edge in the light. */
function roundCorner(cx: number, cy: number, r: number, startDeg: number, endDeg: number, steps = 6): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((startDeg + ((endDeg - startDeg) * i) / steps) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Point;
  });
}

/** The classic Ayurvedic bottle: 26cm tall, 8cm across, rounded shoulder,
    narrow neck and a screw cap. Used by the matte and hammered bottles. */
function classicBottle(bodyFinish: Part["finish"], capFinish: Part["finish"]): Part[] {
  const R = 0.04;
  const body: Point[] = [
    [0, 0],
    ...roundCorner(R - 0.004, 0.004, 0.004, -90, 0),
    [R, 0.172],
    ...curve([R, 0.172], [0.019, 0.213], 16),
  ];
  const neck: Point[] = [
    [0.019, 0.213],
    [0.019, 0.222],
    [0.0197, 0.2225], [0.0197, 0.2235], [0.019, 0.224], // thread ridge
    [0.019, 0.226],
  ];
  const cap: Point[] = [
    [0.019, 0.226],
    [0.021, 0.226],
    [0.021, 0.256],
    ...roundCorner(0.021 - 0.003, 0.257, 0.003, 0, 90),
    [0, 0.26],
  ];
  return [
    { points: body, finish: bodyFinish },
    { points: neck, finish: "polished" },
    { points: cap, finish: capFinish },
  ];
}

/** The 500ml bottle: a straight 6cm cylinder, 19cm tall, flat cap. */
function slimBottle(): Part[] {
  const R = 0.03;
  const body: Point[] = [
    [0, 0],
    ...roundCorner(R - 0.003, 0.003, 0.003, -90, 0),
    [R, 0.153],
    [R - 0.0012, 0.1545],
  ];
  // The cap starts where the body ends, so the thin groove between them is a
  // real step in the surface rather than a gap you could see into.
  const cap: Point[] = [
    [R - 0.0012, 0.1545],
    [R - 0.0012, 0.1555],
    [R, 0.157],
    [R, 0.187],
    ...roundCorner(R - 0.003, 0.187, 0.003, 0, 90),
    [0, 0.19],
  ];
  return [
    { points: body, finish: "satin" },
    { points: cap, finish: "satin" },
  ];
}

const MODELS: Model[] = [
  { slug: "azmiq-pure-copper-water-bottle-500ml", parts: slimBottle() },
  { slug: "pure-copper-water-bottle", parts: classicBottle("matte", "matte") },
  {
    slug: "premium-handcrafted-hammered-copper-water-bottle-leak-proof-rust-resistant",
    parts: classicBottle("hammered", "polished"),
  },
];

/* ------------------------------------------------------ hammered texture */

/** A tileable normal map of overlapping hammer dimples. */
async function hammeredNormalMap(size = 768, cells = 16, seed = 7): Promise<Buffer> {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  // Jittered grid of dimple centres, each with its own size and depth.
  const cell = size / cells;
  const dimples: { x: number; y: number; r: number; d: number }[] = [];
  for (let gy = 0; gy < cells; gy++) {
    for (let gx = 0; gx < cells; gx++) {
      dimples.push({
        x: (gx + 0.15 + rand() * 0.7) * cell,
        y: (gy + 0.15 + rand() * 0.7) * cell,
        r: cell * (0.58 + rand() * 0.18),
        d: 0.7 + rand() * 0.5,
      });
    }
  }

  // Height field: each pixel takes the deepest dimple covering it. Distances
  // wrap at the edges so the tile repeats without a seam.
  const height = new Float32Array(size * size);
  for (const p of dimples) {
    const reach = Math.ceil(p.r);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const dist = Math.hypot(dx, dy);
        if (dist >= p.r) continue;
        const x = (Math.round(p.x + dx) + size) % size;
        const y = (Math.round(p.y + dy) + size) % size;
        const h = -p.d * (1 - (dist / p.r) ** 2);
        const i = y * size + x;
        if (h < height[i]) height[i] = h;
      }
    }
  }

  // Normals from the height gradient, packed into RGB as glTF expects.
  const strength = 1.6;
  const px = Buffer.alloc(size * size * 3);
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = -(at(x + 1, y) - at(x - 1, y)) * strength;
      const ny = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(nx, ny, 1);
      const o = (y * size + x) * 3;
      px[o] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      px[o + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      px[o + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
    }
  }
  return sharp(px, { raw: { width: size, height: size, channels: 3 } }).png({ compressionLevel: 9 }).toBuffer();
}

/* -------------------------------------------------------------- geometry */

const SEGMENTS = 128;
/** Hammer dimples repeat this many times round the bottle. */
const TEXTURE_REPEATS_AROUND = 3;

function lathe(points: Point[], circumference: number) {
  const rings = points.length;
  const positions = new Float32Array(rings * (SEGMENTS + 1) * 3);
  const normals = new Float32Array(rings * (SEGMENTS + 1) * 3);
  const uvs = new Float32Array(rings * (SEGMENTS + 1) * 2);

  // Arc length down the profile, so the texture is not stretched on curves.
  const along: number[] = [0];
  for (let i = 1; i < rings; i++) {
    along.push(along[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  const tile = circumference / TEXTURE_REPEATS_AROUND;

  for (let i = 0; i < rings; i++) {
    const [r, y] = points[i];
    // Profile tangent, from neighbours, gives the surface normal.
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(rings - 1, i + 1)];
    const tr = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const tl = Math.hypot(tr, ty) || 1;
    const nr = ty / tl;
    const ny = -tr / tl;

    for (let j = 0; j <= SEGMENTS; j++) {
      const a = (j / SEGMENTS) * Math.PI * 2;
      const k = i * (SEGMENTS + 1) + j;
      positions.set([r * Math.cos(a), y, -r * Math.sin(a)], k * 3);
      normals.set([nr * Math.cos(a), ny, -nr * Math.sin(a)], k * 3);
      uvs.set([(j / SEGMENTS) * TEXTURE_REPEATS_AROUND, along[i] / tile], k * 2);
    }
  }

  const indices = new Uint32Array((rings - 1) * SEGMENTS * 6);
  let n = 0;
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      const a = i * (SEGMENTS + 1) + j;
      const b = a + SEGMENTS + 1;
      indices.set([a, b, a + 1, a + 1, b, b + 1], n);
      n += 6;
    }
  }
  return { positions, normals, uvs, indices };
}

/* ----------------------------------------------------------------- build */

async function build(model: Model, normalMap: Buffer) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const mesh = doc.createMesh(model.slug);
  let hammered: Texture | null = null;
  const materials = new Map<Part["finish"], Material>();

  const materialFor = (finish: Part["finish"]) => {
    const existing = materials.get(finish);
    if (existing) return existing;
    const roughness = { polished: 0.16, satin: 0.34, matte: 0.58, hammered: 0.27 }[finish];
    const m = doc
      .createMaterial(`copper-${finish}`)
      .setBaseColorFactor(finish === "matte" ? COPPER_MATTE : COPPER)
      .setMetallicFactor(1)
      .setRoughnessFactor(roughness)
      .setDoubleSided(true);
    if (finish === "hammered") {
      hammered ??= doc.createTexture("hammered-normal").setImage(normalMap).setMimeType("image/png");
      m.setNormalTexture(hammered).setNormalScale(1);
    }
    materials.set(finish, m);
    return m;
  };

  const widest = Math.max(...model.parts.flatMap((p) => p.points.map(([r]) => r)));
  for (const part of model.parts) {
    const g = lathe(part.points, 2 * Math.PI * widest);
    const prim = doc
      .createPrimitive()
      .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(g.positions).setBuffer(buffer))
      .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(g.normals).setBuffer(buffer))
      .setAttribute("TEXCOORD_0", doc.createAccessor().setType("VEC2").setArray(g.uvs).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType("SCALAR").setArray(g.indices).setBuffer(buffer))
      .setMaterial(materialFor(part.finish));
    mesh.addPrimitive(prim);
  }

  const node = doc.createNode(model.slug).setMesh(mesh);
  doc.createScene(model.slug).addChild(node);
  const glb = await new NodeIO().writeBinary(doc);
  const file = join(OUT, `${model.slug}.glb`);
  writeFileSync(file, glb);
  console.log(`  ${model.slug}.glb  ${(glb.byteLength / 1024).toFixed(0)} KB`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const normalMap = await hammeredNormalMap();
  console.log("Building 3D models:");
  for (const model of MODELS) await build(model, normalMap);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
