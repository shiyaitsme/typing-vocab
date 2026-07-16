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

export async function onRequestPatch({ request, env, params }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const id = parseInt(params.id, 10);
  if (!user || !Number.isFinite(id)) return new Response('Bad Request', { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return new Response('Bad Request', { status: 400 });

  const fieldMap = { name: 'name', description: 'description', coverGradient: 'cover_gradient', coverEmoji: 'cover_emoji', coverUrl: 'cover_url' };
  const sets = [], binds = [];
  for (const key in fieldMap) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      sets.push(`${fieldMap[key]}=?`);
      binds.push(key === 'name' || key === 'description' ? String(body[key]).trim() : String(body[key]));
    }
  }
  if (sets.length === 0) return new Response('Bad Request', { status: 400 });
  binds.push(id, user);

  const row = await env.DB.prepare(
    `UPDATE notebooks SET ${sets.join(', ')} WHERE id=? AND user_id=?
     RETURNING id, name, description, cover_gradient, cover_emoji, cover_url`
  ).bind(...binds).first();
  if (!row) return new Response('Not Found', { status: 404 });
  return Response.json(normalizeNotebook(row));
}

export async function onRequestDelete({ request, env, params }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const id = parseInt(params.id, 10);
  if (!user || !Number.isFinite(id)) return new Response('Bad Request', { status: 400 });

  await env.DB.batch([
    env.DB.prepare('DELETE FROM words WHERE notebook_id=? AND user_id=?').bind(id, user),
    env.DB.prepare('DELETE FROM notebooks WHERE id=? AND user_id=?').bind(id, user),
  ]);
  return Response.json({ ok: true });
}
