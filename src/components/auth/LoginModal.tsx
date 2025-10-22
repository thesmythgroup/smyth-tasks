"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/lib/features/userSlice";
import { User } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user: User = {
      id: uuidv4(),
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(login(user));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-100 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
