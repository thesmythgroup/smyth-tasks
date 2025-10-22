import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/lib/utils/test-utils";
import { TagBadge } from "../TagBadge";
import { Tag, TAG_COLORS } from "@/lib/types";

const mockTag: Tag = {
  id: "1",
  name: "Test Tag",
  color: TAG_COLORS.GREEN,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("TagBadge", () => {
  it("calls onRemove when remove button is clicked", () => {
    const mockRemove = jest.fn();
    render(<TagBadge tag={mockTag} onRemove={mockRemove} />);

    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
