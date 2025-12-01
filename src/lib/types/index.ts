export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type PriorityLevel = 0 | 1 | 2; // 0: Ghost Pepper, 1: Jalapeño, 2: Minnesotan

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: PriorityLevel;
  userId: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'mention';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  taskId: string;
  commentId: string;
  mentionedBy: string;
  mentionedByName: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface RootState {
  user: UserState;
  tasks: TasksState;
  comments: CommentsState;
  notifications: NotificationsState;
}

export interface UserState {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
}

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

export interface CommentsState {
  items: Comment[];
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}
