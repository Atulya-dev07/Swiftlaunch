/**
 * ScreenScanner — captures the primary display and runs local OCR.
 *
 * Uses Electron desktopCapturer to capture the screen buffer before the launcher
 * window is shown, then performs OCR using tesseract.js.
 */

import { createWorker, type Worker } from 'tesseract.js';

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      console.log('[ScreenScanner] Initializing tesseract.js worker...');
      const worker = await createWorker('eng');
      console.log('[ScreenScanner] tesseract.js worker ready');
      return worker;
    })();
  }
  return workerPromise;
}

/**
 * Capture primary display thumbnail buffer as PNG and perform OCR.
 * Returns raw extracted text and scan timestamp.
 */
export async function scanForegroundScreen(): Promise<{ rawText: string; scannedAt: number }> {
  const scannedAt = Date.now();
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electron = require('electron');
    const { desktopCapturer, screen } = electron;

    if (!desktopCapturer || !screen) {
      console.warn('[ScreenScanner] Electron desktopCapturer or screen API not available');
      return { rawText: '', scannedAt };
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;
    const scaleFactor = primaryDisplay.scaleFactor || 1;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: Math.round(width * scaleFactor),
        height: Math.round(height * scaleFactor)
      }
    });

    if (!sources || sources.length === 0) {
      console.warn('[ScreenScanner] No screen sources found');
      return { rawText: '', scannedAt };
    }

    // Match primary display or take the first source
    const displayIdStr = primaryDisplay.id.toString();
    const primarySource = sources.find((s: { display_id?: string }) => s.display_id === displayIdStr) || sources[0];

    const imageBuffer = primarySource.thumbnail.toPNG();
    if (!imageBuffer || imageBuffer.length === 0) {
      console.warn('[ScreenScanner] Empty screenshot buffer captured');
      return { rawText: '', scannedAt };
    }

    const worker = await getWorker();
    const ret = await worker.recognize(imageBuffer);
    const rawText = ret?.data?.text || '';

    return { rawText, scannedAt };
  } catch (err) {
    console.error('[ScreenScanner] Error during screen capture or OCR:', err);
    return { rawText: '', scannedAt };
  }
}

/**
 * Terminate the tesseract worker on application shutdown.
 */
export async function disposeScanner(): Promise<void> {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      await worker.terminate();
      console.log('[ScreenScanner] tesseract.js worker terminated');
    } catch (err) {
      console.error('[ScreenScanner] Error disposing worker:', err);
    } finally {
      workerPromise = null;
    }
  }
}
