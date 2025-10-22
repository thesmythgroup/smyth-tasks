"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useGetTasksQuery, useReorderTasksMutation } from "@/lib/services/localApi";
import { SortableTaskItem } from "./SortableTaskItem";
import { AddTaskForm } from "./AddTaskForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { useState } from "react";
import { Task } from "@/lib/types";

export function TaskList() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const [reorderTasksMutation] = useReorderTasksMutation();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sort tasks by order field
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  // Sensors for drag detection (mouse, touch, keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = sortedTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);

      const reordered = arrayMove(sortedTasks, oldIndex, newIndex);

      try {
        await reorderTasksMutation(reordered).unwrap();
        toast.success("Tasks reordered");
      } catch (error) {
        toast.error("Failed to reorder tasks");
      }
    }
    
    setActiveTask(null);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
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
                  <SortableTaskItem key={task.id} task={task} />
                ))
              )}
            </AnimatePresence>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90">
              <div className="flex items-stretch gap-3">
                <div className="flex items-center justify-center w-12 py-6 cursor-grabbing text-white bg-gray-600 rounded-lg border border-gray-500">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="group p-5 bg-gray-700 rounded-lg border-2 border-blue-500 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-lg text-gray-100">
                          {activeTask.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
