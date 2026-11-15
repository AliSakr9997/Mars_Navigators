/* ARES engine (JS port of the tested Python v3 engine). Works in the browser and in node. */
const ARES=(function(){
const NB8=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const TK=3.5,TOFF=0.05,TVMAX=6.0;
const ALGOS=["Dijkstra","A*","Weighted A*","Greedy","A* + smoothing"];
const OPT_NOTE={"Dijkstra":"guaranteed cheapest for these prices","A*":"guaranteed cheapest for these prices","Weighted A*":"close to cheapest (within the strength factor), but faster","Greedy":"very fast, NO guarantee it is cheap","A* + smoothing":"A* path shortened with straight lines that cost no more; off-grid, usually the cheapest",
  "A* via waypoint":"two A* legs forced through a waypoint to the side of the straight line, so the route is deliberately different","A* (layer)":"A* with prices built for ONE layer only (shortest, least climb, lowest radiation ...)","A* + band":"A* with a no-go band around every earlier route, so it must take a different corridor","Weighted A* (feature)":"one fast search with prices built for ONE feature, then shortened with straight lines"};
const clip=(x,a,b)=>x<a?a:(x>b?b:x);
const rint=x=>{const f=Math.floor(x),d=x-f;return d<0.5?f:(d>0.5?f+1:(f%2===0?f:f+1))};
function dec(s,T){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)}
function decodeData(P){return Object.assign({},P,{Z:dec(P.Z,Float64Array),slope:dec(P.slope,Float32Array),rough:dec(P.rough,Float32Array),hill:dec(P.hill,Float32Array),sand:dec(P.sand,Uint8Array)})}
const fmtHm=m=>{m=Math.round(m);const h=Math.floor(m/60),mm=m%60;return h?`${h} h ${String(mm).padStart(2,'0')} min`:`${mm} min`};
const cum=a=>{const o=new Float64Array(a.length+1);for(let i=0;i<a.length;i++)o[i+1]=o[i]+a[i];return o};
const sum=a=>{let s=0;for(let i=0;i<a.length;i++)s+=a[i];return s};
const mx=a=>{let m=-Infinity;for(let i=0;i<a.length;i++)if(a[i]>m)m=a[i];return m};
const mn=a=>{let m=Infinity;for(let i=0;i<a.length;i++)if(a[i]<m)m=a[i];return m};
const argmax=a=>{let b=0;for(let i=1;i<a.length;i++)if(a[i]>a[b])b=i;return b};
const argmin=a=>{let b=0;for(let i=1;i<a.length;i++)if(a[i]<a[b])b=i;return b};

/* ---------- exact euclidean distance transform (Felzenszwalb) ---------- */
function edt(feature,H,W){ // distance (cells) of every cell to the nearest feature cell
  const INF=1e20,f=new Float64Array(H*W);for(let i=0;i<H*W;i++)f[i]=feature[i]?0:INF;
  const n=Math.max(H,W),v=new Int32Array(n),z=new Float64Array(n+1),d=new Float64Array(n),col=new Float64Array(n);
  const pass=(get,set,len)=>{let k=0;v[0]=0;z[0]=-INF;z[1]=INF;
    for(let q=1;q<len;q++){let s=((get(q)+q*q)-(get(v[k])+v[k]*v[k]))/(2*q-2*v[k]);
      while(s<=z[k]){k--;s=((get(q)+q*q)-(get(v[k])+v[k]*v[k]))/(2*q-2*v[k])}
      k++;v[k]=q;z[k]=s;z[k+1]=INF}
    k=0;for(let q=0;q<len;q++){while(z[k+1]<q)k++;d[q]=(q-v[k])*(q-v[k])+get(v[k])}
    for(let q=0;q<len;q++)set(q,d[q])};
  for(let c=0;c<W;c++)pass(q=>f[q*W+c],(q,x)=>{f[q*W+c]=x},H);
  for(let r=0;r<H;r++)pass(q=>f[r*W+q],(q,x)=>{f[r*W+q]=x},W);
  const o=new Float64Array(H*W);for(let i=0;i<H*W;i++)o[i]=Math.sqrt(f[i]);return o}

/* ---------- radiation layer (PROXY, relative): terrain shielding + height + optional circular zones ---------- */
function skyView(D){if(D._svf)return D._svf;const H=D.H,W=D.W,px=D.px,Z=D.Z,svf=new Float32Array(H*W),steps=[1,2,3,5,8,12,18,26,36,50];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){const z0=Z[r*W+c];let s=0;
    for(let k=0;k<8;k++){const dr=NB8[k][0],dc=NB8[k][1],f=Math.hypot(dr,dc);let best=0;
      for(const st of steps){const rr=r+dr*st,cc=c+dc*st;if(rr<0||cc<0||rr>=H||cc>=W)break;const t=(Z[rr*W+cc]-z0)/(st*px*f);if(t>best)best=t}
      s+=Math.sin(Math.atan(best))}
    svf[r*W+c]=1-s/8}
  D._svf=svf;return svf}
function radLayer(D,g,TR,zones){const N=g.N,svf=skyView(D),shield=clip((TR.rad_shield_pct??50)/100,0,0.95),alt=(TR.rad_alt_pct_km??5)/100,zs=Float64Array.from(g.Z).sort(),zmed=zs[zs.length>>1];
  const base=new Float64Array(N),zm=new Float64Array(N).fill(1),noGo=new Uint8Array(N),a=g.area;
  for(let i=0;i<N;i++)base[i]=(1-shield*(1-svf[i]))*Math.max(0.2,1+alt*(g.Z[i]-zmed)/1000);
  (zones||[]).forEach(zn=>{const fr=(a.lat_max-zn.lat)/(a.lat_max-a.lat_min)*g.H-0.5,fc=(zn.lon-a.lon_min)/(a.lon_max-a.lon_min)*g.W-0.5,R=zn.radius_m,Rc=R*1.25/g.px;
    for(let rr=Math.max(0,Math.floor(fr-Rc));rr<=Math.min(g.H-1,Math.ceil(fr+Rc));rr++)for(let cc=Math.max(0,Math.floor(fc-Rc));cc<=Math.min(g.W-1,Math.ceil(fc+Rc));cc++){
      const d=g.px*Math.hypot(rr-fr,cc-fc);let v=1;if(d<=R)v=zn.mult;else if(d<=R*1.25)v=1+(zn.mult-1)*(1-(d-R)/(0.25*R));else continue;
      const i=rr*g.W+cc;if(v>zm[i])zm[i]=v;if(zn.nogo&&d<=R)noGo[i]=1}});
  const rad=new Float64Array(N);let mn_=Infinity,mx_=-Infinity;for(let i=0;i<N;i++){rad[i]=base[i]*zm[i];if(rad[i]<mn_)mn_=rad[i];if(rad[i]>mx_)mx_=rad[i]}
  return {rad,min:mn_,den:Math.max(mx_-mn_,0.5),noGo}}

