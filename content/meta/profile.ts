/**
 * Profile facts (name, contact, socials) come from the CV; prose is original
 * site copy. Safe to import from client components — plain data, no fs.
 */
export const profile = {
  name: "Muhammad Fatih Zamzami",
  shortName: "Fatih",
  role: "Electrical engineering student & engineer",
  location: "Depok, Indonesia",
  email: "muhfatihzamzami@gmail.com",

  heroLine:
    "I build systems that listen — to brainwaves, to sunlight, to scroll position.",
  heroKicker: "Electrical engineering, Universitas Indonesia",
  statement:
    "Engineering is the craft of feedback — sense the world, decide, respond. I practice it everywhere: in circuits, in software, in teams.",

  about: [
    "Most engineers pick a side of the stack. I keep refusing to. One semester I'm decoding EEG signals into game difficulty; the next I'm shipping a competition platform used by participants across Indonesia; in between I'm soldering a solar rig that reports its own efficiency.",
    "I'm an electrical engineering undergraduate at Universitas Indonesia, drawn to control systems — the discipline of making things respond. That instinct carries through everything I build, whether the feedback loop runs through a microcontroller or a UI.",
    "Outside the lab I lead the research & development division of my faculty's student association, where the problems are people and processes instead of circuits — and the debugging is harder.",
  ],

  socials: [
    { label: "GitHub", url: "https://github.com/enclaireee", handle: "enclaireee" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/fatihzamzami", handle: "fatihzamzami" },
    { label: "Instagram", url: "https://www.instagram.com/fthzami", handle: "fthzami" },
  ],

  languages: [
    { label: "Bahasa Indonesia", level: "Native" },
    { label: "English", level: "Professional" },
  ],
} as const;

export const education = [
  {
    school: "Universitas Indonesia",
    program: "S1 Electrical Engineering",
    start: "Aug 2024",
    end: null,
    note: "Coursework: circuit analysis, signals & systems, power systems, numerical methods, advanced programming & algorithms.",
  },
  {
    school: "SMAIT Nurul Fikri Depok",
    program: "Science major (MIPA)",
    start: "Aug 2021",
    end: "May 2024",
    note: "Mathematics and physics focus.",
  },
] as const;

export const awards = [
  {
    title: "1st Runner-Up, ProtoTech Competition — The Sandbox 2.0",
    issuer: "IEEE ITB Student Branch",
    year: "2025",
  },
  {
    title: "Best BPH, Research & Development Division",
    issuer: "Ikatan Mahasiswa Elektro FTUI",
    year: "2026",
  },
] as const;
