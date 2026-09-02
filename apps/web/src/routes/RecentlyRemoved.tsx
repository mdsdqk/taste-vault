import { Link } from "react-router-dom";
import { restoreReference } from "@/lib/api";
import { flash, writeErrorMessage } from "@/lib/flash";
import { useVault } from "@/lib/hooks";
import { formatDate } from "@/components/PieceCard";
import { KindDot } from "@/components/marks";
import { ArrowLeft, Restore } from "@/components/icons";

export function RecentlyRemoved() {
  const { removed } = useVault();

  const restore = async (slug: string) => {
    try {
      await restoreReference(slug);
    } catch (err) {
      flash(writeErrorMessage(err));
    }
  };

  return (
    <>
      <Link to="/" className="backlink">
        <ArrowLeft /> back to the wall
      </Link>

      <header className="masthead" style={{ paddingBottom: "0.75rem" }}>
        <h1 className="vaultname" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)" }}>
          Recently removed
        </h1>
        <p className="standfirst">Taken off the wall — restore anytime</p>
      </header>

      {removed.length === 0 ? (
        <div className="state">
          <h2>Nothing’s been removed.</h2>
          <p>
            When you take a piece off the wall it waits here until you restore
            it. The Portal never deletes a folder; taking one off disk is a
            matter for the filesystem.
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
                  onClick={() => void restore(r.slug)}
                >
                  <Restore /> Restore
                </button>
              </div>
            </div>
          ))}
          <p className="page-foot">
            Restore anytime. Pieces stay here until you put them back on the
            wall — or delete the folder by hand from <code>references/.trash/</code>.
          </p>
        </div>
      )}
    </>
  );
}
