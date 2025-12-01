"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Comment, RootState } from "@/lib/types";
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { MentionInput } from "./MentionInput";
import { renderMentions } from "@/lib/utils/mentionUtils";
import toast from "react-hot-toast";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.user);
  const isOwner = currentUser?.id === comment.userId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    if (!editedContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsUpdating(true);
      await updateComment({
        id: comment.id,
        content: editedContent.trim(),
      }).unwrap();
      setIsEditing(false);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComment(comment.id).unwrap();
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-gray-700/50 rounded-md p-3 space-y-2">
        <MentionInput
          value={editedContent}
          onChange={setEditedContent}
          disabled={isUpdating}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-3 py-1 bg-blue-600 text-gray-100 text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="px-3 py-1 text-gray-400 text-xs rounded-md hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/50 rounded-md p-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-200">
              {comment.authorName}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
              {comment.updatedAt !== comment.createdAt && " (edited)"}
            </span>
          </div>
          <p
            className="text-sm text-gray-300 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: renderMentions(comment.content) }}
          />
        </div>

        {isOwner && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              {isDeleting ? (
                <LoadingSpinner />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

