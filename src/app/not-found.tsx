import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] flex-col items-start justify-center gap-s4">
      <p className="label text-fail">ERR/404 — CHANNEL NOT FOUND</p>
      <p className="font-mono text-display font-medium">
        NO SIGNAL<span className="animate-pulse text-accent">█</span>
      </p>
      <p className="max-w-[40ch] text-body-s text-fg-muted">
        The address resolves to nothing on this console. The process may have
        been renamed, retired, or never provisioned.
      </p>
      <Button href="/" variant="outline">RETURN TO INDEX →</Button>
    </div>
  );
}
