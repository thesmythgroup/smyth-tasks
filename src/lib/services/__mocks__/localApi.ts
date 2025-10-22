import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const localApi = createApi({
  reducerPath: "localApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task", "User"],
  endpoints: () => ({}),
});

export const useGetTasksQuery = jest.fn();
export const useAddTaskMutation = jest.fn(() => [
  jest.fn(),
  { isLoading: false },
]);
export const useUpdateTaskMutation = jest.fn(() => [
  jest
    .fn()
    .mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    ),
  { isLoading: false },
]);
export const useDeleteTaskMutation = jest.fn(() => [
  jest
    .fn()
    .mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    ),
  { isLoading: false },
]);
export const useGetUserQuery = jest.fn();
export const useUpdateUserMutation = jest.fn(() => [
  jest.fn(),
  { isLoading: false },
]);
