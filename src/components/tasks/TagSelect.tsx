'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/types';
import { addTag } from '@/lib/features/tagsSlice';
import { getColorStyles } from '@/lib/utils/colorUtils';
import { v4 as uuidv4 } from 'uuid';

interface TagSelectProps {
  selectedTagIds: string[];
  onTagSelect: (tagId: string) => void;
  onClose?: () => void;
}

export function TagSelect({
  selectedTagIds,
  onTagSelect,
  onClose,
}: TagSelectProps) {
  const dispatch = useDispatch();
  const allTags = useSelector((state: RootState) => state.tags.items);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available tags (not already selected)
  const availableTags = allTags.filter(
    (tag) => !selectedTagIds.includes(tag.id)
  );

  // Filter by search query
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query would create a new tag
  const isNewTag =
    searchQuery.trim() &&
    !allTags.some(
      (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
    );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleTagClick = (tagId: string) => {
    onTagSelect(tagId);
    setSearchQuery('');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCreateTag = () => {
    const newTag = {
      id: uuidv4(),
      name: searchQuery.trim(),
      color: 'blue',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addTag(newTag));
    onTagSelect(newTag.id);
    setSearchQuery('');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search or select a tag..."
          className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="py-1">
            {isNewTag && (
              <button
                type="button"
                onClick={handleCreateTag}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
              >
                <span className="text-blue-400 font-medium">+ Create:</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium border-2 bg-blue-500/20 text-blue-100 border-blue-500/50">
                  {searchQuery.trim()}
                </span>
              </button>
            )}
            {filteredTags.map((tag) => {
              const colorStyles = getColorStyles(tag.color);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagClick(tag.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${colorStyles.bgClass} ${colorStyles.textClass} ${colorStyles.borderClass}`}
                  >
                    {tag.name}
                  </span>
                </button>
              );
            })}
            {!isNewTag && filteredTags.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                {searchQuery ? 'No tags found' : 'No available tags'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
