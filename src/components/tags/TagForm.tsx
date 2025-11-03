'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTag } from '@/lib/features/tagsSlice';
import { Tag } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { ColorPicker } from './ColorPicker';
import toast from 'react-hot-toast';

export function TagForm() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    const newTag: Tag = {
      id: uuidv4(),
      name: name.trim(),
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addTag(newTag));
    toast.success('Tag created successfully');

    // Reset form
    setName('');
    setSelectedColor('blue');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-gray-700"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Create New Tag
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="tag-name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Tag Name
          </label>
          <input
            id="tag-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tag name..."
            className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tag Color
          </label>
          <ColorPicker
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Create Tag
        </button>
      </div>
    </form>
  );
}
