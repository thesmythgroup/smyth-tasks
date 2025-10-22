"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useAddTaskMutation } from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

export function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [addTask, { isLoading }] = useAddTaskMutation();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    try {
      await addTask({
        title: title.trim(),
        completed: false,
        userId: currentUser.id,
      }).unwrap();

      setTitle("");
      toast.success("Task added successfully");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-4 shadow-lg rounded-lg bg-gray-800 p-4 border border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-lg bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 py-3 px-4 text-base transition-all duration-200 hover:border-gray-500"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-3 bg-blue-600 text-gray-100 font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? <LoadingSpinner /> : "Add Task"}
        </button>
      </div>
    </form>
  );
}
