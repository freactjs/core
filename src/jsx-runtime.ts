import { FreactElement, PropsWithChildren } from "./types";

export const Fragment = Symbol.for('freact.fragment');

export function jsx(type: FreactElement['type'], props: PropsWithChildren<{ [K: string]: any; }>, key: any): FreactElement {
  const hasKey = typeof key !== 'undefined';

  let children = props.children ?? [];
  if (!Array.isArray(children))
    children = [children];

  if (type === Fragment) {
    if (hasKey) (children as any).key = key;
    return children as any;
  }

  const res: FreactElement = {
    type,
    props: {
      ...props,
      children
    }
  };

  if (hasKey) res.key = key;
  return res;
}

