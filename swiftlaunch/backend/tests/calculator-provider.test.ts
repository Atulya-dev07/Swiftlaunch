import { describe, it, expect } from 'vitest';
import { CalculatorProvider } from '../src/providers/CalculatorProvider.js';

describe('CalculatorProvider', () => {
  it('evaluates 12*4 = 48', async () => {
    const provider = new CalculatorProvider();
    const results = await provider.getResults('12*4');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('48');
    expect(results[0].subtitle).toContain('48');
  });

  it('evaluates sqrt(9) = 3', async () => {
    const provider = new CalculatorProvider();
    const results = await provider.getResults('sqrt(9)');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('3');
  });

  it('evaluates 2+2 = 4', async () => {
    const provider = new CalculatorProvider();
    const results = await provider.getResults('2+2');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('4');
  });

  it('ignores plain text', async () => {
    const provider = new CalculatorProvider();
    const results = await provider.getResults('hello');
    expect(results.length).toBe(0);
  });

  it('ignores invalid expressions', async () => {
    const provider = new CalculatorProvider();
    const results = await provider.getResults('12*');
    expect(results.length).toBe(0);
  });

  it('has score 100', async () => {
    const provider = new CalculatorProvider();
    const results = await provider.getResults('5*5');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].score).toBe(100);
  });
});
