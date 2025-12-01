import { Task } from "@/lib/types";
import { render } from "@/lib/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { TaskList } from "../TaskList";

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Task One",
    completed: false,
    priority: 0,
    userId: "user1",
    dueDate: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Task Two",
    completed: false,
    priority: 1,
    userId: "user1",
    dueDate: null,
    createdAt: "2025-01-02T00:00:00.000Z",
    updatedAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Task Three",
    completed: true,
    priority: 2,
    userId: "user1",
    dueDate: null,
    createdAt: "2025-01-03T00:00:00.000Z",
    updatedAt: "2025-01-03T00:00:00.000Z",
  },
];

// Mock the API hook
const mockUseGetTasksQuery = jest.fn();
jest.mock("@/lib/services/localApi", () => ({
  useGetTasksQuery: () => mockUseGetTasksQuery(),
}));

// Mock TaskItem to simplify testing
jest.mock("../TaskItem", () => ({
  TaskItem: ({ task, isSelected, onSelectionChange }: any) => (
    <div data-testid={`task-item-${task.id}`} data-selected={isSelected}>
      <span>{task.title}</span>
      {onSelectionChange && (
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={(e) => onSelectionChange(task.id, e.target.checked)}
          data-testid={`selection-checkbox-${task.id}`}
        />
      )}
    </div>
  ),
}));

// Mock AddTaskForm and TaskSearch to simplify tests
jest.mock("../AddTaskForm", () => ({
  AddTaskForm: () => <div data-testid="add-task-form">Add Task Form</div>,
}));

jest.mock("../TaskSearch", () => ({
  TaskSearch: ({ onSearchChange }: any) => (
    <input
      data-testid="task-search"
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search tasks..."
    />
  ),
}));

describe("TaskList - Selection State Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetTasksQuery.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    });
  });

  it("manages selection state for tasks", () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Initially no tasks should be selected
    const task1 = screen.getByTestId("task-item-1");
    expect(task1).toHaveAttribute("data-selected", "false");
  });

  it("allows selecting individual tasks", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Find and click the selection checkbox for task 1
    const checkbox1 = screen.getByTestId("selection-checkbox-1");
    fireEvent.click(checkbox1);

    await waitFor(() => {
      const task1 = screen.getByTestId("task-item-1");
      expect(task1).toHaveAttribute("data-selected", "true");
    });
  });

  it("allows deselecting individual tasks", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Select task 1
    const checkbox1 = screen.getByTestId("selection-checkbox-1");
    fireEvent.click(checkbox1);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
    });

    // Deselect task 1
    fireEvent.click(checkbox1);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "false");
    });
  });

  it("has 'Select All' button that selects all filtered tasks", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Find and click "Select All" button
    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    await waitFor(() => {
      // All three tasks should be selected
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
      expect(screen.getByTestId("task-item-2")).toHaveAttribute("data-selected", "true");
      expect(screen.getByTestId("task-item-3")).toHaveAttribute("data-selected", "true");
    });
  });

  it("has 'Deselect All' button that clears selection", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // First select all tasks
    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
    });

    // Then deselect all
    const deselectAllButton = screen.getByText("Deselect All");
    fireEvent.click(deselectAllButton);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "false");
      expect(screen.getByTestId("task-item-2")).toHaveAttribute("data-selected", "false");
      expect(screen.getByTestId("task-item-3")).toHaveAttribute("data-selected", "false");
    });
  });

  it("'Select All' only selects filtered tasks when priority filter is applied", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Filter by priority 0 (Ghost Pepper)
    const priorityButton = screen.getByText("Ghost Pepper 🌶️🌶️");
    fireEvent.click(priorityButton);

    await waitFor(() => {
      // Only task 1 should be visible (priority 0)
      expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
      expect(screen.queryByTestId("task-item-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("task-item-3")).not.toBeInTheDocument();
    });

    // Select all should only select the filtered task
    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
    });
  });

  it("'Select All' only selects filtered tasks when search filter is applied", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Search for "One"
    const searchInput = screen.getByTestId("task-search");
    fireEvent.change(searchInput, { target: { value: "One" } });

    await waitFor(() => {
      // Only task 1 should be visible
      expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
      expect(screen.queryByTestId("task-item-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("task-item-3")).not.toBeInTheDocument();
    });

    // Select all should only select the filtered task
    const selectAllButton = screen.getByText("Select All");
    fireEvent.click(selectAllButton);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
    });
  });

  it("selection persists when filters change if task is still visible", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Select task 1
    const checkbox1 = screen.getByTestId("selection-checkbox-1");
    fireEvent.click(checkbox1);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
    });

    // Apply priority filter that still includes task 1
    const priorityButton = screen.getByText("Ghost Pepper 🌶️🌶️");
    fireEvent.click(priorityButton);

    await waitFor(() => {
      // Task 1 should still be selected
      expect(screen.getByTestId("task-item-1")).toHaveAttribute("data-selected", "true");
    });
  });

  it("selection is cleared for tasks that become hidden when filters change", async () => {
    const preloadedState = {
      user: {
        currentUser: { id: "user1", name: "Test User", email: "test@test.com", createdAt: "", updatedAt: "" },
        isAuthenticated: true,
      },
    };

    render(<TaskList />, { preloadedState });

    // Select task 2 (priority 1)
    const checkbox2 = screen.getByTestId("selection-checkbox-2");
    fireEvent.click(checkbox2);

    await waitFor(() => {
      expect(screen.getByTestId("task-item-2")).toHaveAttribute("data-selected", "true");
    });

    // Apply priority filter that excludes task 2 (filter by priority 0)
    const priorityButton = screen.getByText("Ghost Pepper 🌶️🌶️");
    fireEvent.click(priorityButton);

    await waitFor(() => {
      // Task 2 should no longer be visible
      expect(screen.queryByTestId("task-item-2")).not.toBeInTheDocument();
    });

    // When we remove the filter, task 2 should not be selected
    const allButton = screen.getByText("All");
    fireEvent.click(allButton);

    await waitFor(() => {
      // Task 2 should be visible again but not selected
      expect(screen.getByTestId("task-item-2")).toBeInTheDocument();
      expect(screen.getByTestId("task-item-2")).toHaveAttribute("data-selected", "false");
    });
  });
});

