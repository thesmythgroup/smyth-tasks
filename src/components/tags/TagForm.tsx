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

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Tag name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit({ name: name.trim(), color });
    } catch {
      setError("Failed to save tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3.5">
      <div>
        <label
          htmlFor="tag-name"
          className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide"
        >
          Tag Name
        </label>
        <input
          id="tag-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Urgent, Personal..."
          className="w-full rounded-lg bg-gray-700/50 border border-gray-600/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 py-2 px-3 text-sm transition-all duration-200"
          disabled={isSubmitting}
          autoFocus
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
          Choose Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setColor(option.value)}
              className={`relative p-2.5 rounded-lg transition-all border-2 ${
                color === option.value
                  ? "ring-2 ring-offset-2 ring-offset-gray-800 scale-105 border-white/30"
                  : "border-transparent hover:scale-105 hover:border-white/20"
              }`}
              style={{
                backgroundColor: option.value,
              }}
              disabled={isSubmitting}
              aria-label={`Select ${option.name.toLowerCase()} color`}
              title={option.name}
            >
              {color === option.value && (
                <svg
                  className="h-4 w-4 text-white mx-auto drop-shadow-lg"
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
        <p className="text-xs text-gray-500 mt-2">
          Selected:{" "}
          <span className="font-medium text-gray-400">
            {COLOR_OPTIONS.find((c) => c.value === color)?.name}
          </span>
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
          className={`flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-sm ${
            isSubmitting || !name.trim()
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-md"
          }`}
        >
          {isSubmitting ? <LoadingSpinner /> : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-gray-700/50 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
