const P=window.ARES_PAYLOAD;   // loaded from the backend by index.html
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
let D=ARES.decodeData(P);const TR={},A={};P.TR_SPEC.forEach(s=>TR[s.key]=s.default);P.A_SPEC.forEach(s=>A[s.key]=s.default);
const ZONES=[];let zoneMode=false,famOnly=false,layerPick='';
let g=ARES.makeGrid(D,TR,ZONES),S=null,E=null,pl=null,tms=[],fms=[],sel=null,layer='height',infl=null,stage='full',prof={t:'Balanced',f:'Balanced'},tw={...ARES.TERRAIN_PRIORITIES.Balanced},fw={...ARES.FULL_PRIORITIES.Balanced},page=1;
const K=4,CR=ARES.CRITERIA,fmt=(k,v)=>CR[k]?CR[k].fmt(v):v;
const NAMES=['1 Pick','2 Terrain paths','3 Assumptions','4 What changed','5 Score','6 Path cards','7 Export & audit'];
const PROFILES={Balanced:'Balanced'};
$('nav').innerHTML=NAMES.map((n,i)=>`<button data-i="${i+1}">${n}</button>`).join('');
$('nav').onclick=e=>{const b=e.target.closest('button');if(b)go(+b.dataset.i)};
const banner=()=>{$('demo').innerHTML=P.isDemo?'<span class="demo">DEMO — not Mars</span> <span class="mut">'+esc(P.notes[0]||'')+'</span>':'<span class="mut">Real data: <b>'+esc(P.label)+'</b> · lat '+P.area.lat_min.toFixed(3)+' to '+P.area.lat_max.toFixed(3)+', lon '+P.area.lon_min.toFixed(3)+' to '+P.area.lon_max.toFixed(3)+' · grid cell '+Math.round(P.px)+' m · '+esc(P.sandLabel)+(P.notes.length?'<br>⚠ '+esc(P.notes.join(' ')):'')+'</span>'};banner();
function go(i){page=i;[...document.querySelectorAll('.pg')].forEach((p,j)=>p.classList.toggle('on',j+1===i));[...$('nav').children].forEach((b,j)=>b.classList.toggle('on',j+1===i));render()}
/* ---------- map: real imagery tiles + optional layers (zoom with wheel / buttons, drag to pan) ---------- */
const LAYERS=[['height','Height','dark = low, bright = high'],['slope','Slope','dark = flat, bright = steep'],['rough','Roughness','dark = smooth, bright = bumpy'],['hazard','Hazard','red blocked, orange risky, yellow rough'],['sand','Sand','light = sand mask'],['rad','Radiation (relative)','blue = shielded, red = hot zone'],['corridor','Route agreement','brighter = more routes use it'],['cost','Why: total cost','green = cheap to walk, red = expensive (all features mixed)']];
const ovl={height:false,slope:false,rough:false,hazard:false,sand:false,rad:false,corridor:false,cost:false};let ovlAlpha=0.6,lc={g:null},tileIdx=0,tilesOK=null,view=null,maps=[];
const tileCache={},TMAX=P.tileMaxZoom||7;let A0=P.area;
const ramp=t=>{t=Math.max(0,Math.min(1,t));return[Math.round(40+215*t),Math.round(30+150*t*t+40*t),Math.round(25+60*t*t)]};
const bestId=()=>{try{const r=ARES.scorePaths(tms,ARES.TERRAIN_KEYS,tw);return r.length?r[0].id:null}catch(e){return null}};
const pcol=id=>{if(id===bestId())return '#00e676';const i=pl?pl.cands.findIndex(c=>c.id===id):0;return ['#ffb300','#ab47bc','#29b6f6','#ef5350'][Math.max(i,0)%4]};
const clampv=(v,a,b)=>Math.max(a,Math.min(b,v));
function layerCanvas(name){if(lc.g!==g)lc={g:g};if(lc[name])return lc[name];const W=g.W,H=g.H,c=document.createElement('canvas');c.width=W*K;c.height=H*K;const x=c.getContext('2d'),im=x.createImageData(W*K,H*K);
 let cnt=null,nC=1;if(name==='corridor'&&pl){const raw=ARES.corridorHeat(g,pl.all);nC=Math.max(1,pl.all.length);cnt=new Uint16Array(W*H);for(let r=0;r<H;r++)for(let q=0;q<W;q++){let m=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const rr=r+a,qq=q+b;if(rr>=0&&qq>=0&&rr<H&&qq<W&&raw[rr*W+qq]>m)m=raw[rr*W+qq]}cnt[r*W+q]=m}}
 let arr=name==='height'?g.Z:name==='slope'?g.slope:name==='rough'?g.rough:null,lo=0,hi=1;if(arr){lo=Infinity;hi=-Infinity;for(const v of arr){if(v<lo)lo=v;if(v>hi)hi=v}}
 let cm=null,cLo=0,cHi=1;if(name==='cost'){cm=ARES.buildM(g,TR,P.PRESETS.Balanced);cLo=Infinity;cHi=-Infinity;for(const v of cm){if(v<cLo)cLo=v;if(v>cHi)cHi=v}}
 for(let r=0;r<H;r++)for(let q=0;q<W;q++){const i=r*W+q;let col;
  if(name==='height'){const t=(g.Z[i]-lo)/(hi-lo||1),sh=0.75+0.5*g.hill[i];col=ramp(t).map(v=>Math.min(255,v*sh))}
  else if(name==='slope'||name==='rough'){const v=Math.round(255*(arr[i]-lo)/(hi-lo||1));col=[v,v,v]}
  else if(name==='hazard'){const sl=g.slope[i];col=sl>TR.max_slope_deg?[220,40,40]:sl>TR.risky_slope_deg?[240,150,40]:g.rough[i]>TR.rough_threshold_m?[240,220,70]:[60,70,80]}
  else if(name==='rad'){const t=Math.max(0,Math.min(1,(g.rad[i]-g.radMin)/g.radDen));col=t<.5?[Math.round(60+390*t),Math.round(110+290*t),Math.round(220-340*t)]:[255,Math.round(255-380*(t-.5)),30]}
  else if(name==='cost'){const t=(cm[i]-cLo)/(cHi-cLo||1);col=[Math.round(40+215*t),Math.round(200-150*t),70]}
  else if(name==='corridor'){const k=cnt?cnt[i]:0,t=k/nC;col=k?[255,255,Math.round(60+195*t),Math.round(110+145*t)]:[0,0,0,0]}
  else col=g.sand[i]?[235,225,190]:[70,60,55];
  for(let a=0;a<K;a++)for(let b=0;b<K;b++){const o=((r*K+a)*W*K+q*K+b)*4;im.data[o]=col[0];im.data[o+1]=col[1];im.data[o+2]=col[2];im.data[o+3]=col[3]===undefined?255:col[3]}}
 x.putImageData(im,0,0);lc[name]=c;return c}