/* ---------- layers that depend on the terrain rules ---------- */
function makeGrid(D,TR,zones){
  const H=D.H,W=D.W,N=H*W,px=D.px,g={H,W,N,px,Z:D.Z,slope:D.slope,rough:D.rough,sand:D.sand,hill:D.hill,hasSand:D.hasSand,area:D.area};
  g.shadow=new Uint8Array(N);g.danger=new Uint8Array(N);let any=false;
  for(let i=0;i<N;i++){g.shadow[i]=g.hill[i]<TR.shadow_level?1:0;if(g.slope[i]>TR.max_slope_deg){g.danger[i]=1;any=true}}
  g.clearance=new Float64Array(N);
  if(any){const e=edt(g.danger,H,W);for(let i=0;i<N;i++)g.clearance[i]=e[i]*px}else g.clearance.fill(1e4);
  const pct=(arr,q)=>{const a=Float64Array.from(arr).sort();return a[Math.min(a.length-1,Math.floor(q*a.length))]};
  const adapt=(TR.adaptive_contrast??1)>0;g.slopeRef=adapt?clip(pct(g.slope,.95)*1.15,3,TR.max_slope_deg):TR.max_slope_deg;g.roughRef=adapt?clip(pct(g.rough,.95)*1.15,0.05,TR.rough_threshold_m):TR.rough_threshold_m;
  const rl=radLayer(D,g,TR,zones);g.rad=rl.rad;g.radMin=rl.min;g.radDen=rl.den;
  const buf=TR.danger_buffer_m;g.blocked=new Uint8Array(N);g.closeness=new Float64Array(N);g.influence=Math.max(5*buf,2*px,1);
  for(let i=0;i<N;i++){g.blocked[i]=(g.danger[i]||g.clearance[i]<buf||rl.noGo[i])?1:0;g.closeness[i]=clip(1-g.clearance[i]/g.influence,0,1)}
  return g}
const rcToLonLat=(g,r,c)=>{const a=g.area;return [a.lon_min+(c+0.5)/g.W*(a.lon_max-a.lon_min),a.lat_max-(r+0.5)/g.H*(a.lat_max-a.lat_min)]};
const lonLatToRc=(g,lon,lat)=>{const a=g.area;return [clip(Math.round((a.lat_max-lat)/(a.lat_max-a.lat_min)*g.H-0.5),0,g.H-1),clip(Math.round((lon-a.lon_min)/(a.lon_max-a.lon_min)*g.W-0.5),0,g.W-1)]};

/* ---------- price of the ground ---------- */
function buildM(g,TR,w){const M=new Float64Array(g.N).fill(1);
  for(let i=0;i<g.N;i++){let m=1;
    if(w.slope)m+=w.slope*(TR.slope_penalty??1)*Math.pow(clip(g.slope[i]/g.slopeRef,0,1),2);
    if(w.roughness)m+=w.roughness*clip(g.rough[i]/g.roughRef,0,1);
    if(w.sand)m+=w.sand*g.sand[i];
    if(w.near_danger)m+=w.near_danger*g.closeness[i];
    if(w.height&&g.zBase!==undefined)m+=w.height*(TR.height_penalty??0)*clip((g.Z[i]-g.zBase)/g.zSpan,0,1);
    if(w.radiation)m+=w.radiation*clip((g.rad[i]-g.radMin)/g.radDen,0,1);
    M[i]=m}
  return M}

/* ---------- binary heap ordered by (priority, index) like Python's heapq on tuples ---------- */
class Heap{constructor(){this.p=[];this.v=[]}
  less(a,b){return this.p[a]<this.p[b]||(this.p[a]===this.p[b]&&this.v[a]<this.v[b])}
  swap(a,b){[this.p[a],this.p[b]]=[this.p[b],this.p[a]];[this.v[a],this.v[b]]=[this.v[b],this.v[a]]}
  push(pri,v){this.p.push(pri);this.v.push(v);let i=this.p.length-1;while(i>0){const q=(i-1)>>1;if(this.less(i,q)){this.swap(i,q);i=q}else break}}
  pop(){const top=[this.p[0],this.v[0]],lp=this.p.pop(),lv=this.v.pop();if(this.p.length){this.p[0]=lp;this.v[0]=lv;let i=0,n=this.p.length;for(;;){let l=2*i+1,r=l+1,s=i;if(l<n&&this.less(l,s))s=l;if(r<n&&this.less(r,s))s=r;if(s===i)break;this.swap(i,s);i=s}}return top}
  get size(){return this.p.length}}

function runSearch(g,M,blocked,start,goal,algo,wClimb,eps){
  const H=g.H,W=g.W,Z=g.Z,px=g.px,s=start[0]*W+start[1],t=goal[0]*W+goal[1],gr=goal[0],gc=goal[1];
  const gs=new Float64Array(g.N).fill(Infinity),par=new Int32Array(g.N).fill(-2),closed=new Uint8Array(g.N);
  gs[s]=0;par[s]=-1;const heap=new Heap();heap.push(0,s);let expanded=0;const t0=Date.now();
  while(heap.size){const [,u]=heap.pop();if(closed[u])continue;closed[u]=1;expanded++;if(u===t)break;
    const ur=(u/W)|0,uc=u-ur*W,gu=gs[u],zu=Z[u],mu=M[u];
    for(let k=0;k<8;k++){const dr=NB8[k][0],dc=NB8[k][1],rr=ur+dr,cc=uc+dc;if(rr<0||cc<0||rr>=H||cc>=W)continue;
      const v=rr*W+cc;if(blocked[v]||closed[v])continue;
      const dh=px*Math.hypot(dr,dc),dz=Z[v]-zu,ng=gu+Math.sqrt(dh*dh+dz*dz)*0.5*(mu+M[v])+(dz>0?wClimb*dz:0);
      if(ng<gs[v]){gs[v]=ng;par[v]=u;const h=px*Math.hypot(rr-gr,cc-gc);
        const pri=algo==="Dijkstra"?ng:(algo==="Greedy"?h:(algo==="Weighted A*"?ng+eps*h:ng+h));heap.push(pri,v)}}}
  if(par[t]===-2)return null;
  const path=[];for(let u=t;u!==-1;u=par[u])path.push([(u/W)|0,u%W]);path.reverse();
  return {path,cost:gs[t],expanded,secs:(Date.now()-t0)/1000}}

function bil(arr,W,H,r,c){r=clip(r,0,H-1);c=clip(c,0,W-1);const r0=Math.floor(r),c0=Math.floor(c),r1=Math.min(r0+1,H-1),c1=Math.min(c0+1,W-1),fr=r-r0,fc=c-c0;
  return arr[r0*W+c0]*(1-fr)*(1-fc)+arr[r0*W+c1]*(1-fr)*fc+arr[r1*W+c0]*fr*(1-fc)+arr[r1*W+c1]*fr*fc}
