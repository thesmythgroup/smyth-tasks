"use client";

import { useState } from "react";
import {
  useGetTagsQuery,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "@/lib/services/localApi";
import { TagBadge } from "./TagBadge";
import { TagForm } from "./TagForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TagColor } from "@/lib/types";

export function TagList() {
  const { data: tags = [], isLoading, error } = useGetTagsQuery();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const handleUpdate = async (
    tagId: string,
    data: { name: string; color: TagColor }
  ) => {
    try {
      await updateTag({ id: tagId, ...data }).unwrap();
      setEditingTagId(null);
      toast.success("Tag updated successfully");
    } catch (error) {
      toast.error("Failed to update tag");
      throw error;
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      setDeletingTagId(tagId);
      await deleteTag(tagId).unwrap();
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tag: " + error);
    } finally {
      setDeletingTagId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Loading tags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load tags. Please try again." />;
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
        <svg
          className="mx-auto h-12 w-12 text-gray-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p className="text-xl text-gray-400 mb-2">No tags yet</p>
        <p className="text-gray-500">
          Create your first tag using the form above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
          >
            {editingTagId === tag.id ? (
              <div className="p-4">
                <TagForm
                  tag={tag}
                  onSubmit={(data) => handleUpdate(tag.id, data)}
                  onCancel={() => setEditingTagId(null)}
                  submitLabel="Update"
                />
              </div>
            ) : (
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TagBadge tag={tag} size="md" />
                  <div className="text-sm text-gray-400">
                    <span>
                      Created{" "}
                      {new Date(tag.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTagId(tag.id)}
                    disabled={deletingTagId === tag.id}
                    className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    disabled={deletingTagId === tag.id}
                    className={`px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      deletingTagId === tag.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {deletingTagId === tag.id ? <LoadingSpinner /> : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
