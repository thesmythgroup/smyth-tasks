"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useGetTasksQuery } from "@/lib/services/localApi";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
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
      <div className="space-y-4">
        <AnimatePresence>
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700"
            >
              <p className="text-xl text-gray-400 mb-2">No tasks yet</p>
              <p className="text-gray-500">
                Add your first task using the form above!
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
                <TaskItem task={task} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
