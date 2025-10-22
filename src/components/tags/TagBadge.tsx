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
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all shadow-sm ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${tag.color}15`,
        color: tag.color,
        borderColor: `${tag.color}40`,
        borderWidth: "1px",
      }}
    >
      <span className="font-semibold">{tag.name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black/10 rounded-sm p-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-offset-1"
          style={{ color: tag.color }}
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
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
