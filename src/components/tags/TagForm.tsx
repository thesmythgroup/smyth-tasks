"use client";

import { useState } from "react";
import { Tag, TAG_COLORS, TagColor } from "@/lib/types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface TagFormProps {
  tag?: Tag;
  onSubmit: (data: { name: string; color: TagColor }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const COLOR_OPTIONS = Object.entries(TAG_COLORS).map(([name, value]) => ({
  name,
  value,
}));

export function TagForm({
  tag,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: TagFormProps) {
  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState<TagColor>(tag?.color || TAG_COLORS.BLUE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tag name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit({ name: name.trim(), color });
    } catch (err) {
      setError("Failed to save tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full rounded-lg bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 py-2 px-3 text-sm transition-all duration-200"
          disabled={isSubmitting}
          autoFocus
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setColor(option.value)}
              className={`relative p-3 rounded-lg transition-all ${
                color === option.value
                  ? "ring-2 ring-offset-2 ring-offset-gray-800 scale-105"
                  : "hover:scale-105"
              }`}
              style={{
                backgroundColor: option.value,
                borderColor: option.value,
              }}
              disabled={isSubmitting}
              aria-label={`Select ${option.name.toLowerCase()} color`}
            >
              {color === option.value && (
                <svg
                  className="h-5 w-5 text-white mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="sr-only">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 px-4 py-2 bg-blue-600 text-gray-100 font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? <LoadingSpinner /> : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
