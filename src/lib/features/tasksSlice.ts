import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksState, PriorityLevel } from '../types';

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload);
    },
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.items.find((t) => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
      }
    },
    updateTaskPriority: (
      state,
      action: PayloadAction<{ id: string; priority: PriorityLevel }>
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.priority = action.payload.priority;
        task.updatedAt = new Date().toISOString();
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    updateTaskDueDate: (
      state,
      action: PayloadAction<{ id: string; dueDate: string | null }>
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.dueDate = action.payload.dueDate;
        task.updatedAt = new Date().toISOString();
      }
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearTasks: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
    removeTagFromTasks: (state, action: PayloadAction<string>) => {
      state.items.forEach((task) => {
        if (task.tagIds) {
          task.tagIds = task.tagIds.filter((tagId) => tagId !== action.payload);
        }
      });
    },
    updateTaskTags: (
      state,
      action: PayloadAction<{ id: string; tagIds: string[] }>
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.tagIds = action.payload.tagIds;
        task.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  addTask,
  toggleTask,
  updateTaskPriority,
  removeTask,
  updateTaskDueDate,
  setTasks,
  setLoading,
  setError,
  clearTasks,
  removeTagFromTasks,
  updateTaskTags,
} = tasksSlice.actions;
export default tasksSlice.reducer;
