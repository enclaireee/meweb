"use client";

import { useState } from "react";
import type { ContactChannel } from "@content/meta/contact";
import { Icon } from "@/components/ui/Icon";

/**
 * One channel, rendered two ways. `primary` is the pressable slab used for the
 * headline channel; everything else is a row.
 *
 * Every channel is a link AND a copy button, because half of these fail
 * silently otherwise: the LINE deep link is dead on desktop, and mailto: is
 * dead for anyone using webmail. The copy button is the fallback that always
 * works, so it gets a real accessible name and a confirmation, not a toast.
 */
export function Channel({
  channel,
  primary = false,
}: {
  channel: ContactChannel;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(channel.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is permission-gated and can simply refuse. The link beside
      // this button still works, so failing quietly is the honest outcome.
    }
  }

  const external = channel.href.startsWith("http");
  const rel = [external && "noopener noreferrer", channel.identity && "me"]
    .filter(Boolean)
    .join(" ");

  if (primary) {
    return (
      <div className="surface-rest hover:surface-lift max-w-[34rem] rounded-control">
        <a
          href={channel.href}
          {...(external && { target: "_blank" })}
          {...(rel && { rel })}
          className="block px-6 pt-5 sm:px-8 sm:pt-6"
        >
          <span className="meta flex items-center gap-2 text-faint">
            <Icon name={channel.icon} />
            {channel.label}
          </span>
          {/* Sized to fit the slab rather than break inside the address.
              break-all split it as "…@gma / il.com" at the title step. */}
          <span className="mt-3 block text-[length:clamp(1.375rem,2.5vw,2rem)] leading-tight font-medium">
            {channel.display}
          </span>
        </a>
        <button
          type="button"
          onClick={copy}
          className="meta block w-full px-6 pt-4 pb-5 text-left text-faint transition-colors duration-(--dur-micro) hover:text-accent sm:px-8 sm:pb-6"
        >
          <span aria-live="polite">
            {copied ? "Copied" : `Copy ${channel.label.toLowerCase()}`}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-rule-faint py-4">
      <span className="meta flex w-28 shrink-0 items-center gap-2 text-faint">
        <Icon name={channel.icon} />
        {channel.label}
      </span>
      <a
        href={channel.href}
        {...(external && { target: "_blank" })}
        {...(rel && { rel })}
        className="text-small transition-colors duration-(--dur-micro) hover:text-accent"
      >
        {channel.display}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${channel.label}`}
        className="meta ml-auto shrink-0 text-faint transition-colors duration-(--dur-micro) hover:text-accent"
      >
        {/* Reserved width: "Copy" → "Copied" is a two-character growth on an
            inline control, and unreserved it nudges the row on every click.
            Spec §13.4 — this site's CLS is 0 and stays 0. */}
        <span aria-live="polite" className="inline-block min-w-[6ch] text-right">
          {copied ? "Copied" : "Copy"}
        </span>
      </button>
    </div>
  );
}
