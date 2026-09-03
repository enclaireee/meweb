import { site } from "@content/meta/site";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50svh] max-w-page flex-col items-start justify-center gap-8 px-gutter">
      <h1 className="text-display font-semibold">{site.pages.notFound.title}</h1>
      <p className="max-w-[38ch] text-body text-muted">{site.pages.notFound.lead}</p>
      <Button href="/" variant="quiet">
        {site.pages.notFound.action}
      </Button>
    </div>
  );
}
