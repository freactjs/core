import Freact, { FC, useState } from "../src";

export const App: FC = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>count: {count}</div>
      <button onClick={() => setCount(x => x - 1)}>-</button>
      <button onClick={() => setCount(x => x + 1)}>+</button>
    </>
  );
};
