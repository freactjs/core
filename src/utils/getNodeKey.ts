import { FreactNode, KeyType } from "../types";

export function getNodeKey(node: FreactNode): KeyType | null {
  if (
    typeof node !== 'object' ||
    node === null ||
    !Object.hasOwn(node, 'key') ||
    (
      typeof node.key !== 'bigint' &&
      typeof node.key !== 'boolean' &&
      typeof node.key !== 'number' &&
      typeof node.key !== 'string' &&
      typeof node.key !== 'symbol' &&
      typeof node.key !== 'object'
    )
  ) {
    return null;
  }

  return node.key;
}
