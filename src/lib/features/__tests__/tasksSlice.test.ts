import tasksReducer, {
  addTask,
  toggleTask,
  removeTask,
  setTasks,
  clearTasks,
  updateTaskDueDate,
  updateTaskDescription,
} from "../tasksSlice";
import { Task } from "@/lib/types";

const mockTask: Task = {
  id: "1",
  title: "Test Task",
  completed: false,
  priority: 1,
  userId: "user1",
  dueDate: "2025-10-25",
  description: null,
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

  it("should handle addTask with dueDate", () => {
    const taskWithDueDate: Task = {
      ...mockTask,
      dueDate: "2025-12-31",
    };
    const actual = tasksReducer(initialState, addTask(taskWithDueDate));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0].dueDate).toBe("2025-12-31");
  });

  it("should handle addTask without dueDate", () => {
    const taskWithoutDueDate: Task = {
      ...mockTask,
      dueDate: null,
    };
    const actual = tasksReducer(initialState, addTask(taskWithoutDueDate));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0].dueDate).toBeNull();
  });

  it("should handle updateTaskDueDate", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const newDueDate = "2025-11-01";
    const actual = tasksReducer(
      state,
      updateTaskDueDate({ id: mockTask.id, dueDate: newDueDate })
    );
    expect(actual.items[0].dueDate).toBe(newDueDate);
    expect(actual.items[0].updatedAt).not.toBe(mockTask.updatedAt);
  });

  it("should handle updateTaskDueDate to null", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const actual = tasksReducer(
      state,
      updateTaskDueDate({ id: mockTask.id, dueDate: null })
    );
    expect(actual.items[0].dueDate).toBeNull();
  });

  it("should handle updateTaskDescription", () => {
    const state = {
      ...initialState,
      items: [mockTask],
    };
    const newDescription = "This is a test description";
    const actual = tasksReducer(
      state,
      updateTaskDescription({ id: mockTask.id, description: newDescription })
    );
    expect(actual.items[0].description).toBe(newDescription);
    expect(actual.items[0].updatedAt).not.toBe(mockTask.updatedAt);
  });

  it("should handle updateTaskDescription to null", () => {
    const taskWithDescription: Task = {
      ...mockTask,
      description: "Some description",
    };
    const state = {
      ...initialState,
      items: [taskWithDescription],
    };
    const actual = tasksReducer(
      state,
      updateTaskDescription({ id: mockTask.id, description: null })
    );
    expect(actual.items[0].description).toBeNull();
  });
});
