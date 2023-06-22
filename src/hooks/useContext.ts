import { context } from "../context";
import { Context, contextData, ContextValue, ProviderData } from "../createContext";
import { useEffect } from "./useEffect";

export function useContext<C extends Context<any>>(ctx: C): ContextValue<C> {
  if (!context.self)
    throw new Error('Missing context data inside useContext hook');

  const data = context.data as ProviderData[];
  const index = context.index++;
  const self = context.self;

  if (!Object.hasOwn(data, index)) {
    data[index] = contextData.get(ctx)!.value;
    data[index].subs.add(self);
  }

  useEffect(() => {
    return () => data[index].subs.delete(self);
  }, []);

  return data[index].val;
}
