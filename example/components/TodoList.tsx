import { h, FC } from '@/index';
import { TodoItemType } from "../typeDefs";
import { TodoItem } from "./TodoItem";

export const TodoList: FC<{
  data: TodoItemType[];
  leftCount: number;
  onToggle?: (index: number) => any;
  onDestroy?: (index: number) => any;
  onSetEdit?: (index: number, val: boolean) => any;
  onFinishEdit?: (index: number, value: string) => any;
  onToggleAll?: () => any;
}> = ({
  data, leftCount, onToggle, onDestroy,
  onSetEdit, onFinishEdit, onToggleAll
}) => {
  return (
    <section class="main">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        checked={leftCount < 1}
      />
      <label
        for="toggle-all"
        onClick={onToggleAll}
      >Mark all as complete</label>
      <ul class="todo-list">
        {data.map(item => <TodoItem
          data={item}
          key={item.id}
          onToggle={() => onToggle?.(item.id)}
          onDestroy={() => onDestroy?.(item.id)}
          onSetEdit={val => onSetEdit?.(item.id, val)}
          onFinishEdit={val => onFinishEdit?.(item.id, val)}
        />)}
      </ul>
    </section>
  );
};
