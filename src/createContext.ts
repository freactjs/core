import { Fragment, h, useRef } from ".";
import { context } from "./context";
import { useContext } from "./hooks/useContext";
import { FC, FreactElement, FreactNode } from "./types";

export type ContextValue<C> = C extends Context<infer V> ? V : any;

export interface ProviderData {
  subs: Set<{ value: FreactElement; }>;
  val: any;
}

export class Context<T> {
  // @ts-ignore
  private __defaultValue: T | undefined;

  constructor(defaultValue?: T) {
    this.__defaultValue = defaultValue;
  }

  Provider: FC<{ value: T, children: FreactNode }> = ({ value, children }) => {
    const provData = useRef<ProviderData>({ val: value, subs: new Set() });
    const isInit = useRef(true);

    if (isInit.current) {
      context.data!.providerData = provData.current;
      isInit.current = false;
    }

    if (!Object.is(provData.current.val, value)) {
      provData.current.val = value;
      provData.current.subs.forEach(x => {
        (context.root as any)?.__internalAddPending(x);
      });
    }

    return h(Fragment, null, children);
  };

  Consumer: FC<{ children: (data: T) => FreactNode }> = ({ children }) => {
    const data = useContext(this);
    return h(Fragment, null, children(data));
  }
}

export function createContext<T>(defaultValue?: T): Context<T> {
  return new Context<T>(defaultValue);
}
