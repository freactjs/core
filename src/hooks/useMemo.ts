import { context } from "../context";
import { MemoData } from "../types";

export function useMemo<T>(fn: () => T, deps: any[]): T {
  const data = context.data as MemoData[];
  const index = context.index++;

  if (!Object.hasOwn(data, index)) {
    data[index] = { val: fn(), deps };
  } else {
    let areSame = data[index].deps.length === deps.length;
    if (areSame) {
      for (let i = 0; i < deps!.length; i++) {
        if (!Object.is(data[index].deps[i], deps[i])) {
          areSame = false;
          break;
        }
      }
    }

    if (!areSame) {
      data[index].val = fn();
      data[index].deps = deps;
    }
  }

  return data[index].val;
}
