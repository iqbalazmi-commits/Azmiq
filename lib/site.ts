export const SITE = {
  name: "AZMIQ",
  tagline: "drink well, live well",
  description:
    "Handcrafted 100% pure copper drinkware and genuine leather jackets. Ayurvedic water bottles, jugs and sets, and a clean café-racer cut - luxury-grade quality without the luxury mark-up.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_GB",
  email: "shop@azmiq.com",
  /** E.164 for tel: links and structured data. */
  phone: "+447741856782",
  phoneDisplay: "+44 7741 856782",
  country: "GB",
  social: {
    instagram: "https://www.instagram.com/azmiquk",
    facebook: "https://www.facebook.com/azmiquk",
  },
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: SITE.social.instagram },
  { label: "Facebook", href: SITE.social.facebook },
] as const;

export const NAV = [
  { title: "Home", href: "/" },
  { title: "Leather", href: "/collections/leather-jackets" },
  { title: "Copperware", href: "/collections/copper-water-bottles" },
  { title: "Kitchen", href: "/collections/kitchen-utensils" },
  { title: "Gifts", href: "/collections/wellness-gift-sets" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { title: "All products", href: "/collections/all" },
    { title: "Water bottles", href: "/collections/copper-water-bottles" },
    { title: "Jugs & pitchers", href: "/collections/copper-jugs-pitchers" },
    { title: "Wellness gift sets", href: "/collections/wellness-gift-sets" },
    { title: "Leather jackets", href: "/collections/leather-jackets" },
    { title: "Copper accessories", href: "/collections/copper-accessories" },
    { title: "Kitchen utensils", href: "/collections/kitchen-utensils" },
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
