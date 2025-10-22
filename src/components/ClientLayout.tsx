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
            background: "#1F2937", // gray-800
            color: "#F3F4F6", // gray-100
            border: "1px solid #374151", // gray-700
          },
        }}
      />
    </ReduxProvider>
  );
}
