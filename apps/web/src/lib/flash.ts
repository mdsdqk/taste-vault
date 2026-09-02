type Listener = (msg: string | null) => void;

const listeners = new Set<Listener>();

/** Show a write/network failure in the Portal shell. */
export function flash(msg: string): void {
  for (const fn of listeners) fn(msg);
}

export function subscribeFlash(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function writeErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  return "That didn’t write to disk.";
}
