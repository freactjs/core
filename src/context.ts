import { Root } from "./createRoot";
import { ComponentContext, HookData } from "./types";

export interface GlobalContext {
  self: ComponentContext['self'] | null;
  index: number;
  data: HookData;
  fx: ComponentContext['fx'];
  root: Root | null;
}

export const context: GlobalContext = {
  self: null,
  index: 0,
  data: [],
  fx: [],
  root: null
}
