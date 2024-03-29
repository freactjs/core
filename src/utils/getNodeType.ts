import { FreactElement, FreactNode, FreactNodeType } from "../types";

export function getNodeType(node: FreactNode): FreactNodeType {
  if (typeof node === 'object' && node !== null) {
    if (Array.isArray(node)) return FreactNodeType.FRAGMENT;
    return typeof (node as FreactElement).type === 'function'
      ? FreactNodeType.COMPONENT
      : FreactNodeType.ELEMENT;
  } else if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint')
    return FreactNodeType.LITERAL;
  else {
    return FreactNodeType.NODRAW;
  }
}
