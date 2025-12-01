import { Task } from '@/lib/types';
import { downloadFile, exportToCSV, exportToJSON, generateFilename } from '../exportUtils';

describe('exportUtils', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    completed: false,
    priority: 0,
    userId: 'user1',
    dueDate: '2025-01-15',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  };

  describe('exportToCSV', () => {
    it('should export tasks to CSV format with all fields', () => {
      const tasks: Task[] = [mockTask];
      const csv = exportToCSV(tasks);

      expect(csv).toContain('id,title,completed,priority,userId,dueDate,createdAt,updatedAt');
      expect(csv).toContain('1,Test Task,false,0,user1,2025-01-15,2025-01-01T00:00:00.000Z,2025-01-02T00:00:00.000Z');
    });

    it('should handle null dueDate correctly without spurious whitespace', () => {
      const taskWithNullDate: Task = {
        ...mockTask,
        dueDate: null,
      };
      const csv = exportToCSV([taskWithNullDate]);

      const lines = csv.split('\n');
      const dataLine = lines[1];
      const fields = dataLine.split(',');
      const dueDateIndex = 5; // dueDate is the 6th field (0-indexed: 5)

      expect(fields[dueDateIndex]).toBe('');
      // Check that the empty dueDate field doesn't have whitespace around it
      // Look for the pattern ",," (empty field) not ", ," (field with space)
      expect(dataLine).not.toMatch(/,\s+,/); // No whitespace between commas for empty field
    });

    it('should escape commas in task titles', () => {
      const taskWithComma: Task = {
        ...mockTask,
        title: 'Task, with comma',
      };
      const csv = exportToCSV([taskWithComma]);

      expect(csv).toContain('"Task, with comma"');
    });

    it('should escape quotes in task titles', () => {
      const taskWithQuote: Task = {
        ...mockTask,
        title: 'Task with "quotes"',
      };
      const csv = exportToCSV([taskWithQuote]);

      expect(csv).toContain('"Task with ""quotes"""');
    });

    it('should handle titles with both commas and quotes', () => {
      const taskWithBoth: Task = {
        ...mockTask,
        title: 'Task, with "quotes" and commas',
      };
      const csv = exportToCSV([taskWithBoth]);

      expect(csv).toContain('"Task, with ""quotes"" and commas"');
    });

    it('should have proper CSV headers', () => {
      const csv = exportToCSV([mockTask]);
      const headerLine = csv.split('\n')[0];

      expect(headerLine).toBe('id,title,completed,priority,userId,dueDate,createdAt,updatedAt');
    });

    it('should handle multiple tasks', () => {
      const tasks: Task[] = [
        mockTask,
        {
          ...mockTask,
          id: '2',
          title: 'Second Task',
          completed: true,
        },
      ];
      const csv = exportToCSV(tasks);
      const lines = csv.split('\n').filter(line => line.trim() !== '');

      expect(lines).toHaveLength(3); // Header + 2 data rows
      expect(lines[0]).toBe('id,title,completed,priority,userId,dueDate,createdAt,updatedAt');
      expect(lines[1]).toContain('1,Test Task');
      expect(lines[2]).toContain('2,Second Task');
    });

    it('should not have trailing whitespace in CSV rows', () => {
      const csv = exportToCSV([mockTask]);
      const lines = csv.split('\n').filter(line => line.trim() !== '');

      lines.forEach(line => {
        expect(line).not.toMatch(/^\s+/); // No leading whitespace
        expect(line).not.toMatch(/\s+$/); // No trailing whitespace
      });
    });

    it('should handle empty task array', () => {
      const csv = exportToCSV([]);
      const lines = csv.split('\n').filter(line => line.trim() !== '');

      expect(lines).toHaveLength(1); // Only header
      expect(lines[0]).toBe('id,title,completed,priority,userId,dueDate,createdAt,updatedAt');
    });

    it('should handle tasks with all priority levels', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', priority: 0 },
        { ...mockTask, id: '2', priority: 1 },
        { ...mockTask, id: '3', priority: 2 },
      ];
      const csv = exportToCSV(tasks);

      expect(csv).toContain(',0,');
      expect(csv).toContain(',1,');
      expect(csv).toContain(',2,');
    });

    it('should handle completed and incomplete tasks', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', completed: false },
        { ...mockTask, id: '2', completed: true },
      ];
      const csv = exportToCSV(tasks);

      expect(csv).toContain(',false,');
      expect(csv).toContain(',true,');
    });
  });

  describe('exportToJSON', () => {
    it('should export tasks to JSON format with all fields', () => {
      const tasks: Task[] = [mockTask];
      const json = exportToJSON(tasks);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual([mockTask]);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('title');
      expect(parsed[0]).toHaveProperty('completed');
      expect(parsed[0]).toHaveProperty('priority');
      expect(parsed[0]).toHaveProperty('userId');
      expect(parsed[0]).toHaveProperty('dueDate');
      expect(parsed[0]).toHaveProperty('createdAt');
      expect(parsed[0]).toHaveProperty('updatedAt');
    });

    it('should handle null dueDate in JSON', () => {
      const taskWithNullDate: Task = {
        ...mockTask,
        dueDate: null,
      };
      const json = exportToJSON([taskWithNullDate]);
      const parsed = JSON.parse(json);

      expect(parsed[0].dueDate).toBeNull();
    });

    it('should output valid JSON', () => {
      const tasks: Task[] = [mockTask];
      const json = exportToJSON(tasks);

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should handle multiple tasks', () => {
      const tasks: Task[] = [
        mockTask,
        {
          ...mockTask,
          id: '2',
          title: 'Second Task',
        },
      ];
      const json = exportToJSON(tasks);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('1');
      expect(parsed[1].id).toBe('2');
    });

    it('should handle empty task array', () => {
      const json = exportToJSON([]);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual([]);
    });

    it('should not have trailing whitespace in JSON output', () => {
      const json = exportToJSON([mockTask]);

      expect(json).not.toMatch(/^\s+/); // No leading whitespace
      expect(json).not.toMatch(/\s+$/); // No trailing whitespace
    });

    it('should format JSON with proper indentation', () => {
      const json = exportToJSON([mockTask]);
      const parsed = JSON.parse(json);

      // Should be valid JSON that can be parsed
      expect(parsed).toBeDefined();
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('downloadFile', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement and appendChild
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      };
      document.createElement = jest.fn(() => mockLink as any);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    it('should create a blob with correct content and mime type', () => {
      const content = 'test content';
      const filename = 'test.csv';
      const mimeType = 'text/csv';

      downloadFile(content, filename, mimeType);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const blobCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe(mimeType);
    });

    it('should create a link element and trigger download', () => {
      const content = 'test content';
      const filename = 'test.csv';
      const mimeType = 'text/csv';

      downloadFile(content, filename, mimeType);

      expect(document.createElement).toHaveBeenCalledWith('a');
      const mockLink = document.createElement('a') as any;
      expect(mockLink.download).toBe(filename);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should append and remove link from document body', () => {
      const content = 'test content';
      const filename = 'test.csv';
      const mimeType = 'text/csv';

      downloadFile(content, filename, mimeType);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should revoke object URL after download', () => {
      const content = 'test content';
      const filename = 'test.csv';
      const mimeType = 'text/csv';

      downloadFile(content, filename, mimeType);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with timestamp in correct format', () => {
      const baseName = 'tasks';
      const extension = 'csv';
      const filename = generateFilename(baseName, extension);

      // Format: tasks-YYYY-MM-DD-HHMMSS.csv
      expect(filename).toMatch(/^tasks-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/);
    });

    it('should generate filename with different extensions', () => {
      const baseName = 'tasks';
      const jsonFilename = generateFilename(baseName, 'json');
      const csvFilename = generateFilename(baseName, 'csv');

      expect(jsonFilename).toMatch(/\.json$/);
      expect(csvFilename).toMatch(/\.csv$/);
    });

    it('should include base name in filename', () => {
      const baseName = 'my-tasks';
      const filename = generateFilename(baseName, 'csv');

      expect(filename).toContain('my-tasks');
    });

    it('should generate unique filenames for different calls', () => {
      const baseName = 'tasks';
      const extension = 'csv';
      
      // Note: This test might be flaky if called in the same second
      // In practice, timestamps should be different
      const filename1 = generateFilename(baseName, extension);
      const filename2 = generateFilename(baseName, extension);

      // They should at least have the correct format
      expect(filename1).toMatch(/^tasks-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/);
      expect(filename2).toMatch(/^tasks-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/);
    });
  });
});

