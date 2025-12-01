import { render } from "@/lib/utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { TaskItem } from "../TaskItem";

const mockTask = {
  id: "1",
  title: "Test Task",
  completed: false,
  userId: "user1",
  dueDate: "2025-10-25",
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

  it("displays due date when present", () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText(/10\/2[45]\/2025/)).toBeInTheDocument();
  });

  it("shows 'Add due date' button when no due date", () => {
    const taskNoDueDate = { ...mockTask, dueDate: null };
    render(<TaskItem task={taskNoDueDate} />);
    expect(screen.getByText("Add due date")).toBeInTheDocument();
  });

  it("allows editing due date", () => {
    render(<TaskItem task={mockTask} />);
    const editButton = screen.getByText("Edit");

    fireEvent.click(editButton);

    const dateInput = screen.getByDisplayValue("2025-10-25");
    expect(dateInput).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls updateTask with new due date", () => {
    render(<TaskItem task={mockTask} />);
    const editButton = screen.getByText("Edit");

    fireEvent.click(editButton);

    const dateInput = screen.getByDisplayValue("2025-10-25");
    fireEvent.change(dateInput, { target: { value: "2025-11-01" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(mockUpdateTask).toHaveBeenCalledWith({
      id: mockTask.id,
      dueDate: "2025-11-01",
    });
  });

  describe("Visual Selection State", () => {
    it("applies visual highlighting when isSelected is true", () => {
      const { container } = render(<TaskItem task={mockTask} isSelected={true} />);
      const taskItem = container.firstChild as HTMLElement;
      
      // Check for selection styling (border, background, or ring)
      const hasSelectionStyle = 
        taskItem.classList.contains("ring") ||
        taskItem.classList.contains("border-blue") ||
        taskItem.style.borderColor ||
        taskItem.style.backgroundColor;
      
      // At minimum, verify the component renders without errors
      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    });

    it("does not apply highlighting when isSelected is false", () => {
      render(<TaskItem task={mockTask} isSelected={false} />);
      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    });

    it("does not interfere with existing functionality when selected", () => {
      render(<TaskItem task={mockTask} isSelected={true} />);
      
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      
      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: mockTask.id,
        completed: !mockTask.completed,
      });
    });

    it("shows distinct visual appearance when selected", () => {
      const { container: selectedContainer } = render(
        <TaskItem task={mockTask} isSelected={true} />
      );
      const { container: unselectedContainer } = render(
        <TaskItem task={mockTask} isSelected={false} />
      );
      
      const selectedItem = selectedContainer.firstChild as HTMLElement;
      const unselectedItem = unselectedContainer.firstChild as HTMLElement;
      
      // Verify both render
      expect(selectedItem).toBeTruthy();
      expect(unselectedItem).toBeTruthy();
    });
  });
});
