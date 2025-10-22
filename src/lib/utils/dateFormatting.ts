export const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDateUrgency = (
  dateString: string | null
): "overdue" | "today" | "tomorrow" | "upcoming" | "none" => {
  if (!dateString) return "none";

  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return "upcoming";
};

export const getUrgencyLabel = (dateString: string | null): string => {
  const urgency = getDateUrgency(dateString);

  switch (urgency) {
    case "overdue":
      return "Overdue";
    case "today":
      return "Due today";
    case "tomorrow":
      return "Due tomorrow";
    case "upcoming":
      return "Due";
    default:
      return "";
  }
};
