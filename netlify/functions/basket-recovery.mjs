/* Daily basket reminder, the Netlify equivalent of the Vercel Cron entry in
   vercel.json. Netlify runs this on the schedule below (UTC) and it calls the
   site's own cron route with the shared CRON_SECRET, exactly as Vercel did.
   Set CRON_SECRET in Netlify's environment variables, or the route refuses. */

const basketRecovery = async () => {
  const base = process.env.URL; // the site's main address, set by Netlify
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("[basket-recovery] URL or CRON_SECRET is not set; skipping.");
    return new Response("not configured", { status: 503 });
  }

  const res = await fetch(`${base}/api/cron/basket-recovery`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log("[basket-recovery]", res.status, body);
  return new Response(body, { status: res.status });
};

export default basketRecovery;

export const config = { schedule: "0 10 * * *" };
