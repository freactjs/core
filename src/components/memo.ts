import { FC, MemoComparatorType } from "../types";
import { h } from "../createElement";
import { useMemo } from "../hooks/useMemo";
import { context } from "../context";

const defaultMemoComparator: MemoComparatorType = (oldProps, newProps) => {
  const newKeys = Object.keys(newProps);
  if (newKeys.length !== Object.keys(oldProps).length) return false;

  const newHasChildren = Object.hasOwn(newProps, 'children');
  if (Object.hasOwn(oldProps, 'children') !== newHasChildren) return false;

  if (newHasChildren) {
    if (oldProps.children.length !== newProps.children.length)
      return false;

    for (let i = 0; i < newProps.children.length; i++) {
      if (!Object.is(newProps.children[i], oldProps.children[i]))
        return false;
    }
  }

  for (const key of newKeys) {
    if (key === 'children') continue;
    if (!Object.is(oldProps[key], newProps[key]))
      return false;
  }

  return true;
};

export function memo<T>(
  component: FC<T>,
  arePropsEqual: MemoComparatorType = defaultMemoComparator
): FC<T> {
  let toggle: boolean = false;
  return (props) => {
    toggle = arePropsEqual(
      context.self?.value.__context?.prevProps ?? {},
      props
    ) ? toggle : !toggle;

    const res = useMemo(() => {
      return h(component, props);
    }, [toggle]);
    return res;
  };
}
