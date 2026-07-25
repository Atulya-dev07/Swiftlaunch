import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

/**
 * Tests for DB schema initialization and queries.
 */

test('Database: initializes and creates tables', async () => {
  const { initDatabase, closeDatabase } = await import('../src/db/schema.js');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
  try {
    const db = initDatabase(tmpDir);
    assert.ok(db, 'Database should be created');
    assert.ok(Array.isArray(db.Data.usage_frequency));
    assert.ok(Array.isArray(db.Data.clipboard_history));
    assert.ok(Array.isArray(db.Data.quicklinks));
    closeDatabase();
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('DbQueries: logs and retrieves usage', async () => {
  const { initDatabase, closeDatabase } = await import('../src/db/schema.js');
  const { DbQueries } = await import('../src/db/queries.js');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
  try {
    const db = initDatabase(tmpDir);
    const queries = new DbQueries(db);

    queries.logUsage('calc', 'calc:2+2');
    queries.logUsage('calc', 'calc:2+2');
    queries.logUsage('calc', 'calc:3+3');

    const boosts = queries.getBoostScores(['calc:2+2', 'calc:3+3']);
    assert.ok(boosts.has('calc:2+2'), 'Should have boost for calc:2+2');
    assert.ok(boosts.get('calc:2+2')! > boosts.get('calc:3+3')!, 'More frequent result should have higher boost');

    closeDatabase();
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('DbQueries: clipboard history dedup', async () => {
  const { initDatabase, closeDatabase } = await import('../src/db/schema.js');
  const { DbQueries } = await import('../src/db/queries.js');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
  try {
    const db = initDatabase(tmpDir);
    const queries = new DbQueries(db);

    queries.addClipboardEntry('hello', 'text');
    queries.addClipboardEntry('hello', 'text'); // duplicate, should be ignored
    queries.addClipboardEntry('world', 'text');

    const history = queries.getClipboardHistory(10);
    assert.strictEqual(history.length, 2, 'Should have 2 entries after dedup');

    closeDatabase();
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('DbQueries: quicklinks CRUD', async () => {
  const { initDatabase, closeDatabase } = await import('../src/db/schema.js');
  const { DbQueries } = await import('../src/db/queries.js');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
  try {
    const db = initDatabase(tmpDir);
    const queries = new DbQueries(db);

    queries.addQuickLink('gh', 'https://github.com', 'url');
    queries.addQuickLink('gg', 'https://google.com', 'url');

    let links = queries.getQuickLinks();
    assert.strictEqual(links.length, 2);

    queries.removeQuickLink('gg');
    links = queries.getQuickLinks();
    assert.strictEqual(links.length, 1);
    assert.strictEqual(links[0].alias, 'gh');

    closeDatabase();
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
