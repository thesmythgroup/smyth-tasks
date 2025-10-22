import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/lib/utils/test-utils";
import { TaskItem } from "../TaskItem";

const mockTask = {
  id: "1",
  title: "Test Task",
  completed: false,
  userId: "user1",
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock the mutations
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

jest.mock("@/lib/services/localApi", () => ({
  useUpdateTaskMutation: () => [mockUpdateTask, { isLoading: false }],
  useDeleteTaskMutation: () => [mockDeleteTask, { isLoading: false }],
}));

describe("TaskItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task title", () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
  });

  it("shows correct completion state", () => {
    render(<TaskItem task={mockTask} />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(mockTask.completed);
  });

  it("calls updateTask when toggled", () => {
    render(<TaskItem task={mockTask} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(mockUpdateTask).toHaveBeenCalledWith({
      id: mockTask.id,
      completed: !mockTask.completed,
    });
  });

  it("calls deleteTask when delete button clicked", () => {
    render(<TaskItem task={mockTask} />);
    const deleteButton = screen.getByText("Delete");

    fireEvent.click(deleteButton);

    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });
});
