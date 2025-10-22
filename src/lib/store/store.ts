import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { loadState, saveState } from "../utils/localStorage";
import userReducer from "../features/userSlice";
import tasksReducer from "../features/tasksSlice";
import { localApi } from "../services/localApi";
import { RootState } from "../types";

const rootReducer = combineReducers({
  user: userReducer,
  tasks: tasksReducer,
  [localApi.reducerPath]: localApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localApi.middleware),
  preloadedState: loadState() as RootState,
});

store.subscribe(() => {
  saveState(store.getState());
});

setupListeners(store.dispatch);

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
