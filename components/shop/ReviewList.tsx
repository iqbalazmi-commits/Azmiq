import { BadgeCheck } from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/db/schema";

export function ReviewSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
      <div>
        <p className="font-serif text-4xl text-ink tabular-nums">{average.toFixed(1)}</p>
        <Rating value={average} showCount={false} className="mt-2" />
        <p className="mt-2 text-sm text-ink-muted">
          {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      <ul className="flex max-w-sm flex-col gap-1.5">
        {distribution.map(({ star, count }) => {
          const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 text-ink-muted tabular-nums">{star} star</span>
              <span className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-sunken">
                <span
                  className="block h-full rounded-pill bg-surface-wellness"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-ink-muted tabular-nums">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-ink-muted">
        No reviews yet. If you own this piece, we would genuinely like to hear how it has worn in.
      </p>
    );
  }

  return (
    <ul className="grid gap-x-10 gap-y-10 md:grid-cols-2">
      {reviews.map((review) => (
        <li key={review.id} className="border-t border-border pt-6">
          <Rating value={review.rating} showCount={false} size="sm" />
          {review.title ? (
            <h3 className="mt-3 font-serif text-lg text-ink">{review.title}</h3>
          ) : null}
          <p className="mt-2 leading-relaxed text-ink-muted">{review.body}</p>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            <span className="text-ink">{review.authorName}</span>
            {review.authorLocation ? <span>{review.authorLocation}</span> : null}
            <span aria-hidden="true">&middot;</span>
            <span>{formatDate(review.publishedAt ?? review.createdAt)}</span>
            {review.verifiedPurchase ? (
              <span className="inline-flex items-center gap-1 text-ink-wellness">
                <BadgeCheck size={14} aria-hidden="true" />
                Verified purchase
              </span>
            ) : null}
          </p>

          {review.reply ? (
            <div className="mt-4 border-l-2 border-accent-rule pl-4">
              <p className="text-xs uppercase tracking-widest text-ink-muted">AZMIQ replied</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{review.reply}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
