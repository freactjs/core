import { context } from "../context";
import { EffectData } from "../types";

export function useEffect(cb: () => any, deps?: any[]): void {
  if (!context.root || !context.data)
    throw new Error('Missing context data inside useEffect hook');

  const data = context.data.hookData as EffectData[];
  const index = context.index++;

  if (!Object.hasOwn(data, index)) {
    data[index] = {
      effect: cb,
      cb: null,
      deps: deps ?? null
    };
    context.data.fx.push(data[index]);
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
}
