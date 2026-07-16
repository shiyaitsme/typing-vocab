function normalizeRow(mode, row) {
  const out = { word: row.word, favorite: !!row.favorite, notes: row.notes || '' };
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

export async function onRequestGet({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const { results } = await env.DB.prepare(
    'SELECT word, meaning, favorite, notes FROM words WHERE user_id=? AND mode=? ORDER BY sort_order ASC'
  ).bind(user, mode).all();
  return Response.json(results.map(r => normalizeRow(mode, r)));
}

export async function onRequestPut({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const body = await request.json();
  if (!Array.isArray(body)) return new Response('Bad Request', { status: 400 });

  const stmts = [env.DB.prepare('DELETE FROM words WHERE user_id=? AND mode=?').bind(user, mode)];
  body.forEach((item, i) => {
    const meaning = mode === 'ko' ? (item.roman || '') : (item.meaning || '');
    stmts.push(
      env.DB.prepare(
        'INSERT INTO words (user_id, mode, word, meaning, favorite, notes, sort_order) VALUES (?,?,?,?,?,?,?)'
      ).bind(user, mode, item.word, meaning, item.favorite ? 1 : 0, item.notes || '', i)
    );
  });
  await env.DB.batch(stmts);
  return Response.json({ ok: true, count: body.length });
}
