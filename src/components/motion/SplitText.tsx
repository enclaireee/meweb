import { motion as m } from "@content/meta/motion";

/**
 * Per-character mask reveal. Spec v4 §3.2.
 *
 * A **server component**: the string is known at build time, so the spans and
 * their per-character delays are rendered on the server. No layout runs on the
 * client, nothing reflows, and the stagger costs zero JavaScript — CSS does it
 * with transition-delay.
 *
 * Visible by default. The hidden start state only applies under
 * `html[data-motion]`, which the inline script in layout.tsx sets when
 * JavaScript is available and reduced motion is off. With JS disabled the text
 * simply sits there, fully legible — the animation is the enhancement, never
 * the thing standing between a reader and the words.
 *
 * A screen reader gets the whole string once from a visually-hidden copy, and
 * the animated spans are hidden from it. `aria-label` on a bare span is
 * prohibited ARIA — it needs a role to be honoured — and Lighthouse caught
 * that at 96; a real hidden string is the correct construction and costs the
 * same. The text stays selectable because the spans are inline.
 */
export function SplitText({
  text,
  className = "",
  delayMs = 0,
  accentFinal = false,
}: {
  text: string;
  className?: string;
  /** Offset for a second line, so beats sequence rather than fire together. */
  delayMs?: number;
  /** The last glyph lands in the accent colour and cools to ink. Used once. */
  accentFinal?: boolean;
}) {
  const chars = [...text];
  return (
    <span className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {chars.map((char, i) => (
          <span key={`${char}-${i}`} className="split-mask">
            <span
              className={`split-char ${
                accentFinal && i === chars.length - 1 ? "split-final" : ""
              }`}
              style={{
                transitionDelay: `${delayMs + i * m.charStaggerMs}ms`,
                // The colour cools only after this character has settled, so
                // the accent marks the end of the line rather than riding along
                // with it.
                ...(accentFinal && i === chars.length - 1
                  ? {
                      transitionDelay: `${delayMs + i * m.charStaggerMs}ms, ${
                        delayMs + i * m.charStaggerMs
                      }ms, ${delayMs + i * m.charStaggerMs + m.charRevealMs + 120}ms`,
                    }
                  : {}),
              }}
            >
              {/* A space inside an inline-block collapses; NBSP holds the gap. */}
              {char === " " ? "\u00a0" : char}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
