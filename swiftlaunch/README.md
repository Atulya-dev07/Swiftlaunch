# SwiftLaunch

SwiftLaunch is a Spotlight/Raycast-style launcher for Windows designed for speed, extensibility, and sleek user experience.

## Architecture & Directory Layout

```
swiftlaunch/
├── backend/                  (Electron main process — Node.js/TypeScript)
│   ├── src/
│   │   ├── main.ts            (creates BrowserWindow, registers global hotkey Alt+Space, IPC handlers)
│   │   ├── preload.ts         (preload script exposing window.api.ping())
│   │   ├── providers/         (AppProvider, FileProvider, CalculatorProvider, ClipboardProvider)
│   │   ├── ipc/                (IPC handlers)
│   │   ├── db/                 (SQLite schema/migrations)
│   │   ├── window-manager/     (Win32 FFI window snapping code)
│   │   └── plugin-host/        (plugin loader/sandbox)
│   ├── tests/                  (backend tests)
│   └── package.json            (runnable standalone)
├── frontend/                   (React renderer — Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx    (styled input box)
│   │   │   ├── ResultsList.tsx  (renders array of dummy result objects)
│   │   │   ├── ResultItem.tsx
│   │   │   └── SettingsPage.tsx (placeholder page)
│   │   ├── state/                (Zustand stores)
│   │   ├── hooks/                 (useIpcBridge etc.)
│   │   └── App.tsx                (frameless overlay layout with dark theme)
│   ├── tests/                     (frontend tests)
│   └── package.json               (runnable standalone in browser mock mode)
├── shared/                        (types + constants used by both backend and frontend)
│   ├── src/
│   │   ├── types.ts                (Result, PluginManifest, Settings interfaces)
│   │   └── ipc-channels.ts          (IPC channel name constants)
│   └── package.json
├── plugins-sdk/                    (plugin SDK documentation and template)
├── pnpm-workspace.yaml
├── package.json                    (root workspace config)
├── .gitignore
└── README.md
```

## Running the Application

### Full Application (Electron + React Renderer)
Run the root `dev` script to concurrently start the Vite frontend server and Electron backend:
```bash
npm run dev
```
*(or `pnpm dev`)*

### Isolated Debugging

- **Frontend Browser Mode**:
  Run the renderer standalone in the browser (mock mode):
  ```bash
  cd frontend
  pnpm dev
  ```
  Access at `http://localhost:5173`.

- **Backend Process**:
  Run the Electron main process independently:
  ```bash
  cd backend
  pnpm dev
  ```

### Running Tests
To run all test suites across packages:
```bash
npm run test
```
