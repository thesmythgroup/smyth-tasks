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
      <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Task Tracker
              </h1>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-6">
                {isAuthenticated && currentUser ? (
                  <>
                    <span className="text-gray-300 font-medium">
                      Welcome, {currentUser.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-gray-100 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-gray-100 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
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
