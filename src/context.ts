import { Root } from "./createRoot";
import { ComponentContext, HookData } from "./types";

export interface GlobalContext {
  self: ComponentContext['self'] | null;
  indicies: [number, number, number, number, number, number];
  data: HookData;
  root: Root | null;
}

export const context: GlobalContext = {
  self: null,
  indicies: [0, 0, 0, 0, 0, 0],
  data: {
    state: [],
    effects: [],
    refs: [],
    memo: [],
    reducers: [],
    contexts: []
  },
  root: null
}
