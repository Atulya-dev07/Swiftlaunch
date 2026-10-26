# IPC Handlers

This directory contains the central Inter-Process Communication (IPC) router connecting the Electron Main process and the React Renderer process.

## Files
- **`handlers.ts`**: Registers all Electron `ipcMain.handle` and `ipcMain.on` listeners matching channel constants defined in `@swiftlaunch/shared`.

## Registered Channels
- `IPC_CHANNELS.SEARCH`: Fans out user queries to `ProviderRegistry` and `PluginLoader`, applies SQLite frequency-based score boosts, and returns top results.
- `IPC_CHANNELS.EXECUTE_ACTION`: Executes primary or secondary actions (e.g., launching apps, copying calculation results, revealing files in Windows Explorer).
- `IPC_CHANNELS.LAUNCH_APP_GROUP`: Launches multiple grouped applications simultaneously for App Combos.
- `IPC_CHANNELS.GET_ALL_APPS`: Retrieves the list of indexed installed applications for combo creation.
- `IPC_CHANNELS.SNAP_WINDOW`: Triggers Win32 window snapping via `WindowSnapper`.
- `IPC_CHANNELS.LOG_USAGE`: Increments usage frequency counters in SQLite for smart result ranking.
