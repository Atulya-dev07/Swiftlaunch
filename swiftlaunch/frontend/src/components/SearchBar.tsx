import React from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  return (
    <div style={styles.container}>
      <span style={styles.searchIcon}>🔍</span>
      <input
        type="text"
        placeholder="Type a command or search..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoFocus
        style={styles.input}
      />
    </div>
  );
};

type StyleWithWebkit = React.CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' };

const styles: Record<string, StyleWithWebkit> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid var(--border-color)',
    gap: '12px',
    WebkitAppRegion: 'drag'
  },
  searchIcon: {
    fontSize: '18px',
    opacity: 0.7
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontFamily: 'var(--font-family)',
    WebkitAppRegion: 'no-drag'
  }
};
