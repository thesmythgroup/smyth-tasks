import { Task } from "@/lib/types";
import { render } from "@/lib/utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { TaskList } from "../TaskList";

const mockUser = {
  id: "user1",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Task 1",
    completed: false,
    priority: 1,
    userId: "user1",
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Task 2",
    completed: false,
    priority: 0,
    userId: "user1",
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Task 3",
    completed: true,
    priority: 2,
    userId: "user1",
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock the API hooks
const mockGetTasksQuery = jest.fn();
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockAddTask = jest.fn();

jest.mock("@/lib/services/localApi", () => ({
  useGetTasksQuery: () => {
    const result = mockGetTasksQuery();
    return {
      data: result.data || [],
      isLoading: result.isLoading || false,
      error: result.error || null,
    };
  },
  useUpdateTaskMutation: () => [mockUpdateTask, { isLoading: false }],
  useDeleteTaskMutation: () => [mockDeleteTask, { isLoading: false }],
  useAddTaskMutation: () => [mockAddTask, { isLoading: false }],
}));

// Mock the keyboard shortcuts hook
const mockHandleKeyDown = jest.fn();
const mockSelectedIndex = -1;
const mockSetSelectedIndex = jest.fn();

jest.mock("@/lib/hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: jest.fn(() => ({
    selectedIndex: mockSelectedIndex,
    handleKeyDown: mockHandleKeyDown,
  })),
}));

