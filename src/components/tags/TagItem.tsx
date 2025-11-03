'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTag, removeTag } from '@/lib/features/tagsSlice';
import { removeTagFromTasks } from '@/lib/features/tasksSlice';
import { Tag, RootState } from '@/lib/types';
import { getColorStyles } from '@/lib/utils/colorUtils';
import { ColorPicker } from './ColorPicker';
import toast from 'react-hot-toast';

interface TagItemProps {
  tag: Tag;
}

export function TagItem({ tag }: TagItemProps) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(tag.name);
  const [editedColor, setEditedColor] = useState(tag.color);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Count how many tasks use this tag
  const taskCount = useSelector(
    (state: RootState) =>
      state.tasks.items.filter((task) => task.tagIds?.includes(tag.id)).length
  );

  const colorStyles = getColorStyles(tag.color);

  const handleSave = () => {
    if (!editedName.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    dispatch(
      updateTag({
        id: tag.id,
        name: editedName.trim(),
        color: editedColor,
      })
    );
    setIsEditing(false);
    toast.success('Tag updated successfully');
  };

  const handleCancel = () => {
    setEditedName(tag.name);
    setEditedColor(tag.color);
    setIsEditing(false);
  };

  const handleDelete = () => {
    // First remove the tag from all tasks
    dispatch(removeTagFromTasks(tag.id));
    // Then remove the tag itself
    dispatch(removeTag(tag.id));
    toast.success('Tag deleted successfully');
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-5 shadow-lg border-2 border-blue-500">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tag Name
            </label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              maxLength={50}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tag Color
            </label>
            <ColorPicker
              selectedColor={editedColor}
              onColorSelect={setEditedColor}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showDeleteConfirm) {
    return (
      <div className="bg-gray-800 rounded-lg p-5 shadow-lg border-2 border-red-500">
        <p className="text-gray-100 mb-2">
          Are you sure you want to delete this tag?
        </p>
        {taskCount > 0 && (
          <p className="text-yellow-400 text-sm mb-4">
            This tag is used by {taskCount} task{taskCount !== 1 ? 's' : ''}. It
            will be removed from all tasks.
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg border-2 border-gray-700 hover:border-gray-600 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${colorStyles.bgClass} ${colorStyles.textClass} ${colorStyles.borderClass}`}
          >
            {tag.name}
          </span>
          {taskCount > 0 && (
            <span className="text-sm text-gray-400">
              ({taskCount} task{taskCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-lg text-sm font-semibold transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-gray-100 rounded-lg text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
