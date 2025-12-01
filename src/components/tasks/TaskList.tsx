"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState, PriorityLevel, Task } from "@/lib/types";
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/services/localApi";
import toast from "react-hot-toast";
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

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [priorityFilter, setPriorityFilter] = useState<"all" | PriorityLevel>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isMultiselectMode, setIsMultiselectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedDate, setSelectedDate] = useState("");

  const enterMultiselectMode = () => {
    setIsMultiselectMode(true);
    setSelectedTaskIds(new Set());
  };

  const exitMultiselectMode = () => {
    setIsMultiselectMode(false);
    setSelectedTaskIds(new Set());
    setSelectedDate("");
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getTasksRequiringUpdates = (
    selectedIds: string[],
    shouldUpdate: (task: Task) => boolean
  ): string[] => {
    return selectedIds.filter((id) => {
      const task = tasks.find((t) => t.id === id);
      return task && shouldUpdate(task);
    });
  };

  const handleBatchPriorityChange = async (newPriority: PriorityLevel) => {
    const selectedIds = Array.from(selectedTaskIds);
    if (selectedIds.length === 0) return;

    const tasksToUpdate = getTasksRequiringUpdates(
      selectedIds,
      (task) => task.priority !== newPriority
    );

    if (tasksToUpdate.length === 0) {
      toast("No tasks needed priority updates", { icon: "ℹ️" });
      exitMultiselectMode();
      return;
    }

    try {
      await Promise.all(
        tasksToUpdate.map((id) =>
          updateTask({ id, priority: newPriority }).unwrap()
        )
      );
      toast.success(
        `Priority updated for ${tasksToUpdate.length} task${tasksToUpdate.length > 1 ? "s" : ""}`
      );
      exitMultiselectMode();
    } catch {
      toast.error("Failed to update priority for some tasks");
    }
  };

  const handleBatchDelete = async () => {
    const selectedIds = Array.from(selectedTaskIds);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) => deleteTask(id).unwrap())
      );
      toast.success(
        `${selectedIds.length} task${selectedIds.length > 1 ? "s" : ""} deleted successfully`
      );
      exitMultiselectMode();
    } catch {
      toast.error("Failed to delete some tasks");
    }
  };

  const handleBatchMarkAsDone = async () => {
    const selectedIds = Array.from(selectedTaskIds);
    if (selectedIds.length === 0) return;

    const tasksToUpdate = getTasksRequiringUpdates(
      selectedIds,
      (task) => !task.completed
    );

    if (tasksToUpdate.length === 0) {
      toast("All selected tasks are already marked as done", { icon: "ℹ️" });
      exitMultiselectMode();
      return;
    }

    try {
      await Promise.all(
        tasksToUpdate.map((id) =>
          updateTask({ id, completed: true }).unwrap()
        )
      );
      toast.success(
        `${tasksToUpdate.length} task${tasksToUpdate.length > 1 ? "s" : ""} marked as done`
      );
      exitMultiselectMode();
    } catch {
      toast.error("Failed to mark some tasks as done");
    }
  };

  const handleBatchSetDueDate = async () => {
    const selectedIds = Array.from(selectedTaskIds);
    if (selectedIds.length === 0 || !selectedDate) return;

    const tasksToUpdate = getTasksRequiringUpdates(
      selectedIds,
      (task) => task.dueDate !== selectedDate
    );

    if (tasksToUpdate.length === 0) {
      toast("All selected tasks already have this due date", { icon: "ℹ️" });
      setSelectedDate("");
      exitMultiselectMode();
      return;
    }

    try {
      await Promise.all(
        tasksToUpdate.map((id) =>
          updateTask({ id, dueDate: selectedDate }).unwrap()
        )
      );
      toast.success(
        `Due date set for ${tasksToUpdate.length} task${tasksToUpdate.length > 1 ? "s" : ""}`
      );
      setSelectedDate("");
      exitMultiselectMode();
    } catch {
      toast.error("Failed to set due date for some tasks");
    }
  };

  const handleClearDueDate = async () => {
    const selectedIds = Array.from(selectedTaskIds);
    if (selectedIds.length === 0) return;

    const tasksToUpdate = getTasksRequiringUpdates(
      selectedIds,
      (task) => task.dueDate !== null
    );

    if (tasksToUpdate.length === 0) {
      toast("All selected tasks already have no due date", { icon: "ℹ️" });
      exitMultiselectMode();
      return;
    }

    try {
      await Promise.all(
        tasksToUpdate.map((id) =>
          updateTask({ id, dueDate: null }).unwrap()
        )
      );
      toast.success(
        `Due date cleared for ${tasksToUpdate.length} task${tasksToUpdate.length > 1 ? "s" : ""}`
      );
      exitMultiselectMode();
    } catch {
      toast.error("Failed to clear due date for some tasks");
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

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

      if (!a.dueDate && !b.dueDate) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-full max-w-md">
              <TaskSearch
                onSearchChange={setSearchQuery}
                placeholder="Search tasks..."
              />
            </div>
            {!isMultiselectMode ? (
              <button
                onClick={enterMultiselectMode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Select Multiple
              </button>
            ) : (
              <button
                onClick={exitMultiselectMode}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col gap-2">
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

      {isMultiselectMode && (
        <div className="sticky top-0 z-10 bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="text-gray-300 font-medium">
              {selectedTaskIds.size > 0
                ? `${selectedTaskIds.size} task${selectedTaskIds.size > 1 ? "s" : ""} selected`
                : "No tasks selected"}
            </div>
          </div>
          <div className="space-y-3">
            {/* Row 1: Mark as Done and Delete */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBatchMarkAsDone}
                disabled={selectedTaskIds.size === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Done
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedTaskIds.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Selected
              </button>
            </div>
            {/* Row 2: Priority */}
            <div className="flex items-center gap-3">
              <select
                onChange={(e) =>
                  handleBatchPriorityChange(
                    Number(e.target.value) as PriorityLevel
                  )
                }
                disabled={selectedTaskIds.size === 0}
                className="text-sm bg-gray-700 border border-gray-600 text-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                defaultValue=""
              >
                <option value="" disabled>
                  Change priority...
                </option>
                {Object.values(PRIORITY_LEVELS).map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.displayText}
                  </option>
                ))}
              </select>
            </div>
            {/* Row 3: Due Date Picker, Set Date, Clear Due Date */}
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                disabled={selectedTaskIds.size === 0}
                className="text-sm bg-gray-700 border border-gray-600 text-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleBatchSetDueDate}
                disabled={!selectedDate || selectedTaskIds.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Date
              </button>
              <button
                onClick={handleClearDueDate}
                disabled={selectedTaskIds.size === 0}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Due Date
              </button>
            </div>
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
            filteredAndSortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TaskItem
                  task={task}
                  searchQuery={searchQuery}
                  isMultiselectMode={isMultiselectMode}
                  isSelected={selectedTaskIds.has(task.id)}
                  onToggleSelection={() => toggleTaskSelection(task.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
