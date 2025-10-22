// Predefined tag colors
export const TAG_COLORS = {
  BLUE: "#3B82F6",
  GREEN: "#10B981",
  YELLOW: "#F59E0B",
  RED: "#EF4444",
  PURPLE: "#8B5CF6",
  PINK: "#EC4899",
  INDIGO: "#6366F1",
  TEAL: "#14B8A6",
} as const;

export type TagColor = (typeof TAG_COLORS)[keyof typeof TAG_COLORS];

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
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
  loading: boolean;
  error: string | null;
}
