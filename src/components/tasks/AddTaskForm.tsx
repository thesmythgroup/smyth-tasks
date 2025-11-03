"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState, PriorityLevel } from "@/lib/types";
import { useAddTaskMutation } from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getTodayDateString } from "@/lib/utils/dateFormatting";
import { PRIORITY_LEVELS } from "@/lib/utils/priorityUtils";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
  ssr: false,
});

export function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [priority, setPriority] = useState<PriorityLevel>(1); // Default to Jalapeño
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [addTask, { isLoading }] = useAddTaskMutation();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    try {
      await addTask({
        title: title.trim(),
        completed: false,
        priority,
        userId: currentUser.id,
        dueDate: dueDate || null,
        description: description.trim() || null,
      }).unwrap();

      setTitle("");
      setDueDate(getTodayDateString());
      setPriority(1); // Reset to Jalapeño
      setDescription("");
      setShowDescription(false);
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
        <div className="flex items-center justify-between">
          {!showDescription ? (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-gray-500 hover:text-gray-400 text-sm underline"
              disabled={isLoading}
            >
              Add description
            </button>
          ) : (
            <div className="flex-1 w-full">
              <div data-color-mode="dark">
                <MDEditor
                  value={description}
                  onChange={(val) => setDescription(val || "")}
                  preview="live"
                  hideToolbar={false}
                  visibleDragBar={false}
                  height={250}
                  previewOptions={{
                    rehypePlugins: [],
                  }}
                  textareaProps={{
                    placeholder: "Add a description (Markdown supported)...",
                    disabled: isLoading,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDescription(false);
                  setDescription("");
                }}
                className="mt-2 text-gray-400 hover:text-gray-300 text-xs underline"
                disabled={isLoading}
              >
                Remove description
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
