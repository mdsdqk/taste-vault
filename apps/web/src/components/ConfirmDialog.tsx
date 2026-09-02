import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { writeErrorMessage } from "@/lib/flash";

export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel,
  onConfirm,
  danger = false,
}: {
  trigger: ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) setErr(null);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title asChild>
            <h3>{title}</h3>
          </Dialog.Title>
          <Dialog.Description asChild>
            <p>{body}</p>
          </Dialog.Description>
          {err && (
            <p className="flash-inline" role="alert">
              {err}
            </p>
          )}
          <div className="dialog-actions">
            <button
              type="button"
              className="btn"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={danger ? "btn btn--danger" : "btn btn--solid"}
              disabled={pending}
              onClick={() => {
                setPending(true);
                setErr(null);
                void Promise.resolve(onConfirm())
                  .then(() => {
                    setOpen(false);
                  })
                  .catch((e: unknown) => {
                    setErr(writeErrorMessage(e));
                  })
                  .finally(() => {
                    setPending(false);
                  });
              }}
            >
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
