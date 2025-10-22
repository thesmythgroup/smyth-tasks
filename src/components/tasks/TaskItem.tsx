"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTagsQuery,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { TagBadge } from "../tags/TagBadge";
import { TagInput } from "../tags/TagInput";
import toast from "react-hot-toast";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: allTags = [] } = useGetTagsQuery();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);

  const taskTags = allTags.filter((tag) => task.tagIds.includes(tag.id));

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

  const handleStartEditTags = () => {
    setEditingTagIds(task.tagIds);
    setIsEditingTags(true);
  };

  const handleSaveTags = async () => {
    try {
      setIsUpdating(true);
      await updateTask({
        id: task.id,
        tagIds: editingTagIds,
      }).unwrap();
      setIsEditingTags(false);
      toast.success("Tags updated successfully");
    } catch {
      toast.error("Failed to update tags");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEditTags = () => {
    setIsEditingTags(false);
    setEditingTagIds([]);
  };

  return (
    <div className="group p-5 bg-gray-800 rounded-xl border-2 border-gray-700/50 hover:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="relative pt-0.5">
          {isUpdating && !isEditingTags ? (
            <div className="h-5 w-5 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              className="h-5 w-5 text-blue-500 rounded-md bg-gray-700/50 border-2 border-gray-600 focus:ring-2 focus:ring-blue-500/50 transition-all hover:border-blue-500/50 cursor-pointer"
              disabled={isUpdating || isDeleting || isEditingTags}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className={`text-base font-medium transition-all duration-200 ${
                task.completed
                  ? "line-through text-gray-500"
                  : "text-gray-100 group-hover:text-white"
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isEditingTags && (
                <button
                  onClick={handleStartEditTags}
                  disabled={isDeleting || isUpdating}
                  className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Edit Tags
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting || isUpdating || isEditingTags}
                className={`px-3 py-1.5 text-xs font-medium rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? <LoadingSpinner /> : "Delete"}
              </button>
            </div>
          </div>

          {isEditingTags ? (
            <div className="mt-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
              <TagInput
                selectedTagIds={editingTagIds}
                onChange={setEditingTagIds}
                placeholder="Search or create tags..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveTags}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEditTags}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              {taskTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {taskTags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No tags</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
