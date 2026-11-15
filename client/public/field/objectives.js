// The site names refer to Curiosity observations. Geometry and hazards are scenario data.
const missionGroups = [
  {name:'General exploration',short:'Explore',desc:'Choose what to survey on the surface.',items:[
    ['Surface reconnaissance','Survey accessible exposures and photograph the terrain.','Bradbury Landing','Rocknest'],
    ['Ancient water','Inspect rocks preserving evidence of flowing or standing water.','Hottah','Yellowknife Bay']]},
  {name:'Mineral search',short:'Minerals',desc:'Choose a mineral or mineral group to investigate.',items:[
    ['Clay minerals','Investigate mudstones sampled by the Curiosity drill.','John Klein','Cumberland'],
    ['Jarosite','Compare sulfate-bearing drill targets at Pahrump Hills.','Mojave 2','Confidence Hills'],
    ['Hematite','Survey iron-oxide-bearing rocks on lower Mount Sharp.','Confidence Hills','Vera Rubin Ridge']]},
  {name:'Regional survey',short:'Regions',desc:'Choose the kind of terrain to investigate.',items:[
    ['Dune fields','Compare dune morphology in the Bagnold dune field.','High Dune','Namib Dune'],
    ['Sedimentary outcrops','Examine bedding and erosion in exposed rock.','Pahrump Hills','Murray Buttes']]}
];
const sites={
 'Bradbury Landing':[303,271],'Rocknest':[478,205],'Hottah':[219,234],'Yellowknife Bay':[548,257],
 'John Klein':[310,213],'Cumberland':[419,168],'Mojave 2':[352,251],'Confidence Hills':[479,226],
 'Vera Rubin Ridge':[565,145],'High Dune':[256,207],'Namib Dune':[491,173],
 'Pahrump Hills':[317,201],'Murray Buttes':[595,221]
};
const hazards=[['Rock steps','Loose gravel'],['Broken ledges','Loose gravel'],['Sloping bedrock','Uneven footing'],
 ['Loose scree','Cross-slope'],['Rock steps','Cross-slope'],['Soft sand','Dune margin'],['Loose scree','Rock steps']];
