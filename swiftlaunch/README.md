# SwiftLaunch 🚀

A high-performance, keyboard-first Spotlight & Raycast alternative for Windows built with Electron, React, TypeScript, and SQLite.

> 💡 **Preparing for a presentation or code walkthrough?**  
> Check out the complete [**Code Navigation & Presentation Guide (CODE_NAVIGATION.md)**](CODE_NAVIGATION.md) for a feature-to-file lookup table, architecture diagrams, and viva question answers.

---

## Key Features

- **⚡ Blazing Fast Search:** Unified search for applications and files with intelligent ranking.
- **📁 Windows File Search:** High-speed NTFS file indexing powered by Voidtools Everything CLI (`es.exe`) with native recursive directory fallback.
- **📦 App Combos (Multi-App Launching):** Group apps together into one-click workflows (e.g. "Dev Stack" launching VS Code, Terminal, and Chrome simultaneously).
- **🪟 Win32 Window Snapping:** Built-in window snapping commands (`left`, `right`, `maximize`, `center`).
- **🧩 Extensible Plugin Host:** Support for third-party plugins with custom action keywords.
- **🎨 Modern Spotlight UI:** Floating pill search bar, customizable themes (Dark/Light), keyboard action menus (`Tab`), and live preview panes (`Alt+D`).

---

## Architecture & Directory Layout

```
swiftlaunch/
├── backend/                       # Electron main process (Node.js & TypeScript)
│   ├── src/
│   │   ├── main.ts                # Application lifecycle, window creation, hotkey registration
│   │   ├── preload.ts             # Secure IPC bridge exposing window.api to renderer
│   │   ├── providers/             # Search providers (AppProvider, FileProvider, etc.)
│   │   ├── db/                    # SQLite database schema, migrations & usage queries
│   │   ├── ipc/                   # Electron IPC channel handlers
│   │   ├── window-manager/        # Global hotkey manager & Win32 window snapping
│   │   └── plugin-host/           # Third-party plugin loader & sandbox
│   └── tests/                     # Vitest test suite for backend providers
├── frontend/                      # React renderer process (Vite + TypeScript)
│   ├── src/
│   │   ├── components/            # UI components (SearchBar, ResultsList, AppCombosBar, DetailPane, etc.)
│   │   ├── hooks/                 # React hooks (useLauncherSearch, useKeyboardNavigation, etc.)
│   │   ├── state/                 # Zustand state stores (useSearchStore, useComboStore, useUiStore)
│   │   ├── mockApi.ts             # Browser mock API for standalone UI development
│   │   └── App.tsx                # Main container layout
│   └── tests/                     # Frontend component and store test suite
├── shared/                        # Shared TypeScript types, interfaces, and IPC channel constants
│   └── src/
│       ├── types.ts               # Core data structures (Result, AppCombo, Settings)
│       └── ipc-channels.ts        # Single source of truth for IPC channel strings
├── plugins-sdk/                   # Plugin authoring SDK and example plugins
└── CODE_NAVIGATION.md             # Complete feature-to-file lookup table and presentation script
```

---

## Quick Navigation: Where to Find Everything

| If you want to see... | Check this file |
| :--- | :--- |
| **Search bar input & debounce** | [`frontend/src/components/SearchBar.tsx`](frontend/src/components/SearchBar.tsx) & [`frontend/src/hooks/useLauncherSearch.ts`](frontend/src/hooks/useLauncherSearch.ts) |
| **App Combos & Group Launching** | [`frontend/src/components/AppCombosBar.tsx`](frontend/src/components/AppCombosBar.tsx) & [`backend/src/ipc/handlers.ts`](backend/src/ipc/handlers.ts) |
| **Windows Application Scanner** | [`backend/src/providers/AppProvider.ts`](backend/src/providers/AppProvider.ts) |
| **File Search (Everything CLI + Fallback)** | [`backend/src/providers/FileProvider.ts`](backend/src/providers/FileProvider.ts) |
| **IPC Bridge & Channel Handlers** | [`backend/src/preload.ts`](backend/src/preload.ts) & [`backend/src/ipc/handlers.ts`](backend/src/ipc/handlers.ts) |
| **Keyboard Navigation & Action Menu** | [`frontend/src/hooks/useKeyboardNavigation.ts`](frontend/src/hooks/useKeyboardNavigation.ts) & [`frontend/src/components/ActionPanel.tsx`](frontend/src/components/ActionPanel.tsx) |
| **SQLite DB Schema & Ranking Boosts** | [`backend/src/db/schema.ts`](backend/src/db/schema.ts) & [`backend/src/db/queries.ts`](backend/src/db/queries.ts) |

---

## Running the Application

### 1. Run Complete Application (Electron + React UI)
```bash
npm run dev
# or
pnpm dev
```
Toggle the launcher anywhere with `Alt + Space`.

### 2. Run Isolated Frontend in Browser (Mock Mode)
```bash
cd frontend
pnpm dev
```
Access at `http://localhost:5173`. Uses `mockApi.ts` without requiring Electron.

### 3. Run Test Suite
```bash
npm run test
# or
pnpm test
```
Runs all 14 test suites (42 unit and integration tests) across frontend and backend.
