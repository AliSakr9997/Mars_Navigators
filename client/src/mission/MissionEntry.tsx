import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {ArrowRight, ChevronsRight, Orbit} from 'lucide-react';
import {FlightScene} from './FlightScene';
import './mission.css';

const Dashboard=lazy(()=>import('./FieldWorkspace'));
type Stage='flight'|'start'|'dashboard';
const marker='ares.landing';
function storedStage():Stage {
  try {
    const value=sessionStorage.getItem(marker);
    if(value==='dashboard'||value==='access') return 'dashboard';
    if(value==='landed') return 'start';
  } catch { /* Private browsing may disable session storage. */ }
  return 'flight';
}
function remember(value:string){try{sessionStorage.setItem(marker,value);}catch{/* Optional navigation hint. */}}
function useReducedMotion(){
  const [reduced,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>set(mq.matches);
    mq.addEventListener('change',update);return ()=>mq.removeEventListener('change',update);
  },[]);
  return reduced;
}
function StartScreen({onStart}:{onStart:()=>void}){
  const button=useRef<HTMLButtonElement>(null);
  useEffect(()=>{button.current?.focus({preventScroll:true});},[]);
  return <button ref={button} className="mission-start" onClick={onStart}>START <ArrowRight strokeWidth={1.45}/></button>;
}
function Initialization(){
  return <div className="initialization" role="status"><span className="init-line"/>Initializing mission</div>;
}
export default function MissionEntry(){
  const reduced=useReducedMotion();
  const [stage,setStage]=useState<Stage>(storedStage);
  if(stage==='dashboard') return <div className="mission-dashboard">
    <Suspense fallback={<Initialization/>}><Dashboard/></Suspense>
  </div>;
  return <main className={'mission-entry state-'+stage}>
    <FlightScene flying={stage==='flight'} reduced={reduced} onLanding={()=>{remember('landed');setStage('start');}}/>
    <header className="mission-mast"><div className="mission-brand"><Orbit aria-hidden="true"/><span>ARES<span className="brand-dash">—</span>GALE</span></div>
      {stage==='flight'&&<button className="intro-skip" onClick={()=>{remember('landed');setStage('start');}}>Skip intro <ChevronsRight size={16}/></button>}
    </header>
    {stage==='flight'&&<div className="flight-track" role="status" aria-label="Approaching Mars"><i/></div>}
    {stage==='start'&&<StartScreen onStart={()=>{remember('dashboard');setStage('dashboard');}}/>}
    {stage!=='flight'&&<footer className="surface-caption"><div><span className="location-line"/>GALE CRATER</div><span>Mount Sharp foothills</span></footer>}
  </main>;
}


