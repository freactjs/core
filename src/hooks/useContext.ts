import { context } from "@/context";
import { Context, ContextValue, ProviderData } from "../createContext";
import { useEffect } from "./useEffect";

export function useContext<C extends Context<any>>(ctx: C): ContextValue<C> {
  if (!context.root || !context.data)
    throw new Error('Missing context data inside useContext hook');

  const data = context.data.hookData as ProviderData[];
  const index = context.index++;
  const self = context.data.self;

  if (!Object.hasOwn(data, index)) {
    let curr = context.data.parent?.value;
    while (curr) {
      if (curr.type === ctx.Provider)
        break;

      curr = curr.__context?.parent?.value;
    }

    if (curr) {
      if (!curr.__context?.providerData)
        throw new Error("Provider doesn't contain ProviderData. How?");

      curr.__context.providerData.subs.add(self);
      data[index] = curr.__context.providerData;
    } else {
      data[index] = { val: (ctx as any).__defaultValue } as any;
    }
  }

  useEffect(() => {
    return () => data[index].subs?.delete(self);
  }, []);

  return data[index].val;
}
