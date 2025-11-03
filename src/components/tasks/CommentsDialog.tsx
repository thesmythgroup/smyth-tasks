"use client";

import { createPortal } from "react-dom";
import { Comments } from "./Comments";

interface CommentsDialogProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsDialog({ taskId, isOpen, onClose }: CommentsDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-full max-w-2xl mx-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-gray-200 font-semibold">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h:[70vh] md:max-h-[80vh] overflow-y-auto">
          <Comments taskId={taskId} />
        </div>
      </div>
    </div>,
    document.body
  );
}


