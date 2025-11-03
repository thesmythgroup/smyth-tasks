import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/lib/utils/test-utils";
import { AddTaskForm } from "../AddTaskForm";

const mockUser = {
  id: "user1",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock the mutation
const mockAddTask = jest.fn();

jest.mock("@/lib/services/localApi", () => ({
  useAddTaskMutation: () => [mockAddTask, { isLoading: false }],
}));

describe("AddTaskForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form when user is authenticated", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });
    expect(
      screen.getByPlaceholderText("Add a new task...")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/)).toBeInTheDocument();
    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("doesn't render when user is not authenticated", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: null, isAuthenticated: false },
      },
    });
    expect(
      screen.queryByPlaceholderText("Add a new task...")
    ).not.toBeInTheDocument();
  });

  it("calls addTask with correct data on submit", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    const input = screen.getByPlaceholderText("Add a new task...");
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    const submitButton = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "New Test Task" } });
    fireEvent.change(dateInput, { target: { value: "2025-12-31" } });
    fireEvent.click(submitButton);

    expect(mockAddTask).toHaveBeenCalledWith({
      title: "New Test Task",
      completed: false,
      userId: mockUser.id,
      dueDate: "2025-12-31",
      priority: 1,
      tagIds: [],
    });
  });

  it("doesn't submit empty task", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
      },
    });

    const submitButton = screen.getByText("Add Task");
    fireEvent.click(submitButton);

    expect(mockAddTask).not.toHaveBeenCalled();
  });
});
