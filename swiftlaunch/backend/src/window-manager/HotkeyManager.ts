/**
 * HotkeyManager — configurable global hotkey registration for SwiftLaunch.
 *
 * Extracted from main.ts to make the hotkey configurable and testable.
 * Manages globalShortcut registration lifecycle.
 */

import type { BrowserWindow } from 'electron';

import { globalShortcut } from 'electron';

function getGlobalShortcutApi() {
  if (globalShortcut && typeof globalShortcut.register === 'function') {
    return globalShortcut;
  }
  return {
    register: () => true,
    unregister: () => {},
    unregisterAll: () => {}
  };
}

export class HotkeyManager {
  private currentHotkey: string;
  private windowRef: (() => BrowserWindow | null) | null = null;
  private createWindowFn: (() => void) | null = null;

  constructor(hotkey: string = 'Alt+Space') {
    this.currentHotkey = hotkey;
  }

  /** Set the window reference getter and createWindow callback. */
  setWindowCallbacks(
    getWindow: () => BrowserWindow | null,
    createWindow: () => void
  ): void {
    this.windowRef = getWindow;
    this.createWindowFn = createWindow;
  }

  /** Register the global hotkey(s). Returns true on success. */
  register(): boolean {
    const globalShortcut = getGlobalShortcutApi();
    const shortcutsToRegister = Array.from(new Set([this.currentHotkey, 'CommandOrControl+Space']));
    let anySuccess = false;

    for (const shortcut of shortcutsToRegister) {
      try {
        const registered = globalShortcut.register(shortcut, () => {
          this.handleToggle();
        });

        if (!registered) {
          console.warn(`[HotkeyManager] Failed to register global shortcut: ${shortcut}`);
        } else {
          console.log(`[HotkeyManager] Registered global shortcut: ${shortcut}`);
          anySuccess = true;
        }
      } catch (err) {
        console.error(`[HotkeyManager] Error registering ${shortcut}:`, err);
      }
    }

    return anySuccess;
  }

  /** Unregister current hotkeys. */
  unregister(): void {
    try {
      const globalShortcut = getGlobalShortcutApi();
      const shortcutsToUnregister = Array.from(new Set([this.currentHotkey, 'CommandOrControl+Space']));
      for (const shortcut of shortcutsToUnregister) {
        globalShortcut.unregister(shortcut);
      }
      console.log(`[HotkeyManager] Unregistered shortcuts`);
    } catch {
      // May fail if not registered
    }
  }

  /** Change the hotkey binding at runtime. */
  updateHotkey(newHotkey: string): boolean {
    this.unregister();
    this.currentHotkey = newHotkey;
    return this.register();
  }

  /** Unregister all global shortcuts. */
  unregisterAll(): void {
    const globalShortcut = getGlobalShortcutApi();
    globalShortcut.unregisterAll();
  }

  /** Get the current hotkey string. */
  getHotkey(): string {
    return this.currentHotkey;
  }

  private handleToggle(): void {
    const win = this.windowRef?.();
    if (!win || win.isDestroyed()) {
      this.createWindowFn?.();
      return;
    }
    if (win.isVisible() && !win.isMinimized()) {
      win.hide();
    } else {
      if (win.isMinimized()) {
        win.restore();
      }
      win.show();
      win.setAlwaysOnTop(true);
      win.focus();
    }
  }
}
