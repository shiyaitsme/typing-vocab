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

// PATCH /api/words/:id?user=&mode= — partial update of exactly one word, by its stable
// primary key. This is the fix for the "favorite/notes lost" bug: no write here can ever
// touch a row other than the one identified by :id, so switching notebooks or toggling
// the date filter can never clobber another word's favorite/notes/SRS state.
export async function onRequestPatch({ request, env, params }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  const id = parseInt(params.id, 10);
  if (!user || (mode !== 'ko' && mode !== 'en') || !Number.isFinite(id)) return new Response('Bad Request', { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return new Response('Bad Request', { status: 400 });

  const fieldMap = { word: 'word', favorite: 'favorite', notes: 'notes', box: 'box', dueAt: 'due_at', wrongCount: 'wrong_count', notebookId: 'notebook_id' };
  if (mode === 'ko' && Object.prototype.hasOwnProperty.call(body, 'roman')) fieldMap.roman = 'meaning';
  if (mode === 'en' && Object.prototype.hasOwnProperty.call(body, 'meaning')) fieldMap.meaning = 'meaning';

  const sets = [], binds = [];
  for (const key in fieldMap) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    let val = body[key];
    if (key === 'favorite') val = val ? 1 : 0;
    sets.push(`${fieldMap[key]}=?`);
    binds.push(val);
  }
  if (sets.length === 0) return new Response('Bad Request', { status: 400 });
  binds.push(id, user, mode);

  const row = await env.DB.prepare(
    `UPDATE words SET ${sets.join(', ')} WHERE id=? AND user_id=? AND mode=?
     RETURNING id, notebook_id, created_date, word, meaning, favorite, notes, box, due_at, wrong_count`
  ).bind(...binds).first();
  if (!row) return new Response('Not Found', { status: 404 });
  return Response.json(normalizeRow(mode, row));
}

// DELETE /api/words/:id?user=&mode= — remove a single word by id.
export async function onRequestDelete({ request, env, params }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  const id = parseInt(params.id, 10);
  if (!user || (mode !== 'ko' && mode !== 'en') || !Number.isFinite(id)) return new Response('Bad Request', { status: 400 });

  await env.DB.batch([
    env.DB.prepare('DELETE FROM practice_log WHERE word_id=? AND user_id=? AND mode=?').bind(id, user, mode),
    env.DB.prepare('DELETE FROM words WHERE id=? AND user_id=? AND mode=?').bind(id, user, mode),
  ]);
  return Response.json({ ok: true });
}
