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
export type { FC } from './types';

import { h } from './createElement';
import { Frygment } from "./components/Frygment";

export default { h, Frygment };
export { h, Frygment };
