"use client";

import { Task } from "@/lib/types";
import {
    downloadFile,
    exportToCSV,
    exportToJSON,
    generateFilename,
} from "@/lib/utils/exportUtils";
import { useEffect, useRef, useState } from "react";

interface TaskExportProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  onExport: (tasksToExport: Task[], format: "csv" | "json", filename: string) => void;
}

export function TaskExport({
  tasks,
  selectedTaskIds,
  onExport,
}: TaskExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasSelection = selectedTaskIds.size > 0;
  const selectedTasks = tasks.filter((task) => selectedTaskIds.has(task.id));

  const handleExport = (
    tasksToExport: Task[],
    format: "csv" | "json"
  ) => {
    const content =
      format === "csv" ? exportToCSV(tasksToExport) : exportToJSON(tasksToExport);
    const extension = format;
    const filename = generateFilename("tasks", extension);
    const mimeType = format === "csv" ? "text/csv" : "application/json";

    downloadFile(content, filename, mimeType);
    onExport(tasksToExport, format, filename);
    setIsOpen(false);
  };

  const handleExportSelected = (format: "csv" | "json") => {
    if (hasSelection) {
      handleExport(selectedTasks, format);
    }
  };

  const handleExportAll = (format: "csv" | "json") => {
    handleExport(tasks, format);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            <button
              type="button"
              onClick={() => handleExportSelected("csv")}
              disabled={!hasSelection}
              className={`block w-full text-left px-4 py-2 text-sm ${
                hasSelection
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-500 cursor-not-allowed opacity-50"
              } transition-colors`}
              role="menuitem"
            >
              Export Selected as CSV
            </button>
            <button
              type="button"
              onClick={() => handleExportSelected("json")}
              disabled={!hasSelection}
              className={`block w-full text-left px-4 py-2 text-sm ${
                hasSelection
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-500 cursor-not-allowed opacity-50"
              } transition-colors`}
              role="menuitem"
            >
              Export Selected as JSON
            </button>
            <div className="border-t border-gray-700 my-1" />
            <button
              type="button"
              onClick={() => handleExportAll("csv")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              role="menuitem"
            >
              Export All as CSV
            </button>
            <button
              type="button"
              onClick={() => handleExportAll("json")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              role="menuitem"
            >
              Export All as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

