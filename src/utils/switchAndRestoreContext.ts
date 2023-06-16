import { ComponentContext } from "../types";
import { context } from "../context";

export function switchAndRestoreContext(compCtx: ComponentContext, cb: () => void) {
  const oldData = context.data;
  const oldIndex = context.index;
  const oldFx = context.fx;
  const oldSelf = context.self;

  context.self = compCtx.self;
  context.index = 0;
  context.data = compCtx.hookData;
  context.fx = compCtx.fx;

  cb();

  context.self = oldSelf;
  context.index = oldIndex;
  context.data = oldData;
  context.fx = oldFx;
}
