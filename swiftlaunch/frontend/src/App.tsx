import React, { useEffect } from 'react';
import { setupMockApi } from './mockApi.js';
import { useUiStore } from './state/useUiStore.js';
import { useSearchStore } from './state/useSearchStore.js';
import { useLauncherSearch } from './hooks/useLauncherSearch.js';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation.js';
import { useLauncherVisibility } from './hooks/useLauncherVisibility.js';
import { SearchBar } from './components/SearchBar.js';
import { ResultsList } from './components/ResultsList.js';
import { DetailPane } from './components/DetailPane.js';
import { ActionPanel } from './components/ActionPanel.js';
import { FooterHints } from './components/FooterHints.js';
import './index.css';

// Polyfill mock API in standalone browser dev mode
setupMockApi();

export const App: React.FC = () => {
  const theme = useUiStore((state) => state.theme);
  const detailPaneOpen = useSearchStore((state) => state.detailPaneOpen);
  const actionPanelOpen = useSearchStore((state) => state.actionPanelOpen);
  const providerWarning = useSearchStore((state) => state.providerWarning);
  const setProviderWarning = useSearchStore((state) => state.setProviderWarning);

  // Initialize search hook
  useLauncherSearch();

  // Initialize visibility reset hook
  useLauncherVisibility();

  // Initialize keyboard navigation hook
  useKeyboardNavigation();

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

  return (
    <div className="launcher-window" data-theme={theme}>
      <SearchBar />

      {providerWarning && (
        <div className="provider-warning-banner" role="alert">
          <span className="warning-icon">⚠️</span>
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

      <div className="launcher-content-area">
        <ResultsList />

        {detailPaneOpen && !actionPanelOpen && <DetailPane />}

        {actionPanelOpen && <ActionPanel />}
      </div>

      <FooterHints />
    </div>
  );
};

export default App;
