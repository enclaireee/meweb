import NextLink from "next/link";

/** Inline text link. Signature hover: inverse video — text becomes a lit segment. */
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
  const cls = `text-accent underline decoration-from-font underline-offset-4 transition-colors dur-fast ease-out-quart hover:bg-accent hover:text-accent-fg hover:no-underline ${className}`;
  if (isExternal) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
        <span aria-hidden>↗</span>
      </a>
    );
  }
  return (
    <NextLink href={href} className={cls}>
      {children}
    </NextLink>
  );
}
