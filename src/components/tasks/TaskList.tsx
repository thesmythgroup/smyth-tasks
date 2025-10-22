"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useGetTasksQuery } from "@/lib/services/localApi";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";
import { TagFilter } from "../tags/TagFilter";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { motion, AnimatePresence } from "framer-motion";

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Filter tasks based on selected tags (AND logic - task must have ALL selected tags)
  const filteredTasks = useMemo(() => {
    if (selectedFilterTags.length === 0) {
      return tasks;
    }
    return tasks.filter((task) =>
      selectedFilterTags.every((tagId) => task.tagIds.includes(tagId))
    );
  }, [tasks, selectedFilterTags]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h2 className="text-3xl font-bold text-gray-300 mb-4">
          Welcome to Task Tracker
        </h2>
        <p className="text-xl text-gray-400 text-center max-w-md">
          Please login to start managing your tasks and stay organized
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load tasks. Please try again." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AddTaskForm />

      {/* Filter Section */}
      {tasks.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <TagFilter
            selectedTagIds={selectedFilterTags}
            onChange={setSelectedFilterTags}
          />
          {selectedFilterTags.length > 0 && (
            <div className="text-sm font-medium text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
              {filteredTasks.length} of {tasks.length} task
              {tasks.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 px-4 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-700/50"
            >
              {tasks.length === 0 ? (
                <>
                  <svg
                    className="mx-auto h-16 w-16 text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-xl font-semibold text-gray-400 mb-2">
                    No tasks yet
                  </p>
                  <p className="text-gray-500">
                    Create your first task to get started!
                  </p>
                </>
              ) : (
                <>
                  <svg
                    className="mx-auto h-16 w-16 text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <p className="text-xl font-semibold text-gray-400 mb-2">
                    No matching tasks
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your filters to see more tasks
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TaskItem task={task} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
