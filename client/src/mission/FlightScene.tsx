import { useEffect, useRef } from 'react';

export const FLIGHT_MS = 10500;
type Flight = ReturnType<typeof import('./flight')['createFlight']>;

export function FlightScene({flying, reduced, onLanding}: {flying:boolean; reduced:boolean; onLanding:()=>void}) {
  const backdrop=useRef<HTMLDivElement>(null);
  const canvas=useRef<HTMLCanvasElement>(null);
  const engine=useRef<Flight|null>(null);
  const position=useRef(flying?0:1);
  const onEnd=useRef(onLanding);
  onEnd.current=onLanding;

  useEffect(()=>{
    const element=canvas.current!;
    if(reduced) return;
    let cancelled=false;
    const fallback=()=>{
      element.hidden=true;
      backdrop.current?.classList.remove('has-model');
    };
    function resize() { engine.current?.resize(); engine.current?.draw(position.current); }
    const observer=new ResizeObserver(resize);
    observer.observe(element.parentElement!);
    element.addEventListener('webglcontextlost',fallback);
    import('./flight').then(({createFlight})=>{
      if(cancelled) return;
      engine.current=createFlight(element);
      element.hidden=false;
      resize();
      backdrop.current?.classList.add('has-model');
    }).catch(fallback);
    return ()=>{
      cancelled=true;
      observer.disconnect();
      element.removeEventListener('webglcontextlost',fallback);
      engine.current?.dispose();engine.current=null;
      backdrop.current?.classList.remove('has-model');
    };
  },[reduced]);

  useEffect(()=>{
    const scene=backdrop.current!;
    let frame=0;
    const start=performance.now();
    function render(time:number) {
      const p=flying&&!reduced ? Math.min(1,(time-start)/FLIGHT_MS):1;
      position.current=p;
      const ramp=(n:number)=>Math.max(0,Math.min(1,n));
      const atmo=ramp((p-.37)/.20);
      scene.style.setProperty('--progress',String(p));
      scene.style.setProperty('--surface',String(ramp((p-.50)/.17)));
      scene.style.setProperty('--heat',String(Math.sin(Math.PI*atmo)*.86));
      scene.style.setProperty('--orbit',String(1-ramp((p-.47)/.17)));
      scene.style.setProperty('--planet-scale',String(.42+12*p*p*p));
      scene.style.setProperty('--cloud',String(Math.sin(Math.PI*ramp((p-.68)/.32))*.7));
      scene.style.setProperty('--touchdown',String(ramp((p-.74)/.24)));
      scene.style.setProperty('--craft-x',String(100*(p<.53?p/.53:1)-100)+'vw');
      scene.style.setProperty('--craft-y',String(-70*(1-ramp((p-.53)/.43)))+'vh');
      engine.current?.draw(p);
      if(p<1) frame=requestAnimationFrame(render);
      else if(flying) onEnd.current();
    }
    render(start);
    return ()=>cancelAnimationFrame(frame);
  },[flying,reduced]);
  return <div ref={backdrop} className="flight-scene" aria-hidden="true">
    <div className="space-field"/><div className="mars-orb"/>
    <div className="gale-surface"><div className="gale-photo"/><div className="ground-shadow"/></div>
    <div className="entry-light"/><img className="lander-poster" src="/mission/lander.webp" alt=""/>
    <canvas ref={canvas}/><div className="engine-dust"/><div className="wind-dust"/>
    <div className="scene-vignette"/>
  </div>;
}
