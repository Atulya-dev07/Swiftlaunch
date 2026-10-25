import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useComboStore } from '../state/useComboStore.js';
import { ResultIcon } from './ResultIcon.js';
import type { InstalledApp } from '@swiftlaunch/shared';

interface CreateComboModalProps {
  onClose: () => void;
}

const COLOR_OPTIONS = ['#818CF8', '#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'];

export const CreateComboModal: React.FC<CreateComboModalProps> = ({ onClose }) => {
  const availableApps = useComboStore((state) => state.availableApps);
  const fetchAvailableApps = useComboStore((state) => state.fetchAvailableApps);
  const isLoadingApps = useComboStore((state) => state.isLoadingApps);
  const addCombo = useComboStore((state) => state.addCombo);

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#818CF8');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load apps on mount
  useEffect(() => {
    fetchAvailableApps();
  }, [fetchAvailableApps]);

  // Ensure search input gets focus reliably on modal open
  useEffect(() => {
    searchInputRef.current?.focus();
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle global Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Map of id -> app
  const appMap = useMemo(() => {
    const map = new Map<string, InstalledApp>();
    for (const app of availableApps) {
      if (app && app.id) {
        map.set(app.id, app);
      }
    }
    return map;
  }, [availableApps]);

  // Robust multi-word search filter
  const filteredApps = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return availableApps;
    const tokens = q.split(/\s+/).filter(Boolean);
    return availableApps.filter((app) => {
      if (!app) return false;
      const name = (app.name || '').toLowerCase();
      const path = (app.lnkPath || app.id || '').toLowerCase();
      return tokens.every((token) => name.includes(token) || path.includes(token));
    });
  }, [availableApps, filterQuery]);

  // Toggle app selection
  const toggleApp = (appId: string) => {
    setSelectedAppIds((prev) => {
      const isSelected = prev.includes(appId);
      const next = isSelected ? prev.filter((id) => id !== appId) : [...prev, appId];

      // Auto update name if user hasn't typed a custom one
      if (!customName || customName.includes('+')) {
        const names = next.map((id) => appMap.get(id)?.name || 'App');
        setCustomName(names.join(' + '));
      }

      return next;
    });
  };

  const handleSave = () => {
    if (selectedAppIds.length === 0) return;

    const names = selectedAppIds.map((id) => appMap.get(id)?.name || 'App');
    const finalName = customName.trim() || names.join(' + ');

    addCombo({
      name: finalName,
      icon: '',
      color: selectedColor,
      appIds: selectedAppIds,
      appNames: names
    });

    onClose();
  };

  return (
    <div className="combo-modal-overlay" onClick={onClose}>
      <div
        className="combo-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="combo-dialog-title"
      >
        {/* Modal Header */}
        <div className="combo-modal-header">
          <div>
            <div className="combo-modal-title" id="combo-dialog-title">
              Club Apps Together
            </div>
            <div className="combo-modal-subtitle">
              Select applications to launch simultaneously with one click
            </div>
          </div>
          <button
            type="button"
            className="combo-modal-close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Selected Apps Preview Bar */}
        {selectedAppIds.length > 0 && (
          <div className="combo-selected-chips-bar">
            <span className="combo-selected-label">
              Selected ({selectedAppIds.length}):
            </span>
            <div className="combo-selected-chips-list">
              {selectedAppIds.map((id) => {
                const app = appMap.get(id);
                return (
                  <span key={id} className="combo-selected-chip">
                    <span className="combo-chip-name">{app?.name || 'App'}</span>
                    <button
                      type="button"
                      className="combo-chip-remove"
                      onClick={() => toggleApp(id)}
                      title={`Remove ${app?.name}`}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Search / Filter Apps Section */}
        <div
          className="combo-apps-search-wrap"
          onClick={() => searchInputRef.current?.focus()}
        >
          <span className="material-symbols-outlined combo-search-icon">search</span>
          <input
            ref={searchInputRef}
            type="text"
            className="combo-apps-search-input"
            placeholder="Search installed applications (e.g. Chrome, VS Code, Notepad)..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                if (filterQuery) {
                  e.stopPropagation();
                  setFilterQuery('');
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const firstRow = document.querySelector<HTMLElement>('.combo-app-row');
                firstRow?.focus();
              }
            }}
            spellCheck={false}
            autoComplete="off"
          />
          {filterQuery && (
            <button
              type="button"
              className="combo-search-clear"
              onClick={(e) => {
                e.stopPropagation();
                setFilterQuery('');
                searchInputRef.current?.focus();
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Apps List */}
        <div className="combo-apps-list-container">
          {isLoadingApps ? (
            <div className="combo-apps-loading">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              <span>Scanning installed applications...</span>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="combo-apps-empty">
              <span className="material-symbols-outlined combo-empty-icon">search_off</span>
              <div>No matching applications found for "{filterQuery}".</div>
              <button
                type="button"
                className="combo-clear-filter-btn"
                onClick={() => {
                  setFilterQuery('');
                  searchInputRef.current?.focus();
                }}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="combo-apps-list">
              {filteredApps.map((app) => {
                const isSelected = selectedAppIds.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className={`combo-app-row ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleApp(app.id)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleApp(app.id);
                      } else if (e.key === 'ArrowUp') {
                        const prev = (e.currentTarget.previousElementSibling as HTMLElement) || searchInputRef.current;
                        prev?.focus();
                      } else if (e.key === 'ArrowDown') {
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        next?.focus();
                      }
                    }}
                  >
                    <div className="combo-checkbox-box">
                      <div className={`combo-checkbox ${isSelected ? 'is-checked' : ''}`}>
                        {isSelected && <span>✓</span>}
                      </div>
                    </div>

                    <div className="combo-app-icon-wrap">
                      <ResultIcon title={app.name} providerId="app" />
                    </div>

                    <div className="combo-app-info">
                      <div className="combo-app-title">{app.name}</div>
                      <div className="combo-app-path" title={app.lnkPath || app.id}>
                        {app.lnkPath || 'Application'}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="combo-app-badge">Clubbed</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Combo Customization Fields */}
        <div className="combo-config-row">
          <div className="combo-name-input-wrap">
            <label className="combo-field-label">Combo Name</label>
            <input
              type="text"
              className="combo-name-input"
              placeholder="e.g., Chrome + VS Code"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div className="combo-accent-picker-wrap">
            <label className="combo-field-label">Accent</label>
            <div className="combo-color-row">
              {COLOR_OPTIONS.slice(0, 4).map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`combo-color-dot ${selectedColor === color ? 'is-selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="combo-modal-footer">
          <div className="combo-footer-note">
            Tip: Press Enter or spacebar on any row to toggle selection
          </div>
          <div className="combo-footer-actions">
            <button
              type="button"
              className="combo-footer-btn combo-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="combo-footer-btn combo-save-btn"
              disabled={selectedAppIds.length === 0}
              onClick={handleSave}
            >
              {selectedAppIds.length === 0
                ? 'Select Apps to Club'
                : `Create Combo (${selectedAppIds.length} ${selectedAppIds.length === 1 ? 'App' : 'Apps'})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
