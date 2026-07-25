import test from 'node:test';
import assert from 'node:assert';

/**
 * Tests for ProviderRegistry — fan-out search and result merging.
 */

test('ProviderRegistry: registers and searches providers', async () => {
  const { ProviderRegistry } = await import('../src/providers/ProviderRegistry.js');
  const registry = new ProviderRegistry();

  // Mock provider
  const mockProvider = {
    id: 'MockProvider',
    name: 'Mock',
    enabled: true,
    getResults: async (query) => [
      { id: 'mock:1', icon: '🔍', title: `Mock result for ${query}`, subtitle: 'test', score: 50, providerId: 'MockProvider' }
    ]
  };

  registry.register(mockProvider);
  const results = await registry.search('test');
  assert.ok(results.length >= 1, 'Should return at least one result');
  assert.strictEqual(results[0].title, 'Mock result for test');
});

test('ProviderRegistry: skips disabled providers', async () => {
  const { ProviderRegistry } = await import('../src/providers/ProviderRegistry.js');
  const registry = new ProviderRegistry();

  const disabledProvider = {
    id: 'DisabledProvider',
    name: 'Disabled',
    enabled: false,
    getResults: async () => [
      { id: 'disabled:1', icon: '🔍', title: 'Should not appear', subtitle: '', score: 50 }
    ]
  };

  registry.register(disabledProvider);
  const results = await registry.search('test');
  assert.strictEqual(results.length, 0, 'Should return no results from disabled providers');
});

test('ProviderRegistry: sorts by score descending', async () => {
  const { ProviderRegistry } = await import('../src/providers/ProviderRegistry.js');
  const registry = new ProviderRegistry();

  const providerA = {
    id: 'ProviderA',
    name: 'A',
    enabled: true,
    getResults: async () => [
      { id: 'a:1', icon: '🔍', title: 'Low score', subtitle: '', score: 10 }
    ]
  };
  const providerB = {
    id: 'ProviderB',
    name: 'B',
    enabled: true,
    getResults: async () => [
      { id: 'b:1', icon: '🔍', title: 'High score', subtitle: '', score: 90 }
    ]
  };

  registry.register(providerA);
  registry.register(providerB);
  const results = await registry.search('test');
  assert.ok(results.length === 2);
  assert.strictEqual(results[0].title, 'High score');
  assert.strictEqual(results[1].title, 'Low score');
});

test('ProviderRegistry: returns empty for empty query', async () => {
  const { ProviderRegistry } = await import('../src/providers/ProviderRegistry.js');
  const registry = new ProviderRegistry();
  const results = await registry.search('');
  assert.strictEqual(results.length, 0);
});
