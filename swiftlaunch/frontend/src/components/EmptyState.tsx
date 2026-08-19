import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

export const EmptyState: React.FC = () => {
  const query = useSearchStore((state) => state.query);
  const activeGroup = useSearchStore((state) => state.activeGroup);
  const setActiveGroup = useSearchStore((state) => state.setActiveGroup);

  return (
    <div className="empty-state">
      <span className="material-symbols-outlined empty-icon">
        {query ? 'manage_search' : 'terminal'}
      </span>
      <div className="empty-title">
        {query ? `No results found for "${query}"` : 'Type a query or command to search'}
      </div>
      <div className="empty-subtitle">
        {query
          ? 'Check your spelling or reset category filters to expand search.'
          : 'Instant launcher for Windows applications, indexed files, clipboard items, and math.'}
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
          <span className="tip-badge">App</span> Launch apps like Chrome, VS Code, Notion
        </div>
        <div className="tip-item">
          <span className="tip-badge">Math</span> Direct calculations like <code>128 * 14.5</code>
        </div>
        <div className="tip-item">
          <span className="tip-badge">Clip</span> Search and paste clipboard history
        </div>
      </div>
    </div>
  );
};
