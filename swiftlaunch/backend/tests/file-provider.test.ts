import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { FileProvider, FALLBACK_WARNING_MESSAGE } from '../src/providers/FileProvider.js';

describe('FileProvider', () => {
  let tempDir: string;
  let originalUserProfile: string | undefined;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-file-test-'));
    originalUserProfile = process.env['USERPROFILE'];
    process.env['USERPROFILE'] = tempDir;

    // Create realistic folder structure in temp home directory
    fs.mkdirSync(path.join(tempDir, 'Desktop'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'Documents', 'SubDir'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'Downloads'), { recursive: true });

    // Create sample files
    fs.writeFileSync(path.join(tempDir, 'Desktop', 'Budget2026.xlsx'), 'test');
    fs.writeFileSync(path.join(tempDir, 'Documents', 'SubDir', 'ProjectNotes.txt'), 'test');
    fs.writeFileSync(path.join(tempDir, 'Downloads', 'Report-Final.pdf'), 'test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env['USERPROFILE'] = originalUserProfile;
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('handles es.exe available + results returned', async () => {
    const provider = new FileProvider();
    provider.setEsPath('C:\\Program Files\\Everything\\es.exe');

    const mockStdout = [
      'C:\\Users\\test\\Desktop\\Budget2026.xlsx',
      'C:\\Users\\test\\Documents\\ProjectNotes.txt'
    ].join('\n');

    const mockExecFile = vi.fn().mockResolvedValue({ stdout: mockStdout, stderr: '' });
    provider.setExecFileFn(mockExecFile);

    const results = await provider.getResults('Budget');
    expect(mockExecFile).toHaveBeenCalledWith(
      'C:\\Program Files\\Everything\\es.exe',
      ['-n', '50', '-sort', 'date-modified-descending', 'Budget'],
      { timeout: 2000, windowsHide: true }
    );
    expect(results.length).toBe(2);
    expect(results[0]?.title).toBe('Budget2026.xlsx');
    expect(results[0]?.subtitle).toBe('C:\\Users\\test\\Desktop\\Budget2026.xlsx');
    expect(results[0]?.providerId).toBe('FileProvider');
  });

  it('handles es.exe available + zero results without error', async () => {
    const provider = new FileProvider();
    provider.setEsPath('C:\\Program Files\\Everything\\es.exe');

    const mockExecFile = vi.fn().mockResolvedValue({ stdout: '', stderr: '' });
    provider.setExecFileFn(mockExecFile);

    const results = await provider.getResults('NonExistentTermXYZ');
    expect(results.length).toBe(0);
  });

  it('handles es.exe not found and triggers fallback recursive search', async () => {
    const provider = new FileProvider();
    const warningSpy = vi.fn();
    provider.setWarningCallback(warningSpy);

    // esPath is null
    provider.setEsPath(null);

    const results = await provider.getResults('Budget');
    expect(results.length).toBeGreaterThan(0);
    const budgetMatch = results.find((r) => r.title.includes('Budget2026.xlsx'));
    expect(budgetMatch).toBeDefined();
    expect(budgetMatch?.subtitle).toBe(path.join(tempDir, 'Desktop', 'Budget2026.xlsx'));

    // Check updated warning message
    expect(warningSpy).toHaveBeenCalledWith(FALLBACK_WARNING_MESSAGE);
  });

  it('handles es.exe times out / fails and triggers fallback recursive search', async () => {
    const provider = new FileProvider();
    const warningSpy = vi.fn();
    provider.setWarningCallback(warningSpy);
    provider.setEsPath('C:\\Program Files\\Everything\\es.exe');

    // Mock execFile throwing / timing out
    const mockExecFile = vi.fn().mockRejectedValue(new Error('Command timed out after 2000ms'));
    provider.setExecFileFn(mockExecFile);

    const results = await provider.getResults('ProjectNotes');
    expect(results.length).toBeGreaterThan(0);
    const notesMatch = results.find((r) => r.title.includes('ProjectNotes.txt'));
    expect(notesMatch).toBeDefined();
    expect(notesMatch?.subtitle).toBe(path.join(tempDir, 'Documents', 'SubDir', 'ProjectNotes.txt'));
    expect(warningSpy).toHaveBeenCalledWith(FALLBACK_WARNING_MESSAGE);
  });

  it('finds nested files recursively in fallback mode', async () => {
    const provider = new FileProvider();
    provider.setEsPath(null);

    const results = await provider.getResults('ProjectNotes');
    expect(results.length).toBeGreaterThan(0);
    const notesMatch = results.find((r) => r.title.includes('ProjectNotes.txt'));
    expect(notesMatch).toBeDefined();
    expect(notesMatch?.subtitle).toBe(path.join(tempDir, 'Documents', 'SubDir', 'ProjectNotes.txt'));
  });

  it('executes open and reveal-in-explorer actions without throwing', async () => {
    const provider = new FileProvider();
    const testFile = path.join(tempDir, 'Desktop', 'Budget2026.xlsx');

    // Open action
    await expect(provider.executeAction(`file:${testFile}`, 'open')).resolves.toBeUndefined();

    // Reveal in Explorer action
    await expect(provider.executeAction(`file:${testFile}`, 'show_in_folder')).resolves.toBeUndefined();

    // Non-existent path handling
    const nonExistentFile = path.join(tempDir, 'does-not-exist.txt');
    await expect(provider.executeAction(`file:${nonExistentFile}`, 'open')).resolves.toBeUndefined();
    await expect(provider.executeAction(`file:${nonExistentFile}`, 'show_in_folder')).resolves.toBeUndefined();
  });
});
