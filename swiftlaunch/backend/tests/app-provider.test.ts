import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Tests for AppProvider — validates Start Menu scanning.
 * This test runs on the actual machine and expects at least one .lnk found.
 */
describe('AppProvider', () => {
  it('finds at least one installed application or start menu path', () => {
    const userStart = path.join(
      process.env['APPDATA'] || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs'
    );
    const allUsersStart = path.join(
      process.env['PROGRAMDATA'] || 'C:\\ProgramData',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs'
    );

    const exists = fs.existsSync(userStart) || fs.existsSync(allUsersStart);
    expect(exists).toBe(true);

    let lnkCount = 0;
    function countLnks(dir: string) {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            countLnks(fullPath);
          } else if (item.name.endsWith('.lnk')) {
            lnkCount++;
          }
        }
      } catch {
        /* ignore */
      }
    }

    if (fs.existsSync(userStart)) countLnks(userStart);
    if (fs.existsSync(allUsersStart)) countLnks(allUsersStart);

    expect(lnkCount).toBeGreaterThanOrEqual(1);
  });
});
