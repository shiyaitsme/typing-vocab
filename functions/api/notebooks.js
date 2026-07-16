function normalizeNotebook(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    coverGradient: row.cover_gradient || 'purple',
    coverEmoji: row.cover_emoji || '📖',
    coverUrl: row.cover_url || '',
  };
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
    'SELECT id, name, description, cover_gradient, cover_emoji, cover_url FROM notebooks WHERE user_id=? AND mode=? ORDER BY sort_order ASC, id ASC'
  ).bind(user, mode).all();
  return Response.json(results.map(normalizeNotebook));
}

export async function onRequestPost({ request, env }) {
  const params = parseUserMode(new URL(request.url));
  if (!params) return new Response('Bad Request', { status: 400 });
  const { user, mode } = params;
  const body = await request.json().catch(() => null);
  const name = (body && body.name || '').trim();
  if (!name) return new Response('Bad Request', { status: 400 });

  const row = await env.DB.prepare(
    `INSERT INTO notebooks (user_id, mode, name, description, cover_gradient, cover_emoji, cover_url)
     VALUES (?,?,?,?,?,?,?) RETURNING id, name, description, cover_gradient, cover_emoji, cover_url`
  ).bind(
    user, mode, name,
    (body.description || '').trim(),
    body.coverGradient || 'purple',
    body.coverEmoji || '📖',
    body.coverUrl || ''
  ).first();
  return Response.json(normalizeNotebook(row));
}
