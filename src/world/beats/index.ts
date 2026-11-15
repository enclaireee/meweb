import type { BeatDef } from '@/engine';
import { b0Outside } from './b0-outside';
import { b1Approach } from './b1-approach';
import { b2FirstFold } from './b2-first-fold';
import { b3ScaleFlip } from './b3-scale-flip';
import { b4InnerSun } from './b4-inner-sun';
import { b5Understory } from './b5-understory';
import { b6LanternVault } from './b6-lantern-vault';
import { b7SecondFold } from './b7-second-fold';
import { b8Seam } from './b8-seam';
import { b9Window } from './b9-window';

export const mainBeats: BeatDef[] = [
  b0Outside, b1Approach, b2FirstFold, b3ScaleFlip, b4InnerSun, b5Understory, b6LanternVault, b7SecondFold, b8Seam, b9Window,
];
export { projectBeats } from '../lane-projects';
