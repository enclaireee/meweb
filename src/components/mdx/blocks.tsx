/* Small MDX building blocks for case studies. All token-driven. */
import Image from "next/image";

export function Figure({
  src,
  alt,
  caption,
  width = 1600,
  height = 900,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full border border-border"
      />
      {caption && (
        <figcaption className="label mt-s1 text-fg-muted">FIG — {caption}</figcaption>
      )}
    </figure>
  );
}

export function Callout({
  tag = "NOTE",
  children,
}: {
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="border border-accent/40 border-l-2 border-l-accent bg-bg-subtle p-s3">
      <p className="label text-accent">{tag}</p>
      <div className="mt-s1 text-body-s">{children}</div>
    </aside>
  );
}

export function Metrics({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-px border border-border bg-border-faint sm:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k} className="bg-bg-subtle p-s3">
          <dd className="font-mono text-h font-medium text-accent">{v}</dd>
          <dt className="label mt-s1 text-fg-muted">{k}</dt>
        </div>
      ))}
    </dl>
  );
}

export function Compare({
  before,
  after,
  children,
}: {
  before: string;
  after: string;
  children: [React.ReactNode, React.ReactNode];
}) {
  return (
    <div className="grid gap-s3 sm:grid-cols-2">
      {[before, after].map((tag, i) => (
        <div key={tag} className="border border-border">
          <p className="label border-b border-border px-s3 py-s1 text-fg-muted">{tag}</p>
          <div className="p-s3 text-body-s">{children[i]}</div>
        </div>
      ))}
    </div>
  );
}

export function Video({ src, caption }: { src: string; caption?: string }) {
  return (
    <figure>
      {/* ponytail: native controls; a custom player earns nothing here */}
      <video src={src} controls playsInline className="w-full border border-border" />
      {caption && (
        <figcaption className="label mt-s1 text-fg-muted">VID — {caption}</figcaption>
      )}
    </figure>
  );
}

export function Embed({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      className="aspect-video w-full border border-border"
      allowFullScreen
    />
  );
}
