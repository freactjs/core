import { FreactElement, FreactFragment } from "../types";
import { traverseDOMNodes } from "./traverseDOMNodes";

export function detachDOMNodes(node: FreactElement | FreactFragment, domNode: Element): Node[] {
  const nodesToMove = [...traverseDOMNodes(node, domNode)];
  for (const node of nodesToMove) {
    domNode.removeChild(node);
  }

  return nodesToMove;
}
