import tagsReducer, {
  addTag,
  updateTag,
  removeTag,
  setTags,
  setLoading,
  setError,
  clearTags,
} from "../tagsSlice";
import { Tag, TAG_COLORS } from "@/lib/types";

const mockTag: Tag = {
  id: "1",
  name: "Test Tag",
  color: TAG_COLORS.BLUE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("tagsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should handle initial state", () => {
    expect(tagsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle addTag", () => {
    const actual = tagsReducer(initialState, addTag(mockTag));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0]).toEqual(mockTag);
  });

  it("should handle updateTag", () => {
    const state = {
      ...initialState,
      items: [mockTag],
    };
    const updatedTag = { ...mockTag, name: "Updated Tag" };
    const actual = tagsReducer(state, updateTag(updatedTag));
    expect(actual.items[0].name).toBe("Updated Tag");
    expect(actual.items[0].updatedAt).toBeDefined();
  });

  it("should handle updateTag with color change", () => {
    const state = {
      ...initialState,
      items: [mockTag],
    };
    const updatedTag = { ...mockTag, color: TAG_COLORS.RED };
    const actual = tagsReducer(state, updateTag(updatedTag));
    expect(actual.items[0].color).toBe(TAG_COLORS.RED);
  });

  it("should not update tag if id doesn't exist", () => {
    const state = {
      ...initialState,
      items: [mockTag],
    };
    const nonExistentTag = { ...mockTag, id: "999", name: "Non-existent" };
    const actual = tagsReducer(state, updateTag(nonExistentTag));
    expect(actual.items[0]).toEqual(mockTag);
  });

  it("should handle removeTag", () => {
    const state = {
      ...initialState,
      items: [mockTag],
    };
    const actual = tagsReducer(state, removeTag(mockTag.id));
    expect(actual.items).toHaveLength(0);
  });

  it("should handle setTags", () => {
    const tags = [mockTag, { ...mockTag, id: "2", name: "Tag 2" }];
    const actual = tagsReducer(initialState, setTags(tags));
    expect(actual.items).toEqual(tags);
    expect(actual.items).toHaveLength(2);
  });

  it("should handle setLoading", () => {
    const actual = tagsReducer(initialState, setLoading(true));
    expect(actual.loading).toBe(true);
  });

  it("should handle setError", () => {
    const actual = tagsReducer(initialState, setError("Test error"));
    expect(actual.error).toBe("Test error");
  });

  it("should handle clearTags", () => {
    const state = {
      items: [mockTag],
      loading: true,
      error: "error",
    };
    const actual = tagsReducer(state, clearTags());
    expect(actual).toEqual(initialState);
  });

  it("should handle multiple operations in sequence", () => {
    let state = tagsReducer(initialState, addTag(mockTag));
    expect(state.items).toHaveLength(1);

    const tag2: Tag = { ...mockTag, id: "2", name: "Tag 2" };
    state = tagsReducer(state, addTag(tag2));
    expect(state.items).toHaveLength(2);

    state = tagsReducer(state, removeTag(mockTag.id));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("2");
  });
});
