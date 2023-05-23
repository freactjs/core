import { FreactElement, FreactFrygment, FreactNodeType, Ref, KeyType, FC, HookData } from "./types";
import { detachDOMNodes } from "./utils/detachDOMNodes";
import { getNodeKey } from "./utils/getNodeKey";
import { updateAttribute } from "./utils/updateAttribute";
import { context } from "./context";
import { insertNodeAtPosition } from "./utils/insertNodeAtPosition";
import { h } from "./createElement";
import { getNodeType } from "./utils/getNodeType";
import { switchAndRestoreContext } from "./utils/switchAndRestoreContext";
import { executeEffects } from "./utils/executeEffects";
import { contextData } from "./createContext";

export class Root {
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