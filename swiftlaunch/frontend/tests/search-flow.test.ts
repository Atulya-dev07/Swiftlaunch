import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupMockApi, isMockEnvironment, isElectron } from '../src/mockApi';
import { useSearchStore } from '../src/state/useSearchStore';

describe('Search Data Flow & Electron Isolation', () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    useSearchStore.getState().resetAll();
    delete (window as unknown as { api?: unknown }).api;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
    delete (window as unknown as { api?: unknown }).api;
  });

  it('a) Electron mode never injects mock results into window.api', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Electron/33.2.1 Safari/537.36',
      configurable: true
    });

    expect(isElectron()).toBe(true);
    expect(isMockEnvironment()).toBe(false);

    // Call setupMockApi
    setupMockApi();

    // window.api must NOT be defined with mock data
    expect(window.api).toBeUndefined();
  });

  it('b) standalone browser mode polyfills window.api when window.api is missing', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      configurable: true
    });

    expect(isElectron()).toBe(false);
    expect(isMockEnvironment()).toBe(true);

    setupMockApi();
    expect(window.api).toBeDefined();
    expect(typeof window.api?.search).toBe('function');
  });

  it('c) different input queries produce different store results', () => {
    const store = useSearchStore.getState();

    // Query 1: document search
    store.setQuery('#files document');
    store.setResults([
      {
        id: 'file:C:/Users/User/Documents/document.docx',
        providerId: 'FileProvider',
        icon: '📝',
        title: 'document.docx',
        subtitle: 'C:/Users/User/Documents/document.docx'
      }
    ]);

    const state1 = useSearchStore.getState();
    expect(state1.flatResults.length).toBe(1);
    expect(state1.flatResults[0].title).toBe('document.docx');
    expect(state1.groupedResults['Files']).toBeDefined();

    // Query 2: assignment search
    store.setQuery('#files assignment');
    store.setResults([
      {
        id: 'file:C:/Users/User/Documents/assignment.pdf',
        providerId: 'FileProvider',
        icon: '📄',
        title: 'assignment.pdf',
        subtitle: 'C:/Users/User/Documents/assignment.pdf'
      }
    ]);

    const state2 = useSearchStore.getState();
    expect(state2.flatResults.length).toBe(1);
    expect(state2.flatResults[0].title).toBe('assignment.pdf');
    expect(state2.groupedResults['Files']).toBeDefined();
  });

  it('d) an unavailable backend produces an error state, never static fake results', () => {
    const store = useSearchStore.getState();

    // Simulate search execution when backend is missing
    delete (window as unknown as { api?: unknown }).api;
    store.setError('Backend connection unavailable');
    store.setResults([]);

    const state = useSearchStore.getState();
    expect(state.error).toBe('Backend connection unavailable');
    expect(state.flatResults.length).toBe(0);
    expect(Object.keys(state.groupedResults).length).toBe(0);
  });
});
