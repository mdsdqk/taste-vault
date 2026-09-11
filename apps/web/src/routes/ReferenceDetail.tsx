import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  addReferenceImages,
  createReference,
  getReference,
  removeReference,
  updateReference,
  type ReferenceEdits,
} from "@/lib/api";
import { writeErrorMessage } from "@/lib/flash";
import { useVault } from "@/lib/hooks";
import { applyQuery, EMPTY_QUERY } from "@/lib/query";
import { safeHttpUrl } from "@/lib/normalize";
import type { Reference } from "@/lib/types";
import { ArrowLeft, Chevron, Pencil, ThumbDown, ThumbUp, Trash } from "@/components/icons";
import { RatingMark } from "@/components/marks";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlateStage } from "@/components/PlateStage";
import { NotFound } from "@/components/states";
import { formatDate } from "@/components/PieceCard";

type Staged = { id: string; file: File; url: string };

function fileExt(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const fromName = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (fromName) return fromName;
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/svg+xml") return ".svg";
  const sub = file.type.split("/")[1];
  return sub ? `.${sub}` : ".png";
}

function draftReference(): Reference {
  return {
    slug: "",
    title: "",
    url: null,
    source: null,
    kind: null,
    saved: new Date().toISOString().slice(0, 10),
    sentiment: "positive",
    rating: null,
    tags: [],
    surface: null,
    images: [],
    cover: null,
    noteHtml: "",
    noteText: "",
    ai: null,
    degraded: false,
  };
}

