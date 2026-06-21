import React from 'react'

function Rank({rank}){
  const tier = rank===1 ? 'gold' : rank===2 ? 'silver' : rank===3 ? 'bronze' : ''
  return <span className={`rank ${tier}`}>{rank}</span>
}

export default function Leaderboard({counts,onDecrement,highlight,loading}){
  const rows = Object.entries(counts)
    .map(([name,count])=>({name,count}))
    .sort((a,b)=> b.count - a.count)

  return (
    <div>
      <div className="lb-title">LEADERBOARD</div>
      {loading ? (
        <div className="hint">Loading…</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r,i)=> (
            <div key={r.name} className={`lb-row ${r.name===highlight ? 'me' : ''}`}>
              <div className="lb-left">
                <Rank rank={i+1} />
                <div className="lb-name">{r.name}</div>
              </div>
              <div className="lb-right">
                <div className="lb-count">{r.count}</div>
                {r.name===highlight && (
                  <button className="dec" onClick={()=>onDecrement(r.name)} aria-label={`Remove a follow from ${r.name}`}>−</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
