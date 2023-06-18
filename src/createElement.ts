import { Fragment } from "./index";
import { FreactElement, FreactNode } from "./types";

export function h(
  type: FreactElement['type'],
  props: { [K: string]: any; } | null,
  ...children: FreactNode[]
): FreactElement {
  const hasKey = props && Object.hasOwn(props, 'key');

  const key = props?.key;
  delete props?.key;

  if (type === Fragment) {
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
