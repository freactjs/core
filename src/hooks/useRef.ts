import { raise } from "@/utils/raise";
import { context } from "../context";

export interface MutableRef<T> {
  current: T;
}

export interface Ref<T> {
  readonly current: T | null;
}

export function useRef<T>(initialValue: T): MutableRef<T>
export function useRef<T>(initialValue: T | null): Ref<T>
export function useRef<T = undefined>(initialValue?: undefined): MutableRef<T | undefined>
export function useRef(initialValue: any): MutableRef<any> {
  if (!context.root || !context.data)
    raise('Missing context data inside useRef hook');

  const data = context.data.hookData as MutableRef<any>[];
  const index = context.index++;

  if (!Object.hasOwn(data, index)) {
    data[index] = { current: initialValue };
  }

  return data[index];
}
