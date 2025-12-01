import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task, TasksState, PriorityLevel } from "../types";

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
    updateTaskPriority: (state, action: PayloadAction<{ id: string; priority: PriorityLevel }>) => {
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
    reorderTasks: (
      state,
      action: PayloadAction<{ activeId: string; overId: string }>
    ) => {
      const { activeId, overId } = action.payload;
      const tasks = [...state.items];
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return;
      }

      // Sort tasks by order (or createdAt if no order)
      const sortedTasks = [...tasks].sort((a, b) => {
        const aOrder = a.order ?? Infinity;
        const bOrder = b.order ?? Infinity;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // Find indices in sorted array
      const sortedActiveIndex = sortedTasks.findIndex((t) => t.id === activeId);
      const sortedOverIndex = sortedTasks.findIndex((t) => t.id === overId);

      if (sortedActiveIndex === -1 || sortedOverIndex === -1) return;

      // Remove active task and insert at new position
      const [movedTask] = sortedTasks.splice(sortedActiveIndex, 1);
      sortedTasks.splice(sortedOverIndex, 0, movedTask);

      // Update order values for all tasks
      sortedTasks.forEach((task, index) => {
        const stateTask = state.items.find((t) => t.id === task.id);
        if (stateTask) {
          stateTask.order = index;
          stateTask.updatedAt = new Date().toISOString();
        }
      });
    },
    moveTaskToPriority: (
      state,
      action: PayloadAction<{ taskId: string; newPriority: PriorityLevel; newOrder?: number }>
    ) => {
      const { taskId, newPriority, newOrder } = action.payload;
      const task = state.items.find((t) => t.id === taskId);
      if (!task) return;

      const oldPriority = task.priority;
      task.priority = newPriority;
      task.updatedAt = new Date().toISOString();

      // Get all tasks sorted by order
      const sortedTasks = [...state.items].sort((a, b) => {
        const aOrder = a.order ?? Infinity;
        const bOrder = b.order ?? Infinity;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // Find the task in sorted array
      const taskIndex = sortedTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return;

      // Remove task from its current position
      sortedTasks.splice(taskIndex, 1);

      // If newOrder is provided, insert at that position; otherwise find appropriate position
      if (newOrder !== undefined) {
        sortedTasks.splice(newOrder, 0, task);
      } else {
        // Find position after last task with same priority
        const lastSamePriorityIndex = sortedTasks
          .map((t, idx) => ({ task: t, idx }))
          .filter(({ task: t }) => t.priority === newPriority)
          .pop()?.idx;
        const insertIndex = lastSamePriorityIndex !== undefined ? lastSamePriorityIndex + 1 : sortedTasks.length;
        sortedTasks.splice(insertIndex, 0, task);
      }

      // Update order for all tasks
      sortedTasks.forEach((t, index) => {
        const stateTask = state.items.find((item) => item.id === t.id);
        if (stateTask) {
          stateTask.order = index;
          stateTask.updatedAt = new Date().toISOString();
        }
      });
    },
    setTaskOrder: (
      state,
      action: PayloadAction<{ taskId: string; order: number }>
    ) => {
      const { taskId, order } = action.payload;
      const task = state.items.find((t) => t.id === taskId);
      if (task) {
        task.order = order;
        task.updatedAt = new Date().toISOString();
      }
    },
    reorderMultipleTasks: (
      state,
      action: PayloadAction<Array<{ taskId: string; order: number }>>
    ) => {
      action.payload.forEach(({ taskId, order }) => {
        const task = state.items.find((t) => t.id === taskId);
        if (task) {
          task.order = order;
          task.updatedAt = new Date().toISOString();
        }
      });
    },
    clearTaskOrder: (state) => {
      state.items.forEach((task) => {
        delete task.order;
        task.updatedAt = new Date().toISOString();
      });
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
  reorderTasks,
  moveTaskToPriority,
  setTaskOrder,
  reorderMultipleTasks,
  clearTaskOrder,
} = tasksSlice.actions;
export default tasksSlice.reducer;
