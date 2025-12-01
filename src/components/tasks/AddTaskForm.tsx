"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { RootState, PriorityLevel } from "@/lib/types";
import { useAddTaskMutation } from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getTodayDateString } from "@/lib/utils/dateFormatting";
import { PRIORITY_LEVELS } from "@/lib/utils/priorityUtils";
import toast from "react-hot-toast";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [priority, setPriority] = useState<PriorityLevel>(1); // Default to Jalapeño
  const [description, setDescription] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [addTask, { isLoading }] = useAddTaskMutation();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || null,
        completed: false,
        priority,
        userId: currentUser.id,
        dueDate: dueDate || null,
      }).unwrap();

      setTitle("");
      setDescription("");
      setIsDescriptionExpanded(false);
      setDueDate(getTodayDateString());
      setPriority(1); // Reset to Jalapeño
      toast.success("Task added successfully");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-4 shadow-lg rounded-lg bg-gray-800 p-4 border border-gray-700">
        <div className="flex gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 rounded-lg bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 py-3 px-4 text-base transition-all duration-200 hover:border-gray-500"
            disabled={isLoading}
            required
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 py-3 px-4 text-base transition-all duration-200 hover:border-gray-500"
            disabled={isLoading}
          />
          <select
            value={priority}
            onChange={(e) =>
              setPriority(Number(e.target.value) as PriorityLevel)
            }
            className="rounded-lg bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 py-3 px-4 text-base transition-all duration-200 hover:border-gray-500 min-w-[140px]"
            disabled={isLoading}
          >
            {Object.values(PRIORITY_LEVELS).map((level) => (
              <option key={level.id} value={level.id}>
                {level.displayText}
              </option>
            ))}
          </select>
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

        {/* Expandable Description Section */}
        <div>
          <button
            type="button"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isDescriptionExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{isDescriptionExpanded ? "Hide notes" : "Add notes (optional)"}</span>
            {description && !isDescriptionExpanded && (
              <span className="text-blue-400 text-xs">(has content)</span>
            )}
          </button>

          {isDescriptionExpanded && (
            <div className="mt-3" data-color-mode="dark">
              <MDEditor
                value={description}
                onChange={(value) => setDescription(value || "")}
                preview="edit"
                height={150}
                className="!bg-gray-700"
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
