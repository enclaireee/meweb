import NextLink from "next/link";

type Variant = "solid" | "quiet";

const base =
  "inline-flex items-center gap-2 px-5 py-3 text-small font-medium transition-colors duration-(--dur-micro)";
const variants: Record<Variant, string> = {
  solid: "bg-accent text-accent-ink hover:bg-ink hover:text-ground",
  quiet: "border border-rule text-ink hover:border-accent hover:text-accent",
};

export function Button({
  variant = "solid",
  href,
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return /^https?:|^mailto:/.test(href) ? (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    ) : (
      <NextLink href={href} className={cls}>
        {children}
      </NextLink>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
