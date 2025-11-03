'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/types';
import { getColorStyles } from '@/lib/utils/colorUtils';

interface TaskTagsProps {
  tagIds: string[];
  onRemoveTag?: (tagId: string) => void;
  readOnly?: boolean;
}

export function TaskTags({
  tagIds,
  onRemoveTag,
  readOnly = false,
}: TaskTagsProps) {
  const allTags = useSelector((state: RootState) => state.tags.items);

  if (!tagIds || tagIds.length === 0) {
    return null;
  }

  // Filter to only tags that still exist
  const tags = tagIds
    .map((tagId) => allTags.find((tag) => tag.id === tagId))
    .filter((tag) => tag !== undefined);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const colorStyles = getColorStyles(tag.color);
        return (
          <div
            key={tag.id}
            className={`group flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 ${colorStyles.bgClass} ${colorStyles.textClass} ${colorStyles.borderClass} transition-all duration-200`}
          >
            <span>{tag.name}</span>
            {!readOnly && onRemoveTag && (
              <button
                onClick={() => onRemoveTag(tag.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1 hover:scale-110"
                aria-label={`Remove ${tag.name} tag`}
                type="button"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
