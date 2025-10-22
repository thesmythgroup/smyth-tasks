import { Task } from "@/lib/types";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/services/localApi";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleToggle = () => {
    updateTask({
      id: task.id,
      completed: !task.completed,
    });
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span
          className={`text-gray-800 ${
            task.completed ? "line-through text-gray-500" : ""
          }`}
        >
          {task.title}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="text-red-500 hover:text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
