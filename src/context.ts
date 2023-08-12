import { Root } from "./createRoot";
import { ComponentContext } from "./types";

export interface GlobalContext {
  root: Root | null;
  data: ComponentContext | null;
  index: number;
}

export const context: GlobalContext = {
  root: null,
  data: null,
  index: 0,
}
