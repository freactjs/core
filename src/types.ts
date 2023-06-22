import { ProviderData } from "./createContext";
import { Dispatch } from "./hooks/useReducer";
import { MutableRef } from "./hooks/useRef";
import { StateSetter } from "./hooks/useState";

export interface PropsNoKey {
  [K: string]: any;
  key?: never;
}

export type FC<T extends PropsNoKey = {}> = FunctionalComponent<T>;

type FreactText = string | number;
type FreactChild = FreactElement | FreactText;

interface FreactNodeProps {
  key?: any;
  __domStart?: number;
  __domEnd?: number;
}

export type FreactFragment = (FreactNode[] & FreactNodeProps);
export type FreactNode = FreactChild | FreactFragment | boolean | null | undefined;

export type KeyType = bigint | boolean | number | string | symbol | object;

export type PropsWithChildren<T> = T & {
  children?: FreactNode[];
  key?: KeyType;
};

export interface FunctionalComponent<T extends PropsNoKey = {}> {
  (props: T): FreactElement;
}

export interface StateData {
  val: any;
  setter: StateSetter<any>;
}

export interface EffectData {
  cb: (() => any) | null;
  effect: (() => any) | null;
  deps: any[] | null;
}

export interface MemoData {
  val: any;
  deps: any[];
}

export interface ReducerData {
  val: any;
  dispatch: Dispatch<any>;
}

export type HookData = (
  StateData | MutableRef<any> | EffectData |
  MemoData | ReducerData | ProviderData
)[];

export interface ComponentContext {
  prevTree: FreactNode;
  prevProps: { [K: string]: any; };
  hookData: HookData;
  fx: EffectData[];
  self: { value: FreactElement; };
}

export interface FreactElement extends FreactNodeProps {
  type: string | FC<any> | symbol | null;
  props: {
    children: FreactNode[];
    [K: string]: any;
  };
  __context?: ComponentContext;
  __ref?: Element;
}

export type MemoComparatorType = (
  oldProps: { [K: string]: any; },
  newProps: { [K: string]: any; }
) => boolean;

export enum FreactNodeType {
  LITERAL = 0,
  FRAGMENT = 1,
  ELEMENT = 2,
  COMPONENT = 4,
  NODRAW = 5
}
