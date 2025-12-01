"use client";

import { useState } from "react";
import { Task, Comment, PriorityLevel } from "@/lib/types";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { formatDateForDisplay } from "@/lib/utils/dateFormatting";
import { PRIORITY_LEVELS, getPriorityStyles } from "@/lib/utils/priorityUtils";
import { highlightText } from "@/lib/utils/searchUtils";
import { TaskDescription } from "./TaskDescription";
import { CommentSection } from "./CommentSection";
import toast from "react-hot-toast";

interface TaskItemProps {
  task: Task;
  comments: Comment[];
  searchQuery?: string;
}

export function TaskItem({ task, comments, searchQuery }: TaskItemProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedDate, setEditedDate] = useState(task.dueDate || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const taskComments = comments.filter((c) => c.taskId === task.id);
  const commentCount = taskComments.length;

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
    } catch {
      toast.error("Failed to update due date");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedDate(task.dueDate || "");
    setIsEditingDate(false);
  };

  const isOverdue = (dateString: string | null): boolean => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
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

  return (
    <div
      className={`group p-5 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 ${getPriorityStyles(
        task.priority
      )}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
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
            <div className="flex items-center gap-2">
              {renderTaskTitle()}
              {/* Expand/collapse button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 p-1 text-gray-500 hover:text-gray-300 transition-colors rounded"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {/* Comment count badge */}
              {commentCount > 0 && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {commentCount}
                </span>
              )}
            </div>
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

      {/* Expandable section for description and comments */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <TaskDescription taskId={task.id} description={task.description} />
          <CommentSection task={task} comments={comments} />
        </div>
      )}
    </div>
  );
}
