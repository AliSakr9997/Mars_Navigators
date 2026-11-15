import {lazy, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {ArrowRight, ChevronsRight, LogOut, Orbit} from 'lucide-react';
import {AccessPanel} from './AccessPanel';
import {FlightScene} from './FlightScene';
import {access, type Session} from './access';
import './mission.css';

const Dashboard=lazy(()=>import('./FieldWorkspace'));
type Stage='flight'|'start'|'access'|'initializing'|'dashboard';
const marker='ares.landing';
function storedStage():Stage {
  try {
    const value=sessionStorage.getItem(marker);
    if(value==='access') return 'access';
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
  const [session,setSession]=useState<Session>({authenticated:false});
  const [busy,setBusy]=useState(false);
  const [problem,setProblem]=useState('');
  const revision=useRef(0);
  const channel=useRef<BroadcastChannel|null>(null);
  const lock=useCallback(()=>{
    revision.current++;setSession({authenticated:false});remember('access');setStage('access');setProblem('');
  },[]);
  // Every URL enters through this gate. Only a server-verified session mounts App.
  useEffect(()=>{
    let active=true;
    const version=revision.current;
    access('session').then(s=>{
      if(active && version===revision.current && s.authenticated){setSession(s);setStage('dashboard');}
    }).catch(()=>{/* Login remains available for retry when the gateway returns. */});
    if('BroadcastChannel' in window) {
      channel.current=new BroadcastChannel('ares.session');
      channel.current.onmessage=event=>{if(event.data==='logout')lock();};
    }
    return ()=>{active=false;channel.current?.close();channel.current=null;};
  },[lock]);
  useEffect(()=>{
    if(!session.authenticated) return;
    let active=true;
    async function refresh(){
      if(document.hidden)return;
      try { const s=await access('session');if(active&&!s.authenticated)lock(); }
      catch { /* Known expiry remains enforced during connection loss. */ }
    }
    const timer=setTimeout(lock,Math.max(0,(session.expires??0)*1000-Date.now()));
    window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);
    document.addEventListener('visibilitychange',refresh);
    return ()=>{active=false;clearTimeout(timer);window.removeEventListener('focus',refresh);
      window.removeEventListener('pageshow',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[session,lock]);
  useEffect(()=>{
    if(stage!=='initializing')return;
    const timer=setTimeout(()=>setStage('dashboard'),reduced?100:950);
    return ()=>clearTimeout(timer);
  },[stage,reduced]);
  async function logout(){
    setBusy(true);setProblem('');
    try{await access('logout');channel.current?.postMessage('logout');lock();}
    catch(error){setProblem((error as Error).message);}
    finally{setBusy(false);}
  }
  if(stage==='dashboard'&&session.authenticated) return <div className="mission-dashboard">
    <div className="crew-tools">{problem&&<span role="alert">{problem}</span>}
      <button onClick={logout} disabled={busy}><LogOut size={14}/>{busy?'Logging out…':'Log out'}</button></div>
    <Suspense fallback={<Initialization/>}><Dashboard/></Suspense>
  </div>;
  const accessVisible=stage==='access'||stage==='initializing';
  return <main className={'mission-entry state-'+stage}>
    <FlightScene flying={stage==='flight'} reduced={reduced} onLanding={()=>{remember('landed');setStage('start');}}/>
    <header className="mission-mast"><div className="mission-brand"><Orbit aria-hidden="true"/><span>ARES<span className="brand-dash">—</span>GALE</span></div>
      {stage==='flight'&&<button className="intro-skip" onClick={()=>{remember('landed');setStage('start');}}>Skip intro <ChevronsRight size={16}/></button>}
    </header>
    {stage==='flight'&&<div className="flight-track" role="status" aria-label="Approaching Mars"><i/></div>}
    {stage==='start'&&<StartScreen onStart={()=>{remember('access');setStage('access');}}/>}
    {accessVisible&&<AccessPanel initializing={stage==='initializing'} onAccess={s=>{
      revision.current++;setSession(s);setStage('initializing');void import('./FieldWorkspace');
    }}/>}
    {stage==='initializing'&&<Initialization/>}
    {stage!=='flight'&&<footer className="surface-caption"><div><span className="location-line"/>GALE CRATER</div><span>Mount Sharp foothills</span></footer>}
  </main>;
}

