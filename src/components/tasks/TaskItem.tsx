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
    <div className="group p-5 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
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
          <span
            className={`text-lg text-gray-100 transition-all duration-200 ${
              task.completed
                ? "line-through text-gray-500"
                : "group-hover:text-gray-50"
            }`}
          >
            {task.title}
          </span>
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
