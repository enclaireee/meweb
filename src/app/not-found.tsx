import { Link } from "next-view-transitions";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";

/** Signal lost — small, characterful, on-brand. */
export default function NotFound() {
  return (
    <main className="bg-grid-sheet flex min-h-svh flex-col items-center justify-center px-gutter text-center">
      <p className="annot text-muted">no signal on this frequency</p>
      <Magnetic strength={0.15}>
        <p className="font-display text-hero mt-4 italic" aria-hidden="true">
          404
        </p>
      </Magnetic>
      <h1 className="sr-only">Page not found</h1>
      <Reveal delay={0.2}>
        <p className="mt-4 max-w-sm text-lead text-muted">
          Whatever was broadcast here has drifted out of range.
        </p>
        <Link
          href="/"
          data-cursor="home"
          className="annot mt-10 inline-block border border-border px-6 py-3 text-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
        >
          ← back to the index
        </Link>
      </Reveal>
    </main>
  );
}
