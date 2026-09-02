import { useEffect, useState } from "react";
import { subscribeFlash } from "@/lib/flash";

/** Shell-level write-error banner. Dismissed by the user or a later success. */
export function Flash() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => subscribeFlash(setMsg), []);

  if (!msg) return null;

  return (
    <div className="flash" role="alert">
      <p>{msg}</p>
      <button type="button" className="btn" onClick={() => setMsg(null)}>
        Dismiss
      </button>
    </div>
  );
}