const nn=(arr,W,H,r,c)=>arr[clip(rint(r),0,H-1)*W+clip(rint(c),0,W-1)];
function lineCost(g,M,blocked,a,b,wClimb){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/0.5)),r=[],c=[];
  for(let i=0;i<=n;i++){const t=i/n;r.push(a[0]+(b[0]-a[0])*t);c.push(a[1]+(b[1]-a[1])*t);
    if(blocked&&blocked[clip(rint(r[i]),0,g.H-1)*g.W+clip(rint(c[i]),0,g.W-1)])return null}
  const z=r.map((x,i)=>bil(g.Z,g.W,g.H,x,c[i])),m=r.map((x,i)=>bil(M,g.W,g.H,x,c[i])),dh=L*g.px/n;let tot=0,climb=0;
  for(let i=0;i<n;i++){const dz=z[i+1]-z[i];tot+=Math.hypot(dh,dz)*0.5*(m[i]+m[i+1]);if(dz>0)climb+=dz}
  return tot+wClimb*climb}
function smoothPath(g,path,M,blocked,wClimb,win=80){const n=path.length,cm=[0];
  for(let i=0;i<n-1;i++)cm.push(cm[i]+lineCost(g,M,null,path[i],path[i+1],wClimb));
  const out=[path[0]];let i=0;
  while(i<n-1){let ch=i+1;for(let j=Math.min(n-1,i+win);j>i+1;j--){const lc=lineCost(g,M,blocked,path[i],path[j],wClimb);if(lc!==null&&lc<=cm[j]-cm[i]+1e-9){ch=j;break}}out.push(path[ch]);i=ch}
  return out}
function freeCell(g,blocked,rc,radius=2){const [r,c]=rc;if(!blocked[r*g.W+c])return [rc,false];let best=null,bd=1e9;
  for(let rr=Math.max(0,r-radius);rr<Math.min(g.H,r+radius+1);rr++)for(let cc=Math.max(0,c-radius);cc<Math.min(g.W,c+radius+1);cc++)
    if(!blocked[rr*g.W+cc]&&Math.hypot(rr-r,cc-c)<bd){best=[rr,cc];bd=Math.hypot(rr-r,cc-c)}
  if(!best)throw new Error("START or END is on impassable ground and no free square is within 2 cells. Pick another point.");return [best,true]}

function cellsOf(path){const [r,c]=densify(path,1);return r.map((x,i)=>[x,c[i]])}
function pathSep(a,b){const A=cellsOf(a),B=cellsOf(b),one=(X,Y)=>{let t=0;for(const p of X){let m=1e18;for(const q of Y){const d=(p[0]-q[0])**2+(p[1]-q[1])**2;if(d<m)m=d}t+=Math.sqrt(m)}return t/X.length};return (one(A,B)+one(B,A))/2}
function pathMaxSep(a,b){const A=cellsOf(a),B=cellsOf(b);let mx=0;for(const p of A){let m=1e18;for(const q of B){const d=(p[0]-q[0])**2+(p[1]-q[1])**2;if(d<m)m=d}mx=Math.max(mx,Math.sqrt(m))}return mx}
/* ---------- path diversity helpers ---------- */
const LAYER_STYLES={ /* one route per layer: prices built for ONE thing only (plus the distance itself) */
 "Shortest":{slope:0,roughness:0,sand:0,near_danger:0,climb:0,radiation:0},
 "Least climbing":{slope:0,roughness:0,sand:0,near_danger:0,climb:8,radiation:0,height:1.5},
 "Flattest":{slope:10,roughness:0,sand:0,near_danger:0,climb:0.5,radiation:0,height:0.5},
 "Smoothest":{slope:0,roughness:8,sand:0,near_danger:0,climb:0,radiation:0},
 "Most clearance":{slope:0.5,roughness:0,sand:0,near_danger:10,climb:0,radiation:0},
 "Least sand":{slope:0,roughness:0,sand:10,near_danger:0,climb:0,radiation:0},
 "Lowest radiation":{slope:0.5,roughness:0,sand:0,near_danger:0,climb:0,radiation:12}};
function corridorHeat(g,cands){const cnt=new Uint16Array(g.N);
  cands.filter(c=>c.id!=="REF"&&c.path.length>1).forEach(c=>{const seenC=new Set();for(const [r,q] of cellsOf(c.path)){const i=clip(Math.round(r),0,g.H-1)*g.W+clip(Math.round(q),0,g.W-1);if(!seenC.has(i)){seenC.add(i);cnt[i]++}}});
  return cnt}
