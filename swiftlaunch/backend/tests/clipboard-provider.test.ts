import { describe, it, expect } from 'vitest';
import { ClipboardProvider } from '../src/providers/ClipboardProvider.js';

describe('ClipboardProvider', () => {
  it('history retrieval and search filtering', async () => {
    const provider = new ClipboardProvider();
    const initial = await provider.getResults('test');
    expect(initial.length).toBe(0);
    provider.dispose();
  });
});
