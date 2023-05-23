import { context } from "../context";

export function useMemo<T>(fn: () => T, deps: any[]): T {
  const data = context.data.memo;
  const index = context.indicies[3];

  if (!Object.hasOwn(data, index)) {
    data[index] = { val: fn(), deps };
  } else {
    let areSame = data[index].deps.length === deps.length;
    if (areSame) {
      for (let i = 0; i < deps!.length; i++) {
        if (data[index].deps[i] !== deps[i]) {
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

  context.indicies[3]++;
  return data[index].val;
}
