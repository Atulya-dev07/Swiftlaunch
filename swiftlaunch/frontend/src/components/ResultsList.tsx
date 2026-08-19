import React, { useRef, useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { ResultItem } from './ResultItem.js';
import { SectionHeader } from './SectionHeader.js';
import { EmptyState } from './EmptyState.js';
import { LoadingState } from './LoadingState.js';

export const ResultsList: React.FC = () => {
  const groupedResults = useSearchStore((state) => state.groupedResults);
  const flatResults = useSearchStore((state) => state.flatResults);
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
      <div className="search-error-state" role="alert" style={{ padding: '32px 16px', textAlign: 'center', color: '#ef4444' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{error}</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Please check Electron preload and IPC configuration.</div>
      </div>
    );
  }

  if (flatResults.length === 0) {
    return <EmptyState />;
  }

  let globalIndexCounter = 0;

  return (
    <div className="results-list-container" ref={containerRef}>
      {Object.entries(groupedResults).map(([categoryName, items]) => {
        if (!items || items.length === 0) return null;

        return (
          <div key={categoryName} className="result-category-group">
            <SectionHeader title={categoryName} count={items.length} />
            <div className="category-items-list">
              {items.map((item) => {
                const currentIndex = globalIndexCounter++;
                const isSelected = currentIndex === selectedIndex;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(currentIndex, el);
                      else itemRefs.current.delete(currentIndex);
                    }}
                  >
                    <ResultItem
                      result={item}
                      isSelected={isSelected}
                      itemIndex={currentIndex}
                      onClick={() => setSelectedIndex(currentIndex)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
