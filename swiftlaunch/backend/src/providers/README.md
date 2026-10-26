# Backend Search Providers

This directory implements the **Provider Pattern** for extensible, concurrent search.

## Overview
Every provider implements the `Provider` contract defined in [`ProviderContract.ts`](ProviderContract.ts):
```ts
export interface Provider {
  readonly id: string;
  readonly name: string;
  enabled: boolean;
  initialize?(): Promise<void>;
  search(query: string): Promise<Result[]>;
  executeAction?(resultId: string, actionId?: string): Promise<void>;
  dispose?(): void;
}
```

## Providers
- **`AppProvider.ts`**: Discovers installed Windows applications by scanning Start Menu `.lnk` shortcuts, extracts executable paths, and handles app execution via `shell.openPath()`.
- **`FileProvider.ts`**: Windows file search. Leverages the Voidtools Everything CLI (`es.exe`) for fast NTFS indexing, falling back gracefully to recursive filesystem traversal when Everything is not installed.
- **`ProviderRegistry.ts`**: Coordinates providers, routes scoped queries (such as `#files`), and fans out searches concurrently using `Promise.allSettled()`.