/* ---------- v5: ONE route per feature (single A* each), then pick the best and keep 3 ---------- */
const LAYER_OF={"Least climbing":"height","Flattest":"slope","Smoothest":"rough","Most clearance":"hazard","Least sand":"sand","Lowest radiation":"rad"};
function planFeatures(g,TR,start,goal,PRESETS,tw){
  const notes=[];let moved;
  [start,moved]=freeCell(g,g.blocked,start);if(moved)notes.push("START was on blocked ground and was moved to the nearest free square.");
  [goal,moved]=freeCell(g,g.blocked,goal);if(moved)notes.push("END was on blocked ground and was moved to the nearest free square.");
  const straight=Math.hypot(start[0]-goal[0],start[1]-goal[1]);
  {const zs=Float64Array.from(g.Z).sort(),q=f=>zs[Math.min(zs.length-1,Math.floor(f*zs.length))];g.zBase=Math.max(g.Z[start[0]*g.W+start[1]],g.Z[goal[0]*g.W+goal[1]]);g.zSpan=Math.max(q(0.95)-q(0.05),1)*0.5}
  const specs=Object.keys(LAYER_STYLES).filter(n=>n!=="Least sand"||g.hasSand).map(n=>({feature:n,w:LAYER_STYLES[n],label:"Best for: "+n}));
  specs.push({feature:"Balanced",w:PRESETS.Balanced||LAYER_STYLES.Shortest,label:"Balanced (all features)"});
  const all=[];
  specs.forEach(sp=>{const wc=(sp.w.climb||0)*(TR.climb_penalty??1),M=buildM(g,TR,sp.w),res=runSearch(g,M,g.blocked,start,goal,"Weighted A*",wc,TR.weighted_eps);
    if(!res){notes.push(sp.label+": no path exists (blocked ground).");return}
    const t0=Date.now(),path=smoothPath(g,res.path,M,g.blocked,wc,40);
    all.push({id:"A"+(all.length+1),preset:sp.feature,algo:"Weighted A* (feature)",feature:sp.feature,label:sp.label,path,expanded:res.expanded,secs:res.secs+(Date.now()-t0)/1000,relaxed:false,also:[],weights:Object.assign({},sp.w),origin:"Feature",fam:0,famIdx:0})});
  if(!all.length)throw new Error("No path exists between START and END with these rules (blocked ground).");
  const allM=all.map(c=>measureTerrain(g,TR,c)),byId={};all.forEach(c=>byId[c.id]=c);
  const shortest=Math.min(...allM.map(m=>m.dist_m)),extra=(TR.max_extra_pct??30)/100,mainExtra=(TR.main_extra_pct??15)/100;
  const pool=allM.filter(m=>m.dist_m<=shortest*(1+extra)),mainPool=allM.filter(m=>m.dist_m<=shortest*(1+mainExtra));
  const best=scorePaths(mainPool,TERRAIN_KEYS,tw)[0].m;
  const ranked=scorePaths(pool,TERRAIN_KEYS,tw).map(r=>r.m).filter(m=>m.id!==best.id);
  const minSep=Math.max(2,straight*0.05),kept=[best],sepTo=m=>Math.min(...kept.map(k=>pathSep(byId[k.id].path,byId[m.id].path)));
  for(const m of ranked){if(kept.length>=3)break;if(sepTo(m)>=minSep)kept.push(m)}
  const spare=pool.filter(m=>!kept.includes(m));
  while(kept.length<3&&spare.length){spare.sort((a,b)=>sepTo(b)-sepTo(a));const m=spare.shift();if(sepTo(m)<1.5)break;kept.push(m)}
  if(kept.length<3)notes.push(`Only ${kept.length} clearly different route(s) exist here: the ground leaves no real choice.`);
  const keys=["risk","max_slope_deg","climb_m","pct_steep","pct_rough","pct_sand","rad_idx","dist_m"],why={};
  const lenTxt=m=>{const p=(m.dist_m/best.dist_m-1)*100;return Math.abs(p)<1?"same length":`${Math.abs(p).toFixed(0)}% ${p>0?"longer":"shorter"}`};
  const shown=kept.map((m,i)=>{const c=Object.assign({},byId[m.id],{id:"P"+(i+1),fam:i,famIdx:0,also:[]});
    if(i===0)why[c.id]=`BEST: lowest overall terrain score (built for: ${byId[m.id].feature})`;
    else{const wins=keys.filter(k=>best[k]-m[k]>Math.max(1e-9,best[k]*0.1)).slice(0,2).map(k=>`${CRITERIA[k].label.toLowerCase()} ${CRITERIA[k].fmt(m[k])} vs ${CRITERIA[k].fmt(best[k])}`);
      why[c.id]=(wins.length?"ALTERNATIVE ("+byId[m.id].feature+"): better "+wins.join(", "):"BACKUP ("+byId[m.id].feature+"): different corridor in case the best route is blocked")+"; "+lenTxt(m)}
    return c});
  const byLayer={};allM.forEach(m=>{const l=LAYER_OF[byId[m.id].feature];if(l)byLayer[l]=m.id});
  return {cands:shown,all,allM,why,notes,byLayer,generated:all.length,start,goal,straight}}

/* ---------- walking helpers ---------- */
const tobler=(grade,vmax=TVMAX)=>vmax*Math.exp(-TK*Math.abs(grade+TOFF))/3.6;
function densify(path,maxStep=1.5){const rr=[path[0][0]],cc=[path[0][1]];
  for(let i=0;i<path.length-1;i++){const [r0,c0]=path[i],[r1,c1]=path[i+1],n=Math.max(1,Math.ceil(Math.hypot(r1-r0,c1-c0)/maxStep-1e-9));
    for(let k=1;k<=n;k++){rr.push(r0+(r1-r0)*k/n);cc.push(c0+(c1-c0)*k/n)}}
  return [rr,cc]}
function pathProfile(g,cand){const [r,c]=densify(cand.path),n=r.length,z=r.map((x,i)=>bil(g.Z,g.W,g.H,x,c[i])),dh=[],dz=[],sh=[],sa=[],ro=[],cl=[],ra=[];
  for(let i=0;i<n-1;i++){dh.push(Math.max(Math.hypot(r[i+1]-r[i],c[i+1]-c[i])*g.px,1e-6));dz.push(z[i+1]-z[i]);
    const mr=(r[i]+r[i+1])/2,mc=(c[i]+c[i+1])/2;sh.push(nn(g.shadow,g.W,g.H,mr,mc));sa.push(nn(g.sand,g.W,g.H,mr,mc));ro.push(bil(g.rough,g.W,g.H,mr,mc));cl.push(bil(g.clearance,g.W,g.H,mr,mc));ra.push(bil(g.rad,g.W,g.H,mr,mc))}
  return {r,c,z,dh,dz,shadow:sh,sand:sa,rough:ro,clear:cl,rad:ra}}

