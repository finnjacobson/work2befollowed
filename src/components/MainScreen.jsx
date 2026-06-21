import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import Leaderboard from './Leaderboard'

export default function MainScreen({name}){
  const [follows, setFollows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [attendee, setAttendee] = useState('')
  const [syncing, setSyncing] = useState(false)
  const retryRef = useRef(0)

  const fetchAll = async ()=>{
    setLoading(true)
    const { data, error } = await supabase.from('follows').select('*').order('created_at', { ascending: true })
    if(error){ console.error(error) }
    else setFollows(data || [])
    setLoading(false)
  }

  useEffect(()=>{ fetchAll();
    const subscription = supabase.channel('public:follows')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, payload => {
        fetchAll()
      })
      .subscribe()
    return ()=> supabase.removeChannel(subscription)
  },[])

  const counts = follows.reduce((acc,row)=>{ acc[row.colleague_name]=(acc[row.colleague_name]||0)+1; return acc }, {})
  const myCount = counts[name] || 0

  async function addFollow(attendeeName){
    setModalOpen(false)
    setSyncing(true)
    let attempt=0
    while(attempt<4){
      const { error } = await supabase.from('follows').insert({ colleague_name: name, attendee_name: attendeeName || null })
      if(!error) { setSyncing(false); fetchAll(); return }
      attempt++
      await new Promise(r=>setTimeout(r, 300 * Math.pow(2, attempt)))
    }
    setSyncing(false)
    // show non-blocking indicator; for now console
    console.warn('Failed to sync follow after retries')
  }

  async function removeOne(colleague){
    // delete most recent follow for colleague
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
    // aggregated
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
      <div className="bg-card p-4 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs font-mono text-muted">Logged in as</div>
            <div className="font-bold text-lg">{name}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold stamp-count">{myCount}</div>
            <div className="text-xs text-muted">Your follows</div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <button
            className="stamp-btn"
            onClick={()=>setModalOpen(true)}
          >
            Stamp
          </button>
        </div>

        {syncing && <div className="text-xs text-amber">couldn't sync, retrying…</div>}

        <div className="mt-3">
          <Leaderboard counts={counts} onDecrement={removeOne} highlight={name} loading={loading} />
        </div>

        <div className="mt-4 flex gap-3">
          <button className="btn-ghost" onClick={exportCSV}>Export CSV</button>
          <button className="btn-ghost" onClick={switchName}>Switch name</button>
          <button className="btn-ghost" onClick={resetAll}>Reset leaderboard</button>
        </div>
      </div>

      {/* Modal bottom sheet */}
      {modalOpen && (
        <div className="sheet">
          <div className="sheet-card">
            <h3 className="font-bold">Who'd you get? 🎉</h3>
            <input className="input" placeholder="Attendee name (optional)" value={attendee} onChange={e=>setAttendee(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ addFollow(attendee); setAttendee('') } }} />
            <div className="flex gap-2 mt-3">
              <button className="btn-ghost" onClick={()=>{ addFollow(null); setAttendee('') }}>Skip</button>
              <button className="btn" onClick={()=>{ addFollow(attendee); setAttendee('') }}>Log Follow</button>
            </div>
            <button className="sheet-close" onClick={()=>setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
