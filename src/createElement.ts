import { Fragment } from "./index";
import { FreactElement, FreactNode } from "./types";

export function h(
  type: FreactElement['type'] | null,
  props: { [K: string]: any; } | null,
  ...children: FreactNode[]
): FreactElement {
  const hasKey = props && Object.hasOwn(props, 'key');

  const key = props?.key;
  delete props?.key;

  if (type === Fragment) {
    if (hasKey) (children as any).key = key;
    return children.length > 0 ? children : undefined as any;
  }

  const res: FreactElement = {
    type: type!,
    props: {
      ...props
    }
  };

  if (children.length > 0)
    res.props.children = children.length > 1 ? children : children[0];

  if (hasKey) res.key = key;
  return res;
}
