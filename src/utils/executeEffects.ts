import { ComponentContext } from "../types";

export function executeEffects(ctx: ComponentContext) {
  for (const item of ctx.fx) {
    if (!item.effect) continue;
    item.cb?.();
  }

  for (const item of ctx.fx) {
    if (!item.effect) continue;
    const res = item.effect();
    item.effect = null;

    if (typeof res === 'function')
      item.cb = res;
  }
}
