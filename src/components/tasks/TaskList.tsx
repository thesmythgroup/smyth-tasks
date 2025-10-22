"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState, PriorityLevel } from "@/lib/types";
import { useGetTasksQuery } from "@/lib/services/localApi";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { PRIORITY_LEVELS, getPriorityFilterStyles } from "@/lib/utils/priorityUtils";
import { motion, AnimatePresence } from "framer-motion";

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [priorityFilter, setPriorityFilter] = useState<"all" | PriorityLevel>("all");

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = [...tasks];
    
    if (priorityFilter !== "all") {
      filteredTasks = tasks.filter(task => task.priority === priorityFilter);
    }
    
    return filteredTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [tasks, priorityFilter]);

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
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPriorityFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                priorityFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
            {Object.values(PRIORITY_LEVELS).map((level) => (
              <button
                key={level.id}
                onClick={() => setPriorityFilter(level.id)}
                className={getPriorityFilterStyles(level.id, priorityFilter === level.id)}
              >
                {level.displayText}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {filteredAndSortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700"
            >
              <p className="text-xl text-gray-400 mb-2">
                {tasks.length === 0 ? "No tasks yet" : "No tasks match the current filter"}
              </p>
              <p className="text-gray-500">
                {tasks.length === 0 
                  ? "Add your first task using the form above!"
                  : "Try changing the priority filter above."
                }
              </p>
            </motion.div>
          ) : (
            filteredAndSortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
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
