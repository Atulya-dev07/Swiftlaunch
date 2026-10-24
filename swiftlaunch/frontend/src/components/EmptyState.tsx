import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

export const EmptyState: React.FC = () => {
  const query = useSearchStore((state) => state.query);

  if (!query || query.trim().length === 0) {
    return null;
  }

  return (
    <div className="empty-state-minimal">
      <div className="empty-title">No results found for "{query}"</div>
      <div className="empty-subtitle">Try searching for an application, file name or command</div>
    </div>
  );
};
