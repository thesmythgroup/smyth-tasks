import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import { useGetTasksQuery } from "@/lib/services/localApi";
import { TaskItem } from "./TaskItem";
import { AddTaskForm } from "./AddTaskForm";

export function TaskList() {
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700">
          Please login to manage your tasks
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <AddTaskForm />
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">
            No tasks yet. Add one above!
          </p>
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
