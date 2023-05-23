export type FC<T = {}> = FunctionalComponent<T>;

type FreactText = string | number;
type FreactChild = FreactElement | FreactText;

interface FreactNodeProps {
  key?: any;
  __domStart?: number;
  __domEnd?: number;
}

type FreactFrygment = (FreactNode[] & FreactNodeProps);
type FreactNode = FreactChild | FreactFrygment | boolean | null | undefined;

type KeyType = bigint | boolean | number | string | symbol | object;

type PropsWithChildren<T> = T & {
  children?: FreactNode[];
  key?: KeyType;
};

export interface Ref<T> {
  current: T extends Element ? (T | null) : T;
}

export interface FunctionalComponent<T = {}> {
  (props: PropsWithChildren<T>): FreactNode;
}

export const Frygment: FC<{}> = () => null;

interface HookData {
  state: {
    val: any;
    setter: StateSetter<any>;
  }[];
  refs: { current: any; }[];
  effects: {
    cb: (() => any) | null;
    effect: (() => any) | null;
    deps: any[] | null;
  }[];
  memo: {
    val: any;
    deps: any[];
  }[];
  reducers: {
    val: any;
    dispatch: Dispatch<any>;
  }[];
  contexts: ProviderData[];
}

interface ComponentContext {
  prevTree: FreactNode;
  prevProps: { [K: string]: any; };
  hookData: HookData;
  self: { value: FreactElement; };
}

interface GlobalContext {
  self: ComponentContext['self'] | null;
  indicies: [number, number, number, number, number, number];
  data: HookData;
  root: Root | null;
}

const context: GlobalContext = {
  self: null,
  indicies: [0, 0, 0, 0, 0, 0],
  data: {
    state: [],
    effects: [],
    refs: [],
    memo: [],
    reducers: [],
    contexts: []
  },
  root: null
}

export interface FreactElement extends FreactNodeProps {
  type: string | FC<any> | null;
  props: {
    children: FreactNode[];
    [K: string]: any;
  };
  __context?: ComponentContext;
  __ref?: Element;
}

export function h(
  type: FreactElement['type'],
  props: { [K: string]: any; } | null,
  ...children: FreactNode[]
): FreactElement {
  const hasKey = props && Object.hasOwn(props, 'key');

  const key = props?.key;
  delete props?.key;

  if (type === Frygment) {
    if (hasKey) (children as any).key = key;
    return children as any;
  }

  const res: FreactElement = {
    type,
    props: {
      ...props,
      children: children
    }
  };

  if (hasKey) res.key = key;
  return res;
}

type MemoComparatorType = (
  oldProps: { [K: string]: any; },
  newProps: { [K: string]: any; }
) => boolean;

const defaultMemoComparator: MemoComparatorType = (oldProps, newProps) => {
  const newKeys = Object.keys(newProps);
  if (newKeys.length !== Object.keys(oldProps).length) return false;

  const newHasChildren = Object.hasOwn(newProps, 'children');
  if (Object.hasOwn(oldProps, 'children') !== newHasChildren) return false;

  if (newHasChildren) {
    if (oldProps.children.length !== newProps.children.length)
      return false;

    for (let i = 0; i < newProps.children.length; i++) {
      if (newProps.children[i] !== oldProps.children[i])
        return false;
    }
  }

  for (const key of newKeys) {
    if (key === 'children') continue;
    if (oldProps[key] !== newProps[key])
      return false;
  }

  return true;
};

export function memo<T>(
  component: FC<T>,
  arePropsEqual: MemoComparatorType = defaultMemoComparator
): FC<T> {
  let toggle: boolean = false;
  return (props) => {
    toggle = arePropsEqual(
      context.self?.value.__context?.prevProps ?? {},
      props
    ) ? toggle : !toggle;

    const res = useMemo(() => {
      return h(component, props);
    }, [toggle]);
    return res;
  };
}

function insertNodeAtPosition(parent: Element, child: Node | string | number, index: number) {
  const node = typeof child === 'object' ?
    child : document.createTextNode(`${child}`);

  if (parent.childNodes.length > 0) {
    parent.insertBefore(node, parent.childNodes[index]);
  } else {
    parent.appendChild(node);
  }
}

enum FreactNodeType {
  LITERAL = 0,
  FRAGMENT = 1,
  ELEMENT = 2,
  COMPONENT = 4,
  NODRAW = 5
}

