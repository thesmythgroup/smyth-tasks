import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment, CommentsState } from "../types";

const initialState: CommentsState = {
  items: [],
  loading: false,
  error: null,
};

export const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<Comment>) => {
      state.items.push(action.payload);
    },
    updateComment: (
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) => {
      const comment = state.items.find((c) => c.id === action.payload.id);
      if (comment) {
        comment.content = action.payload.content;
        comment.updatedAt = new Date().toISOString();
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (comment) => comment.id !== action.payload
      );
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.items = action.payload;
    },
    setCommentsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCommentsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearComments: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
    clearTaskComments: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (comment) => comment.taskId !== action.payload
      );
    },
  },
});

export const {
  addComment,
  updateComment,
  removeComment,
  setComments,
  setCommentsLoading,
  setCommentsError,
  clearComments,
  clearTaskComments,
} = commentsSlice.actions;

export default commentsSlice.reducer;

