import { context } from "./context";
import { useEffect } from "./hooks/useEffect";
import { useRef } from "./hooks/useRef";
import { FC, FreactElement } from "./types";

export type ContextValue<C> = C extends Context<infer V> ? V : any;

export interface ProviderData {
  subs: Set<{ value: FreactElement; }>;
  val: any;
}

export interface ProviderNode {
  value: ProviderData;
  prev: ProviderNode | null;
}

export const contextData = new Map<Context<any>, ProviderNode>();

export class Context<T> {
  constructor(defaultValue: any) {
    contextData.set(this, {
      prev: null,
      value: { val: defaultValue, subs: new Set() }
    });
  }

  Provider: FC<{ value: T; }> = ({ value, children }) => {
    const provData = useRef<ProviderData>({ val: value, subs: new Set() });

    if (provData.current.val !== value) {
      provData.current.val = value;
      provData.current.subs.forEach(x => {
        context.root?.__internalAddPening(x.value);
      });
    }

    const prev = contextData.get(this)!;
    contextData.set(this, {
      prev,
      value: provData.current
    });

    useEffect(() => {
      contextData.set(this, prev);
    });

    return children;
  };
}

export function createContext<T>(defaultValue?: T): Context<T> {
  return new Context(defaultValue);
}