import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { COLLEAGUES } from '../App'
import Leaderboard from './Leaderboard'

export default function MainScreen({name}){
  const [follows, setFollows] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [bump, setBump] = useState(false)
  const bumpTimer = useRef(null)

  const fetchAll = async ()=>{
    const { data, error } = await supabase.from('follows').select('*').order('created_at', { ascending: true })
    if(error){ console.error(error) }
    else setFollows(data || [])
    setLoading(false)
  }

  useEffect(()=>{ fetchAll();
    const subscription = supabase.channel('public:follows')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, ()=>{
        fetchAll()
      })
      .subscribe()
    return ()=> supabase.removeChannel(subscription)
  },[])

  // Seed every colleague at 0 so the leaderboard always renders, then tally follows.
  const counts = COLLEAGUES.reduce((acc,c)=>{ acc[c]=0; return acc }, {})
  follows.forEach(row=>{ counts[row.colleague_name] = (counts[row.colleague_name] || 0) + 1 })
  const myCount = counts[name] || 0

  async function addFollow(colleague = name){
    // optimistic: bump the count immediately, then persist
    setFollows(f => [...f, { id: `local-${Date.now()}`, colleague_name: colleague, created_at: new Date().toISOString() }])
    setBump(true)
    clearTimeout(bumpTimer.current)
    bumpTimer.current = setTimeout(()=> setBump(false), 300)

    setSyncing(true)
    let attempt = 0
    while(attempt < 4){
      const { error } = await supabase.from('follows').insert({ colleague_name: colleague, attendee_name: null })
      if(!error){ setSyncing(false); fetchAll(); return }
      attempt++
      await new Promise(r=>setTimeout(r, 300 * Math.pow(2, attempt)))
    }
    setSyncing(false)
    console.warn('Failed to sync follow after retries')
    fetchAll()
  }

  async function removeOne(colleague){
    if((counts[colleague] || 0) === 0) return
    const { data, error } = await supabase.from('follows').select('id').eq('colleague_name', colleague).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if(error) return console.error(error)
    if(!data) return
    await supabase.from('follows').delete().eq('id', data.id)
    fetchAll()
  }

  function switchName(){
    localStorage.removeItem('w2bf:name')
    window.dispatchEvent(new CustomEvent('w2bf',{detail:'switch-name'}))
  }

  async function exportCSV(){
    const agg = Object.entries(counts).map(([k,v])=>({ name:k, count:v })).sort((a,b)=>b.count-a.count)
    const aggCsv = ['rank,name,count', ...agg.map((r,i)=>`${i+1},${r.name},${r.count}`)].join('\n')
    const logs = follows.map(r=>`${r.colleague_name},${r.attendee_name||''},${r.created_at}`).join('\n')
    downloadText('standings.csv', aggCsv)
    downloadText('follows_log.csv', 'colleague,attendee,timestamp\n'+logs)
  }

  function downloadText(filename, text){
    const blob = new Blob([text], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
  }

  async function resetAll(){
    const confirm = window.prompt('Type RESET to delete all follows')
    if(confirm === 'RESET'){
      await supabase.from('follows').delete().neq('id', 0)
      fetchAll()
    }
  }

  return (
    <div className="max-w-md w-full">
      <div className="app-card bg-card p-6 rounded-2xl shadow-lg">
        <div className="app-card-bar"></div>
        <div className="notch"></div>

        <div className="subtitle mt-4">NSAC · WORK2BEWELL</div>
        <h1 className="title">WORK2BE<span className="accent">FOLLOWED</span></h1>

        <div className="logged-in">Logged in as <span className="font-bold text-offwhite">{name}</span></div>
        <button className="switch-link" onClick={switchName}>not you? switch name</button>

        <button className={`stamp-circle ${bump ? 'bump' : ''}`} onClick={()=>addFollow()} aria-label="Add a follow">
          <span className="stamp-num">{myCount}</span>
          <span className="stamp-label">FOLLOWS</span>
        </button>
        <p className="hint">Tap the stamp each time someone follows</p>

        {syncing && <div className="text-xs text-amber text-center mt-2">syncing…</div>}

        <Leaderboard counts={counts} onDecrement={removeOne} highlight={name} loading={loading} />

        <div className="mt-6 flex gap-3 justify-center">
          <button className="btn-ghost" onClick={exportCSV}>Export CSV</button>
          <button className="btn-ghost" onClick={resetAll}>Reset leaderboard</button>
        </div>
      </div>
    </div>
  )
}
