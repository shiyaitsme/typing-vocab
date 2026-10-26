// GET /api/dict?q=사랑 — Korean dictionary lookup, proxied server-side.
//
// Primary source is 국립국어원 한국어기초사전 (KRDict) Open API: it's built for learners,
// has a 초급/중급/고급 word grade, and ships per-sense English AND Chinese translations,
// which is exactly what this app's users want next to a word. It needs a free API key,
// read from the KRDICT_KEY environment variable (Cloudflare Pages → Settings →
// Variables and Secrets). The call has to go through this function rather than straight
// from the browser for two reasons: the key would otherwise be visible in page source,
// and KRDict sends no CORS headers, so a browser fetch would be blocked anyway.
//
// If KRDICT_KEY isn't set yet (or KRDict errors out), we fall back to English
// Wiktionary's keyless REST API so the lookup button still does something useful the
// day this ships — it has English glosses only, no Chinese, no word grade.
//
// Response shape is the same for both sources, so the client never branches on it:
//   { source: 'krdict'|'wiktionary', q, entries: [{ word, supNo, pos, grade,
//     pronunciation, link, senses: [{ definition, en, enDfn, zh, zhDfn }] }], notice? }
//
// No ?user= here on purpose: this handler touches no table, so there's nothing to
// isolate per account.

const KRDICT_URL = 'https://krdict.korean.go.kr/api/search';
const WIKTIONARY_URL = 'https://en.wiktionary.org/api/rest_v1/page/definition/';
// Dictionary entries basically never change; a week of edge cache keeps us far below
// KRDict's 50,000 calls/day quota even if everyone looks up the same 단어장.
const CACHE_TTL = 60 * 60 * 24 * 7;

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q || q.length > 50) return new Response('Bad Request', { status: 400 });

  // Cache key deliberately omits the API key, so rotating the key doesn't orphan the
  // cache and the key never ends up in a cache entry's URL.
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = new Request(`${url.origin}/api/dict?q=${encodeURIComponent(q)}&v=1`);
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  let result = null, notice;
  if (env.KRDICT_KEY) {
    try { result = await lookupKrdict(q, env.KRDICT_KEY); }
    catch (err) { notice = String(err && err.message || err); }
  } else {
    notice = 'no_key';
  }
  if (!result) {
    try { result = await lookupWiktionary(q); }
    catch (err) { return Response.json({ error: 'lookup_failed', notice }, { status: 502 }); }
  }
  if (notice) result.notice = notice;

  const res = Response.json(result, { headers: { 'Cache-Control': `public, max-age=${CACHE_TTL}` } });
  // Only cache real KRDict answers: a Wiktionary fallback is cached nowhere, so the
  // moment KRDICT_KEY is configured every word switches over to the better source.
  if (cache && result.source === 'krdict') {
    const put = cache.put(cacheKey, res.clone());
    if (waitUntil) waitUntil(put); else await put;
  }
  return res;
}

async function lookupKrdict(q, key) {
  // KRDict returns translations for one trans_lang per request (1 = 영어, 11 = 중국어),
  // so ask twice in parallel and merge by (entry, sense order).
  const [en, zh] = await Promise.all([fetchKrdict(q, key, 1), fetchKrdict(q, key, 11)]);
  const zhByKey = new Map();
  for (const item of zh) for (const s of item.senses) zhByKey.set(`${item.code}:${s.order}`, s);

  const entries = en.map(item => ({
    word: item.word, supNo: item.supNo, pos: item.pos, grade: item.grade,
    pronunciation: item.pronunciation, link: item.link,
    senses: item.senses.map(s => {
      const z = zhByKey.get(`${item.code}:${s.order}`);
      return {
        definition: s.definition,
        en: s.transWord, enDfn: s.transDfn,
        zh: z ? z.transWord : '', zhDfn: z ? z.transDfn : '',
      };
    }),
  }));
  return { source: 'krdict', q, entries };
}

async function fetchKrdict(q, key, transLang) {
  const params = new URLSearchParams({
    key, q, part: 'word', sort: 'dict', num: '10',
    translated: 'y', trans_lang: String(transLang),
  });
  const res = await fetch(`${KRDICT_URL}?${params}`, { headers: { Accept: 'application/xml' } });
  if (!res.ok) throw new Error(`krdict_http_${res.status}`);
  const xml = await res.text();

  // KRDict reports a bad/unregistered key as HTTP 200 with an <error> body.
  const errCode = tag(xml, 'error_code');
  if (errCode) throw new Error(`krdict_error_${errCode}: ${tag(xml, 'message')}`);

  // Workers have no DOMParser. The XML is flat and machine-generated, so a few
  // non-greedy regexes are enough and avoid shipping an XML parser dependency.
  return blocks(xml, 'item').map(item => ({
    code: tag(item, 'target_code'),
    word: tag(item, 'word'),
    supNo: parseInt(tag(item, 'sup_no'), 10) || 0,
    pos: tag(item, 'pos'),
    grade: tag(item, 'word_grade'),
    pronunciation: tag(item, 'pronunciation'),
    link: tag(item, 'link'),
    senses: blocks(item, 'sense').map(sense => {
      const tr = blocks(sense, 'translation')[0] || '';
      return {
        order: tag(sense, 'sense_order'),
        definition: tag(sense, 'definition'),
        transWord: tag(tr, 'trans_word'),
        transDfn: tag(tr, 'trans_dfn'),
      };
    }),
  }));
}

function blocks(xml, name) {
  const re = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

function tag(xml, name) {
  const m = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(xml);
  if (!m) return '';
  let v = m[1].trim();
  const cdata = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(v);
  if (cdata) v = cdata[1];
  else v = decodeEntities(v);
  return v.trim();
}

function decodeEntities(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, '&');
}

async function lookupWiktionary(q) {
  // Wikimedia rejects requests without an identifying User-Agent.
  const res = await fetch(WIKTIONARY_URL + encodeURIComponent(q), {
    headers: { 'User-Agent': 'typing-vocab/1.0 (https://typing-vocab.pages.dev)', Accept: 'application/json' },
  });
  if (res.status === 404) return { source: 'wiktionary', q, entries: [] };
  if (!res.ok) throw new Error(`wiktionary_http_${res.status}`);
  const data = await res.json();
  const entries = (data.ko || []).map(e => ({
    word: q, supNo: 0, pos: e.partOfSpeech || '', grade: '', pronunciation: '',
    link: `https://en.wiktionary.org/wiki/${encodeURIComponent(q)}#Korean`,
    senses: (e.definitions || [])
      .map(d => ({ definition: '', en: stripHtml(d.definition), enDfn: '', zh: '', zhDfn: '' }))
      .filter(s => s.en),
  })).filter(e => e.senses.length);
  return { source: 'wiktionary', q, entries };
}

function stripHtml(s) {
  return decodeEntities(String(s || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}