function getTile(z,row,col){const key=z+'/'+row+'/'+col;let t=tileCache[key];if(t)return t;t=tileCache[key]={img:null,fail:false};const urls=P.tileUrls||[];let i=tileIdx;
 const tryLoad=()=>{if(i>=urls.length){t.fail=true;if(tilesOK!==true)tilesOK=false;redrawAll();return}
  const im=new Image();im.onload=()=>{t.img=im;tilesOK=true;tileIdx=i;redrawAll()};im.onerror=()=>{if(tilesOK===true){t.fail=true;redrawAll()}else{i++;tryLoad()}};
  im.src=urls[i].replace('{z}',z).replace('{row}',row).replace('{col}',col)};tryLoad();return t}
let _raf=0;function redrawAll(){if(_raf)return;_raf=requestAnimationFrame(()=>{_raf=0;maps.forEach(m=>m.draw())})}
function fitView(W,H){const dl=A0.lon_max-A0.lon_min,dt=A0.lat_max-A0.lat_min;view={cx:(A0.lon_min+A0.lon_max)/2,cy:(A0.lat_min+A0.lat_max)/2,s:Math.min(W/(dl*1.3),H/(dt*1.3))};view.fit=view.s}
class MapView{constructor(cv){this.cv=cv;this.o={};this.drag=null;cv._mv=this;const m=this;
 cv.addEventListener('wheel',e=>{e.preventDefault();m.zoomAt(Math.pow(1.002,-e.deltaY),e.offsetX*cv.width/cv.clientWidth,e.offsetY*cv.height/cv.clientHeight)},{passive:false});
 cv.addEventListener('pointerdown',e=>{m.drag={x:e.clientX,y:e.clientY,cx:view.cx,cy:view.cy,moved:false};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),k=cv.width/r.width;if(m.drag){const dx=e.clientX-m.drag.x,dy=e.clientY-m.drag.y;if(Math.abs(dx)+Math.abs(dy)>4)m.drag.moved=true;if(m.drag.moved){view.cx=m.drag.cx-dx*k/view.s;view.cy=m.drag.cy+dy*k/view.s;redrawAll()}}
  const p=m.toGeo((e.clientX-r.left)*k,(e.clientY-r.top)*k);const c=document.getElementById(cv.id+'_pos');if(c)c.textContent=p[1].toFixed(4)+'°, '+p[0].toFixed(4)+'°'});
 cv.addEventListener('pointerup',e=>{const d=m.drag;m.drag=null;if(d&&!d.moved&&m.o.onPick){const r=cv.getBoundingClientRect(),k=cv.width/r.width,p=m.toGeo((e.clientX-r.left)*k,(e.clientY-r.top)*k);m.o.onPick(p[0],p[1])}})}
 toGeo(x,y){return[view.cx+(x-this.cv.width/2)/view.s,view.cy-(y-this.cv.height/2)/view.s]}
 toScr(lon,lat){return[this.cv.width/2+(lon-view.cx)*view.s,this.cv.height/2-(lat-view.cy)*view.s]}
 zoomAt(f,x,y){const[lo,la]=this.toGeo(x,y),ns=clampv(view.s*f,3,view.fit*12);view.s=ns;view.cx=lo-(x-this.cv.width/2)/ns;view.cy=la+(y-this.cv.height/2)/ns;redrawAll()}
 draw(){const cv=this.cv,x=cv.getContext('2d'),W=cv.width,H=cv.height,s=view.s;x.fillStyle='#2a2320';x.fillRect(0,0,W,H);x.imageSmoothingEnabled=true;
  if(tilesOK!==false){const tz=clampv(Math.ceil(Math.log2(s*180/256)),0,TMAX),td=180/Math.pow(2,tz),[l0,t0]=this.toGeo(0,0),[l1,t1]=this.toGeo(W,H);
   const c0=Math.floor((l0+180)/td),c1=Math.floor((l1+180)/td),r0=Math.floor((90-t0)/td),r1=Math.floor((90-t1)/td);
   if((c1-c0+1)*(r1-r0+1)<=80)for(let r=Math.max(0,r0);r<=Math.min(Math.pow(2,tz)-1,r1);r++)for(let c=Math.max(0,c0);c<=Math.min(Math.pow(2,tz+1)-1,c1);c++){
    const[sx,sy]=this.toScr(-180+c*td,90-r*td),sz=td*s,t=getTile(tz,r,c);
    if(t.img)x.drawImage(t.img,sx,sy,sz+1,sz+1);else{for(let up=1;up<=4&&tz-up>=0;up++){const pz=tz-up,pr=r>>up,pc=c>>up,pt=tileCache[pz+'/'+pr+'/'+pc];if(pt&&pt.img){const n=1<<up,w=pt.img.width/n,h=pt.img.height/n;x.drawImage(pt.img,(c%n)*w,(r%n)*h,w,h,sx,sy,sz+1,sz+1);break}}}}}
  const[ax,ay]=this.toScr(A0.lon_min,A0.lat_max),[bx,by]=this.toScr(A0.lon_max,A0.lat_min),act=Object.keys(ovl).filter(k=>ovl[k]);
  if(tilesOK===false&&!act.length){x.drawImage(layerCanvas('height'),ax,ay,bx-ax,by-ay)}
  act.forEach(k=>{x.globalAlpha=ovlAlpha;x.drawImage(layerCanvas(k),ax,ay,bx-ax,by-ay);x.globalAlpha=1});
  x.setLineDash([6,4]);x.strokeStyle='#fff';x.lineWidth=1.5;x.strokeRect(ax,ay,bx-ax,by-ay);x.setLineDash([]);
  ZONES.forEach(zn=>{const[zx,zy]=this.toScr(zn.lon,zn.lat),k=M_DEG(),rx=zn.radius_m/(k*Math.cos(zn.lat*Math.PI/180))*s,ry=zn.radius_m/k*s;x.beginPath();x.ellipse(zx,zy,Math.max(rx,2),Math.max(ry,2),0,0,7);x.fillStyle=zn.nogo?'rgba(150,0,0,.28)':'rgba(255,60,0,.18)';x.fill();x.setLineDash(zn.nogo?[]:[5,4]);x.strokeStyle='#ff3d00';x.lineWidth=2;x.stroke();x.setLineDash([]);x.fillStyle='#fff';x.font='bold 11px sans-serif';x.textAlign='center';x.fillText('☢ ×'+zn.mult+(zn.nogo?' no-go':''),zx,zy+4)});
  const P2=(r,c)=>{const[lo,la]=ARES.rcToLonLat(g,r,c);return this.toScr(lo,la)},pt=([lo,la],col,t)=>{const[px,py]=this.toScr(lo,la);x.fillStyle=col;x.beginPath();x.arc(px,py,9,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.font='bold 11px sans-serif';x.textAlign='center';x.fillText(t,px,py+4)};
  const o=this.o;if(o.paths&&pl){const bid=bestId();(o.list||fms).forEach(m=>{const cd=pl.cands.find(c=>c.id===m.id);if(!cd)return;const on=m.id===sel,isb=m.id===bid;x.beginPath();cd.path.forEach(([r,c],i)=>{const[px,py]=P2(r,c);i?x.lineTo(px,py):x.moveTo(px,py)});if(on){x.strokeStyle='#fff';x.lineWidth=7;x.stroke()}if(isb){x.strokeStyle='#fff';x.lineWidth=9;x.stroke()}x.strokeStyle=pcol(m.id);x.lineWidth=isb?5:(on?4:2.5);x.setLineDash(m.hard_fail?[7,5]:[]);x.stroke();x.setLineDash([])});
   const m=fms.find(m=>m.id===sel);if(m&&o.pnr&&m.pnr_idx!=null&&!m.pnr_none){const cd=pl.cands.find(c=>c.id===m.id),p=cd.path[Math.min(m.pnr_idx,cd.path.length-1)];if(p)pt(p,'#a020f0','N')}}
  if(o.paths&&pl&&pl.all&&pl.byLayer)Object.keys(ovl).filter(k=>ovl[k]&&pl.byLayer[k]).forEach(k=>{const cd=pl.all.find(c=>c.id===pl.byLayer[k]);if(!cd)return;x.beginPath();cd.path.forEach(([r,c],i)=>{const[px,py]=P2(r,c);i?x.lineTo(px,py):x.moveTo(px,py)});x.strokeStyle='#fff';x.lineWidth=8;x.stroke();x.strokeStyle='#00e5ff';x.lineWidth=4;x.setLineDash([8,4]);x.stroke();x.setLineDash([]);const mid=cd.path[cd.path.length>>1],[mx_,my_]=P2(mid[0],mid[1]);x.fillStyle='#00e5ff';x.font='bold 11px sans-serif';x.textAlign='center';x.fillText('best for '+k,mx_,my_-8)});
  if(S)pt(S,'#1976d2','S');if(E)pt(E,'#c62828','E');
  const km=(100/s)*(A0.lat_max-A0.lat_min>0?1:1);const mpx=(M_DEG()/s);x.fillStyle='rgba(0,0,0,.55)';x.fillRect(W-130,H-26,126,22);x.fillStyle='#fff';x.font='11px sans-serif';x.textAlign='left';const nice=[10,20,50,100,200,500,1000,2000,5000,10000,20000,50000,100000].find(v=>v/mpx>=50)||100000;x.fillRect(W-124,H-12,nice/mpx,3);x.fillText(nice>=1000?nice/1000+' km':nice+' m',W-124,H-16);
  const st=document.getElementById(cv.id+'_st');if(st)st.textContent=tilesOK===false?'⚠ NASA imagery could not load (no internet or tile address changed): showing the height map instead.':(tilesOK===null?'Loading NASA imagery…':'')}}
