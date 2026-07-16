export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  const oldUser = (body && body.oldUser || '').trim();
  const newUser = (body && body.newUser || '').trim();
  if (!oldUser || !newUser || oldUser === newUser) {
    return new Response('Bad Request', { status: 400 });
  }

  const existing = await env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM words WHERE user_id=?'
  ).bind(newUser).first();
  if (existing && existing.cnt > 0) {
    return Response.json({ ok: false, error: 'target_exists' }, { status: 409 });
  }

  await env.DB.batch([
    env.DB.prepare('UPDATE words SET user_id=? WHERE user_id=?').bind(newUser, oldUser),
    env.DB.prepare('UPDATE notebooks SET user_id=? WHERE user_id=?').bind(newUser, oldUser),
    env.DB.prepare('UPDATE history_batches SET user_id=? WHERE user_id=?').bind(newUser, oldUser),
  ]);
  return Response.json({ ok: true });
}
