import { ProviderData } from "./createContext";
import { Dispatch } from "./hooks/useReducer";
import { MutableRef } from "./hooks/useRef";
import { StateSetter } from "./hooks/useState";

export interface PropsNoKey {
  [K: string]: any;
  key?: never;
}

export type FC<T extends PropsNoKey = {}> = FunctionComponent<T>;

type FreactText = string | number;
type FreactChild = FreactElement | FreactText;

interface FreactNodeProps {
  key?: unknown;
  __domStart?: number;
  __domEnd?: number;
  __vnode?: FreactElement;
}

export type FreactFragment = (FreactNode[] & FreactNodeProps);
export type FreactNode = FreactChild | FreactFragment | boolean | null | undefined;

export type KeyType = bigint | boolean | number | string | symbol | object;

export type PropsWithChildren<T> = T & {
  children?: FreactNode;
  key?: KeyType;
};

export interface FunctionComponent<T extends PropsNoKey = {}> {
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
  parent: { value: FreactElement; } | null;
  depth: number;
  providerData?: ProviderData;
}

export interface FreactElement extends FreactNodeProps {
  type: string | FC<any>;
  props: {
    children?: FreactNode;
    [K: string]: any;
  };
  __context?: ComponentContext;
  __ref?: HTMLElement;
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
