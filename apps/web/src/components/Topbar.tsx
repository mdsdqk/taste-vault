import { NavLink } from "react-router-dom";
import { useCreateReference } from "@/lib/hooks";
import { ThemeToggle } from "./ThemeToggle";
import { Plus } from "./icons";

export function Topbar({ removedCount }: { removedCount: number }) {
  const create = useCreateReference();
  return (
    <div className="topbar">
      <nav className="seg" aria-label="Sections">
        <NavLink to="/" end>
          The Wall
        </NavLink>
        <NavLink to="/removed">
          Recently removed{removedCount > 0 ? ` · ${removedCount}` : ""}
        </NavLink>
      </nav>
      <div className="topbar__right">
        <button
          type="button"
          className="btn btn--solid"
          onClick={create}
          title="Pin a reference"
        >
          <Plus /> <span>Pin a reference</span>
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
