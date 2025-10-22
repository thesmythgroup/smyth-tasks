import tasksReducer, {
  addTask,
  toggleTask,
  removeTask,
  setTasks,
  clearTasks,
  reorderTasks,
} from "../tasksSlice";
import { Task } from "@/lib/types";

const mockTask: Task = {
  id: "1",
  title: "Test Task",
  completed: false,
  userId: "user1",
  order: 0,
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

  it("should handle reorderTasks", () => {
    const task1: Task = { ...mockTask, id: "1", title: "Task 1", order: 0 };
    const task2: Task = { ...mockTask, id: "2", title: "Task 2", order: 1 };
    const task3: Task = { ...mockTask, id: "3", title: "Task 3", order: 2 };

    const state = {
      ...initialState,
      items: [task1, task2, task3],
    };

    // Reorder: move task3 to first position
    const reorderedTasks = [
      { ...task3, order: 0 },
      { ...task1, order: 1 },
      { ...task2, order: 2 },
    ];

    const actual = tasksReducer(state, reorderTasks(reorderedTasks));
    expect(actual.items).toHaveLength(3);
    expect(actual.items[0].id).toBe("3");
    expect(actual.items[1].id).toBe("1");
    expect(actual.items[2].id).toBe("2");
    expect(actual.items[0].order).toBe(0);
    expect(actual.items[1].order).toBe(1);
    expect(actual.items[2].order).toBe(2);
  });
});
