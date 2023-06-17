import { FC, useEffect, useRef, useState } from '@/index';
import { TodoItemType } from "../typeDefs";

export const TodoItem: FC<{
  data: TodoItemType;
  onToggle?: () => any;
  onDestroy?: () => any;
  onSetEdit?: (val: boolean) => any;
  onFinishEdit?: (val: string) => any;
}> = ({
  data, onToggle, onDestroy,
  onSetEdit, onFinishEdit
}) => {
  const [input, setInput] = useState('');
  const inpRef = useRef<HTMLInputElement>(null);
  let editCanceled = false;

  useEffect(() => {
    if (!data.editing) return;
    inpRef.current?.focus();
  }, [data.editing]);

  const onDblClick = () => {
    setInput(data.text);
    onSetEdit?.(true);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      editCanceled = false;
      (e.target as any).blur();
    } else if (e.key === 'Escape') {
      editCanceled = true;
      (e.target as any).blur();
    }
  };

  const onBlur = () => {
    if (editCanceled) {
      onSetEdit?.(false);
    } else {
      onFinishEdit?.(input);
    }
  };

  return (
    <li class={`todo ${data.done ? 'completed' : ''} ${data.editing ? 'editing' : ''}`}>
      <div class="view">
        <input class="toggle" type="checkbox" checked={data.done} onChange={onToggle} />
        <label onDblClick={onDblClick}>{data.text}</label>
        <button class="destroy" onClick={onDestroy}></button>
      </div>
      {data.editing && <input
        ref={inpRef}
        class="edit"
        value={input}
        onInput={(e: any) => setInput(e.target.value)}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
      />}
    </li>
  );
};
