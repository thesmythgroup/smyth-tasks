"use client";

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, PriorityLevel, Task } from "@/lib/types";
import { useGetTasksQuery, useUpdateTaskMutation } from "@/lib/services/localApi";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { reorderTasks, moveTaskToPriority, clearTaskOrder, reorderMultipleTasks } from "@/lib/features/tasksSlice";

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [updateTask] = useUpdateTaskMutation();

  const [priorityFilter, setPriorityFilter] = useState<"all" | PriorityLevel>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [useCustomOrder, setUseCustomOrder] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    if (useCustomOrder) {
      // Sort by global order field (allowing items to be positioned above/below items of different priorities)
      return filteredTasks.sort((a, b) => {
        const aOrder = a.order ?? Infinity;
        const bOrder = b.order ?? Infinity;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        // Fallback to createdAt if no order
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } else {
      // Auto sort: priority → due date → created date
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
    }
  }, [tasks, priorityFilter, searchQuery, useCustomOrder]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    if (!overTask) return;

    // Get all tasks sorted by current order
    const sortedTasks = [...tasks].sort((a, b) => {
      const aOrder = a.order ?? Infinity;
      const bOrder = b.order ?? Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
    const newIndex = sortedTasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    // Reorder tasks
    const reordered = arrayMove(sortedTasks, oldIndex, newIndex);

    // Update priorities if dragging across priority boundaries
    if (activeTask.priority !== overTask.priority) {
      // Update the dragged task's priority to match the target
      dispatch(
        moveTaskToPriority({
          taskId: active.id as string,
          newPriority: overTask.priority,
          newOrder: newIndex,
        })
      );
      await updateTask({
        id: active.id as string,
        priority: overTask.priority,
        order: newIndex,
      }).unwrap();
    }

    // Update order for all tasks
    const orderUpdates = reordered.map((task, index) => ({
      taskId: task.id,
      order: index,
    }));

    dispatch(reorderMultipleTasks(orderUpdates));

    // Persist updates
    await Promise.all(
      orderUpdates.map(({ taskId, order }) =>
        updateTask({ id: taskId, order }).unwrap()
      )
    );
  };

  const handleToggleCustomOrder = () => {
    if (useCustomOrder) {
      // Switching to auto sort - clear custom order
      dispatch(clearTaskOrder());
    }
    setUseCustomOrder(!useCustomOrder);
  };

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
          <div className="flex items-center justify-between gap-4">
            <div className="w-full max-w-md">
              <TaskSearch
                onSearchChange={setSearchQuery}
                placeholder="Search tasks..."
              />
            </div>
            <button
              onClick={handleToggleCustomOrder}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                useCustomOrder
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title={useCustomOrder ? "Switch to Auto Sort" : "Enable Custom Order"}
            >
              {useCustomOrder ? "Custom Order" : "Auto Sort"}
            </button>
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
              <SortableContext
                items={filteredAndSortedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredAndSortedTasks.map((task) => (
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
                      isDragEnabled={useCustomOrder}
                    />
                  </motion.div>
                ))}
              </SortableContext>
            )}
          </AnimatePresence>
        </div>
        <DragOverlay>
          {activeId ? (
            (() => {
              const activeTask = tasks.find((t) => t.id === activeId);
              if (!activeTask) return null;
              return (
                <div className="opacity-90 rotate-3 scale-105">
                  <TaskItem
                    task={activeTask}
                    searchQuery={searchQuery}
                    isDragEnabled={false}
                  />
                </div>
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
