/**
 * FileProvider — searches files using Everything CLI (es.exe) via child_process,
 * falling back to recursive filesystem search when Everything is unavailable.
 */

import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import type { Result } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';

const execFileAsync = promisify(execFile);

export type ExecFileFn = (
  file: string,
  args: string[],
  options: { timeout?: number; windowsHide?: boolean }
) => Promise<{ stdout: string; stderr: string }>;

export const FALLBACK_WARNING_MESSAGE =
  "Everything not detected — install Everything and enable 'Everything Service' in its settings for full-device instant search. Using slower fallback search for now.";

function getShellApi() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electron = require('electron');
    if (electron && typeof electron === 'object' && electron.shell) {
      return electron.shell;
    }
    return {
      openPath: async () => '',
      showItemInFolder: () => { }
    };
  } catch {
    return {
      openPath: async () => '',
      showItemInFolder: () => { }
    };
  }
}

export class FileProvider implements Provider {
  readonly id = 'FileProvider';
  readonly name = 'File Search';
  enabled = true;

  private esPath: string | null = null;
  private execFileFn: ExecFileFn = execFileAsync as unknown as ExecFileFn;
  private warningCallback: ((message: string) => void) | null = null;
  private fallbackWarningSent = false;

  /** Set a callback to notify the frontend about fallback mode. */
  setWarningCallback(cb: (message: string) => void): void {
    this.warningCallback = cb;
  }

  /** Allow setting custom es.exe path (useful for testing) */
  setEsPath(customPath: string | null): void {
    this.esPath = customPath;
  }

  /** Allow injecting a custom execFile function for testing */
  setExecFileFn(fn: ExecFileFn | null): void {
    this.execFileFn = fn || (execFileAsync as unknown as ExecFileFn);
  }

  async initialize(): Promise<void> {
    this.esPath = this.findEverythingCli();
    if (this.esPath) {
      console.log(`[FileProvider] Everything CLI (es.exe) found at: ${this.esPath}`);
    } else {
      console.warn('[FileProvider] Everything CLI (es.exe) not found, using recursive filesystem search fallback.');
      this.notifyFallbackWarning();
    }
  }

  async getResults(query: string): Promise<Result[]> {
    console.log(`[FileProvider] Query received: "${query}"`);
    if (!query || query.trim().length < 2) {
      console.log('[FileProvider] Query shorter than 2 chars, returning empty array');
      return [];
    }
    const trimmed = query.trim();

    if (this.esPath) {
      try {
        console.log(`[FileProvider] Mode: Everything CLI (${this.esPath})`);
        const results = await this.searchEverythingCli(trimmed);
        if (results !== null) {
          const samplePaths = results.slice(0, 3).map((r) => r.subtitle);
          console.log(`[FileProvider] Everything CLI returned ${results.length} results. First 3 paths:`, samplePaths);
          return results;
        }
      } catch (err) {
        console.error('[FileProvider] Everything CLI search failed:', err);
      }
      console.warn('[FileProvider] Everything service not responding — falling back to filesystem search');
      this.notifyFallbackWarning();
      console.log('[FileProvider] Mode: Recursive filesystem fallback (service unresponsive)');
      const fbResults = await this.searchFallback(trimmed);
      const samplePaths = fbResults.slice(0, 3).map((r) => r.subtitle);
      console.log(`[FileProvider] Fallback returned ${fbResults.length} results. First 3 paths:`, samplePaths);
      return fbResults;
    }

    console.warn('[FileProvider] Everything CLI not found — falling back to filesystem search');
    console.log('[FileProvider] Mode: Recursive filesystem fallback (no es.exe)');
    this.notifyFallbackWarning();
    const fbResults = await this.searchFallback(trimmed);
    const samplePaths = fbResults.slice(0, 3).map((r) => r.subtitle);
    console.log(`[FileProvider] Fallback returned ${fbResults.length} results. First 3 paths:`, samplePaths);
    return fbResults;
  }

  async executeAction(resultId: string, actionId?: string): Promise<void> {
    const filePath = resultId.startsWith('file:') ? resultId.slice(5) : resultId;
    const shell = getShellApi();

    if (actionId === 'show_in_folder' || actionId === 'reveal' || actionId === 'open_folder') {
      if (!fs.existsSync(filePath)) {
        console.error(`[FileProvider] Path does not exist for Reveal in Explorer: ${filePath}`);
        return;
      }
      try {
        shell.showItemInFolder(filePath);
      } catch (err) {
        console.error(`[FileProvider] shell.showItemInFolder failed for ${filePath}:`, err);
      }
      return;
    }

    // Default action: Open
    if (!fs.existsSync(filePath)) {
      console.error(`[FileProvider] Path does not exist for Open: ${filePath}`);
      return;
    }

    try {
      const errorMsg = await shell.openPath(filePath);
      if (errorMsg) {
        console.error(`[FileProvider] shell.openPath failed for ${filePath}: ${errorMsg}`);
      }
    } catch (err) {
      console.error(`[FileProvider] shell.openPath threw error for ${filePath}:`, err);
    }
  }

  private notifyFallbackWarning(): void {
    if (!this.fallbackWarningSent) {
      this.fallbackWarningSent = true;
      this.warningCallback?.(FALLBACK_WARNING_MESSAGE);
    }
  }

