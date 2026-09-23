import type { Award } from "./types";
import { projects } from "./projects";

/** Ribbons on the Wall. ProtoTech belongs to Refocus (decisions.md), so it comes from there. */
export const awards = [
  ...projects.refocus.awards,
  { title: "Best BPH (Board of Officers), Research & Development Division", issuer: "Ikatan Mahasiswa Elektro FTUI", year: 2026 },
] satisfies Award[];
