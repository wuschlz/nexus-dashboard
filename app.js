import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const team = [
  ['James','Leitung',true],
  ['Nora','Mail',false],
  ['Kevin','Recherche',false],
  ['Gisela','Wissen',false],
  ['Lina','Kalender',false],
  ['Walter','Technik',false],
  ['Sarah','Kontakte',false],
  ['Finn','Follow-ups',false],
];

const teamList = document.getElementById('teamList');
for (const [name, role, ready] of team) {
  const el = document.createElement('div');
  el.className = 'person' + (name === 'James' ? ' selected' : '');
  el.innerHTML = `
    <div class="avatar">${name.slice(0,2).toUpperCase()}</div>
    <div><div class="person-name">${name}</div><div class="person-role">${role}</div></div>
    <span class="person-state ${ready ? 'ready' : ''}" title="${ready ? '3D ready' : '3D asset pending'}"></span>`;
  el.addEventListener('click', () => {
    document.querySelectorAll('.person').forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('inspectorName').textContent = name;
    document.getElementById('inspectorRole').textContent = role;
    document.getElementById('assetState').textContent = ready ? 'geladen' : 'noch offen';
    document.getElementById('inspectorStatus').textContent = ready ? 'Ready' : '3D Asset pending';
  });
  teamList.appendChild(el);
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('viewTitle').textContent = btn.textContent;
  });
});

const feed = document.getElementById('activityFeed');
const entries = [
  ['Preview','James 3D-Asset geladen'],
  ['Preview','Animationen: Idle · Walk · Wave'],
  ['Preview','Backend-Verbindung noch deaktiviert'],
];
for (const [time,text] of entries) {
  const d = document.createElement('div');
  d.className = 'activity-item';
  d.innerHTML = `<div class="activity-time">${time}</div><div class="activity-text">${text}</div>`;
  feed.appendChild(d);
}

const canvas = document.getElementById('officeCanvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1017);
scene.fog = new THREE.Fog(0x0b1017, 13, 26);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(9.5, 8.5, 10.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1.1, 0);
controls.minDistance = 6;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.47;

scene.add(new THREE.HemisphereLight(0xc9dcff, 0x25303d, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 4.2);
key.position.set(4,8,6);
key.castShadow = true;
key.shadow.mapSize.set(2048,2048);
scene.add(key);

function mat(color, rough=.65, metal=.0, transparent=false, opacity=1){
  return new THREE.MeshStandardMaterial({color, roughness:rough, metalness:metal, transparent, opacity});
}
function box(name, size, pos, color, rough=.7, metal=0){
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color,rough,metal));
  m.name=name; m.position.set(...pos); m.castShadow=true; m.receiveShadow=true; scene.add(m); return m;
}
function cylinder(size, pos, color){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(size[0],size[1],size[2],24),mat(color,.75));
  m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}

box('floor',[15,.18,10],[0,-.09,0],0x1b222c,.92);
box('backWall',[15,3.4,.18],[0,1.7,-5],0x18202a,.86);
box('leftWall',[.18,3.4,10],[-7.5,1.7,0],0x141b24,.9);

const rug = new THREE.Mesh(new THREE.PlaneGeometry(6.5,4.0), mat(0x222d3a,.98));
rug.rotation.x=-Math.PI/2; rug.position.set(-1.1,.015,.5); scene.add(rug);

const desks = [
  [-3.8,.72,-2.8],[-.9,.72,-2.8],[2.0,.72,-2.8],[4.9,.72,-2.8],
  [-3.8,.72,2.0],[-.9,.72,2.0],[2.0,.72,2.0],[4.9,.72,2.0]
];
for (let i=0;i<desks.length;i++){
  const [x,y,z]=desks[i];
  box(`desk${i}`,[2.15,.12,1.05],[x,y,z],0x5b4332,.6);
  box(`legL${i}`,[.12,1.38,.8],[x-.85,.02,z],0x222831,.55,.25);
  box(`legR${i}`,[.12,1.38,.8],[x+.85,.02,z],0x222831,.55,.25);
  box(`monitor${i}`,[.86,.53,.06],[x,1.2,z-.18],0x0a0d12,.28,.35);
  box(`screen${i}`,[.77,.44,.01],[x,1.2,z-.145],0x164268,.35,.05);
  box(`stand${i}`,[.08,.35,.08],[x,.94,z-.18],0x222831,.45,.35);
}

for (const [x,,z] of desks){
  cylinder([.34,.34,.10],[x,.46,z+.65],0x222933);
  box('chairBack',[.72,.86,.10],[x,.92,z+.93],0x222933,.85);
}

const glassMat = new THREE.MeshPhysicalMaterial({
  color:0x9ed7ff, roughness:.12, metalness:0, transmission:.5, transparent:true, opacity:.32,
  clearcoat:1, side:THREE.DoubleSide
});
function glass(size,pos){
  const g=new THREE.Mesh(new THREE.BoxGeometry(...size),glassMat); g.position.set(...pos); scene.add(g); return g;
}
glass([4.0,2.7,.06],[4.8,1.35,.1]);
glass([.06,2.7,3.8],[2.82,1.35,-1.78]);
box('meetingTable',[2.7,.12,1.25],[4.8,.73,-1.75],0x433628,.58);
for (const z of [-1.15,-2.35]) {
  cylinder([.3,.3,.08],[4.1,.45,z],0x202831);
  cylinder([.3,.3,.08],[5.5,.45,z],0x202831);
}

