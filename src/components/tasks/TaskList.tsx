"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useGetTasksQuery } from "@/lib/services/localApi";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { motion, AnimatePresence } from "framer-motion";

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-300">
          Please login to manage your tasks
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load tasks. Please try again." />;
  }

  return (
    <div>
      <AddTaskForm />
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400"
            >
              No tasks yet. Add one above!
            </motion.p>
          ) : (
            tasks.map((task) => (
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
