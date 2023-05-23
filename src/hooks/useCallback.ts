import { useMemo } from "./useMemo";

export function useCallback(fn: (...args: any[]) => any, deps: any[]) {
  return useMemo(() => fn, deps);
}
