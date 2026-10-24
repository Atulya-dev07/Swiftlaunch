import React, { useRef, useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { ResultItem } from './ResultItem.js';
import { EmptyState } from './EmptyState.js';
import { LoadingState } from './LoadingState.js';

export const ResultsList: React.FC = () => {
  const flatResults = useSearchStore((state) => state.flatResults);
  const query = useSearchStore((state) => state.query);
  const selectedIndex = useSearchStore((state) => state.selectedIndex);
  const setSelectedIndex = useSearchStore((state) => state.setSelectedIndex);
  const isLoading = useSearchStore((state) => state.isLoading);
  const error = useSearchStore((state) => state.error);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const selectedEl = itemRefs.current.get(selectedIndex);
    if (selectedEl && containerRef.current) {
      selectedEl.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  if (isLoading && flatResults.length === 0) {
    return <LoadingState />;
  }

  if (error && flatResults.length === 0) {
    return (
      <div className="search-error-state" role="alert">
        <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚠️</div>
        <div style={{ fontWeight: 500, fontSize: '13px', color: '#f87171' }}>{error}</div>
      </div>
    );
  }

  if (flatResults.length === 0) {
    if (!query || query.trim().length === 0) {
      return null;
    }
    return <EmptyState />;
  }

  return (
    <div className="results-list-container" ref={containerRef} role="listbox">
      {flatResults.map((item, index) => {
        const isSelected = index === selectedIndex;

        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el);
              else itemRefs.current.delete(index);
            }}
          >
            <ResultItem
              result={item}
              isSelected={isSelected}
              itemIndex={index}
              onClick={() => setSelectedIndex(index)}
            />
          </div>
        );
      })}
    </div>
  );
};