export function ReferenceDetail() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const isDraft = location.pathname === "/pin";
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { references } = useVault();

  const live = isDraft ? undefined : references.find((r) => r.slug === slug);
  const [local, setLocal] = useState<Reference | null | undefined>(
    isDraft ? draftReference() : undefined,
  );
  const editing = isDraft || params.get("edit") === "1";

  const [staged, setStaged] = useState<Staged[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const stagedRef = useRef(staged);
  stagedRef.current = staged;

  useEffect(() => {
    return () => {
      for (const s of stagedRef.current) URL.revokeObjectURL(s.url);
    };
  }, []);

  useEffect(() => {
    if (isDraft) return;
    setLocal(undefined);
  }, [slug, isDraft]);

  useEffect(() => {
    if (live) setLocal(live);
  }, [live]);

  useEffect(() => {
    if (isDraft || live) return;
    let on = true;
    getReference(slug).then((r) => {
      if (on) setLocal(r);
    });
    return () => {
      on = false;
    };
  }, [slug, live, isDraft]);

  const ref = local;

  const ordered = useMemo(
    () => applyQuery(references, EMPTY_QUERY),
    [references],
  );
  const idx = ordered.findIndex((r) => r.slug === slug);
  const prev = !isDraft && idx > 0 ? ordered[idx - 1] : null;
  const next =
    !isDraft && idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  if (ref === undefined) {
    return <div className="state" aria-busy="true" />;
  }
  if (ref === null) return <NotFound />;

  const setEditing = (on: boolean) => {
    if (isDraft) return;
    const p = new URLSearchParams(params);
    if (on) p.set("edit", "1");
    else p.delete("edit");
    setParams(p, { replace: true });
  };

  const save = async (edits: ReferenceEdits) => {
    if (isDraft) {
      const created = await createReference(edits);
      if (staged.length > 0) {
        const cover = coverId ?? staged[0]?.id ?? null;
        const files = staged.map((s) => {
          if (s.id !== cover) return s.file;
          return new File([s.file], `cover${fileExt(s.file)}`, {
            type: s.file.type,
          });
        });
        await addReferenceImages(created.slug, files);
      }
      for (const s of staged) URL.revokeObjectURL(s.url);
      setStaged([]);
      navigate(`/r/${created.slug}`, { replace: true });
      return;
    }
    const updated = await updateReference(slug, edits);
    setLocal(updated);
    setEditing(false);
    if (updated.slug !== slug) {
      navigate(`/r/${updated.slug}`, { replace: true });
    }
  };

  const remove = async () => {
    await removeReference(slug);
    navigate("/");
  };

  const plateImages = isDraft ? staged.map((s) => s.url) : ref.images;
  const plateCover = isDraft
    ? (staged.find((s) => s.id === (coverId ?? staged[0]?.id))?.url ?? null)
    : ref.cover;

  return (
    <>
      <Link to="/" className="backlink">
        <ArrowLeft /> back to the wall
      </Link>

      <article className="detail" data-sentiment={ref.sentiment}>
        <PlateStage
          slug={ref.slug}
          title={ref.title}
          images={plateImages}
          cover={plateCover}
          editing={editing}
          onUpdate={setLocal}
          local={
            isDraft
              ? {
                  onAdd: (files) => {
                    setStaged((prev) => [
                      ...prev,
                      ...files.map((file) => ({
                        id: crypto.randomUUID(),
                        file,
                        url: URL.createObjectURL(file),
                      })),
                    ]);
                  },
                  onRemove: (src) => {
                    setStaged((prev) => {
                      const hit = prev.find((s) => s.url === src);
                      if (hit) URL.revokeObjectURL(hit.url);
                      const nextStaged = prev.filter((s) => s.url !== src);
                      if (hit && (coverId === hit.id || coverId === null)) {
                        setCoverId(null);
                      }
                      return nextStaged;
                    });
                  },
                  onCover: (src) => {
                    const hit = staged.find((s) => s.url === src);
                    if (hit) setCoverId(hit.id);
                  },
                }
              : undefined
          }
        />

        <div>
          {editing && !ref.degraded ? (
            <EditForm
              reference={ref}
              draft={isDraft}
              onSave={save}
              onCancel={() => (isDraft ? navigate("/") : setEditing(false))}
            />
          ) : (
            <ViewSide reference={ref} onEdit={() => setEditing(true)} onRemove={remove} />
          )}
        </div>
      </article>

      {!isDraft && (
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
      )}
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
  const href = safeHttpUrl(r.url);
  return (
    <>
      <div className="headblock">
        <dl>
          {r.source && (
            <>
              <dt>Source</dt>
              <dd>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer">
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
          {r.degraded ? (
            <p className="flash-inline" style={{ margin: 0 }}>
              Fix <code>reference.md</code> on disk — the Portal won’t overwrite a file it can’t read.
            </p>
          ) : (
            <button type="button" className="btn" onClick={onEdit}>
              <Pencil /> Uncap the pen
            </button>
          )}
          <ConfirmDialog
            danger
            trigger={
              <button type="button" className="btn btn--danger">
                <Trash /> Remove
              </button>
            }
            title={`Take “${r.title}” off the wall?`}
            body="It moves to Recently removed. Restore it from there anytime — the Portal never deletes the folder."
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
      ) : r.noteHtml ? (
        <div
          className="note"
          dangerouslySetInnerHTML={{ __html: stampLead(r.noteHtml) }}
        />
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
  draft = false,
  onSave,
  onCancel,
}: {
  reference: Reference;
  draft?: boolean;
  onSave: (edits: ReferenceEdits) => Promise<void>;
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
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setErr(null);
    setSaving(true);
    void onSave({
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
    })
      .catch((error: unknown) => {
        setErr(writeErrorMessage(error));
      })
      .finally(() => {
        setSaving(false);
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
            placeholder={
              draft
                ? "the folder is named from this"
                : "de-kebabed from the folder if blank"
            }
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
        <button type="submit" className="btn btn--solid" disabled={saving}>
          {saving
            ? draft
              ? "Pinning…"
              : "Saving…"
            : draft
              ? "Pin it"
              : "Cap the pen — save"}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <span className="dirty">{dirty ? "unsaved changes" : "no changes"}</span>
      </div>
      {err && (
        <p className="flash-inline" role="alert">
          {err}
        </p>
      )}
      <p className="synthetic-note" style={{ marginTop: "1rem", borderTop: 0 }}>
        {draft
          ? "Nothing is written to disk until you pin it — a half-filled piece is fine."
          : "A half-filled reference saves fine — nothing here is required."}
      </p>
    </form>
  );
}

function stampLead(html: string): string {
  return html.replace(/<p>/, '<p class="lead">');
}

function ratingWord(r: number, sentiment: "positive" | "negative"): string {
  if (sentiment === "negative") {
    return r === 3 ? "never do this" : r === 2 ? "worth avoiding" : "noted";
  }
  return r === 3 ? "return to this" : r === 2 ? "worth copying" : "noted";
}
