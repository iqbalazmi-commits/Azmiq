/* Daily basket reminder on a self-hosted server - the equivalent of
   netlify/functions/basket-recovery.mjs. Run it once a day inside the
   container (Coolify: Scheduled Tasks, command `node scripts/cron-basket-recovery.mjs`,
   schedule `0 10 * * *`). It calls the shop's own cron route with CRON_SECRET. */

const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("[basket-recovery] CRON_SECRET is not set; skipping.");
  process.exit(1);
}

const port = process.env.PORT ?? "3000";
const res = await fetch(`http://127.0.0.1:${port}/api/cron/basket-recovery`, {
  headers: { Authorization: `Bearer ${secret}` },
});
console.log("[basket-recovery]", res.status, await res.text());
process.exit(res.ok ? 0 : 1);
