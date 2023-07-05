import { FreactElement, FreactNode } from "..";

export function getChildrenArray(el: FreactElement): FreactNode[] {
  if (!Object.hasOwn(el.props, 'children')) return [];
  return Array.isArray(el.props.children)
    ? el.props.children
    : [el.props.children];
}
