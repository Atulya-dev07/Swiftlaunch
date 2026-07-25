import React from 'react';
import { Result } from '@swiftlaunch/shared';

interface ResultItemProps {
  result: Result;
  isSelected?: boolean;
}

export const ResultItem: React.FC<ResultItemProps> = ({ result, isSelected }) => {
  return (
    <div
      style={{
        ...styles.item,
        ...(isSelected ? styles.selectedItem : {})
      }}
    >
      <span style={styles.icon}>{result.icon}</span>
      <div style={styles.textContainer}>
        <div style={styles.title}>{result.title}</div>
        <div style={styles.subtitle}>{result.subtitle}</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    gap: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  selectedItem: {
    backgroundColor: 'var(--bg-hover)',
    boxShadow: '0 0 0 1px var(--accent-glow)'
  },
  icon: {
    fontSize: '20px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '6px'
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  }
};
