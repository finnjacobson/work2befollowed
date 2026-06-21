import React from 'react'

function Tier({rank}){
  if(rank===1) return <span className="rank-badge gold">1</span>
  if(rank===2) return <span className="rank-badge silver">2</span>
  if(rank===3) return <span className="rank-badge bronze">3</span>
  return <span className="rank-badge">{rank}</span>
}

export default function Leaderboard({counts,onDecrement,highlight,loading}){
  const rows = Object.entries(counts).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)
  return (
    <div>
      <div className="text-sm font-mono mb-2">Leaderboard</div>
      <div className="space-y-2">
        {loading ? <div className="text-xs">Loading…</div> : rows.map((r,i)=> (
          <div key={r.name} className={`flex items-center justify-between p-2 rounded-lg ${r.name===highlight? 'highlight':''}`}>
            <div className="flex items-center gap-3">
              <Tier rank={i+1} />
              <div>
                <div className="font-bold">{r.name}</div>
                <div className="text-xs text-muted font-mono">{r.count} follows</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-bold">{r.count}</div>
              <button className="btn-decrement" onClick={()=>onDecrement(r.name)}>−</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