/* ---------- STAGE 1: terrain only ---------- */
function measureTerrain(g,TR,cand){
  const p=pathProfile(g,cand),n=p.dh.length,d3=p.dh.map((h,i)=>Math.hypot(h,p.dz[i])),wsum=sum(d3),cumd=cum(d3),grade=p.dh.map((h,i)=>p.dz[i]/h);
  const slope=grade.map(x=>Math.atan(Math.abs(x))*180/Math.PI),risky=TR.risky_slope_deg,imp=TR.max_slope_deg;
  const tref=d3.map((d,i)=>d/Math.max(tobler(grade[i]),0.05)/60),cumT=cum(tref);
  const ll=p.r.map((r,i)=>rcToLonLat(g,r,p.c[i])),wtxt=i=>`lat ${ll[i][1].toFixed(4)}, lon ${ll[i][0].toFixed(4)}`;
  const pct=f=>{let s=0;for(let i=0;i<n;i++)if(f(i))s+=d3[i];return s/wsum*100};
  const edges=[...new Set([0,5,10,risky,imp])].sort((a,b)=>a-b).concat([999]),bands={};
  for(let k=0;k<edges.length-1;k++){const lo=edges[k],hi=edges[k+1];bands[hi<999?`${lo}–${hi}°`:`>${lo}°`]=pct(i=>slope[i]>=lo&&slope[i]<hi)}
  const near=p.clear.map(c=>c<g.influence*0.5),steep=slope.map(s=>s>risky),roughM=p.rough.map(x=>x>TR.rough_threshold_m),sandM=p.sand.map(x=>x>0.5);
  let run=0,bestRun=0,bestStart=0,curStart=0;
  for(let i=0;i<n;i++){if(steep[i]){if(run===0)curStart=i;run+=d3[i];if(run>bestRun){bestRun=run;bestStart=curStart}}else run=0}
  const sn=slope.map(s=>clip(s/imp,0,1)),sp=0.5*sum(sn)/n+0.5*mx(sn);let dpS=0;for(let i=0;i<n;i++)dpS+=clip(1-p.clear[i]/g.influence,0,1)*d3[i];
  const risk=0.6*sp+0.4*(dpS/wsum),iSteep=argmax(slope),iClear=argmin(p.clear);
  let climb=0,descent=0;for(const x of p.dz){if(x>0)climb+=x;else descent-=x}
  const r0=p.r[0],c0=p.c[0],r1=p.r[p.r.length-1],c1=p.c[p.c.length-1],straight=Math.hypot(r1-r0,c1-c0)*g.px,detour=wsum/Math.max(straight,1e-6);
  const stype=slope.map((s,i)=>sandM[i]?"sand":(steep[i]?"steep":(roughM[i]?"rough":"firm"))),names={sand:"loose sand",steep:"steep ground",rough:"rough ground",firm:"firm ground"};
  const bounds=[];let st=0,acc=0,curT=stype[0];
  for(let i=0;i<n;i++){acc+=d3[i];if(acc>=TR.leg_length_m||(stype[i]!==curT&&acc>=100)){bounds.push([st,i]);st=i+1;acc=0;curT=i+1<n?stype[i+1]:stype[i]}}
  if(st<n)bounds.push([st,n-1]);
  const legs=bounds.map(([a,b],k)=>{let w=0,sl=0,mxs=0,cl=0,tr=0;const cnt={};for(let i=a;i<=b;i++){w+=d3[i];sl+=slope[i]*d3[i];mxs=Math.max(mxs,slope[i]);if(p.dz[i]>0)cl+=p.dz[i];tr+=tref[i];cnt[stype[i]]=(cnt[stype[i]]||0)+1}
    const top=Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x])[0];return {"Leg":k+1,"From km":cumd[a]/1000,"Length m":w,"Avg slope °":sl/w,"Max slope °":mxs,"Ground":names[top],"Climb m":cl,"Reference time min":tr}});
  const problems=[],cl0=mn(p.clear);
  if(steep.some(x=>x)){const ps=pct(i=>steep[i]);problems.push([ps>10?"HIGH":"MEDIUM",`${(ps*wsum/100).toFixed(0)} m (${ps.toFixed(0)}% of the path) is steeper than ${risky}°. Steepest: ${slope[iSteep].toFixed(1)}° at km ${(cumd[iSteep]/1000).toFixed(1)} (${wtxt(iSteep)}). Longest steep stretch: ${bestRun.toFixed(0)} m, starting at km ${(cumd[bestStart]/1000).toFixed(1)}.`,iSteep])}
  if(cl0<TR.danger_buffer_m*3+g.px)problems.push(["MEDIUM",`Passes within ${cl0.toFixed(0)} m of impassable ground at km ${(cumd[iClear]/1000).toFixed(1)} (${wtxt(iClear)}). ${pct(i=>near[i]).toFixed(0)}% of the path is in the 'close to danger' zone.`,iClear])
  if(pct(i=>roughM[i])>5)problems.push(["MEDIUM",`${pct(i=>roughM[i]).toFixed(0)}% of the path is rough (height wobble above ${TR.rough_threshold_m} m).`,roughM.indexOf(true)])
  if(g.hasSand&&sandM.some(x=>x))problems.push(["MEDIUM",`${pct(i=>sandM[i]).toFixed(0)}% of the path crosses mapped sand (first at km ${(cumd[sandM.indexOf(true)]/1000).toFixed(1)}).`,sandM.indexOf(true)])
  if(climb>0.15*wsum)problems.push(["MEDIUM",`A lot of climbing: +${climb.toFixed(0)} m up and −${descent.toFixed(0)} m down over ${(wsum/1000).toFixed(1)} km.`,argmax(p.z)])
  if(detour>1.3)problems.push(["INFO",`The path is ${detour.toFixed(2)}× the straight-line distance: it detours around hard ground.`,p.z.length>>1])
  const rsum=sum(p.rad.map((x,i)=>x*d3[i])),radIdx=rsum/wsum,hotD=sum(p.rad.map((x,i)=>x>1.25?d3[i]:0)),hotPct=hotD/wsum*100,iRad=argmax(p.rad),radMax=mx(p.rad);
  if(hotD>0)problems.push([hotPct>25?"HIGH":"MEDIUM",`${hotD.toFixed(0)} m (${hotPct.toFixed(0)}% of the path) is in elevated radiation (more than 1.25× open ground). Peak ${radMax.toFixed(1)}× at km ${(cumd[iRad]/1000).toFixed(1)} (${wtxt(iRad)}).`,iRad]);
  if(cand.relaxed)problems.push(["INFO","This route style's own slope cap could not be met, so the impassable limit was used instead.",0])
  if(cand.preset==="Curiosity reference")problems.push(["INFO","Straight lines between the typed waypoints; NOT checked against blocked ground.",0])
  const trust=[`Heights: ${g.label}`,`Sand: ${g.sandLabel}`,`Grid cell = ${g.px.toFixed(0)} m`];if(g.isDemo)trust.unshift("DEMO — synthetic terrain, results are NOT about real Mars ground.");
  (g.notes||[]).forEach(x=>trust.push(x));if(!g.hasSand)trust.push("Sand not checked: no sand mask loaded, so sand cost and sand % are zero.");
  trust.push("Radiation index is a PROXY: terrain shielding (sky view) + a small height effect + any zones you drew. 1.0 = open ground. It is not a dose model.");trust.push("Reference time = Tobler's published rule for an unburdened Earth hiker (best 6 km/h). NOT a suited-astronaut time.");
  const head=`${(wsum/1000).toFixed(2)} km · +${climb.toFixed(0)} m / −${descent.toFixed(0)} m · steepest ${mx(slope).toFixed(1)}° · ${pct(i=>steep[i]).toFixed(0)}% steep · reference walk ${fmtHm(cumT[n])}`;
  let wm=0;for(let i=0;i<n;i++)wm+=slope[i]*d3[i];
  return {id:cand.id,label:cand.label,preset:cand.preset,algo:cand.algo,also:cand.also,expanded:cand.expanded,secs:cand.secs,found_note:OPT_NOTE[cand.algo]||"typed reference points",relaxed:!!cand.relaxed,
    dist_m:wsum,straight_m:straight,rad_idx:radIdx,pct_hot:hotPct,rad_max:radMax,fam:cand.fam==null?"":"F"+(cand.fam+1),origin:cand.origin||"",detour,ref_time_min:cumT[n],climb_m:climb,descent_m:descent,zmax:mx(p.z),zmin:mn(p.z),mean_slope_deg:wm/wsum,max_slope_deg:mx(slope),
    steep_km:cumd[iSteep]/1000,steep_run_m:bestRun,closest_m:cl0,closest_km:cumd[iClear]/1000,bands,pct_steep:pct(i=>steep[i]),pct_rough:pct(i=>roughM[i]),pct_sand:pct(i=>sandM[i]),pct_near:pct(i=>near[i]),risk,
    problems,trust,head,legs,leg_bounds:bounds,hard_fail:false,fails:[],prof:p,
    arr:{lon:ll.map(x=>x[0]),lat:ll.map(x=>x[1]),z:p.z,cumd,slope,d3,steep,near}}}

