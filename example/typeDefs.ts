export interface TodoItemType {
  id: number;
  text: string;
  done: boolean;
  editing: boolean;
}

export enum FilterType {
  ALL = 0,
  ACTIVE = 1,
  COMPLETED = 2
}
