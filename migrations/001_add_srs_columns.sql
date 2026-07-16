-- One-time migration for a database created before spaced-repetition (box/due_at/
-- wrong_count) existed. Not needed for a brand-new database — schema.sql already
-- inlines these columns in CREATE TABLE words. Only run this against an existing,
-- already-deployed database that predates SRS.
-- Apply with: wrangler d1 execute typing-vocab-db --remote --file=./migrations/001_add_srs_columns.sql
--
-- SQLite's ALTER TABLE ADD COLUMN has no "IF NOT EXISTS" form — re-running this file
-- after the columns already exist will error with "duplicate column name" (harmless,
-- just means it's already migrated; nothing later in this file depends on it).
ALTER TABLE words ADD COLUMN box INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN due_at TEXT NOT NULL DEFAULT '';
ALTER TABLE words ADD COLUMN wrong_count INTEGER NOT NULL DEFAULT 0;
