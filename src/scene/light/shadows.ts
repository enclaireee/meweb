/**
 * The shadow map is re-rendered only when something that casts, or the light itself, moved (§6.5).
 * - `dirty`: a move whose shadow must follow at once (the lamp, the worker, the entrance, the relight).
 * - `drift`: ambient life (hung sway, idle pivots): slow enough that its shadow may refresh at ≤10 Hz.
 */
export const shadows = { dirty: true, drift: false };
