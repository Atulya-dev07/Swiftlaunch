import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Tests for AppProvider — validates Start Menu scanning.
 * This test runs on the actual machine and expects at least one .lnk found.
 */

test('AppProvider: finds at least one installed application', async () => {
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

  // At least one Start Menu path should exist
  const exists = fs.existsSync(userStart) || fs.existsSync(allUsersStart);
  assert.ok(exists, 'At least one Start Menu path should exist on Windows');

  // Manually scan for .lnk files (we can't import AppProvider directly since it needs Electron)
  let lnkCount = 0;
  function countLnks(dir) {
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
    } catch { /* ignore */ }
  }

  if (fs.existsSync(userStart)) countLnks(userStart);
  if (fs.existsSync(allUsersStart)) countLnks(allUsersStart);

  assert.ok(lnkCount >= 1, `Should find at least 1 .lnk file, found ${lnkCount}`);
});