/* ---------- STAGE 2: assumptions ---------- */
const minetti=g=>{g=clip(g,-0.45,0.45);return 280.5*g**5-58.7*g**4-76.8*g**3+51.9*g**2+19.6*g+2.5};
function physics(dh,dz,shadow,A,rad){const n=dh.length,o={d3:[],t_min:[],o2:[],o2_slope:[],o2_energy:[],batt:[],rad:[]},vmax=A.flat_speed_kmh/Math.exp(-TK*TOFF);
  for(let i=0;i<n;i++){const d3=Math.hypot(dh[i],dz[i]),gr=dz[i]/dh[i],v=Math.max(tobler(gr,vmax)*A.slowest_walker_factor,0.05),ts=d3/v,tm=ts/60,th=ts/3600,th_=Math.atan(gr),rest=A.o2_rest_l_min;
    const os=tm*(rest+A.o2_slope_coeff*Math.abs(Math.sin(th_))),kj=minetti(gr)*A.suit_mass_kg*d3/1000,oe=Math.max(kj/A.o2_kj_per_l,rest*tm);
    const o2=A.o2_model==="slope"?os:(A.o2_model==="energy"?oe:Math.max(os,oe)),pw=A.life_support_w+A.heater_w+A.other_w+A.cold_extra_w*shadow[i];
    o.d3.push(d3);o.t_min.push(tm);o.o2.push(o2);o.o2_slope.push(os);o.o2_energy.push(oe);o.batt.push(pw*th/1000);o.rad.push(A.rad_msv_day/24*th*(rad?rad[i]:1))}
  return o}
function measureFull(g,TR,A,m,withLegs=true){
  const p=m.prof,out=physics(p.dh,p.dz,p.shadow,A,p.rad),back=physics(p.dh,p.dz.map(x=>-x),p.shadow,A,p.rad),n=p.dh.length+1,cumd=m.arr.cumd;
  const cT=cum(out.t_min),cO=cum(out.o2),cB=cum(out.batt),cR=cum(out.rad),rT=cum(back.t_min),rO=cum(back.o2),rB=cum(back.batt),tank=A.o2_tank_l,cap=A.battery_kwh;
  const o2l=Array.from(cO,x=>A.start_o2_pct-x/tank*100),bl=Array.from(cB,x=>A.start_batt_pct-x/cap*100);
  let firstBad=-1;for(let i=0;i<n;i++){const ok=(o2l[i]-rO[i]/tank*100)>=A.o2_reserve_pct&&(bl[i]-rB[i]/cap*100)>=A.batt_reserve_pct&&(cT[i]+rT[i])<=A.eva_limit_h*60;if(!ok){firstBad=i;break}}
  const pnrNone=firstBad===0,pnrIdx=pnrNone?0:(firstBad>0?firstBad-1:n-1),fullOk=firstBad===-1,imp=TR.max_slope_deg,last=n-1,fails=[];
  if(o2l[last]<0)fails.push("CRITICAL: INSUFFICIENT OXYGEN (tank runs out before the end)");else if(o2l[last]<A.o2_reserve_pct)fails.push(`oxygen left ${o2l[last].toFixed(0)}% is under the ${A.o2_reserve_pct}% reserve`);
  if(bl[last]<A.batt_reserve_pct)fails.push(`battery left ${bl[last].toFixed(0)}% is under the ${A.batt_reserve_pct}% reserve`);
  if(cT[last]>A.eva_limit_h*60)fails.push(`walk time ${fmtHm(cT[last])} is over the ${A.eva_limit_h} h EVA limit`);
  if(mx(m.arr.slope)>imp+0.5)fails.push(`a step is ${mx(m.arr.slope).toFixed(1)}° (impassable limit ${imp}°)`);
  const warns=[],used=o2l.map(x=>A.start_o2_pct-x);
  if(o2l[last]<0)warns.push(["CRITICAL WARNING: INSUFFICIENT OXYGEN",o2l.findIndex(x=>x<0)]);
  let i=used.findIndex(x=>x>=A.o2_warn_pct);if(i>=0)warns.push([`Oxygen passes ${A.o2_warn_pct}% used at ${(cumd[i]/1000).toFixed(1)} km`,i]);
  i=bl.findIndex(x=>x<A.batt_reserve_pct);if(i>=0)warns.push([`Battery drops under ${A.batt_reserve_pct}% at ${(cumd[i]/1000).toFixed(1)} km`,i]);
  if(A.rad_warn_msv>0&&cR[last]>=A.rad_warn_msv)warns.push([`Radiation dose ${cR[last].toFixed(3)} mSv reaches the warning level`,last]);
  if(pnrNone)warns.push(["Even the first step leaves too little reserve to walk back",0]);else if(!fullOk)warns.push([`Point of no return at ${(cumd[pnrIdx]/1000).toFixed(1)} km — turn back before this`,pnrIdx]);
  let legs_full=null;if(withLegs)legs_full=m.leg_bounds.map(([a,b],k)=>Object.assign({},m.legs[k],{"Time so far":fmtHm(cT[b+1]),"Oxygen left %":o2l[b+1],"Battery left %":bl[b+1]}));
  if(legs_full)legs_full.forEach(r=>delete r["Reference time min"]);
  const ro2=Array.from(rO,x=>x/tank*100),rb=Array.from(rB,x=>x/cap*100);
  return {time_min:cT[last],o2_used_l:cO[last],o2_used_pct:A.start_o2_pct-o2l[last],o2_left_pct:o2l[last],o2_slope_l:sum(out.o2_slope),o2_energy_l:sum(out.o2_energy),
    batt_used_kwh:cB[last],batt_used_pct:A.start_batt_pct-bl[last],batt_left_pct:bl[last],rad_msv:cR[last],hard_fail:fails.length>0,fails,warns,
    trust_full:[`Oxygen formula used: ${A.o2_model} (energy formula is Earth-based).`,"Speed, oxygen, battery, radiation and reserves are ASSUMPTIONS (page 3).","Radiation dose = dose rate on open ground × the radiation index along the route (a proxy, not a dose model).",A.cold_extra_w>0?"Shadow is only a proxy from the height map + sun angle.":"Shadow extra heating is off (0 W)."],
    rt_time_min:cT[last]+rT[last],rt_o2_pct:A.start_o2_pct-(o2l[last]-ro2[last]),rt_batt_pct:A.start_batt_pct-(bl[last]-rb[last]),pnr_km:cumd[pnrIdx]/1000,pnr_idx:pnrIdx,pnr_none:pnrNone,full_return_ok:fullOk,legs_full,
    arr_full:{cumt:cT,o2_left:o2l,b_left:bl,ret_o2:ro2,ret_b:rb}}}
