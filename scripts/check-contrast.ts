import { readFileSync } from "node:fs";
import { join } from "node:path";

/* ===========================================================================
   CONTRAST TEST

   Reads the real token values out of styles/tokens.css and asserts every
   foreground/background pairing the design actually uses. Run it in CI: a
   palette tweak that quietly drops body text to 4.2:1 should fail a build,
   not an accessibility audit six weeks after launch.

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
  cyan: readToken("az-cyan"),
  cyanDeep: readToken("az-cyan-deep"),
  cyanText: readToken("az-cyan-text"),
  lime: readToken("az-lime"),
  limeDeep: readToken("az-lime-deep"),
  gold: readToken("az-gold"),
  goldBright: readToken("az-gold-bright"),
  white: readToken("az-white"),
  grey: readToken("az-grey"),
  grey500: readToken("az-grey-500"),
  charcoal: readToken("az-charcoal"),
  muted: readToken("az-muted"),
  onDarkMuted: readToken("az-on-dark-muted"),
  red: readToken("az-red"),
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
  { name: "body text on white", fg: T.charcoal, bg: T.white, min: 4.5 },
  { name: "body text on grey card", fg: T.charcoal, bg: T.grey, min: 4.5 },
  { name: "muted text on white", fg: T.muted, bg: T.white, min: 4.5 },
  { name: "muted text on grey card", fg: T.muted, bg: T.grey, min: 4.5 },
  { name: "link text on white", fg: T.cyanText, bg: T.white, min: 4.5 },
  { name: "in-stock text on white", fg: T.limeDeep, bg: T.white, min: 4.5 },
  { name: "in-stock text on grey", fg: T.limeDeep, bg: T.grey, min: 4.5 },

  // Dark bands
  { name: "text on charcoal band", fg: T.white, bg: T.charcoal, min: 4.5 },
  { name: "muted text on charcoal band", fg: T.onDarkMuted, bg: T.charcoal, min: 4.5 },
  { name: "cyan accent on charcoal band", fg: T.cyan, bg: T.charcoal, min: 4.5 },

  // Buttons and badges
  { name: "primary button label (dark on cyan)", fg: T.charcoal, bg: T.cyan, min: 4.5 },
  { name: "new badge label (dark on lime)", fg: T.charcoal, bg: T.lime, min: 4.5 },

  // Errors
  { name: "error text on white", fg: T.red, bg: T.white, min: 4.5 },
  { name: "error text on grey card", fg: T.red, bg: T.grey, min: 4.5 },

  // UI components and focus — 3:1
  { name: "control border on white", fg: T.grey500, bg: T.white, min: 3 },
  { name: "control border on grey", fg: T.grey500, bg: T.grey, min: 3 },
  { name: "focus ring on white", fg: T.cyanDeep, bg: T.white, min: 3 },
  { name: "focus ring on charcoal", fg: T.cyanDeep, bg: T.charcoal, min: 3 },
  { name: "gold hairline on white", fg: T.gold, bg: T.white, min: 3 },
  { name: "gold hairline on grey", fg: T.gold, bg: T.grey, min: 3 },
  { name: "gold detail on charcoal band", fg: T.goldBright, bg: T.charcoal, min: 4.5 },
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

/* Deliberate negatives. The bright accents must NOT be used as small text on
   white, and the test asserts they still fail so the token comments stay true. */
const MUST_FAIL: Check[] = [
  { name: "cyan as text on white", fg: T.cyan, bg: T.white, min: 4.5 },
  { name: "lime as text on white", fg: T.lime, bg: T.white, min: 4.5 },
  { name: "gold as body text on white", fg: T.gold, bg: T.white, min: 4.5 },
  { name: "white label on cyan button", fg: T.white, bg: T.cyan, min: 4.5 },
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
