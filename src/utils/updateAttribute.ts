function recurseAttribs(target: any, val: any) {
  for (const key of Object.keys(val)) {
    if (typeof val[key] === 'object') {
      recurseAttribs(target[key], val[key]);
    } else {
      target[key] = val[key];
    }
  }
}

export function updateAttribute(domNode: Element, attr: string, val: any) {
  if (attr === 'class') attr = 'className';
  if (typeof val === 'object') {
    recurseAttribs((domNode as any)[attr], val);
  } else {
    (domNode as any)[attr] = val;
  }
}
