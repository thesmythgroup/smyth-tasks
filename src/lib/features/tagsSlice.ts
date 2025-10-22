import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tag, TagsState } from "../types";

const initialState: TagsState = {
  items: [],
  loading: false,
  error: null,
};

export const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<Tag>) => {
      state.items.push(action.payload);
    },
    updateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((tag) => tag.id !== action.payload);
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearTags: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  addTag,
  updateTag,
  removeTag,
  setTags,
  setLoading,
  setError,
  clearTags,
} = tagsSlice.actions;
export default tagsSlice.reducer;
