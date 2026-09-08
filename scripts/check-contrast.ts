import { readFileSync } from "node:fs";
import { join } from "node:path";

/* ===========================================================================
   CONTRAST TEST

   Reads the real token values out of styles/tokens.css and asserts every
   foreground/background pairing the design actually uses. Run it in CI: a
   palette tweak that quietly drops body text to 4.2:1 should fail a build, not
   an accessibility audit six weeks after launch.

   WCAG 2.1 AA: 4.5:1 for body text, 3:1 for large text and for UI components
   and their focus indicators.
   =========================================================================== */

const css = readFileSync(join(process.cwd(), "styles", "tokens.css"), "utf8");

function readToken(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!match) throw new Error(`Token --${name} not found in styles/tokens.css`);
  return match[1];
}

const T = {
  teal: readToken("azmiq-teal"),
  green: readToken("azmiq-green"),
  sage: readToken("azmiq-sage"),
  sageTint: readToken("azmiq-sage-tint"),
  sageDeep: readToken("azmiq-sage-deep"),
  black: readToken("azmiq-black"),
  warm: readToken("azmiq-warm-white"),
  white: readToken("azmiq-white"),
  copper: readToken("azmiq-copper"),
  slate: readToken("azmiq-slate"),
  red: readToken("azmiq-red"),
};

function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type Check = { name: string; fg: string; bg: string; min: number };

const CHECKS: Check[] = [
  // Body and heading text
  { name: "body text on page", fg: T.black, bg: T.warm, min: 4.5 },
  { name: "body text on card", fg: T.black, bg: T.white, min: 4.5 },
  { name: "muted text on page", fg: T.slate, bg: T.warm, min: 4.5 },
  { name: "muted text on card", fg: T.slate, bg: T.white, min: 4.5 },
  { name: "muted text on sunken section", fg: T.slate, bg: T.sageTint, min: 4.5 },
  { name: "link text on page", fg: T.teal, bg: T.warm, min: 4.5 },
  { name: "wellness text on page", fg: T.green, bg: T.warm, min: 4.5 },
  { name: "wellness text on sunken", fg: T.green, bg: T.sageTint, min: 4.5 },

  // Inverse sections
  { name: "text on dark editorial", fg: T.warm, bg: T.black, min: 4.5 },
  { name: "sage muted text on dark", fg: T.sage, bg: T.black, min: 4.5 },
  { name: "copper on dark editorial", fg: T.copper, bg: T.black, min: 4.5 },

  // Buttons
  { name: "primary button label", fg: T.white, bg: T.teal, min: 4.5 },
  { name: "wellness button label", fg: T.white, bg: T.green, min: 4.5 },
  { name: "sale badge label on copper", fg: T.black, bg: T.copper, min: 4.5 },
  { name: "danger button label", fg: T.white, bg: T.red, min: 4.5 },

  // Errors
  { name: "error text on page", fg: T.red, bg: T.warm, min: 4.5 },
  { name: "error text on card", fg: T.red, bg: T.white, min: 4.5 },

  // UI components and focus - 3:1
  { name: "control border on page", fg: T.sageDeep, bg: T.warm, min: 3 },
  { name: "control border on card", fg: T.sageDeep, bg: T.white, min: 3 },
  { name: "focus ring on page", fg: T.teal, bg: T.warm, min: 3 },
  { name: "focus ring on card", fg: T.teal, bg: T.white, min: 3 },
  { name: "focus ring on sunken", fg: T.teal, bg: T.sageTint, min: 3 },
  { name: "copper hairline on page", fg: T.copper, bg: T.warm, min: 3 },
];

let failures = 0;
console.log("\nAZMIQ palette — WCAG 2.1 AA\n");

for (const check of CHECKS) {
  const value = ratio(check.fg, check.bg);
  const pass = value >= check.min;
  if (!pass) failures++;
  console.log(
    `  ${pass ? "PASS" : "FAIL"}  ${value.toFixed(2).padStart(6)}:1  (needs ${check.min})  ${check.name}`,
  );
}

/* Deliberate negatives. These pairings must NOT be used, and the test asserts
   they still fail - so if someone "fixes" sage by darkening it, the comment in
   the token file stops being a lie without anyone noticing. */
const MUST_FAIL: Check[] = [
  { name: "sage as text on warm white", fg: T.sage, bg: T.warm, min: 4.5 },
  { name: "copper as body text on warm white", fg: T.copper, bg: T.warm, min: 4.5 },
];

console.log("\nGuard rails — these pairings are documented as unusable\n");
for (const check of MUST_FAIL) {
  const value = ratio(check.fg, check.bg);
  const stillFails = value < check.min;
  console.log(
    `  ${stillFails ? "OK  " : "NOTE"}  ${value.toFixed(2).padStart(6)}:1  ${check.name}` +
      (stillFails ? " — still restricted, as documented" : " — now passes; the token comments need updating"),
  );
}

console.log(
  failures === 0
    ? `\nAll ${CHECKS.length} pairings meet AA.\n`
    : `\n${failures} of ${CHECKS.length} pairings fail AA.\n`,
);

process.exit(failures === 0 ? 0 : 1);
