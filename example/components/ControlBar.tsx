import { FC, StateSetter } from '@/index';
import { FilterType } from "../typeDefs";

export const ControlBar: FC<{
  count: number;
  filter: FilterType;
  setFilter?: StateSetter<FilterType>;
  onClear?: () => any;
}> = ({ count, filter, setFilter, onClear }) => {
  return (
    <footer class="footer">
      <span class="todo-count">
        <strong>{count}</strong> item{count !== 1 ? 's' : ''} left
      </span>
      <ul class="filters">
        <li>
          <a
            class={`${filter === FilterType.ALL ? 'selected': ''}`}
            onClick={() => setFilter?.(FilterType.ALL)}
          >All</a>
        </li>
        <li>
          <a
            class={`${filter === FilterType.ACTIVE ? 'selected': ''}`}
            onClick={() => setFilter?.(FilterType.ACTIVE)}
          >Active</a>
        </li>
        <li>
          <a
            class={`${filter === FilterType.COMPLETED ? 'selected': ''}`}
            onClick={() => setFilter?.(FilterType.COMPLETED)}
          >Completed</a>
        </li>
      </ul>
      <button
        class="clear-completed"
        onClick={onClear}
      >Clear completed</button>
    </footer>
  );
};
