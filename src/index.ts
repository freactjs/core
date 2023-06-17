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
export { Fragment } from './components/Fragment';
export type { FC } from './types';
export type { StateSetter } from './hooks/useState';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [K: string]: {
        [L: string]: any;
        ref?: { current: Element | null; };
      };
    }
  }
}