const M_DEG=()=>3396190*Math.PI/180;
function mapHTML(id,h){return `<div class="mapw"><canvas id="${id}" data-h="${h||520}"></canvas>
<div class="lyr"><button class="btn" id="${id}_lb">☰ Layers</button><div class="lpn" id="${id}_lp" style="display:none">${LAYERS.map(l=>`<label title="${l[2]}"><input type="checkbox" data-l="${l[0]}" ${ovl[l[0]]?'checked':''}> ${l[1]} <span class="mut">(${l[2]})</span></label>`).join('')}<label>Opacity <input type="range" min="0.1" max="1" step="0.05" value="${ovlAlpha}" data-o="1"></label></div></div>
<div class="zb"><button class="btn" data-z="1">＋</button><button class="btn" data-z="-1">－</button><button class="btn" data-z="0" title="Show the whole area">⌖</button></div>
<div class="cap"><span id="${id}_pos"></span></div></div><div class="mut" id="${id}_st"></div><div class="mut" style="font-size:11px">Imagery: NASA/JPL Mars Trek (Viking colour mosaic, 232 m per pixel: it gets blurry when zoomed in). Heights: ${esc(P.label)}. Scroll or use ＋ － to zoom, drag to move.</div>`}
function mapInit(id,opts){const cv=$(id);if(!cv)return null;const w=cv.parentElement.clientWidth||640;cv.width=Math.min(900,Math.max(320,w));cv.height=Math.round(+cv.dataset.h*Math.min(1,cv.width/640)||360);
 if(!view)fitView(cv.width,cv.height);const mv=cv._mv||new MapView(cv);mv.o=opts||{};maps.push(mv);
 const lb=$(id+'_lb'),lp=$(id+'_lp');lb.onclick=()=>{lp.style.display=lp.style.display==='none'?'block':'none'};
 lp.onchange=e=>{const t=e.target;if(t.dataset.l)ovl[t.dataset.l]=t.checked;redrawAll()};lp.oninput=e=>{if(e.target.dataset.o){ovlAlpha=+e.target.value;redrawAll()}};
 cv.parentElement.querySelector('.zb').onclick=e=>{const b=e.target.closest('button');if(!b)return;const z=+b.dataset.z;if(z===0){fitView(cv.width,cv.height);redrawAll()}else mv.zoomAt(z>0?1.5:1/1.5,cv.width/2,cv.height/2)};
 mv.draw();return mv}
