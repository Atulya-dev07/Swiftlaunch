import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { initDatabase, closeDatabase } from '../src/db/schema.js';
import { DbQueries } from '../src/db/queries.js';

describe('Database & DbQueries', () => {
  it('initializes and creates tables', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
    try {
      const db = initDatabase(tmpDir);
      expect(db).toBeDefined();
      expect(Array.isArray(db.Data.usage_frequency)).toBe(true);
      expect(Array.isArray(db.Data.clipboard_history)).toBe(true);
      expect(Array.isArray(db.Data.quicklinks)).toBe(true);
      closeDatabase();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('logs and retrieves usage', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
    try {
      const db = initDatabase(tmpDir);
      const queries = new DbQueries(db);

      queries.logUsage('calc', 'calc:2+2');
      queries.logUsage('calc', 'calc:2+2');
      queries.logUsage('calc', 'calc:3+3');

      const boosts = queries.getBoostScores(['calc:2+2', 'calc:3+3']);
      expect(boosts.has('calc:2+2')).toBe(true);
      expect(boosts.get('calc:2+2')!).toBeGreaterThan(boosts.get('calc:3+3')!);

      closeDatabase();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('clipboard history dedup', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
    try {
      const db = initDatabase(tmpDir);
      const queries = new DbQueries(db);

      queries.addClipboardEntry('hello', 'text');
      queries.addClipboardEntry('hello', 'text'); // duplicate, should be ignored
      queries.addClipboardEntry('world', 'text');

      const history = queries.getClipboardHistory(10);
      expect(history.length).toBe(2);

      closeDatabase();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('quicklinks CRUD', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-test-'));
    try {
      const db = initDatabase(tmpDir);
      const queries = new DbQueries(db);

      queries.addQuickLink('gh', 'https://github.com', 'url');
      queries.addQuickLink('gg', 'https://google.com', 'url');

      let links = queries.getQuickLinks();
      expect(links.length).toBe(2);

      queries.removeQuickLink('gg');
      links = queries.getQuickLinks();
      expect(links.length).toBe(1);
      expect(links[0].alias).toBe('gh');

      closeDatabase();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
