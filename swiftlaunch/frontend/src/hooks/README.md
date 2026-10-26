# Frontend Hooks

Custom React hooks encapsulating keyboard navigation, IPC queries, and launcher lifecycles.

## Files
- **`useLauncherSearch.ts`**: Debounces input queries by 150ms and invokes `window.api.search()`, populating `useSearchStore`.
- **`useKeyboardNavigation.ts`**: Intercepts `ArrowUp`, `ArrowDown`, `Enter`, `Tab` (action menu), `Alt+D` (preview), and `Escape` for swift navigation without mouse interaction.
- **`useResultActions.ts`**: Helper hook computing available primary and secondary actions for any highlighted result and dispatching action execution over IPC.
- **`useLauncherVisibility.ts`**: Resets transient search and selection state when the launcher window blurs or hides.
- **`useContextResults.ts`**: Subscribes to real-time contextual OCR updates pushed from the main process.
