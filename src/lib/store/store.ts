import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { loadState, saveState } from "../utils/localStorage";

export const store = configureStore({
  reducer: {
    // Reducers will be added here
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  saveState(store.getState());
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
