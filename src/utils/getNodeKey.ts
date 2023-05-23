import { FreactNode, KeyType } from "../types";

export function getNodeKey(node: FreactNode): KeyType | null {
  if (typeof node !== 'object' || node === null || !Object.hasOwn(node, 'key')) {
    return null;
  }

  return node.key;
}
