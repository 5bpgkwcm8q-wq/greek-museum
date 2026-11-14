const MET = 'https://collectionapi.metmuseum.org/public/collection/v1';
const GREEK_DEPT = 13;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}
function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); }
  catch { /* ignore */ }
}

async function get(url, key) {
  const cached = cacheGet(key);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const data = await res.json();
  cacheSet(key, data);
  return data;
}

export async function getGreekIds() {
  const d = await get(`${MET}/objects?departmentIds=${GREEK_DEPT}`, 'ids_greek');
  return d.objectIDs || [];
}

export function getExhibit(id) {
  return get(`${MET}/objects/${id}`, `obj_${id}`);
}

export async function getBatch(ids, limit = 24, offset = 0) {
  const slice = ids.slice(offset, offset + limit);
  const out = [];
  for (let i = 0; i < slice.length; i += 5) {
    const part = await Promise.all(
      slice.slice(i, i + 5).map(id => getExhibit(id).catch(() => null))
    );
    out.push(...part.filter(x => x && x.primaryImageSmall));
  }
  return out;
}