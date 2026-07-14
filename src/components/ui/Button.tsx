import { Link as NextLink } from "next-view-transitions";

type Variant = "solid" | "outline";

const base =
  "label inline-flex items-center gap-s1 border px-s3 py-s2 transition-colors dur-fast ease-out-quart";
const variants: Record<Variant, string> = {
  // signature: inverse-video flip on hover
  solid: "border-accent bg-accent text-accent-fg hover:bg-transparent hover:text-accent",
  outline: "border-border text-fg hover:border-accent hover:text-accent",
};

export function Button({
  variant = "solid",
  href,
  loading,
  disabled,
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${variants[variant]} ${
    disabled || loading ? "pointer-events-none opacity-40" : ""
  } ${className}`;
  const body = (
    <>
      {children}
      {loading && <span className="animate-pulse" aria-label="loading">█</span>}
    </>
  );
  if (href) {
    return (
      <NextLink href={href} className={cls} aria-disabled={disabled || loading}>
        {body}
      </NextLink>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {body}
    </button>
  );
}
