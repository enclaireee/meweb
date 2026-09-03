import { codeToHtml } from "shiki";

/** Shiki-highlighted code block. Dark only. */
export async function CodeBlock({
  code,
  lang = "text",
}: {
  code: string;
  lang?: string;
}) {
  const html = await codeToHtml(code.trimEnd(), {
    lang,
    themes: { dark: "github-dark-default" },
    defaultColor: false,
  });
  return (
    <div className="bg-sunk">
      <p className="meta border-b border-rule-faint px-5 py-2 text-faint">{lang}</p>
      {/* shiki output: <pre class="shiki"><code>… */}
      <div
        className="overflow-x-auto p-5 text-small"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
