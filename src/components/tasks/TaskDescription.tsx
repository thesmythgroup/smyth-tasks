"use client";

import { useState } from "react";
import { useUpdateTaskMutation } from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

interface TaskDescriptionProps {
  taskId: string;
  description?: string;
}

export function TaskDescription({ taskId, description }: TaskDescriptionProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await updateTask({
        id: taskId,
        description: editedDescription,
      }).unwrap();
      setIsEditing(false);
      toast.success("Description updated");
    } catch {
      toast.error("Failed to update description");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedDescription(description || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-3 space-y-2">
        <label className="block text-sm font-medium text-gray-400">
          Description
        </label>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
          className="w-full rounded-md bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3 text-sm resize-none"
          disabled={isUpdating}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-blue-600 text-gray-100 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="px-3 py-1.5 text-gray-400 text-sm rounded-md hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-400">
          Description
        </label>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {description ? "Edit" : "Add"}
        </button>
      </div>
      {description ? (
        <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-700/50 rounded-md p-3">
          {description}
        </p>
      ) : (
        <p className="text-sm text-gray-500 italic">No description</p>
      )}
    </div>
  );
}

