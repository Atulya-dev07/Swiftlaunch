import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

export const EmptyState: React.FC = () => {
  const query = useSearchStore((state) => state.query);
  const activeGroup = useSearchStore((state) => state.activeGroup);
  const setActiveGroup = useSearchStore((state) => state.setActiveGroup);

  return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <div className="empty-title">
        {query ? `No results found for "${query}"` : 'Type a query or command to search'}
      </div>
      <div className="empty-subtitle">
        {query ? 'Try checking your spelling or selecting a different category filter.' : 'Search across installed apps, indexing files, clipboard history, or math expressions.'}
      </div>

      {activeGroup && (
        <button
          type="button"
          className="empty-reset-filter-btn"
          onClick={() => setActiveGroup(null)}
        >
          Reset Filter ({activeGroup})
        </button>
      )}

      <div className="empty-tips">
        <div className="tip-item">
          <span className="tip-badge">App</span> Launch installed Windows applications
        </div>
        <div className="tip-item">
          <span className="tip-badge">Math</span> Type math like <code>128 * 14.5</code>
        </div>
        <div className="tip-item">
          <span className="tip-badge">Clip</span> Search or paste clipboard items
        </div>
      </div>
    </div>
  );
};
