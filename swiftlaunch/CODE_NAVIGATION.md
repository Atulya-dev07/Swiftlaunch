# SwiftLaunch — Codebase Navigation & Presentation Guide

> **Quick Reference for Project Presentation & Viva**
> This guide maps every feature in SwiftLaunch directly to its source files, data flow, and OS-level mechanisms. Use this during your presentation to quickly locate code or explain architecture to evaluators.

---

## 1. High-Level Architecture Overview

SwiftLaunch is built on an **Electron Multi-Process Architecture** with strict context isolation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RENDERER PROCESS (React + Vite)                       │
│  • SearchBar.tsx          • AppCombosBar.tsx         • CreateComboModal.tsx │
│  • ResultsList.tsx        • ResultItem.tsx           • DetailPane.tsx       │
│  • ActionPanel.tsx        • SettingsPage.tsx                                │
│                     Zustand Stores: useSearchStore, useComboStore           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ window.api (contextBridge)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        PRELOAD SCRIPT (preload.ts)                          │
│         Exposes safe, typed IPC invoke / send methods to window.api         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Electron IPC (IPC_CHANNELS)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    MAIN PROCESS (Node.js + Electron Main)                   │
│                                                                             │
│  ┌───────────────────────┐   ┌───────────────────────────────────────────┐  │
│  │   IPC Handler Hub     │   │             ProviderRegistry              │  │
│  │  (ipc/handlers.ts)    │──▶│      (providers/ProviderRegistry.ts)      │  │
│  └───────────────────────┘   └─────────────────────┬─────────────────────┘  │
│                                                    │ Fan-out Search         │
│         ┌──────────────────┬───────────────────────┴──────────────────┐     │
│         ▼                  ▼                                          ▼     │
│   AppProvider         FileProvider                               PluginLoader│
│  (Start Menu scan)  (Everything/Win32)                           (SDK plugins)│
│         │                  │                                          │     │
│         ▼                  ▼                                          ▼     │
│   WindowSnapper       SQLite DB                                  App Combos │
│  (Win32 FFI Snap)    (queries.ts)                               (handlers.ts)│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. "Where is the Code for X?" — Quick Lookup Table

