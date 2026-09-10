import "./load-env";
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

/* ===========================================================================
   REBUILD THE LOCAL DEVELOPMENT DATABASE

   PGlite runs Postgres in a WASM sandbox writing to ./.pgdata, and it does not
   survive the dev server being killed mid-write - which is exactly what happens
   every time the process is stopped to pick up a change to .env.local. The
   symptom is always identical: routes that read the catalogue return 500 with
   "RuntimeError: Aborted()", while lighter routes carry on answering 200.

   Nothing can be repaired at that point, so this throws the files away and
   rebuilds. That is safe only because the embedded database holds nothing but
   seed data - hence the two guards below, which refuse to run against a real
   PostgreSQL or while a server still has the files open.
   =========================================================================== */

/* Deliberately looks for a process holding THIS project rather than a busy
   port: another project of the user's sits on 3000 permanently, and a guard
   that always fires is a guard everybody learns to bypass. If the process list
   cannot be read we say so and continue - a helper that cannot run is worse
   than one that occasionally asks a redundant question. */
function serversRunningHere(): number[] {
  const root = process.cwd();
  const command =
    process.platform === "win32"
      ? "powershell -NoProfile -Command \"Get-CimInstance Win32_Process -Filter \\\"Name='node.exe'\\\" | ForEach-Object { $_.ProcessId.ToString() + ' ' + $_.CommandLine }\""
      : "ps -eo pid=,args=";

  let output: string;
  try {
    output = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    console.warn("Could not read the process list - make sure the dev server is stopped.\n");
    return [];
  }

  return output
    .split("\n")
    .filter((line) => line.includes(root) && !line.includes("reset-db"))
    .map((line) => Number(line.trim().split(/\s+/)[0]))
    .filter((pid) => Number.isInteger(pid) && pid !== process.pid);
}

async function main() {
  // A DATABASE_URL means this is pointed at a real Postgres, which may well be
  // production. Dropping that is never what anyone wanted from a dev helper.
  if (process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is set, so this project is using a real PostgreSQL.\n" +
        "This script only ever rebuilds the embedded PGlite dev database, and\n" +
        "will not touch a real one. Unset DATABASE_URL first if you meant to.",
    );
    process.exit(1);
  }

  const running = serversRunningHere();
  if (running.length > 0) {
    console.error(
      `This project still has ${running.length} node process(es) running (PID ${running.join(", ")}).\n` +
        "Stop the dev server first - rebuilding underneath a running server is\n" +
        "one of the things that corrupts the database in the first place.",
    );
    process.exit(1);
  }

  for (const dir of [".next", ".pgdata"]) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  }

  execSync("npm run db:migrate", { stdio: "inherit" });
  execSync("npm run db:seed", { stdio: "inherit" });

  console.log("\nDatabase rebuilt. Start one dev server with `npm run dev -- -p 3100`.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