const terrainWidth=670,terrainHeight=445;
const modeledSites = new Map();
function missionRoutes(group,item){
 if(modeledSites.has(group+"-"+item)) return modeledSites.get(group+"-"+item);
 const row=missionGroups[group].items[item], idx=missionGroups.slice(0,group).reduce((n,g)=>n+g.items.length,0)+item;
 return row.slice(2).map((site,k)=>{
   const [x,y]=sites[site], start=[92,352];
   const trail=k? [start,[151,368],[216,340],[281,350],[x-86,y+75],[x-46,y+65],[x,y]] :
     [start,[132,312],[192,324],[x-65,y+46],[x-35,y+30],[x,y]];
   const km=trail.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-trail[i][0],p[1]-trail[i][1]),0)*.008;
   const risk=k?12+idx:28+idx*3;
   return {site,trail,km,risk,hazard:hazards[idx][k],minutes:Math.round(km*31),code:k?'B':'A'};
 });
}
function missionView(key,texture){
 const parts=key.split('-'),mode=parts[0],g=Number(parts[1]||0),i=Number(parts[2]||0),sel=Number(parts[3]||0);
 const group=missionGroups[g],item=group.items[i], slate='#0d1b2b', line='#2a4358', paper='#e7f2fa', muted='#9ab0c2', cyan='#78deed',amber='#f8bd85';
 const shapes=[],hits=[];const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 function rect(x,y,w,h,c,r=0,stroke='none'){shapes.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+c+'" stroke="'+stroke+'"/>')}
 function text(x,y,value,size=16,c=paper,weight=400,mono=false){shapes.push('<text x="'+x+'" y="'+y+'" font-family="'+(mono?'IBM Plex Mono, monospace':'Inter, Arial, sans-serif')+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+c+'">'+esc(value)+'</text>')}
 function path(d,c,w=2,dash=''){shapes.push('<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>')}
 function dot(x,y,r,c,stroke){shapes.push('<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'" stroke="'+stroke+'" stroke-width="2"/>')}
 function hit(x,y,w,h,label,to){hits.push({x,y,w,h,label,to})}
 function button(x,y,w,label,to){rect(x,y,w,38,slate,5,line);text(x+14,y+24,label,14);hit(x,y,w,38,label,to)}
 rect(0,0,1280,800,'#07111f');rect(0,0,1280,73,'#0b1929');path('M0 73H1280',line,1);
 text(45,46,'ARES–GALE',25,paper,700);text(236,44,'Surface operations',16,muted);
 button(1055,18,180,'Mission control  ↗','dashboard');
 text(45,111,'MISSION PLANNING   /   GALE CRATER',13,cyan,400,true);
 text(44,169,mode==='goals'?'Choose a mission':mode==='targets'?group.name:item[0],43,paper,650);
 text(45,207,mode==='goals'?'Set the purpose of your EVA to find matching sites and compare routes.':mode==='targets'?group.desc:item[1],18,muted);
 if(mode==='goals'||mode==='targets'){
 if(mode==='targets')button(1055,126,180,'←  All missions','goals');
 const choices=mode==='goals'?missionGroups.map(g=>[g.name,g.desc,g.items.map(it=>it[0]).join('  ·  ')]):group.items.map(it=>[it[0],it[1],it.slice(2).join('  /  ')]);
 choices.forEach(([name,desc,examples],j)=>{
 const y=255+j*151;rect(45,y,1190,125,slate,8,line);rect(45,y+17,3,90,[cyan,amber,'#b9b2ef'][j],1);
 text(71,y+47,name,26,paper,650);text(72,y+82,desc,16,muted);text(663,y+68,examples,15,'#c4d3df');text(1181,y+72,'→',24,cyan);
 hit(45,y,1190,125,name,mode==='goals'?'targets-'+j:'map-'+g+'-'+j+'-0');
 });
 }else{
 button(1055,126,180,'←  Change target','targets-'+g);
 const routes=missionRoutes(g,i),chosen=routes[sel],mx=45,my=253;
 rect(mx,my,670,445,'#27333b',7,line);
 if(texture)shapes.push('<image x="'+mx+'" y="'+my+'" width="670" height="445" preserveAspectRatio="xMidYMid slice" href="'+texture+'"/>');
 else {for(let n=0;n<18;n++){let d='';for(let k=0;k<=38;k++){let x=k*670/38,y=14+n*24+12*Math.sin(k*.20+n*.43)+7*Math.cos(k*.55+n*.28);y=Math.max(2,Math.min(443,y));d+=(k?' L':'M')+(mx+x).toFixed(1)+' '+(my+y).toFixed(1)}path(d,'#394955',1)}}
 rect(mx+14,my+14,224,32,'#0a1726',4);text(mx+26,my+36,'EVA TRAVERSE  /  SCHEMATIC',12,cyan,400,true);
 routes.forEach((r,j)=>{let d=r.trail.map((pt,k)=>(k?'L':'M')+(mx+pt[0])+' '+(my+pt[1])).join(' ');path(d,'#101c28',7);path(d,j===sel?cyan:'#f4bd85',j===sel?4:3,j===sel?'':'7 6')});
 routes.forEach((r,j)=>{const [x,y]=sites[r.site],px=mx+x,py=my+y;dot(px,py,13,j===sel?'#0e414e':'#462f26',j===sel?cyan:amber);text(px-5,py+5,r.code,14,paper,700);const left=Math.min(mx+terrainWidth-r.site.length*8-31,px+16);rect(left,py-32,r.site.length*8+20,25,'#0a1726',4);text(left+8,py-14,r.site,13,paper,500);hit(px-17,py-18,34,36,r.site,'map-'+g+'-'+i+'-'+j)});
 dot(mx+92,my+352,9,'#f5f2e7','#192937');text(mx+22,my+385,'EVA START',14,paper,650,true);
 text(mx,my+477,chosen.source||'Scenario preview · illustrative positions and routes.',14,muted);
 text(755,279,'Matching sites',24,paper,650);text(755,307,'Sorted by route distance from EVA Start',15,muted);
 routes.forEach((r,j)=>{let y=333+125*j;rect(752,y,483,108,j===sel?'#102838':slate,6,j===sel?cyan:line);text(773,y+30,r.code+'   '+r.site,19,paper,650);text(773,y+58,[r.km===Math.min(...routes.map(v=>v.km))?'NEAREST SITE':'',r.risk===Math.min(...routes.map(v=>v.risk))?'LOWEST RISK':''].filter(Boolean).join('  /  ')||'ALTERNATE SITE',12,j===0?cyan:amber,500,true);text(773,y+87,r.km.toFixed(2)+' km    '+r.minutes+' min    '+r.risk+'% risk score',15,paper,400,true);hit(752,y,483,108,r.site,'map-'+g+'-'+i+'-'+j)});
 text(755,614,'Selected route  /  '+chosen.code,17,cyan,600);text(755,650,'Terrain hazard: '+chosen.hazard,19,paper,550);
 text(755,684,'Risk is a simulated terrain score (0–100%).',14,muted);
 }
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">'+shapes.join('')+'</svg>';return {key,svg,hits};
}
if(typeof module!=='undefined')module.exports={missionView,missionGroups,missionRoutes};

