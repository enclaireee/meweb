import type { SkillGroup } from "./types";

/** Pegboard rows (design.md §6). */
export const skills = [
  { label: "Programming", items: ["Python", "TypeScript", "JavaScript", "C/C++", "MATLAB"] },
  {
    label: "Frameworks & Tools",
    items: ["React", "Next.js", "FastAPI", "Tailwind CSS", "Supabase", "Git", "Docker", "Arduino"],
  },
  {
    label: "Forecasting & Data",
    items: ["Time-series forecasting", "Croston · TSB · seasonal naive", "Rolling-origin backtesting", "WAPE / MASE", "pandas", "REST API design"],
  },
] satisfies SkillGroup[];
