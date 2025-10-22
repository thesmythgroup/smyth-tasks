import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "@/lib/utils/test-utils";
import { TagInput } from "../TagInput";
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

// Mock the hooks and toast
const mockAddTag = jest.fn();
const mockRefetch = jest.fn();

jest.mock("@/lib/services/localApi", () => ({
  useGetTagsQuery: () => ({
    data: mockTags,
    isLoading: false,
    refetch: mockRefetch,
  }),
  useAddTagMutation: () => [mockAddTag, { isLoading: false }],
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("TagInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddTag.mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        id: "4",
        name: "New Tag",
        color: "GREEN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  });

  it("calls onChange when tag is selected", () => {
    render(<TagInput selectedTagIds={[]} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText("Search or create tags...");

    fireEvent.change(input, { target: { value: "urg" } });
    const urgentTag = screen.getByText("Urgent");
    fireEvent.click(urgentTag);

    expect(mockOnChange).toHaveBeenCalledWith(["1"]);
  });

  it("removes tag when remove button is clicked", () => {
    render(<TagInput selectedTagIds={["1", "2"]} onChange={mockOnChange} />);

    const removeButtons = screen.getAllByRole("button", {
      name: /Remove .* tag/,
    });
    fireEvent.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith(["2"]);
  });

  it("creates new tag and calls onChange", async () => {
    mockAddTag.mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        id: "4",
        name: "NewTag",
        color: "BLUE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    render(<TagInput selectedTagIds={[]} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText("Search or create tags...");

    fireEvent.change(input, { target: { value: "NewTag" } });
    const createButton = screen.getByText(/Create/);
    fireEvent.click(createButton);

    // Submit form
    const submitButton = screen.getByText("Create Tag");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddTag).toHaveBeenCalled();
    });
  });

  it("clears search when clear button is clicked", () => {
    render(<TagInput selectedTagIds={[]} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText(
      "Search or create tags..."
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "test" } });
    expect(input.value).toBe("test");

    const clearButton = screen.getByText("✕");
    fireEvent.click(clearButton);

    expect(input.value).toBe("");
  });

  it("filters out already selected tags from dropdown", () => {
    render(<TagInput selectedTagIds={["1"]} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText("Search or create tags...");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });

    // Urgent is selected, so it should not appear in dropdown
    const dropdownContent = screen
      .queryAllByText("Urgent")
      .filter((el) => el.closest(".absolute.z-10"));
    expect(dropdownContent.length).toBe(0);
  });
});
