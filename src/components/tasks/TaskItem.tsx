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
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {isUpdating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              className="h-4 w-4 text-blue-500 rounded bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-800"
              disabled={isUpdating || isDeleting}
            />
          )}
        </div>
        <span
          className={`text-gray-100 transition-all ${
            task.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {task.title}
        </span>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting || isUpdating}
        className={`text-red-400 hover:text-red-300 transition-colors ${
          isDeleting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isDeleting ? <LoadingSpinner size="sm" /> : "Delete"}
      </button>
    </div>
  );
}
