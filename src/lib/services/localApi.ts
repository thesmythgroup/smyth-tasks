import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Task, User, PriorityLevel, TasksState } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  addTask,
  removeTask,
  setTasks,
  toggleTask,
  updateTaskDueDate,
  updateTaskPriority,
} from "../features/tasksSlice";
import { saveState, loadState } from "../utils/localStorage";

// Helper to simulate async behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const localApi = createApi({
  reducerPath: "localApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task", "User"],
  endpoints: (builder) => ({
    // Task endpoints
    getTasks: builder.query<Task[], void>({
      queryFn: async (_, { dispatch }) => {
        await delay(100);
        const state = loadState();
        const tasks = state?.tasks?.items || [];

        // Migrate old string-based priorities to numeric IDs
        const migratedTasks = tasks.map(
          (task: Task | (Omit<Task, "priority"> & { priority: string })) => {
            if (typeof task.priority === "string") {
              let priorityId: PriorityLevel;
              switch (task.priority) {
                case "ghost-pepper":
                  priorityId = 0;
                  break;
                case "jalapeño":
                  priorityId = 1;
                  break;
                case "minnesotan":
                  priorityId = 2;
                  break;
                default:
                  priorityId = 1; // Default to Jalapeño
              }
              return { ...task, priority: priorityId };
            }
            return task;
          }
        );

        dispatch(setTasks(migratedTasks));
        return { data: migratedTasks };
      },
      providesTags: ["Task"],
    }),

    addTask: builder.mutation<
      Task,
      Omit<Task, "id" | "createdAt" | "updatedAt">
    >({
      queryFn: async (task, { dispatch, getState }) => {
        await delay(100);
        const newTask: Task = {
          ...task,
          priority: task.priority ?? 1, // Default to Jalapeño (1)
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(addTask(newTask));
        const state = getState();
        saveState(state);
        return { data: newTask };
      },
      invalidatesTags: ["Task"],
    }),

    updateTask: builder.mutation<Task, Partial<Task> & { id: string }>({
      queryFn: async (update, { dispatch, getState }) => {
        await delay(100);
        if ("completed" in update) {
          dispatch(toggleTask(update.id));
        }
        if ("dueDate" in update) {
          dispatch(
            updateTaskDueDate({
              id: update.id,
              dueDate: update.dueDate || null,
            })
          );
        }
        if ("priority" in update) {
          dispatch(
            updateTaskPriority({ id: update.id, priority: update.priority! })
          );
        }
        const state = getState();
        saveState(state);
        const updatedTask = {
          ...update,
          updatedAt: new Date().toISOString(),
        } as Task;
        return { data: updatedTask };
      },
      invalidatesTags: ["Task"],
    }),

    deleteTask: builder.mutation<{ success: boolean }, string>({
      queryFn: async (taskId, { dispatch, getState }) => {
        await delay(100);
        dispatch(removeTask(taskId));
        const state = getState();
        saveState(state);
        return { data: { success: true } };
      },
      invalidatesTags: ["Task"],
    }),

    bulkUpdateTasks: builder.mutation<
      { success: boolean; updated: number },
      {
        taskIds: string[];
        updates: Partial<Task>;
      }
    >({
      queryFn: async ({ taskIds, updates }, { dispatch, getState }) => {
        await delay(100);
        let updatedCount = 0;

        // Handle completed updates
        if ("completed" in updates) {
          const state = getState() as { tasks: TasksState };
          taskIds.forEach((taskId) => {
            const task = state.tasks.items.find((t) => t.id === taskId);
            if (task && task.completed !== updates.completed) {
              dispatch(toggleTask(taskId));
              updatedCount++;
            }
          });
        }

        // Handle priority updates
        if ("priority" in updates && updates.priority !== undefined) {
          taskIds.forEach((taskId) => {
            dispatch(
              updateTaskPriority({
                id: taskId,
                priority: updates.priority as PriorityLevel,
              })
            );
            updatedCount++;
          });
        }

        const state = getState();
        saveState(state);
        return { data: { success: true, updated: updatedCount } };
      },
      invalidatesTags: ["Task"],
    }),

    bulkDeleteTasks: builder.mutation<
      { success: boolean; deleted: number },
      string[]
    >({
      queryFn: async (taskIds, { dispatch, getState }) => {
        await delay(100);
        taskIds.forEach((taskId) => {
          dispatch(removeTask(taskId));
        });
        const state = getState();
        saveState(state);
        return { data: { success: true, deleted: taskIds.length } };
      },
      invalidatesTags: ["Task"],
    }),

    // User endpoints
    getUser: builder.query<User | null, void>({
      queryFn: async () => {
        await delay(100);
        return { data: null }; // Initial state, will be populated from Redux
      },
      providesTags: ["User"],
    }),

    updateUser: builder.mutation<User, Partial<User> & { id: string }>({
      queryFn: async (update) => {
        await delay(100);
        return {
          data: {
            ...update,
            updatedAt: new Date().toISOString(),
          } as User,
        };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkUpdateTasksMutation,
  useBulkDeleteTasksMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} = localApi;
