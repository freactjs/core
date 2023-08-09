import { FreactElement, FreactNodeType, KeyType, FC, ComponentContext, FreactNode } from "./types";
import { getNodeKey } from "./utils/getNodeKey";
import { updateAttribute } from "./utils/updateAttribute";
import { context } from "./context";
import { insertNodeAtPosition } from "./utils/insertNodeAtPosition";
import { h } from "./createElement";
import { getNodeType } from "./utils/getNodeType";
import { switchAndRestoreContext } from "./utils/switchAndRestoreContext";
import { executeEffects } from "./utils/executeEffects";
import { MutableRef } from "./hooks/useRef";
import { getChildrenArray } from "./utils/getChildrenArray";
import { reinstantiate } from "./utils/reinstantiate";

export class Root {
  #rootEl: HTMLElement;
  #pending = new Set<{ value: FreactElement }>();
  #isEnqueued: boolean = false;

  constructor(rootEl: HTMLElement) {
    this.#rootEl = rootEl;
    rootEl.innerHTML = '';
  }

  #reconcile(
    prev: FreactElement,
    curr: FreactElement,
    domNode: HTMLElement,
    parentDomIndex?: { value: number; }
  ) {
    const attrs = new Set([...Object.keys(curr.props), ...Object.keys(prev.props)]);
    for (const attr of attrs) {
      if (attr === 'children') continue;

      if (attr === 'ref') {
        if (Object.hasOwn(prev.props, attr)) {
          (prev.props[attr] as MutableRef<any>).current = null;
        }

        if (Object.hasOwn(curr.props, attr)) {
          (curr.props[attr] as MutableRef<any>).current = domNode;
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

    const prevChildren = getChildrenArray(prev);
    const currChildren = getChildrenArray(curr);

    const childCount = Math.max(prevChildren.length, currChildren.length);
    const keyNodeMap = new Map<KeyType, [FreactNode, Node[]]>();
    const domIndex = parentDomIndex ?? { value: 0 };

    // find keyed nodes
    let index = domIndex.value;
    for (let i = 0; i < prevChildren.length; i++) {
      const prevNode = prevChildren[i];
      const currNode = currChildren[i];

      const prevKey = getNodeKey(prevNode);
      const currKey = getNodeKey(currNode);
      const prevType = getNodeType(prevNode);

      const oldIdx = index;
      index = prevType === FreactNodeType.FRAGMENT || prevType === FreactNodeType.COMPONENT
        ? (prevNode as FreactElement).__domEnd! : index + 1;

      if (prevKey === null || prevKey === currKey) continue;

      const nodes: Node[] = [];
      for (let i = oldIdx; i < index; i++)
        nodes.push(domNode.childNodes[i]);

      keyNodeMap.set(prevKey, [prevNode, nodes]);
      prevChildren[i] = undefined;
    }

    // detach keyed nodes
    for (const [_, [__, nodes]] of keyNodeMap) {
      for (const node of nodes) domNode.removeChild(node);
    }

    for (let i = 0; i < childCount; i++) {
      const currNode = currChildren[i];
      let prevNode = prevChildren[i];

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

        prevChildren[i] = keyEl;
        prevNode = keyEl;

        for (let j = 0; j < keyNodes.length; j++) {
          insertNodeAtPosition(domNode, keyNodes[j], domIndex.value + j);
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
            // Skip memoized elements
            if (
              currType === FreactNodeType.ELEMENT ||
              currType === FreactNodeType.COMPONENT ||
              currType === FreactNodeType.FRAGMENT
            ) {
              if (Object.is(prevEl.__vnode, currEl.__vnode)) {
                currEl.__vnode = prevEl.__vnode;

                if (
                  currType === FreactNodeType.COMPONENT ||
                  currType === FreactNodeType.FRAGMENT
                ) {
                  currEl.__domStart = prevEl.__domStart;
                  currEl.__domEnd = prevEl.__domEnd;
                }

                if (currType === FreactNodeType.COMPONENT) {
                  currEl.__context = prevEl.__context;
                  currEl.__context!.self.value = currEl;
                  currEl.__ref = prevEl.__ref;
                }

                domIndex.value = currType === FreactNodeType.ELEMENT
                  ? domIndex.value + 1
                  : prevEl.__domEnd!;

                continue;
              }
            } else {
              if (Object.is(prevNode, currNode)) {
                domIndex.value++;
                continue;
              }
            }

            if (currType === FreactNodeType.LITERAL) {
              domNode.childNodes[domIndex.value++].textContent = `${currNode}`;
            } else if (currType === FreactNodeType.ELEMENT) {
              const root = domNode.childNodes[domIndex.value++] as HTMLElement;

              this.#reconcile(
                prevEl,
                currEl,
                root
              );
            } else if (currType === FreactNodeType.COMPONENT) {
              this.#pending.delete(prevEl.__context!.self);

              switchAndRestoreContext(prevEl.__context!, () => {
                const newElement = reinstantiate((currEl.type as FC)(currEl.props));
                currEl.__domStart = domIndex.value;
                currEl.__ref = domNode;

                this.#reconcile(
                  h(null, null, prevEl.__context!.prevTree),
                  h(null, null, newElement),
                  domNode, domIndex
                );

                currEl.__context = prevEl.__context;
                currEl.__context!.prevTree = newElement;
                currEl.__context!.self.value = currEl;
                currEl.__domEnd = domIndex.value;

                executeEffects(currEl.__context!);
              });
            } else { // fragment
              currEl.__domStart = domIndex.value;
              this.#reconcile(
                h(null, null, ...(prevNode as [])),
                h(null, null, ...(currNode as [])),
                domNode, domIndex
              );
              currEl.__domEnd = domIndex.value;
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
            currEl.__domEnd = domIndex.value;
          } else {
            if (typeof currEl.type === 'string') { // element
              const root = document.createElement(currEl.type);
              this.#reconcile(h(currEl.type, {}), currEl, root);
              insertNodeAtPosition(domNode, root, domIndex.value++);
            } else if (currEl.type !== null) { // component
              const newCtx: ComponentContext = {
                hookData: [],
                fx: [],
                self: { value: currEl },
                prevProps: currEl.props,
                prevTree: null
              };

              switchAndRestoreContext(newCtx, () => {
                const newElement = reinstantiate((currEl.type as FC)(currEl.props));
                currEl.__domStart = domIndex.value;
                currEl.__ref = domNode;

                this.#reconcile(
                  h(null, null),
                  h(null, null, newElement),
                  domNode, domIndex
                );

                currEl.__domEnd = domIndex.value;
                currEl.__context = newCtx;
                newCtx.prevTree = newElement;

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
            this.#pending.delete(prevEl.__context!.self);

            this.#reconcile(
              h(null, null, prevEl.__context!.prevTree),
              h(null, null, currNode),
              domNode, domIndex
            );

            for (const item of prevEl.__context!.fx) {
              item.cb?.();
            }
          } else {
            if (prevType === FreactNodeType.ELEMENT) {
              if (prevChildren.length > 0) {
                this.#reconcile(
                  prevEl,
                  h(null, null),
                  domNode.childNodes[domIndex.value] as HTMLElement
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

  __internalAddPending(component: { value: FreactElement }) {
    this.#pending.add(component);
  }

  __internalUpdate() {
    if (this.#isEnqueued) return;

    this.#isEnqueued = true;
    requestIdleCallback(() => {
      context.root = this;

      for (const item of this.#pending) {
        const rootIndex = { value: item.value.__domStart! };
        this.#pending.delete(item);

        this.#reconcile(
          h(null, null, item.value),
          reinstantiate(h(null, null, item.value)),
          item.value.__ref!,
          rootIndex
        );
      }

      this.#isEnqueued = false;
    });
  }

  render(node: FreactElement) {
    context.root = this;
    this.#reconcile(
      h(null, null),
      reinstantiate(h(null, null, node)),
      this.#rootEl
    );
  }
}

export function createRoot(rootSelector: string) {
  const rootEl = document.querySelector<HTMLElement>(rootSelector);
  if (!rootEl) throw new Error("Root element doesn't exist");
  return new Root(rootEl);
}
