import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

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
  onConfirm: () => void;
  danger?: boolean;
}) {
  return (
    <Dialog.Root>
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
          <div className="dialog-actions">
            <Dialog.Close asChild>
              <button type="button" className="btn">
                Cancel
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                type="button"
                className={danger ? "btn btn--danger" : "btn btn--solid"}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
