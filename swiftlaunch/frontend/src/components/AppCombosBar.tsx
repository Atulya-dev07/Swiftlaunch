import React, { useState } from 'react';
import { useComboStore } from '../state/useComboStore.js';
import type { AppCombo } from '@swiftlaunch/shared';

interface AppCombosBarProps {
  onOpenCreate: () => void;
}

export const AppCombosBar: React.FC<AppCombosBarProps> = ({ onOpenCreate }) => {
  const combos = useComboStore((state) => state.combos);
  const launchCombo = useComboStore((state) => state.launchCombo);
  const deleteCombo = useComboStore((state) => state.deleteCombo);
  const launchFeedback = useComboStore((state) => state.launchFeedback);

  const [activeLaunchingId, setActiveLaunchingId] = useState<string | null>(null);

  const handleLaunch = async (e: React.MouseEvent, combo: AppCombo) => {
    e.stopPropagation();
    setActiveLaunchingId(combo.id);
    await launchCombo(combo);
    setTimeout(() => {
      setActiveLaunchingId(null);
    }, 1500);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCombo(id);
  };

  return (
    <div className="app-combos-container">
      {/* Launch Feedback Banner */}
      {launchFeedback && (
        <div className="combo-launch-toast animate-fade-in">
          <span className="combo-pulse-dot" />
          <span className="combo-toast-text">{launchFeedback}</span>
        </div>
      )}

      <div className="app-combos-header">
        <div className="app-combos-label">
          <span className="combos-title">Combos</span>
          {combos.length > 0 && <span className="combos-badge">{combos.length}</span>}
        </div>
      </div>

      <div className="app-combos-row">
        {combos.map((combo) => {
          const isLaunching = activeLaunchingId === combo.id;
          return (
            <div
              key={combo.id}
              className={`combo-pill ${isLaunching ? 'is-launching' : ''}`}
              onClick={(e) => handleLaunch(e, combo)}
              title={`Click to launch ${combo.name} (${combo.appNames.join(', ')})`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLaunch(e as unknown as React.MouseEvent, combo);
                }
              }}
            >
              <span className="combo-pill-name">{combo.name}</span>
              <span className="combo-pill-count">{combo.appNames.length}</span>

              <button
                type="button"
                className="combo-pill-delete"
                onClick={(e) => handleDelete(e, combo.id)}
                title="Delete combo"
                aria-label="Delete combo"
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Plus Button to Club Apps */}
        <button
          type="button"
          className="combo-add-pill"
          onClick={onOpenCreate}
          title="Club apps together"
          aria-label="Club apps together"
        >
          <span className="combo-add-plus">+</span>
          <span className="combo-add-text">Club Apps</span>
        </button>
      </div>
    </div>
  );
};
