import React, { useEffect, useState } from 'react'
import NamePicker from './components/NamePicker'
import MainScreen from './components/MainScreen'

export const COLLEAGUES = [
  'Sara','Lauren','Adiel','Logan','Emy','Maya','Harper','Srika','Joy','Emanuel','Anushka','Finn','Heather','Tyra'
]

export default function App(){
  const [name, setName] = useState(() => localStorage.getItem('w2bf:name'))

  useEffect(()=>{
    const handler = (e)=>{
      if(e.detail === 'switch-name') setName(null)
    }
    window.addEventListener('w2bf', handler)
    return ()=> window.removeEventListener('w2bf', handler)
  },[])

  return (
    <div className="min-h-screen bg-plum text-offwhite flex items-center justify-center p-4">
      {!name ? (
        <NamePicker onPick={(n)=>{localStorage.setItem('w2bf:name', n); setName(n)}}/>
      ) : (
        <MainScreen name={name} />
      )}
    </div>
  )
}
