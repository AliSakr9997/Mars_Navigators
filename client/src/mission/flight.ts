import * as T from 'three';
import { buildLander } from './lander';

const ease = (value: number) => {
  const t = Math.min(1,Math.max(0,value));
  return t*t*(3-2*t);
};

export function createFlight(canvas: HTMLCanvasElement) {
  const renderer = new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0,0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.toneMapping=T.ACESFilmicToneMapping;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34,1,.1,120);
  const {hull,jets,flame,finish} = buildLander();
  scene.add(hull,new T.HemisphereLight(0xffecda,0xa46d4e,1.9));
  const sun = new T.DirectionalLight(0xffddb1,3.6);
  sun.position.set(-4,6,4); scene.add(sun);
  const rim = new T.DirectionalLight(0xc4daff,2);
  rim.position.set(3,2,-4); scene.add(rim);
  const entry = new T.PointLight(0xff5927,0,18);
  scene.add(entry);
  const stars = new Float32Array(1050*3);
  let seed=417;
  function random() {seed=(seed*16807)%2147483647; return seed/2147483647;}
  for(let i=0;i<stars.length;i+=3) {
    stars[i]=(random()-.5)*110; stars[i+1]=(random()-.5)*62; stars[i+2]=-12-random()*70;
  }
  const starGeo = new T.BufferGeometry();
  starGeo.setAttribute('position',new T.BufferAttribute(stars,3));
  const starMat = new T.PointsMaterial({size:.054,color:0xfbe9d3,transparent:true,depthWrite:false});
  scene.add(new T.Points(starGeo,starMat));
  const dustCount=175;
  const motes=Array.from({length:dustCount},()=>({angle:random()*Math.PI*2,speed:.6+random(),offset:random()}));
  const dustGeo=new T.BufferGeometry();
  const dustPositions=new T.Float32BufferAttribute(new Float32Array(dustCount*3),3);
  dustGeo.setAttribute('position',dustPositions);
  const dustMat=new T.PointsMaterial({color:0xe6ba89,size:.036,transparent:true,depthWrite:false});
  const dust=new T.Points(dustGeo,dustMat);
  dust.frustumCulled=false;
  scene.add(dust);
  const destination = new T.Vector3();

  function resize() {
    const {width,height}=canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
  }
  function draw(p: number) {
    const approach=ease(p/.40), descent=ease((p-.55)/.43), arrival=ease((p-.55)/.24);
    const mobile=camera.aspect<.85;
    camera.position.set(1.1-.95*approach,1.8+.7*approach,.0+9.3+1.4*descent);
    camera.lookAt(0,1.2,0);
    const width=2*Math.tan(T.MathUtils.degToRad(17))*camera.position.z*camera.aspect;
    destination.set((mobile?.19:.235)*width, mobile?-1.34:-1.38,0);
    hull.position.set(T.MathUtils.lerp(-width*.87,-width*.14,approach),.5+1.2*approach,1.6-2.5*approach);
    hull.position.x=T.MathUtils.lerp(hull.position.x,destination.x,arrival);
    hull.position.z=T.MathUtils.lerp(hull.position.z,0,arrival);
    hull.position.y=T.MathUtils.lerp(hull.position.y,destination.y,descent);
    hull.rotation.set(.25*(1-descent),-.9+approach*.57+descent*.78,-.27*(1-descent));
    hull.scale.setScalar((mobile?.64:1)*(.80+.16*descent));
    entry.position.copy(hull.position);entry.position.z+=1.7;
    entry.intensity=12*Math.sin(Math.PI*ease((p-.34)/.30));
    jets.visible=p>.47 && p<.975;
    flame.opacity=(.7+.14*Math.sin(p*500))*(1-ease((p-.90)/.075));
    dust.visible=p>.65&&p<1;
    if(dust.visible) {
      dust.position.copy(destination);
      dustMat.opacity=.55*Math.sin(Math.PI*ease((p-.65)/.35));
      motes.forEach(({angle,speed,offset},i)=>{
        const age=(offset+(p-.65)*4*speed)%1;
        const distance=.25+age*3.5;
        dustPositions.setXYZ(i,Math.cos(angle)*distance,.11+.37*Math.sin(age*Math.PI),Math.sin(angle)*distance*.6);
      });
      dustPositions.needsUpdate=true;
    }
    starMat.opacity=1-ease((p-.39)/.19);
    renderer.render(scene,camera);
  }
  resize();
  return {draw,resize,dispose(){
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
    scene.traverse(object=>{
      if (object instanceof T.Mesh || object instanceof T.Points) {
        geometries.add(object.geometry);
        for (const m of Array.isArray(object.material)?object.material:[object.material]) materials.add(m);
      }
    });
    geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose());
    finish.dispose();renderer.dispose();
  }};
}