function defaultRoute(){const H=g.H,W=g.W,cols=Math.round(1250/g.px),r1=Math.round(H*.55),c1=Math.round(W*.05),r2=Math.round(H*.42),c2=Math.min(W-2,c1+cols);S=ARES.rcToLonLat(g,r1,c1);E=ARES.rcToLonLat(g,r2,c2)}
function pickLL(lon,lat){if(zoneMode){addZone(lon,lat);return}const p=[lon,lat];if(!S||(S&&E)){S=p;E=null}else E=p;render()}
function zonesChanged(){g=ARES.makeGrid(D,TR,ZONES);lc={g:null};pl=null;tms=[];fms=[];render()}
function addZone(lon,lat){const r=parseFloat($('zr').value)||300,m=parseFloat($('zm').value)||3;ZONES.push({name:'Zone '+(ZONES.length+1),lon,lat,radius_m:Math.max(20,r),mult:Math.max(1,m),nogo:$('zn').checked});zoneMode=false;zonesChanged()}
function zoneList(){const el=$('zlist');if(!el)return;const zb=$('zpick');if(zb)zb.textContent=zoneMode?'Now click the map…':'Click map to place a zone';
 el.innerHTML=ZONES.length?ZONES.map((z,i)=>`<div>☢ ${esc(z.name)} · ${z.radius_m} m · ×${z.mult}${z.nogo?' · NO-GO':''} · ${z.lat.toFixed(4)}, ${z.lon.toFixed(4)} <button class="btn" data-zd="${i}">remove</button></div>`).join(''):'<span class="mut">No zones yet. Without a zone the radiation layer only shows terrain shielding, which differs very little over a few km.</span>';
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;ZONES.splice(+b.dataset.zd,1);zonesChanged()}}
const rcOf=p=>ARES.lonLatToRc(g,p[0],p[1]);
const mDist=(a,b)=>{const k=M_DEG(),la=(a[1]+b[1])/2*Math.PI/180;return Math.hypot((a[0]-b[0])*Math.cos(la)*k,(a[1]-b[1])*k)};
/* ---------- planning ---------- */
const inArea=p=>{const a=A0,mx=(a.lon_max-a.lon_min)*.03,my=(a.lat_max-a.lat_min)*.03;return p[0]>a.lon_min+mx&&p[0]<a.lon_max-mx&&p[1]>a.lat_min+my&&p[1]<a.lat_max-my};
let _lt=null;async function loadArea(){const t0=Date.now();try{await loadArea0()}finally{_lt=((Date.now()-t0)/1000)}}
async function loadArea0(){const r=await fetch((window.ARES_API||'')+'/api/load?slon='+S[0]+'&slat='+S[1]+'&elon='+E[0]+'&elat='+E[1]);
 if(!r.ok){let m='';try{m=(await r.json()).detail}catch(_){}throw new Error('Backend could not load map data: '+(m||r.status))}
 const pj=await r.json();if(!pj)throw new Error('The backend returned nothing.');
 const keep={tileUrls:P.tileUrls,tileMaxZoom:P.tileMaxZoom};Object.assign(P,pj,keep);window._pyT=pj.timing||null;D=ARES.decodeData(P);A0=P.area;g=ARES.makeGrid(D,TR,ZONES);lc={g:null};banner()}
let _pt=0;async function plan(){_lt=null;const tp=Date.now();if(!S||!E){alert('Pick START and END first.');return false}
 if(!(inArea(S)&&inArea(E))){const m=$('runmsg');if(m)m.textContent='Loading real height data for this part of Mars…';await loadArea()}
 const dm=mDist(S,E);if(dm/TR.leg_length_m>60){TR.leg_length_m=Math.ceil(dm/40/50)*50;const inp=document.querySelector('#trset [data-k=leg_length_m]');if(inp)inp.value=TR.leg_length_m}
 const Sr=rcOf(S),Er=rcOf(E);pl=ARES.planFeatures(g,TR,Sr,Er,P.PRESETS,tw);if(lc)lc.corridor=null;
 tms=pl.cands.map(c=>ARES.measureTerrain(g,TR,c));fms=ARES.runStage2(g,TR,A,tms);infl=null;_pt=(Date.now()-tp)/1000;sel=(ARES.scorePaths(tms,ARES.TERRAIN_KEYS,tw)[0]||{}).id;return true}
