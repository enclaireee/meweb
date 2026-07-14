import { codeToHtml } from "shiki";

/** Shiki-highlighted code block, dual theme via CSS vars (see globals.css). */
export async function CodeBlock({
  code,
  lang = "text",
}: {
  code: string;
  lang?: string;
}) {
  const html = await codeToHtml(code.trimEnd(), {
    lang,
    themes: { dark: "github-dark-default", light: "github-light-default" },
    defaultColor: false,
  });
  return (
    <div className="code-block border border-border bg-bg-subtle">
      <div className="flex items-center justify-between border-b border-border-faint px-s3 py-s1">
        <span className="label text-fg-muted">SRC/{lang.toUpperCase()}</span>
      </div>
      {/* shiki output: <pre class="shiki"><code>… */}
      <div
        className="overflow-x-auto p-s3 text-body-s"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
