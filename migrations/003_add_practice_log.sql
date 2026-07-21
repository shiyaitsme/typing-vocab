-- One-time migration: add practice_log, the table the 날짜별 필터 pills are built from.
-- Not needed for a brand-new database — schema.sql already creates this table directly.
-- Only run this against an existing, already-deployed database that predates it.
-- Apply with: wrangler d1 execute typing-vocab-db --remote --file=./migrations/003_add_practice_log.sql
--
-- Just a CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS pair, no ALTER TABLE
-- involved, so safe to run standalone and safe to re-run.

CREATE TABLE IF NOT EXISTS practice_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  word_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  UNIQUE(user_id, mode, word_id, date)
);
CREATE INDEX IF NOT EXISTS idx_practice_log_user_mode_date ON practice_log(user_id, mode, date);
