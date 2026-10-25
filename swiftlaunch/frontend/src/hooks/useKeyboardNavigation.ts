import { useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { useResultActions } from './useResultActions.js';

interface KeyboardNavigationOptions {
  disabled?: boolean;
  onActionPanelIndexChange?: (delta: number) => void;
  actionPanelSelectedIndex?: number;
  onExecuteActionPanelItem?: () => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const flatResults = useSearchStore((state) => state.flatResults);
  const selectedIndex = useSearchStore((state) => state.selectedIndex);
  const setSelectedIndex = useSearchStore((state) => state.setSelectedIndex);
  const actionPanelOpen = useSearchStore((state) => state.actionPanelOpen);
  const setActionPanelOpen = useSearchStore((state) => state.setActionPanelOpen);
  const toggleActionPanel = useSearchStore((state) => state.toggleActionPanel);
  const detailPaneOpen = useSearchStore((state) => state.detailPaneOpen);
  const setDetailPaneOpen = useSearchStore((state) => state.setDetailPaneOpen);
  const toggleDetailPane = useSearchStore((state) => state.toggleDetailPane);

  const { executeResultAction } = useResultActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (options.disabled) {
        return;
      }

      // 1. Escape key logic
      if (e.key === 'Escape') {
        e.preventDefault();
        if (actionPanelOpen) {
          setActionPanelOpen(false);
          return;
        }
        if (detailPaneOpen) {
          setDetailPaneOpen(false);
          return;
        }
        if (window.api && typeof window.api.hideWindow === 'function') {
          window.api.hideWindow();
        }
        return;
      }

      // 2. Action Panel Keyboard Mode
      if (actionPanelOpen) {
        if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
          e.preventDefault();
          options.onActionPanelIndexChange?.(1);
          return;
        }
        if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
          e.preventDefault();
          options.onActionPanelIndexChange?.(-1);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (options.onExecuteActionPanelItem) {
            options.onExecuteActionPanelItem();
          }
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActionPanelOpen(false);
          return;
        }
      }

      // 3. Tab or Right Arrow opens/toggles Action Panel
      if (e.key === 'Tab' || (e.key === 'ArrowRight' && !e.shiftKey)) {
        if (flatResults.length > 0) {
          e.preventDefault();
          toggleActionPanel();
          return;
        }
      }

      // 4. Space / Alt+D toggles Detail Pane
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDetailPane();
        return;
      }

      // 5. Arrow Up / Down navigation & Ctrl+J / Ctrl+K
      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
        return;
      }

      if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // 6. Enter key executes primary action of selected item
      if (e.key === 'Enter' && flatResults.length > 0) {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        if (selected) {
          executeResultAction(selected);
        }
        return;
      }

      // 7. Quick launch with Ctrl+1..9 or Alt+1..9
      if ((e.ctrlKey || e.altKey) && e.key >= '1' && e.key <= '9') {
        const targetIdx = parseInt(e.key, 10) - 1;
        if (targetIdx < flatResults.length) {
          e.preventDefault();
          const targetItem = flatResults[targetIdx];
          if (targetItem) {
            executeResultAction(targetItem);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    flatResults,
    selectedIndex,
    actionPanelOpen,
    detailPaneOpen,
    setSelectedIndex,
    setActionPanelOpen,
    toggleActionPanel,
    setDetailPaneOpen,
    toggleDetailPane,
    executeResultAction,
    options
  ]);
}
