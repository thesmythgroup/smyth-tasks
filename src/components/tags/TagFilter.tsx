"use client";

import { useState, useRef, useEffect } from "react";
import { useGetTagsQuery } from "@/lib/services/localApi";
import { TagBadge } from "./TagBadge";

interface TagFilterProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagFilter({ selectedTagIds, onChange }: TagFilterProps) {
  const { data: allTags = [] } = useGetTagsQuery();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-2 border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">Filter by Tags</span>
        {selectedTagIds.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
            {selectedTagIds.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-80 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-semibold text-gray-300">
              Select Tags
            </span>
            {selectedTagIds.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Tag List */}
          <div className="max-h-60 overflow-y-auto py-2">
            {allTags.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No tags available yet.
                <br />
                Create some tags to filter your tasks.
              </div>
            ) : (
              allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700 transition-colors ${
                      isSelected ? "bg-gray-700/50" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
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
                    </div>
                    <TagBadge tag={tag} size="sm" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selectedTags.length > 0 && (
            <div className="border-t border-gray-700 px-4 py-3 bg-gray-750">
              <div className="text-xs text-gray-400 mb-2">
                Filtering by {selectedTags.length}{" "}
                {selectedTags.length === 1 ? "tag" : "tags"}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    size="sm"
                    onRemove={() => handleToggleTag(tag.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
