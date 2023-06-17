import { ProviderData } from "./createContext";
import { Dispatch } from "./hooks/useReducer";
import { StateSetter } from "./hooks/useState";

export type FC<T = {}> = FunctionalComponent<T>;

type FreactText = string | number;
type FreactChild = FreactElement | FreactText;

interface FreactNodeProps {
  key?: any;
  __domStart?: number;
  __domEnd?: number;
}

export type FreactFrygment = (FreactNode[] & FreactNodeProps);
export type FreactNode = FreactChild | FreactFrygment | boolean | null | undefined;

export type KeyType = bigint | boolean | number | string | symbol | object;

export type PropsWithChildren<T> = T & {
  children?: FreactNode[];
  key?: KeyType;
};

export interface Ref<T> {
  current: T extends Element ? (T | null) : T;
}

export interface FunctionalComponent<T = {}> {
  (props: PropsWithChildren<T>): FreactNode;
}

export interface StateData {
  val: any;
  setter: StateSetter<any>;
}

export interface RefData {
  current: any;
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
  StateData | RefData | EffectData |
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
