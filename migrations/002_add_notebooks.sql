-- One-time migration: custom "notebooks" + per-word created_date, replacing the old
-- numeric sort-order / history_batches design. Not needed for a brand-new database —
-- schema.sql already creates the notebooks table and the notebook_id/created_date
-- columns directly. Only run this against an existing, already-deployed database that
-- predates notebooks.
-- Apply with: wrangler d1 execute typing-vocab-db --remote --file=./migrations/002_add_notebooks.sql
--
-- Written to be safe to run standalone against production, independent of whether
-- migrations/001_add_srs_columns.sql has ever been run on this database (it doesn't
-- touch box/due_at/wrong_count at all) — see schema.sql's header for why that
-- independence matters (wrangler runs a whole --file as one transaction).

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

-- SQLite's ALTER TABLE ADD COLUMN has no "IF NOT EXISTS" form — re-running this file
-- after the columns already exist will error with "duplicate column name" (harmless,
-- just means it's already migrated).
ALTER TABLE words ADD COLUMN notebook_id INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN created_date TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_words_notebook_date ON words(notebook_id, created_date);

-- Backfill: give every (user, mode) that has orphaned words (notebook_id=0, i.e. words
-- that existed before notebooks did) exactly one default notebook, and point those
-- words at it. Guarded by notebook_id=0 / NOT EXISTS so it's safe to run more than once.
INSERT INTO notebooks (user_id, mode, name, description, cover_gradient, cover_emoji, sort_order)
SELECT DISTINCT user_id, mode,
  CASE mode WHEN 'ko' THEN '기본 단어장' ELSE 'My Wordbook' END,
  '', 'purple', '📖', 0
FROM words
WHERE notebook_id = 0
  AND NOT EXISTS (SELECT 1 FROM notebooks n WHERE n.user_id = words.user_id AND n.mode = words.mode);

UPDATE words
SET notebook_id = (
  SELECT n.id FROM notebooks n
  WHERE n.user_id = words.user_id AND n.mode = words.mode
  ORDER BY n.id ASC LIMIT 1
)
WHERE notebook_id = 0;

-- Backfill created_date for pre-existing words from history_batches (best-effort: match
-- by word text within the same user+mode, take the earliest date it appeared under).
-- SQLite's JSON1 (json_each) is available in D1. Words with no match fall back to today.
UPDATE words
SET created_date = (
  SELECT MIN(hb.date) FROM history_batches hb, json_each(hb.words_json) je
  WHERE hb.user_id = words.user_id AND hb.mode = words.mode
    AND json_extract(je.value, '$.word') = words.word
)
WHERE created_date = ''
  AND EXISTS (
    SELECT 1 FROM history_batches hb, json_each(hb.words_json) je
    WHERE hb.user_id = words.user_id AND hb.mode = words.mode
      AND json_extract(je.value, '$.word') = words.word
  );

UPDATE words SET created_date = date('now') WHERE created_date = '';