function getNodeType(node: FreactNode): FreactNodeType {
  if (typeof node === 'object' && node !== null) {
    if (Array.isArray(node)) return FreactNodeType.FRAGMENT;
    return typeof (node as FreactElement).type === 'string'
      ? FreactNodeType.ELEMENT
      : FreactNodeType.COMPONENT;
  } else if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint')
    return FreactNodeType.LITERAL;
  else {
    return FreactNodeType.NODRAW;
  }
}

function getNodeKey(node: FreactNode): KeyType | null {
  if (typeof node !== 'object' || node === null || !Object.hasOwn(node, 'key')) {
    return null;
  }

  return node.key;
}

function recurseAttribs(target: any, val: any) {
  for (const key of Object.keys(val)) {
    if (typeof val[key] === 'object') {
      recurseAttribs(target[key], val[key]);
    } else {
      target[key] = val[key];
    }
  }
}

function updateAttribute(domNode: Element, attr: string, val: any) {
  if (attr === 'class') attr = 'className';
  if (typeof val === 'object') {
    recurseAttribs((domNode as any)[attr], val);
  } else {
    (domNode as any)[attr] = val;
  }
}

function switchAndRestoreContext(self: ComponentContext['self'], data: HookData, cb: () => void) {
  const oldData = context.data;
  const oldIndicies = context.indicies;
  const oldSelf = context.self;

  context.self = self;
  context.indicies = [0, 0, 0, 0, 0, 0];
  context.data = data;

  cb();

  context.self = oldSelf;
  context.indicies = oldIndicies as any;
  context.data = oldData;
}

function executeEffects(ctx: ComponentContext) {
  for (const item of ctx.hookData.effects) {
    if (!item.effect) continue;
    item.cb?.();

    const res = item.effect();
    item.effect = null;
    if (typeof res === 'function') item.cb = res;
  }
}

function* traverseDOMNodes(
  node: FreactElement | FreactFrygment,
  domNode: Element
): Generator<Node, void, any> {
  let children: FreactNode[];
  if (Array.isArray(node)) {
    children = node;
  } else {
    children = typeof node.type === 'string'
      ? [node] : [node.__context!.prevTree];
  }

  let index = (node.__domStart ?? 0);
  for (const child of children) {
    const nodeType = getNodeType(child);
    switch (nodeType) {
      case FreactNodeType.COMPONENT:
      case FreactNodeType.FRAGMENT:
        for (const sub of traverseDOMNodes(child as any, domNode)) {
          index++;
          yield sub;
        }
        break;
      case FreactNodeType.ELEMENT:
      case FreactNodeType.LITERAL:
        yield domNode.childNodes[index++];
        break;
    }
  }
}

function detachDOMNodes(node: FreactElement | FreactFrygment, domNode: Element): Node[] {
  const nodesToMove = [...traverseDOMNodes(node, domNode)];
  for (const node of nodesToMove) {
    domNode.removeChild(node);
  }

  return nodesToMove;
}

class Root {
  #rootEl: Element;
  #pending = new Set<FreactElement>();
  #isEnqueued: boolean = false;

  constructor(rootEl: Element) {
    this.#rootEl = rootEl;
    rootEl.innerHTML = '';
  }

