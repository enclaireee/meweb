'use client';
import { createContext, useContext, useSyncExternalStore } from 'react';
import { getState, SERVER_STATE, subscribe } from './store';
import type { Lane } from './types';

/** Stage's initialLane, used until the store is initialised (SSR, hydration). */
export const InitialLaneCtx = createContext<{ lane: Lane; focusId?: string }>({ lane: 'main' });

export function useEngineState() {
  const s = useSyncExternalStore(subscribe, getState, () => SERVER_STATE);
  const init = useContext(InitialLaneCtx);
  return s.lane ? { ...s, lane: s.lane } : { ...s, lane: init.lane, focusId: init.focusId };
}

export const useLane = () => useEngineState().lane;
export const useQuality = () => useEngineState().quality;
export const useReducedMotion = () => useEngineState().reducedMotion;
