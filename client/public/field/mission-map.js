let fieldMission = {name:'ARES-Gale',phase:'Traverse planning',objective:'',sites:[]};
const routeStore='ares.field.plan.v2';
function savePoints(){
  const plan={a:state.a,b:state.b,an:state.an,bn:state.bn,max:state.max,objective:fieldMission.objective};
  try { sessionStorage.setItem(routeStore,JSON.stringify(plan)); } catch {}
  if(parent!==window)parent.postMessage({type:'points',start:state.a,end:state.b,limit:state.max},location.origin);
}
function restorePoints(){
  try {
    const plan=JSON.parse(sessionStorage.getItem(routeStore)||'null');
    const valid=p=>p===null||(Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
    if(!plan||!valid(plan.a)||!valid(plan.b))return;
    for(const key of ['a','b','an','bn','max'])state[key]=plan[key];
    fieldMission.objective=plan.objective;
    state.selecting=state.a?'b':'a';
  } catch {}
}
function matchingRegions(){
  return fieldMission.sites.map(site=>{
    const [x,y]=px([site.x,site.y]), w=site.name.length*8+18;
    const labelX=Math.min(x+14,map.x+map.w-w-3);
    return circle(x,y,22,'#e858482e','#ff9380',1.6)+circle(x,y,6,'#ff8772','#31171a',2)+
      rect(labelX,y-36,w,24,'#32191b',4,'#d87e71')+txt(labelX+9,y-19,site.name,14,'#fff1eb',650);
  }).join('');
}
function nearestSite(p){
  return fieldMission.sites.find(site=>Math.hypot((p[0]-site.x)*map.w,(p[1]-site.y)*map.h)<=22);
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent)return;
  const {type,mission,which,name}=event.data||{};
  if(type==='mission'&&mission&&Array.isArray(mission.sites)){
    if(fieldMission.objective&&mission.objective!==fieldMission.objective){
      generation++;modelRoutes=null;modelStatus='Fallback';
      setPoint('b',null,'Choose a target');state.selecting=state.a?'b':'a';
    }
    fieldMission=mission;
  }else if(type==='pick'&&['a','b'].includes(which)){
    state.selecting=which;
  }else if(type==='site'){
    const site=fieldMission.sites.find(s=>s.name===name)||fieldMission.sites.find(s=>s.name.includes(name));
    if(!site)return;
    if(!state.a){
      setPoint('a',waypoints[0].p,waypoints[0].n);
    }
    generation++;modelRoutes=null;modelStatus='Fallback';
    setPoint('b',[site.x,site.y],site.name);
    state.selecting=null;
    state.computed=true;
  }else return;
  savePoints();draw();
});
