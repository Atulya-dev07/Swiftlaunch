/**
 * Provider interface for SwiftLaunch search providers.
 *
 * Reference: ueli Extension contract
 * (github.com/oliverschwendener/ueli — src/main/Core/Extension/Contract/Extension.ts)
 * Adapted to a simpler shape for our provider architecture.
 */

import type { Result } from '@swiftlaunch/shared';

export interface Provider {
  /** Unique identifier for this provider (e.g. "AppProvider") */
  readonly id: string;

  /** Human-readable display name */
  readonly name: string;

  /** Whether this provider is currently enabled */
  enabled: boolean;

  /**
   * Return search results matching the given query.
   * Implementations should score results (0–100) for ranking.
   */
  getResults(query: string): Promise<Result[]>;

  /**
   * Execute an action on a result (e.g. launch app, copy to clipboard).
   * Optional — providers that only display information can skip this.
   */
  executeAction?(resultId: string, actionId?: string): Promise<void>;

  /**
   * Called once during startup to allow providers to initialize caches,
   * file watchers, etc.
   */
  initialize?(): Promise<void>;

  /**
   * Called during shutdown for cleanup (close watchers, DB connections, etc.)
   */
  dispose?(): void;
}
