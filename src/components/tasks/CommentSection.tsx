"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Comment, RootState, Task } from "@/lib/types";
import {
  useAddCommentMutation,
  useAddNotificationMutationMutation,
} from "@/lib/services/localApi";
import { CommentItem } from "./CommentItem";
import { MentionInput } from "./MentionInput";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import {
  extractMentions,
  findMentionedUsers,
  createMentionNotifications,
} from "@/lib/utils/mentionUtils";
import toast from "react-hot-toast";

interface CommentSectionProps {
  task: Task;
  comments: Comment[];
}

export function CommentSection({ task, comments }: CommentSectionProps) {
  const [addComment] = useAddCommentMutation();
  const [addNotification] = useAddNotificationMutationMutation();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, allUsers } = useSelector(
    (state: RootState) => state.user
  );

  // Ensure allUsers is an array (handle legacy localStorage)
  const users = allUsers || [];

  const taskComments = comments
    .filter((c) => c.taskId === task.id)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    if (!currentUser) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add the comment
      const result = await addComment({
        taskId: task.id,
        userId: currentUser.id,
        authorName: currentUser.name,
        content: newComment.trim(),
      }).unwrap();

      // Process @mentions and create notifications
      const mentions = extractMentions(newComment);
      if (mentions.length > 0) {
        const mentionedUsers = findMentionedUsers(mentions, users);
        const notifications = createMentionNotifications(
          mentionedUsers,
          currentUser.id,
          currentUser.name,
          task.id,
          result.id,
          task.title
        );

        // Create notifications for each mentioned user
        for (const notification of notifications) {
          await addNotification(notification).unwrap();
        }
      }

      setNewComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-400">
          Comments ({taskComments.length})
        </h4>
      </div>

      {/* Comment list */}
      {taskComments.length > 0 ? (
        <div className="space-y-2">
          {taskComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No comments yet</p>
      )}

      {/* Add comment form */}
      {currentUser ? (
        <div className="space-y-2">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            placeholder="Write a comment... Use @ to mention someone"
            disabled={isSubmitting}
            onSubmit={handleSubmit}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-1.5 bg-blue-600 text-gray-100 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Log in to comment</p>
      )}
    </div>
  );
}

