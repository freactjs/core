import { context } from "../context";
import { Ref, RefData } from "../types";

export function useRef<T>(initialValue: T | null): Ref<T> {
  const data = context.data as RefData[];
  const index = context.index;

  if (!Object.hasOwn(data, index)) {
    data[index] = { current: initialValue };
  }

  context.index++;
  return data[index];
}
