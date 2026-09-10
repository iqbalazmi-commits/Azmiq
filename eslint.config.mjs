import next from "eslint-config-next";

/* Flat config. `next lint` was removed in Next 16, so `npm run lint` calls the
   ESLint CLI directly against this file. */

const config = [
  { ignores: [".next/**", "node_modules/**", "public/**", "db/migrations/**"] },
  ...next,
  {
    rules: {
      // Perf hint, not a correctness rule. Several of our effects legitimately
      // read an external value (a media query, a cookie) or react to a route
      // change and set state from it — the canonical use of an effect. Keep it
      // visible as a warning rather than failing the build.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
