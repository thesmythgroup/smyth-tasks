"use client";

import { Tag } from "@/lib/types";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function TagBadge({
  tag,
  onRemove,
  size = "md",
  className = "",
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        borderColor: tag.color,
        borderWidth: "1px",
      }}
    >
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity focus:outline-none focus:ring-1 focus:ring-offset-1 rounded-full"
          style={{ color: tag.color }}
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
