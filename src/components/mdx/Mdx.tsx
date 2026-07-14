import { MDXRemote } from "next-mdx-remote/rsc";
import { CodeBlock } from "./CodeBlock";
import { Figure, Callout, Metrics, Compare, Video, Embed } from "./blocks";
import { FeedbackLoop } from "./FeedbackLoop";

/** Fenced ``` blocks → Shiki. */
function Pre(props: React.HTMLAttributes<HTMLPreElement>) {
  const child = props.children as React.ReactElement<{
    className?: string;
    children?: string;
  }>;
  const lang = child?.props?.className?.replace("language-", "") ?? "text";
  return <CodeBlock code={String(child?.props?.children ?? "")} lang={lang} />;
}

const components = {
  pre: Pre,
  Figure,
  Callout,
  Metrics,
  Compare,
  Video,
  Embed,
  FeedbackLoop,
};

/** Render an MDX body from the content registry. Wrap in <Prose> for styling. */
export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
