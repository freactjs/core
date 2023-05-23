import { context } from "../context";

export function useEffect(cb: () => any, deps?: any[]): void {
  const data = context.data.effects;
  const index = context.indicies[1];

  if (!Object.hasOwn(data, index)) {
    data[index] = {
      effect: cb,
      cb: null,
      deps: deps ?? null
    };
  } else {
    let areSame = !!data[index].deps && data[index].deps?.length === deps?.length;
    if (areSame) {
      for (let i = 0; i < deps!.length; i++) {
        if (data[index].deps![i] !== deps![i]) {
          areSame = false;
          break;
        }
      }
    }

    if (!areSame) {
      data[index].effect = cb;
      data[index].deps = deps ?? null;
    }
  }

  context.indicies[1]++;
}
