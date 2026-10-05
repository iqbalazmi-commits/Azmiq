import { notFound, permanentRedirect } from "next/navigation";
import { resolveRedirect } from "@/lib/redirects";

export const dynamic = "force-dynamic";

/* The catch-all that keeps old links working after a product is renamed.

   It runs only when nothing more specific matched, so normal traffic never
   touches it. A path with a redirect is sent on permanently; anything else
   falls through to the custom 404, which offers real alternatives rather than
   bouncing the visitor to the homepage. */

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  // Vulnerability scanners probe every site for /wp-login.php, /.env,
  // /cgi-bin and the like, and each lookup would wake the database. Real
  // legacy URLs (/products/x, /pages/x) never look like that, so these go
  // straight to the 404 without a query.
  if (isProbe(slug)) notFound();

  const redirect = await resolveRedirect(path);
  if (redirect) permanentRedirect(redirect.toPath);

  notFound();
}

function isProbe(segments: string[]): boolean {
  const last = decodeURIComponent(segments[segments.length - 1] ?? "");
  return (
    segments.some((s) => s.startsWith(".") || /^(wp-|cgi-bin$|phpmyadmin)/i.test(s)) ||
    /\.[a-z0-9]{1,5}$/i.test(last)
  );
}
