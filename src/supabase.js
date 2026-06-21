import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — exporting stub supabase client for dev')
}

function makeStub() {
  const chainable = () => ({
    order: async () => ({ data: [], error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    limit: function () { return this },
    eq: function () { return this },
  })

  return {
    from: () => ({
      select: () => chainable(),
      insert: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    }),
    removeChannel: () => {},
  }
}

export const supabase = (url && key) ? createClient(url, key) : makeStub()
