import { ComponentContext, HookData } from "../types";
import { context } from "../context";

export function switchAndRestoreContext(self: ComponentContext['self'], data: HookData, cb: () => void) {
  const oldData = context.data;
  const oldIndicies = context.indicies;
  const oldSelf = context.self;

  context.self = self;
  context.indicies = [0, 0, 0, 0, 0, 0];
  context.data = data;

  cb();

  context.self = oldSelf;
  context.indicies = oldIndicies as any;
  context.data = oldData;
}
