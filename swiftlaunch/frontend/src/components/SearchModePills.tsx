import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

interface ModeTab {
  id: string | null;
  label: string;
  iconName: string;
}

const TABS: ModeTab[] = [
  { id: null, label: 'All', iconName: 'auto_awesome' },
  { id: 'context', label: 'Context', iconName: 'screen_search_desktop' },
  { id: 'app', label: 'Apps', iconName: 'apps' },
  { id: 'file', label: 'Files', iconName: 'folder_open' },
  { id: 'calc', label: 'Math', iconName: 'calculate' },
  { id: 'clip', label: 'Clipboard', iconName: 'content_paste' }
];

export const SearchModePills: React.FC = () => {
  const activeGroup = useSearchStore((state) => state.activeGroup);
  const setActiveGroup = useSearchStore((state) => state.setActiveGroup);

  return (
    <nav className="mode-tabs-container" aria-label="Search filter modes">
      {TABS.map((tab) => {
        const isActive = activeGroup === tab.id;
        return (
          <button
            key={tab.id ?? 'all'}
            type="button"
            className={`mode-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveGroup(tab.id)}
          >
            <span className="material-symbols-outlined mode-tab-icon">{tab.iconName}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
