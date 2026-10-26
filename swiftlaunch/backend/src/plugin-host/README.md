# Plugin Host

This directory contains the runtime environment for loading and running third-party SwiftLaunch plugins.

## Files
- **`PluginLoader.ts`**: Discovers plugin packages from `userData/plugins` and workspace directories. Reads `plugin.json` manifests, registers action keywords, and handles queries.
- **`PluginSdk.ts`**: Provides the execution sandbox and communication interface passed to plugin modules.
