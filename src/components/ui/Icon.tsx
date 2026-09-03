import type { IconType } from "react-icons";
import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLine,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa6";
import type { ContactChannel } from "@content/meta/contact";

/**
 * The only icons on the site. `satisfies` makes this map exhaustive: give a
 * channel a new `icon` key in content/meta/contact.ts and the build fails here
 * until the glyph exists, rather than rendering a hole.
 *
 * One family only (Font Awesome 6). Mixing an outline set with solid brand
 * marks reads as two icon systems at 1em, which is worse than having none.
 *
 * Always decorative — every icon on this site sits beside its own label, so it
 * is aria-hidden and never carries the accessible name.
 */
const glyphs = {
  mail: FaEnvelope,
  whatsapp: FaWhatsapp,
  line: FaLine,
  github: FaGithub,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
} satisfies Record<ContactChannel["icon"], IconType>;

export function Icon({
  name,
  className = "",
}: {
  name: ContactChannel["icon"];
  className?: string;
}) {
  const Glyph = glyphs[name];
  return <Glyph aria-hidden focusable="false" className={`shrink-0 ${className}`} />;
}
