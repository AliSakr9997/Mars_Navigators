const camera={zoom:1,left:0,top:0};
let fieldExtent=null;
fetch('/api/field/extent').then(r=>r.ok?r.json():null).then(e=>{fieldExtent=e;draw()}).catch(()=>{});
function mapGeo(point){
  if(!point||!fieldExtent)return '';
  const {west,east,north,south}=fieldExtent;
  return (north+point[1]*(south-north)).toFixed(4)+'°, '+(west+point[0]*(east-west)).toFixed(4)+'° E';
}
function cameraBox(){
  return [map.x+camera.left*map.w,map.y+camera.top*map.h,map.w/camera.zoom,map.h/camera.zoom].join(' ');
}
function mapWindow(content){
  return '<svg id="map-window" x="'+map.x+'" y="'+map.y+'" width="'+map.w+'" height="'+map.h+'" viewBox="'+cameraBox()+'" overflow="hidden">'+content+'</svg>';
}
function setZoom(multiplier){
  const prev=camera.zoom;
  camera.zoom=Math.max(1,Math.min(8,prev*multiplier));
  moveCamera(camera.left+0.5/prev-0.5/camera.zoom,camera.top+0.5/prev-0.5/camera.zoom);
}
function moveCamera(left,top){
  const max=1-1/camera.zoom;
  camera.left=Math.max(0,Math.min(max,left));
  camera.top=Math.max(0,Math.min(max,top));
  document.querySelector('#map-window')?.setAttribute('viewBox',cameraBox());
}
function mapPoint(event){
  const viewport=document.querySelector('#map-window');
  const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(viewport.getScreenCTM().inverse());
  return [(p.x-map.x)/map.w,(p.y-map.y)/map.h];
}
let pan=null, ignoreClick=false;
document.addEventListener('pointerdown',event=>{
  if(!event.target.closest('#map-target'))return;
  ignoreClick=false;
  if(camera.zoom===1)return;
  const box=document.querySelector('#map-window').getBoundingClientRect();
  pan={x:event.clientX,y:event.clientY,left:camera.left,top:camera.top,box,id:event.pointerId};
  event.target.setPointerCapture(event.pointerId);
});
document.addEventListener('pointermove',event=>{
  if(!pan||event.pointerId!==pan.id)return;
  const dx=event.clientX-pan.x,dy=event.clientY-pan.y;
  if(Math.hypot(dx,dy)<4&&!ignoreClick)return;
  ignoreClick=true;
  moveCamera(pan.left-dx/(pan.box.width*camera.zoom),pan.top-dy/(pan.box.height*camera.zoom));
});
for(const type of ['pointerup','pointercancel'])document.addEventListener(type,()=>{pan=null});
function endpointField(s,key,y,label){
  const current=s[key+'n'],point=s[key];
  const options=waypoints.concat(fieldMission.sites.map(site=>({n:site.name,p:[site.x,site.y]})));
  const select='<foreignObject x="1248" y="'+(y-8)+'" width="365" height="40"><select xmlns="http://www.w3.org/1999/xhtml" aria-label="'+label+'" data-endpoint="'+key+'"><option selected disabled>'+esc(point?current:'Choose on map or pick a waypoint')+'</option><option value="map">Pick on map…</option>'+options.map((w,i)=>'<option value="'+i+'">'+esc(w.n)+'</option>').join('')+'</select></foreignObject>';
  return meta(1164,y+15,label.toUpperCase())+select+txt(1249,y+53,mapGeo(point),14,C.muted,400,true);
}
document.addEventListener('change',event=>{
  const key=event.target.dataset?.endpoint;
  if(key!=='a'&&key!=='b')return;
  if(event.target.value==='map'){state.selecting=key;}
  else{
    const all=waypoints.concat(fieldMission.sites.map(s=>({n:s.name,p:[s.x,s.y]})));
    const w=all[Number(event.target.value)];
    if(!w)return;
    setPoint(key,w.p,w.n);
    state.selecting=!state.a?'a':!state.b?'b':null;
    generation++;modelRoutes=null;modelStatus='Fallback';
  }
  savePoints();draw();
});
function reserve(r,key,hours){
  if(!r)return '—';
  const reading=suitSample()[key];
  const initial=Number.isFinite(reading)?reading:100;
  return Math.max(0,Math.round(initial-r.time/(hours*60)*100))+'%';
}

