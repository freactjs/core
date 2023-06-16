import { context } from "../context";
import { EffectData } from "../types";

export function useEffect(cb: () => any, deps?: any[]): void {
  const data = context.data as EffectData[];
  const index = context.index;

  if (!Object.hasOwn(data, index)) {
    data[index] = {
      effect: cb,
      cb: null,
      deps: deps ?? null
    };
    context.fx.push(data[index]);
  } else {
    let areSame = !!data[index].deps && data[index].deps?.length === deps?.length;
    if (areSame) {
      for (let i = 0; i < deps!.length; i++) {
        if (!Object.is(data[index].deps![i], deps![i])) {
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

  context.index++;
}
