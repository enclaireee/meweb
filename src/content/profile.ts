import type { Profile } from "./types";

/**
 * Facts (name, role, location, contact, socials) come from the CV and the
 * previous site. All prose is original site copy — the CV is the fact
 * source, not the copy source.
 */
export const profile: Profile = {
  name: "Muhammad Fatih Zamzami",
  shortName: "Fatih",
  role: "Electrical engineering student & engineer",
  location: "Depok, Indonesia",
  email: "muhfatihzamzami@gmail.com",

  // [NEEDS REVIEW] Original hero copy — confirm the framing feels right.
  heroLine: "I build systems that listen — to brainwaves, to sunlight, to scroll position.",
  heroKicker: "Electrical engineering, Universitas Indonesia",

  // [NEEDS REVIEW] Original manifesto line for the pinned about section.
  statement:
    "Engineering is the craft of feedback — sense the world, decide, respond. I practice it everywhere: in circuits, in software, in teams.",

  about: [
    // Original narrative. Facts: EE undergrad at UI, control systems +
    // programming interest, hardware + software experience, leadership roles.
    "Most engineers pick a side of the stack. I keep refusing to. One semester I'm decoding EEG signals into game difficulty; the next I'm shipping a competition platform used by participants across Indonesia; in between I'm soldering a solar rig that reports its own efficiency.",
    "I'm an electrical engineering undergraduate at Universitas Indonesia, drawn to control systems — the discipline of making things respond. That instinct carries through everything I build, whether the feedback loop runs through a microcontroller or a UI.",
    "Outside the lab I lead the research & development division of my faculty's student association, where the problems are people and processes instead of circuits — and the debugging is harder.",
  ],

  socials: [
    // [NEEDS REVIEW] Carried over from the previous site — confirm these are current.
    { label: "GitHub", url: "https://github.com/enclaireee", handle: "enclaireee" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/fatihzamzami", handle: "fatihzamzami" },
    { label: "Instagram", url: "https://www.instagram.com/fthzami", handle: "fthzami" },
  ],

};
