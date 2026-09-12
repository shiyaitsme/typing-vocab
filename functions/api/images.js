// Note images. The bytes never travel with the word list — words.notes only carries
// <img data-img-id="N">, and the browser pulls each image separately from
// GET /api/images/:id, which is immutably cached. See schema.sql for the rationale.

// D1 caps one row at ~2MB. base64 inflates bytes by 4/3, so this ceiling is ~1MB of
// actual image — far above what the client's downscale-to-1280px JPEG pass produces
// (typically 100-300KB), but it keeps a hand-crafted request from wedging a row that
// D1 would then refuse to write.
export const MAX_IMAGE_B64_LENGTH = 1400000;
export const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// POST /api/images?user=&mode= — body {wordId, mime, data}, where data is bare base64
// with no "data:" prefix. Returns {id, wordId, mime} — the id is what gets written into
// the note HTML.
export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  if (!user || (mode !== 'ko' && mode !== 'en')) return new Response('Bad Request', { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return new Response('Bad Request', { status: 400 });
  const wordId = parseInt(body.wordId, 10);
  const mime = typeof body.mime === 'string' ? body.mime : '';
  const data = typeof body.data === 'string' ? body.data : '';
  if (!Number.isFinite(wordId) || !ALLOWED_IMAGE_MIME.has(mime) || !data) return new Response('Bad Request', { status: 400 });
  if (data.length > MAX_IMAGE_B64_LENGTH) return new Response('Payload Too Large', { status: 413 });
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) return new Response('Bad Request', { status: 400 });

  // Only attach to a word this user actually owns, so an image can never be parented to
  // (and later served through) somebody else's row.
  const owner = await env.DB.prepare('SELECT id FROM words WHERE id=? AND user_id=? AND mode=?')
    .bind(wordId, user, mode).first();
  if (!owner) return new Response('Not Found', { status: 404 });

  const row = await env.DB.prepare(
    'INSERT INTO word_images (user_id, mode, word_id, mime, data) VALUES (?, ?, ?, ?, ?) RETURNING id, word_id, mime'
  ).bind(user, mode, wordId, mime, data).first();
  return Response.json({ id: row.id, wordId: row.word_id, mime: row.mime });
}
