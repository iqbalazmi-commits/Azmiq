/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root. Without this, an unrelated package-lock.json in a
  // parent directory (e.g. the user's home folder) makes Turbopack infer the
  // wrong root and resolve node_modules — including Tailwind's native oxide
  // binding — from the wrong place.
  turbopack: { root: import.meta.dirname },
  // Native/WASM packages must not be bundled by webpack.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Product photography is the LCP element on almost every page, so the
    // breakpoint list is tuned to the actual layout rather than left default.
    deviceSizes: [420, 640, 828, 1080, 1200, 1600, 2048],
    imageSizes: [96, 160, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Admin photo uploads. The browser shrinks photos to well under 1 MB
    // first; 5mb leaves room for the odd large PNG and stays under the 6 MB
    // request limit of Netlify functions.
    serverActions: { bodySizeLimit: "5mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
        ],
      },
      {
        // Generated artwork and fonts are immutable and content-addressed.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};
export default nextConfig;
