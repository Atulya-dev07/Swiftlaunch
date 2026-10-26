# SQLite Database Layer

This directory manages the embedded local SQLite database using `better-sqlite3`.

## Files
- **`schema.ts`**: Initializes the database in the user's application data directory (`app.getPath('userData')`). Creates tables and indexes:
  - `usage_history`: Records past queries, selected result IDs, and timestamps.
  - `quick_links`: User-defined URL/file aliases.
  - `settings`: Key-value application configurations (e.g. theme, hotkey).
- **`queries.ts`**: Encapsulates typed query operations (`DbQueries` class), including frequency-based boost score calculations (`getBoostScores()`).
