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

      queries.logUsage('notepad', 'app:notepad');
      queries.logUsage('notepad', 'app:notepad');
      queries.logUsage('chrome', 'app:chrome');

      const boosts = queries.getBoostScores(['app:notepad', 'app:chrome']);
      expect(boosts.has('app:notepad')).toBe(true);
      expect(boosts.get('app:notepad')!).toBeGreaterThan(boosts.get('app:chrome')!);

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
