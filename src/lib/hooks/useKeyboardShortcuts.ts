import { useCallback, useEffect, useRef, useState } from "react";

export interface UseKeyboardShortcutsOptions {
  taskCount: number;
  onAddTask?: () => void;
  onToggleTask?: (index: number) => void;
  onDeleteTask?: (index: number) => void;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsReturn {
  selectedIndex: number;
  handleKeyDown: (event: KeyboardEvent) => void;
}

/**
 * Hook to manage keyboard shortcuts for task management
 * 
 * Shortcuts:
 * - Cmd/Ctrl+N: Add new task
 * - Space: Complete selected task
 * - Delete: Delete selected task
 * - Up Arrow: Navigate to previous task
 * - Down Arrow: Navigate to next task
 */
export function useKeyboardShortcuts({
  taskCount,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  enabled = true,
}: UseKeyboardShortcutsOptions): UseKeyboardShortcutsReturn {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const taskCountRef = useRef(taskCount);

  // Update ref when task count changes
  useEffect(() => {
    taskCountRef.current = taskCount;
  }, [taskCount]);

  // Reset selection when task count changes
  useEffect(() => {
    if (taskCount === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex >= taskCount) {
      setSelectedIndex(Math.max(0, taskCount - 1));
    }
  }, [taskCount, selectedIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (!target) return;
      
      const tagName = target.tagName?.toUpperCase();
      const isContentEditable = target.isContentEditable || target.getAttribute?.("contenteditable") === "true";
      
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        isContentEditable
      ) {
        return;
      }

      // Handle Cmd/Ctrl+N for adding new task
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        onAddTask?.();
        return;
      }

      // Handle Space for toggling task completion
      if (event.key === " " && selectedIndex >= 0 && selectedIndex < taskCountRef.current) {
        event.preventDefault();
        onToggleTask?.(selectedIndex);
        return;
      }

      // Handle Delete for deleting task
      if (event.key === "Delete" && selectedIndex >= 0 && selectedIndex < taskCountRef.current) {
        event.preventDefault();
        onDeleteTask?.(selectedIndex);
        // Reset selection after deletion
        if (taskCountRef.current > 1) {
          setSelectedIndex(Math.min(selectedIndex, taskCountRef.current - 2));
        } else {
          setSelectedIndex(-1);
        }
        return;
      }

      // Handle Up Arrow for navigation
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (taskCountRef.current === 0) return;
        if (selectedIndex <= 0) {
          // Wrap to bottom
          setSelectedIndex(taskCountRef.current - 1);
        } else {
          setSelectedIndex(selectedIndex - 1);
        }
        return;
      }

      // Handle Down Arrow for navigation
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (taskCountRef.current === 0) return;
        if (selectedIndex >= taskCountRef.current - 1) {
          // Wrap to top
          setSelectedIndex(0);
        } else {
          setSelectedIndex(selectedIndex + 1);
        }
        return;
      }
    },
    [enabled, selectedIndex, onAddTask, onToggleTask, onDeleteTask]
  );

  return {
    selectedIndex,
    handleKeyDown,
  };
}

