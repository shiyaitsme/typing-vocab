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

function todayStr() {
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// POST /api/words/bulk?user=&mode= — batch import into one notebook. Only ever INSERTs
// brand-new rows (words whose text doesn't already exist in that notebook); it never
// UPDATEs an existing row, so a re-import can't step on that word's favorite/notes.
export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  if (!user || (mode !== 'ko' && mode !== 'en')) return new Response('Bad Request', { status: 400 });
  const body = await request.json().catch(() => null);
  const notebookId = body && parseInt(body.notebookId, 10);
  const items = body && Array.isArray(body.items) ? body.items : null;
  if (!Number.isFinite(notebookId) || !items) return new Response('Bad Request', { status: 400 });

  const { results: existing } = await env.DB.prepare(
    'SELECT word FROM words WHERE user_id=? AND mode=? AND notebook_id=?'
  ).bind(user, mode, notebookId).all();
  const existingWords = new Set(existing.map(r => r.word));

  const date = todayStr();
  const seen = new Set();
  const toInsert = [];
  for (const item of items) {
    const word = (item.word || '').trim();
    if (!word || existingWords.has(word) || seen.has(word)) continue;
    seen.add(word);
    const meaning = mode === 'ko' ? (item.roman || '') : (item.meaning || '');
    toInsert.push({ word, meaning });
  }
  if (toInsert.length === 0) return Response.json([]);

  const stmts = toInsert.map(item =>
    env.DB.prepare(
      `INSERT INTO words (user_id, mode, notebook_id, word, meaning, created_date)
       VALUES (?,?,?,?,?,?)
       RETURNING id, notebook_id, created_date, word, meaning, favorite, notes, box, due_at, wrong_count`
    ).bind(user, mode, notebookId, item.word, item.meaning, date)
  );
  const batchResults = await env.DB.batch(stmts);
  const rows = batchResults.map(r => r.results[0]);
  return Response.json(rows.map(r => normalizeRow(mode, r)));
}
