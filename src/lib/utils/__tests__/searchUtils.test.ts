import { searchTasks, highlightText, createSearchHighlighter } from '../searchUtils';

describe('searchUtils', () => {
  const mockTasks = [
    { id: '1', title: 'Buy groceries', completed: false, priority: 0 },
    { id: '2', title: 'Walk the dog', completed: true, priority: 1 },
    { id: '3', title: 'Learn React', completed: false, priority: 2 },
    { id: '4', title: 'Grocery shopping', completed: false, priority: 0 },
  ];

  describe('searchTasks', () => {
    it('should return all tasks when query is empty', () => {
      const result = searchTasks(mockTasks, '');
      expect(result).toEqual(mockTasks);
    });

    it('should return all tasks when query is only whitespace', () => {
      const result = searchTasks(mockTasks, '   ');
      expect(result).toEqual(mockTasks);
    });

    it('should filter tasks by title (case insensitive)', () => {
      const result = searchTasks(mockTasks, 'grocery');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '4']);
    });

    it('should filter tasks by title (case sensitive)', () => {
      const result = searchTasks(mockTasks, 'Grocery', { fields: ['title'], caseSensitive: true });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    it('should return empty array when no matches found', () => {
      const result = searchTasks(mockTasks, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should work with custom field configuration', () => {
      const tasksWithDescription = [
        { id: '1', title: 'Task 1', description: 'Buy groceries' },
        { id: '2', title: 'Task 2', description: 'Walk the dog' },
      ];
      
      const result = searchTasks(tasksWithDescription, 'grocery', { fields: ['description'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('highlightText', () => {
    it('should return original text when query is empty', () => {
      const result = highlightText('Hello world', '');
      expect(result).toBe('Hello world');
    });

    it('should highlight matching text (case insensitive)', () => {
      const result = highlightText('Hello world', 'world');
      expect(result).toBe('Hello <mark class="bg-yellow-400 text-gray-900 px-1 rounded font-semibold">world</mark>');
    });

    it('should highlight matching text (case sensitive)', () => {
      const result = highlightText('Hello World', 'World', true);
      expect(result).toBe('Hello <mark class="bg-yellow-400 text-gray-900 px-1 rounded font-semibold">World</mark>');
    });

    it('should not highlight when no match found', () => {
      const result = highlightText('Hello world', 'universe');
      expect(result).toBe('Hello world');
    });

    it('should highlight first occurrence only', () => {
      const result = highlightText('Hello hello world', 'hello');
      expect(result).toBe('<mark class="bg-yellow-400 text-gray-900 px-1 rounded font-semibold">Hello</mark> hello world');
    });
  });

  describe('createSearchHighlighter', () => {
    it('should create a highlighter function with preset query', () => {
      const highlighter = createSearchHighlighter('test');
      const result = highlighter('This is a test');
      expect(result).toBe('This is a <mark class="bg-yellow-400 text-gray-900 px-1 rounded font-semibold">test</mark>');
    });

    it('should create a case sensitive highlighter', () => {
      const highlighter = createSearchHighlighter('Test', true);
      const result = highlighter('This is a test');
      expect(result).toBe('This is a test');
    });
  });
});
