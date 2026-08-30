import type { Kind, Rating, Sentiment } from "@/lib/types";
import { ThumbDown, ThumbUp } from "./icons";

/* ---- rating: a private shorthand, drawn not typed ---- */

export function RatingMark({
  rating,
  className,
}: {
  rating: Rating | null;
  className?: string;
}) {
  if (rating == null) return null;
  const label =
    rating === 3 ? "return to this" : rating === 2 ? "worth copying" : "noted";
  return (
    <span
      className={`rating-mark${className ? ` ${className}` : ""}`}
      title={`Rating ${rating} — ${label}`}
      aria-label={`Rating ${rating} of 3, ${label}`}
    >
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 12 12" width="1em" height="1em" aria-hidden="true">
          <path
            d="M6 0.6 11.4 6 6 11.4 0.6 6Z"
            fill={n <= rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.25}
            opacity={n <= rating ? 1 : 0.35}
          />
        </svg>
      ))}
    </span>
  );
}

/* ---- sentiment: thumb up / down ---- */

export function SentimentThumb({
  sentiment,
  withLabel = false,
  size = "sm",
}: {
  sentiment: Sentiment;
  withLabel?: boolean;
  size?: "sm" | "md";
}) {
  const liked = sentiment === "positive";
  return (
    <span
      className={`thumb thumb--${liked ? "like" : "dislike"} thumb--${size}`}
      aria-label={liked ? "Liked" : "Disliked"}
    >
      {liked ? <ThumbUp /> : <ThumbDown />}
      {withLabel && <span className="thumb__label">{liked ? "Liked" : "Disliked"}</span>}
    </span>
  );
}

/* ---- kind: a subtle dot, palette-derived ---- */

export function KindDot({ kind }: { kind: Kind | null }) {
  if (!kind) return null;
  return (
    <span className="kind" data-kind={kind}>
      <span className="kind__dot" aria-hidden="true" />
      {kind}
    </span>
  );
}
