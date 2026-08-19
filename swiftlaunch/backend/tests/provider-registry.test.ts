import { describe, it, expect } from 'vitest';
import { ProviderRegistry } from '../src/providers/ProviderRegistry.js';
import type { ProviderContract } from '../src/providers/ProviderContract.js';

describe('ProviderRegistry', () => {
  it('registers and searches providers', async () => {
    const registry = new ProviderRegistry();

    const mockProvider: ProviderContract = {
      id: 'MockProvider',
      name: 'Mock',
      enabled: true,
      getResults: async (query: string) => [
        {
          id: 'mock:1',
          icon: '🔍',
          title: `Mock result for ${query}`,
          subtitle: 'test',
          score: 50,
          providerId: 'MockProvider'
        }
      ]
    };

    registry.register(mockProvider);
    const results = await registry.search('test');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('Mock result for test');
  });

  it('skips disabled providers', async () => {
    const registry = new ProviderRegistry();

    const disabledProvider: ProviderContract = {
      id: 'DisabledProvider',
      name: 'Disabled',
      enabled: false,
      getResults: async () => [
        { id: 'disabled:1', icon: '🔍', title: 'Should not appear', subtitle: '', score: 50 }
      ]
    };

    registry.register(disabledProvider);
    const results = await registry.search('test');
    expect(results.length).toBe(0);
  });

  it('sorts by score descending', async () => {
    const registry = new ProviderRegistry();

    const providerA: ProviderContract = {
      id: 'ProviderA',
      name: 'A',
      enabled: true,
      getResults: async () => [
        { id: 'a:1', icon: '🔍', title: 'Low score', subtitle: '', score: 10 }
      ]
    };
    const providerB: ProviderContract = {
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
    expect(results.length).toBe(2);
    expect(results[0].title).toBe('High score');
    expect(results[1].title).toBe('Low score');
  });

  it('returns empty for empty query', async () => {
    const registry = new ProviderRegistry();
    const results = await registry.search('');
    expect(results.length).toBe(0);
  });

  it('routes #files scoped query directly to FileProvider with prefix stripped', async () => {
    const registry = new ProviderRegistry();

    let receivedQuery = '';
    const fileProvider: ProviderContract = {
      id: 'FileProvider',
      name: 'File Search',
      enabled: true,
      getResults: async (query: string) => {
        receivedQuery = query;
        return [
          {
            id: `file:C:/docs/${query}.txt`,
            icon: '📄',
            title: `${query}.txt`,
            subtitle: `C:/docs/${query}.txt`,
            score: 75,
            providerId: 'FileProvider'
          }
        ];
      }
    };

    let appProviderCalled = false;
    const appProvider: ProviderContract = {
      id: 'AppProvider',
      name: 'Applications',
      enabled: true,
      getResults: async () => {
        appProviderCalled = true;
        return [
          {
            id: 'app:notepad',
            icon: '📝',
            title: 'Notepad',
            subtitle: 'notepad',
            score: 95,
            providerId: 'AppProvider'
          }
        ];
      }
    };

    registry.register(fileProvider);
    registry.register(appProvider);

    const results = await registry.search('#files document');

    expect(receivedQuery).toBe('document');
    expect(appProviderCalled).toBe(false);
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('document.txt');
    expect(results[0].providerId).toBe('FileProvider');
  });

  it('routes #file (singular) scoped query with prefix stripped', async () => {
    const registry = new ProviderRegistry();

    let receivedQuery = '';
    const fileProvider: ProviderContract = {
      id: 'FileProvider',
      name: 'File Search',
      enabled: true,
      getResults: async (query: string) => {
        receivedQuery = query;
        return [];
      }
    };

    registry.register(fileProvider);
    await registry.search('#file assignment');
    expect(receivedQuery).toBe('assignment');
  });
});
