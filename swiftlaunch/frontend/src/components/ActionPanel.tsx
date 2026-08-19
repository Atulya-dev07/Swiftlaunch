import React, { useState, useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { useResultActions, type ResultAction } from '../hooks/useResultActions.js';

interface ActionPanelProps {
  onClose?: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onClose }) => {
  const flatResults = useSearchStore((state) => state.flatResults);
  const selectedIndex = useSearchStore((state) => state.selectedIndex);
  const setActionPanelOpen = useSearchStore((state) => state.setActionPanelOpen);
  const selectedResult = flatResults[selectedIndex] || null;

  const { getActionsForResult, executeResultAction } = useResultActions();
  const actions: ResultAction[] = getActionsForResult(selectedResult);

  const [activeActionIndex, setActiveActionIndex] = useState(0);

  useEffect(() => {
    setActiveActionIndex(0);
  }, [selectedResult]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveActionIndex((prev) => Math.min(prev + 1, actions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveActionIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const action = actions[activeActionIndex];
        if (action && selectedResult) {
          executeResultAction(selectedResult, action.id);
        }
      } else if (e.key === 'Escape' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        if (onClose) onClose();
        else setActionPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [actions, activeActionIndex, selectedResult, executeResultAction, onClose, setActionPanelOpen]);

  if (!selectedResult || actions.length === 0) {
    return null;
  }

  const getActionMaterialIcon = (actionId: string): string => {
    switch (actionId) {
      case 'open':
        return 'open_in_new';
      case 'reveal':
        return 'folder_open';
      case 'copy_path':
        return 'content_copy';
      case 'copy_value':
      case 'copy_text':
        return 'content_paste';
      case 'run_admin':
        return 'admin_panel_settings';
      case 'search_web':
        return 'travel_explore';
      default:
        return 'bolt';
    }
  };

  return (
    <div className="action-panel-overlay" onClick={() => setActionPanelOpen(false)}>
      <div
        className="action-panel-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Action Menu"
      >
        {/* Context Header */}
        <div className="action-panel-header">
          <div className="action-panel-title-group">
            <div className="action-result-icon">
              <span className="material-symbols-outlined">
                {selectedResult.icon && selectedResult.icon.length > 2
                  ? selectedResult.icon
                  : 'auto_awesome'}
              </span>
            </div>
            <div className="action-result-text">
              <span className="action-result-title">{selectedResult.title}</span>
              <span className="action-result-subtitle">Select Action</span>
            </div>
          </div>
          <button
            type="button"
            className="action-panel-close"
            onClick={() => setActionPanelOpen(false)}
            title="Close action menu (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Action List */}
        <div className="action-panel-list" role="menu">
          <div className="action-section-label">Available Actions</div>
          {actions.map((act, index) => {
            const isSelected = index === activeActionIndex;
            const iconName = getActionMaterialIcon(act.id);
            return (
              <div
                key={act.id}
                className={`action-item ${isSelected ? 'selected' : ''}`}
                onClick={() => executeResultAction(selectedResult, act.id)}
                onMouseEnter={() => setActiveActionIndex(index)}
                role="menuitem"
                tabIndex={isSelected ? 0 : -1}
              >
                <div className="action-item-left">
                  <span className="material-symbols-outlined action-item-icon">{iconName}</span>
                  <span className="action-item-label">{act.label}</span>
                </div>
                {act.shortcut && (
                  <span className="action-item-shortcut">{act.shortcut}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
