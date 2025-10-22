import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserState } from "../types";
import { clearState } from "../utils/localStorage";
import { clearTasks } from "./tasksSlice";
import { AppDispatch } from "../store/store";

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
};

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

// Async action to handle logout with cleanup
export const logout = () => async (dispatch: AppDispatch) => {
  clearState(); // Clear localStorage
  dispatch(clearTasks()); // Clear tasks from Redux
  dispatch(logoutSuccess()); // Clear user state
};

export const { login, logoutSuccess, updateProfile } = userSlice.actions;
export default userSlice.reducer;
