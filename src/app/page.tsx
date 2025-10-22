"use client";

import { TaskList } from "@/components/tasks/TaskList";

export default function Home() {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>
      <TaskList />
    </div>
  );
}
