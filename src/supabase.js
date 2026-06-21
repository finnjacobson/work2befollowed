import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — using a localStorage-backed stub so the app works offline/in dev')
}

// A small localStorage-backed stand-in for the Supabase client. It supports the
// exact query chains this app uses so the leaderboard and stamping fully work
// without a configured backend (e.g. local dev, demo, or offline).
function makeStub() {
  const KEY = 'w2bf:follows'
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
  const write = (rows) => localStorage.setItem(KEY, JSON.stringify(rows))
  let seq = read().reduce((m, r) => Math.max(m, r.id || 0), 0)

  function builder(mode) {
    const filters = []
    let orderAsc = true
    let limitN = null
    const matched = () => read().filter((r) => filters.every((f) => f(r)))
    const run = () => {
      if (mode === 'delete') {
        const drop = new Set(matched().map((r) => r.id))
        write(read().filter((r) => !drop.has(r.id)))
        return { data: null, error: null }
      }
      let rows = matched()
      rows.sort((a, b) => (orderAsc ? 1 : -1) * String(a.created_at).localeCompare(String(b.created_at)))
      if (limitN != null) rows = rows.slice(0, limitN)
      return { data: rows, error: null }
    }
    const api = {
      select() { return api },
      eq(col, val) { filters.push((r) => r[col] === val); return api },
      neq(col, val) { filters.push((r) => r[col] !== val); return api },
      order(_col, opts) { orderAsc = opts?.ascending !== false; return api },
      limit(n) { limitN = n; return api },
      maybeSingle() { return Promise.resolve({ data: run().data?.[0] || null, error: null }) },
      then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject) },
    }
    return api
  }

  return {
    from() {
      return {
        select() { return builder('select') },
        delete() { return builder('delete') },
        insert(obj) {
          const rows = read()
          rows.push({ id: ++seq, created_at: new Date().toISOString(), ...obj })
          write(rows)
          return Promise.resolve({ data: null, error: null })
        },
      }
    },
    channel() { const ch = { on() { return ch }, subscribe() { return ch } }; return ch },
    removeChannel() {},
  }
}

export const supabase = (url && key) ? createClient(url, key) : makeStub()
