function normalizeRow(mode, row) {
  const out = {
    id: row.id, notebookId: row.notebook_id, createdDate: row.created_date,
    word: row.word, favorite: !!row.favorite, notes: row.notes || '',
    box: row.box || 0, dueAt: row.due_at || '', wrongCount: row.wrong_count || 0,
  };
  if (mode === 'ko') out.roman = row.meaning;
  else out.meaning = row.meaning;
  return out;
}

function parseUserMode(url) {
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  if (!user || (mode !== 'ko' && mode !== 'en')) return null;
  return { user, mode };
}

function todayStr() {
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// GET /api/words?user=&mode= — every word for this user+mode, across all notebooks.
// The frontend groups them by notebookId/createdDate client-side; this is the same
// "load everything once" shape the app already used, just with a stable id per row now.
export async function onRequestGet({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const { results } = await env.DB.prepare(
    'SELECT id, notebook_id, created_date, word, meaning, favorite, notes, box, due_at, wrong_count FROM words WHERE user_id=? AND mode=? ORDER BY id ASC'
  ).bind(user, mode).all();
  return Response.json(results.map(r => normalizeRow(mode, r)));
}

// POST /api/words?user=&mode= — add a single word to a notebook. created_date comes from
// the client's local date (Workers run in UTC, which would otherwise misfile words added
// near local midnight in Korea/China under the wrong day — see README); a missing/malformed
// value falls back to the worker's own UTC today for older clients. A word's date never
// gets rewritten by client-side merge logic once set.
export async function onRequestPost({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const body = await request.json().catch(() => null);
  const word = (body && body.word || '').trim();
  const notebookId = body && parseInt(body.notebookId, 10);
  if (!word || !Number.isFinite(notebookId)) return new Response('Bad Request', { status: 400 });
  const meaning = mode === 'ko' ? (body.roman || '') : (body.meaning || '');
  const createdDate = /^\d{4}-\d{2}-\d{2}$/.test(body.createdDate || '') ? body.createdDate : todayStr();

  const row = await env.DB.prepare(
    `INSERT INTO words (user_id, mode, notebook_id, word, meaning, created_date)
     VALUES (?,?,?,?,?,?)
     RETURNING id, notebook_id, created_date, word, meaning, favorite, notes, box, due_at, wrong_count`
  ).bind(user, mode, notebookId, word, meaning, createdDate).first();
  return Response.json(normalizeRow(mode, row));
}

// DELETE /api/words?user=&mode=&notebook= — clear every word in one notebook ("초기화").
export async function onRequestDelete({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const notebookId = parseInt(new URL(request.url).searchParams.get('notebook'), 10);
  if (!Number.isFinite(notebookId)) return new Response('Bad Request', { status: 400 });

  await env.DB.batch([
    env.DB.prepare(
      'DELETE FROM practice_log WHERE user_id=? AND mode=? AND word_id IN (SELECT id FROM words WHERE user_id=? AND mode=? AND notebook_id=?)'
    ).bind(user, mode, user, mode, notebookId),
    env.DB.prepare('DELETE FROM words WHERE user_id=? AND mode=? AND notebook_id=?').bind(user, mode, notebookId),
  ]);
  return Response.json({ ok: true });
}
