"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to delete task");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {isUpdating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors duration-200"
              disabled={isUpdating || isDeleting}
            />
          )}
        </div>
        <span
          className={`text-gray-800 transition-all duration-200 ${
            task.completed ? "line-through text-gray-500" : ""
          }`}
        >
          {task.title}
        </span>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting || isUpdating}
        className={`text-red-500 hover:text-red-600 transition-colors duration-200 ${
          isDeleting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isDeleting ? <LoadingSpinner size="sm" /> : "Delete"}
      </button>
    </div>
  );
}