function recomputeFull(){if(tms.length){fms=ARES.runStage2(g,TR,A,tms);infl=null}}
/* ---------- pages ---------- */
function ll(p){return p[1].toFixed(4)+', '+p[0].toFixed(4)}
function p1(){const el=$('p1');if(!el.dataset.b){el.dataset.b=1;if(!S)defaultRoute();el.innerHTML=`<div class="card"><b>Click anywhere on Mars</b>: first click sets START (blue S), second sets END (red E), a third click starts over. Zoom out to see the whole planet. The dashed box is the area whose height data is loaded now; points outside it load a new area from the backend. A default walk of about 30 minutes is already set: press <b>Find paths</b>, or move the points.</div>
<div class="row"><div>${mapHTML('map1',520)}</div>
<div><div class="card"><div id="pick"></div>
<label class="s">START lat<input id="slat" type="number" step="0.0001"></label><label class="s">START lon<input id="slon" type="number" step="0.0001"></label>
<label class="s">END lat<input id="elat" type="number" step="0.0001"></label><label class="s">END lon<input id="elon" type="number" step="0.0001"></label>
<button class="btn" id="setll">Use typed values</button> <button class="btn" id="demoPick">Default 30-min route</button></div>
<div class="card"><b>Terrain rules</b> <span class="mut">(stage 1, no assumptions)</span><div id="trset"></div></div>
<div class="card"><b>☢ Radiation zones</b> <span class="mut">(hypothetical circles: the planner treats them as extra radiation; real Mars radiation does not come in circles)</span>
<label class="s">Radius (m)<input id="zr" type="number" value="300"></label><label class="s">Strength (× open-ground dose)<input id="zm" type="number" step="0.5" value="3"></label><label class="s">No-go (hard block)<input id="zn" type="checkbox"></label>
<button class="btn" id="zpick">Click map to place a zone</button> <button class="btn" id="zmid">Demo zone on the straight line</button><div id="zlist" style="margin-top:6px"></div></div>
<button class="btn pri" id="runb">Find paths</button> <span id="runmsg" class="mut"></span></div></div>`;
 $('setll').onclick=()=>{const v=id=>parseFloat($(id).value);if([v('slat'),v('slon'),v('elat'),v('elon')].some(isNaN))return;S=[v('slon'),v('slat')];E=[v('elon'),v('elat')];render()};
 $('demoPick').onclick=()=>{defaultRoute();render()};
 $('zpick').onclick=()=>{zoneMode=!zoneMode;zoneList()};
 $('zmid').onclick=()=>{if(!S||!E){alert('Pick START and END first.');return}const d=mDist(S,E);ZONES.push({name:'Zone '+(ZONES.length+1),lon:(S[0]+E[0])/2,lat:(S[1]+E[1])/2,radius_m:Math.max(60,Math.round(d*0.15/10)*10),mult:parseFloat($('zm').value)||3,nogo:$('zn').checked});zonesChanged()};
 $('runb').onclick=async()=>{$('runmsg').textContent='Working…';try{const t=Date.now();if(await plan()){$('runmsg').textContent=pl.cands.length+' routes in '+_pt.toFixed(1)+' s'+(_lt!=null?' (new map data: '+_lt.toFixed(1)+' s'+(window._pyT?' = download '+window._pyT.download+' s + layers '+window._pyT.layers+' s + transfer ≈ '+Math.max(0,_lt-window._pyT.download-window._pyT.layers-window._pyT.pack).toFixed(1)+' s':'')+')':' (map data already loaded: no download)');go(2)}else $('runmsg').textContent=''}catch(e){$('runmsg').textContent='⚠ '+e.message}};
 $('trset').innerHTML=settingsHTML(P.TR_SPEC,TR,'tr');bindSettings('trset',P.TR_SPEC,TR,()=>{g=ARES.makeGrid(D,TR,ZONES);lc={g:null};pl=null;tms=[];fms=[];render()})}
 mapInit('map1',{paths:false,onPick:pickLL});zoneList();
 let info='';if(S&&E){const d=mDist(S,E),mn=d/(A.flat_speed_kmh*1000/60);info=`<br>Straight line: <b>${(d/1000).toFixed(2)} km</b> ≈ <b>${mn<120?Math.round(mn)+' min':(mn/60).toFixed(1)+' h'}</b> on flat ground at ${A.flat_speed_kmh} km/h (real paths are longer)`+(d>8000?'<br><span class="wn">⚠ Long route: a suited walk this long will probably break the oxygen/battery rules. The planner still ranks it; check pages 4 and 6.</span>':'')+(inArea(S)&&inArea(E)?'':'<br><span class="mut">Outside the loaded area: new height data is fetched from the backend when you press Find paths.</span>')}
 $('pick').innerHTML=`START: <b>${S?ll(S):'not set'}</b><br>END: <b>${E?ll(E):'not set'}</b>${info}`}
function settingsHTML(spec,obj,pre){let h='',grp='';spec.forEach(s=>{if(s.group!==grp){grp=s.group;h+=`<h2>${esc(grp)}</h2>`}
 const inp=s.kind==='choice'?`<select data-k="${s.key}">${(s.options||[]).map(o=>`<option ${o==obj[s.key]?'selected':''}>${esc(o)}</option>`).join('')}</select>`:`<input data-k="${s.key}" type="number" step="any" min="${s.lo??''}" max="${s.hi??''}" value="${obj[s.key]}">`;
 h+=`<label class="s" title="${esc(s.note)}"><span>${esc(s.label)} <span class="mut">(${esc(s.unit)})</span></span>${inp}</label>`});return h}
