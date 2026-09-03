/**
 * Identity and original site prose. Contact channels live in ./contact.ts,
 * nav and footer config in ./site.ts, and anything dated (jobs, degrees) is a
 * file in content/experience/ or content/education/.
 * Safe to import from client components — plain data, no fs.
 */
export const profile = {
  name: "Muhammad Fatih Zamzami",
  role: "Electrical engineering student",
  location: "Depok, Indonesia",
  /** Drop the file at public/about/portrait.jpg and set this. */
  portrait: undefined as string | undefined,

  /** The opening, in three descending beats. Spec v4 §3.1. */
  greeting: "Hi, I'm",
  greetingName: "Fatih.",
  /** The second beat — near-verbatim from the About copy below, because that
   *  was already the sharpest sentence on the site. */
  heroBeat: "I work where the hardware and the software are the same problem.",
  /** PARKED, not dead: the v3.1 art-director pass cut this third hero line
   *  because it restated the About section almost verbatim in the loudest
   *  position on the page. The copy is kept so restoring it is a paste rather
   *  than a rewrite — render it back under heroBeat in page.tsx. */
  heroSupport:
    "Electrical engineering at Universitas Indonesia. Lately that has meant a game you play with your attention, a monitoring stack for gas pipeline equipment, and a solar lamp that grades its own efficiency.",

  about: [
    "I'm an electrical engineering undergrad at Universitas Indonesia, two years in. The part of the field I actually like is control: you measure something, you decide what to do about it, you do it, and then you measure again to find out how wrong you were.",
    "In practice that has meant fairly different things. One semester I was pulling an attention signal out of a NeuroSky headset and handing it to a game engine. The next I was writing a YAML catalogue that provisions a Zabbix server for gas infrastructure. In between there was a solar lamp and a competition website that had to survive registration day.",
    "I also run the research and development division of the electrical engineering student association here. Same work, much worse instrumentation. You can't put a probe on why a team missed a deadline.",
    "I'm looking for work where the hardware and the software are the same problem. If that's what you have, my address is at the bottom of every page.",
  ],


  languages: [
    { label: "Bahasa Indonesia", level: "Native" },
    { label: "English", level: "Professional" },
  ],
} as const;


export const awards = [
  {
    title: "Best BPH (Board of Officers), Research & Development Division",
    issuer: "Ikatan Mahasiswa Elektro FTUI",
    year: "2026",
  },
  {
    title: "1st Runner-Up, ProtoTech Competition — The Sandbox 2.0",
    issuer: "IEEE ITB Student Branch",
    year: "2025",
  },
  {
    title: "Best Presentation, ProtoTech Competition — The Sandbox 2.0",
    issuer: "IEEE ITB Student Branch",
    year: "2025",
  },
] as const;
