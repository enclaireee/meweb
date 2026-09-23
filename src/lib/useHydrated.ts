import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false during SSR and hydration, true after: attributes that must not exist for no-JS readers. */
export const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