function bindSettings(id,spec,obj,cb){$(id).onchange=e=>{const k=e.target.dataset.k;if(!k)return;const s=spec.find(x=>x.key===k);obj[k]=s.kind==='choice'?e.target.value:parseFloat(e.target.value);cb()}}
function tbl(rows,cols,clickable){return `<div class="sc"><table><tr>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr>${rows.map(r=>`<tr class="${clickable?'cl':''} ${r.id===sel?'sel':''}" data-id="${r.id}">${cols.map(c=>`<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</table></div>`}
const need=()=>!pl?'<div class="card">Pick START and END on page 1 and press <b>Find paths</b>.</div>':'';
function selRows(el){el.querySelectorAll('tr.cl').forEach(r=>r.onclick=()=>{sel=r.dataset.id;render()})}
const LAYER_BEST=[['','— choose a layer —',null],['cost','Why: total cost (the best route)',null],['height','Height: least climbing','climb_m'],['slope','Slope: flattest ground','mean_slope_deg'],['rough','Roughness: smoothest','pct_rough'],['hazard','Hazard: most clearance','risk'],['sand','Sand: least sand','pct_sand'],['rad','Radiation: lowest exposure','rad_idx']];
function p2(){const el=$('p2');if(!pl){el.innerHTML=need();return}
 const rk=ARES.scorePaths(tms,ARES.TERRAIN_KEYS,tw),order=rk.map(r=>r.id),bid=order[0],rows=order.map(id=>tms.find(m=>m.id===id));
 el.innerHTML=`<div class="card">Terrain only. No crew, oxygen or battery assumptions are used on this page. Reference time is Tobler's rule for an unburdened Earth hiker, not a suited astronaut.</div>
 <div class="card" id="spread"></div>
 <div class="card"><label>Layer view (heat map + the route built only for that layer): <select id="lbs">${LAYER_BEST.map(x=>`<option value="${x[0]}" ${x[0]===layerPick?'selected':''}>${x[1]}</option>`).join('')}</select></label><div id="lbmsg" style="margin-top:6px"></div></div>
 <div class="row"><div>${mapHTML("map2",460)}</div><div id="t2"></div></div><h2>Leg table for ${esc(sel||'')}</h2><div id="legs2"></div>`;
 mapInit('map2',{paths:true,list:rows});
 $('spread').innerHTML=`<b>★ ${esc(bid)} is the best route</b> (thick green line, lowest terrain score). It was picked from ${pl.generated} routes, each built for ONE feature (shortest, least climb, flattest, smoothest, most clearance, least sand, lowest radiation, balanced). The other ${rows.length-1} shown are the most useful alternatives. <span class="mut">Dashed = fails a hard rule.</span>${pl.notes.length?'<div class="wn">'+pl.notes.map(esc).join('<br>')+'</div>':''}`;
 const lm=$('lbmsg');
 if(!layerPick)lm.innerHTML='<span class="mut">Pick a layer: the map shows its heat map and the route built only for that layer (dotted cyan) next to the best route (green). The ☰ Layers button on the map does the same.</span>';
 else if(layerPick==='cost')lm.innerHTML=`Heat map = the price of walking over each square, all features mixed (green = cheap, red = expensive). The best route <b>${esc(bid)}</b> bends toward the cheap squares.`;
 else{const spec=LAYER_BEST.find(x=>x[0]===layerPick),k=spec[2],bm=tms.find(m=>m.id===bid),aid=pl.byLayer[layerPick],am=pl.allM.find(m=>m.id===aid);
  if(!am)lm.innerHTML='<span class="wn">No route for this layer'+(layerPick==='sand'&&!g.hasSand?': no sand mask is loaded.':'.')+'</span>';
  else{const same=ARES.pathSep(pl.all.find(c=>c.id===aid).path,pl.cands.find(c=>c.id===bid).path)<1.5,p=(am.dist_m/bm.dist_m-1)*100;
   lm.innerHTML=same?`The best route <b>${esc(bid)}</b> already follows the best route for this layer (${esc(CR[k].label)} ${fmt(k,bm[k])}).`:`Route built only for <b>${esc(spec[1].split(':')[0])}</b> (dotted cyan): ${esc(CR[k].label)} <b>${fmt(k,am[k])}</b> against <b>${fmt(k,bm[k])}</b> on the best route ${esc(bid)}, but it is ${Math.abs(p)<1?'the same length':Math.abs(p).toFixed(0)+'% '+(p>0?'longer':'shorter')}. The best route trades this layer against the others.`}}
 $('lbs').onchange=e=>{layerPick=e.target.value;Object.keys(ovl).forEach(k=>ovl[k]=false);if(layerPick)ovl[layerPick]=true;render()};
 $('t2').innerHTML=tbl(rows,[['#',r=>order.indexOf(r.id)+1],['Path',r=>`<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${pcol(r.id)};vertical-align:-2px"></span> `+(r.id===bid?'★ ':'')+esc(r.id)+' '+esc(r.label)],['Why this route',r=>`<span style="white-space:normal;display:inline-block;min-width:260px">${esc((pl.why&&pl.why[r.id])||'')}</span>`],['Dist',r=>fmt('dist_m',r.dist_m)],['Ref time',r=>ARES.fmtHm(r.ref_time_min)],['Climb',r=>fmt('climb_m',r.climb_m)],['Max slope',r=>fmt('max_slope_deg',r.max_slope_deg)],['Steep',r=>fmt('pct_steep',r.pct_steep)],['Sand',r=>fmt('pct_sand',r.pct_sand)],['Rad',r=>fmt('rad_idx',r.rad_idx)],['Problems',r=>r.problems.length?r.problems.map(p=>`<span class="${p[0]==='HIGH'?'bad':'wn'}">${p[0]}</span> ${esc(p[1].slice(0,70))}…`).join('<br>'):'<span class="ok">none</span>']],true);
 selRows($('t2'));const m=tms.find(x=>x.id===sel);if(m)$('legs2').innerHTML=`<div class="mut">${esc(m.head)}</div>`+tbl(m.legs.map((l,i)=>({...l,id:i})),Object.keys(m.legs[0]).map(k=>[esc(k),r=>typeof r[k]==='number'?r[k].toFixed(1):esc(r[k])]),false)}
function p3(){const el=$('p3');if(!el.dataset.b){el.dataset.b=1;el.innerHTML=`<div class="card">Assumptions are guesses about the crew, suit and rover. They are applied to the <b>same paths</b> without searching again. Changing a value updates every other page. Defaults decide a lot: check the battery size and power draw with your team.</div><div id="aset"></div><button class="btn" id="areset">Reset to defaults</button>`;
  $('aset').innerHTML=settingsHTML(P.A_SPEC,A,'a');bindSettings('aset',P.A_SPEC,A,()=>{recomputeFull();$('amsg').textContent=''});
  $('areset').onclick=()=>{P.A_SPEC.forEach(s=>A[s.key]=s.default);$('aset').innerHTML=settingsHTML(P.A_SPEC,A,'a');recomputeFull()};el.insertAdjacentHTML('beforeend','<div id="amsg"></div>')}
 }
function p4(){const el=$('p4');if(!pl){el.innerHTML=need();return}
 const rt=ARES.scorePaths(tms,ARES.TERRAIN_KEYS,tw),rf=ARES.scorePaths(fms,ARES.FULL_KEYS,fw),rkT={},rkF={};rt.forEach(r=>rkT[r.id]=r.rank);rf.forEach(r=>rkF[r.id]=r.rank);
 el.innerHTML=`<h2>Before and after the assumptions</h2><div id="b4"></div><h2>Which assumptions matter most?</h2><div class="mut">Each assumption is moved ±25%, one at a time. Takes a few seconds.</div><button class="btn" id="inflb">${infl?'Recompute':'Run sensitivity test'}</button><div id="inf"></div><h2>Summary</h2><div id="sum"></div>`;
 $('b4').innerHTML=tbl(fms,[['Path',r=>esc(r.id)+' '+esc(r.label)],['Ref time',r=>ARES.fmtHm(r.ref_time_min)],['Suited time',r=>ARES.fmtHm(r.time_min)],['Oxygen used',r=>fmt('o2_used_pct',r.o2_used_pct)],['Battery used',r=>fmt('batt_used_pct',r.batt_used_pct)],['Rank (terrain)',r=>rkT[r.id]],['Rank (full)',r=>rkF[r.id]],['Result',r=>r.hard_fail?`<span class="bad">FAIL</span> ${esc((r.fails||[]).join('; '))}`:'<span class="ok">pass</span>']],false);
 const draw=()=>{if(!infl)return;$('inf').innerHTML=tbl(infl.slice(0,12).map((r,i)=>({...r,id:i})),[['Assumption',r=>esc(r.Assumption)],['Now',r=>r.Now+' '+esc(r.Unit)],['Affects',r=>esc(r.Affects)],['Paths flipping pass/fail',r=>r.Flips],['Winner changes',r=>r.WinnerChanges],['Impact',r=>`<b class="${r.Impact==='HIGH'?'bad':r.Impact==='MEDIUM'?'wn':'mut'}">${r.Impact}</b>`]],false);
  $('sum').innerHTML=ARES.plainSummary(tms,fms,infl,tw,fw).map(l=>`<p>${esc(l)}</p>`).join('')};draw();
 $('inflb').onclick=()=>{$('inflb').textContent='Working…';setTimeout(()=>{infl=ARES.assumptionInfluence(g,TR,A,P.A_SPEC,tms,fw);draw();$('inflb').textContent='Recompute'},30)}}
function p5(){const el=$('p5');if(!pl){el.innerHTML=need();return}
 const T=stage==='terrain',keys=T?ARES.TERRAIN_KEYS:ARES.FULL_KEYS,W=T?tw:fw,pr=T?ARES.TERRAIN_PRIORITIES:ARES.FULL_PRIORITIES,ms=T?tms:fms;
 const rk=ARES.scorePaths(ms,keys,W),ex=ARES.explainRanking(rk,keys,W);
 el.innerHTML=`<div class="card">Stage: <select id="stg"><option value="terrain" ${T?'selected':''}>Terrain only</option><option value="full" ${!T?'selected':''}>With assumptions</option></select> Priority: <select id="prf">${Object.keys(pr).map(k=>`<option ${k===prof[T?'t':'f']?'selected':''}>${k}</option>`).join('')}</select>
 <div class="mut" style="margin-top:6px">${esc(ARES.formulaText(keys,W))}</div></div>
 <div class="row"><div class="card" id="wsl"></div><div id="rk"></div></div>`;
 $('wsl').innerHTML=keys.map(k=>`<label class="s"><span>${CR[k].label} <b>${((W[k]||0)*100).toFixed(0)}</b></span><input type="range" min="0" max="1" step="0.01" data-k="${k}" value="${W[k]||0}"></label>`).join('');
 $('rk').innerHTML=tbl(rk.map(r=>{const e=ex.strengths.find(s=>s.id===r.id)||{};const m=ms.find(x=>x.id===r.id);return {id:r.id,label:r.label,rank:r.rank,score:r.score,fail:m.hard_fail,st:e.Strengths,wk:e.Weaknesses}}),[['#',r=>r.rank],['Path',r=>esc(r.id)+' '+esc(r.label)],['Score',r=>r.score.toFixed(3)],['Hard rules',r=>r.fail?'<span class="bad">not recommended</span>':'<span class="ok">ok</span>'],['Strengths',r=>esc(r.st||'')],['Weaknesses',r=>esc(r.wk||'')]],true);selRows($('rk'));
 $('stg').onchange=e=>{stage=e.target.value;render()};
 $('prf').onchange=e=>{const k=e.target.value;prof[T?'t':'f']=k;Object.keys(W).forEach(x=>delete W[x]);Object.assign(W,pr[k]);render()};
 $('wsl').oninput=e=>{const k=e.target.dataset.k;if(!k)return;W[k]=parseFloat(e.target.value);const r2=ARES.scorePaths(ms,keys,W);clearTimeout(window._t);window._t=setTimeout(render,120)}}
function p6(){const el=$('p6');if(!pl){el.innerHTML=need();return}
 const m=fms.find(x=>x.id===sel)||fms[0];sel=m.id;
 el.innerHTML=`<div class="card">Path: <select id="ps">${fms.map(x=>`<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(x.id)} ${esc(x.label)}${x.hard_fail?' (fails)':''}</option>`).join('')}</select> ${m.hard_fail?'<b class="bad">NOT RECOMMENDED</b>':'<b class="ok">passes hard rules</b>'}<div class="mut">${esc(m.head)}</div></div>
 <div class="row"><div>${mapHTML("map6",460)}</div><div><div class="card"><table>
 <tr><td>Suited walk time</td><td>${ARES.fmtHm(m.time_min)}</td></tr><tr><td>Oxygen used / left</td><td>${m.o2_used_pct.toFixed(0)}% / ${m.o2_left_pct.toFixed(0)}%</td></tr>
 <tr><td>Battery used / left</td><td>${m.batt_used_pct.toFixed(0)}% / ${m.batt_left_pct.toFixed(0)}%</td></tr><tr><td>Radiation</td><td>${m.rad_msv.toFixed(3)} mSv</td></tr>
 <tr><td>Return trip</td><td>${ARES.fmtHm(m.rt_time_min)} · O₂ ${m.rt_o2_pct.toFixed(0)}% · battery ${m.rt_batt_pct.toFixed(0)}%</td></tr>
 <tr><td>Point of no return</td><td>${m.pnr_none?'none: full return is possible':m.pnr_km.toFixed(1)+' km (purple N on map)'}</td></tr><tr><td>Full return OK</td><td>${m.full_return_ok?'<span class="ok">yes</span>':'<span class="bad">no</span>'}</td></tr></table></div>
 ${(m.fails||[]).map(f=>`<div class="bad">✗ ${esc(f)}</div>`).join('')}${(m.warns||[]).map(w=>`<div class="wn">⚠ ${esc(w[0])}</div>`).join('')}</div></div>
 <h2>Height profile</h2><canvas id="prof" width="900" height="180"></canvas><h2>Legs</h2><div id="lg"></div>`;
 $('ps').onchange=e=>{sel=e.target.value;render()};mapInit('map6',{paths:true,pnr:true,list:fms});
 const c=$('prof'),x=c.getContext('2d'),z=m.arr.z,d=m.arr.cumd,zl=Math.min(...z),zh=Math.max(...z),dm=d[d.length-1]||1;x.fillStyle=getComputedStyle(document.body).color;x.strokeStyle='#ff7a45';x.lineWidth=2;x.beginPath();z.forEach((v,i)=>{const px=10+d[i]/dm*880,py=165-(v-zl)/(zh-zl||1)*140;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.font='11px sans-serif';x.fillText(zh.toFixed(0)+' m',12,14);x.fillText(zl.toFixed(0)+' m',12,178);x.fillText((dm/1000).toFixed(1)+' km',850,178);
 if(m.legs_full)$('lg').innerHTML=tbl(m.legs_full.map((l,i)=>({...l,id:i})),Object.keys(m.legs_full[0]).map(k=>[esc(k),r=>typeof r[k]==='number'?r[k].toFixed(1):esc(r[k])]),false)}
function p7(){const el=$('p7');if(!pl){el.innerHTML=need();return}
 const keys=['id','label','origin','fam','hard_fail','dist_m','ref_time_min','climb_m','max_slope_deg','pct_steep','pct_sand','risk','time_min','o2_used_pct','batt_used_pct','rad_msv','rad_idx','pnr_km'];
 const csv=[keys.join(',')].concat(fms.map(m=>keys.map(k=>typeof m[k]==='number'?+m[k].toFixed(3):'"'+String(m[k]).replace(/"/g,'""')+'"').join(','))).join('\n');
 const audit={terrain_data:P.label,sand:P.sandLabel,is_demo:P.isDemo,start:S&&ll(S),end:E&&ll(E),terrain_rules:TR,assumptions:A,weights:{terrain:tw,full:fw},radiation_zones:ZONES};
 el.innerHTML=`<div class="card">${P.isDemo?'<b class="wn">DEMO — not Mars.</b> ':''}Results table (CSV). Select all and copy.</div><textarea id="csv" readonly>${esc(csv)}</textarea><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText($('csv').value)">Copy CSV</button>
 <h2>Audit: every setting behind these numbers</h2><textarea id="aud" readonly>${esc(JSON.stringify(audit,null,1))}</textarea><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText($('aud').value)">Copy audit</button>`}
function render(){maps=[];[null,p1,p2,p3,p4,p5,p6,p7][page]()}
go(1);
