/**
 * Reachable channels. Adding one is a single object in this array — the
 * footer, the contact block and the JSON-LD `sameAs` all read from here.
 *
 * `display` is what the page prints; `copy` is what the copy button puts on
 * the clipboard. They differ on purpose for WhatsApp: the phone number is
 * never rendered as text anywhere on this site, because a raw number on a
 * public page is scraped within days. The wa.me link is the whole interface.
 */
export type ContactChannel = {
  id: string;
  label: string;
  display: string;
  copy: string;
  href: string;
  /** rel="me" — this URL is an identity of mine, not just a link. */
  identity: boolean;
  icon: "mail" | "whatsapp" | "line" | "github" | "linkedin" | "instagram";
  visible: boolean;
};

export const channels: ContactChannel[] = [
  {
    id: "email",
    label: "Email",
    display: "muhfatihzamzami@gmail.com",
    copy: "muhfatihzamzami@gmail.com",
    href: "mailto:muhfatihzamzami@gmail.com",
    identity: false,
    icon: "mail",
    visible: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    display: "Message me on WhatsApp",
    copy: "https://wa.me/6281380781970",
    href: "https://wa.me/6281380781970",
    identity: false,
    icon: "whatsapp",
    visible: true,
  },
  {
    // The line.me deep link only resolves on a device with LINE installed, so
    // the ID itself has to be copyable or desktop visitors hit a dead end.
    id: "line",
    label: "LINE",
    display: "haiinifatih",
    copy: "haiinifatih",
    href: "https://line.me/ti/p/~haiinifatih",
    identity: false,
    icon: "line",
    visible: true,
  },
  {
    id: "github",
    label: "GitHub",
    display: "enclaireee",
    copy: "https://github.com/enclaireee",
    href: "https://github.com/enclaireee",
    identity: true,
    icon: "github",
    visible: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    display: "fatihzamzami",
    copy: "https://www.linkedin.com/in/fatihzamzami",
    href: "https://www.linkedin.com/in/fatihzamzami",
    identity: true,
    icon: "linkedin",
    visible: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    display: "fthzami",
    copy: "https://www.instagram.com/fthzami",
    href: "https://www.instagram.com/fthzami",
    identity: true,
    icon: "instagram",
    visible: true,
  },
];

export const visibleChannels = channels.filter((c) => c.visible);
