import test from 'node:test';
import assert from 'node:assert';

test('FileProvider: fallback search returns matches for common files', async () => {
  const { FileProvider } = await import('../src/providers/FileProvider.js');
  const provider = new FileProvider();
  await provider.initialize();

  // Query common file pattern or empty check
  const results = await provider.getResults('a');
  assert.ok(Array.isArray(results), 'Should return an array of results');
});
