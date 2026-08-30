import { Link } from "react-router-dom";
import { purgeReference, restoreReference } from "@/lib/api";
import { useVault } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate } from "@/components/PieceCard";
import { KindDot } from "@/components/marks";
import { ArrowLeft, Restore, Trash } from "@/components/icons";

export function RecentlyRemoved() {
  const { removed } = useVault();

  return (
    <>
      <Link to="/" className="backlink">
        <ArrowLeft /> back to the wall
      </Link>

      <header className="masthead" style={{ paddingBottom: "0.75rem" }}>
        <h1 className="vaultname" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)" }}>
          Recently removed
        </h1>
        <p className="standfirst">
          Taken off the wall — restore, or delete for good
        </p>
      </header>

      {removed.length === 0 ? (
        <div className="state">
          <h2>Nothing’s been removed.</h2>
          <p>
            When you take a piece off the wall it waits here until you restore it
            or delete it for good.
          </p>
        </div>
      ) : (
        <div className="removed-panel">
          {removed.map((r) => (
            <div className="removed-row" key={r.slug}>
              {r.cover ? (
                <img src={r.cover} alt="" />
              ) : (
                <span className="thumb-empty" aria-hidden="true" />
              )}
              <div>
                <p className="title">{r.title}</p>
                <p className="meta">
                  {r.source && <span>{r.source}</span>}
                  <KindDot kind={r.kind} />
                  <span className="dot-sep">{formatDate(r.saved)}</span>
                </p>
              </div>
              <div className="removed-row__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => restoreReference(r.slug)}
                >
                  <Restore /> Restore
                </button>
                <ConfirmDialog
                  danger
                  trigger={
                    <button type="button" className="btn btn--danger">
                      <Trash /> Delete for good
                    </button>
                  }
                  title={`Delete “${r.title}” for good?`}
                  body="This removes the folder from disk (to your system trash). It won’t come back here."
                  confirmLabel="Delete for good"
                  onConfirm={() => purgeReference(r.slug)}
                />
              </div>
            </div>
          ))}
          <p className="page-foot">
            Restore anytime. “Delete for good” sends the folder to your system
            trash — the Portal never erases it silently.
          </p>
        </div>
      )}
    </>
  );
}
