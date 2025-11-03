"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import { LoadingSpinner } from "../ui/LoadingSpinner";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
  ssr: false,
});

interface TaskDescriptionEditorProps {
  initialValue: string | null;
  onSave: (description: string | null) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  showPreview?: boolean;
}

export function TaskDescriptionEditor({
  initialValue,
  onSave,
  onCancel,
  placeholder = "Add a description...",
  isLoading = false,
  showPreview = true,
}: TaskDescriptionEditorProps) {
  const [value, setValue] = useState(initialValue || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
    const trimmedValue = value.trim();
    await onSave(trimmedValue || null);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setValue(initialValue || "");
    setIsExpanded(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      handleCancel();
    }
  };

  if (!isExpanded && !initialValue) {
    return (
      <button
        onClick={handleToggle}
        className="mt-2 text-gray-500 hover:text-gray-400 text-sm underline"
        disabled={isLoading}
      >
        Add description
      </button>
    );
  }

  if (!isExpanded && initialValue) {
    const shouldTruncate = initialValue.length > 150;
    return (
      <div className="mt-2">
        <div className="text-sm text-gray-400 max-h-32 overflow-hidden prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-gray-400 mb-1">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="text-gray-300 font-semibold">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-gray-400 italic">{children}</em>
              ),
              code: ({ children }) => (
                <code className="bg-gray-700 px-1 py-0.5 rounded text-gray-300 text-xs font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-700 p-2 rounded overflow-x-auto mb-1 text-xs">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-400">{children}</li>
              ),
              h1: ({ children }) => (
                <h1 className="text-gray-300 text-base font-bold mb-1">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-gray-300 text-sm font-bold mb-1">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-gray-300 text-sm font-semibold mb-1">{children}</h3>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-600 pl-2 italic text-gray-500 mb-1">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-gray-700 my-1" />
              ),
            }}
          >
            {shouldTruncate
              ? initialValue.substring(0, 150) + "..."
              : initialValue}
          </ReactMarkdown>
        </div>
        <button
          onClick={handleToggle}
          className="mt-1 text-blue-400 hover:text-blue-300 text-sm underline"
          disabled={isLoading}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="w-full">
        <div data-color-mode="dark">
          <MDEditor
            value={value}
            onChange={(val) => setValue(val || "")}
            preview={showPreview ? "live" : "edit"}
            hideToolbar={false}
            visibleDragBar={false}
            height={300}
            previewOptions={{
              rehypePlugins: [],
            }}
            textareaProps={{
              placeholder: placeholder,
              disabled: isLoading,
              autoFocus: true,
            }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-gray-100 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner /> Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-3 py-1 text-gray-400 text-sm rounded-md hover:text-gray-300 hover:bg-gray-700/50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

