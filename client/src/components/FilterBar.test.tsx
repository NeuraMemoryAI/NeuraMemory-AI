import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterBar from './FilterBar';

describe('FilterBar Component', () => {
  const defaultProps = {
    selectedKind: '',
    selectedSource: '',
    searchQuery: '',
    disabled: false,
    onKindChange: vi.fn(),
    onSourceChange: vi.fn(),
    onSearchChange: vi.fn(),
    onClear: vi.fn(),
  };

  it('renders correctly with default props', () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByLabelText('Filter by kind')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by source')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search memories...')).toBeInTheDocument();

    // Clear button should not be present when no filters are active
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('shows clear button when a filter is active', () => {
    render(<FilterBar {...defaultProps} selectedKind="semantic" />);

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('calls onKindChange when kind select changes', () => {
    render(<FilterBar {...defaultProps} />);

    const kindSelect = screen.getByLabelText('Filter by kind');
    fireEvent.change(kindSelect, { target: { value: 'semantic' } });

    expect(defaultProps.onKindChange).toHaveBeenCalledWith('semantic');
  });

  it('calls onSourceChange when source select changes', () => {
    render(<FilterBar {...defaultProps} />);

    const sourceSelect = screen.getByLabelText('Filter by source');
    fireEvent.change(sourceSelect, { target: { value: 'text' } });

    expect(defaultProps.onSourceChange).toHaveBeenCalledWith('text');
  });

  it('calls onSearchChange when search input changes', () => {
    render(<FilterBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search memories...');
    fireEvent.change(searchInput, { target: { value: 'hello' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('hello');
  });

  it('calls onClear when clear button is clicked', () => {
    render(<FilterBar {...defaultProps} searchQuery="test" />);

    const clearButton = screen.getByText('Clear filters');
    fireEvent.click(clearButton);

    expect(defaultProps.onClear).toHaveBeenCalled();
  });

  it('disables inputs when disabled prop is true', () => {
    render(<FilterBar {...defaultProps} disabled={true} searchQuery="test" />);

    expect(screen.getByLabelText('Filter by kind')).toBeDisabled();
    expect(screen.getByLabelText('Filter by source')).toBeDisabled();
    expect(screen.getByPlaceholderText('Search memories...')).toBeDisabled();
    expect(screen.getByText('Clear filters')).toBeDisabled();
  });
});