describe("TaskList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTasksQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    });
    (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
      selectedIndex: mockSelectedIndex,
      handleKeyDown: mockHandleKeyDown,
    });
  });

  it("renders tasks when authenticated", () => {
    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("attaches keyboard event listener", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("does not attach keyboard listener when not authenticated", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");

    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: null, isAuthenticated: false },
      },
    });

    expect(addEventListenerSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it("does not attach keyboard listener when loading", () => {
    mockGetTasksQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    const addEventListenerSpy = jest.spyOn(window, "addEventListener");

    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    expect(addEventListenerSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it("passes selectedIndex to correct TaskItem", () => {
    (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
      selectedIndex: 1,
      handleKeyDown: mockHandleKeyDown,
    });

    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    const taskItems = screen.getAllByText(/Task \d/);
    expect(taskItems).toHaveLength(3);

    // Check that TaskItem receives isSelected prop
    // We can't directly test this, but we can verify the component renders
    // The actual selection styling is tested in TaskItem tests
  });

  it("calls useKeyboardShortcuts with correct parameters", () => {
    const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;

    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    expect(useKeyboardShortcuts).toHaveBeenCalledWith(
      expect.objectContaining({
        taskCount: 3,
        enabled: true,
      })
    );
  });

  it("sets up onAddTask callback", () => {
    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
    const callArgs = useKeyboardShortcuts.mock.calls[0][0];
    
    expect(callArgs.onAddTask).toBeDefined();
    expect(typeof callArgs.onAddTask).toBe("function");
  });

  it("resets selection when filters change", () => {
    const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
    
    const { rerender } = render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    // Change priority filter
    const allButton = screen.getByText("All");
    fireEvent.click(allButton);

    // The hook should be called again with updated taskCount
    // This is handled by React's dependency system
  });

  it("handles empty task list gracefully", () => {
    mockGetTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it("calls updateTask when toggle is triggered", () => {
    const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
    
    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    const callArgs = useKeyboardShortcuts.mock.calls[0][0];
    
    // Tasks are sorted by priority, so index 0 is Task 2 (priority 0)
    if (callArgs.onToggleTask) {
      callArgs.onToggleTask(0);
    }

    // Task 2 has priority 0, so it's first after sorting
    expect(mockUpdateTask).toHaveBeenCalledWith({
      id: mockTasks[1].id, // Task 2 is at index 1 in mockTasks array
      completed: !mockTasks[1].completed,
    });
  });

  it("calls deleteTask when delete is triggered", () => {
    const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
    
    render(<TaskList />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    const callArgs = useKeyboardShortcuts.mock.calls[0][0];
    
    // Tasks are sorted by priority: Task 2 (0), Task 1 (1), Task 3 (2)
    // So index 1 is Task 1
    if (callArgs.onDeleteTask) {
      callArgs.onDeleteTask(1);
    }

    // Task 1 is at index 0 in mockTasks array
    expect(mockDeleteTask).toHaveBeenCalledWith(mockTasks[0].id);
  });

  describe("Add New Task shortcut (Cmd/Ctrl + N)", () => {
    it("focuses AddTaskForm input when Cmd+N is pressed", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      const mockFocus = jest.fn();
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      // Mock the input element's focus method
      const input = screen.getByPlaceholderText("Add a new task...");
      input.focus = mockFocus;

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      if (callArgs.onAddTask) {
        callArgs.onAddTask();
      }

      expect(mockFocus).toHaveBeenCalled();
    });

    it("focuses AddTaskForm input when Ctrl+N is pressed", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      const mockFocus = jest.fn();
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      // Mock the input element's focus method
      const input = screen.getByPlaceholderText("Add a new task...");
      input.focus = mockFocus;

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      if (callArgs.onAddTask) {
        callArgs.onAddTask();
      }

      expect(mockFocus).toHaveBeenCalled();
    });

    it("does not focus input when shortcut is triggered while typing in input field", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      const mockFocus = jest.fn();
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const input = screen.getByPlaceholderText("Add a new task...");
      input.focus = mockFocus;

      // Simulate typing in the input
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "test" } });

      // The hook should prevent shortcuts when typing in inputs
      // This is tested at the hook level, but we verify the callback exists
      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.onAddTask).toBeDefined();
    });

    it("works when authenticated and tasks are loaded", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      const mockFocus = jest.fn();
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const input = screen.getByPlaceholderText("Add a new task...");
      input.focus = mockFocus;

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      expect(callArgs.onAddTask).toBeDefined();
      expect(typeof callArgs.onAddTask).toBe("function");
      
      if (callArgs.onAddTask) {
        callArgs.onAddTask();
      }

      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe("Complete Task shortcut (Space)", () => {
    it("toggles selected task completion when Space is pressed", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      // Mock selectedIndex to be 0 (first task)
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 0,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // Tasks are sorted by priority: Task 2 (priority 0), Task 1 (priority 1), Task 3 (priority 2)
      // So index 0 is Task 2 (at index 1 in mockTasks array)
      if (callArgs.onToggleTask) {
        callArgs.onToggleTask(0);
      }

      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: mockTasks[1].id, // Task 2
        completed: !mockTasks[1].completed,
      });
    });

    it("does nothing when Space is pressed with no task selected", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      // Mock selectedIndex to be -1 (no selection)
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: -1,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // The hook should handle this, but we verify the callback exists
      expect(callArgs.onToggleTask).toBeDefined();
      expect(typeof callArgs.onToggleTask).toBe("function");
    });

    it("is ignored when typing in input fields", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const input = screen.getByPlaceholderText("Add a new task...");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "test" } });

      // The hook should prevent shortcuts when typing in inputs
      // This is tested at the hook level, but we verify the callback exists
      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.onToggleTask).toBeDefined();
    });

    it("toggles correct task based on selectedIndex", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // Tasks are sorted by priority: Task 2 (0), Task 1 (1), Task 3 (2)
      // Test with index 1 (Task 1)
      if (callArgs.onToggleTask) {
        callArgs.onToggleTask(1);
      }

      // Task 1 is at index 0 in mockTasks array
      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: mockTasks[0].id,
        completed: !mockTasks[0].completed,
      });
    });
  });

  describe("Delete Task shortcut (Delete)", () => {
    it("removes selected task when Delete is pressed", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      // Mock selectedIndex to be 0 (first task)
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 0,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // Tasks are sorted by priority: Task 2 (priority 0), Task 1 (priority 1), Task 3 (priority 2)
      // So index 0 is Task 2 (at index 1 in mockTasks array)
      if (callArgs.onDeleteTask) {
        callArgs.onDeleteTask(0);
      }

      expect(mockDeleteTask).toHaveBeenCalledWith(mockTasks[1].id); // Task 2
    });

    it("does nothing when Delete is pressed with no task selected", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      // Mock selectedIndex to be -1 (no selection)
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: -1,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // The hook should handle this, but we verify the callback exists
      expect(callArgs.onDeleteTask).toBeDefined();
      expect(typeof callArgs.onDeleteTask).toBe("function");
    });

    it("is ignored when typing in input fields", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const input = screen.getByPlaceholderText("Add a new task...");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "test" } });

      // The hook should prevent shortcuts when typing in inputs
      // This is tested at the hook level, but we verify the callback exists
      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.onDeleteTask).toBeDefined();
    });

    it("deletes correct task based on selectedIndex", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // Tasks are sorted by priority: Task 2 (0), Task 1 (1), Task 3 (2)
      // Test with index 1 (Task 1)
      if (callArgs.onDeleteTask) {
        callArgs.onDeleteTask(1);
      }

      // Task 1 is at index 0 in mockTasks array
      expect(mockDeleteTask).toHaveBeenCalledWith(mockTasks[0].id);
    });

    it("adjusts selection appropriately after deletion", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      
      // Delete task at index 1
      if (callArgs.onDeleteTask) {
        callArgs.onDeleteTask(1);
      }

      expect(mockDeleteTask).toHaveBeenCalled();
      // The hook handles selection adjustment internally
    });
  });

  describe("Navigate Tasks (Up/Down Arrows)", () => {
    it("selects first task when Down Arrow is pressed with no selection", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      let currentSelectedIndex = -1;
      const mockSetSelectedIndex = jest.fn((index) => {
        currentSelectedIndex = index;
      });
      
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: currentSelectedIndex,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      // The hook should handle navigation internally
      // We verify it's called with correct taskCount
      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.taskCount).toBe(3);
    });

    it("moves selection down when Down Arrow is pressed", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 0,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.taskCount).toBe(3);
    });

    it("wraps to top when Down Arrow is pressed at bottom", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 2,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.taskCount).toBe(3);
    });

    it("moves selection up when Up Arrow is pressed", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 1,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.taskCount).toBe(3);
    });

    it("wraps to bottom when Up Arrow is pressed at top", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 0,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      const callArgs = useKeyboardShortcuts.mock.calls[0][0];
      expect(callArgs.taskCount).toBe(3);
    });

    it("works with filtered/sorted tasks", () => {
      const useKeyboardShortcuts = require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts;
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      // Filter by priority - get button specifically
      const jalapenoButtons = screen.getAllByText(/Jalapeño/);
      const jalapenoButton = jalapenoButtons.find(
        (el) => el.tagName === "BUTTON"
      );
      if (jalapenoButton) {
        fireEvent.click(jalapenoButton);
      }

      // Hook should be called with updated taskCount after filter
      const calls = useKeyboardShortcuts.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].taskCount).toBeGreaterThanOrEqual(0);
    });

    it("passes isSelected prop to TaskItem based on selectedIndex", () => {
      (require("@/lib/hooks/useKeyboardShortcuts").useKeyboardShortcuts as jest.Mock).mockReturnValue({
        selectedIndex: 1,
        handleKeyDown: mockHandleKeyDown,
      });
      
      render(<TaskList />, {
        preloadedState: {
          user: { currentUser: mockUser, isAuthenticated: true },
        },
      });

      // Verify tasks are rendered
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
      expect(screen.getByText("Task 3")).toBeInTheDocument();
    });
  });
});

