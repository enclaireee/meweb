"use client";

import { useState } from "react";
import { profile } from "@content/meta/profile";

/** The contact headline: the email address itself, click to copy. */
export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="group block max-w-full text-left"
      onClick={async () => {
        await navigator.clipboard.writeText(profile.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      <span className="block break-all font-mono text-h font-medium text-fg transition-colors dur-fast group-hover:text-accent sm:text-[length:var(--text-display)] sm:leading-[var(--text-display--line-height)] sm:tracking-[var(--text-display--letter-spacing)]">
        {profile.email}
      </span>
      <span className="label mt-s2 block text-fg-muted" aria-live="polite">
        {copied ? "▪ COPIED TO CLIPBOARD" : "CLICK TO COPY"}
      </span>
    </button>
  );
}
