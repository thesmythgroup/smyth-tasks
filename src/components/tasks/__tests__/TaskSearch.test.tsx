import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskSearch } from '../TaskSearch';

describe('TaskSearch', () => {
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    mockOnSearchChange.mockClear();
  });

  it('should render search input with placeholder', () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search tasks...');
    expect(input).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} placeholder="Custom placeholder" />);
    
    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearchChange when user types', async () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test');
    }, { timeout: 200 });
  });

  it('should debounce search calls', async () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText('Search tasks...');
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
      expect(mockOnSearchChange).toHaveBeenCalledWith('test');
    }, { timeout: 200 });
  });

  it('should show clear button when text is entered', () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('should hide clear button when input is empty', () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should have search icon', () => {
    render(<TaskSearch onSearchChange={mockOnSearchChange} />);
    
    const searchIcon = screen.getByRole('img', { hidden: true });
    expect(searchIcon).toBeInTheDocument();
  });
});
