import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserState } from "../types";
import { clearState } from "../utils/localStorage";
import { clearTasks } from "./tasksSlice";

const initialState: UserState = {
  currentUser: null,
  allUsers: [],
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
      // Ensure allUsers is initialized (for legacy localStorage data)
      if (!state.allUsers) {
        state.allUsers = [];
      }
      // Add user to allUsers if not already present
      if (!state.allUsers.find((u) => u.id === action.payload.id)) {
        state.allUsers.push(action.payload);
      }
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
    setAllUsers: (state, action: PayloadAction<User[]>) => {
      state.allUsers = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      // Ensure allUsers is initialized (for legacy localStorage data)
      if (!state.allUsers) {
        state.allUsers = [];
      }
      if (!state.allUsers.find((u) => u.id === action.payload.id)) {
        state.allUsers.push(action.payload);
      }
    },
  },
});

export const { login, logoutSuccess, updateProfile, setAllUsers, addUser } = userSlice.actions;
export default userSlice.reducer;
