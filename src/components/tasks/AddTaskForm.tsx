"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState, PriorityLevel } from "@/lib/types";
import { useAddTaskMutation } from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getTodayDateString } from "@/lib/utils/dateFormatting";
import { PRIORITY_LEVELS } from "@/lib/utils/priorityUtils";
import { TaskTags } from "./TaskTags";
import { TagSelect } from "./TagSelect";
import toast from "react-hot-toast";

export function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [priority, setPriority] = useState<PriorityLevel>(1); // Default to Jalapeño
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showTagSelect, setShowTagSelect] = useState(false);
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
        tagIds: selectedTagIds,
      }).unwrap();

      setTitle("");
      setDueDate(getTodayDateString());
      setPriority(1); // Reset to Jalapeño
      setSelectedTagIds([]); // Reset tags
      toast.success("Task added successfully");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const handleAddTag = (tagId: string) => {
    setSelectedTagIds([...selectedTagIds, tagId]);
    setShowTagSelect(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-4 shadow-lg rounded-lg bg-gray-800 p-4 border border-gray-700">
        {/* Tags Section */}
        {(selectedTagIds.length > 0 || showTagSelect) && (
          <div className="flex flex-col gap-2">
            {selectedTagIds.length > 0 && (
              <TaskTags tagIds={selectedTagIds} onRemoveTag={handleRemoveTag} />
            )}
            {showTagSelect && (
              <TagSelect
                selectedTagIds={selectedTagIds}
                onTagSelect={handleAddTag}
                onClose={() => setShowTagSelect(false)}
              />
            )}
            {!showTagSelect && (
              <button
                type="button"
                onClick={() => setShowTagSelect(true)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors text-left"
                disabled={isLoading}
              >
                + Add Tag
              </button>
            )}
          </div>
        )}
        {selectedTagIds.length === 0 && !showTagSelect && (
          <button
            type="button"
            onClick={() => setShowTagSelect(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors text-left"
            disabled={isLoading}
          >
            + Add Tag
          </button>
        )}
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
      </div>
    </form>
  );
}
