/* Daily follow-up emails on a self-hosted server - the equivalent of the
   scheduled functions in netlify/functions/. Run it once a day inside the
   container (Coolify: Scheduled Tasks, command `node scripts/cron-daily.mjs`,
   schedule `0 10 * * *`). It calls the shop's own cron routes with CRON_SECRET:
   basket reminders first, then review requests. */

const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("[cron-daily] CRON_SECRET is not set; skipping.");
  process.exit(1);
}

const port = process.env.PORT ?? "3000";
let failed = false;
for (const job of ["basket-recovery", "review-requests"]) {
  const res = await fetch(`http://127.0.0.1:${port}/api/cron/${job}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  console.log(`[${job}]`, res.status, await res.text());
  if (!res.ok) failed = true;
}
process.exit(failed ? 1 : 0);
