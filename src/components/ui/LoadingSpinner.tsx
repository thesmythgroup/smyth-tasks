interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        role="status"
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-500`}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
