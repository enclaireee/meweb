import NextLink from "next/link";

/** Inline text link: accent underline, ink text. */
export function Link({
  href,
  external,
  className = "",
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const isExternal = external ?? /^https?:/.test(href);
  const cls = `text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-(--dur-micro) hover:text-accent ${className}`;
  if (isExternal) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} className={cls}>
      {children}
    </NextLink>
  );
}
