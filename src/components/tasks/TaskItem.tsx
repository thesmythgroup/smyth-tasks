"use client";

import { useState } from "react";
import { Task, PriorityLevel } from "@/lib/types";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { PRIORITY_LEVELS, getPriorityStyles } from "@/lib/utils/priorityUtils";
import { highlightText } from "@/lib/utils/searchUtils";
import toast from "react-hot-toast";

interface TaskItemProps {
  task: Task;
  searchQuery?: string;
}

export function TaskItem({ task, searchQuery }: TaskItemProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className={`group p-5 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-l-4 ${getPriorityStyles(task.priority)}`}>
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
            {renderTaskTitle()}
            <div className="mt-1">
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(Number(e.target.value) as PriorityLevel)}
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
    </div>
  );
}
