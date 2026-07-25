import React from 'react';
import { Result } from '@swiftlaunch/shared';
import { ResultItem } from './ResultItem.js';

interface ResultsListProps {
  results: Result[];
  selectedIndex?: number;
}

export const ResultsList: React.FC<ResultsListProps> = ({ results, selectedIndex = 0 }) => {
  if (results.length === 0) {
    return <div style={styles.empty}>No results found</div>;
  }

  return (
    <div style={styles.list}>
      {results.map((item, index) => (
        <ResultItem key={item.id} result={item} isSelected={index === selectedIndex} />
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    gap: '4px',
    overflowY: 'auto',
    flex: 1
  },
  empty: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14px'
  }
};
