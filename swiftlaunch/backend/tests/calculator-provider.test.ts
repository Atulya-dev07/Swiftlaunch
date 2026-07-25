import test from 'node:test';
import assert from 'node:assert';

/**
 * Tests for CalculatorProvider — evaluates math expressions via mathjs.
 */
test('CalculatorProvider: evaluates 12*4 = 48', async () => {
  const { CalculatorProvider } = await import('../src/providers/CalculatorProvider.js');
  const provider = new CalculatorProvider();
  const results = await provider.getResults('12*4');
  assert.ok(results.length >= 1, 'Should return at least one result');
  assert.strictEqual(results[0].title, '48');
  assert.ok(results[0].subtitle.includes('48'));
});

test('CalculatorProvider: evaluates sqrt(9) = 3', async () => {
  const { CalculatorProvider } = await import('../src/providers/CalculatorProvider.js');
  const provider = new CalculatorProvider();
  const results = await provider.getResults('sqrt(9)');
  assert.ok(results.length >= 1, 'Should return at least one result');
  assert.strictEqual(results[0].title, '3');
});

test('CalculatorProvider: evaluates 2+2 = 4', async () => {
  const { CalculatorProvider } = await import('../src/providers/CalculatorProvider.js');
  const provider = new CalculatorProvider();
  const results = await provider.getResults('2+2');
  assert.ok(results.length >= 1);
  assert.strictEqual(results[0].title, '4');
});

test('CalculatorProvider: ignores plain text', async () => {
  const { CalculatorProvider } = await import('../src/providers/CalculatorProvider.js');
  const provider = new CalculatorProvider();
  const results = await provider.getResults('hello');
  assert.strictEqual(results.length, 0, 'Should return no results for plain text');
});

test('CalculatorProvider: ignores invalid expressions', async () => {
  const { CalculatorProvider } = await import('../src/providers/CalculatorProvider.js');
  const provider = new CalculatorProvider();
  const results = await provider.getResults('12*');
  assert.strictEqual(results.length, 0, 'Should return no results for incomplete expression');
});

test('CalculatorProvider: has score 100', async () => {
  const { CalculatorProvider } = await import('../src/providers/CalculatorProvider.js');
  const provider = new CalculatorProvider();
  const results = await provider.getResults('5*5');
  assert.ok(results.length >= 1);
  assert.strictEqual(results[0].score, 100);
});
