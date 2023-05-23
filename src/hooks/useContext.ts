import { context } from "../context";
import { Context, contextData, ContextValue } from "../createContext";
import { useEffect } from "./useEffect";

export function useContext<C extends Context<any>>(ctx: C): ContextValue<C> {
  if (!context.self)
    throw new Error('Missing context data inside useContext hook');

  const data = context.data.contexts;
  const index = context.indicies[5];
  const self = context.self;

  if (!Object.hasOwn(data, index)) {
    data[index] = contextData.get(ctx)!.value;
    data[index].subs.add(self);
  }

  useEffect(() => {
    return () => data[index].subs.delete(self);
  }, []);

  context.indicies[5]++;
  return data[index].val;
}
