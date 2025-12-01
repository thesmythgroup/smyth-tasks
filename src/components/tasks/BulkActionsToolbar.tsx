"use client";

import { useState } from "react";
import { PriorityLevel } from "@/lib/types";
import { PRIORITY_LEVELS } from "@/lib/utils/priorityUtils";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onComplete: () => void;
  onDelete: () => void;
  onPriorityUpdate: (priority: PriorityLevel) => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  onComplete,
  onDelete,
  onPriorityUpdate,
  onClearSelection,
  isProcessing = false,
}: BulkActionsToolbarProps) {
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | "">(
    ""
  );

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priority = Number(e.target.value) as PriorityLevel;
    setSelectedPriority(priority);
    onPriorityUpdate(priority);
    // Reset dropdown after action
    setTimeout(() => setSelectedPriority(""), 100);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 py-4 px-4 rounded-lg mb-4 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-300">
            {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onComplete}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete
          </button>

          <div className="relative">
            <select
              value={selectedPriority}
              onChange={handlePriorityChange}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
            >
              <option value="">Update Priority</option>
              {Object.values(PRIORITY_LEVELS).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.displayText}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onDelete}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>

          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
}

