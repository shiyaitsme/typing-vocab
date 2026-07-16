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
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_words_user_mode ON words(user_id, mode, sort_order);

CREATE TABLE IF NOT EXISTS history_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  date TEXT NOT NULL,
  words_json TEXT NOT NULL,
  UNIQUE(user_id, mode, date)
);
CREATE INDEX IF NOT EXISTS idx_history_user_mode ON history_batches(user_id, mode, date);
