import type {
  KindFilter,
  LibraryQuery,
  SentimentFilter,
  SortKey,
} from "@/lib/types";
import { Search, ThumbDown, ThumbUp } from "./icons";

const KINDS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "Any kind" },
  { key: "page", label: "Page" },
  { key: "element", label: "Element" },
  { key: "interaction", label: "Interaction" },
  { key: "flow", label: "Flow" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "saved", label: "date" },
  { key: "rating", label: "rating" },
  { key: "tag", label: "tag" },
];

export function Band({
  query,
  onQuery,
}: {
  query: LibraryQuery;
  onQuery: (patch: Partial<LibraryQuery>) => void;
}) {
  const setSentiment = (sentiment: SentimentFilter) => onQuery({ sentiment });

  return (
    <div className="band">
      <div className="toggle" role="group" aria-label="Filter by sentiment">
        <button
          type="button"
          data-active={query.sentiment === "all"}
          onClick={() => setSentiment("all")}
        >
          All
        </button>
        <button
          type="button"
          data-tone="like"
          data-active={query.sentiment === "positive"}
          onClick={() => setSentiment("positive")}
        >
          <ThumbUp /> Liked
        </button>
        <button
          type="button"
          data-tone="dislike"
          data-active={query.sentiment === "negative"}
          onClick={() => setSentiment("negative")}
        >
          <ThumbDown /> Disliked
        </button>
      </div>

      <div className="toggle" role="group" aria-label="Filter by kind">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            data-active={query.kind === k.key}
            onClick={() => onQuery({ kind: k.key })}
          >
            {k.label}
          </button>
        ))}
      </div>

      <label className="search">
        <Search aria-hidden="true" />
        <input
          type="search"
          placeholder="search the wall…"
          value={query.text}
          onChange={(e) => onQuery({ text: e.target.value })}
          aria-label="Search references"
        />
      </label>

      <div className="band__right">
        <span>hang by</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            data-active={query.sort === s.key}
            onClick={() => onQuery({ sort: s.key })}
          >
            {s.label}
          </button>
        ))}
        <span aria-hidden="true">·</span>
        <button type="button" data-active={true} aria-pressed="true">
          gallery
        </button>
        <button type="button" disabled title="Ledger view arrives with a larger Vault">
          ledger
        </button>
      </div>
    </div>
  );
}
