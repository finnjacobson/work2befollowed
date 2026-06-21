import React from 'react'
import { COLLEAGUES } from '../App'

export default function NamePicker({onPick}){
  return (
    <div className="max-w-md w-full bg-card p-4 rounded-2xl shadow-lg">
      <div className="lanyard h-6 rounded-t-lg mb-4"></div>
      <h2 className="text-xl font-bold mb-2">Pick your name</h2>
      <div className="grid grid-cols-3 gap-3">
        {COLLEAGUES.map(c=> (
          <button key={c} onClick={()=>onPick(c)} className="btn-name">{c}</button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">This device will remember your name.</p>
    </div>
  )
}
