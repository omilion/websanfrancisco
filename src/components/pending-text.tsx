import { PenLine } from "lucide-react";

/** Marca visible de un texto que falta confirmar con el cliente. */
export function PendingText({ children }: { children: string }) {
  return (
    <p className="flex gap-2 rounded-md border-2 border-dashed border-brand-orange/60 bg-brand-orange/5 px-4 py-3 text-sm text-ink-muted">
      <PenLine className="mt-0.5 size-4 shrink-0 text-brand-orange-dark" aria-hidden />
      <span>
        <strong className="text-brand-orange-dark">Texto pendiente:</strong> {children}
      </span>
    </p>
  );
}
