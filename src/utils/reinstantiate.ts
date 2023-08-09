import { FreactElement, FreactNode, FreactNodeType } from "@/types";
import { getNodeType } from "./getNodeType";

export function reinstantiate<T extends FreactNode>(node: T): T {
  const data = Array.isArray(node) ? [...node] : [node];

  for (let i = 0; i < data.length; i++) {
    const el = data[i] as FreactElement;

    switch (getNodeType(el)) {
      case FreactNodeType.COMPONENT: {
        data[i] = {
          type: el.type,
          props: { ...el.props },
          __vnode: el
        };

        if (Object.hasOwn(el, 'key'))
          data[i].key = el.key;

        break;
      }
      case FreactNodeType.ELEMENT: {
        const copy: FreactElement = {
          type: el.type,
          props: { ...el.props },
          __vnode: el
        };

        if (Object.hasOwn(el, 'key'))
          copy.key = el.key;

        if (el.props.children) {
          copy.props.children = reinstantiate(copy.props.children);
        }

        data[i] = copy;
        break;
      }
      case FreactNodeType.FRAGMENT: {
        const copy = reinstantiate(el);

        if (Object.hasOwn(el, 'key'))
          copy.key = el.key;

        copy.__vnode = el;
        data[i] = copy;
        break;
      }
    }
  }

  return Array.isArray(node) ? data : data[0];
}
