import { context } from "@/context";
import { useMemo } from "./useMemo";

export function useCallback(fn: (...args: any[]) => any, deps: any[]) {
  if (!context.root || !context.data)
    throw new Error('Missing context data inside useCallback hook');

  return useMemo(() => fn, deps);
}
