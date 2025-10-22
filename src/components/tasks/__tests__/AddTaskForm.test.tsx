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

  it("calls addTask with correct data on submit (first task)", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
        tasks: { items: [], loading: false, error: null },
      },
    });

    const input = screen.getByPlaceholderText("Add a new task...");
    const submitButton = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "New Test Task" } });
    fireEvent.click(submitButton);

    expect(mockAddTask).toHaveBeenCalledWith({
      title: "New Test Task",
      completed: false,
      userId: mockUser.id,
      order: 0,
    });
  });

  it("calls addTask with correct order when tasks exist", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
        tasks: {
          items: [
            {
              id: "1",
              title: "Existing Task 1",
              completed: false,
              userId: mockUser.id,
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "2",
              title: "Existing Task 2",
              completed: false,
              userId: mockUser.id,
              order: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          loading: false,
          error: null,
        },
      },
    });

    const input = screen.getByPlaceholderText("Add a new task...");
    const submitButton = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "New Test Task" } });
    fireEvent.click(submitButton);

    expect(mockAddTask).toHaveBeenCalledWith({
      title: "New Test Task",
      completed: false,
      userId: mockUser.id,
      order: 2,
    });
  });

  it("doesn't submit empty task", () => {
    render(<AddTaskForm />, {
      preloadedState: {
        user: { currentUser: mockUser, isAuthenticated: true },
        tasks: { items: [], loading: false, error: null },
      },
    });

    const submitButton = screen.getByText("Add Task");
    fireEvent.click(submitButton);

    expect(mockAddTask).not.toHaveBeenCalled();
  });
});
