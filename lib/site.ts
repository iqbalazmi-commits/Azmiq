export const SITE = {
  name: "AZMIQ",
  tagline: "drink well, live well",
  description:
    "Handcrafted 100% pure copper drinkware and home essentials. Ayurvedic water bottles, jugs and sets - luxury-grade quality without the luxury mark-up.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_GB",
  email: "hello@azmiq.com",
  country: "GB",
} as const;

export const NAV = [
  { title: "Water Bottles", href: "/collections/copper-water-bottles" },
  { title: "Jugs & Pitchers", href: "/collections/copper-jugs-pitchers" },
  { title: "Sets", href: "/collections/jug-tumbler-sets" },
  { title: "Wellness", href: "/collections/copper-wellness" },
  { title: "Kitchen", href: "/collections/acacia-wood" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { title: "All products", href: "/collections/all" },
    { title: "Water bottles", href: "/collections/copper-water-bottles" },
    { title: "Jugs & pitchers", href: "/collections/copper-jugs-pitchers" },
    { title: "Jug & tumbler sets", href: "/collections/jug-tumbler-sets" },
    { title: "Acacia wood", href: "/collections/acacia-wood" },
  ],
  help: [
    { title: "Shipping", href: "/policies/shipping" },
    { title: "Returns & refunds", href: "/policies/refunds" },
    { title: "Start a return", href: "/returns" },
    { title: "Copper care guide", href: "/copper-care" },
    { title: "Track your order", href: "/account/orders" },
  ],
  about: [
    { title: "Our story", href: "/about" },
    { title: "Ayurvedic copper", href: "/ayurveda" },
    { title: "Fair pricing", href: "/fair-pricing" },
    { title: "Contact", href: "/contact" },
  ],
  legal: [
    { title: "Privacy", href: "/policies/privacy" },
    { title: "Terms", href: "/policies/terms" },
    { title: "Cookies", href: "/policies/cookies" },
    { title: "Accessibility", href: "/accessibility" },
  ],
} as const;
