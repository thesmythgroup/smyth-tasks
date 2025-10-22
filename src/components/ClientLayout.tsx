"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadState } from "@/lib/utils/localStorage";
import { login } from "@/lib/features/userSlice";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = loadState();
    if (savedState?.user?.currentUser) {
      dispatch(login(savedState.user.currentUser));
    }
    setIsHydrated(true);
  }, [dispatch]);

  if (!isHydrated) {
    return null; // Return nothing during SSR and initial hydration
  }

  return <>{children}</>;
}
