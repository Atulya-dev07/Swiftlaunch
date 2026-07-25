/**
 * HotkeyManager — configurable global hotkey registration for SwiftLaunch.
 *
 * Extracted from main.ts to make the hotkey configurable and testable.
 * Manages globalShortcut registration lifecycle.
 */

import type { BrowserWindow } from 'electron';

function getGlobalShortcutApi() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('electron').globalShortcut;
  } catch {
    return {
      register: () => true,
      unregister: () => {},
      unregisterAll: () => {}
    };
  }
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

  /** Register the global hotkey. Returns true on success. */
  register(): boolean {
    const globalShortcut = getGlobalShortcutApi();
    const registered = globalShortcut.register(this.currentHotkey, () => {
      this.handleToggle();
    });

    if (!registered) {
      console.error(`[HotkeyManager] Failed to register global shortcut: ${this.currentHotkey}`);
    } else {
      console.log(`[HotkeyManager] Registered global shortcut: ${this.currentHotkey}`);
    }

    return registered;
  }

  /** Unregister the current hotkey. */
  unregister(): void {
    try {
      const globalShortcut = getGlobalShortcutApi();
      globalShortcut.unregister(this.currentHotkey);
      console.log(`[HotkeyManager] Unregistered: ${this.currentHotkey}`);
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
    if (!win) {
      this.createWindowFn?.();
      return;
    }
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  }
}
