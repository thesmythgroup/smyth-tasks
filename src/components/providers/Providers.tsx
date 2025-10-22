"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1F2937",
            color: "#F3F4F6",
            border: "1px solid #374151",
          },
        }}
      />
    </Provider>
  );
}
