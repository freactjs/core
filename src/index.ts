import { FreactElement, KeyType } from "./types";

export { memo } from "./components/memo";
export { createContext } from "./createContext";
export { useCallback } from "./hooks/useCallback";
export { useContext } from "./hooks/useContext";
export { useEffect } from "./hooks/useEffect";
export { useMemo } from "./hooks/useMemo";
export { useReducer } from "./hooks/useReducer";
export { useRef } from "./hooks/useRef";
export { useState } from "./hooks/useState";
export { createRoot } from "./createRoot";
export { h } from './createElement';

export type { FC, FunctionalComponent, FreactNode, FreactElement, Ref } from './types';
export type { StateSetter } from './hooks/useState';

export const Fragment = Symbol.for('freact.fragment');

declare global {
  namespace JSX {
    interface Element extends FreactElement {}

    interface IntrinsicElements {
      [K: string]: {
        [L: string]: any;
        ref?: { current: HTMLElement | null; };
        key?: KeyType;
      };
    }

    interface IntrinsicAttributes {
      key?: KeyType;
    }

    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
