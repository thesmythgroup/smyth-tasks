import React, { PropsWithChildren, ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { configureStore, Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userReducer from "../features/userSlice";
import tasksReducer from "../features/tasksSlice";
import type { RootState } from "../types";

type PartialRootState = Partial<RootState>;

const createTestStore = (preloadedState: PartialRootState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      tasks: tasksReducer,
      localApi: (state = {}) => state,
    },
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
