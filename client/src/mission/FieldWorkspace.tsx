import {useEffect, useRef, useState} from 'react';
import {Activity, Compass, Layers, MapPin, Orbit, PanelLeftClose, PanelLeftOpen} from 'lucide-react';
import App from '../App';
import catalog from './catalog.json';
import './workspace.css';

const screens = [
  {name:'Field console',icon:Compass,url:'/field/index.html'},
  {name:'Suit readings',icon:Activity,url:'/field/suit.html'},
  {name:'Traverse planner',icon:Layers,url:''}
];
const defaults={name:'ARES-Gale',phase:'Traverse planning',group:0,target:0};
function loadMission(){
  try {
    const saved=JSON.parse(localStorage.getItem('ares.mission')||'{}');
    if(catalog[saved.group]?.targets[saved.target]) return {...defaults,...saved};
  } catch {}
  return defaults;
}
type Point=[number,number];
type Readout={d:number;risk:number;time:number};
export default function FieldWorkspace(){
  const [mission,setMission]=useState<typeof defaults>(loadMission);
  const [screen,show]=useState(0);
  const [collapsed,collapse]=useState(()=>window.innerWidth<760);
  const [start,setStart]=useState<Point|null>(null);
  const [end,setEnd]=useState<Point|null>(null);
  const [limit,setLimit]=useState(20);
  const [metrics,setMetrics]=useState<Record<string,Readout|null>>({});
  const field=useRef<HTMLIFrameElement>(null);
  const target=catalog[mission.group].targets[mission.target];
  const send=(type:string,data:object={})=>field.current?.contentWindow?.postMessage({type,...data},location.origin);
  function sync(){send('mission',{mission:{...mission,objective:target.name,sites:target.sites}});}
  useEffect(()=>{
    try{localStorage.setItem('ares.mission',JSON.stringify(mission));}catch{}
    sync();
  },[mission]);
  useEffect(()=>{
    function listen(event:MessageEvent){
      if(event.origin!==location.origin||event.source!==field.current?.contentWindow)return;
      if(event.data?.type==='points'){
        setStart(event.data.start);setEnd(event.data.end);setLimit(event.data.limit);
      }
    }
    window.addEventListener('message',listen);
    return ()=>window.removeEventListener('message',listen);
  },[]);
  useEffect(()=>{
    setMetrics({});
    if(!start)return;
    const controller=new AbortController();
    for(const site of target.sites){
      fetch('/api/field/traverse',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},
        body:JSON.stringify({start,end:[site.x,site.y],max_slope:limit,mode:'Balanced'})})
        .then(async r=>r.ok?await r.json():null).catch(()=>null).then(value=>{
          if(!controller.signal.aborted)setMetrics(prev=>({...prev,[site.name]:value}));
        });
    }
    return ()=>controller.abort();
  },[target,start?.[0],start?.[1],limit]);
  const [extent,setExtent]=useState<{west:number;north:number;east:number;south:number}|null>(null);
  useEffect(()=>{fetch('/api/field/extent').then(r=>r.ok?r.json():null).then(setExtent).catch(()=>{});},[]);
  function geographic(p:Point|null,name:string){
    if(!extent||!p)return undefined;
    return {lng:extent.west+p[0]*(extent.east-extent.west),lat:extent.north+p[1]*(extent.south-extent.north),name};
  }
  const geoStart=geographic(start,'EVA Start'),geoEnd=geographic(end,'EVA Target');
  function pick(which:string){show(0);send('pick',{which});if(innerWidth<760)collapse(true);}
  const distances=Object.values(metrics).filter(Boolean).map(v=>v.d);
  return <main className={'field-workspace'+(collapsed?' rail-closed':'')}>
    <aside className="field-rail" aria-label="Mission sidebar">
      <header><Orbit size={24}/><strong>ARES / GALE</strong><button aria-label="Collapse sidebar" onClick={()=>collapse(true)}><PanelLeftClose size={18}/></button></header>
      <nav aria-label="Mission tools">{screens.map(({name,icon:Icon},i)=><button key={name} aria-current={screen===i?'page':undefined} onClick={()=>{show(i);if(innerWidth<760)collapse(true)}}><Icon size={16}/>{name}</button>)}</nav>
      <section><h2>Mission setup</h2>
        <label>Mission name<input maxLength={24} value={mission.name} onChange={e=>setMission({...mission,name:e.target.value})} onBlur={()=>{if(!mission.name.trim())setMission({...mission,name:defaults.name})}}/></label>
        <label>Mission phase<input value={mission.phase} maxLength={26} onChange={e=>setMission({...mission,phase:e.target.value})}/></label>
        <label>Mission type<select value={mission.group} onChange={e=>{setMission({...mission,group:+e.target.value,target:0});show(0)}}>{catalog.map((g,i)=><option key={g.name} value={i}>{g.name}</option>)}</select></label>
        <label>Science objective<select value={mission.target} onChange={e=>{setMission({...mission,target:+e.target.value});show(0)}}>{catalog[mission.group].targets.map((t,i)=><option key={t.name} value={i}>{t.name}</option>)}</select></label>
      </section>
      <section><h2>Matching sites</h2>{target.sites.map(site=>{
        const m=metrics[site.name];
        return <button className="field-site" key={site.name} onClick={()=>{show(0);send('site',{name:site.name})}}><span><MapPin size={14}/>{site.name}</span><small>{m?(distances.length===target.sites.length&&m.d===Math.min(...distances)?'Nearest · ':'')+m.d.toFixed(2)+' km · '+m.risk+'% risk':!start?'Shown on map':m===null?'Route unavailable':'Calculating…'}</small></button>;
      })}
      <div className="field-picks"><button onClick={()=>pick('a')}>Set start</button><button onClick={()=>pick('b')}>Set end</button></div>
      <small aria-live="polite">{!start?'Click the map to set EVA Start.':!end?'Click the map to set EVA Target.':'Start and target set.'}</small></section>
    </aside>
    <div className="field-content">
      {collapsed&&<button className="rail-open" onClick={()=>collapse(false)}><PanelLeftOpen size={16}/> Mission options</button>}
      <iframe ref={field} title="Field console" src="/field/index.html" hidden={screen!==0} onLoad={sync}/>
      {screen>0&&(screens[screen].url?<iframe key={screen} title={screens[screen].name} src={screens[screen].url}/>:<App missionName={mission.name} initialStart={geoStart} initialEnd={geoEnd}/>)}
    </div>
  </main>
}

