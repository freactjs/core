import { context } from "../context";
import { StateData } from "../types";
import { raise } from "../utils/raise";

export type StateSetter<T> = (value: T | ((oldValue: T) => T)) => void;

export function useState<T>(initialValue: T | (() => T)): [T, StateSetter<T>] {
  if (!context.root || !context.data)
    raise('Missing context data inside useState hook');

  const data = context.data.hookData as StateData[];
  const index = context.index++;
  const root = context.root;
  const self = context.data.self;

  if (!Object.hasOwn(data, index)) {
    const setter: StateSetter<T> = (val) => {
      const newVal = typeof val === 'function' ? (val as any)(data[index].val) : val;
      if (Object.is(newVal, data[index].val)) return;

      data[index].val = newVal;
      (root as any).__internalAddPending(self);
      (root as any).__internalUpdate();
    };

    data[index] = {
      setter,
      val: typeof initialValue !== 'function'
        ? initialValue
        : (initialValue as any)()
    };
  }

  return [data[index].val, data[index].setter];
}
