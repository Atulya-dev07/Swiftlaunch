import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { ProviderRegistry } from '../src/providers/ProviderRegistry.js';
import { FileProvider } from '../src/providers/FileProvider.js';
import { AppProvider } from '../src/providers/AppProvider.js';
import { CalculatorProvider } from '../src/providers/CalculatorProvider.js';
import { ClipboardProvider } from '../src/providers/ClipboardProvider.js';

describe('End-to-End Search Pipeline Trace', () => {
  let tempDir: string;
  let originalUserProfile: string | undefined;
  let registry: ProviderRegistry;
  let fileProvider: FileProvider;
  let appProvider: AppProvider;
  let calcProvider: CalculatorProvider;
  let clipProvider: ClipboardProvider;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-e2e-'));
    originalUserProfile = process.env['USERPROFILE'];
    process.env['USERPROFILE'] = tempDir;

    // Create folder structure with unique test files
    fs.mkdirSync(path.join(tempDir, 'Desktop'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'Documents'), { recursive: true });

    fs.writeFileSync(path.join(tempDir, 'Documents', 'important_document.pdf'), 'document contents');
    fs.writeFileSync(path.join(tempDir, 'Desktop', 'assignment_final.docx'), 'assignment contents');
    fs.writeFileSync(path.join(tempDir, 'Documents', 'SwiftLaunch_Unique_Config.json'), '{}');

    registry = new ProviderRegistry();
    fileProvider = new FileProvider();
    fileProvider.setEsPath(null); // use fallback search for deterministic filesystem testing
    appProvider = new AppProvider();
    calcProvider = new CalculatorProvider();
    clipProvider = new ClipboardProvider();

    registry.register(fileProvider);
    registry.register(appProvider);
    registry.register(calcProvider);
    registry.register(clipProvider);

    await registry.initializeAll();
  });

  afterEach(() => {
    registry.disposeAll();
    process.env['USERPROFILE'] = originalUserProfile;
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('Trace 1: "#files document" routes exclusively to FileProvider and finds important_document.pdf', async () => {
    console.log('\n--- Trace 1: Query="#files document" ---');
    const results = await registry.search('#files document');
    console.log(`Results returned: ${results.length}`);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.providerId === 'FileProvider')).toBe(true);
    expect(results.some((r) => r.title.includes('important_document.pdf'))).toBe(true);
  });

  it('Trace 2: "#files assignment" routes exclusively to FileProvider and finds assignment_final.docx', async () => {
    console.log('\n--- Trace 2: Query="#files assignment" ---');
    const results = await registry.search('#files assignment');
    console.log(`Results returned: ${results.length}`);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.providerId === 'FileProvider')).toBe(true);
    expect(results.some((r) => r.title.includes('assignment_final.docx'))).toBe(true);
  });

  it('Trace 3: Unique filename "SwiftLaunch_Unique_Config" is found in general search', async () => {
    console.log('\n--- Trace 3: Query="SwiftLaunch_Unique_Config" ---');
    const results = await registry.search('SwiftLaunch_Unique_Config');
    console.log(`Results returned: ${results.length}`);
    expect(results.length).toBeGreaterThan(0);
    const match = results.find((r) => r.title.includes('SwiftLaunch_Unique_Config.json'));
    expect(match).toBeDefined();
    expect(match?.providerId).toBe('FileProvider');
  });
});
