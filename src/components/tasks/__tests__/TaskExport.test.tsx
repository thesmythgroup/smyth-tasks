import { Task } from "@/lib/types";
import { render } from "@/lib/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { TaskExport } from "../TaskExport";

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
    completed: true,
    priority: 1,
    userId: "user1",
    dueDate: "2025-01-15",
    createdAt: "2025-01-02T00:00:00.000Z",
    updatedAt: "2025-01-02T00:00:00.000Z",
  },
];

// Mock the export utilities
const mockExportToCSV = jest.fn();
const mockExportToJSON = jest.fn();
const mockDownloadFile = jest.fn();
const mockGenerateFilename = jest.fn();

jest.mock("@/lib/utils/exportUtils", () => ({
  exportToCSV: (tasks: Task[]) => mockExportToCSV(tasks),
  exportToJSON: (tasks: Task[]) => mockExportToJSON(tasks),
  downloadFile: (content: string, filename: string, mimeType: string) =>
    mockDownloadFile(content, filename, mimeType),
  generateFilename: (baseName: string, extension: string) =>
    mockGenerateFilename(baseName, extension),
}));

describe("TaskExport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExportToCSV.mockReturnValue("csv,content");
    mockExportToJSON.mockReturnValue('[{"id":"1"}]');
    mockGenerateFilename.mockReturnValue("tasks-2025-01-01-120000.csv");
    mockDownloadFile.mockImplementation(() => {});
  });

  it("renders dropdown button", () => {
    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={new Set()}
        onExport={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    expect(button).toBeInTheDocument();
  });

  it("shows dropdown menu when button is clicked", async () => {
    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={new Set()}
        onExport={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export Selected as CSV")).toBeInTheDocument();
      expect(screen.getByText("Export Selected as JSON")).toBeInTheDocument();
      expect(screen.getByText("Export All as CSV")).toBeInTheDocument();
      expect(screen.getByText("Export All as JSON")).toBeInTheDocument();
    });
  });

  it("disables 'Export Selected' options when no tasks are selected", async () => {
    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={new Set()}
        onExport={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      const csvOption = screen.getByText("Export Selected as CSV");
      const jsonOption = screen.getByText("Export Selected as JSON");

      expect(csvOption.closest("button")).toBeDisabled();
      expect(jsonOption.closest("button")).toBeDisabled();
    });
  });

  it("enables 'Export Selected' options when tasks are selected", async () => {
    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={new Set(["1"])}
        onExport={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      const csvOption = screen.getByText("Export Selected as CSV");
      const jsonOption = screen.getByText("Export Selected as JSON");

      expect(csvOption.closest("button")).not.toBeDisabled();
      expect(jsonOption.closest("button")).not.toBeDisabled();
    });
  });

  it("exports selected tasks as CSV when 'Export Selected as CSV' is clicked", async () => {
    const selectedIds = new Set(["1"]);
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={selectedIds}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export Selected as CSV")).toBeInTheDocument();
    });

    const csvOption = screen.getByText("Export Selected as CSV");
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        [mockTasks[0]],
        "csv",
        expect.any(String)
      );
    });
  });

  it("exports selected tasks as JSON when 'Export Selected as JSON' is clicked", async () => {
    const selectedIds = new Set(["1"]);
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={selectedIds}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export Selected as JSON")).toBeInTheDocument();
    });

    const jsonOption = screen.getByText("Export Selected as JSON");
    fireEvent.click(jsonOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        [mockTasks[0]],
        "json",
        expect.any(String)
      );
    });
  });

  it("exports all filtered tasks as CSV when 'Export All as CSV' is clicked", async () => {
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={new Set()}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export All as CSV")).toBeInTheDocument();
    });

    const csvOption = screen.getByText("Export All as CSV");
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        mockTasks,
        "csv",
        expect.any(String)
      );
    });
  });

  it("exports all filtered tasks as JSON when 'Export All as JSON' is clicked", async () => {
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={new Set()}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export All as JSON")).toBeInTheDocument();
    });

    const jsonOption = screen.getByText("Export All as JSON");
    fireEvent.click(jsonOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        mockTasks,
        "json",
        expect.any(String)
      );
    });
  });

  it("only exports selected tasks when 'Export Selected' is used", async () => {
    const selectedIds = new Set(["2"]);
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={selectedIds}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export Selected as CSV")).toBeInTheDocument();
    });

    const csvOption = screen.getByText("Export Selected as CSV");
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        [mockTasks[1]], // Only task 2 should be exported
        "csv",
        expect.any(String)
      );
      expect(onExport).not.toHaveBeenCalledWith(
        mockTasks, // Should not export all tasks
        "csv",
        expect.any(String)
      );
    });
  });

  it("exports all filtered tasks when 'Export All' is used, regardless of selection", async () => {
    const selectedIds = new Set(["1"]);
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={mockTasks}
        selectedTaskIds={selectedIds}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export All as CSV")).toBeInTheDocument();
    });

    const csvOption = screen.getByText("Export All as CSV");
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        mockTasks, // Should export all tasks, not just selected
        "csv",
        expect.any(String)
      );
    });
  });

  it("respects filtered tasks - only exports tasks passed to component", async () => {
    const filteredTasks = [mockTasks[0]]; // Only first task
    const onExport = jest.fn();

    render(
      <TaskExport
        tasks={filteredTasks}
        selectedTaskIds={new Set()}
        onExport={onExport}
      />
    );

    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Export All as CSV")).toBeInTheDocument();
    });

    const csvOption = screen.getByText("Export All as CSV");
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        filteredTasks, // Should only export filtered tasks
        "csv",
        expect.any(String)
      );
      expect(onExport).not.toHaveBeenCalledWith(
        mockTasks, // Should not export all original tasks
        "csv",
        expect.any(String)
      );
    });
  });
});

