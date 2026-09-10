/* ===========================================================================
   EDITORIAL AND POLICY COPY

   Written to be read, not to be survived. UK-specific where the law is
   UK-specific: the Consumer Contracts Regulations 2013 for cancellation, the
   Consumer Rights Act 2015 for faults, UK GDPR and PECR for data and cookies.

   IMPORTANT: this is complete, accurate scaffolding, not legal advice. The
   bracketed placeholders are the details only AZMIQ can supply - company
   number, registered address, VAT number, ICO registration - and a solicitor
   should read the terms and privacy pages before launch.
   =========================================================================== */

export type ContentSection = { heading?: string; body: string[]; list?: string[] };

export type ContentPage = {
  title: string;
  subtitle?: string;
  description: string;
  updated?: string;
  sections: ContentSection[];
};

export const LAST_UPDATED = "8 September 2026";

export const POLICY_SLUGS = ["privacy", "terms", "refunds", "shipping", "cookies"] as const;
export type PolicySlug = (typeof POLICY_SLUGS)[number];

export const CONTENT: Record<string, ContentPage> = {
  /* ------------------------------------------------------------- POLICIES */

  privacy: {
    title: "Privacy policy",
    description: "What data AZMIQ collects, why, and how to get it back or removed.",
    updated: LAST_UPDATED,
    sections: [
      {
        body: [
          "AZMIQ [registered company number] of [registered address] is the data controller for personal data collected through this website. We are registered with the Information Commissioner's Office under [ICO registration number].",
          "We collect as little as we can get away with, and we never sell it.",
        ],
      },
      {
        heading: "What we collect and why",
        body: ["We hold personal data in four situations, each with its own lawful basis under the UK GDPR."],
        list: [
          "When you place an order: your name, email, delivery address, phone number if you give one, and what you bought. Lawful basis: performance of a contract. We cannot ship an order without it.",
          "When you pay: nothing. Card details go directly to Stripe and never reach our servers. We store only Stripe's reference for the payment, so we can issue a refund.",
          "When you subscribe to emails: your email address, and which emails you opened. Lawful basis: consent, which you can withdraw in one click from any email.",
          "When you browse with analytics accepted: pages viewed and products looked at, through Google Analytics. Lawful basis: consent. Decline the cookie banner and none of it is collected.",
        ],
      },
      {
        heading: "Who we share it with",
        body: ["Only the companies that make the shop work, and only the part each one needs."],
        list: [
          "Stripe (payments) - your name, email, address and order total. Stripe is the payment controller in its own right.",
          "Our delivery partners - your name, address and phone number, so a parcel can reach you.",
          "Klaviyo (marketing email) - your email address and order history, only if you subscribed.",
          "Google Analytics - anonymised usage data, only if you accepted analytics cookies.",
          "We do not sell personal data. We do not share it with advertisers or data brokers.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Order records are kept for seven years, because HMRC requires it for tax purposes. Marketing subscriptions are kept until you unsubscribe. Analytics data is retained for 14 months. Abandoned baskets are deleted after 30 days.",
        ],
      },
      {
        heading: "International transfers",
        body: [
          "Stripe, Klaviyo and Google may process data outside the UK. Each transfer relies on the UK International Data Transfer Addendum or an adequacy decision. You can ask us for a copy of the safeguards in place.",
        ],
      },
      {
        heading: "Your rights",
        body: ["Under the UK GDPR you can ask us to:"],
        list: [
          "give you a copy of everything we hold about you",
          "correct anything that is wrong",
          "delete it, where we are not legally required to keep it",
          "stop using it for marketing, at any time, with no reason given",
          "hand it to another company in a portable format",
        ],
      },
      {
        heading: "How to ask",
        body: [
          "Email shop@azmiq.com. We will respond within one month. If you are not satisfied you can complain to the Information Commissioner's Office at ico.org.uk or on 0303 123 1113.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms of sale",
    description: "The terms on which AZMIQ sells to you.",
    updated: LAST_UPDATED,
    sections: [
      {
        body: [
          "These terms apply to everything bought from azmiq.com. Please read them before ordering. Nothing here affects your statutory rights as a consumer.",
        ],
      },
      {
        heading: "Who we are",
        body: [
          "AZMIQ is a trading name of [company name], registered in England and Wales, company number [number], registered office [address], VAT number [GB number].",
        ],
      },
      {
        heading: "The contract",
        body: [
          "Placing an order is an offer to buy. A contract is formed only when we email you to confirm the order has been dispatched. If we cannot fulfil an order - a piece has sold out, or a price was displayed incorrectly - we will tell you and refund you in full.",
        ],
      },
      {
        heading: "Prices",
        body: [
          "All prices include UK VAT at 20% where applicable. For deliveries outside the UK and EU, UK VAT is removed at checkout and import duties may be payable to the carrier on delivery. Prices in currencies other than pounds sterling are set by us, not converted at a live rate, and may differ slightly from the exchange rate on any given day.",
          "We reserve the right to correct pricing errors. If an obvious error is spotted after you order, we will contact you before dispatch and you may cancel for a full refund.",
        ],
      },
      {
        heading: "Handmade variation",
        body: [
          "Every piece is made by hand. Small differences in hammering, tone and finish are inherent to the process and are not defects. Copper darkens with use; that patina is normal and reversible.",
        ],
      },
      {
        heading: "Your right to cancel",
        body: [
          "Under the Consumer Contracts Regulations 2013 you may cancel within 14 days of receiving your order, for any reason, and get a full refund including standard delivery. Our own returns window is longer - 30 days - and is set out in the refund policy.",
        ],
      },
      {
        heading: "If something is wrong",
        body: [
          "Under the Consumer Rights Act 2015 goods must be as described, fit for purpose and of satisfactory quality. If they are not, you are entitled to a repair, replacement or refund. Tell us and we will sort it - we do not make people fight for this.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "We do not limit our liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot be limited under English law. Otherwise our liability is limited to the price of the goods.",
          "Our products are drinking vessels and kitchenware. Nothing on this site is medical advice, and copper is not a treatment for any condition.",
        ],
      },
      {
        heading: "Law",
        body: [
          "These terms are governed by English law, and disputes may be brought in the courts of England and Wales. If you live in Scotland or Northern Ireland you may also bring proceedings in your own courts.",
        ],
      },
    ],
  },

  refunds: {
    title: "Returns and refunds",
    subtitle: "Thirty days, free, no interrogation",
    description: "How to return an AZMIQ order and when you will get your money back.",
    updated: LAST_UPDATED,
    sections: [
      {
        body: [
          "If a piece is not right, send it back within 30 days of delivery and we will refund it. Return postage is on us within the UK. We do not require the original packaging, and we do not ask you to justify the decision.",
        ],
      },
      {
        heading: "How to return something",
        body: [
          "Start a return with your order number and email address - no account needed. We will email a prepaid label within one working day. Pack the item so it will survive the journey, attach the label, and drop it at any Post Office or collection point.",
        ],
      },
      {
        heading: "When you get your money",
        body: [
          "We refund within 5 working days of the parcel arriving with us, to the original payment method. Your bank may take a further few days to show it. You will get an email the moment we process it.",
          "If you cancel under the Consumer Contracts Regulations within 14 days, we refund the original standard delivery charge too. Beyond that, we refund the goods.",
        ],
      },
      {
        heading: "What we cannot take back",
        body: [
          "Items that have been engraved or personalised, and items returned in a condition we could not sell on - genuinely damaged through use rather than simply used and considered.",
          "Tarnish is not damage. Copper is meant to darken, and a tarnished piece is still fully returnable.",
        ],
      },
      {
        heading: "Faulty or damaged",
        body: [
          "Tell us within a reasonable time and we will replace it, no return required in most cases. Under the Consumer Rights Act 2015 you have 30 days to reject faulty goods for a full refund, and up to six years to claim for a fault that was present when you bought it.",
        ],
      },
      {
        heading: "Outside the UK",
        body: [
          "International returns are accepted on the same 30-day terms, but return postage is at your cost unless the item is faulty. We refund any import VAT we collected; duties paid to your local customs authority must be reclaimed from them.",
        ],
      },
    ],
  },

  shipping: {
    title: "Delivery",
    description: "Where AZMIQ ships, what it costs, and how long it takes.",
    updated: LAST_UPDATED,
    sections: [
      {
        body: [
          "Everything is sent tracked, and everything is packed plastic-free. Allow 7 to 11 working days from order to doorstep, wherever you are.",
        ],
      },
      {
        heading: "United Kingdom",
        list: [
          "Tracked - £3.95, 7 to 11 working days. Free on orders over £50.",
        ],
        body: [],
      },
      {
        heading: "Europe",
        list: [
          "Tracked with DHL - £9.95, 7 to 11 working days. Free on orders over £120.",
          "For orders under €150 we collect import VAT at checkout under IOSS, so there is nothing to pay on delivery.",
          "For orders over €150 the carrier collects import VAT and any customs charge before delivery.",
        ],
        body: [],
      },
      {
        heading: "Rest of world",
        list: [
          "DHL Express, fully tracked - £18.95, 7 to 11 working days.",
          "Shipped duties unpaid. UK VAT is removed at checkout, and import duties and local taxes are payable to the carrier on delivery.",
        ],
        body: [],
      },
      {
        heading: "Packaging",
        body: [
          "Recycled and recyclable card, paper tape, and moulded paper pulp instead of foam. No plastic, no polystyrene, and no branded filler that goes straight in the bin.",
        ],
      },
      {
        heading: "If it does not arrive",
        body: [
          "Tracking sometimes stalls before it updates. If a parcel has not moved for seven working days, email us and we will chase it or send a replacement.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookies",
    description: "Which cookies AZMIQ sets, what each one does, and how to change your mind.",
    updated: LAST_UPDATED,
    sections: [
      {
        body: [
          "Nothing optional is loaded until you agree to it. Analytics and marketing scripts are not merely disabled by default - they are not added to the page at all until you accept them, so no request is made and no identifier is set.",
        ],
      },
      {
        heading: "Essential cookies",
        body: ["These make the shop work and cannot be turned off. They set no advertising identifier."],
        list: [
          "azmiq_cart - remembers your basket between visits. 30 days.",
          "azmiq_session - keeps you signed in. 30 days, only if you sign in.",
          "azmiq_consent - remembers this choice, so we stop asking. 6 months.",
          "azmiq_currency and azmiq_country - remember which currency and destination you chose. 6 months.",
          "Stripe sets its own cookies during payment to detect fraud. Payment cannot work without them.",
        ],
      },
      {
        heading: "Analytics cookies (optional)",
        body: [
          "Google Analytics, so we know which pages help and which confuse. IP addresses are anonymised. Nothing is loaded unless you accept.",
        ],
      },
      {
        heading: "Marketing cookies (optional)",
        body: [
          "Klaviyo, to measure email campaigns and tailor what we send. Nothing is loaded unless you accept.",
        ],
      },
      {
        heading: "Changing your mind",
        body: [
          "Clear this site's cookies in your browser and the banner will appear again on your next visit. Rejecting optional cookies never limits what you can buy or how the site behaves.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ EDITORIAL */

  about: {
    title: "Our story",
    subtitle: "Traditional artistry, contemporary design",
    description:
      "Why AZMIQ makes copper drinkware, who makes it, and what luxury-grade quality without the mark-up actually means.",
    sections: [
      {
        body: [
          "AZMIQ started with a simple irritation: the copper bottles worth owning cost ninety pounds, and the ones that cost thirty were plated steel with a copper-coloured lacquer.",
          "There was no good reason for that gap. The metal is not expensive. The skill is real but not rare. The gap was distribution - a workshop sells to an exporter, who sells to a distributor, who sells to a retailer, and by the time it reaches a shelf the price has quadrupled without anyone adding anything to the object.",
        ],
      },
      {
        heading: "So we removed the middle",
        body: [
          "We buy directly from the workshops that raise and hammer the metal, and we sell directly to you. That is the entire trick. It is why a hand-hammered, seamless, unlined pure copper bottle is £34 here.",
        ],
      },
      {
        heading: "Who makes it",
        body: [
          "Our pieces are made by artisan families who have worked copper for generations, using the same raising and planishing techniques their grandparents used. A bottle takes between two and three thousand hammer strikes. An etched piece takes the better part of a day.",
          "We pay per piece, not per hour, at rates agreed with the workshops rather than driven down by tender. We would rather have a smaller margin and a workshop that is still there in ten years.",
        ],
      },
      {
        heading: "What we will not do",
        body: [
          "We will not line the inside with lacquer to stop it tarnishing, because that defeats the entire point of drinking from copper. We will not sell plated steel and call it copper. We will not invent a struck-through price that the product was never actually sold at.",
        ],
      },
    ],
  },

  ayurveda: {
    title: "Ayurvedic copper",
    subtitle: "Tamra jal, and what it does and does not mean",
    description:
      "The Ayurvedic practice of storing water in copper, what the tradition holds, and what the evidence actually supports.",
    sections: [
      {
        body: [
          "In Ayurveda, water stored in a copper vessel is called tamra jal. The practice is straightforward: fill the vessel in the evening, cover it, leave it at room temperature for six to eight hours, and drink it in the morning.",
        ],
      },
      {
        heading: "What the tradition holds",
        body: [
          "Ayurvedic practitioners hold that tamra jal helps balance the three doshas - vata, pitta and kapha - supports digestion and metabolism, and aids the body's natural processes of clearing what it does not need. The practice is thousands of years old and is described in the classical texts.",
        ],
      },
      {
        heading: "What the evidence supports",
        body: [
          "Copper is an essential trace mineral. The body needs it for iron metabolism, connective tissue and nerve function, and a small amount does leach into water stored in a copper vessel.",
          "Copper surfaces are also oligodynamic - naturally antimicrobial - which is well established and is why copper is used on hospital touch surfaces. Several published studies have found reduced bacterial counts in water stored in copper vessels.",
        ],
      },
      {
        heading: "What we will not claim",
        body: [
          "Copper is not a treatment for any medical condition, and we will not suggest otherwise. Do not use copper vessels for acidic drinks such as citrus juice or vinegar, which can leach copper faster than is helpful. If you have Wilson's disease or any condition affecting copper metabolism, do not use copper drinkware without speaking to your doctor.",
          "What we can honestly say is this: the vessel is made properly, from 100% pure copper with no lining and no lacquer, so if you want to keep the practice, it works the way it is supposed to.",
        ],
      },
      {
        heading: "How to do it",
        list: [
          "Fill the vessel in the evening with plain drinking water.",
          "Cover it and leave it at room temperature - not in the fridge.",
          "Six to eight hours is the traditional window.",
          "Drink it in the morning, ideally before anything else.",
          "Rinse the vessel and let it dry with the cap off.",
        ],
        body: [],
      },
    ],
  },

  "fair-pricing": {
    title: "Fair pricing",
    subtitle: "What you are paying for, itemised",
    description:
      "AZMIQ prices explained - what the metal costs, what the craft costs, and why there is no luxury mark-up.",
    sections: [
      {
        body: [
          "Most brands treat their pricing as commercially sensitive. We think it is the most persuasive thing we have, so here is roughly where £34 goes on our hammered 950ml bottle.",
        ],
      },
      {
        heading: "Roughly where it goes",
        list: [
          "The metal - around £6. Copper is a commodity; the price moves, and ours moves with it.",
          "The making - around £9. Paid per piece to the workshop, not per hour at a squeezed rate.",
          "Shipping it to the UK, duty and handling - around £3.",
          "Packaging, plastic-free - around £2.",
          "Payment processing, hosting and the boring parts of running a shop - around £3.",
          "VAT to HMRC - around £5.67.",
          "What is left, before we have paid ourselves anything - around £5.",
        ],
        body: [],
      },
      {
        heading: "Why the compare-at prices are real",
        body: [
          "Where we show a previous price, it is a price the product was genuinely offered at, for a meaningful period, on this site. UK price-marking rules require that, and we would want to anyway - a permanently struck-through price that was never charged is just a lie with a line through it.",
        ],
      },
      {
        heading: "What we are not paying for",
        body: [
          "No distributor margin. No department-store cut. No licensing fee to put a designer's name on it. No influencer paid in product to call it life-changing.",
          "The same object, sold through that chain, would sit somewhere near £90. It would not be a better bottle.",
        ],
      },
    ],
  },

  "copper-care": {
    title: "Copper care",
    subtitle: "It will darken. That is the point.",
    description:
      "How to clean, polish and care for pure copper drinkware, and why tarnish is not a fault.",
    sections: [
      {
        body: [
          "Copper is a living metal. It reacts with air and with what it touches, and it darkens over time into a deep bronze. That patina is the clearest evidence that a piece is solid copper rather than plated steel with a lacquer over the top.",
          "You can leave it. You can polish it back. Both are correct.",
        ],
      },
      {
        heading: "Everyday washing",
        list: [
          "Hand wash only, warm water, a little mild soap, a soft cloth or sponge.",
          "Never a dishwasher. The detergent will strip and stain the surface permanently.",
          "Never a scourer, wire wool, bleach or oven cleaner.",
          "Dry it fully. Water left standing is what causes uneven spotting.",
          "Store it with the cap off so air can move through.",
        ],
        body: [],
      },
      {
        heading: "Bringing the shine back",
        body: [
          "The traditional method takes about a minute. Cut a lemon in half, dip the cut face in table salt, and work it over the surface in small circles. The acid lifts the oxide, the salt gives it grip. Rinse thoroughly with warm water and dry immediately with a soft cloth.",
          "For heavier tarnish, make a paste of equal parts plain flour, salt and white vinegar. Spread it on, leave it for 20 to 30 minutes, then rinse and dry. Repeat rather than scrub harder.",
        ],
      },
      {
        heading: "What not to put in it",
        list: [
          "Citrus juice, vinegar, or anything strongly acidic - it leaches copper faster than is useful.",
          "Milk or anything that spoils, if it is going to stand for hours.",
          "Boiling liquid in a bottle with a sealed cap. Heat plus a sealed vessel is a bad idea in any material.",
        ],
        body: [],
      },
      {
        heading: "Green marks",
        body: [
          "A green tinge is verdigris - copper carbonate - and it forms where moisture sits for a long time. It is not dangerous in the amounts involved, but it should be cleaned off before drinking. Lemon and salt will take it off completely.",
        ],
      },
    ],
  },

  accessibility: {
    title: "Accessibility",
    description: "How AZMIQ approaches accessibility, and how to tell us when we have got it wrong.",
    updated: LAST_UPDATED,
    sections: [
      {
        body: [
          "This site is built to meet WCAG 2.1 level AA. That is not a badge we are claiming lightly - it is a requirement under the Equality Act 2010 and, for EU customers, the European Accessibility Act.",
        ],
      },
      {
        heading: "What that means here",
        list: [
          "Every colour pair on the site has been measured. Body text sits at 16.9:1 against the page, and no interactive element falls below 3:1.",
          "Everything works with a keyboard alone, in a logical order, with a visible focus ring that never disappears against photography.",
          "Every form field has a real label, and errors are announced rather than only shown in red.",
          "Every image has appropriate alternative text, and decorative images are hidden from screen readers rather than described pointlessly.",
          "Nothing important is conveyed by colour alone - sale badges carry text, stock states carry words.",
          "Pinch-zoom is never disabled, and the site reflows to 320px without horizontal scrolling.",
          "Animation respects your reduced-motion setting.",
        ],
        body: [],
      },
      {
        heading: "Where we know we fall short",
        body: [
          "The product imagery on this build is placeholder artwork pending a photoshoot; alternative text will be rewritten to describe the real photographs when they land.",
        ],
      },
      {
        heading: "Tell us",
        body: [
          "If something here does not work for you, email shop@azmiq.com and describe what happened. We will fix it and reply to you when we have. You do not need to know the technical name for the problem.",
        ],
      },
    ],
  },

  contact: {
    title: "Contact",
    subtitle: "A person will reply",
    description: "How to reach AZMIQ about an order, a return, or a question about copper or leather.",
    sections: [
      {
        body: [
          "Email shop@azmiq.com. We answer within one working day, usually sooner, and it will be a person rather than a macro.",
          "Phone +44 7741 856782, UK business hours.",
        ],
      },
      {
        heading: "Follow AZMIQ",
        body: [
          "Instagram and Facebook: @azmiquk. New pieces, restocks and the workshop.",
        ],
      },
      {
        heading: "Before you write",
        list: [
          "Order or delivery question? Have your order number to hand - it speeds things up considerably.",
          "Want to return something? Start it yourself at /returns; it is faster than emailing.",
          "Worried about tarnish? Read the copper care guide first - it is almost certainly normal.",
        ],
        body: [],
      },
      {
        heading: "Wholesale and press",
        body: [
          "Email shop@azmiq.com with 'wholesale' or 'press' in the subject line and it will reach the right person.",
        ],
      },
    ],
  },
};
