"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Comment, RootState } from "@/lib/types";
import {
  useGetTaskCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/lib/services/localApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

interface CommentsProps {
  taskId: string;
}

export function Comments({ taskId }: CommentsProps) {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { data: comments = [], isLoading, isFetching } = useGetTaskCommentsQuery(taskId);
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");

  const sortedComments = useMemo(() => {
    return [...comments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [comments]);

  const handleAdd = async () => {
    if (!currentUser || !newComment.trim()) return;
    try {
      await addComment({
        taskId,
        comment: newComment.trim(),
        userId: currentUser.id,
      }).unwrap();
      setNewComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleStartEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditedText(c.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editedText.trim()) return;
    try {
      await updateComment({ id: editingId, comment: editedText.trim() }).unwrap();
      setEditingId(null);
      setEditedText("");
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id).unwrap();
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="mt-4 bg-gray-800/60 border border-gray-700 rounded-lg p-3">
      <h4 className="text-sm text-gray-300 font-semibold mb-2">Comments</h4>
      {isLoading && comments.length === 0 ? (
        <div className="py-4 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-3">
          {isFetching && comments.length > 0 && (
            <p className="text-xs text-gray-500">Refreshing…</p>
          )}
          {sortedComments.length === 0 && (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}

          {sortedComments.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-3 bg-gray-800 border border-gray-700 rounded-md p-2"
            >
              <div className="flex-1">
                {editingId === c.id ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        if (!isUpdating && editedText.trim()) {
                          handleSaveEdit();
                        }
                      }
                    }}
                    className="w-full rounded-md bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-2 text-sm"
                    rows={2}
                    disabled={isUpdating}
                  />
                ) : (
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">{c.comment}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  <span>by {currentUser && c.userId === currentUser.id ? currentUser.name : c.userId}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editingId === c.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-blue-600 text-gray-100 text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditedText("");
                      }}
                      disabled={isUpdating}
                      className="px-3 py-1 text-gray-400 text-xs rounded-md hover:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="px-3 py-1 text-blue-400 text-xs rounded-md hover:text-blue-300 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isDeleting}
                      className="px-3 py-1 text-red-400 text-xs rounded-md hover:text-red-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {currentUser && (
            <div className="mt-2 flex items-start gap-2">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (!isAdding && newComment.trim() && currentUser) {
                      handleAdd();
                    }
                  }
                }}
                className="flex-1 rounded-md bg-gray-700 border-2 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3 text-sm"
                rows={2}
                disabled={isAdding}
              />
              <button
                onClick={handleAdd}
                disabled={isAdding || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-gray-100 text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAdding ? <LoadingSpinner /> : "Add"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