const runStage2=(g,TR,A,tms,legs=true)=>tms.map(m=>Object.assign({},m,measureFull(g,TR,A,m,legs)));

/* ---------- the score system ---------- */
const CRITERIA={dist_m:{label:"Distance",fmt:v=>(v/1000).toFixed(2)+" km",stage:"both"},ref_time_min:{label:"Reference time",fmt:fmtHm,stage:"terrain"},time_min:{label:"Walk time",fmt:fmtHm,stage:"full"},
  climb_m:{label:"Total climb",fmt:v=>v.toFixed(0)+" m",stage:"both"},mean_slope_deg:{label:"Average slope",fmt:v=>v.toFixed(1)+"°",stage:"both"},max_slope_deg:{label:"Steepest spot",fmt:v=>v.toFixed(1)+"°",stage:"both"},
  pct_steep:{label:"Steep ground",fmt:v=>v.toFixed(0)+"%",stage:"both"},pct_rough:{label:"Rough ground",fmt:v=>v.toFixed(0)+"%",stage:"both"},pct_sand:{label:"Sand",fmt:v=>v.toFixed(0)+"%",stage:"both"},
  pct_near:{label:"Near cliffs",fmt:v=>v.toFixed(0)+"%",stage:"both"},rad_idx:{label:"Radiation exposure",fmt:v=>v.toFixed(2)+"×",stage:"both"},risk:{label:"Risk index",fmt:v=>v.toFixed(2),stage:"both"},o2_used_pct:{label:"Oxygen used",fmt:v=>v.toFixed(0)+"%",stage:"full"},
  batt_used_pct:{label:"Battery used",fmt:v=>v.toFixed(0)+"%",stage:"full"},rad_msv:{label:"Radiation dose",fmt:v=>v.toFixed(3)+" mSv",stage:"full"}};
const TERRAIN_KEYS=Object.keys(CRITERIA).filter(k=>CRITERIA[k].stage!=="full"),FULL_KEYS=Object.keys(CRITERIA).filter(k=>CRITERIA[k].stage!=="terrain");
const TERRAIN_PRIORITIES={"Balanced":{dist_m:.08,ref_time_min:.08,climb_m:.25,mean_slope_deg:.15,max_slope_deg:.12,pct_steep:.10,pct_rough:.05,pct_sand:.05,pct_near:.05,rad_idx:.05,risk:.15},
  "Safest ground":{risk:.30,max_slope_deg:.20,pct_steep:.15,pct_near:.10,pct_rough:.05,pct_sand:.05,mean_slope_deg:.05,dist_m:.05,ref_time_min:.05},
  "Shortest / fastest":{dist_m:.40,ref_time_min:.40,climb_m:.05,risk:.10,mean_slope_deg:.05},"Least climbing":{climb_m:.40,mean_slope_deg:.20,dist_m:.15,ref_time_min:.10,risk:.10,max_slope_deg:.05},"Lowest radiation":{rad_idx:.60,risk:.10,dist_m:.10,ref_time_min:.10,max_slope_deg:.10}};
const FULL_PRIORITIES={"Balanced":{risk:.25,time_min:.20,o2_used_pct:.15,batt_used_pct:.15,dist_m:.10,climb_m:.05,rad_msv:.05,pct_steep:.05},
  "Safety first":{risk:.45,max_slope_deg:.10,time_min:.10,o2_used_pct:.10,batt_used_pct:.10,pct_steep:.10,dist_m:.05},"Speed first":{time_min:.50,dist_m:.15,risk:.15,o2_used_pct:.10,batt_used_pct:.10},
  "Energy / oxygen first":{o2_used_pct:.30,batt_used_pct:.25,climb_m:.15,time_min:.10,risk:.10,dist_m:.10},"Lowest radiation":{rad_msv:.45,rad_idx:.25,risk:.10,time_min:.10,dist_m:.10}};
function scorePaths(ms,crit,weights){const w={};let tot=0;crit.forEach(k=>{w[k]=Math.max(+weights[k]||0,0);tot+=w[k]});if(tot<=0){crit.forEach(k=>w[k]=1);tot=crit.length}
  let pool=ms.filter(m=>!m.hard_fail);if(!pool.length)pool=ms;const lo={},hi={};crit.forEach(k=>{lo[k]=Math.min(...pool.map(m=>m[k]));hi[k]=Math.max(...pool.map(m=>m[k]))});
  const out=pool.map(m=>{const r={m,id:m.id,label:m.label,n:{},c:{},score:0};crit.forEach(k=>{const rg=hi[k]-lo[k];r.n[k]=rg>0?(m[k]-lo[k])/rg:0;r.c[k]=r.n[k]*w[k]/tot;r.score+=r.c[k]});return r});
  out.sort((a,b)=>a.score-b.score);out.forEach((r,i)=>r.rank=i+1);return out}
function explainRanking(ranked,crit,weights){const n=ranked.length,active=crit.filter(k=>(weights[k]||0)>0),act=active.length?active:crit,pos={};
  crit.forEach(k=>{const vals=ranked.map(r=>r.m[k]);pos[k]={};ranked.forEach(r=>{pos[k][r.id]=1+vals.filter(v=>v<r.m[k]).length})});
  const strengths=ranked.map(r=>{const gd=[...act].sort((a,b)=>pos[a][r.id]-pos[b][r.id]||(a<b?-1:1)).slice(0,2),bd=[...act].sort((a,b)=>pos[b][r.id]-pos[a][r.id]||(a<b?-1:1)).slice(0,2);
    return {id:r.id,Rank:r.rank,Strengths:gd.map(k=>(pos[k][r.id]===1?"best ":"")+`${CRITERIA[k].label.toLowerCase()} (#${pos[k][r.id]}/${n})`).join(", "),Weaknesses:bd.map(k=>(pos[k][r.id]===n?"worst ":"")+`${CRITERIA[k].label.toLowerCase()} (#${pos[k][r.id]}/${n})`).join(", ")}});
  const gap=ranked.map(r=>{const o={id:r.id,Rank:r.rank};act.forEach(k=>{const best=Math.min(...ranked.map(x=>x.m[k])),d=r.m[k]-best;o[CRITERIA[k].label+" vs best"]=d<=1e-9?"best":(k==="time_min"||k==="ref_time_min"?`+${d.toFixed(0)} min`:"+"+CRITERIA[k].fmt(d))});return o});
  const winners={};act.forEach(k=>{const best=Math.min(...ranked.map(x=>x.m[k]));winners[CRITERIA[k].label]=ranked.filter(r=>r.m[k]<=best+1e-9).map(r=>r.id).join(", ")+`  (${CRITERIA[k].fmt(best)})`});
  const pareto=ranked.filter((r,i)=>!ranked.some((s,j)=>j!==i&&act.every(k=>s.m[k]<=r.m[k]+1e-12)&&act.some(k=>s.m[k]<r.m[k]-1e-12))).map(r=>r.id);
  const seen={};ranked.forEach(r=>seen[r.id]=[r.rank]);const ms=ranked.map(r=>r.m);
  act.forEach(k=>[0.8,1.2].forEach(f=>{const w2=Object.assign({},weights);w2[k]=(w2[k]||0)*f;scorePaths(ms,crit,w2).forEach(r=>seen[r.id].push(r.rank))}));
  const stability={};for(const id in seen){const a=seen[id],lo=Math.min(...a),hi=Math.max(...a);stability[id]=lo===hi?"firm":`flips (ranks ${lo}–${hi})`}
  return {strengths,gap,winners,pareto,stability}}
