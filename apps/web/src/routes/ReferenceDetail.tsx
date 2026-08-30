import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getReference,
  removeReference,
  updateReference,
  type ReferenceEdits,
} from "@/lib/api";
import { useVault } from "@/lib/hooks";
import { applyQuery, EMPTY_QUERY } from "@/lib/query";
import type { Reference } from "@/lib/types";
import { ArrowLeft, Chevron, Pencil, ThumbDown, ThumbUp, Trash } from "@/components/icons";
import { RatingMark } from "@/components/marks";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { NotFound } from "@/components/states";
import { formatDate } from "@/components/PieceCard";

export function ReferenceDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { references } = useVault();

  const [ref, setRef] = useState<Reference | null | undefined>(undefined);
  const editing = params.get("edit") === "1";

  useEffect(() => {
    let live = true;
    setRef(undefined);
    getReference(slug).then((r) => live && setRef(r));
    return () => {
      live = false;
    };
  }, [slug]);

  const ordered = useMemo(
    () => applyQuery(references, EMPTY_QUERY),
    [references],
  );
  const idx = ordered.findIndex((r) => r.slug === slug);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  if (ref === undefined) {
    return <div className="state" aria-busy="true" />;
  }
  if (ref === null) return <NotFound />;

  const setEditing = (on: boolean) => {
    const p = new URLSearchParams(params);
    if (on) p.set("edit", "1");
    else p.delete("edit");
    setParams(p, { replace: true });
  };

  const save = async (edits: ReferenceEdits) => {
    const updated = await updateReference(slug, edits);
    setRef(updated);
    setEditing(false);
  };

  const remove = async () => {
    await removeReference(slug);
    navigate("/");
  };

  return (
    <>
      <Link to="/" className="backlink">
        <ArrowLeft /> back to the wall
      </Link>

      <article className="detail" data-sentiment={ref.sentiment}>
        <div className="detail__plates">
          {ref.images.length > 0 ? (
            ref.images.map((src, i) => (
              <img
                key={src}
                className="bigplate"
                src={src}
                alt={`Screenshot ${i + 1} of ${ref.images.length}: ${ref.title}`}
              />
            ))
          ) : (
            <div className="bigplate plate--empty">
              <span>No screenshot yet</span>
            </div>
          )}
        </div>

        <div>
          {editing ? (
            <EditForm reference={ref} onSave={save} onCancel={() => setEditing(false)} />
          ) : (
            <ViewSide reference={ref} onEdit={() => setEditing(true)} onRemove={remove} />
          )}
        </div>
      </article>

      <nav className="detail__nav" aria-label="Move along the wall">
        {prev ? (
          <Link to={`/r/${prev.slug}`} data-dir="prev">
            <Chevron style={{ transform: "rotate(180deg)" }} /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/r/${next.slug}`} data-dir="next">
            <Chevron /> {next.title}
          </Link>
        )}
      </nav>
    </>
  );
}

/* ---- view ---- */

function ViewSide({
  reference: r,
  onEdit,
  onRemove,
}: {
  reference: Reference;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [lead, ...rest] = splitNote(r.noteText);
  return (
    <>
      <div className="headblock">
        <dl>
          {r.source && (
            <>
              <dt>Source</dt>
              <dd>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.source}
                  </a>
                ) : (
                  r.source
                )}
              </dd>
            </>
          )}
          {r.kind && (
            <>
              <dt>Kind</dt>
              <dd>
                {r.kind}
                {r.surface ? ` · ${r.surface}` : ""}
              </dd>
            </>
          )}
          <dt>Saved</dt>
          <dd>{formatDate(r.saved)}</dd>
          {r.rating && (
            <>
              <dt>Rating</dt>
              <dd>
                <RatingMark rating={r.rating} /> {ratingWord(r.rating, r.sentiment)}
              </dd>
            </>
          )}
          {r.tags.length > 0 && (
            <>
              <dt>Tags</dt>
              <dd>{r.tags.join(" · ")}</dd>
            </>
          )}
        </dl>
        <div className="editbar" style={{ margin: "0.9rem 0 0", padding: "0.75rem 0 0", borderBottom: 0 }}>
          <button type="button" className="btn" onClick={onEdit}>
            <Pencil /> Uncap the pen
          </button>
          <ConfirmDialog
            danger
            trigger={
              <button type="button" className="btn btn--danger">
                <Trash /> Remove
              </button>
            }
            title={`Take “${r.title}” off the wall?`}
            body="It moves to Recently removed. You can restore it, or delete it for good from there."
            confirmLabel="Take it down"
            onConfirm={onRemove}
          />
        </div>
      </div>

      <h1 className="entrytitle">{r.title}</h1>

      <span className={`verdict verdict--${r.sentiment === "positive" ? "like" : "dislike"}`}>
        {r.sentiment === "positive" ? <ThumbUp /> : <ThumbDown />}
        {r.sentiment === "positive" ? "Liked" : "Disliked"}
        {r.rating ? ` · ${ratingWord(r.rating, r.sentiment)}` : ""}
      </span>

      {r.degraded ? (
        <p className="note">
          <span className="lead">reference.md couldn’t be read.</span>
          This folder is listed from what’s on disk — the title is de-kebabed from
          the folder name and the date from its suffix. Add or fix a{" "}
          <code>reference.md</code> and it fills in.
        </p>
      ) : r.noteText.trim() ? (
        <div className="note">
          {lead && <span className="lead">{`“${lead}”`}</span>}
          {rest.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      ) : (
        <p className="note">
          <span className="lead">No note yet.</span>
          Uncap the pen to say why this one’s on the wall.
        </p>
      )}

      {r.rating && (
        <p className="legend">
          <span>Rating</span>
          <span className="legend__key">
            <RatingMark rating={1} /> noted
          </span>
          <span className="legend__key">
            <RatingMark rating={2} /> worth copying
          </span>
          <span className="legend__key">
            <RatingMark rating={3} /> return to this
          </span>
        </p>
      )}

      {r.ai && (
        <div className="laterhand">
          <span className="laterhand__head">
            Later hand — AI Interpretation · {formatDate(r.ai.derivedAt)}
          </span>
          Observed: {r.ai.observations.join(" · ")}.
          {r.ai.patternName ? ` Inferred pattern: ${r.ai.patternName}.` : ""}
          {r.ai.filedBeside?.length
            ? ` Filed beside ${r.ai.filedBeside.join(", ")}.`
            : ""}
        </div>
      )}
    </>
  );
}

/* ---- edit ("uncap the pen") ---- */

function EditForm({
  reference: r,
  onSave,
  onCancel,
}: {
  reference: Reference;
  onSave: (edits: ReferenceEdits) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(r.title);
  const [url, setUrl] = useState(r.url ?? "");
  const [kind, setKind] = useState(r.kind ?? "");
  const [sentiment, setSentiment] = useState(r.sentiment);
  const [rating, setRating] = useState<string>(r.rating ? String(r.rating) : "");
  const [tags, setTags] = useState(r.tags.join(", "));
  const [surface, setSurface] = useState(r.surface ?? "");
  const [note, setNote] = useState(r.noteText);

  const dirty =
    title !== r.title ||
    url !== (r.url ?? "") ||
    kind !== (r.kind ?? "") ||
    sentiment !== r.sentiment ||
    rating !== (r.rating ? String(r.rating) : "") ||
    tags !== r.tags.join(", ") ||
    surface !== (r.surface ?? "") ||
    note !== r.noteText;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      url: url.trim() || null,
      kind: kind || null,
      sentiment,
      rating: rating ? (Number(rating) as 1 | 2 | 3) : null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      surface: surface.trim() || null,
      noteText: note,
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="headblock">
        <div className="field-row">
          <label htmlFor="f-title">Title</label>
          <input
            id="f-title"
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="de-kebabed from the folder if blank"
          />
        </div>
        <div className="field-row">
          <label htmlFor="f-url">URL</label>
          <input
            id="f-url"
            className="field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="field-row">
          <label htmlFor="f-kind">Kind</label>
          <select
            id="f-kind"
            className="field"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="">—</option>
            <option value="page">page</option>
            <option value="element">element</option>
            <option value="interaction">interaction</option>
            <option value="flow">flow</option>
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="f-surface">Surface</label>
          <input
            id="f-surface"
            className="field"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            placeholder="dashboard, docs, editor…"
          />
        </div>
        <div className="field-row">
          <label htmlFor="f-tags">Tags</label>
          <input
            id="f-tags"
            className="field"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma, separated"
          />
        </div>
        <div className="field-row">
          <label>Sentiment</label>
          <div className="toggle">
            <button
              type="button"
              data-tone="like"
              data-active={sentiment === "positive"}
              onClick={() => setSentiment("positive")}
            >
              <ThumbUp /> Liked
            </button>
            <button
              type="button"
              data-tone="dislike"
              data-active={sentiment === "negative"}
              onClick={() => setSentiment("negative")}
            >
              <ThumbDown /> Disliked
            </button>
          </div>
        </div>
        <div className="field-row">
          <label>Rating</label>
          <div className="toggle">
            {["", "1", "2", "3"].map((v) => (
              <button
                key={v || "none"}
                type="button"
                data-active={rating === v}
                onClick={() => setRating(v)}
              >
                {v === "" ? "none" : v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h1 className="entrytitle">{title || "Untitled reference"}</h1>

      <label htmlFor="f-note" className="visually-hidden">
        User Note
      </label>
      <textarea
        id="f-note"
        className="field"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Why is this on the wall? What do you want an agent to take from it — or steer clear of?"
      />

      <div className="editbar">
        <button type="submit" className="btn btn--solid">
          Cap the pen — save
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <span className="dirty">{dirty ? "unsaved changes" : "no changes"}</span>
      </div>
      <p className="synthetic-note" style={{ marginTop: "1rem", borderTop: 0 }}>
        A half-filled reference saves fine — nothing here is required.
      </p>
    </form>
  );
}

function splitNote(note: string): string[] {
  const t = note.trim();
  if (!t) return [];
  const stop = t.search(/(?<=[.!?])\s/); // index of the space after the first sentence
  if (stop > 40) return [t.slice(0, stop).trimEnd(), ...paras(t.slice(stop + 1))];
  return paras(t);
}
function paras(s: string): string[] {
  return s
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
function ratingWord(r: number, sentiment: "positive" | "negative"): string {
  if (sentiment === "negative") {
    return r === 3 ? "never do this" : r === 2 ? "worth avoiding" : "noted";
  }
  return r === 3 ? "return to this" : r === 2 ? "worth copying" : "noted";
}
