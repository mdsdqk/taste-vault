import { useCallback, useEffect, useRef, useState } from "react";
import {
  addReferenceImages,
  imageFilename,
  removeReferenceImage,
  setReferenceCover,
} from "@/lib/api";
import { flash, writeErrorMessage } from "@/lib/flash";
import type { Reference } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { Plus } from "./icons";

const ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml,.png,.jpg,.jpeg,.webp,.gif,.avif,.svg";

const IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

function isImageFile(file: File): boolean {
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  return IMAGE_EXT.has(ext) || file.type.startsWith("image/");
}

function collectImages(list: FileList | File[] | DataTransferItemList): File[] {
  const out: File[] = [];
  if (list instanceof DataTransferItemList) {
    for (const item of list) {
      if (item.kind !== "file") continue;
      const file = item.getAsFile();
      if (file && isImageFile(file)) out.push(file);
    }
    return out;
  }
  for (const file of Array.from(list)) {
    if (isImageFile(file)) out.push(file);
  }
  return out;
}

function hasFiles(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes("Files");
}

/**
 * The detail-view plates: hung screenshots, plus a drop target so Evidence
 * can be added without leaving the Portal. On a saved Reference, drop writes
 * through immediately. On a new pin, files stay in memory until submit.
 */
export function PlateStage({
  slug,
  title,
  images,
  cover,
  editing,
  onUpdate,
  local,
}: {
  slug: string;
  title: string;
  images: string[];
  cover: string | null;
  editing: boolean;
  onUpdate: (ref: Reference) => void;
  local?: {
    onAdd: (files: File[]) => void;
    onRemove: (src: string) => void;
    onCover: (src: string) => void;
  };
}) {
  const [over, setOver] = useState(false);
  const [hanging, setHanging] = useState(false);
  const depth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hang = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        flash("no images in that drop — png, webp, jpg, gif, avif, or svg");
        return;
      }
      if (local) {
        local.onAdd(files);
        return;
      }
      setHanging(true);
      try {
        onUpdate(await addReferenceImages(slug, files));
      } catch (err) {
        flash(writeErrorMessage(err));
      } finally {
        setHanging(false);
      }
    },
    [local, onUpdate, slug],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent): void => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      if (!e.clipboardData) return;
      const files = collectImages(e.clipboardData.files);
      if (files.length === 0) {
        const fromItems = collectImages(e.clipboardData.items);
        if (fromItems.length === 0) return;
        e.preventDefault();
        void hang(fromItems);
        return;
      }
      e.preventDefault();
      void hang(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [hang]);

  const resetOver = (): void => {
    depth.current = 0;
    setOver(false);
  };

  const onDragEnter = (e: React.DragEvent): void => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth.current += 1;
    setOver(true);
  };

  const onDragLeave = (e: React.DragEvent): void => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth.current -= 1;
    if (depth.current <= 0) resetOver();
  };

  const onDragOver = (e: React.DragEvent): void => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: React.DragEvent): void => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    resetOver();
    void hang(collectImages(e.dataTransfer.files));
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = collectImages(e.target.files ?? []);
    e.target.value = "";
    void hang(files);
  };

  const openPicker = (): void => {
    inputRef.current?.click();
  };

  const showDrop = editing || images.length === 0;

  return (
    <div className="detail__stage">
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={ACCEPT}
        multiple
        disabled={hanging}
        tabIndex={-1}
        aria-label="Choose screenshot files"
        onChange={onPick}
      />
      <p className="plate-hint">
        {hanging ? (
          "Hanging…"
        ) : (
          <>
            {images.length === 0
              ? "Paste or drop a screenshot — or "
              : editing
                ? "Drop another onto the plates — or "
                : "Drop another screenshot onto the plates — or "}
            <button
              type="button"
              className="plate-hint__choose"
              onClick={openPicker}
            >
              choose files
            </button>{
              images.length === 0
                ? local
                  ? ". Held until you pin it."
                  : ". It writes to the folder immediately."
                : editing
                  ? local
                    ? ". Held until you pin it."
                    : ". Writes immediately, not on Cap the pen."
                  : "."
            }
          </>
        )}
      </p>

      <div
        className="detail__plates"
        data-over={over ? "1" : undefined}
        data-hanging={hanging ? "1" : undefined}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        aria-busy={hanging}
      >
        {images.map((src, i) => (
          <figure className="plate-slot" key={src}>
            <img
              className="bigplate"
              src={src}
              alt={`Screenshot ${i + 1} of ${images.length}: ${title}`}
            />
            {editing && (
              <PlateActions
                slug={slug}
                src={src}
                isCover={cover === src}
                onUpdate={onUpdate}
                local={local}
              />
            )}
          </figure>
        ))}

        {showDrop && (
          <button
            type="button"
            className="plate-slot plate-slot--drop"
            disabled={hanging}
            onClick={openPicker}
          >
            <div
              className={
                images.length > 0
                  ? "bigplate plate--drop plate--drop-more"
                  : "bigplate plate--drop"
              }
            >
              <Plus />
              <span>
                {hanging
                  ? "Hanging…"
                  : images.length > 0
                    ? "Drop another — or click to choose"
                    : "Drop a screenshot — or click to choose"}
              </span>
            </div>
          </button>
        )}

        {over && (
          <div className="plate-drop-veil" aria-hidden="true">
            Drop to hang
          </div>
        )}
      </div>
    </div>
  );
}

function PlateActions({
  slug,
  src,
  isCover,
  onUpdate,
  local,
}: {
  slug: string;
  src: string;
  isCover: boolean;
  onUpdate: (ref: Reference) => void;
  local?: {
    onAdd: (files: File[]) => void;
    onRemove: (src: string) => void;
    onCover: (src: string) => void;
  };
}) {
  const file = imageFilename(src);
  const [busy, setBusy] = useState(false);

  const run = (fn: () => Promise<Reference>): void => {
    setBusy(true);
    void fn()
      .then(onUpdate)
      .catch((err: unknown) => flash(writeErrorMessage(err)))
      .finally(() => setBusy(false));
  };

  return (
    <figcaption className="plate-actions">
      {isCover ? (
        <span className="cover-mark">Cover</span>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (local) local.onCover(src);
            else run(() => setReferenceCover(slug, file));
          }}
        >
          Use as cover
        </button>
      )}
      {local ? (
        <button type="button" onClick={() => local.onRemove(src)}>
          Take down
        </button>
      ) : (
        <ConfirmDialog
          danger
          trigger={
            <button type="button" disabled={busy}>
              Take down
            </button>
          }
          title="Take this screenshot off the plate?"
          body="It is deleted from the folder. Drop it in again if you change your mind."
          confirmLabel="Take it down"
          onConfirm={() => removeReferenceImage(slug, file).then(onUpdate)}
        />
      )}
    </figcaption>
  );
}