  #reconcile(
    prev: FreactElement,
    curr: FreactElement,
    domNode: Element,
    parentDomIndex?: { value: number; }
  ) {
    const attrs = new Set([...Object.keys(curr.props), ...Object.keys(prev.props)]);
    for (const attr of attrs) {
      if (attr === 'children') continue;

      if (attr === 'ref') {
        if (Object.hasOwn(prev.props, attr)) {
          (prev.props[attr] as Ref<any>).current = null;
        }

        if (Object.hasOwn(curr.props, attr)) {
          (curr.props[attr] as Ref<any>).current = domNode;
        }

        continue;
      }

      if (!Object.hasOwn(curr.props, attr)) { // prop removed
        if (attr.slice(0, 2) === 'on' && typeof prev.props[attr] === 'function') {
          domNode.removeEventListener(attr.slice(2).toLowerCase(), prev.props[attr]);
        } else {
          (domNode as any)[attr] = '';
        }
      } else if (!Object.hasOwn(prev.props, attr)) { // prop added
        if (attr.slice(0, 2) === 'on' && typeof curr.props[attr] === 'function') {
          domNode.addEventListener(attr.slice(2).toLowerCase(), curr.props[attr]);
        } else {
          updateAttribute(domNode, attr, curr.props[attr]);
        }
      } else { // prop updated
        if (attr.slice(0, 2) === 'on') {
          if (curr.props[attr] === prev.props[attr]) continue;

          const event = attr.slice(2).toLowerCase();
          if (typeof prev.props[attr] === 'function') {
            domNode.removeEventListener(event, prev.props[attr]);
          } else {
            updateAttribute(domNode, attr, '');
          }

          if (typeof curr.props[attr] === 'function') {
            domNode.addEventListener(event, curr.props[attr]);
          } else {
            updateAttribute(domNode, attr, curr.props[attr]);
          }
        } else {
          if (attr === 'value' || attr === 'checked') {
            const domVal = (domNode as any)[attr];
            if (domVal !== curr.props[attr]) {
              updateAttribute(domNode, attr, curr.props[attr]);
            }
          } else {
            if (curr.props[attr] === prev.props[attr]) continue;
            updateAttribute(domNode, attr, curr.props[attr]);
          }
        }
      }
    }

    const childCount = Math.max(curr.props.children.length, prev.props.children.length);
    const keyNodeMap = new Map<KeyType, [FreactElement | FreactFrygment, Node[]]>();
    const domIndex = parentDomIndex ?? { value: 0 };

    // detach keyed nodes
    for (let i = childCount - 1; i >= 0; i--) {
      const currEl = curr.props.children[i] as FreactElement;
      const prevEl = prev.props.children[i] as FreactElement;

      const currKey = getNodeKey(currEl);
      const prevKey = getNodeKey(prevEl);

      if (prevKey === null || prevKey === currKey) continue;
      keyNodeMap.set(prevKey, [prevEl, detachDOMNodes(prevEl, domNode)]);
      prev.props.children[i] = undefined;
    }

    for (let i = 0; i < childCount; i++) {
      const currNode = curr.props.children[i];
      let prevNode = prev.props.children[i];

      const prevKey = getNodeKey(prevNode);
      const currKey = getNodeKey(currNode);

      // re-attach keyed nodes
      if (currKey !== null && currKey !== prevKey && keyNodeMap.has(currKey)) {
        const [keyEl, keyNodes] = keyNodeMap.get(currKey)!;
        keyNodeMap.delete(currKey);

        if (prevKey === null) {
          this.#reconcile(
            h(null, null, prevNode),
            h(null, null),
            domNode, domIndex
          );
        }

        prev.props.children[i] = keyEl;
        prevNode = keyEl;

        for (let i = 0; i < keyNodes.length; i++) {
          insertNodeAtPosition(domNode, keyNodes[i], domIndex.value + i);
        }
      }

      const prevType = getNodeType(prevNode);
      const currType = getNodeType(currNode);

      const currEl = currNode as FreactElement;
      const prevEl = prevNode as FreactElement;

      if (currType !== FreactNodeType.NODRAW) {
        if (prevType !== FreactNodeType.NODRAW) { // vnode updated
          if (prevType !== currType || (
            (currType === FreactNodeType.ELEMENT || currType === FreactNodeType.COMPONENT) &&
            currEl.type !== prevEl.type
          )) { // irreconcilable
            this.#reconcile(
              h(null, null, prevNode),
              h(null, null),
              domNode, domIndex
            );

            this.#reconcile(
              h(null, null),
              h(null, null, currNode),
              domNode, domIndex
            );
          } else {
            if (currNode === prevNode) { // skip memoized
              if (currType === FreactNodeType.COMPONENT || currType === FreactNodeType.FRAGMENT) {
                domIndex.value = currEl.__domEnd!;
              } else {
                domIndex.value++;
              }

              continue;
            }

            if (currType === FreactNodeType.LITERAL) {
              domNode.childNodes[domIndex.value++].textContent = `${currNode}`;
            } else if (currType === FreactNodeType.ELEMENT) {
              const root = domNode.childNodes[domIndex.value++] as Element;

              this.#reconcile(
                prevEl,
                currEl,
                root
              );
            } else if (currType === FreactNodeType.COMPONENT) {
              this.#pending.delete(prevEl);
              switchAndRestoreContext(prevEl.__context!.self, prevEl.__context!.hookData, () => {
                const newElement = (currEl.type as FC)(currEl.props);
                currEl.__domStart = domIndex.value;
                currEl.__ref = domNode;

                this.#reconcile(
                  h(null, null, prevEl.__context!.prevTree),
                  h(null, null, newElement),
                  domNode, domIndex
                );

                currEl.__context = {
                  prevTree: newElement,
                  prevProps: currEl.props,
                  hookData: context.data,
                  self: context.self!
                };
                currEl.__context.self.value = currEl;
                currEl.__domEnd = domIndex.value;

                executeEffects(currEl.__context);
              });
            } else { // fragment
              currEl.__domStart = domIndex.value;
              this.#reconcile(
                h(null, null, ...(prevNode as [])),
                h(null, null, ...(currNode as [])),
                domNode, domIndex
              );
            }
          }
        } else { // vnode created
          if (currType === FreactNodeType.LITERAL) {
            insertNodeAtPosition(domNode, currNode as string, domIndex.value++);
          } else if (currType === FreactNodeType.FRAGMENT) {
            currEl.__domStart = domIndex.value;
            this.#reconcile(
              h(null, null),
              h(null, null, ...(currNode as [])),
              domNode, domIndex
            );
          } else {
            if (typeof currEl.type === 'string') { // element
              const root = document.createElement(currEl.type);
              this.#reconcile(h(currEl.type, {}), currEl, root);
              insertNodeAtPosition(domNode, root, domIndex.value++);
            } else if (currEl.type !== null) { // component
              const newData: HookData = {
                state: [],
                effects: [],
                refs: [],
                memo: [],
                reducers: [],
                contexts: []
              };

              const self = { value: currEl };
              switchAndRestoreContext(self, newData, () => {
                const newElement = (currEl.type as FC)(currEl.props);
                currEl.__domStart = domIndex.value;
                currEl.__ref = domNode;

                this.#reconcile(
                  h(null, null),
                  h(null, null, newElement),
                  domNode, domIndex
                );

                currEl.__domEnd = domIndex.value;
                currEl.__context = {
                  prevTree: newElement,
                  prevProps: currEl.props,
                  hookData: context.data,
                  self
                };
                executeEffects(currEl.__context);
              });
            }
          }
        }
      } else { // vnode destroyed
        if (prevType !== FreactNodeType.NODRAW) {
          if (prevType === FreactNodeType.FRAGMENT) {
            this.#reconcile(
              h(null, null, ...(prevNode as [])),
              h(null, null, currNode),
              domNode, domIndex
            );
          } else if (prevType === FreactNodeType.COMPONENT) {
            this.#pending.delete(prevEl);

            this.#reconcile(
              h(null, null, prevEl.__context?.prevTree),
              h(null, null, currNode),
              domNode, domIndex
            );

            for (const item of prevEl.__context!.hookData.effects) {
              item.cb?.();
            }
          } else {
            if (prevType === FreactNodeType.ELEMENT) {
              if (prevEl.props.children.length > 0) {
                this.#reconcile(
                  prevEl,
                  h(null, null),
                  domNode.childNodes[domIndex.value] as Element
                );
              }

              if (Object.hasOwn(prevEl.props, 'ref')) {
                prevEl.props.ref.current = null;
              }
            }

            domNode.childNodes[domIndex.value].remove();
          }
        } else {
          // empty branch
        }
      }
    }
  }

  __internalAddPening(component: FreactElement) {
    this.#pending.add(component);
  }

  __internalUpdate() {
    if (this.#isEnqueued) return;

    this.#isEnqueued = true;
    requestIdleCallback(() => {
      context.root = this;

      for (const item of this.#pending) {
        const rootIndex = { value: item.__domStart! };
        contextData.clear();

        this.#reconcile(
          h(null, null, item),
          h(null, null, { ...item }),
          item.__ref!,
          rootIndex
        );

        this.#pending.delete(item);
      }

      this.#isEnqueued = false;
    });
  }

  render(node: FreactElement) {
    context.root = this;
    this.#reconcile(
      h(null, null),
      h(null, null, node),
      this.#rootEl
    );
  }
}

