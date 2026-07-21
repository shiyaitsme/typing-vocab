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

// GET /api/practice-log?user=&mode= — every (wordId, date) pair this user has correctly
// completed a word on, for this mode. The frontend derives the 날짜별 필터 pills and the
// date-filtered word list from this together with words.created_date (see README), so a
// day with only practice and no newly-added words still shows up.
export async function onRequestGet({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const { results } = await env.DB.prepare(
    'SELECT word_id, date FROM practice_log WHERE user_id=? AND mode=?'
  ).bind(user, mode).all();
  return Response.json(results.map(r => ({ wordId: r.word_id, date: r.date })));
}

// POST /api/practice-log?user=&mode= — record that `wordId` was correctly completed on
// the client's local date (same UTC-vs-local reasoning as /api/words), falling back to
// the worker's own UTC today if missing/malformed. Deduped per (user, mode, word, date)
// via the table's UNIQUE constraint, so this is safe to call more than once a day.
export async function onRequestPost({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const body = await request.json().catch(() => null);
  const wordId = body && parseInt(body.wordId, 10);
  if (!Number.isFinite(wordId)) return new Response('Bad Request', { status: 400 });
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : todayStr();

  await env.DB.prepare(
    'INSERT OR IGNORE INTO practice_log (user_id, mode, word_id, date) VALUES (?,?,?,?)'
  ).bind(user, mode, wordId, date).run();
  return Response.json({ ok: true, date });
}
