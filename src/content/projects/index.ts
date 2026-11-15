import type { Project } from '../types';
import { teaterMusikalAkm } from './teater-musikal-akm';
import { nestUi2026 } from './nest-ui-2026';
import { imeFtuiWebsite } from './ime-ftui-website';
import { komatUnpar2025 } from './komat-unpar-2025';
import { demandx } from './demandx';
import { adhdEegGame } from './adhd-eeg-game';
import { otObservabilityLab } from './ot-observability-lab';
import { solarLightingMonitor } from './solar-lighting-monitor';

// Ordered by group (web, data, hardware), newest start date first.
export const projects: Project[] = [
  teaterMusikalAkm,
  nestUi2026,
  imeFtuiWebsite,
  komatUnpar2025,
  demandx,
  adhdEegGame,
  otObservabilityLab,
  solarLightingMonitor,
];

export const getProject = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);
