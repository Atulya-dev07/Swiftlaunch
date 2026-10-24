import React, { useState, useEffect } from 'react';
import { setupMockApi } from './mockApi.js';
import { useUiStore } from './state/useUiStore.js';
import { useSearchStore } from './state/useSearchStore.js';
import { useLauncherSearch } from './hooks/useLauncherSearch.js';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation.js';
import { useLauncherVisibility } from './hooks/useLauncherVisibility.js';
import { useContextResults } from './hooks/useContextResults.js';
import { SearchBar } from './components/SearchBar.js';
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

  // Initialize search hook
  useLauncherSearch();

  // Initialize visibility reset hook
  useLauncherVisibility();

  // Initialize keyboard navigation hook
  useKeyboardNavigation();

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
      if (e.key === 'Escape' && settingsOpen) {
        e.preventDefault();
        setSettingsOpen(false);
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen]);

  const hasActiveResults = query.trim().length > 0 || flatResults.length > 0;

  return (
    <div
      className={`launcher-window ${hasActiveResults ? 'has-results' : 'is-idle'}`}
      data-theme={theme}
    >
      <SearchBar onOpenSettings={() => setSettingsOpen(true)} />

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

      {settingsOpen && <SettingsPage onClose={() => setSettingsOpen(false)} />}
    </div>
  );
};

export default App;
