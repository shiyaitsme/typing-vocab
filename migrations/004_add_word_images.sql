-- One-time migration: images inside word notes (see schema.sql's word_images comment for
-- why the bytes live in their own table instead of inline in words.notes). Not needed for
-- a brand-new database — schema.sql already creates this table. Only run this against an
-- existing, already-deployed database that predates note images.
-- Apply with: wrangler d1 execute typing-vocab-db --remote --file=./migrations/004_add_word_images.sql
--
-- Safe to run standalone and more than once: it only uses CREATE ... IF NOT EXISTS, so it
-- never errors the way an ALTER TABLE ADD COLUMN migration does on a second run, and it
-- doesn't depend on any earlier migration having been applied.

CREATE TABLE IF NOT EXISTS word_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('ko','en')),
  word_id INTEGER NOT NULL,
  mime TEXT NOT NULL DEFAULT 'image/jpeg',
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_word_images_word ON word_images(user_id, mode, word_id);
