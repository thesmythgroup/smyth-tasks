export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type PriorityLevel = 0 | 1 | 2; // 0: Ghost Pepper, 1: Jalapeño, 2: Minnesotan

export interface Tag {
  id: string;
  name: string;
  color: string; // predefined color key
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: PriorityLevel;
  userId: string;
  dueDate: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RootState {
  user: UserState;
  tasks: TasksState;
  tags: TagsState;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

export interface TagsState {
  items: Tag[];
}
