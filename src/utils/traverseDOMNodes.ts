import { FreactElement, FreactFrygment, FreactNode, FreactNodeType } from "../types";
import { getNodeType } from "./getNodeType";

export function* traverseDOMNodes(
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
