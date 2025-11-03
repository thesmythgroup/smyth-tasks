import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tag, TagsState } from '../types';

const initialState: TagsState = {
  items: [],
};

export const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<Tag>) => {
      state.items.push(action.payload);
    },
    updateTag: (
      state,
      action: PayloadAction<{ id: string; name?: string; color?: string }>
    ) => {
      const tag = state.items.find((t) => t.id === action.payload.id);
      if (tag) {
        if (action.payload.name !== undefined) {
          tag.name = action.payload.name;
        }
        if (action.payload.color !== undefined) {
          tag.color = action.payload.color;
        }
        tag.updatedAt = new Date().toISOString();
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((tag) => tag.id !== action.payload);
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addTag, updateTag, removeTag, setTags } = tagsSlice.actions;
export default tagsSlice.reducer;
