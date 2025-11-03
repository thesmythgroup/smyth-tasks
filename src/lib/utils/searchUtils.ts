export interface SearchConfig {
  fields: string[];
  caseSensitive?: boolean;
}

export function searchTasks<T extends Record<string, any>>(
  tasks: T[],
  query: string,
  config: SearchConfig = { fields: ['title'], caseSensitive: false }
): T[] {
  if (!query.trim()) {
    return tasks;
  }

  const searchQuery = config.caseSensitive ? query : query.toLowerCase();

  return tasks.filter(task => {
    return config.fields.some(field => {
      const fieldValue = task[field];
      if (fieldValue === null || fieldValue === undefined) {
        return false;
      }
      if (typeof fieldValue !== 'string') {
        return false;
      }
      
      const searchValue = config.caseSensitive ? fieldValue : fieldValue.toLowerCase();
      return searchValue.includes(searchQuery);
    });
  });
}

export function highlightText(text: string, query: string, caseSensitive = false): string {
  if (!query.trim()) {
    return text;
  }

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const searchText = caseSensitive ? text : text.toLowerCase();
  
  const index = searchText.indexOf(searchQuery);
  if (index === -1) {
    return text;
  }

  const beforeMatch = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const afterMatch = text.substring(index + query.length);

  return `${beforeMatch}<mark class="bg-yellow-400 text-gray-900 px-1 rounded font-semibold">${match}</mark>${afterMatch}`;
}

export function createSearchHighlighter(query: string, caseSensitive = false) {
  return (text: string) => highlightText(text, query, caseSensitive);
}
