/**
 * three's console output, routed through its own hook (`setConsoleFunction`) and printed exactly as
 * three would, except one line: R3F 9.8 (the latest stable) builds its store clock with `THREE.Clock`,
 * which three r183+ flags as deprecated the moment one is constructed. That's R3F's call, not ours.
 * ponytail: delete this file (and its two imports) on R3F 10, which uses THREE.Timer.
 */
import { setConsoleFunction } from "three";

type StackTrace = { isStackTrace: true; getError: (message: string) => Error };

setConsoleFunction((type: "log" | "warn" | "error", message: string, ...params: unknown[]) => {
  if (message.startsWith("THREE.Clock: This module has been deprecated")) return;
  const trace = params[0] as Partial<StackTrace> | undefined;
  if (trace?.isStackTrace && trace.getError) console[type](trace.getError(message));
  else console[type](message, ...params);
});
