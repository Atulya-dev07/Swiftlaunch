/**
 * CalculatorProvider — evaluates arithmetic and unit conversions via mathjs.
 *
 * Reference: ueli CalculatorExtension
 * (github.com/oliverschwendener/ueli — src/main/Extensions/Calculator/CalculatorExtension.ts)
 * Adapted trigger detection: input starts with digit, '(', '.', or '-' followed by digit.
 * Uses mathjs.evaluate() for full expression support.
 */

import { evaluate } from 'mathjs';
import type { Result } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';

/** Pattern to detect math-like input */
const MATH_TRIGGER = /^[\d(.\-+]|^(sqrt|abs|sin|cos|tan|log|ceil|floor|round|pow)/i;
/** Pattern to reject pure alphabetic words (not math) */
const PURE_WORD = /^[a-zA-Z]+$/;

export class CalculatorProvider implements Provider {
  readonly id = 'CalculatorProvider';
  readonly name = 'Calculator';
  enabled = true;

  async getResults(query: string): Promise<Result[]> {
    // Skip if query doesn't look like math
    if (!MATH_TRIGGER.test(query) || PURE_WORD.test(query)) {
      return [];
    }

    try {
      const result = evaluate(query);

      // Skip if result is a function, undefined, or not displayable
      if (result === undefined || result === null || typeof result === 'function') {
        return [];
      }

      const resultStr = String(result);

      // Skip if result is same as input (trivial evaluation)
      if (resultStr === query.trim()) {
        return [];
      }

      return [
        {
          id: `calc:${query}`,
          icon: '🧮',
          title: resultStr,
          subtitle: `${query} = ${resultStr}`,
          score: 100, // Calculator results always on top when triggered
          providerId: this.id,
          actionId: 'copy'
        }
      ];
    } catch {
      // Expression couldn't be evaluated — not a valid math expression
      return [];
    }
  }

  async executeAction(): Promise<void> {
    // Copy result to clipboard — handled by IPC layer
  }
}
