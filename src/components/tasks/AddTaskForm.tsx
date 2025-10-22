import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useAddTaskMutation } from "@/lib/services/localApi";

export function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [addTask] = useAddTaskMutation();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    await addTask({
      title: title.trim(),
      completed: false,
      userId: currentUser.id,
    });

    setTitle("");
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
