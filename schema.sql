-- Cloudflare D1 schema for typing-vocab cloud storage.
-- Apply with: wrangler d1 execute typing-vocab-db --remote --file=./schema.sql
--
-- This file defines the full CURRENT schema for a brand-new database — every column
-- and table a fresh install needs is inlined directly (CREATE TABLE IF NOT EXISTS is
-- safe to run any number of times). It does NOT retrofit an older, already-deployed
-- database whose tables were created before a column existed — for that, run the
-- one-time scripts under migrations/ instead (each documents which DBs need it and
-- is written to be safe to run standalone, without depending on anything in this file
-- already having failed/succeeded). wrangler d1 execute runs an entire --file as one
-- transaction: if any single statement errors (e.g. "duplicate column name" from a
-- migration that was already applied), the WHOLE file rolls back — so never rely on
-- "later statements ran anyway" when a file mixes already-applied and new migrations.

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
  wrong_count INTEGER NOT NULL DEFAULT 0,
  notebook_id INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_words_user_mode ON words(user_id, mode, sort_order);
CREATE INDEX IF NOT EXISTS idx_words_notebook_date ON words(notebook_id, created_date);

-- One row per (word, day) a word was correctly completed (Enter on a fully-correct
-- word) — this is what the 날짜별 필터 pills are built from, not words.created_date,
-- so a day with only practice and no newly-added words still gets a pill. UNIQUE lets
-- the insert just be "INSERT OR IGNORE" instead of a check-then-insert.
CREATE TABLE IF NOT EXISTS practice_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  word_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  UNIQUE(user_id, mode, word_id, date)
);
CREATE INDEX IF NOT EXISTS idx_practice_log_user_mode_date ON practice_log(user_id, mode, date);

CREATE TABLE IF NOT EXISTS notebooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_gradient TEXT NOT NULL DEFAULT 'purple',
  cover_emoji TEXT NOT NULL DEFAULT '📖',
  cover_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_mode ON notebooks(user_id, mode, sort_order);

-- history_batches is deprecated as of the notebook/date-filter redesign (see
-- notebooks table above) — the app no longer reads or writes it. Left in place
-- rather than dropped so no data is destroyed; safe to ignore. Kept here (instead of
-- only in migrations/) so a brand-new database still has the table, in case any old
-- client/script still expects it to exist.
CREATE TABLE IF NOT EXISTS history_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  date TEXT NOT NULL,
  words_json TEXT NOT NULL,
  UNIQUE(user_id, mode, date)
);
CREATE INDEX IF NOT EXISTS idx_history_user_mode ON history_batches(user_id, mode, date);
