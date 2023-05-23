import { context } from "../context";

export type StateSetter<T> = (value: T | ((oldValue: T) => T)) => void;

export function useState<T>(initialValue: T | (() => T)): [T, StateSetter<T>] {
  if (!context.root || !context.self)
    throw new Error('Missing context data inside useState hook');

  const data = context.data.state;
  const index = context.indicies[0];
  const root = context.root;
  const self = context.self;

  if (!Object.hasOwn(data, index)) {
    const setter: StateSetter<T> = (val) => {
      const newVal = typeof val === 'function' ? (val as any)(data[index].val) : val;
      if (newVal === data[index].val) return;

      data[index].val = newVal;
      root.__internalAddPening(self.value);
      root.__internalUpdate();
    };

    data[index] = {
      setter,
      val: typeof initialValue !== 'function'
        ? initialValue
        : (initialValue as any)()
    };
  }

  context.indicies[0]++;
  return [data[index].val, data[index].setter];
}
