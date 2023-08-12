import { context } from "../context";
import { ComponentContext } from "../types";

export function switchAndRestoreContext(compCtx: ComponentContext, cb: () => void) {
  const oldData = context.data;
  const oldIndex = context.index;

  context.data = compCtx;
  context.index = 0;

  cb();

  context.data = oldData;
  context.index = oldIndex;
}
