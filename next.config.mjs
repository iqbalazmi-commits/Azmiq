/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
