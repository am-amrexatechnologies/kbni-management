// ── Config ────────────────────────────────────────────────────────────────
// VITE_API_BASE in .env setzen, wenn Backend auf anderem Server läuft.
const BASE = import.meta.env.VITE_API_BASE ?? ''

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
  }
  if (body) opts.body = JSON.stringify(body)
  const res  = await fetch(BASE + path, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const login  = (u, p) => request('POST', '/auth/login',  { username: u, password: p })
export const logout = ()      => request('POST', '/auth/logout', {})

// ── Users ─────────────────────────────────────────────────────────────────
export const getUsers    = ()      => request('GET',    '/users')
export const createUser  = (d)     => request('POST',   '/users', d)
export const updateUser  = (id, d) => request('PUT',    `/users/${id}`, d)
export const deleteUser  = (id)    => request('DELETE', `/users/${id}`)

// ── Anime ─────────────────────────────────────────────────────────────────
export const getAnime    = ()      => request('GET',    '/anime')
export const createAnime = (d)     => request('POST',   '/anime', d)
export const updateAnime = (id, d) => request('PUT',    `/anime/${id}`, d)
export const deleteAnime = (id)    => request('DELETE', `/anime/${id}`)

// ── Characters ────────────────────────────────────────────────────────────
export const getCharacters    = ()      => request('GET',    '/characters')
export const createCharacter  = (d)     => request('POST',   '/characters', d)
export const updateCharacter  = (id, d) => request('PUT',    `/characters/${id}`, d)
export const deleteCharacter  = (id)    => request('DELETE', `/characters/${id}`)

// ── Chat ──────────────────────────────────────────────────────────────────
export const getChat    = ()      => request('GET',    '/chat')
export const createChat = (d)     => request('POST',   '/chat', d)
export const updateChat = (id, d) => request('PUT',    `/chat/${id}`, d)
export const deleteChat = (id)    => request('DELETE', `/chat/${id}`)

// ── Ratings ───────────────────────────────────────────────────────────────
export const getRatings    = ()           => request('GET',    '/ratings')
export const upsertRating  = (d)          => request('POST',   '/ratings', d)
export const updateRating  = (uid, cid, d)=> request('PUT',    `/ratings/${uid}/${cid}`, d)
export const deleteRating  = (uid, cid)   => request('DELETE', `/ratings/${uid}/${cid}`)
