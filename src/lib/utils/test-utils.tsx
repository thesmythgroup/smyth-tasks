import React, { PropsWithChildren, ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { configureStore, Store, combineReducers } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userReducer from "../features/userSlice";
import tasksReducer from "../features/tasksSlice";
import tagsReducer from "../features/tagsSlice";
import type { RootState } from "../types";

type PartialRootState = Partial<RootState>;

const rootReducer = combineReducers({
  user: userReducer,
  tasks: tasksReducer,
  tags: tagsReducer,
  localApi: (state = {}) => state,
});

const createTestStore = (preloadedState: PartialRootState = {}) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    preloadedState: preloadedState as any,
  });
};

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PartialRootState;
  store?: Store;
}

export function render(
  ui: ReactElement,
  { preloadedState = {}, store, ...renderOptions }: ExtendedRenderOptions = {}
) {
  const testStore = store ?? createTestStore(preloadedState);

  function Wrapper({ children }: PropsWithChildren<unknown>) {
    return <Provider store={testStore}>{children}</Provider>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from "@testing-library/react";
