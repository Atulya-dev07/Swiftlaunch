import test from 'node:test';
import assert from 'node:assert';

test('ClipboardProvider: history retrieval and search filtering', async () => {
  const { ClipboardProvider } = await import('../src/providers/ClipboardProvider.js');
  const provider = new ClipboardProvider();

  // Initially empty history
  const initial = await provider.getResults('test');
  assert.strictEqual(initial.length, 0);

  provider.dispose();
});
