import { FC, FreactElement, FreactNode, PropsWithChildren } from "./types";

export const Fragment = Symbol.for('freact.fragment') as any as FC<{ children: FreactNode }>;

export function jsx(type: FreactElement['type'], props: PropsWithChildren<{ [K: string]: any; }>, key: any): FreactElement {
  const hasKey = typeof key !== 'undefined';

  if (type === Fragment) {
    if (!props.children) return undefined as any;
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];

    if (hasKey) (children as any).key = key;
    return children as any;
  }

  const res: FreactElement = {
    type,
    props
  };

  if (hasKey) res.key = key;
  return res;
}

export { jsx as jsxs };
