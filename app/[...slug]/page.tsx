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

  const redirect = await resolveRedirect(path);
  if (redirect) permanentRedirect(redirect.toPath);

  notFound();
}
