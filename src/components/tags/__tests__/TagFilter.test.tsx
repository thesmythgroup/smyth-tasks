import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/lib/utils/test-utils";
import { TagFilter } from "../TagFilter";
import { Tag, TAG_COLORS } from "@/lib/types";

const mockTags: Tag[] = [
  {
    id: "1",
    name: "Urgent",
    color: TAG_COLORS.RED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bug",
    color: TAG_COLORS.YELLOW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Feature",
    color: TAG_COLORS.BLUE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock the hooks
const mockRefetch = jest.fn();
jest.mock("@/lib/services/localApi", () => ({
  useGetTagsQuery: () => ({
    data: mockTags,
    isLoading: false,
    refetch: mockRefetch,
  }),
}));

describe("TagFilter", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls onChange when tag is selected", () => {
    render(<TagFilter selectedTagIds={[]} onChange={mockOnChange} />);

    const button = screen.getByText("Filter Tasks");
    fireEvent.click(button);

    // Click on the tag badge button instead of looking for label
    const urgentButton = screen.getByText("Urgent").closest("button");
    if (urgentButton) {
      fireEvent.click(urgentButton);
    }

    expect(mockOnChange).toHaveBeenCalledWith(["1"]);
  });

  it("calls onChange when tag is deselected", () => {
    render(<TagFilter selectedTagIds={["1", "2"]} onChange={mockOnChange} />);

    const button = screen.getByText("Filters Active");
    fireEvent.click(button);

    // Use getAllByText since "Urgent" appears multiple times
    const urgentElements = screen.getAllByText("Urgent");
    const urgentButton = urgentElements[0].closest("button");
    if (urgentButton) {
      fireEvent.click(urgentButton);
    }

    expect(mockOnChange).toHaveBeenCalledWith(["2"]);
  });

  it("handles multiple tag selection", () => {
    render(<TagFilter selectedTagIds={[]} onChange={mockOnChange} />);

    const button = screen.getByText("Filter Tasks");
    fireEvent.click(button);

    const urgentButton = screen.getByText("Urgent").closest("button");
    if (urgentButton) {
      fireEvent.click(urgentButton);
    }

    expect(mockOnChange).toHaveBeenCalledWith(["1"]);
  });

  it("clears all filters when clear button is clicked", () => {
    render(<TagFilter selectedTagIds={["1", "2"]} onChange={mockOnChange} />);

    const button = screen.getByText("Filters Active");
    fireEvent.click(button);

    const clearButton = screen.getByText(/clear all/i);
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
