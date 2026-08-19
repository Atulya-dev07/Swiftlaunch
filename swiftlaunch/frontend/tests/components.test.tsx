import { render, screen } from '@testing-library/react';
import { ResultItem } from '../src/components/ResultItem';
import { SectionHeader } from '../src/components/SectionHeader';

describe('React Component Render Tests', () => {
  it('renders SectionHeader with title and count badge', () => {
    render(<SectionHeader title="Applications" count={5} />);
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
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
    expect(screen.getByText('App')).toBeInTheDocument();
  });
});
