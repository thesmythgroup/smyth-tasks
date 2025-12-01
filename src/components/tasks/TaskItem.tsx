"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Task, PriorityLevel } from "@/lib/types";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { formatDateForDisplay } from "@/lib/utils/dateFormatting";
import { PRIORITY_LEVELS, getPriorityStyles } from "@/lib/utils/priorityUtils";
import { highlightText } from "@/lib/utils/searchUtils";
import toast from "react-hot-toast";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamically import MDEditor and Markdown to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface TaskItemProps {
  task: Task;
  searchQuery?: string;
}

export function TaskItem({ task, searchQuery }: TaskItemProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedDate, setEditedDate] = useState(task.dueDate || "");
  
  // Description state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || "");

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await updateTask({
        id: task.id,
        completed: !task.completed,
      }).unwrap();
      toast.success(
        `Task ${task.completed ? "uncompleted" : "completed"} successfully`
      );
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTask(task.id).unwrap();
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
      setIsDeleting(false);
    }
  };

  const handleDateUpdate = async () => {
    try {
      setIsUpdating(true);
      await updateTask({
        id: task.id,
        dueDate: editedDate || null,
      }).unwrap();
      setIsEditingDate(false);
      toast.success("Due date updated successfully");
    } catch (error) {
      toast.error("Failed to update due date");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedDate(task.dueDate || "");
    setIsEditingDate(false);
  };

  const handleDescriptionUpdate = async () => {
    try {
      setIsUpdating(true);
      await updateTask({
        id: task.id,
        description: editedDescription || null,
      }).unwrap();
      setIsEditingDescription(false);
      toast.success("Description updated successfully");
    } catch {
      toast.error("Failed to update description");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelDescriptionEdit = () => {
    setEditedDescription(task.description || "");
    setIsEditingDescription(false);
  };

  const isOverdue = (dateString: string | null): boolean => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const overdue = dueDate < today;
    console.log("Date check:", { dateString, dueDate, today, overdue });
    return overdue;
  };

  const handlePriorityChange = async (newPriority: PriorityLevel) => {
    try {
      setIsUpdating(true);
      await updateTask({
        id: task.id,
        priority: newPriority,
      }).unwrap();
      toast.success("Priority updated successfully");
    } catch {
      toast.error("Failed to update priority");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderTaskTitle = () => {
    if (searchQuery?.trim()) {
      const highlightedTitle = highlightText(task.title, searchQuery);
      return (
        <span
          className={`text-lg text-gray-100 transition-all duration-200 ${
            task.completed
              ? "line-through text-gray-500"
              : "group-hover:text-gray-50"
          }`}
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />
      );
    }

    return (
      <span
        className={`text-lg text-gray-100 transition-all duration-200 ${
          task.completed
            ? "line-through text-gray-500"
            : "group-hover:text-gray-50"
        }`}
      >
        {task.title}
      </span>
    );
  };

  // Truncate description for preview (first ~100 chars)
  const getTruncatedDescription = (text: string | null, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const renderDescriptionSection = () => {
    // Editing mode
    if (isEditingDescription) {
      return (
        <div className="mt-3 border-t border-gray-700 pt-3" data-color-mode="dark">
          <MDEditor
            value={editedDescription}
            onChange={(value) => setEditedDescription(value || "")}
            preview="live"
            height={200}
            className="!bg-gray-700"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleDescriptionUpdate}
              disabled={isUpdating}
              className="px-3 py-1 bg-blue-600 text-gray-100 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelDescriptionEdit}
              disabled={isUpdating}
              className="px-3 py-1 text-gray-400 text-sm rounded-md hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    // Has description - show preview/expanded view
    if (task.description) {
      return (
        <div className="mt-3 border-t border-gray-700 pt-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isDescriptionExpanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Notes</span>
            </button>
            <button
              onClick={() => setIsEditingDescription(true)}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
              disabled={isDeleting}
            >
              Edit
            </button>
          </div>
          
          {isDescriptionExpanded ? (
            // Full markdown preview
            <div data-color-mode="dark" className="prose prose-invert prose-sm max-w-none">
              <MarkdownPreview source={task.description || ""} />
            </div>
          ) : (
            // Truncated preview
            <p className="text-sm text-gray-400 cursor-pointer" onClick={() => setIsDescriptionExpanded(true)}>
              {getTruncatedDescription(task.description)}
            </p>
          )}
        </div>
      );
    }

    // No description - show add button
    return (
      <div className="mt-3">
        <button
          onClick={() => setIsEditingDescription(true)}
          className="text-gray-500 hover:text-gray-400 text-sm underline"
          disabled={isDeleting}
        >
          Add notes
        </button>
      </div>
    );
  };

  return (
    <div
      className={`group p-5 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-l-4 ${getPriorityStyles(
        task.priority
      )}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="relative mt-1">
            {isUpdating ? (
              <div className="h-6 w-6 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggle}
                className="h-6 w-6 text-blue-500 rounded-md bg-gray-700 border-2 border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors hover:border-gray-500 cursor-pointer"
                disabled={isUpdating || isDeleting}
              />
            )}
          </div>
          <div className="flex-1">
            {renderTaskTitle()}
            <div>
              {task.dueDate && !isEditingDate && (
                <div className="mt-2 text-sm">
                  <span
                    className={
                      isOverdue(task.dueDate)
                        ? "text-red-500 font-semibold"
                        : "text-gray-400"
                    }
                    style={
                      isOverdue(task.dueDate) ? { color: "#ef4444" } : undefined
                    }
                  >
                    Due Date: {formatDateForDisplay(task.dueDate)}
                  </span>{" "}
                  <button
                    onClick={() => setIsEditingDate(true)}
                    className="ml-6 text-blue-400 hover:text-blue-300 underline"
                    disabled={isDeleting}
                  >
                    Edit
                  </button>
                </div>
              )}
              {isEditingDate && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="rounded-md bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-1 px-2 text-sm"
                    disabled={isUpdating}
                  />
                  <button
                    onClick={handleDateUpdate}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-blue-600 text-gray-100 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="px-3 py-1 text-gray-400 text-sm rounded-md hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {!task.dueDate && !isEditingDate && (
                <button
                  onClick={() => setIsEditingDate(true)}
                  className="mt-2 text-gray-500 hover:text-gray-400 text-sm underline"
                  disabled={isDeleting}
                >
                  Add due date
                </button>
              )}
            </div>
            <div className="mt-1">
              <select
                value={task.priority}
                onChange={(e) =>
                  handlePriorityChange(Number(e.target.value) as PriorityLevel)
                }
                className="text-sm bg-gray-700 border border-gray-600 text-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                disabled={isUpdating || isDeleting}
              >
                {Object.values(PRIORITY_LEVELS).map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.displayText}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Description Section */}
            {renderDescriptionSection()}
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isUpdating}
          className={`ml-4 px-4 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isDeleting ? (
            <LoadingSpinner />
          ) : (
            <span className="font-medium">Delete</span>
          )}
        </button>
      </div>
    </div>
  );
}
