import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { PluginLoader } from '../src/plugin-host/PluginLoader.js';

describe('PluginLoader', () => {
  it('loads example plugin manifest and executes search', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftlaunch-plugin-test-'));
    const pluginDir = path.join(tmpDir, 'google-search');
    fs.mkdirSync(pluginDir, { recursive: true });

    const manifest = {
      id: 'google-search',
      name: 'Google Search',
      version: '1.0.0',
      main: 'index.js'
    };

    const script = `
      const { parentPort } = require('worker_threads');
      parentPort.on('message', (msg) => {
        if (msg.type === 'search') {
          parentPort.postMessage({
            type: 'results',
            items: [{ id: 'google:test', title: 'Search Google', subtitle: 'test', score: 30 }]
          });
        }
      });
    `;

    fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify(manifest));
    fs.writeFileSync(path.join(pluginDir, 'index.js'), script);

    try {
      const loader = new PluginLoader(tmpDir);
      await loader.loadAll();

      const manifests = loader.getManifests();
      expect(manifests.length).toBe(1);
      expect(manifests[0].id).toBe('google-search');

      const results = await loader.search('test');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].title).toBe('Search Google');

      loader.disposeAll();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
