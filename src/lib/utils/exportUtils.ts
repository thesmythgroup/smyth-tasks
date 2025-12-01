import { Task } from '@/lib/types';

/**
 * Escapes a CSV field value by wrapping in quotes if it contains commas or quotes,
 * and doubling quotes if the value contains quotes.
 * Trims whitespace to ensure no spurious whitespace.
 */
function escapeCSVField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value).trim();

  // If the value contains comma, quote, or newline, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Double any existing quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of tasks to CSV format.
 * Includes all fields: id, title, completed, priority, userId, dueDate, createdAt, updatedAt
 */
export function exportToCSV(tasks: Task[]): string {
  const headers = ['id', 'title', 'completed', 'priority', 'userId', 'dueDate', 'createdAt', 'updatedAt'];
  const headerLine = headers.join(',');

  if (tasks.length === 0) {
    return headerLine;
  }

  const rows = tasks.map(task => {
    const fields = [
      escapeCSVField(task.id),
      escapeCSVField(task.title),
      escapeCSVField(String(task.completed)),
      escapeCSVField(String(task.priority)),
      escapeCSVField(task.userId),
      escapeCSVField(task.dueDate),
      escapeCSVField(task.createdAt),
      escapeCSVField(task.updatedAt),
    ];
    return fields.join(',');
  });

  const result = [headerLine, ...rows].join('\n');
  // Ensure no trailing whitespace on any line
  return result.split('\n').map(line => line.trimEnd()).join('\n');
}

/**
 * Converts an array of tasks to JSON format.
 * Includes all task fields as-is.
 */
export function exportToJSON(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2);
}

/**
 * Generates a filename with timestamp in the format: baseName-YYYY-MM-DD-HHMMSS.extension
 */
export function generateFilename(baseName: string, extension: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
  return `${baseName}-${timestamp}.${extension}`;
}

/**
 * Triggers a browser download of the given content as a file.
 * Creates a blob, creates a temporary link element, clicks it, and cleans up.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL immediately
  // In practice, a small delay could be used, but for testing we do it synchronously
  URL.revokeObjectURL(url);
}

