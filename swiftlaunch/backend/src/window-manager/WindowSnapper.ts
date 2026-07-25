/**
 * WindowSnapper — snap/maximize/center the foreground window via Win32 API.
 *
 * Uses PowerShell with Add-Type P/Invoke to call user32.dll SetWindowPos and
 * GetForegroundWindow. This avoids native addon build dependencies (ffi-napi)
 * while using the exact same Win32 API functions.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// PowerShell helper that loads user32.dll bindings
const PS_PREAMBLE = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinAPI {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
}
"@
`;

const SWP_NOZORDER = '0x0004';

export type SnapDirection = 'left' | 'right' | 'maximize' | 'center';

export class WindowSnapper {
  /** Snap the currently focused (foreground) window. */
  async snap(direction: SnapDirection): Promise<void> {
    switch (direction) {
      case 'left':
        return this.snapLeftRight('left');
      case 'right':
        return this.snapLeftRight('right');
      case 'maximize':
        return this.maximize();
      case 'center':
        return this.center();
    }
  }

  private async snapLeftRight(side: 'left' | 'right'): Promise<void> {
    // Get screen dimensions and snap to left or right half
    const xExpr = side === 'left' ? '0' : '($sw / 2)';
    const script = `
${PS_PREAMBLE}
$hwnd = [WinAPI]::GetForegroundWindow()
$sw = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Width
$sh = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Height
[WinAPI]::ShowWindow($hwnd, 9) | Out-Null
[WinAPI]::SetWindowPos($hwnd, [IntPtr]::Zero, ${xExpr}, 0, ($sw / 2), $sh, ${SWP_NOZORDER}) | Out-Null
`;
    await this.runPS(script);
  }

  private async maximize(): Promise<void> {
    const script = `
${PS_PREAMBLE}
$hwnd = [WinAPI]::GetForegroundWindow()
[WinAPI]::ShowWindow($hwnd, 3) | Out-Null
`;
    await this.runPS(script);
  }

  private async center(): Promise<void> {
    const script = `
${PS_PREAMBLE}
$hwnd = [WinAPI]::GetForegroundWindow()
$rect = New-Object WinAPI+RECT
[WinAPI]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
$ww = $rect.Right - $rect.Left
$wh = $rect.Bottom - $rect.Top
$sw = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Width
$sh = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Height
$x = ($sw - $ww) / 2
$y = ($sh - $wh) / 2
[WinAPI]::SetWindowPos($hwnd, [IntPtr]::Zero, $x, $y, $ww, $wh, ${SWP_NOZORDER}) | Out-Null
`;
    await this.runPS(script);
  }

  private async runPS(script: string): Promise<void> {
    try {
      // Add System.Windows.Forms for screen info
      const fullScript = 'Add-Type -AssemblyName System.Windows.Forms\n' + script;
      await execAsync(`powershell -NoProfile -NonInteractive -Command "${fullScript.replace(/"/g, '\\"')}"`, {
        timeout: 5000,
        windowsHide: true
      });
    } catch (err) {
      console.error('[WindowSnapper] Failed:', err);
    }
  }
}
