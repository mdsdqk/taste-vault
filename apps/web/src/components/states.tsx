import { Link } from "react-router-dom";
import { Plus } from "./icons";

/** First run — an empty wall that reads like the authoring guide, not an error. */
export function EmptyGallery({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="state">
      <h2>Nothing hung yet.</h2>
      <p>
        This is your Vault — the web experiences you’ve judged, good and bad, kept
        as evidence for later. Hang your first piece and the wall starts filling.
      </p>
      <p>
        Hang your first piece with <em>Pin a reference</em>, fill in why it
        belongs, then cap the pen — that’s when the folder is written. You can
        still author by hand: a folder{" "}
        <code>references/&lt;slug&gt;-&lt;date&gt;/</code> with images, and
        optionally a <code>reference.md</code> on <em>why</em>. Every field is
        optional — a half-filled piece still hangs.
      </p>
      <div className="state__actions">
        <button type="button" className="btn btn--solid" onClick={onCreate}>
          <Plus /> Pin a reference
        </button>
      </div>
    </div>
  );
}

/** Filters matched nothing. */
export function FilteredEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div className="state">
      <h2>Nothing on the wall matches.</h2>
      <p>No piece fits every filter at once. Loosen one, or clear them all.</p>
      <div className="state__actions">
        <button type="button" className="btn" onClick={onReset}>
          Clear filters
        </button>
      </div>
    </div>
  );
}

/** Scanning `references/`. */
export function LoadingWall() {
  return (
    <div className="loading-wall" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function NotFound() {
  return (
    <div className="state">
      <h2>That piece isn’t on the wall.</h2>
      <p>It may have been removed or renamed on disk.</p>
      <div className="state__actions">
        <Link to="/" className="btn">
          Back to the wall
        </Link>
      </div>
    </div>
  );
}
