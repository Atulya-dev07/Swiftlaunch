import { describe, it, expect } from 'vitest';
import { HotkeyManager } from '../src/window-manager/HotkeyManager.js';

describe('HotkeyManager', () => {
  it('hotkey string management', () => {
    const manager = new HotkeyManager('Alt+Space');
    expect(manager.getHotkey()).toBe('Alt+Space');
  });
});
