import { useState } from "react";

const VISIBLE = 8;

export function TagRow({
  tags,
  active,
  onToggle,
}: {
  tags: { tag: string; count: number }[];
  active: string[];
  onToggle: (tag: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (tags.length === 0) return null;
  const shown = expanded ? tags : tags.slice(0, VISIBLE);
  const rest = tags.length - shown.length;

  return (
    <div className="tagrow" aria-label="Filter by tag">
      {shown.map(({ tag, count }) => (
        <button
          key={tag}
          type="button"
          className="tagchip"
          data-active={active.includes(tag)}
          onClick={() => onToggle(tag)}
          title={`${count} reference${count === 1 ? "" : "s"}`}
        >
          {tag}
        </button>
      ))}
      {rest > 0 && (
        <button
          type="button"
          className="tagchip"
          onClick={() => setExpanded(true)}
        >
          + {rest} more
        </button>
      )}
    </div>
  );
}
