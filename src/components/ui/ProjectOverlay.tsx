"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { m, useReducedMotion } from "motion/react";
import { getLenis } from "@/components/motion/SmoothScroll";

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * The case study, opened over the page. Spec v3 §4.
 *
 * Closing is always router.back(): the overlay's existence *is* a history
 * entry, so going back is what removes it, and that is also what restores the
 * scroll position exactly. Calling anything else would leave the URL and the
 * view disagreeing.
 */
export function ProjectOverlay({
  slug,
  titleId,
  children,
}: {
  slug: string;
  titleId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    // Once a smooth scroller owns the scroll position, overflow:hidden alone
    // does not stop it — it keeps interpolating toward its target underneath
    // the overlay and the page is somewhere else when you close.
    getLenis()?.stop();

    // Whatever was focused when this mounted is the thing that opened it — the
    // featured card or the index row, and those are two different elements for
    // the same project. Capture it before moving focus, because querying by
    // slug afterwards would always find the card and send a reader who clicked
    // row 04 back to a tile higher up the page.
    // Must actually be a project link. A programmatic click does not focus an
    // anchor, so activeElement can be <body> — focusing that would strand a
    // keyboard user at the top of the document on close.
    const active = document.activeElement;
    const opener =
      active instanceof HTMLElement && active.hasAttribute("data-project-card")
        ? active
        : null;

    // Move focus into the dialog. Without this a keyboard user is still on the
    // card behind an overlay they cannot see the edges of.
    panel.current?.focus();

    return () => {
      html.style.overflow = previous;
      getLenis()?.start();
      // The opener survives because the page underneath never unmounted — that
      // is what interception buys. On a cold load there is no opener, so fall
      // back to the project's card.
      const fallback = document.querySelector<HTMLElement>(
        `[data-project-card="${slug}"]`,
      );
      (opener ?? fallback)?.focus();
    };
  }, [slug]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      router.back();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    // Focus trap. Twenty lines beats a dependency, and <dialog>'s free trap
    // comes with top-layer promotion, which fights the layout morph.
    const items = Array.from(
      panel.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      onKeyDown={onKeyDown}
    >
      {/* The page stays visible behind, dimmed. Clicking it closes, which is
          what everyone tries first. */}
      <m.button
        type="button"
        aria-label="Close case study"
        onClick={() => router.back()}
        className="fixed inset-0 -z-10 cursor-default bg-sunk"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: reduced ? 0 : 0.32 }}
      />
      <m.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        // The shared element: this box is the card from the index, so it
        // travels rather than fading in.
        layoutId={reduced ? undefined : `card-${slug}`}
        // Inset from the top so the dimmed page stays visible above it: the
        // point of an overlay rather than a navigation is that you can still
        // see where you were. Full width below that, because a case study is
        // long-form and a narrow column would fight the figures.
        className="relative mt-14 min-h-[calc(100%-3.5rem)] bg-base pb-32 outline-none sm:mt-20 sm:min-h-[calc(100%-5rem)]"
      >
        <div className="mx-auto flex max-w-page justify-end px-gutter pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-small text-muted transition-colors duration-(--dur-micro) hover:text-accent"
          >
            Close
          </button>
        </div>
        {children}
      </m.div>
    </div>
  );
}
