import { FC, useCallback, useEffect, useMemo, useState } from '@/index';
import { ControlBar } from "./ControlBar";
import { TodoList } from "./TodoList";
import { TodoHeader } from "./TodoHeader";
import { FilterType, TodoItemType } from "../typeDefs";

let idCounter = 0;

const initialData: TodoItemType[] = JSON.parse(
  localStorage.getItem('list') ?? '[]'
).map((x: TodoItemType) => ({ ...x, id: idCounter++, editing: false }));

export const TodoBox: FC = () => {
  const [data, setData] = useState<TodoItemType[]>(initialData);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const leftCount = useMemo(() => data.filter(x => !x.done).length, [data]);

  const filteredData = (() => {
    if (filter === FilterType.ALL) return data;
    return filter === FilterType.ACTIVE
      ? data.filter(x => !x.done)
      : data.filter(x => x.done);
  })();

  useEffect(() => {
    localStorage.setItem('list', JSON.stringify(
      data.map(x => ({ text: x.text, done: x.done }))
    ));
  }, [data]);

  const onSubmit = useCallback((text: string) => {
    setData(val => [...val, {
      id: idCounter++,
      text,
      done: false,
      editing: false
    }]);
  }, []);

  const onToggle = useCallback((id: number) => {
    setData(val => val.map(x => x.id !== id ? x : {
      ...x,
      done: !x.done
    }));
  }, []);

  const onSetEdit = useCallback((id: number, newVal: boolean) => {
    setData(val => val.map(x => x.id !== id ? x : {
      ...x,
      editing: newVal
    }));
  }, []);

  const onFinishEdit = useCallback((id: number, newVal: string) => {
    setData(val => val.map(x => x.id !== id ? x : {
      ...x,
      text: newVal.trim(),
      editing: false
    }));
  }, []);

  const onToggleAll = useCallback(() => {
    setData(val => val.map(x => ({ ...x, done: leftCount > 0 })));
  }, [leftCount]);

  return (
    <section class="todoapp">
      <TodoHeader onSubmit={onSubmit} />
      {data.length > 0 && <>
        <TodoList
          data={filteredData}
          leftCount={leftCount}
          onToggle={onToggle}
          onDestroy={id => setData(val => val.filter(x => x.id !== id))}
          onSetEdit={onSetEdit}
          onFinishEdit={onFinishEdit}
          onToggleAll={onToggleAll}
        />
        <ControlBar
          count={leftCount}
          filter={filter}
          setFilter={setFilter}
          onClear={() => setData(val => val.filter(x => !x.done))}
        />
      </>}
    </section>
  );
};
