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

// word,뜻 조각을 세미콜론으로 합친다 — 이미 들어있는 조각이면 다시 안 붙인다.
function mergeMeaning(existingMeaning, newMeaning) {
  const parts = existingMeaning ? existingMeaning.split(/;\s*/).map(s => s.trim()).filter(Boolean) : [];
  if (newMeaning && !parts.includes(newMeaning)) parts.push(newMeaning);
  return parts.join('; ');
}

// POST /api/words/bulk?user=&mode= — batch import into one notebook. A word whose text
// doesn't exist yet in this notebook gets INSERTed; a word that already exists gets its
// meaning MERGED into the existing row's meaning (never overwritten) instead of creating
// a duplicate entry — favorite/notes/box/due_at/wrong_count on that row are untouched.
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
    'SELECT id, word, meaning FROM words WHERE user_id=? AND mode=? AND notebook_id=?'
  ).bind(user, mode, notebookId).all();
  const existingByWord = new Map(existing.map(r => [r.word, { id: r.id, meaning: r.meaning || '' }]));

  // Client's local date, same UTC-vs-local reasoning as functions/api/words.js.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.createdDate || '') ? body.createdDate : todayStr();
  const newByWord = new Map(); // brand-new word (possibly repeated in this batch) -> merged meaning
  const toUpdate = new Map(); // existing row id -> merged meaning
  for (const item of items) {
    const word = (item.word || '').trim();
    if (!word) continue;
    const meaning = mode === 'ko' ? (item.roman || '') : (item.meaning || '');
    const ex = existingByWord.get(word);
    if (ex) {
      const current = toUpdate.has(ex.id) ? toUpdate.get(ex.id) : ex.meaning;
      const merged = mergeMeaning(current, meaning);
      if (merged !== current) toUpdate.set(ex.id, merged);
      continue;
    }
    newByWord.set(word, mergeMeaning(newByWord.get(word) || '', meaning));
  }

  const insertStmts = Array.from(newByWord, ([word, meaning]) =>
    env.DB.prepare(
      `INSERT INTO words (user_id, mode, notebook_id, word, meaning, created_date)
       VALUES (?,?,?,?,?,?)
       RETURNING id, notebook_id, created_date, word, meaning, favorite, notes, box, due_at, wrong_count`
    ).bind(user, mode, notebookId, word, meaning, date)
  );
  const updateStmts = Array.from(toUpdate, ([id, meaning]) =>
    env.DB.prepare(
      `UPDATE words SET meaning=? WHERE id=?
       RETURNING id, notebook_id, created_date, word, meaning, favorite, notes, box, due_at, wrong_count`
    ).bind(meaning, id)
  );

  const [insertResults, updateResults] = await Promise.all([
    insertStmts.length ? env.DB.batch(insertStmts) : Promise.resolve([]),
    updateStmts.length ? env.DB.batch(updateStmts) : Promise.resolve([]),
  ]);
  const inserted = insertResults.map(r => normalizeRow(mode, r.results[0]));
  const merged = updateResults.map(r => normalizeRow(mode, r.results[0]));
  return Response.json({ inserted, merged });
}
