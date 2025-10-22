import tasksReducer, {
  addTask,
  toggleTask,
  removeTask,
  setTasks,
  clearTasks,
} from "../tasksSlice";
import { Task } from "@/lib/types";

const mockTask: Task = {
  id: "1",
  title: "Test Task",
  completed: false,
  userId: "user1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("tasksSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should handle initial state", () => {
    expect(tasksReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle addTask", () => {
    const actual = tasksReducer(initialState, addTask(mockTask));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0]).toEqual(mockTask);
  });

  it("should handle toggleTask", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const actual = tasksReducer(state, toggleTask(mockTask.id));
    expect(actual.items[0].completed).toBe(true);
  });

  it("should handle removeTask", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const actual = tasksReducer(state, removeTask(mockTask.id));
    expect(actual.items).toHaveLength(0);
  });

  it("should handle setTasks", () => {
    const tasks = [mockTask];
    const actual = tasksReducer(initialState, setTasks(tasks));
    expect(actual.items).toEqual(tasks);
  });

  it("should handle clearTasks", () => {
    const state = {
      ...initialState,
      items: [mockTask],
      loading: true,
      error: "error",
    };
    const actual = tasksReducer(state, clearTasks());
    expect(actual).toEqual(initialState);
  });
});
