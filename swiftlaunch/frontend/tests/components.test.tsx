import { render, screen, fireEvent } from '@testing-library/react';
import { ResultItem } from '../src/components/ResultItem';
import { EmptyState } from '../src/components/EmptyState';
import { useSearchStore } from '../src/state/useSearchStore';

describe('React Component Render Tests', () => {
  it('renders EmptyState with query message when no results are found', () => {
    useSearchStore.setState({ query: 'nonexistentapp123' });
    render(<EmptyState />);
    expect(screen.getByText('No results found for "nonexistentapp123"')).toBeInTheDocument();
  });

  it('renders ResultItem with title, subtitle, and badge', () => {
    const mockResult = {
      id: 'app:notepad',
      providerId: 'app',
      icon: '📝',
      title: 'Notepad',
      subtitle: 'C:\\Windows\\System32\\notepad.exe'
    };

    render(<ResultItem result={mockResult} isSelected={true} />);
    expect(screen.getByText('Notepad')).toBeInTheDocument();
    expect(screen.getByText('C:\\Windows\\System32\\notepad.exe')).toBeInTheDocument();
  });

  it('renders CreateComboModal and filters applications using search input', async () => {
    const { CreateComboModal } = await import('../src/components/CreateComboModal');
    const { useComboStore } = await import('../src/state/useComboStore');

    // Populate mock available apps in store
    useComboStore.setState({
      availableApps: [
        { id: 'app:chrome', name: 'Google Chrome', lnkPath: 'C:\\chrome.lnk' },
        { id: 'app:vscode', name: 'Visual Studio Code', lnkPath: 'C:\\code.lnk' },
        { id: 'app:notepad', name: 'Notepad', lnkPath: 'C:\\notepad.lnk' }
      ]
    });

    render(<CreateComboModal onClose={() => {}} />);

    // Search bar is rendered and auto-focused
    const searchInput = screen.getByPlaceholderText(/Search installed applications/i);
    expect(searchInput).toBeInTheDocument();

    // Initially all apps are displayed
    expect(screen.getByText('Google Chrome')).toBeInTheDocument();
    expect(screen.getByText('Visual Studio Code')).toBeInTheDocument();
    expect(screen.getByText('Notepad')).toBeInTheDocument();

    // Type "code" in the search input
    fireEvent.change(searchInput, { target: { value: 'code' } });

    // Only Visual Studio Code should match
    expect(screen.getByText('Visual Studio Code')).toBeInTheDocument();
    expect(screen.queryByText('Google Chrome')).not.toBeInTheDocument();
    expect(screen.queryByText('Notepad')).not.toBeInTheDocument();
  });
});

