/**
 * FileProvider — searches files using Everything CLI (es.exe) or fs.readdir fallback.
 *
 * Reference: Everything SDK calling convention
 * (Everything_SetSearchW → Everything_QueryW → Everything_GetNumResults →
 *  Everything_GetResultFullPathNameW)
 * Adapted to use Everything CLI (es.exe) via child_process for portability,
 * falling back to shallow fs.readdir when Everything is unavailable.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import type { Result } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';

const execFileAsync = promisify(execFile);

function getShellApi() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('electron').shell;
  } catch {
    return {
      openPath: async () => ''
    };
  }
}

export class FileProvider implements Provider {
  readonly id = 'FileProvider';
  readonly name = 'File Search';
  enabled = true;

  private everythingPath: string | null = null;
  private warningCallback: ((message: string) => void) | null = null;

  /** Set a callback to notify the frontend about fallback mode. */
  setWarningCallback(cb: (message: string) => void): void {
    this.warningCallback = cb;
  }

  async initialize(): Promise<void> {
    this.everythingPath = this.findEverythingCli();
    if (this.everythingPath) {
      console.log(`[FileProvider] Everything CLI found: ${this.everythingPath}`);
    } else {
      console.warn('[FileProvider] Everything CLI not found, using fs.readdir fallback');
      this.warningCallback?.('Everything not installed — file search is limited to common folders');
    }
  }

  async getResults(query: string): Promise<Result[]> {
    if (query.length < 2) return [];

    if (this.everythingPath) {
      return this.searchEverything(query);
    }
    return this.searchFallback(query);
  }

  async executeAction(resultId: string): Promise<void> {
    const filePath = resultId.replace('file:', '');
    const shell = getShellApi();
    await shell.openPath(filePath);
  }

  private async searchEverything(query: string): Promise<Result[]> {
    try {
      const { stdout } = await execFileAsync(this.everythingPath!, ['-n', '20', query], {
        timeout: 5000,
        windowsHide: true
      });
      const lines = stdout.split('\n').filter((l) => l.trim().length > 0);
      return lines.map((filePath, i) => {
        const trimmed = filePath.trim();
        return {
          id: `file:${trimmed}`,
          icon: this.getFileIcon(trimmed),
          title: path.basename(trimmed),
          subtitle: trimmed,
          score: 60 - i, // Score decreases with position
          providerId: this.id,
          actionId: 'open'
        };
      });
    } catch (err) {
      console.error('[FileProvider] Everything search failed:', err);
      return this.searchFallback(query);
    }
  }

  private async searchFallback(query: string): Promise<Result[]> {
    const homedir = process.env['USERPROFILE'] || '';
    const searchDirs = ['Desktop', 'Documents', 'Downloads'].map((d) => path.join(homedir, d));
    const results: Result[] = [];
    const q = query.toLowerCase();

    for (const dir of searchDirs) {
      try {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.toLowerCase().includes(q)) {
            const fullPath = path.join(dir, file);
            results.push({
              id: `file:${fullPath}`,
              icon: this.getFileIcon(fullPath),
              title: file,
              subtitle: fullPath,
              score: 50,
              providerId: this.id,
              actionId: 'open'
            });
          }
          if (results.length >= 15) break;
        }
      } catch {
        // Ignore unreadable directories
      }
      if (results.length >= 15) break;
    }
    return results;
  }

  private findEverythingCli(): string | null {
    // Check common installation paths for es.exe (Everything CLI)
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
    return null;
  }

  private getFileIcon(filePath: string): string {
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
      '.py': '🐍'
    };
    return iconMap[ext] || '📁';
  }
}
