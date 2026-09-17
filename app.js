(() => {
  const loading = document.getElementById('loading');
  const feed = document.getElementById('activityFeed');

  function log(text) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    const t = new Date().toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    item.innerHTML = `<div class="activity-time">${t}</div><div class="activity-text">${text}</div>`;
    feed.prepend(item);
    while (feed.children.length > 3) feed.removeChild(feed.lastChild);
  }

  const team = [
    ['James','Leitung',true], ['Nora','Mail',false], ['Kevin','Recherche',false], ['Gisela','Wissen',false],
    ['Lina','Kalender',false], ['Walter','Technik',false], ['Sarah','Kontakte',false], ['Finn','Follow-ups',false],
  ];
  const teamList = document.getElementById('teamList');
  for (const [name,role,ready] of team) {
    const el = document.createElement('div');
    el.className = 'person' + (name === 'James' ? ' selected' : '');
    el.innerHTML = `<div class="avatar">${name.slice(0,2).toUpperCase()}</div><div><div class="person-name">${name}</div><div class="person-role">${role}</div></div><span class="person-state ${ready?'ready':''}"></span>`;
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

  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('viewTitle').textContent = btn.textContent;
  }));

  log('Office v2 wird aufgebaut');
  if (!window.BABYLON) {
    loading.textContent = '3D-Engine konnte nicht geladen werden.';
    document.getElementById('assetState').textContent = 'Engine-Fehler';
    return;
  }

  const canvas = document.getElementById('officeCanvas');
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer:false, stencil:true }, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.025,0.04,0.065,1);
  scene.environmentIntensity = 0.7;

  const camera = new BABYLON.ArcRotateCamera('camera', Math.PI/4.25, 1.02, 18.2, new BABYLON.Vector3(0,1.15,-0.2), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 24;
  camera.lowerBetaLimit = 0.48;
  camera.upperBetaLimit = 1.35;
  camera.wheelPrecision = 55;
  camera.pinchPrecision = 135;
  camera.panningSensibility = 0;

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0,1,0), scene);
  hemi.intensity = 1.18;
  hemi.diffuse = new BABYLON.Color3(0.78,0.88,1.0);
  hemi.groundColor = new BABYLON.Color3(0.08,0.1,0.14);
  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.45,-1,-0.3), scene);
  sun.position = new BABYLON.Vector3(8,11,8);
  sun.intensity = 1.55;

  function material(name, hex, rough=0.74, metal=0) {
    const m = new BABYLON.PBRMaterial(name, scene);
    m.albedoColor = BABYLON.Color3.FromHexString(hex);
    m.roughness = rough;
    m.metallic = metal;
    return m;
  }
  function box(name,w,h,d,x,y,z,hex,rough=0.74,metal=0,rot=0) {
    const mesh = BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    mesh.position.set(x,y,z); mesh.rotation.y = rot; mesh.material = material(name+'Mat',hex,rough,metal); return mesh;
  }
  function cyl(name,diameter,height,x,y,z,hex,rough=0.78,metal=0) {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:24},scene);
    mesh.position.set(x,y,z); mesh.material = material(name+'Mat',hex,rough,metal); return mesh;
  }
  function glass(name,w,h,d,x,y,z,rot=0) {
    const m = new BABYLON.PBRMaterial(name+'Mat',scene);
    m.albedoColor = new BABYLON.Color3(0.38,0.68,0.9); m.alpha = 0.17; m.roughness = 0.08; m.metallic = 0;
    const mesh = BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    mesh.position.set(x,y,z); mesh.rotation.y=rot; mesh.material=m; return mesh;
  }
  function plane(name,w,d,x,z,hex) {
    return box(name,w,0.035,d,x,0.015,z,hex,0.96,0);
  }
  function plant(name,x,z,s=1) {
    cyl(name+'Pot',0.52*s,0.42*s,x,0.21*s,z,'#4b4035');
    cyl(name+'Stem',0.08*s,0.78*s,x,0.68*s,z,'#2e5e47');
    for(let i=0;i<6;i++) {
      const leaf = BABYLON.MeshBuilder.CreateSphere(name+'Leaf'+i,{diameter:0.34*s,segments:10},scene);
      leaf.scaling.set(0.65,1.65,0.45);
      leaf.position.set(x+Math.cos(i*1.08)*0.18*s,0.93*s+i*0.04*s,z+Math.sin(i*1.08)*0.15*s);
      leaf.rotation.z=i*0.5; leaf.material=material(name+'LeafMat'+i,'#4e9a73',0.9,0);
    }
  }
  function chair(name,x,z,rot=0) {
    cyl(name+'Base',0.52,0.08,x,0.38,z,'#242c37',0.7,0.1);
    box(name+'Stem',0.07,0.34,0.07,x,0.57,z,'#28323d',0.55,0.18,rot);
    box(name+'Seat',0.58,0.11,0.58,x,0.78,z,'#566374',0.88,0,rot);
    const dx = Math.sin(rot)*0.24, dz = Math.cos(rot)*0.24;
    box(name+'Back',0.62,0.78,0.1,x-dx,1.14,z-dz,'#616f82',0.9,0,rot);
  }
  function desk(name,x,z,rot=0,exec=false) {
    const w=exec?2.4:1.9, d=exec?1.12:0.92;
    box(name+'Top',w,0.10,d,x,0.76,z,exec?'#755d49':'#b9ad9d',exec?0.54:0.7,0,rot);
    const pts=[[-w/2+0.13,-d/2+0.13],[-w/2+0.13,d/2-0.13],[w/2-0.13,-d/2+0.13],[w/2-0.13,d/2-0.13]];
    pts.forEach(([lx,lz],i)=>{
      const px=x+lx*Math.cos(rot)-lz*Math.sin(rot), pz=z+lx*Math.sin(rot)+lz*Math.cos(rot);
      box(name+'Leg'+i,0.11,1.4,0.11,px,0.02,pz,'#3d4653',0.55,0.15,rot);
    });
  }
  function monitor(name,x,z,rot=0) {
    box(name+'Frame',0.84,0.5,0.055,x,1.18,z,'#111720',0.28,0.32,rot);
    box(name+'Screen',0.76,0.42,0.012,x,1.18,z+0.034*Math.cos(rot),'#194d78',0.34,0.03,rot);
    box(name+'Stand',0.07,0.32,0.07,x,0.92,z,'#252d38',0.48,0.3,rot);
  }
  function sofa(name,x,z,rot=0) {
    box(name+'Seat',1.65,0.28,0.72,x,0.43,z,'#3e4b5d',0.9,0,rot);
    const dx=Math.sin(rot)*0.28,dz=Math.cos(rot)*0.28;
    box(name+'Back',1.65,0.7,0.14,x-dx,0.78,z-dz,'#46566a',0.92,0,rot);
    box(name+'ArmL',0.16,0.46,0.72,x-0.74*Math.cos(rot),0.54,z-0.74*Math.sin(rot),'#46566a',0.92,0,rot);
    box(name+'ArmR',0.16,0.46,0.72,x+0.74*Math.cos(rot),0.54,z+0.74*Math.sin(rot),'#46566a',0.92,0,rot);
  }

  box('floor',20,0.18,14,0,-0.09,0,'#1e2732',0.95,0);
  box('backWall',20,3.8,0.18,0,1.9,-7,'#151d27',0.9,0);
  box('leftWall',0.18,3.8,14,-10,1.9,0,'#121922',0.92,0);
  box('rightWall',0.18,3.8,7,10,1.9,-3.5,'#121922',0.92,0);
  plane('teamRug',7.2,5.2,0.4,0.4,'#263343');
  plane('leadRug',4.2,3.4,-6.2,2.7,'#1b2634');
  plane('loungeRug',4.1,3.2,-6.3,-3.8,'#1b2531');
  plane('meetingRug',5.2,4.4,6.2,-3.5,'#1b2938');

  box('brandPanel',5.6,1.15,0.05,-6.1,2.45,-6.86,'#253d5b',0.42,0.18);
  box('brandLineA',4.6,0.12,0.05,0.4,2.85,-6.86,'#2b405a',0.4,0.2);
  box('brandLineB',3.2,0.12,0.05,6.8,2.85,-6.86,'#2b405a',0.4,0.2);
  for (const x of [-6,-2,2,6]) { const p=new BABYLON.PointLight('accent'+x,new BABYLON.Vector3(x,3.25,0),scene); p.diffuse=new BABYLON.Color3(0.38,0.65,1); p.intensity=0.75; p.range=8; }

  desk('leadDesk',-6.25,2.75,0,true);
  monitor('leadMon',-6.0,2.42,0);
  chair('leadChair',-6.25,3.65,0);
  box('leadSide',1.25,0.54,0.52,-7.55,0.27,2.45,'#27313c',0.62,0.1);
  box('leadDecorA',0.18,0.7,0.18,-7.82,0.91,2.43,'#355777',0.45,0.22);
  box('leadDecorB',0.18,0.44,0.18,-7.3,0.78,2.43,'#446d84',0.45,0.18);
  plant('leadPlant',-8.15,4.9,1.0);

  const pod=[[-2.0,-0.7,0],[1.6,-0.7,Math.PI],[-2.0,2.15,0],[1.6,2.15,Math.PI]];
  pod.forEach(([x,z,r],i)=>{ desk('pod'+i,x,z,r,false); monitor('podMon'+i,x,z+(r===0?-0.13:0.13),r); chair('podChair'+i,x,z+(r===0?0.78:-0.78),r); });
  box('podDivider',0.10,1.0,4.2,-0.2,0.5,0.7,'#263544',0.66,0.14,Math.PI/2);
  plant('podPlant',3.5,4.8,0.9);

  sofa('loungeA',-6.6,-4.3,0);
  sofa('loungeB',-4.55,-3.25,-Math.PI/2);
  box('coffee',1.0,0.10,0.66,-5.55,0.36,-3.8,'#6b5947',0.58,0);
  box('loungeSide',0.6,0.55,0.6,-7.85,0.28,-3.15,'#28313c',0.62,0.12);
  plant('loungePlant',-8.15,-5.6,1.1);
  plant('loungePlant2',-3.8,-5.5,0.85);

  glass('meetGlassL',0.06,2.8,4.6,3.55,1.4,-3.5);
  glass('meetGlassBack',5.3,2.8,0.06,6.2,1.4,-5.78);
  glass('meetGlassFront',5.3,2.8,0.06,6.2,1.4,-1.22);
  desk('meetTable',6.2,-3.5,0,true);
  chair('meetChairL',5.05,-3.5,Math.PI/2);
  chair('meetChairR',7.35,-3.5,-Math.PI/2);
  chair('meetChairT',6.2,-2.45,Math.PI);
  chair('meetChairB',6.2,-4.55,0);
  box('meetScreen',1.85,1.05,0.07,8.72,1.75,-3.5,'#152536',0.32,0.28,Math.PI/2);

  desk('rightDeskA',6.9,1.7,Math.PI,false); monitor('rightMonA',6.9,1.83,Math.PI); chair('rightChairA',6.9,0.92,Math.PI);
  desk('rightDeskB',6.9,4.25,Math.PI,false); monitor('rightMonB',6.9,4.38,Math.PI); chair('rightChairB',6.9,3.48,Math.PI);
  plant('rightPlant',8.65,5.55,0.95);

  glass('receptionGlass',0.06,1.75,2.7,-3.65,0.88,3.7);
  box('consoleTable',1.8,0.62,0.48,-3.15,0.31,5.15,'#2a333e',0.6,0.12);

  const locations = {
    desk: new BABYLON.Vector3(-5.75,0,2.6),
    meeting: new BABYLON.Vector3(4.85,0,-3.5),
  };

  let jamesRoot=null, groups={}, travel=null;
  function setActiveButton(id){ document.querySelectorAll('.scene-actions .chip').forEach(x=>x.classList.remove('active')); const b=document.getElementById(id); if(b)b.classList.add('active'); }
  function play(name,loop){ const g=groups[name]; if(!g)return; Object.values(groups).forEach(x=>{if(x!==g)x.stop();}); g.loopAnimation=!!loop; g.start(!!loop,1,g.from,g.to,false); document.getElementById('currentAnim').textContent=name; log('James → '+name); }
  function resolveAnimations(list){ const names=list.map(g=>g.name); list.forEach(g=>{groups[g.name]=g;g.stop();}); if(!groups['Neutral Idle']&&list[0])groups['Neutral Idle']=list[0]; if(!groups['Standard Walk']&&list[1])groups['Standard Walk']=list[1]; if(!groups['Waving']&&list[2])groups['Waving']=list[2]; log('Animationen erkannt: '+names.join(' · ')); }

  loading.textContent='James wird geladen …';
  BABYLON.SceneLoader.ImportMeshAsync('', './assets/', 'James_NEXUS_Animated.glb', scene).then(result => {
    jamesRoot = new BABYLON.TransformNode('JamesRoot',scene);
    result.meshes.forEach(mesh=>{ if(!mesh.parent) mesh.parent=jamesRoot; });
    jamesRoot.position.copyFrom(locations.desk);
    jamesRoot.scaling.setAll(1.35);
    jamesRoot.rotation.y = 0.18;
    resolveAnimations(result.animationGroups || []);
    play('Neutral Idle',true);
    loading.style.display='none';
    document.getElementById('assetState').textContent='geladen';
    document.getElementById('inspectorStatus').textContent='Ready';
    log('James 3D geladen · Office v2');
  }).catch(err => {
    console.error(err); loading.textContent='James konnte nicht geladen werden.'; document.getElementById('assetState').textContent='GLB-Fehler'; log('GLB-Ladefehler');
  });

  function travelTo(targetName){
    if(!jamesRoot)return;
    const from=jamesRoot.position.clone(), to=locations[targetName].clone(), delta=to.subtract(from), dist=delta.length();
    if(dist<0.05){ play('Neutral Idle',true); return; }
    const dir=delta.normalize(); jamesRoot.rotation.y=Math.atan2(dir.x,dir.z);
    travel={from,to,started:performance.now(),duration:Math.max(2100,dist*760),targetName}; play('Standard Walk',true);
  }
  document.getElementById('idleBtn').addEventListener('click',()=>{travel=null;play('Neutral Idle',true);setActiveButton('idleBtn');});
  document.getElementById('walkBtn').addEventListener('click',()=>{travel=null;play('Standard Walk',true);setActiveButton('walkBtn');});
  document.getElementById('waveBtn').addEventListener('click',()=>{travel=null;play('Waving',false);setActiveButton('waveBtn');});
  document.getElementById('meetingBtn').addEventListener('click',()=>{travelTo('meeting');setActiveButton('meetingBtn');});
  document.getElementById('deskBtn').addEventListener('click',()=>{travelTo('desk');setActiveButton('deskBtn');});

  scene.onBeforeRenderObservable.add(()=>{
    if(!travel||!jamesRoot)return;
    const t=Math.min(1,(performance.now()-travel.started)/travel.duration), smooth=t*t*(3-2*t);
    jamesRoot.position=BABYLON.Vector3.Lerp(travel.from,travel.to,smooth);
    if(t>=1){ jamesRoot.position.copyFrom(travel.to); const where=travel.targetName==='desk'?'Leitungsbereich':'Meetingraum'; travel=null; play('Neutral Idle',true); setActiveButton('idleBtn'); log('James angekommen: '+where); }
  });

  engine.runRenderLoop(()=>scene.render());
  window.addEventListener('resize',()=>engine.resize());
  setTimeout(()=>engine.resize(),100);
})();
