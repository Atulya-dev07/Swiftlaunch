import test from 'node:test';
import assert from 'node:assert';

test('HotkeyManager: hotkey string management', async () => {
  const { HotkeyManager } = await import('../src/window-manager/HotkeyManager.js');
  const manager = new HotkeyManager('Alt+Space');

  assert.strictEqual(manager.getHotkey(), 'Alt+Space');
});
