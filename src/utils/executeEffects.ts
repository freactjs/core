import { ComponentContext } from "../types";

export function executeEffects(ctx: ComponentContext) {
  for (const item of ctx.hookData.effects) {
    if (!item.effect) continue;
    item.cb?.();

    const res = item.effect();
    item.effect = null;
    if (typeof res === 'function') item.cb = res;
  }
}
