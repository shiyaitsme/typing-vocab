-- Cloudflare D1 schema for typing-vocab cloud storage.
-- Apply with: wrangler d1 execute typing-vocab-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  word TEXT NOT NULL,
  meaning TEXT NOT NULL DEFAULT '',
  favorite INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  box INTEGER NOT NULL DEFAULT 0,
  due_at TEXT NOT NULL DEFAULT '',
  wrong_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_words_user_mode ON words(user_id, mode, sort_order);

-- Safe to re-run on a database created before box/due_at/wrong_count existed
-- (requires SQLite 3.35+ / D1, which both support ADD COLUMN IF NOT EXISTS).
ALTER TABLE words ADD COLUMN IF NOT EXISTS box INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN IF NOT EXISTS due_at TEXT NOT NULL DEFAULT '';
ALTER TABLE words ADD COLUMN IF NOT EXISTS wrong_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS history_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  date TEXT NOT NULL,
  words_json TEXT NOT NULL,
  UNIQUE(user_id, mode, date)
);
CREATE INDEX IF NOT EXISTS idx_history_user_mode ON history_batches(user_id, mode, date);
