import React from 'react'
import { COLLEAGUES } from '../App'

export default function NamePicker({onPick}){
  return (
    <div className="max-w-md w-full app-card bg-card p-6 rounded-2xl shadow-lg">
      <div className="app-card-bar"></div>
      <div className="notch"></div>

      <div className="subtitle mt-4">NSAC · WORK2BEWELL</div>
      <h1 className="title">WORK2BE<span className="accent">FOLLOWED</span></h1>

      <h2 className="text-xl font-bold mt-6 mb-3 text-center">Pick your name</h2>
      <div className="grid grid-cols-3 gap-3">
        {COLLEAGUES.map(c=> (
          <button key={c} onClick={()=>onPick(c)} className="btn-name">{c}</button>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted text-center">This device will remember your name.</p>
    </div>
  )
}