for (const [x,z] of [[-6.6,-4.1],[6.6,3.9],[2.7,4.0]]) {
  cylinder([.32,.38,.48],[x,.24,z],0x3a332b);
  cylinder([.05,.05,.95],[x,.82,z],0x35543b);
  for (let i=0;i<5;i++){
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),mat(0x2d6b4b,.9));
    leaf.scale.set(.7,1.8,.42);
    leaf.position.set(x + Math.sin(i*1.25)*.25, .95+i*.09, z + Math.cos(i*1.25)*.2);
    leaf.rotation.z=i*.55; scene.add(leaf);
  }
}

for (const x of [-4.6,0,4.6]){
  const p = new THREE.PointLight(0x8cc8ff,3.1,7,2);
  p.position.set(x,3.0,0); scene.add(p);
}

let james = null;
let mixer = null;
let actions = {};
let currentAction = null;
let travelling = false;
let travel = null;
let last = performance.now();

const locations = {
  desk: new THREE.Vector3(-3.8,0,-1.95),
  meeting: new THREE.Vector3(4.0,0,-.75)
};

function log(text){
  const item = document.createElement('div');
  item.className='activity-item';
  const t = new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  item.innerHTML=`<div class="activity-time">${t}</div><div class="activity-text">${text}</div>`;
  feed.prepend(item);
  while(feed.children.length>3) feed.removeChild(feed.lastChild);
}

function setActiveButton(id){
  document.querySelectorAll('.scene-actions .chip').forEach(x=>x.classList.remove('active'));
  const b=document.getElementById(id); if(b) b.classList.add('active');
}
function play(name, loop=true){
  if(!actions[name]) return;
  if(currentAction && currentAction !== actions[name]) currentAction.fadeOut(.22);
  const a = actions[name];
  a.reset().setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
  a.clampWhenFinished = !loop;
  a.fadeIn(.22).play();
  currentAction=a;
  document.getElementById('currentAnim').textContent=name;
  log(`James → ${name}`);
}

new GLTFLoader().load(
  './assets/James_NEXUS_Animated.glb',
  gltf => {
    james = gltf.scene;
    james.position.copy(locations.desk);
    james.scale.setScalar(1);
    james.traverse(o=>{
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true}
    });
    scene.add(james);
    mixer = new THREE.AnimationMixer(james);
    for(const clip of gltf.animations){
      actions[clip.name]=mixer.clipAction(clip);
    }
    const names = Object.keys(actions);
    if(!actions['Neutral Idle'] && names[0]) actions['Neutral Idle']=actions[names[0]];
    if(!actions['Standard Walk'] && names[1]) actions['Standard Walk']=actions[names[1]];
    if(!actions['Waving'] && names[2]) actions['Waving']=actions[names[2]];
    play('Neutral Idle',true);
    document.getElementById('loading').style.display='none';
    log('James 3D geladen');
  },
  undefined,
  err => {
    console.error(err);
    document.getElementById('loading').textContent='James konnte nicht geladen werden.';
    document.getElementById('assetState').textContent='Fehler';
  }
);

function travelTo(targetName){
  if(!james || travelling) return;
  travelling=true;
  const from=james.position.clone();
  const to=locations[targetName].clone();
  const delta=to.clone().sub(from);
  const dist=delta.length();
  if(dist<.1){travelling=false;play('Neutral Idle',true);return}
  const dir=delta.clone().normalize();
  james.rotation.y=Math.atan2(dir.x,dir.z);
  travel={from,to,start:performance.now(),duration:Math.max(1800,dist*700),targetName};
  play('Standard Walk',true);
}
document.getElementById('idleBtn').addEventListener('click',()=>{travelling=false;play('Neutral Idle',true);setActiveButton('idleBtn')});
document.getElementById('walkBtn').addEventListener('click',()=>{travelling=false;play('Standard Walk',true);setActiveButton('walkBtn')});
document.getElementById('waveBtn').addEventListener('click',()=>{travelling=false;play('Waving',false);setActiveButton('waveBtn')});
document.getElementById('meetingBtn').addEventListener('click',()=>{travelTo('meeting');setActiveButton('meetingBtn')});
document.getElementById('deskBtn').addEventListener('click',()=>{travelTo('desk');setActiveButton('deskBtn')});

function resize(){
  const rect=canvas.getBoundingClientRect();
  const w=Math.max(1,Math.floor(rect.width));
  const h=Math.max(1,Math.floor(rect.height));
  if(canvas.width!==w || canvas.height!==h){
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
  }
}
function animate(now){
  requestAnimationFrame(animate);
  resize();
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(mixer) mixer.update(dt);

  if(travelling && travel && james){
    const t=Math.min(1,(now-travel.start)/travel.duration);
    const smooth=t*t*(3-2*t);
    james.position.lerpVectors(travel.from,travel.to,smooth);
    if(t>=1){
      travelling=false;
      james.position.copy(travel.to);
      play('Neutral Idle',true);
      setActiveButton('idleBtn');
      log(`James angekommen: ${travel.targetName==='desk'?'Schreibtisch':'Meetingraum'}`);
    }
  }
  controls.update();
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
