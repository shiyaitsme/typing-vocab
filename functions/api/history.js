function normalizeWord(mode, w) {
  const out = { word: w.word, favorite: !!w.favorite, notes: w.notes || '' };
  if (mode === 'ko') out.roman = w.roman || '';
  else out.meaning = w.meaning || '';
  return out;
}

function parseUserMode(url) {
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  if (!user || (mode !== 'ko' && mode !== 'en')) return null;
  return { user, mode };
}

export async function onRequestGet({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const { results } = await env.DB.prepare(
    'SELECT date, words_json FROM history_batches WHERE user_id=? AND mode=? ORDER BY date ASC'
  ).bind(user, mode).all();
  return Response.json(results.map(r => ({ date: r.date, words: JSON.parse(r.words_json) })));
}

export async function onRequestPost({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const body = await request.json();
  if (!body || !body.date || !Array.isArray(body.words)) return new Response('Bad Request', { status: 400 });

  const wordsJson = JSON.stringify(body.words.map(w => normalizeWord(mode, w)));
  await env.DB.prepare(
    `INSERT INTO history_batches (user_id, mode, date, words_json) VALUES (?,?,?,?)
     ON CONFLICT(user_id, mode, date) DO UPDATE SET words_json=excluded.words_json`
  ).bind(user, mode, body.date, wordsJson).run();
  return Response.json({ ok: true });
}
