export function insertNodeAtPosition(parent: Element, child: Node | string | number, index: number) {
  const node = typeof child === 'object' ?
    child : document.createTextNode(`${child}`);

  if (parent.childNodes.length > 0) {
    parent.insertBefore(node, parent.childNodes[index]);
  } else {
    parent.appendChild(node);
  }
}
