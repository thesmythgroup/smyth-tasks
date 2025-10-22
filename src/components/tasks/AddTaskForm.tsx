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
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-md bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-500 text-gray-100 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? <LoadingSpinner /> : "Add Task"}
        </button>
      </div>
    </form>
  );
}
