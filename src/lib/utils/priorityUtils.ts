import { PriorityLevel } from "../types";

export const PRIORITY_LEVELS = {
  0: {
    id: 0,
    name: "Ghost Pepper",
    emoji: "🌶️🌶️",
    color: "red",
    displayText: "Ghost Pepper 🌶️🌶️"
  },
  1: {
    id: 1,
    name: "Jalapeño", 
    emoji: "🌶️",
    color: "yellow",
    displayText: "Jalapeño 🌶️"
  },
  2: {
    id: 2,
    name: "Minnesotan",
    emoji: "❄️", 
    color: "blue",
    displayText: "Minnesotan ❄️"
  }
} as const;

export const getPriorityInfo = (priority: PriorityLevel) => {
  return PRIORITY_LEVELS[priority];
};

export const getPriorityDisplayText = (priority: PriorityLevel) => {
  return PRIORITY_LEVELS[priority].displayText;
};

export const getPriorityStyles = (priority: PriorityLevel | string | number) => {
  // Handle migration from old string-based priorities
  let priorityId: PriorityLevel;
  
  if (typeof priority === 'string') {
    switch (priority) {
      case "ghost-pepper":
        priorityId = 0;
        break;
      case "jalapeño":
        priorityId = 1;
        break;
      case "minnesotan":
        priorityId = 2;
        break;
      default:
        priorityId = 1; // Default to Jalapeño
    }
  } else if (typeof priority === 'number') {
    priorityId = priority as PriorityLevel;
  } else {
    priorityId = 1; // Default to Jalapeño
  }
  
  const info = PRIORITY_LEVELS[priorityId];
  switch (info.color) {
    case "red":
      return "border-l-red-500 bg-red-500/5";
    case "yellow":
      return "border-l-yellow-500 bg-yellow-500/5";
    case "blue":
      return "border-l-blue-500 bg-blue-500/5";
    default:
      return "border-l-yellow-500 bg-yellow-500/5";
  }
};

export const getPriorityFilterStyles = (priority: PriorityLevel, isActive: boolean) => {
  const info = PRIORITY_LEVELS[priority];
  const baseStyles = "px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200";
  
  if (isActive) {
    switch (info.color) {
      case "red":
        return `${baseStyles} bg-red-600 text-white`;
      case "yellow":
        return `${baseStyles} bg-yellow-600 text-white`;
      case "blue":
        return `${baseStyles} bg-blue-600 text-white`;
      default:
        return `${baseStyles} bg-blue-600 text-white`;
    }
  }
  
  return `${baseStyles} bg-gray-700 text-gray-300 hover:bg-gray-600`;
};

export const getPriorityFilterInlineStyles = () => {
  return {
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  };
};
