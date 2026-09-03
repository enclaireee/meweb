import Image from "next/image";

/**
 * Every image on the site goes through here. Until the real documentation
 * photos exist, a Frame with no `src` renders a placeholder that names the
 * exact file it wants — so filling the site in later is a drag-and-drop job,
 * not a layout job. Delete nothing when the images arrive; just add `src`.
 */
export function Frame({
  src,
  alt,
  ratio,
  want,
  priority,
  transitionName,
  sizes = "100vw",
  className = "",
}: {
  src?: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "4/3". Omit when the caller sets an explicit
   *  height instead (the full-bleed hero does). Drives the placeholder too. */
  ratio?: string;
  /** Path hint shown on the placeholder, e.g. "work/refocus/cover.jpg". */
  want?: string;
  priority?: boolean;
  /** Shared-element name for the index → case-study morph. */
  transitionName?: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      style={{ aspectRatio: ratio, viewTransitionName: transitionName }}
      /* Placeholders sit lighter than a real image would, so compositions
         that depend on an image's edge — the hero slab overlapping it — stay
         legible before the photographs land. Harmless once src is set. */
      className={`relative overflow-hidden ${src ? "bg-raised" : "bg-placeholder"} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <Placeholder want={want} ratio={ratio} alt={alt} />
      )}
    </div>
  );
}

function Placeholder({
  want,
  ratio,
  alt,
}: {
  want?: string;
  ratio?: string;
  alt: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col gap-1 p-4 sm:p-5">
      {/* faint diagonal so an empty slot never reads as a styling mistake */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--ink) 0 1px, transparent 1px 14px)",
        }}
      />
      <div className="relative">
        {/* "Image pending" and the wanted path are notes to the author, not
            content. Unhidden they leaked into the accessible name of every
            card link — a keyboard pass read "Image pending, public/work/…"
            before it reached the project title. The alt text stays exposed,
            because that is the thing standing in for the picture. */}
        <p aria-hidden className="meta text-faint">
          Image pending
        </p>
        <p className="mt-1 text-small text-muted">{alt}</p>
        {want && (
          <p aria-hidden className="meta mt-1 text-faint">
            public/{want}
            {ratio ? ` — ${ratio.replace("/", ":")}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
