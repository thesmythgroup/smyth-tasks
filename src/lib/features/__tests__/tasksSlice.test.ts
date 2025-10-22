import tasksReducer, {
  addTask,
  updateTask,
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
  tagIds: [],
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

  it("should handle updateTask to toggle completed", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const actual = tasksReducer(
      state,
      updateTask({ id: mockTask.id, completed: true })
    );
    expect(actual.items[0].completed).toBe(true);
    expect(actual.items[0].updatedAt).toBeDefined();
  });

  it("should handle updateTask to update tagIds", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const actual = tasksReducer(
      state,
      updateTask({ id: mockTask.id, tagIds: ["tag1", "tag2"] })
    );
    expect(actual.items[0].tagIds).toEqual(["tag1", "tag2"]);
    expect(actual.items[0].updatedAt).toBeDefined();
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
