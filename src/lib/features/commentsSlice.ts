import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { removeTask } from "./tasksSlice";
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
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.items = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.items.push(action.payload);
    },
    updateComment: (
      state,
      action: PayloadAction<Partial<Comment> & { id: string }>
    ) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        } as Comment;
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearComments: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(removeTask, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.taskId !== action.payload);
    });
  },
});

export const {
  setComments,
  addComment,
  updateComment,
  removeComment,
  setLoading,
  setError,
  clearComments,
} = commentsSlice.actions;

export default commentsSlice.reducer;


