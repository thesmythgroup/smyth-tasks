"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/types";
import {
  getCurrentMentionQuery,
  filterUsersForMention,
  insertMention,
} from "@/lib/utils/mentionUtils";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: () => void;
  rows?: number;
  autoFocus?: boolean;
}

export function MentionInput({
  value,
  onChange,
  placeholder = "Write a comment...",
  disabled = false,
  onSubmit,
  rows = 2,
  autoFocus = false,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  const { allUsers, currentUser } = useSelector(
    (state: RootState) => state.user
  );

  // Ensure allUsers is an array (handle legacy localStorage)
  const users = allUsers || [];

  const mentionQuery = getCurrentMentionQuery(value, cursorPosition);
  const suggestions = mentionQuery
    ? filterUsersForMention(mentionQuery, users, currentUser?.id)
    : [];

  useEffect(() => {
    if (mentionQuery && suggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [mentionQuery, suggestions.length]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          if (!e.shiftKey) {
            e.preventDefault();
            selectSuggestion(suggestions[selectedIndex].name);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          break;
        case "Tab":
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex].name);
          break;
      }
    } else if (e.key === "Enter" && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const selectSuggestion = (username: string) => {
    const { newText, newCursorPosition } = insertMention(
      value,
      cursorPosition,
      username
    );
    onChange(newText);
    setShowSuggestions(false);

    // Set cursor position after React updates
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
        textareaRef.current.focus();
        setCursorPosition(newCursorPosition);
      }
    }, 0);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        autoFocus={autoFocus}
        className="w-full rounded-md bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3 text-sm resize-none"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg overflow-hidden"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectSuggestion(user.name)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-400 ml-2 text-xs">
                {user.email}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

