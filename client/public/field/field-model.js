let modelRoutes = null;
let modelStatus = 'Fallback';
let generation = 0;
let surfaceData = null;
function routeKey() { return JSON.stringify([state.a,state.b,state.max]); }
async function computeModel() {
  const current = ++generation;
  const key = routeKey();
  modelRoutes = null;
  modelStatus = 'Computing';
  draw();
  try {
    const results = await Promise.all(['Safest (max clearance)','Shortest distance','Balanced'].map(async mode => {
      const response = await fetch('/api/field/traverse', {method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({start:state.a,end:state.b,max_slope:state.max,mode})});
      if (!response.ok) throw new Error(response.status === 422 ? 'No feasible path' : 'Fallback');
      return response.json();
    }));
    if (generation !== current || routeKey() !== key) return;
    modelRoutes = {key,results};
    modelStatus = 'Model · SIM';
  } catch(error) {
    if (generation !== current || routeKey() !== key) return;
    modelStatus = error.message === 'No feasible path' ? 'No feasible path' : 'Fallback';
    if (modelStatus === 'No feasible path') state.computed=false;
  }
  state.hover=null; draw();
}
function suitSample() {
  try { return JSON.parse(localStorage.getItem('ares-gale-suit-v1') || '[]')[0] || {}; }
  catch { return {}; }
}
window.addEventListener('DOMContentLoaded',()=>fetch('/api/telemetry').then(r=>r.ok?r.json():null).then(data=>{surfaceData=data;draw()}).catch(()=>{}));

