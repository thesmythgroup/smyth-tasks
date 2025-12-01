import { User, Notification } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Regex to match @mentions in text
 * Matches @username where username is alphanumeric with underscores
 */
const MENTION_REGEX = /@(\w+)/g;

/**
 * Extract all @mentions from a text string
 * @param text - The text to parse for mentions
 * @returns Array of usernames mentioned (without the @ symbol)
 */
export function extractMentions(text: string): string[] {
  const mentions: string[] = [];
  let match;

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    const username = match[1];
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }

  return mentions;
}

/**
 * Find users that match the mentioned usernames
 * @param mentions - Array of usernames to find
 * @param allUsers - Array of all available users
 * @returns Array of matched User objects
 */
export function findMentionedUsers(
  mentions: string[],
  allUsers: User[]
): User[] {
  return allUsers.filter((user) =>
    mentions.some(
      (mention) =>
        user.name.toLowerCase() === mention.toLowerCase() ||
        user.email.split("@")[0].toLowerCase() === mention.toLowerCase()
    )
  );
}

/**
 * Create notification objects for mentioned users
 * @param mentionedUsers - Users who were mentioned
 * @param mentionedBy - User ID of the person who made the mention
 * @param mentionedByName - Name of the person who made the mention
 * @param taskId - ID of the task the comment is on
 * @param commentId - ID of the comment containing the mention
 * @param taskTitle - Title of the task for the notification message
 * @returns Array of Notification objects to be created
 */
export function createMentionNotifications(
  mentionedUsers: User[],
  mentionedBy: string,
  mentionedByName: string,
  taskId: string,
  commentId: string,
  taskTitle: string
): Omit<Notification, "id" | "createdAt">[] {
  return mentionedUsers
    .filter((user) => user.id !== mentionedBy) // Don't notify yourself
    .map((user) => ({
      recipientId: user.id,
      type: "mention" as const,
      taskId,
      commentId,
      mentionedBy,
      mentionedByName,
      message: `${mentionedByName} mentioned you in a comment on "${taskTitle}"`,
      read: false,
    }));
}

/**
 * Render text with highlighted @mentions
 * Returns HTML string with mentions wrapped in styled spans
 * @param text - The text containing mentions
 * @returns HTML string with highlighted mentions
 */
export function renderMentions(text: string): string {
  return text.replace(
    MENTION_REGEX,
    '<span class="text-blue-400 font-medium">@$1</span>'
  );
}

/**
 * Filter users for autocomplete based on partial input
 * @param query - The partial username being typed (without @)
 * @param allUsers - Array of all available users
 * @param currentUserId - Optional: exclude current user from suggestions
 * @returns Filtered array of users matching the query
 */
export function filterUsersForMention(
  query: string,
  allUsers: User[],
  currentUserId?: string
): User[] {
  const lowerQuery = query.toLowerCase();
  return allUsers
    .filter((user) => {
      if (currentUserId && user.id === currentUserId) {
        return false;
      }
      const nameMatch = user.name.toLowerCase().includes(lowerQuery);
      const emailMatch = user.email
        .split("@")[0]
        .toLowerCase()
        .includes(lowerQuery);
      return nameMatch || emailMatch;
    })
    .slice(0, 5); // Limit to 5 suggestions
}

/**
 * Get the current mention query being typed
 * Returns the text after the last @ symbol if user is currently typing a mention
 * @param text - The full text in the input
 * @param cursorPosition - Current cursor position in the text
 * @returns The partial mention being typed, or null if not typing a mention
 */
export function getCurrentMentionQuery(
  text: string,
  cursorPosition: number
): string | null {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

  if (lastAtIndex === -1) {
    return null;
  }

  const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);

  // Check if there's a space after the @, which means the mention is complete
  if (textAfterAt.includes(" ")) {
    return null;
  }

  // Check if @ is at start or preceded by whitespace (valid mention start)
  if (lastAtIndex > 0 && !/\s/.test(textBeforeCursor[lastAtIndex - 1])) {
    return null;
  }

  return textAfterAt;
}

/**
 * Insert a mention at the current cursor position
 * @param text - The current text
 * @param cursorPosition - Current cursor position
 * @param username - The username to insert
 * @returns Object with new text and new cursor position
 */
export function insertMention(
  text: string,
  cursorPosition: number,
  username: string
): { newText: string; newCursorPosition: number } {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const textAfterCursor = text.slice(cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

  if (lastAtIndex === -1) {
    return { newText: text, newCursorPosition: cursorPosition };
  }

  const textBeforeAt = text.slice(0, lastAtIndex);
  const newText = `${textBeforeAt}@${username} ${textAfterCursor}`;
  const newCursorPosition = lastAtIndex + username.length + 2; // +2 for @ and space

  return { newText, newCursorPosition };
}

