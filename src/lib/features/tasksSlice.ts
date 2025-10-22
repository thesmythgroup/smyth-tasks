import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task, TasksState } from "../types";

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
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
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
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addTask,
  toggleTask,
  removeTask,
  setTasks,
  setLoading,
  setError,
  clearTasks,
  reorderTasks,
} = tasksSlice.actions;
export default tasksSlice.reducer;