  private async searchEverythingCli(query: string): Promise<Result[] | null> {
    if (!this.esPath) return null;

    try {
      const { stdout } = await this.execFileFn(
        this.esPath,
        ['-n', '50', '-sort', 'date-modified-descending', query],
        {
          timeout: 2000,
          windowsHide: true
        }
      );

      const lines = stdout
        .split('\n')
        .map((l) => l.trim().replace(/\r$/, ''))
        .filter((l) => l.length > 0);

      return lines.map((filePath, i) => ({
        id: `file:${filePath}`,
        icon: this.getFileIcon(filePath),
        title: path.basename(filePath),
        subtitle: filePath,
        score: 80 - i,
        providerId: this.id,
        actionId: 'open'
      }));
    } catch (err) {
      console.error('[FileProvider] Everything CLI exec failed or timed out:', err);
      return null;
    }
  }

  private async searchFallback(query: string): Promise<Result[]> {
    const homedir = process.env['USERPROFILE'] || process.env['HOME'] || '';
    if (!homedir) return [];

    const searchRoots = [
      { dir: path.join(homedir, 'Desktop'), maxDepth: 3 },
      { dir: path.join(homedir, 'Documents'), maxDepth: 3 },
      { dir: path.join(homedir, 'Downloads'), maxDepth: 3 },
      { dir: homedir, maxDepth: 1 }
    ];

    const results: Result[] = [];
    const seenPaths = new Set<string>();
    const q = query.toLowerCase();

    const ignoredNames = new Set([
      'node_modules',
      '.git',
      '.vscode',
      '.gemini',
      '.agents',
      '.system_generated',
      'AppData',
      'Application Data',
      '$Recycle.Bin',
      'Local Settings',
      'Temp',
      'Windows',
      'System Volume Information'
    ]);

    const traverse = (currentDir: string, currentDepth: number, maxDepth: number) => {
      if (results.length >= 25 || currentDepth > maxDepth) return;
      if (!fs.existsSync(currentDir)) return;

      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch {
        return; // Ignore permission / unreadable directory errors
      }

      for (const entry of entries) {
        if (results.length >= 25) break;

        const name = entry.name;
        if (name.startsWith('.') && name !== '.' && name !== '..') continue;
        if (ignoredNames.has(name)) continue;

        const fullPath = path.join(currentDir, name);
        if (seenPaths.has(fullPath.toLowerCase())) continue;

        const lowerName = name.toLowerCase();
        if (lowerName.includes(q)) {
          seenPaths.add(fullPath.toLowerCase());
          let score = 50;
          if (lowerName === q) {
            score = 85;
          } else if (lowerName.startsWith(q)) {
            score = 70;
          } else {
            score = Math.max(30, 60 - currentDepth * 10);
          }

          results.push({
            id: `file:${fullPath}`,
            icon: this.getFileIcon(fullPath),
            title: name,
            subtitle: fullPath,
            score,
            providerId: this.id,
            actionId: 'open'
          });
        }

        if (entry.isDirectory() && currentDepth < maxDepth) {
          traverse(fullPath, currentDepth + 1, maxDepth);
        }
      }
    };

    for (const { dir, maxDepth } of searchRoots) {
      if (results.length >= 25) break;
      traverse(dir, 0, maxDepth);
    }

    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return results;
  }

  private findEverythingCli(): string | null {
    const candidates = [
      'C:\\Program Files\\Everything\\es.exe',
      'C:\\Program Files (x86)\\Everything\\es.exe',
      path.join(process.env['LOCALAPPDATA'] || '', 'Everything', 'es.exe')
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    // Fallback: check PATH via `where es`
    try {
      const stdout = execSync('where es', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 1000 });
      const firstLine = stdout.split('\n')[0]?.trim();
      if (firstLine && fs.existsSync(firstLine)) {
        return firstLine;
      }
    } catch {
      // Not found in PATH
    }

    return null;
  }

  /**
   * Get common/recent indexable files from Desktop, Documents, and Downloads.
   */
  getIndexableFiles(): { id: string; label: string; path: string }[] {
    const homedir = process.env['USERPROFILE'] || process.env['HOME'] || '';
    if (!homedir) return [];

    const dirs = [
      path.join(homedir, 'Desktop'),
      path.join(homedir, 'Documents'),
      path.join(homedir, 'Downloads')
    ];

    const results: { id: string; label: string; path: string }[] = [];
    const seen = new Set<string>();

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const fullPath = path.join(dir, entry.name);
          if (seen.has(fullPath.toLowerCase())) continue;
          seen.add(fullPath.toLowerCase());

          results.push({
            id: `file:${fullPath}`,
            label: entry.name,
            path: fullPath
          });

          if (results.length >= 100) break;
        }
      } catch {
        // Ignore unreadable dirs
      }
    }

    return results;
  }

  getFileIcon(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const iconMap: Record<string, string> = {
      '.exe': '⚙️',
      '.pdf': '📄',
      '.doc': '📝',
      '.docx': '📝',
      '.xls': '📊',
      '.xlsx': '📊',
      '.ppt': '📽️',
      '.pptx': '📽️',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.png': '🖼️',
      '.gif': '🖼️',
      '.mp3': '🎵',
      '.mp4': '🎬',
      '.zip': '📦',
      '.rar': '📦',
      '.txt': '📃',
      '.js': '💛',
      '.ts': '💙',
      '.py': '🐍',
      '.json': '📋',
      '.md': '📖'
    };
    return iconMap[ext] || '📁';
  }
}
