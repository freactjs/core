import { context } from "../context";
import { ReducerData } from "../types";

type ReducerNoAction<S> = (state: S) => S;
type ReducerNoActionState<R> = R extends ReducerNoAction<infer S> ? S : any;

type Reducer<S, A> = (state: S, action: A) => S;
type ReducerState<R> = R extends Reducer<infer S, any> ? S : any;
type ReducerAction<R> = R extends Reducer<any, infer A> ? A : any;

export type Dispatch<A> = (action: A) => void;

export function useReducer<R extends ReducerNoAction<any>>(
  reducer: R,
  state: ReducerNoActionState<R>
): [ReducerNoActionState<R>, () => void]

export function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  state: ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

export function useReducer<R extends ReducerNoAction<any>, I>(
  reducer: R,
  state: I,
  init: (arg: I) => ReducerNoActionState<R>
): [ReducerNoActionState<R>, () => void]

export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  state: I,
  init: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

export function useReducer(reducer: Reducer<any, any>, initialArg: any, init?: any) {
  if (!context.root || !context.data)
    throw new Error('Missing context data inside useReducer hook');

  const data = context.data.hookData as ReducerData[];
  const index = context.index++;
  const root = context.root;
  const self = context.data.self;

  if (!Object.hasOwn(data, index)) {
    const dispatch: Dispatch<any> = (action) => {
      const newVal = reducer(data[index].val, action);
      if (Object.is(newVal, data[index].val)) return;

      data[index].val = newVal;
      (root as any).__internalAddPending(self);
      (root as any).__internalUpdate();
    };

    data[index] = {
      val: init ? init(initialArg) : initialArg,
      dispatch
    };
  }

  return [data[index].val, data[index].dispatch];
}
