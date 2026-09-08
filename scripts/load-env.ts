import { existsSync, readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";

/* Node 20+ exposes globalThis.crypto; older runtimes do not, and the schema
   uses crypto.randomUUID() for primary keys. One line here keeps the scripts
   runnable on whatever Node happens to be installed. */
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
}

/* A small .env loader so scripts need no dotenv dependency. Next.js loads
   .env.local itself; these scripts run outside Next, so they do it here. */
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    const key = match[1];
    if (process.env[key] !== undefined) continue;
    process.env[key] = match[2].replace(/^["']|["']$/g, "");
  }
}
