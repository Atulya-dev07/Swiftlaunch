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

  return (
    <div className="action-panel-overlay">
      <div className="action-panel-container">
        <div className="action-panel-header">
          <div className="action-panel-title-group">
            <span className="action-result-icon">{selectedResult.icon}</span>
            <div className="action-result-text">
              <span className="action-result-title">{selectedResult.title}</span>
              <span className="action-result-subtitle">{selectedResult.subtitle}</span>
            </div>
          </div>
          <button
            type="button"
            className="action-panel-close"
            onClick={() => setActionPanelOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="action-panel-list">
          <div className="action-section-label">Available Actions</div>
          {actions.map((act, index) => {
            const isSelected = index === activeActionIndex;
            return (
              <div
                key={act.id}
                className={`action-item ${isSelected ? 'selected' : ''} ${act.isPrimary ? 'primary' : ''}`}
                onClick={() => executeResultAction(selectedResult, act.id)}
                onMouseEnter={() => setActiveActionIndex(index)}
              >
                <span className="action-item-icon">{act.icon || '⚡'}</span>
                <span className="action-item-label">{act.label}</span>
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
