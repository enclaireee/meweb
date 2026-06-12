import { placeholders } from "@/content/placeholders";

interface PlaceholderProps {
  id: keyof typeof placeholders | (string & {});
  className?: string;
}

/**
 * Stand-in for a real image, drawn in the schematic language: hairline
 * frame, corner ticks, diagonal construction lines, and the slot's spec as
 * a measurement annotation. Swap for a real <Image> once assets arrive —
 * every slot is documented in PLACEHOLDERS.md.
 */
export function Placeholder({ id, className }: PlaceholderProps) {
  const spec = placeholders[id];
  const label = spec ? `${spec.id} — ${spec.width}×${spec.height} / ${spec.ratio}` : id;

  return (
    <div
      role="img"
      aria-label={spec ? `Placeholder image: ${spec.purpose}` : `Placeholder image: ${id}`}
      className={`relative h-full w-full overflow-hidden border border-border bg-surface ${className ?? ""}`}
    >
      {/* corner ticks */}
      <span aria-hidden="true" className="absolute left-2 top-2 h-3 w-3 border-l border-t border-muted" />
      <span aria-hidden="true" className="absolute right-2 top-2 h-3 w-3 border-r border-t border-muted" />
      <span aria-hidden="true" className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-muted" />
      <span aria-hidden="true" className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-muted" />

      <span className="annot absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background px-2 py-1 text-muted">
        {label}
      </span>
    </div>
  );
}
