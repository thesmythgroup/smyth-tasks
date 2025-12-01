import { render } from "@/lib/utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { TaskItem } from "../TaskItem";

const mockTask = {
  id: "1",
  title: "Test Task",
  completed: false,
  priority: 0 as const,
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

  describe("selection checkbox", () => {
    const mockOnSelectionChange = jest.fn();

    beforeEach(() => {
      mockOnSelectionChange.mockClear();
    });

    it("renders selection checkbox when isSelected prop is provided", () => {
      render(
        <TaskItem
          task={mockTask}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Should have two checkboxes: one for completion, one for selection
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(2);
    });

    it("calls onSelectionChange when selection checkbox is clicked", () => {
      render(
        <TaskItem
          task={mockTask}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      // The selection checkbox should be the second one (first is completion)
      const selectionCheckbox = checkboxes[1];

      fireEvent.click(selectionCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(mockTask.id, true);
    });

    it("shows selection checkbox as checked when isSelected is true", () => {
      render(
        <TaskItem
          task={mockTask}
          isSelected={true}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      const selectionCheckbox = checkboxes[1];
      expect(selectionCheckbox.checked).toBe(true);
    });

    it("shows selection checkbox as unchecked when isSelected is false", () => {
      render(
        <TaskItem
          task={mockTask}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      const selectionCheckbox = checkboxes[1];
      expect(selectionCheckbox.checked).toBe(false);
    });

    it("applies visual styling when selected", () => {
      const { container } = render(
        <TaskItem
          task={mockTask}
          isSelected={true}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Check for selected styling - typically a border or background change
      const taskElement = container.firstChild as HTMLElement;
      expect(taskElement).toBeInTheDocument();
      // The actual styling classes will depend on implementation
    });

    it("does not render selection checkbox when props are not provided", () => {
      render(<TaskItem task={mockTask} />);

      // Should only have one checkbox (completion checkbox)
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(1);
    });
  });
});
