import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

interface ModePill {
  id: string | null;
  label: string;
  icon: string;
}

const PILLS: ModePill[] = [
  { id: null, label: 'All', icon: '✨' },
  { id: 'app', label: 'Apps', icon: '🚀' },
  { id: 'file', label: 'Files', icon: '📄' },
  { id: 'calc', label: 'Math', icon: '🧮' },
  { id: 'clip', label: 'Clipboard', icon: '📋' }
];

export const SearchModePills: React.FC = () => {
  const activeGroup = useSearchStore((state) => state.activeGroup);
  const setActiveGroup = useSearchStore((state) => state.setActiveGroup);

  return (
    <div className="search-mode-pills">
      {PILLS.map((pill) => {
        const isActive = activeGroup === pill.id;
        return (
          <button
            key={pill.id ?? 'all'}
            type="button"
            className={`mode-pill ${isActive ? 'active' : ''}`}
            onClick={() => setActiveGroup(pill.id)}
          >
            <span className="pill-icon">{pill.icon}</span>
            <span className="pill-label">{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
};
