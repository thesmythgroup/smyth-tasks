export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RootState {
  user: UserState;
  tasks: TasksState;
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
