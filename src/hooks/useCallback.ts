import { context } from "../context";
import { raise } from "../utils/raise";
import { useMemo } from "./useMemo";

export function useCallback(fn: (...args: any[]) => any, deps: any[]) {
  if (!context.root || !context.data)
    raise('Missing context data inside useCallback hook');

  return useMemo(() => fn, deps);
}
