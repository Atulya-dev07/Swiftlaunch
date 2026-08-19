import { useCallback } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import type { Result } from '@swiftlaunch/shared';

export interface ResultAction {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  isPrimary?: boolean;
}

export function useResultActions() {
  const query = useSearchStore((state) => state.query);
  const addRecentQuery = useSearchStore((state) => state.addRecentQuery);

  const getActionsForResult = useCallback((result: Result | null): ResultAction[] => {
    if (!result) return [];

    const providerId = result.providerId || result.id.split(':')[0] || 'other';

    switch (providerId) {
      case 'app':
        return [
          { id: 'open', label: 'Open Application', shortcut: '↵', icon: '🚀', isPrimary: true },
          { id: 'copy_path', label: 'Copy Path', shortcut: 'Ctrl+C', icon: '📋' },
          { id: 'open_folder', label: 'Show in Explorer', shortcut: 'Ctrl+Shift+O', icon: '📁' }
        ];

      case 'file':
        return [
          { id: 'open', label: 'Open File', shortcut: '↵', icon: '📄', isPrimary: true },
          { id: 'copy_path', label: 'Copy Full Path', shortcut: 'Ctrl+C', icon: '📋' },
          { id: 'show_in_folder', label: 'Show in Folder', shortcut: 'Ctrl+Shift+O', icon: '📁' }
        ];

      case 'calc':
        return [
          { id: 'copy', label: 'Copy Result to Clipboard', shortcut: '↵', icon: '📋', isPrimary: true }
        ];

      case 'clip':
        return [
          { id: 'paste', label: 'Paste to Active Window', shortcut: '↵', icon: '📋', isPrimary: true },
          { id: 'copy', label: 'Copy to Clipboard', shortcut: 'Ctrl+C', icon: '📄' }
        ];

      case 'google':
        return [
          { id: 'search', label: 'Search in Browser', shortcut: '↵', icon: '🌐', isPrimary: true },
          { id: 'copy_url', label: 'Copy Search URL', shortcut: 'Ctrl+C', icon: '📋' }
        ];

      default:
        return [
          { id: 'execute', label: 'Execute Action', shortcut: '↵', icon: '⚡', isPrimary: true }
        ];
    }
  }, []);

  const executeResultAction = useCallback(
    async (result: Result, actionId?: string) => {
      if (!result) return;

      try {
        if (actionId === 'copy_path' || actionId === 'copy_url') {
          const textToCopy = result.subtitle || result.id;
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
          }
        } else {
          if (window.api && typeof window.api.executeAction === 'function') {
            await window.api.executeAction(result.id, actionId || result.actionId);
          }
        }

        if (window.api && typeof window.api.logUsage === 'function') {
          window.api.logUsage(query, result.id);
        }

        addRecentQuery(query);

        // Hide launcher after executing action
        if (window.api && typeof window.api.hideWindow === 'function') {
          window.api.hideWindow();
        }
      } catch (err) {
        console.error('[useResultActions] Error executing action:', err);
      }
    },
    [query, addRecentQuery]
  );

  return { getActionsForResult, executeResultAction };
}
