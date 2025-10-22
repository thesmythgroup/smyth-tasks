"use client";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div
        role="status"
        className="h-4 w-4 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
