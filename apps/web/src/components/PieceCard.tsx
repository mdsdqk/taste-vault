import { useNavigate } from "react-router-dom";
import type { Reference } from "@/lib/types";
import { KindDot, RatingMark, SentimentThumb } from "./marks";

/** One piece on the wall: a pinned plate + its printed label. */
export function PieceCard({ reference }: { reference: Reference }) {
  const navigate = useNavigate();
  const r = reference;
  const clause = firstClause(r.noteText);

  return (
    <button
      type="button"
      className="piece"
      data-sentiment={r.sentiment}
      onClick={() => navigate(`/r/${r.slug}`)}
      aria-label={`${r.title} — ${
        r.sentiment === "positive" ? "liked" : "disliked"
      }${r.rating ? `, rating ${r.rating}` : ""}. Open`}
    >
      <span className="plate-wrap">
        <span className="pin" aria-hidden="true" />
        {r.cover ? (
          <img
            className="plate"
            src={r.cover}
            alt={`Screenshot: ${r.title}`}
            data-rating={r.rating ?? 0}
            loading="lazy"
          />
        ) : (
          <span className="plate plate--empty" data-rating={r.rating ?? 0}>
            <span>No screenshot yet</span>
          </span>
        )}
      </span>

      <span className="label">
        <span className="label__head">
          <SentimentThumb sentiment={r.sentiment} />
          <span className="title">{r.title}</span>
        </span>
        <span className="meta">
          {r.source && <span>{r.source}</span>}
          {r.surface && <span className="dot-sep">{r.surface}</span>}
          <KindDot kind={r.kind} />
          <RatingMark rating={r.rating} />
          <span className="dot-sep">{formatDate(r.saved)}</span>
        </span>
        {r.degraded ? (
          <span className="clause clause--degraded">
            reference.md unreadable — listed from the folder
          </span>
        ) : (
          <span className="clause">{clause ? `“${clause}”` : "No note yet"}</span>
        )}
      </span>
    </button>
  );
}

function firstClause(note: string): string {
  const trimmed = note.trim();
  if (!trimmed) return "";
  const stop = trimmed.search(/(?<=[.!?])\s/); // space after the first sentence
  if (stop > 40) return trimmed.slice(0, stop).trimEnd(); // includes the terminal punctuation
  const clause = trimmed.slice(0, 160).trimEnd();
  return clause.length < trimmed.length ? `${clause}…` : clause;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/-/g, " · ");
}