export function createRoot(rootSelector: string) {
  const rootEl = document.querySelector(rootSelector);
  if (!rootEl) throw new Error("Root element doesn't exist");
  return new Root(rootEl);
}

export type StateSetter<T> = (value: T | ((oldValue: T) => T)) => void;

export function useState<T>(initialValue: T | (() => T)): [T, StateSetter<T>] {
  if (!context.root || !context.self)
    throw new Error('Missing context data inside useState hook');

  const data = context.data.state;
  const index = context.indicies[0];
  const root = context.root;
  const self = context.self;

  if (!Object.hasOwn(data, index)) {
    const setter: StateSetter<T> = (val) => {
      const newVal = typeof val === 'function' ? (val as any)(data[index].val) : val;
      if (newVal === data[index].val) return;

      data[index].val = newVal;
      root.__internalAddPening(self.value);
      root.__internalUpdate();
    };

    data[index] = {
      setter,
      val: typeof initialValue !== 'function'
        ? initialValue
        : (initialValue as any)()
    };
  }

  context.indicies[0]++;
  return [data[index].val, data[index].setter];
}

export function useEffect(cb: () => any, deps?: any[]): void {
  const data = context.data.effects;
  const index = context.indicies[1];

  if (!Object.hasOwn(data, index)) {
    data[index] = {
      effect: cb,
      cb: null,
      deps: deps ?? null
    };
  } else {
    let areSame = !!data[index].deps && data[index].deps?.length === deps?.length;
    if (areSame) {
      for (let i = 0; i < deps!.length; i++) {
        if (data[index].deps![i] !== deps![i]) {
          areSame = false;
          break;
        }
      }
    }

    if (!areSame) {
      data[index].effect = cb;
      data[index].deps = deps ?? null;
    }
  }

  context.indicies[1]++;
}

