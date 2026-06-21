import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { COLLEAGUES } from './App'

// Shared follows data: fetches the table, subscribes to realtime changes, and
// derives per-colleague counts (seeded at 0 so the leaderboard always renders).
// Used by both the login screen (read-only) and the main screen.
export function useFollows(){
  const [follows, setFollows] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async ()=>{
    const { data, error } = await supabase.from('follows').select('*').order('created_at', { ascending: true })
    if(error){ console.error(error) }
    else setFollows(data || [])
    setLoading(false)
  }, [])

  useEffect(()=>{ refresh()
    const subscription = supabase.channel('public:follows')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, ()=>{ refresh() })
      .subscribe()
    return ()=> supabase.removeChannel(subscription)
  },[refresh])

  const counts = COLLEAGUES.reduce((acc,c)=>{ acc[c]=0; return acc }, {})
  follows.forEach(row=>{ counts[row.colleague_name] = (counts[row.colleague_name] || 0) + 1 })

  return { follows, setFollows, counts, loading, refresh }
}
