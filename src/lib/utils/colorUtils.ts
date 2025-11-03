export interface ColorOption {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hoverBgClass: string;
  hex: string;
}

export const COLORS: Record<string, ColorOption> = {
  blue: {
    id: "blue",
    name: "Blue",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-100",
    borderClass: "border-blue-500/50",
    hoverBgClass: "hover:bg-blue-500/30",
    hex: "#3B82F6",
  },
  green: {
    id: "green",
    name: "Green",
    bgClass: "bg-green-500/20",
    textClass: "text-green-100",
    borderClass: "border-green-500/50",
    hoverBgClass: "hover:bg-green-500/30",
    hex: "#10B981",
  },
  yellow: {
    id: "yellow",
    name: "Yellow",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-100",
    borderClass: "border-yellow-500/50",
    hoverBgClass: "hover:bg-yellow-500/30",
    hex: "#F59E0B",
  },
  orange: {
    id: "orange",
    name: "Orange",
    bgClass: "bg-orange-500/20",
    textClass: "text-orange-100",
    borderClass: "border-orange-500/50",
    hoverBgClass: "hover:bg-orange-500/30",
    hex: "#F97316",
  },
  red: {
    id: "red",
    name: "Red",
    bgClass: "bg-red-500/20",
    textClass: "text-red-100",
    borderClass: "border-red-500/50",
    hoverBgClass: "hover:bg-red-500/30",
    hex: "#EF4444",
  },
  purple: {
    id: "purple",
    name: "Purple",
    bgClass: "bg-purple-500/20",
    textClass: "text-purple-100",
    borderClass: "border-purple-500/50",
    hoverBgClass: "hover:bg-purple-500/30",
    hex: "#A855F7",
  },
  pink: {
    id: "pink",
    name: "Pink",
    bgClass: "bg-pink-500/20",
    textClass: "text-pink-100",
    borderClass: "border-pink-500/50",
    hoverBgClass: "hover:bg-pink-500/30",
    hex: "#EC4899",
  },
  cyan: {
    id: "cyan",
    name: "Cyan",
    bgClass: "bg-cyan-500/20",
    textClass: "text-cyan-100",
    borderClass: "border-cyan-500/50",
    hoverBgClass: "hover:bg-cyan-500/30",
    hex: "#06B6D4",
  },
  teal: {
    id: "teal",
    name: "Teal",
    bgClass: "bg-teal-500/20",
    textClass: "text-teal-100",
    borderClass: "border-teal-500/50",
    hoverBgClass: "hover:bg-teal-500/30",
    hex: "#14B8A6",
  },
  indigo: {
    id: "indigo",
    name: "Indigo",
    bgClass: "bg-indigo-500/20",
    textClass: "text-indigo-100",
    borderClass: "border-indigo-500/50",
    hoverBgClass: "hover:bg-indigo-500/30",
    hex: "#6366F1",
  },
};

export const getColorStyles = (colorId: string): ColorOption => {
  return COLORS[colorId] || COLORS.blue;
};

export const getAllColors = (): ColorOption[] => {
  return Object.values(COLORS);
};

