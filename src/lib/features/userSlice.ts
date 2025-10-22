import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserState } from "../types";
import { clearState } from "../utils/localStorage";
import { clearTasks } from "./tasksSlice";

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
};

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    clearState();
    dispatch(clearTasks());
    dispatch(logoutSuccess());
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
  },
});

export const { login, logoutSuccess, updateProfile } = userSlice.actions;
export default userSlice.reducer;
