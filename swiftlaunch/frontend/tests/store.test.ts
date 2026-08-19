import { describe, it, expect } from 'vitest';
import { groupResults } from '../src/state/useSearchStore';
import type { Result } from '@swiftlaunch/shared';

describe('useSearchStore', () => {
  it('groupResults correctly categorizes items', () => {
    const mockResults: Result[] = [
      { id: 'app:c:/notepad.exe', providerId: 'app', icon: '📝', title: 'Notepad', subtitle: 'notepad' },
      { id: 'file:c:/docs/file.txt', providerId: 'file', icon: '📄', title: 'file.txt', subtitle: 'file' },
      { id: 'calc:42', providerId: 'calc', icon: '🧮', title: '= 42', subtitle: 'Calculation' },
      { id: 'clip:10', providerId: 'clip', icon: '📋', title: 'Copied text', subtitle: 'Clipboard' }
    ];

    const { grouped, flat } = groupResults(mockResults, null);

    expect(flat.length).toBe(4);
    expect(grouped['Applications']).toBeDefined();
    expect(grouped['Applications'].length).toBe(1);
    expect(grouped['Applications'][0].title).toBe('Notepad');

    expect(grouped['Files & Folders']).toBeDefined();
    expect(grouped['Files & Folders'].length).toBe(1);

    expect(grouped['Calculator']).toBeDefined();
    expect(grouped['Calculator'].length).toBe(1);

    expect(grouped['Clipboard History']).toBeDefined();
    expect(grouped['Clipboard History'].length).toBe(1);
  });

  it('groupResults respects activeGroup filter', () => {
    const mockResults: Result[] = [
      { id: 'app:c:/notepad.exe', providerId: 'app', icon: '📝', title: 'Notepad', subtitle: 'notepad' },
      { id: 'file:c:/docs/file.txt', providerId: 'file', icon: '📄', title: 'file.txt', subtitle: 'file' }
    ];

    const { grouped, flat } = groupResults(mockResults, 'app');

    expect(flat.length).toBe(1);
    expect(flat[0].title).toBe('Notepad');
    expect(grouped['Files & Folders']).toBeUndefined();
  });

  it('handles backend provider IDs with Provider suffix correctly', () => {
    const mockResults: Result[] = [
      { id: 'file:c:/docs/budget.xlsx', providerId: 'FileProvider', icon: '📄', title: 'budget.xlsx', subtitle: 'c:/docs/budget.xlsx' },
      { id: 'app:c:/notepad.exe', providerId: 'AppProvider', icon: '📝', title: 'Notepad', subtitle: 'notepad' }
    ];

    const { grouped, flat } = groupResults(mockResults, 'file');
    expect(flat.length).toBe(1);
    expect(flat[0].title).toBe('budget.xlsx');
    expect(grouped['Files & Folders']).toBeDefined();
    expect(grouped['Applications']).toBeUndefined();
  });

  it('renders only Files section header when in #files scope', () => {
    const mockResults: Result[] = [
      { id: 'file:c:/docs/doc.pdf', providerId: 'FileProvider', icon: '📄', title: 'doc.pdf', subtitle: 'c:/docs/doc.pdf' },
      { id: 'app:c:/word.exe', providerId: 'AppProvider', icon: '📝', title: 'Word', subtitle: 'word' }
    ];

    const { grouped, flat } = groupResults(mockResults, null, '#files document');
    expect(flat.length).toBe(1);
    expect(flat[0].title).toBe('doc.pdf');
    expect(grouped['Files']).toBeDefined();
    expect(grouped['Files'].length).toBe(1);
    expect(grouped['Applications']).toBeUndefined();
  });
});
