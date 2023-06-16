import { h, Frygment, FC } from '../../src';
import { Footer } from './Footer';
import { TodoBox } from './TodoBox';

export const App: FC = () => {
  return (
    <>
      <TodoBox />
      <Footer />
    </>
  );
};
