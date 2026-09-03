/* MDX building blocks for case studies. Figure is the important one: the
   case pages are photo essays, so most of the page is these. */
import { Frame } from "@/components/ui/Frame";

/**
 * A documentation photo and what it shows. `src` is optional — without it the
 * frame renders a placeholder naming the file it wants, so the essay can be
 * written and laid out before the photos are off the phone.
 *
 * `bleed` widens the figure past the reading column on desktop; `pair` halves
 * it so two can sit side by side.
 */
export function Figure({
  src,
  alt,
  caption,
  ratio = "16/9",
  want,
  bleed,
}: {
  src?: string;
  alt: string;
  caption: string;
  ratio?: string;
  want?: string;
  bleed?: boolean;
}) {
  return (
    <figure className={bleed ? "md:w-[calc(100%+16rem)]" : undefined}>
      <Frame
        src={src}
        alt={alt}
        want={want}
        ratio={ratio}
        sizes={bleed ? "(min-width: 768px) 62vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
      />
      <figcaption className="mt-3 max-w-[52ch] text-small text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

/** Two photos that belong to the same moment. */
export function Pair({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 md:-mx-[14%] md:w-[128%]">{children}</div>;
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="border-l-2 border-accent bg-raised px-5 py-4 text-small">
      {children}
    </aside>
  );
}

/** Real numbers, stated plainly. Use it or leave it out — never round them up. */
export function Metrics({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-rule py-6 sm:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k}>
          <dd className="text-lead">{v}</dd>
          <dt className="meta mt-1 text-faint">{k}</dt>
        </div>
      ))}
    </dl>
  );
}

export function Video({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="md:w-[calc(100%+16rem)]">
      {/* ponytail: native controls; a custom player earns nothing here */}
      <video src={src} controls playsInline className="w-full bg-raised" />
      <figcaption className="mt-3 max-w-[52ch] text-small text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