function formulaText(crit,weights){const tot=crit.reduce((s,k)=>s+Math.max(weights[k]||0,0),0)||1;
  return "score = "+crit.filter(k=>(weights[k]||0)>0).map(k=>`${(Math.max(weights[k],0)/tot).toFixed(2)} × ${CRITERIA[k].label}`).join(" + ")+"   (each criterion scaled 0 = best path … 1 = worst; lower score wins)"}

/* ---------- which assumptions matter? ---------- */
const INFL=[["time_min","Time"],["o2_used_pct","Oxygen"],["batt_used_pct","Battery"],["rad_msv","Radiation"]];
function assumptionInfluence(g,TR,A,A_SPEC,tms,weights,delta=0.25,progress){
  const base=runStage2(g,TR,A,tms,false),bwin=scorePaths(base,FULL_KEYS,weights)[0].id,bfails=new Set(base.filter(m=>m.hard_fail).map(m=>m.id)),rows=[];
  const keys=A_SPEC.filter(s=>(s.kind==="num"&&!s.info)||s.key==="o2_model");
  keys.forEach((s,ki)=>{const key=s.key;if(progress)progress(`testing ${s.label} (${ki+1}/${keys.length})`);let trials=[];
    if(s.kind==="choice")trials=s.options.filter(o=>o!==A[key]);else{const v0=A[key];
      if(v0===0){rows.push({key,Assumption:s.label,Tag:s.tag,Now:0,Unit:s.unit,Affects:"— (value is 0: nothing to scale)",Time:0,Oxygen:0,Battery:0,Radiation:0,Flips:0,WinnerChanges:"no",Impact:"none",_score:0});return}
      [1-delta,1+delta].forEach(f=>{let v=v0*f;if(s.lo!=null)v=Math.max(v,s.lo);if(s.hi!=null)v=Math.min(v,s.hi);trials.push(v)})}
    const best={};INFL.forEach(([k])=>best[k]=0);let flips=0,win=false;
    trials.forEach(v=>{const A2=Object.assign({},A,{[key]:v}),alt=runStage2(g,TR,A2,tms,false);
      INFL.forEach(([mk])=>{let s_=0;alt.forEach((x,i)=>s_+=Math.abs(x[mk]-base[i][mk])/Math.max(Math.abs(base[i][mk]),1e-9));best[mk]=Math.max(best[mk],s_/alt.length*100)});
      const af=new Set(alt.filter(m=>m.hard_fail).map(m=>m.id));flips=Math.max(flips,[...bfails].filter(x=>!af.has(x)).length+[...af].filter(x=>!bfails.has(x)).length);
      win=win||scorePaths(alt,FULL_KEYS,weights)[0].id!==bwin});
    const top=Math.max(...Object.values(best)),impact=(win||flips>0||top>=15)?"HIGH":(top>=5?"MEDIUM":(top>=0.5?"LOW":"none")),aff=INFL.filter(([mk])=>best[mk]>=0.5).map(x=>x[1]);if(flips>0)aff.push(`pass/fail of up to ${flips} paths`);
    rows.push({key,Assumption:s.label,Tag:s.tag,Now:A[key],Unit:s.unit,Affects:aff.join(", ")||"nothing measurable",Time:best.time_min,Oxygen:best.o2_used_pct,Battery:best.batt_used_pct,Radiation:best.rad_msv,Flips:flips,WinnerChanges:win?"YES":"no",Impact:impact,_score:top+100*flips+1000*(win?1:0)})});
  return rows.sort((a,b)=>b._score-a._score)}
function plainSummary(tms,fms,infl,tw,fw){const lines=[],lab={};tms.forEach(m=>lab[m.id]=m.label);
  const tb=scorePaths(tms,TERRAIN_KEYS,tw)[0].id,fb=scorePaths(fms,FULL_KEYS,fw)[0].id;
  lines.push(`Terrain only, the best path is ${tb} (${lab[tb]}).`);lines.push(`With the assumptions added, the best path is ${fb} (${lab[fb]})`+(fb!==tb?" — the winner changed.":" — the same winner."));
  const nf=fms.filter(m=>m.hard_fail).length;
  if(nf){const rs={};fms.forEach(m=>m.fails.forEach(f=>{const k=f.includes("battery")?"battery reserve":(f.toLowerCase().includes("oxygen")?"oxygen":(f.includes("EVA")?"EVA time limit":"slope"));rs[k]=(rs[k]||0)+1}));
    lines.push(`${nf} of ${fms.length} paths break a hard rule once assumptions are added (${Object.entries(rs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${v}× ${k}`).join(", ")}). They look fine on terrain alone.`)}else lines.push("No path breaks a hard rule with the current assumptions.");
  if(infl&&infl.length){const top=infl.filter(r=>r.Impact==="HIGH").slice(0,3);lines.push(top.length?"Assumptions that matter most: "+top.map(r=>r.Assumption).join(", ")+".":"No single assumption (±25%) changes a pass/fail result or the winner.")}
  lines.push(`On average the suited walk takes ${(fms.reduce((s,m)=>s+m.time_min/m.ref_time_min,0)/fms.length).toFixed(1)}× the standard-hiker reference time.`);return lines}

return {pathSep,pathMaxSep,ALGOS,decodeData,makeGrid,rcToLonLat,lonLatToRc,buildM,planFeatures,measureTerrain,measureFull,runStage2,CRITERIA,TERRAIN_KEYS,FULL_KEYS,TERRAIN_PRIORITIES,FULL_PRIORITIES,
  scorePaths,explainRanking,formulaText,assumptionInfluence,plainSummary,fmtHm,freeCell,edt,corridorHeat,LAYER_STYLES,skyView}})();
if(typeof module!=='undefined')module.exports=ARES;
