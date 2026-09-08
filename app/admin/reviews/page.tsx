import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { moderateReview, replyToReview } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";

export const metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "pending", label: "Awaiting moderation" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "pending";

  const rows = await db
    .select({ review: t.reviews, productTitle: t.products.title, productSlug: t.products.slug })
    .from(t.reviews)
    .innerJoin(t.products, eq(t.reviews.productId, t.products.id))
    .where(eq(t.reviews.status, status))
    .orderBy(desc(t.reviews.createdAt))
    .limit(100);

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-ink">Reviews</h1>
      <p className="mt-1.5 max-w-2xl text-ink-muted">
        Published reviews feed the star ratings Google shows in search results, so only publish
        genuine ones. Rejecting hides a review without deleting it.
      </p>
      <hr className="rule-accent mt-6" />

      <nav aria-label="Filter reviews" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <li key={tab.value}>
              <Link
                href={`/admin/reviews?status=${tab.value}`}
                aria-current={status === tab.value ? "true" : undefined}
                className={
                  "inline-block rounded-pill px-4 py-2 text-sm " +
                  (status === tab.value
                    ? "bg-surface-brand text-ink-on-brand"
                    : "border border-border-control bg-surface-raised text-ink hover:border-ink")
                }
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {rows.length === 0 ? (
        <p className="mt-10 text-ink-muted">Nothing here.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-5">
          {rows.map(({ review, productTitle, productSlug }) => (
            <li key={review.id} className="rounded-lg border border-border bg-surface-raised p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Rating value={review.rating} showCount={false} size="sm" />
                  {review.title ? (
                    <h2 className="mt-2 font-serif text-lg text-ink">{review.title}</h2>
                  ) : null}
                </div>
                <Link
                  href={`/products/${productSlug}`}
                  className="text-sm text-ink-brand underline underline-offset-4"
                >
                  {productTitle}
                </Link>
              </div>

              <p className="mt-3 leading-relaxed text-ink-muted">{review.body}</p>

              <p className="mt-3 text-sm text-ink-muted">
                {review.authorName}
                {review.authorLocation ? ` · ${review.authorLocation}` : ""} ·{" "}
                {formatDate(review.createdAt)} · {review.source}
                {review.verifiedPurchase ? " · verified purchase" : ""}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["published", "pending", "rejected"]
                  .filter((next) => next !== review.status)
                  .map((next) => (
                    <form action={moderateReview} key={next}>
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="status" value={next} />
                      <button
                        type="submit"
                        className={
                          "min-h-11 rounded-md px-4 text-sm " +
                          (next === "published"
                            ? "bg-surface-wellness text-ink-on-brand hover:bg-surface-wellness-hover"
                            : "border border-border-control text-ink hover:border-ink")
                        }
                      >
                        {next === "published"
                          ? "Publish"
                          : next === "rejected"
                            ? "Reject"
                            : "Move to pending"}
                      </button>
                    </form>
                  ))}
              </div>

              <form action={replyToReview} className="mt-4 border-t border-border pt-4">
                <input type="hidden" name="id" value={review.id} />
                <label htmlFor={`reply-${review.id}`} className="text-sm font-medium text-ink">
                  Public reply
                </label>
                <textarea
                  id={`reply-${review.id}`}
                  name="reply"
                  rows={2}
                  defaultValue={review.reply ?? ""}
                  placeholder="Shown under the review, signed AZMIQ."
                  className="mt-2 w-full rounded-md border border-border-control bg-surface px-3 py-2.5 text-sm text-ink"
                />
                <button
                  type="submit"
                  className="mt-2 min-h-11 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink"
                >
                  Save reply
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
