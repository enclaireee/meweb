"use client";

import { useRef } from "react";

/**
 * Native <dialog>, restyled to tokens. Focus trapping, Esc-to-close, and
 * the top-layer come free from the platform.
 */
export function Dialog({
  trigger,
  tag,
  children,
}: {
  trigger: React.ReactNode;
  tag: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <span onClick={() => ref.current?.showModal()}>{trigger}</span>
      <dialog
        ref={ref}
        closedby="any"
        className="m-auto w-[min(36rem,calc(100%-2*var(--spacing-gutter)))] border border-border bg-bg-subtle text-fg backdrop:bg-bg/80"
      >
        <header className="flex items-center justify-between border-b border-border px-s3 py-s2">
          <span className="label text-fg-muted">{tag}</span>
          <button
            className="label text-fg-muted transition-colors dur-fast hover:text-accent"
            onClick={() => ref.current?.close()}
          >
            ESC / CLOSE ✕
          </button>
        </header>
        <div className="p-s4">{children}</div>
      </dialog>
    </>
  );
}
