"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState, PriorityLevel } from "@/lib/types";
import { useGetTasksQuery } from "@/lib/services/localApi";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";
import { TaskSearch } from "./TaskSearch";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import {
  PRIORITY_LEVELS,
  getPriorityFilterStyles,
  getPriorityFilterInlineStyles,
} from "@/lib/utils/priorityUtils";
import { searchTasks } from "@/lib/utils/searchUtils";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);
  const [priorityFilter, setPriorityFilter] = useState<"all" | PriorityLevel>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = [...tasks];

    if (priorityFilter !== "all") {
      filteredTasks = tasks.filter((task) => task.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      filteredTasks = searchTasks(filteredTasks, searchQuery, {
        fields: ["title"],
      });
    }

    return filteredTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [tasks, priorityFilter, searchQuery]);

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
    <div className="max-w-3xl mx-auto">
      <AddTaskForm />

      {tasks.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="w-full max-w-md">
            <TaskSearch
              onSearchChange={setSearchQuery}
              placeholder="Search tasks..."
            />
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-400 font-medium">
                  Priority:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPriorityFilter("all")}
                    className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      priorityFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    style={{
                      paddingLeft: "1.25rem",
                      paddingRight: "1.25rem",
                      paddingTop: "0.75rem",
                      paddingBottom: "0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    All
                  </button>
                  {Object.values(PRIORITY_LEVELS).map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setPriorityFilter(level.id)}
                      className={getPriorityFilterStyles(
                        level.id,
                        priorityFilter === level.id
                      )}
                      style={getPriorityFilterInlineStyles()}
                    >
                      {level.displayText}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-400 font-medium">Tags:</span>
                <div className="flex gap-2">
                  <button
                    disabled
                    className="px-4 py-2 rounded-md text-xs font-medium bg-gray-800 text-gray-500 border border-gray-600 cursor-not-allowed opacity-60"
                    style={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#1F2937",
                      color: "#6B7280",
                      borderColor: "#4B5563",
                    }}
                  >
                    Work
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 rounded-md text-xs font-medium bg-gray-800 text-gray-500 border border-gray-600 cursor-not-allowed opacity-60"
                    style={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#1F2937",
                      color: "#6B7280",
                      borderColor: "#4B5563",
                    }}
                  >
                    Personal
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 rounded-md text-xs font-medium bg-gray-800 text-gray-500 border border-gray-600 cursor-not-allowed opacity-60"
                    style={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#1F2937",
                      color: "#6B7280",
                      borderColor: "#4B5563",
                    }}
                  >
                    Urgent
                  </button>
                  <span className="px-3 py-2 text-xs text-gray-500 italic">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700"
            >
              <p className="text-xl text-gray-400 mb-2">
                {tasks.length === 0
                  ? "No tasks yet"
                  : "No tasks match the current filter"}
              </p>
              <p className="text-gray-500">
                {tasks.length === 0
                  ? "Add your first task using the form above!"
                  : searchQuery.trim()
                  ? "Try adjusting your search or priority filter."
                  : "Try changing the priority filter above."}
              </p>
            </motion.div>
          ) : (
            sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TaskItem task={task} searchQuery={searchQuery} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
