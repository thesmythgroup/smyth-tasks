"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, TagColor } from "@/lib/types";
import { TagBadge } from "./TagBadge";
import { TagForm } from "./TagForm";
import { useGetTagsQuery, useAddTagMutation } from "@/lib/services/localApi";
import toast from "react-hot-toast";

interface TagInputProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  selectedTagIds,
  onChange,
  placeholder = "Search or create tags...",
}: TagInputProps) {
  const { data: allTags = [] } = useGetTagsQuery();
  const [addTag] = useAddTagMutation();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));

  const filteredTags = allTags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = allTags.find(
    (tag) => tag.name.toLowerCase() === search.toLowerCase()
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCreateForm(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTag = (tag: Tag) => {
    onChange([...selectedTagIds, tag.id]);
    setSearch("");
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateTag = async (data: { name: string; color: TagColor }) => {
    try {
      const newTag = await addTag(data).unwrap();
      onChange([...selectedTagIds, newTag.id]);
      setShowCreateForm(false);
      setSearch("");
      toast.success("Tag created successfully");
    } catch (error) {
      toast.error("Failed to create tag");
      throw error;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="sm"
              onRemove={() => handleRemoveTag(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setShowCreateForm(false);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 py-2 px-3 text-sm transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setShowCreateForm(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (search || !showCreateForm) && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
          {showCreateForm ? (
            <div className="p-4">
              <TagForm
                onSubmit={handleCreateTag}
                onCancel={() => {
                  setShowCreateForm(false);
                  setSearch("");
                }}
                submitLabel="Create Tag"
              />
            </div>
          ) : (
            <>
              {/* Filtered Tags */}
              {filteredTags.length > 0 && (
                <div className="py-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectTag(tag)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <TagBadge tag={tag} size="sm" />
                    </button>
                  ))}
                </div>
              )}

              {/* Create New Tag Option */}
              {search && !exactMatch && (
                <>
                  {filteredTags.length > 0 && (
                    <div className="border-t border-gray-700" />
                  )}
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>
                      Create tag <strong>&quot;{search}&quot;</strong>
                    </span>
                  </button>
                </>
              )}

              {/* No Results */}
              {filteredTags.length === 0 && search && exactMatch && (
                <div className="px-4 py-3 text-sm text-gray-400">
                  Tag already selected
                </div>
              )}
              {filteredTags.length === 0 && !search && (
                <div className="px-4 py-3 text-sm text-gray-400">
                  No more tags available
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
