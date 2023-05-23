import { context } from "../context";
import { Ref } from "../types";

export function useRef<T>(initialValue: T | null): Ref<T> {
  const data = context.data.refs;
  const index = context.indicies[2];

  if (!Object.hasOwn(data, index)) {
    data[index] = { current: initialValue };
  }

  context.indicies[2]++;
  return data[index];
}
