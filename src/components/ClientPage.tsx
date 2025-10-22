"use client";

import { TaskList } from "./tasks/TaskList";

export function ClientPage() {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">My Tasks</h1>
      <TaskList />
    </div>
  );
}
