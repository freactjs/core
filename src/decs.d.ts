declare namespace JSX {
  interface IntrinsicElements {
    [K: string]: {
      [L: string]: any;
      ref?: { current: Element | null; };
    };
  }
}
