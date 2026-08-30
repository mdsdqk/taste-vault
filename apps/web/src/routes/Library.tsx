import { useMemo, useState } from "react";
import { useCreateReference, useVault } from "@/lib/hooks";
import { aggregateTags, applyQuery, EMPTY_QUERY, queryIsEmpty } from "@/lib/query";
import type { LibraryQuery } from "@/lib/types";
import { Band } from "@/components/Band";
import { TagRow } from "@/components/TagRow";
import { PieceCard } from "@/components/PieceCard";
import { EmptyGallery, FilteredEmpty, LoadingWall } from "@/components/states";

export function Library() {
  const { references, loading } = useVault();
  const create = useCreateReference();
  const [query, setQuery] = useState<LibraryQuery>(EMPTY_QUERY);

  const tags = useMemo(() => aggregateTags(references), [references]);
  const shown = useMemo(() => applyQuery(references, query), [references, query]);

  const patch = (p: Partial<LibraryQuery>) => setQuery((q) => ({ ...q, ...p }));
  const toggleTag = (tag: string) =>
    patch({
      tags: query.tags.includes(tag)
        ? query.tags.filter((t) => t !== tag)
        : [...query.tags, tag],
    });

  const vaultEmpty = !loading && references.length === 0;

  return (
    <>
      <header className="masthead">
        <h1 className="vaultname">
          Taste<b>Vault</b>
        </h1>
        <p className="standfirst">
          A wall of things you’ve judged — hung by how much you mean it
        </p>
      </header>

      {!vaultEmpty && (
        <>
          <Band query={query} onQuery={patch} />
          <TagRow tags={tags} active={query.tags} onToggle={toggleTag} />
        </>
      )}

      {loading ? (
        <LoadingWall />
      ) : vaultEmpty ? (
        <EmptyGallery onCreate={create} />
      ) : shown.length === 0 ? (
        <FilteredEmpty onReset={() => setQuery(EMPTY_QUERY)} />
      ) : (
        <div className="wall">
          {shown.map((r) => (
            <PieceCard key={r.slug} reference={r} />
          ))}
        </div>
      )}

      {!vaultEmpty && (
        <p className="synthetic-note">
          {shown.length} of {references.length} references
          {!queryIsEmpty(query) ? " shown" : ""}. Contents are illustrative —
          TasteVault has no real captures yet; screenshots are placeholders.
        </p>
      )}
    </>
  );
}
