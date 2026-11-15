// node tests/test_engine.js   (needs the backend running on :8000, or ARES_PAYLOAD=/path/payload.json)
const fs=require('fs'),A=require('../frontend/engine.js');
async function main(){
  let P;if(process.env.ARES_PAYLOAD)P=JSON.parse(fs.readFileSync(process.env.ARES_PAYLOAD));
  else P=await (await fetch((process.env.ARES_API||'http://localhost:8000')+'/api/payload')).json();
  const D=A.decodeData(P),TR={};P.TR_SPEC.forEach(s=>TR[s.key]=s.default);
  const g=A.makeGrid(D,TR,[]),tw={...A.TERRAIN_PRIORITIES.Balanced};
  const S=[Math.round(g.H*.55),Math.round(g.W*.05)],E=[Math.round(g.H*.42),Math.round(g.W*.9)];
  const t=Date.now(),pl=A.planFeatures(g,TR,S,E,P.PRESETS,tw);
  const ms=pl.cands.map(c=>A.measureTerrain(g,TR,c));
  console.assert(ms.length>=1&&ms.length<=3,'1-3 routes');console.assert(Object.keys(pl.byLayer).length>=5,'a route per layer');
  console.assert(ms.every(m=>m.dist_m>0&&isFinite(m.climb_m)),'finite metrics');
  const full=A.runStage2(g,TR,Object.fromEntries(P.A_SPEC.map(s=>[s.key,s.default])),ms);
  console.log('routes',ms.length,'of',pl.generated,'in',Date.now()-t,'ms | best',A.scorePaths(ms,A.TERRAIN_KEYS,tw)[0].id,'| stage2',full.length,'OK');
}
main().catch(e=>{console.error(e);process.exit(1)});
