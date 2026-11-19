/* Daily review requests. Netlify runs this on the schedule below (UTC) and it
   calls the site's own cron route with the shared CRON_SECRET - the same
   secret the basket reminder already uses, so there is nothing new to set. */

const reviewRequests = async () => {
  const base = process.env.URL; // the site's main address, set by Netlify
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("[review-requests] URL or CRON_SECRET is not set; skipping.");
    return new Response("not configured", { status: 503 });
  }

  const res = await fetch(`${base}/api/cron/review-requests`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log("[review-requests]", res.status, body);
  return new Response(body, { status: res.status });
};

export default reviewRequests;

// 11:00 UTC, an hour after the basket reminders, so the two never overlap.
export const config = { schedule: "0 11 * * *" };
