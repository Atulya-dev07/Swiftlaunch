import React, { useState, useEffect } from 'react';
import { setupMockApi } from './mockApi.js';
import { useUiStore } from './state/useUiStore.js';
import { useSearchStore } from './state/useSearchStore.js';
import { useComboStore } from './state/useComboStore.js';
import { useLauncherSearch } from './hooks/useLauncherSearch.js';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation.js';
import { useLauncherVisibility } from './hooks/useLauncherVisibility.js';
import { useContextResults } from './hooks/useContextResults.js';
import { SearchBar } from './components/SearchBar.js';
import { AppCombosBar } from './components/AppCombosBar.js';
import { CreateComboModal } from './components/CreateComboModal.js';
import { ResultsList } from './components/ResultsList.js';
import { DetailPane } from './components/DetailPane.js';
import { ActionPanel } from './components/ActionPanel.js';
import { SettingsPage } from './components/SettingsPage.js';
import './index.css';

// Polyfill mock API in standalone browser dev mode
setupMockApi();

export const App: React.FC = () => {
  const theme = useUiStore((state) => state.theme);
  const query = useSearchStore((state) => state.query);
  const flatResults = useSearchStore((state) => state.flatResults);
  const detailPaneOpen = useSearchStore((state) => state.detailPaneOpen);
  const actionPanelOpen = useSearchStore((state) => state.actionPanelOpen);
  const providerWarning = useSearchStore((state) => state.providerWarning);
  const setProviderWarning = useSearchStore((state) => state.setProviderWarning);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const loadCombos = useComboStore((state) => state.loadCombos);

  // Initialize saved app combos
  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  // Initialize search hook
  useLauncherSearch();

  // Initialize visibility reset hook
  useLauncherVisibility();

  // Initialize keyboard navigation hook (disabled when modal is open to avoid key interception)
  useKeyboardNavigation({ disabled: comboModalOpen || settingsOpen });

  // Initialize contextual search results listener
  useContextResults();

  useEffect(() => {
    // Diagnostic ping on mount
    if (window.api && typeof window.api.ping === 'function') {
      window.api
        .ping()
        .then((res) => {
          console.log(`[Renderer] IPC ping successful: ${res}`);
        })
        .catch((err) => {
          console.error('[Renderer] IPC ping error:', err);
        });
    } else {
      if (typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent)) {
        console.error('[Renderer] Electron preload API unavailable');
      }
    }

    // Listen for provider warnings
    let unsubscribe: (() => void) | undefined;
    if (window.api && typeof window.api.onProviderWarning === 'function') {
      unsubscribe = window.api.onProviderWarning((msg) => {
        console.warn(`[App:ProviderWarning] ${msg}`);
        setProviderWarning(msg);
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, [setProviderWarning]);

  // Handle global Esc for Settings dialog and Ctrl+, shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (comboModalOpen) {
          e.preventDefault();
          setComboModalOpen(false);
          return;
        }
        if (settingsOpen) {
          e.preventDefault();
          setSettingsOpen(false);
          return;
        }
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen, comboModalOpen]);

  const hasActiveResults = query.trim().length > 0 || flatResults.length > 0;

  return (
    <div
      className={`launcher-window ${hasActiveResults ? 'has-results' : 'is-idle'} ${comboModalOpen || settingsOpen ? 'is-modal-open' : ''}`}
      data-theme={theme}
    >
      <div className="window-drag-bar" title="Click and drag to move launcher">
        <div className="window-drag-indicator" />
      </div>

      <SearchBar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Extended Search Bar Section: App Combos / Clubbed Apps Bar */}
      <AppCombosBar onOpenCreate={() => setComboModalOpen(true)} />

      {providerWarning && (
        <div className="provider-warning-banner" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            warning
          </span>
          <span className="warning-text">{providerWarning}</span>
          <button
            type="button"
            className="warning-dismiss-btn"
            onClick={() => setProviderWarning(null)}
            title="Dismiss warning"
          >
            ✕
          </button>
        </div>
      )}

      {hasActiveResults && (
        <div className="launcher-content-area">
          <ResultsList />

          {detailPaneOpen && !actionPanelOpen && <DetailPane />}

          {actionPanelOpen && <ActionPanel />}
        </div>
      )}

      {comboModalOpen && <CreateComboModal onClose={() => setComboModalOpen(false)} />}
      {settingsOpen && <SettingsPage onClose={() => setSettingsOpen(false)} />}
    </div>
  );
};

export default App;
