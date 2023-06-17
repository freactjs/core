import { FC, useState } from '@/index';

export const TodoHeader: FC<{ onSubmit?: (text: string) => any }> = ({ onSubmit }) => {
  const [input, setInput] = useState('');

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || input.trim().length < 1) return;
    onSubmit?.(input.trim());
    setInput('');
  };

  return (
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        value={input}
        onInput={(e: any) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        autofocus
      />
    </header>
  );
};