export function useRef<T>(initialValue: T | null): Ref<T> {
  const data = context.data.refs;
  const index = context.indicies[2];

  if (!Object.hasOwn(data, index)) {
    data[index] = { current: initialValue };
  }

  context.indicies[2]++;
  return data[index];
}

export function useMemo<T>(fn: () => T, deps: any[]): T {
  const data = context.data.memo;
  const index = context.indicies[3];

  if (!Object.hasOwn(data, index)) {
    data[index] = { val: fn(), deps };
  } else {
    let areSame = data[index].deps.length === deps.length;
    if (areSame) {
      for (let i = 0; i < deps!.length; i++) {
        if (data[index].deps[i] !== deps[i]) {
          areSame = false;
          break;
        }
      }
    }

    if (!areSame) {
      data[index].val = fn();
      data[index].deps = deps;
    }
  }

  context.indicies[3]++;
  return data[index].val;
}

export function useCallback(fn: (...args: any[]) => any, deps: any[]) {
  return useMemo(() => fn, deps);
}

type ReducerNoAction<S> = (state: S) => S;
type ReducerNoActionState<R> = R extends ReducerNoAction<infer S> ? S : any;

type Reducer<S, A> = (state: S, action: A) => S;
type ReducerState<R> = R extends Reducer<infer S, any> ? S : any;
type ReducerAction<R> = R extends Reducer<any, infer A> ? A : any;

type Dispatch<A> = (action: A) => void;

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
  if (!context.root || !context.self)
    throw new Error('Missing context data inside useReducer hook');

  const data = context.data.reducers;
  const index = context.indicies[4];
  const root = context.root;
  const self = context.self;

  if (!Object.hasOwn(data, index)) {
    const dispatch: Dispatch<any> = (action) => {
      data[index].val = reducer(data[index].val, action);
      root.__internalAddPening(self.value);
      root.__internalUpdate();
    };

    data[index] = {
      val: init ? init(initialArg) : initialArg,
      dispatch
    };
  }

  context.indicies[4]++;
  return [data[index].val, data[index].dispatch];
}

interface ProviderData {
  subs: Set<{ value: FreactElement; }>;
  val: any;
}

interface ProviderNode {
  value: ProviderData;
  prev: ProviderNode | null;
}

const contextData = new Map<Context<any>, ProviderNode>();

class Context<T> {
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

type ContextValue<C> = C extends Context<infer V> ? V : any;

export function useContext<C extends Context<any>>(ctx: C): ContextValue<C> {
  if (!context.self)
    throw new Error('Missing context data inside useContext hook');

  const data = context.data.contexts;
  const index = context.indicies[5];
  const self = context.self;

  if (!Object.hasOwn(data, index)) {
    data[index] = contextData.get(ctx)!.value;
    data[index].subs.add(self);
  }

  useEffect(() => {
    return () => data[index].subs.delete(self);
  }, []);

  context.indicies[5]++;
  return data[index].val;
}

createContext();

export default {
  Frygment,
  createRoot,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useReducer,
  useContext,
  createContext,
  memo,
  h
};
