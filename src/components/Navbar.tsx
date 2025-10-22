"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/types";
import { logout } from "@/lib/features/userSlice";
import { LoginModal } from "./auth/LoginModal";
import { AppDispatch } from "@/lib/store/store";
import { loadState } from "@/lib/utils/localStorage";

export function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentUser, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-100">Task Tracker</h1>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                {isAuthenticated && currentUser ? (
                  <>
                    <span className="text-gray-300">{currentUser.name}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
