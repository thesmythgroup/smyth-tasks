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
  const { data: allTags = [], refetch } = useGetTagsQuery();
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
      // Refetch tags to ensure the new tag appears
      await refetch();
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
        <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
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
          className="w-full rounded-lg bg-gray-700/50 border border-gray-600/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 py-2.5 px-3 text-sm transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setShowCreateForm(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (search || !showCreateForm) && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-auto">
          {showCreateForm ? (
            <div className="p-4">
              <div className="mb-3 pb-3 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300">
                  Create New Tag
                </h3>
              </div>
              <TagForm
                tag={{ name: search } as any}
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
                <div className="py-1.5">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectTag(tag)}
                      className="w-full px-3 py-2.5 text-left hover:bg-gray-700 transition-all"
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
                    <div className="border-t border-gray-700 my-1" />
                  )}
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-3 py-3 text-left hover:bg-blue-500/10 transition-all text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Create{" "}
                    <strong className="font-semibold">
                      &quot;{search}&quot;
                    </strong>
                  </button>
                </>
              )}

              {/* No Results */}
              {filteredTags.length === 0 && search && exactMatch && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Tag already selected
                </div>
              )}
              {filteredTags.length === 0 && !search && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Type to search or create tags
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
