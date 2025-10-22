import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Task, User, Tag } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  addTask,
  removeTask,
  setTasks,
  updateTask,
} from "../features/tasksSlice";
import {
  addTag,
  removeTag,
  setTags,
  updateTag as updateTagAction,
} from "../features/tagsSlice";
import { saveState, loadState } from "../utils/localStorage";

// Helper to simulate async behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const localApi = createApi({
  reducerPath: "localApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task", "User", "Tag"],
  endpoints: (builder) => ({
    // Task endpoints
    getTasks: builder.query<Task[], void>({
      queryFn: async (_, { dispatch }) => {
        await delay(100);
        const state = loadState();
        const tasks = state?.tasks?.items || [];
        dispatch(setTasks(tasks));
        return { data: tasks };
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
          tagIds: task.tagIds || [],
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
        dispatch(updateTask(update));
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

    // Tag endpoints
    getTags: builder.query<Tag[], void>({
      queryFn: async (_, { dispatch }) => {
        await delay(100);
        const state = loadState() as { tags?: { items: Tag[] } } | undefined;
        const tags = state?.tags?.items || [];
        dispatch(setTags(tags));
        return { data: tags };
      },
      providesTags: ["Tag"],
    }),

    addTag: builder.mutation<Tag, Omit<Tag, "id" | "createdAt" | "updatedAt">>({
      queryFn: async (tag, { dispatch, getState }) => {
        await delay(100);
        const newTag: Tag = {
          ...tag,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(addTag(newTag));
        const state = getState();
        saveState(state);
        return { data: newTag };
      },
      invalidatesTags: ["Tag"],
    }),

    updateTag: builder.mutation<Tag, Partial<Tag> & { id: string }>({
      queryFn: async (update, { dispatch, getState }) => {
        await delay(100);
        const state = getState() as { tags: { items: Tag[] } };
        const existingTag = state.tags.items.find((t) => t.id === update.id);
        if (!existingTag) {
          return { error: { status: 404, data: "Tag not found" } };
        }
        const updatedTag: Tag = {
          ...existingTag,
          ...update,
          updatedAt: new Date().toISOString(),
        };
        dispatch(updateTagAction(updatedTag));
        const newState = getState();
        saveState(newState);
        return { data: updatedTag };
      },
      invalidatesTags: ["Tag"],
    }),

    deleteTag: builder.mutation<{ success: boolean }, string>({
      queryFn: async (tagId, { dispatch, getState }) => {
        await delay(100);
        // Remove tag from all tasks that reference it
        const state = getState() as { tasks: { items: Task[] } };
        const tasksWithTag = state.tasks.items.filter((task) =>
          task.tagIds.includes(tagId)
        );

        // Update each task to remove the tag reference
        tasksWithTag.forEach((task) => {
          const updatedTagIds = task.tagIds.filter((id) => id !== tagId);
          dispatch(updateTask({ id: task.id, tagIds: updatedTagIds }));
        });

        // Remove the tag itself
        dispatch(removeTag(tagId));
        const newState = getState();
        saveState(newState);
        return { data: { success: true } };
      },
      invalidatesTags: ["Tag", "Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useGetTagsQuery,
  useAddTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = localApi;
