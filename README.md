# Freact

Freact is a VDOM-based component library that aims to mimic the API of React. Create a new Freact project by running one of these commands:

```sh
npm init @freact    # npm
yarn create @freact    # yarn
pnpm create @freact    # pnpm
```

Supported React features:

- Function Components
- Fragment
- createContext
- memo
- Hooks
  - useState
  - useEffect
  - useRef
  - useReducer
  - useMemo
  - useCallback
  - useContext

Minimal code example for Freact:

```jsx
import { createRoot } from 'freact';

createRoot('#app').render(
  <div>this is a Freact app</div>
);
```
