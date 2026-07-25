/**
 * Google Search Plugin for SwiftLaunch.
 *
 * Example plugin that demonstrates the worker_thread plugin architecture.
 * Returns a "Search Google for: <query>" result that opens the default browser.
 */

const { parentPort } = require('worker_threads');

parentPort.on('message', (message) => {
  if (message.type === 'search') {
    const query = message.query;
    if (!query || query.trim().length === 0) {
      parentPort.postMessage({ type: 'results', items: [] });
      return;
    }

    parentPort.postMessage({
      type: 'results',
      items: [
        {
          id: `google:${query}`,
          icon: '🔍',
          title: `Search Google for: ${query}`,
          subtitle: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          score: 30,
          actionId: 'open-url'
        }
      ]
    });
  }
});
