import { useState } from 'react';
import App from '../App';

const tools = [
  ['Field console', '/field/index.html'],
  ['Objectives', '/field/objectives.html'],
  ['Suit readings', '/field/suit.html'],
  ['Terrain model', '/planner/'],
  ['Traverse planner', '']
] as const;

export default function FieldWorkspace() {
  const [screen, setScreen] = useState<number>(0);
  return <main style={{background:'#07111f',color:'#edf4fa',minHeight:'100vh'}}>
    <nav aria-label="Mission tools" style={{display:'flex',gap:8,flexWrap:'wrap',padding:'14px 130px 14px 16px'}}>
      {tools.map(([name], i) => <button key={name} aria-pressed={screen===i} onClick={()=>setScreen(i)}
        style={{background:screen===i?'#164354':'#102334',color:'#e7f2fa',border:'1px solid #406277',borderRadius:5,padding:'9px 12px',cursor:'pointer'}}>{name}</button>)}
    </nav>
    {tools[screen][1] ? <iframe key={screen} title={tools[screen][0]} src={tools[screen][1]} style={{width:'100%',height:'calc(100vh - 70px)',border:0}}/> : <App/>}
  </main>;
}
