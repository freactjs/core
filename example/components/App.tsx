import { FC } from '@/index';
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
