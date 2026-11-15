import * as T from 'three';

// Model space uses the touchdown pads as y=0, with a five-metre solar span.
export function buildLander() {
  const hull = new T.Group();
  const metal = (color: number, metalness = .45, roughness = .42) =>
    new T.MeshStandardMaterial({ color, metalness, roughness });
  const ceramic = metal(0xe0dad0, .22), graphite = metal(0x30323a);
  const titanium = metal(0xbab8a6), blanket = metal(0xc89442, .55, .38);
  // Creases break up the specular highlights on the thermal blanket.
  const foil=document.createElement('canvas');
  foil.width=256;foil.height=128;
  const ink=foil.getContext('2d')!;
  ink.fillStyle='#bf995a';ink.fillRect(0,0,256,128);
  let seed=125;
  const noise=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<750;i++){
    const x=noise()*256,y=noise()*128,v=100+Math.floor(noise()*110);
    ink.fillStyle='rgb('+v+','+v+','+v+')';
    ink.beginPath();ink.moveTo(x,y);ink.lineTo(x+noise()*18,y-noise()*9);
    ink.lineTo(x+noise()*12,y+noise()*12);ink.fill();
  }
  const finish=new T.CanvasTexture(foil);
  finish.wrapS=T.RepeatWrapping; finish.repeat.set(4,1);
  blanket.bumpMap=finish;blanket.bumpScale=.028;
  const cell = metal(0x1e3048, .4, .24), grid = metal(0x8999a8);
  function part(geometry: T.BufferGeometry, material: T.Material, x: number, y: number, z: number, parent = hull) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }
  function rod(a: T.Vector3, b: T.Vector3, r: number, m: T.Material) {
    const direction = b.clone().sub(a);
    const middle = a.clone().lerp(b,.5);
    const mesh = part(new T.CylinderGeometry(r,r,direction.length(),7),m,middle.x,middle.y,middle.z);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
  }
  function drum(y: number, upper: number, lower: number, depth: number, m: T.Material) {
    return part(new T.CylinderGeometry(upper,lower,depth,8),m,0,y,0);
  }
  drum(1.12,.91,.74,.27,graphite);
  drum(1.48,.87,.91,.47,blanket);
  drum(1.75,.96,.96,.085,titanium);
  drum(1.93,.68,.81,.31,ceramic);
  drum(2.11,.69,.69,.055,graphite);
  for (let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    rod(new T.Vector3(.9*Math.sin(a),1.21,.9*Math.cos(a)),
        new T.Vector3(.87*Math.sin(a),1.73,.87*Math.cos(a)),.028,titanium);
  }
  const jets = new T.Group();
  hull.add(jets);
  const flame = new T.MeshBasicMaterial({color:0xffc08a,transparent:true,opacity:.82,depthWrite:false,blending:T.AdditiveBlending});
  for (let i=0;i<4;i++) {
    const a=Math.PI*(.25+i*.5), x=Math.cos(a), z=Math.sin(a);
    const pad=new T.Vector3(1.36*x,.10,1.36*z);
    rod(new T.Vector3(.72*x,1.49,.72*z),pad,.055,titanium);
    rod(new T.Vector3(.62*x,.98,.62*z),new T.Vector3(1.19*x,.43,1.19*z),.038,graphite);
    rod(new T.Vector3(.75*x-.34*z,1.29,.75*z+.34*x),pad,.026,titanium);
    part(new T.CylinderGeometry(.12,.24,.095,12),blanket,pad.x,.048,pad.z);
    part(new T.CylinderGeometry(.09,.19,.28,14),graphite,.5*x,.94,.5*z);
    const exhaust = part(new T.ConeGeometry(.14,.78,12),flame,.5*x,.43,.5*z,jets);
    exhaust.rotation.z=0;
  }
  for (const side of [-1,1]) {
    const wing = new T.Group();
    hull.add(wing);
    wing.position.set(side*.83,1.67,0);
    wing.rotation.z=side*.09;
    part(new T.BoxGeometry(.46,.075,.10),titanium,side*.18,0,0,wing);
    part(new T.BoxGeometry(1.56,.055,.85),titanium,side*1.12,0,0,wing);
    part(new T.BoxGeometry(1.50,.014,.79),cell,side*1.12,.04,0,wing);
    for(let i=0;i<9;i++) part(new T.BoxGeometry(.012,.015,.79),grid,side*(.39+i*.18),.054,0,wing);
    for (const z of [-.2,0,.2]) part(new T.BoxGeometry(1.50,.015,.009),grid,side*1.12,.054,z,wing);
  }
  // High-gain dish, feed horn, camera head and thermal radiator.
  const mast = new T.Vector3(-.32,2.44,0);
  rod(new T.Vector3(-.32,2.08,0),mast,.055,graphite);
  const dish = new T.Group();
  hull.add(dish);
  dish.position.copy(mast); dish.rotation.z=.65; dish.rotation.x=.38;
  const dishMat = metal(0xe4dcca,.42);
  dishMat.side=T.DoubleSide;
  part(new T.LatheGeometry([new T.Vector2(.01,0),new T.Vector2(.18,.04),
    new T.Vector2(.36,.14),new T.Vector2(.41,.19)],32),dishMat,0,0,0,dish);
  part(new T.CylinderGeometry(.014,.014,.29,8),graphite,0,.16,0,dish);
  part(new T.SphereGeometry(.05,8,6),blanket,0,.31,0,dish);
  rod(new T.Vector3(.43,2.05,.12),new T.Vector3(.43,2.68,.12),.045,titanium);
  part(new T.BoxGeometry(.34,.17,.22),ceramic,.43,2.68,.12);
  part(new T.CylinderGeometry(.061,.07,.06,16),graphite,.45,2.68,.25).rotation.x=Math.PI/2;
  for (let i=0;i<8;i++) part(new T.BoxGeometry(.04,.20,.16),graphite,-.23+i*.065,1.94,.727);
  return {hull,jets,flame,finish};
}
