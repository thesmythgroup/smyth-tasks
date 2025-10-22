"use client";

import { ReduxProvider } from "@/lib/providers/ReduxProvider";
import { Layout } from "./Layout";
import { Toaster } from "react-hot-toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <Layout>{children}</Layout>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </ReduxProvider>
  );
}
