import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification, NotificationsState } from "../types";

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.items.forEach((notification) => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
    },
    setNotificationsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setNotificationsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  setNotifications,
  setNotificationsLoading,
  setNotificationsError,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