| Feature / Subsystem | Primary Code Files | Key Functions / Classes | What it Does / OS Concept |
| :--- | :--- | :--- | :--- |
| **Search Input & Debounce** | [`frontend/src/components/SearchBar.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/SearchBar.tsx)<br>[`frontend/src/hooks/useLauncherSearch.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/hooks/useLauncherSearch.ts) | `useLauncherSearch()`<br>`SearchBar` | Captures keystrokes with 150ms debounce before dispatching IPC search. |
| **IPC Bridge & Security** | [`shared/src/ipc-channels.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/shared/src/ipc-channels.ts)<br>[`backend/src/preload.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/preload.ts)<br>[`backend/src/ipc/handlers.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/ipc/handlers.ts) | `IPC_CHANNELS`<br>`contextBridge.exposeInMainWorld`<br>`registerIpcHandlers()` | Implements secure Inter-Process Communication without enabling `nodeIntegration`. |
| **Provider Routing & Search** | [`backend/src/providers/ProviderRegistry.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/providers/ProviderRegistry.ts)<br>[`backend/src/providers/ProviderContract.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/providers/ProviderContract.ts) | `ProviderRegistry.search()`<br>`initializeAll()` | Dispatches queries concurrently across enabled providers via `Promise.allSettled()`. Supports `#files` scope routing. |
| **App Combos (Group Launch)** | [`frontend/src/components/AppCombosBar.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/AppCombosBar.tsx)<br>[`frontend/src/components/CreateComboModal.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/CreateComboModal.tsx)<br>[`frontend/src/state/useComboStore.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/state/useComboStore.ts)<br>[`backend/src/ipc/handlers.ts#L170-L194`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/ipc/handlers.ts#L170-L194) | `useComboStore`<br>`launchAppGroup()`<br>`shell.openPath` | Allows grouping multiple apps into a 1-click combo and launches them sequentially via OS shell. |
| **Application Search** | [`backend/src/providers/AppProvider.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/providers/AppProvider.ts) | `scanStartMenu()`<br>`search()`<br>`executeAction()` | Scans Windows Start Menu shortcuts (`.lnk`), parses names, and launches apps via `shell.openPath()`. |
| **Fast Windows File Search** | [`backend/src/providers/FileProvider.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/providers/FileProvider.ts) | `search()`<br>`searchWithEverything()`<br>`searchFilesystemFallback()` | Uses Voidtools Everything CLI (`es.exe`) for instantaneous NTFS search, with recursive Node.js fallback. |
| **Window Snapping & Hotkeys** | [`backend/src/window-manager/HotkeyManager.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/window-manager/HotkeyManager.ts)<br>[`backend/src/window-manager/WindowSnapper.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/window-manager/WindowSnapper.ts) | `globalShortcut.register`<br>`snap()`<br>`screen.getPrimaryDisplay()` | Registers global shortcut (`Alt+Space`) and snaps active windows to left/right/top/bottom screen halves. |
| **SQLite DB & Ranking Boost** | [`backend/src/db/schema.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/db/schema.ts)<br>[`backend/src/db/queries.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/db/queries.ts) | `initDatabase()`<br>`logUsage()`<br>`getBoostScores()` | Persists usage history, frequency boosts frequent items, and stores settings. |
| **Plugin Extensibility Host** | [`backend/src/plugin-host/PluginLoader.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/plugin-host/PluginLoader.ts)<br>[`plugins-sdk/examples/google-search/`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/plugins-sdk/examples/google-search) | `PluginLoader`<br>`loadPlugin()` | Discovers third-party plugins from JSON manifests and executes commands via isolated child processes. |
| **Frontend State & Navigation** | [`frontend/src/state/useSearchStore.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/state/useSearchStore.ts)<br>[`frontend/src/hooks/useKeyboardNavigation.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/hooks/useKeyboardNavigation.ts)<br>[`frontend/src/hooks/useResultActions.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/hooks/useResultActions.ts) | `useSearchStore`<br>`useKeyboardNavigation`<br>`executeResultAction` | Full keyboard navigation (`↑`/`↓`, `Enter`, `Tab` for action menu, `Esc`). |
| **Detail Preview & Action Menu** | [`frontend/src/components/DetailPane.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/DetailPane.tsx)<br>[`frontend/src/components/ActionPanel.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/ActionPanel.tsx) | `DetailPane`<br>`ActionPanel` | Side preview card with file metadata and secondary actions menu (Reveal in Explorer, Run as Admin, Copy Path). |

---

## 3. Data Flow Walkthrough (End-to-End)

When a user types **`#files document`** or an app name like **`Chrome`**:

1. **User Keystroke in React UI**  
   - Handled in [`SearchBar.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/SearchBar.tsx).
   - Updates `query` in [`useSearchStore.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/state/useSearchStore.ts).

2. **Debounced Search Trigger**  
   - [`useLauncherSearch.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/hooks/useLauncherSearch.ts) waits 150ms to prevent flooding the main process.
   - Calls `window.api.search(query)` via the preload bridge.

3. **IPC Transmission**  
   - [`preload.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/preload.ts) sends `IPC_CHANNELS.SEARCH` across Electron process boundary.

4. **Main Process Dispatch**  
   - Handled in [`backend/src/ipc/handlers.ts`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/ipc/handlers.ts).
   - Forwards to [`ProviderRegistry.search(query)`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/providers/ProviderRegistry.ts).

5. **Concurrent Provider Execution**  
   - `ProviderRegistry` executes matching providers concurrently:
     - `AppProvider` searches indexed Windows Start Menu `.lnk` files.
     - `FileProvider` executes Everything CLI or fast recursive directory search.

6. **SQLite Usage Frequency Boost**  
   - [`DbQueries.getBoostScores()`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/backend/src/db/queries.ts) queries SQLite for how frequently each item was launched.
   - Items with high historical usage are bumped higher in relevance score.

7. **Renderer Update & Render**  
   - Results are returned across IPC to `useLauncherSearch.ts`.
   - `useSearchStore` updates `flatResults` and `groupedResults`.
   - [`ResultsList.tsx`](file:///c:/Users/atuly/Desktop/OS%20PROJECT/swiftlaunch/frontend/src/components/ResultsList.tsx) renders items with icons and metadata badges.

---

## 4. Live Presentation Demo Script

| Demo Action | What to Type / Click | What Happens / What to Point Out |
| :--- | :--- | :--- |
| **1. Application Launching** | Type `Notepad` or `Chrome` | Instant matching from Windows Start Menu cache. Press `Enter` to launch. |
| **2. Scoped File Search** | Type `#files .pdf` or `#files notes` | Shows only files and documents, routing directly to `FileProvider`. |
| **3. App Combos (Multi-App)** | Click "+ Combo" pill or click an existing combo (e.g. "Dev Stack") | Launches multiple development tools (e.g., VS Code + Terminal + Browser) in 1 click. |
| **4. Action Menu** | Highlight any result and press `Tab` | Opens the `ActionPanel` modal: "Open", "Reveal in Explorer", "Copy Path", "Run as Admin". |
| **5. Preview Pane** | Press `Alt + D` | Opens the right-side `DetailPane` with live file preview and metadata. |
| **6. Global Hotkey Toggle** | Press `Alt + Space` anywhere in Windows | Launcher smoothly shows/hides, centered on the active screen. |

---

## 5. Key Operating Systems Concepts to Mention

When professors or evaluators ask theoretical questions, reference these points:

1. **Process Isolation & Security:**
   - The UI runs in a sandboxed Chromium renderer with `nodeIntegration: false`.
   - `preload.ts` uses `contextBridge` to expose only safe, explicit API functions. A compromised renderer cannot access arbitrary Node.js APIs or disk files directly.

2. **Inter-Process Communication (IPC):**
   - Employs asynchronous IPC channels (`ipcRenderer.invoke` and `ipcMain.handle`) utilizing structured serialization for non-blocking UI interactions.

3. **Win32 Shell & Native Integration:**
   - Utilizes Electron's native shell integration (`shell.openPath`, `shell.showItemInFolder`) to launch executable shortcuts without spawning raw command shells.
   - Global keyboard shortcuts are hooked into Windows via `globalShortcut`.

4. **Concurrent Multi-Threading via Provider Pattern:**
   - Search across disk, apps, and plugins runs concurrently using `Promise.allSettled()`, ensuring slow file scans never block application results.

5. **Smart Caching & Caching Invalidation:**
   - Start Menu shortcuts are scanned once on initialization and cached in-memory.
