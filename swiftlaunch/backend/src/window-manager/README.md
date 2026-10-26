# Window Management & Global Hotkeys

This directory provides native operating system window control and keyboard shortcut hooks.

## Files
- **`HotkeyManager.ts`**: Registers the global activation hotkey (`Alt+Space`) using Electron's `globalShortcut` API. Handles window toggle, focus restoration, and pre-show OCR screen context refresh.
- **`WindowSnapper.ts`**: Implements window positioning routines (`left`, `right`, `maximize`, `top`, `bottom`) using display bounds calculated from Electron's `screen` API.
