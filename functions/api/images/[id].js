function decodeBase64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// GET /api/images/:id?user=&mode= — serves the raw image. A row's bytes are never
// rewritten (editing a note replaces the id, it doesn't mutate an existing image), so
// the response is immutable and the browser only ever fetches each one once.
export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  const id = parseInt(params.id, 10);
  if (!user || (mode !== 'ko' && mode !== 'en') || !Number.isFinite(id)) return new Response('Bad Request', { status: 400 });

  const row = await env.DB.prepare('SELECT mime, data FROM word_images WHERE id=? AND user_id=? AND mode=?')
    .bind(id, user, mode).first();
  if (!row) return new Response('Not Found', { status: 404 });

  return new Response(decodeBase64(row.data), {
    headers: {
      'Content-Type': row.mime || 'image/jpeg',
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}

// DELETE /api/images/:id?user=&mode= — called when an image is removed from a note, so
// dropped images don't linger in the database.
export async function onRequestDelete({ request, env, params }) {
  const url = new URL(request.url);
  const user = (url.searchParams.get('user') || '').trim();
  const mode = url.searchParams.get('mode');
  const id = parseInt(params.id, 10);
  if (!user || (mode !== 'ko' && mode !== 'en') || !Number.isFinite(id)) return new Response('Bad Request', { status: 400 });

  await env.DB.prepare('DELETE FROM word_images WHERE id=? AND user_id=? AND mode=?').bind(id, user, mode).run();
  return Response.json({ ok: true });
}
