(() => {
  const loading = document.getElementById('loading');
  const feed = document.getElementById('activityFeed');
  const team = [
    ['James','Leitung',true],['Nora','Mail',false],['Kevin','Recherche',false],['Gisela','Wissen',false],
    ['Lina','Kalender',false],['Walter','Technik',false],['Sarah','Kontakte',false],['Finn','Follow-ups',false]
  ];

  function log(text){
    const item=document.createElement('div'); item.className='activity-item';
    const t=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    item.innerHTML=`<div class="activity-time">${t}</div><div class="activity-text">${text}</div>`;
    feed.prepend(item); while(feed.children.length>3) feed.removeChild(feed.lastChild);
  }

  const teamList=document.getElementById('teamList');
  team.forEach(([name,role,ready])=>{
    const el=document.createElement('div'); el.className='person'+(name==='James'?' selected':'');
    el.innerHTML=`<div class="avatar">${name.slice(0,2).toUpperCase()}</div><div><div class="person-name">${name}</div><div class="person-role">${role}</div></div><span class="person-state ${ready?'ready':''}"></span>`;
    el.addEventListener('click',()=>{
      document.querySelectorAll('.person').forEach(x=>x.classList.remove('selected')); el.classList.add('selected');
      document.getElementById('inspectorName').textContent=name; document.getElementById('inspectorRole').textContent=role;
      document.getElementById('assetState').textContent=ready?'geladen':'noch offen';
      document.getElementById('inspectorStatus').textContent=ready?'Ready':'3D Asset pending';
    }); teamList.appendChild(el);
  });

  document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
    document.getElementById('viewTitle').textContent=btn.textContent;
  }));

  if(!window.BABYLON){ loading.textContent='3D-Engine konnte nicht geladen werden.'; log('Babylon.js nicht verfügbar'); return; }

  const canvas=document.getElementById('officeCanvas');
  const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true},true);
  const renderDpr=Math.min(2,window.devicePixelRatio||1);
  engine.setHardwareScalingLevel(1/renderDpr);

  const scene=new BABYLON.Scene(engine);
  scene.clearColor=new BABYLON.Color4(0.028,0.042,0.062,1);
  scene.imageProcessingConfiguration.toneMappingEnabled=true;
  scene.imageProcessingConfiguration.exposure=1.12;
  scene.imageProcessingConfiguration.contrast=1.12;

  const camera=new BABYLON.ArcRotateCamera('camera',Math.PI*0.24,1.0,17.3,new BABYLON.Vector3(0,1.05,0.15),scene);
  camera.attachControl(canvas,true); camera.lowerRadiusLimit=9; camera.upperRadiusLimit=22;
  camera.lowerBetaLimit=.58; camera.upperBetaLimit=1.35; camera.wheelPrecision=55; camera.pinchPrecision=130;

  const hemi=new BABYLON.HemisphericLight('hemi',new BABYLON.Vector3(0,1,0),scene);
  hemi.intensity=.78; hemi.diffuse=new BABYLON.Color3(.82,.9,1); hemi.groundColor=new BABYLON.Color3(.08,.11,.16);
  const key=new BABYLON.DirectionalLight('key',new BABYLON.Vector3(-.45,-1,-.35),scene);
  key.position=new BABYLON.Vector3(7,10,8); key.intensity=1.15;

  const glow=new BABYLON.GlowLayer('glow',scene,{blurKernelSize:12}); glow.intensity=.22;

  function pbr(name,hex,rough=.68,metal=0){ const m=new BABYLON.PBRMaterial(name,scene); m.albedoColor=BABYLON.Color3.FromHexString(hex); m.roughness=rough; m.metallic=metal; return m; }
  function emissive(name,hex){ const m=new BABYLON.StandardMaterial(name,scene); const c=BABYLON.Color3.FromHexString(hex); m.diffuseColor=c.scale(.16); m.emissiveColor=c; return m; }
  function box(name,w,h,d,x,y,z,hex,rough=.68,metal=0,rot=0){ const m=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene); m.position.set(x,y,z); m.rotation.y=rot; m.material=pbr(name+'Mat',hex,rough,metal); return m; }
  function cyl(name,diameter,height,x,y,z,hex,rough=.76,metal=0){ const m=BABYLON.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:28},scene); m.position.set(x,y,z); m.material=pbr(name+'Mat',hex,rough,metal); return m; }
  function glass(name,w,h,d,x,y,z,rot=0){ const m=new BABYLON.PBRMaterial(name+'Mat',scene); m.albedoColor=new BABYLON.Color3(.3,.58,.82); m.alpha=.15; m.roughness=.08; m.metallic=.04; const g=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene); g.position.set(x,y,z); g.rotation.y=rot; g.material=m; return g; }
  function strip(name,w,d,x,y,z,hex){ const s=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:.028,depth:d},scene); s.position.set(x,y,z); s.material=emissive(name+'Mat',hex); return s; }
  function label(name,text,x,y,z,rot=0){
    const plane=BABYLON.MeshBuilder.CreatePlane(name,{width:1.05,height:.26},scene); plane.position.set(x,y,z); plane.rotation.y=rot;
    const tex=new BABYLON.DynamicTexture(name+'Tex',{width:512,height:128},scene,false); tex.hasAlpha=true;
    tex.drawText(text,null,82,'bold 42px Arial','#dcecff','transparent',true);
    const m=new BABYLON.StandardMaterial(name+'Mat',scene); m.diffuseTexture=tex; m.opacityTexture=tex; m.emissiveColor=new BABYLON.Color3(.35,.62,1); m.disableLighting=true; plane.material=m; return plane;
  }
  function plant(name,x,z,s=1){ cyl(name+'Pot',.48*s,.40*s,x,.2*s,z,'#51483e',.82,0); cyl(name+'Stem',.07*s,.72*s,x,.64*s,z,'#2f684f'); for(let i=0;i<6;i++){ const l=BABYLON.MeshBuilder.CreateSphere(name+'Leaf'+i,{diameter:.31*s,segments:10},scene); l.scaling.set(.62,1.75,.44); l.position.set(x+Math.cos(i*1.05)*.16*s,.88*s+i*.045*s,z+Math.sin(i*1.05)*.15*s); l.rotation.z=i*.52; l.material=pbr(name+'LeafMat'+i,'#58a780',.88,0); } }
  function chair(name,x,z,rot=0){ cyl(name+'Base',.47,.06,x,.33,z,'#171e28',.62,.18); box(name+'Stem',.055,.31,.055,x,.52,z,'#263443',.5,.22,rot); box(name+'Seat',.54,.09,.54,x,.72,z,'#47576b',.84,0,rot); const dx=Math.sin(rot)*.23,dz=Math.cos(rot)*.23; box(name+'Back',.57,.70,.085,x-dx,1.05,z-dz,'#52647b',.88,0,rot); }
  function desk(name,x,z,rot=0,exec=false){
    const w=exec?2.55:1.82,d=exec?1.08:.88; box(name+'Top',w,.085,d,x,.76,z,exec?'#745f4c':'#9f9588',exec?.45:.58,.06,rot);
    box(name+'Beam',w*.82,.10,.12,x,.54,z,'#202b38',.44,.24,rot);
    const off=w*.39; [-1,1].forEach((s,i)=>{ const lx=s*off, px=x+lx*Math.cos(rot), pz=z+lx*Math.sin(rot); box(name+'Leg'+i,.09,1.38,.5,px,.04,pz,'#273440',.5,.28,rot); });
    const led=BABYLON.MeshBuilder.CreateBox(name+'Led',{width:w*.78,height:.022,depth:.035},scene); led.position.set(x,.68,z+(d*.48)*Math.cos(rot)); led.rotation.y=rot; led.material=emissive(name+'LedMat','#4aa3ff');
  }
  function monitor(name,x,z,rot=0){ box(name+'Frame',.82,.49,.045,x,1.18,z,'#101722',.24,.34,rot); const s=box(name+'Screen',.74,.41,.012,x,1.18,z+.031*Math.cos(rot),'#163c5e',.25,.05,rot); s.material.emissiveColor=new BABYLON.Color3(.055,.22,.38); box(name+'Stand',.055,.29,.055,x,.93,z,'#26323f',.45,.28,rot); }
  function sofa(name,x,z,rot=0){ box(name+'Seat',1.55,.25,.68,x,.40,z,'#39495e',.9,0,rot); const dx=Math.sin(rot)*.28,dz=Math.cos(rot)*.28; box(name+'Back',1.55,.64,.12,x-dx,.73,z-dz,'#42546a',.92,0,rot); }
  function station(name,x,z,rot=0,exec=false){ desk(name+'Desk',x,z,rot,exec); monitor(name+'Mon',x,z+(rot===0?-.15:.15),rot); chair(name+'Chair',x,z+(rot===0?.72:-.72),rot); label(name+'Label',name,x,1.52,z+(rot===0?-.46:.46),rot); }

  box('floor',21,.16,14.5,0,-.08,0,'#171f2a',.95,0);
  box('backWall',21,3.9,.16,0,1.95,-7.25,'#101720',.94,0);
  box('leftWall',.16,3.9,14.5,-10.5,1.95,0,'#0e151e',.94,0);
  box('rightWall',.16,3.9,7.8,10.5,1.95,-3.35,'#0e151e',.94,0);

  strip('wallBlue',6.5,.035,-6.2,2.75,-7.14,'#3f8cff');
  strip('wallBlue2',5.0,.035,1.0,2.92,-7.14,'#2f6bdc');
  strip('wallBlue3',3.0,.035,7.25,2.65,-7.14,'#4aa3ff');
  const brand=box('brandPanel',4.9,.92,.04,-6.4,2.05,-7.14,'#17263a',.35,.12); brand.material.emissiveColor=new BABYLON.Color3(.02,.07,.14);

  box('centralPlatform',7.4,.035,5.2,.1,.02,.45,'#202c39',.96,0);
  box('leadPlatform',4.1,.035,3.15,-6.35,.02,2.7,'#1a2533',.97,0);
  box('loungePlatform',4.2,.035,3.35,-6.25,.02,-3.95,'#18222e',.97,0);
  box('meetingPlatform',5.35,.035,4.45,6.05,.02,-3.55,'#182634',.97,0);

  station('James',-6.35,2.75,0,true);
  station('Nora',-2.25,-.65,0,false);
  station('Kevin',1.05,-.65,Math.PI,false);
  station('Gisela',-2.25,2.05,0,false);
  station('Lina',1.05,2.05,Math.PI,false);
  station('Walter',6.9,1.55,Math.PI,false);
  station('Finn',6.9,4.0,Math.PI,false);
  desk('SarahDesk',-3.85,5.0,-Math.PI/2,false); monitor('SarahMon',-3.7,5.0,-Math.PI/2); chair('SarahChair',-3.1,5.0,-Math.PI/2); label('SarahLabel','Sarah',-4.35,1.5,5.0,-Math.PI/2);

  glass('receptionGlass',.05,1.55,2.65,-4.65,.8,5.0);
  strip('receptionLed',2.0,.03,-3.85,.69,5.42,'#56b8ff');

  sofa('loungeA',-6.75,-4.35,0); sofa('loungeB',-4.55,-3.3,-Math.PI/2);
  box('coffee',1.05,.08,.62,-5.55,.34,-3.85,'#735d48',.52,.02); plant('loungePlant',-8.25,-5.65,1.08); plant('loungePlant2',-3.8,-5.55,.8);

  glass('meetGlassLTop',.055,2.75,1.50,3.35,1.38,-5.05);
  glass('meetGlassLBottom',.055,2.75,1.40,3.35,1.38,-2.00);
  glass('meetGlassBack',5.45,2.75,.055,6.07,1.38,-5.82);
  glass('meetGlassFront',5.45,2.75,.055,6.07,1.38,-1.28);
  desk('meetTable',6.05,-3.55,0,true); chair('meetL',4.95,-3.55,Math.PI/2); chair('meetR',7.15,-3.55,-Math.PI/2); chair('meetT',6.05,-2.48,Math.PI); chair('meetB',6.05,-4.62,0);
  const meetingScreen=box('meetingScreen',1.75,1.0,.055,8.75,1.65,-3.55,'#101b29',.25,.28,Math.PI/2); meetingScreen.material.emissiveColor=new BABYLON.Color3(.03,.12,.23);

  plant('leadPlant',-8.55,4.95,.95); plant('teamPlant',3.2,4.85,.82); plant('rightPlant',8.85,5.45,.88);
  [-7,-2.5,2.3,7].forEach((x,i)=>{ const p=new BABYLON.PointLight('accent'+i,new BABYLON.Vector3(x,3.1,.2),scene); p.diffuse=new BABYLON.Color3(.3,.55,1); p.intensity=.48; p.range=7; });

  // Office Pathfinding V2 — rebuilt for the current v17/v37 geometry.
  // Grid A* + exact L-desk footprints + door gaps + clearance-aware routing.
  const NAV={minX:-9.70,maxX:9.70,minZ:-6.62,maxZ:6.55,step:.22,actorRadius:.24};
  const obstacles=[];

  function addObstacle(minX,maxX,minZ,maxZ,pad=NAV.actorRadius,label=''){
    obstacles.push({
      minX:minX-pad,maxX:maxX+pad,
      minZ:minZ-pad,maxZ:maxZ+pad,
      label
    });
  }

  function addRect(cx,cz,w,d,rot=0,pad=NAV.actorRadius,label=''){
    const ninety=Math.abs(Math.sin(rot))>.7;
    const fw=ninety?d:w, fd=ninety?w:d;
    addObstacle(cx-fw/2,cx+fw/2,cz-fd/2,cz+fd/2,pad,label);
  }

  function localToWorld(cx,cz,lx,lz,rot){
    const c=Math.cos(rot),q=Math.sin(rot);
    return {x:cx+lx*c+lz*q,z:cz-lx*q+lz*c};
  }

  // Precise L-shaped desk footprint: main top + return, rather than one oversized rectangle.
  function addLDesk(name,cx,cz,rot=0,exec=false,pad=.20){
    const W=exec?2.72:2.28;
    const D=exec?1.05:.94;
    const RW=exec?.86:.74;
    const RD=exec?1.22:1.10;
    addRect(cx,cz,W,D,rot,pad,name+' main');
    const lx=W/2-RW/2;
    const lz=D/2+RD/2-.06;
    const p=localToWorld(cx,cz,lx,lz,rot);
    addRect(p.x,p.z,RW,RD,rot,pad,name+' return');
  }

  // Glass front walls with a navigable doorway cut out.
  function addWallWithDoor(label,left,right,z,doorX,doorW){
    const safeHalf=doorW/2-.10;
    if(doorX-safeHalf>left) addObstacle(left,doorX-safeHalf,z-.055,z+.055,.08,label+' left glass');
    if(doorX+safeHalf<right) addObstacle(doorX+safeHalf,right,z-.055,z+.055,.08,label+' right glass');
  }

  // Current rear rooms.
  const ROOM={back:-7.10,front:-2.82};
  const server={left:-10.22,right:-4.92,doorX:-6.62,doorW:1.10};
  const jamesRoom={left:-4.92,right:1.55,doorX:-1.685,doorW:1.12};
  const meetingRoom={left:1.55,right:10.22,doorX:3.335,doorW:1.18};

  addWallWithDoor('server front',server.left,server.right,ROOM.front,server.doorX,server.doorW);
  addWallWithDoor('James front',jamesRoom.left,jamesRoom.right,ROOM.front,jamesRoom.doorX,jamesRoom.doorW);
  addWallWithDoor('meeting front',meetingRoom.left,meetingRoom.right,ROOM.front,meetingRoom.doorX,meetingRoom.doorW);

  // Solid room dividers. Route must leave one room through its own sliding door.
  addObstacle(-4.98,-4.86,ROOM.back,ROOM.front,.10,'server/James divider');
  addObstacle(1.49,1.61,ROOM.back,ROOM.front,.10,'James/meeting divider');

  // Current desks.
  addLDesk('Walter',-7.55,-3.96,-Math.PI/2,false,.18);
  addLDesk('James',-1.685,-4.62,Math.PI,true,.18);

  // Central four-desk cross from v35+.
  const islandCX=-1.05,islandCZ=2.15;
  const islandLeftX=islandCX-1.82,islandRightX=islandCX+1.82;
  const islandTopZ=islandCZ-1.42,islandBottomZ=islandCZ+1.42;
  addLDesk('Gisela',islandLeftX,islandTopZ,-Math.PI/2,false,.20);
  addLDesk('Nora',islandRightX,islandTopZ,Math.PI,false,.20);
  addLDesk('Kevin',islandLeftX,islandBottomZ,0,false,.20);
  addLDesk('Lina',islandRightX,islandBottomZ,Math.PI/2,false,.20);

  addLDesk('Sarah',7.15,.10,Math.PI/2,false,.20);
  addLDesk('Finn',7.15,3.45,Math.PI/2,false,.20);

  // Long planter cross from v37.
  addRect(islandCX,islandCZ,.34,5.35,0,.18,'vertical planter');
  addRect(islandCX,islandCZ,6.10,.34,0,.18,'horizontal planter');

  // Meeting table + occupied chair envelope.
  addRect(5.885,-5.18,5.05,2.45,0,.18,'meeting table/chairs');

  // Server racks against the rear wall.
  addRect(-8.13,-6.79,3.25,.90,0,.16,'server racks');

  // File cabinets along the left wall.
  addRect(-9.58,-.91,.70,3.85,0,.12,'archive cabinets');

  // Lounge: sofa, armchair and coffee table as one navigational island.
  addRect(-6.82,5.16,4.15,2.75,0,.20,'lounge');

  function isBlocked(x,z){
    if(x<NAV.minX||x>NAV.maxX||z<NAV.minZ||z>NAV.maxZ) return true;
    return obstacles.some(o=>x>=o.minX&&x<=o.maxX&&z>=o.minZ&&z<=o.maxZ);
  }

  // Mild penalty around obstacles keeps James centered in corridors instead of grazing furniture.
  function clearancePenalty(x,z){
    let p=0;
    for(const o of obstacles){
      if(x>=o.minX-.42&&x<=o.maxX+.42&&z>=o.minZ-.42&&z<=o.maxZ+.42){
        if(!(x>=o.minX&&x<=o.maxX&&z>=o.minZ&&z<=o.maxZ)) p+=.20;
      }
    }
    return Math.min(.75,p);
  }

  function toCell(v){
    return {
      x:Math.round((v.x-NAV.minX)/NAV.step),
      z:Math.round((v.z-NAV.minZ)/NAV.step)
    };
  }

  function toWorld(c){
    return new BABYLON.Vector3(
      NAV.minX+c.x*NAV.step,
      0,
      NAV.minZ+c.z*NAV.step
    );
  }

  function keyCell(c){return c.x+','+c.z;}
  function blockedCell(c){
    const p=toWorld(c);
    return isBlocked(p.x,p.z);
  }

  function nearestFree(cell){
    if(!blockedCell(cell)) return cell;
    for(let r=1;r<=12;r++){
      for(let dx=-r;dx<=r;dx++){
        for(let dz=-r;dz<=r;dz++){
          if(Math.abs(dx)!==r&&Math.abs(dz)!==r) continue;
          const c={x:cell.x+dx,z:cell.z+dz};
          const p=toWorld(c);
          if(p.x<NAV.minX||p.x>NAV.maxX||p.z<NAV.minZ||p.z>NAV.maxZ) continue;
          if(!blockedCell(c)) return c;
        }
      }
    }
    return null;
  }

  function heuristic(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}

  function reconstruct(came,current){
    const out=[current];
    let k=keyCell(current);
    while(came.has(k)){
      current=came.get(k);
      out.push(current);
      k=keyCell(current);
    }
    return out.reverse();
  }

  function lineClear(a,b){
    const d=BABYLON.Vector3.Distance(a,b);
    const n=Math.max(1,Math.ceil(d/.09));
    for(let i=1;i<n;i++){
      const p=BABYLON.Vector3.Lerp(a,b,i/n);
      if(isBlocked(p.x,p.z)) return false;
    }
    return true;
  }

  function simplifyPath(points){
    if(points.length<3) return points;
    const out=[points[0]];
    let i=0;
    while(i<points.length-1){
      let j=points.length-1;
      while(j>i+1&&!lineClear(points[i],points[j])) j--;
      out.push(points[j]);
      i=j;
    }
    return out;
  }

  function findPath(start,end){
    const rawStart=toCell(start),rawEnd=toCell(end);
    const startCell=nearestFree(rawStart),endCell=nearestFree(rawEnd);
    if(!startCell||!endCell) return null;

    const open=[startCell];
    const openKeys=new Set([keyCell(startCell)]);
    const came=new Map();
    const g=new Map([[keyCell(startCell),0]]);
    const f=new Map([[keyCell(startCell),heuristic(startCell,endCell)]]);
    const dirs=[
      [1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
      [1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]
    ];

    let guard=0;
    while(open.length&&guard++<24000){
      let best=0;
      for(let i=1;i<open.length;i++){
        if((f.get(keyCell(open[i]))??Infinity)<(f.get(keyCell(open[best]))??Infinity)) best=i;
      }

      const cur=open.splice(best,1)[0];
      openKeys.delete(keyCell(cur));

      if(cur.x===endCell.x&&cur.z===endCell.z){
        const cells=reconstruct(came,cur);
        const pts=cells.map(toWorld);

        // Keep exact actor start/end positions where safe; otherwise use nearest free approach point.
        if(!isBlocked(start.x,start.z)) pts[0]=start.clone();
        if(!isBlocked(end.x,end.z)) pts[pts.length-1]=end.clone();

        return simplifyPath(pts);
      }

      for(const [dx,dz,baseCost] of dirs){
        const n={x:cur.x+dx,z:cur.z+dz};
        const wp=toWorld(n);
        if(wp.x<NAV.minX||wp.x>NAV.maxX||wp.z<NAV.minZ||wp.z>NAV.maxZ) continue;
        if(blockedCell(n)) continue;

        // Never squeeze diagonally through touching furniture corners.
        if(dx&&dz){
          if(blockedCell({x:cur.x+dx,z:cur.z})||blockedCell({x:cur.x,z:cur.z+dz})) continue;
        }

        const nk=keyCell(n),ck=keyCell(cur);
        const tentative=(g.get(ck)??Infinity)+baseCost+clearancePenalty(wp.x,wp.z);

        if(tentative<(g.get(nk)??Infinity)){
          came.set(nk,cur);
          g.set(nk,tentative);
          f.set(nk,tentative+heuristic(n,endCell));
          if(!openKeys.has(nk)){
            open.push(n);
            openKeys.add(nk);
          }
        }
      }
    }
    return null;
  }

  const locations={
    desk:new BABYLON.Vector3(-1.985,0,-3.78),
    meeting:new BABYLON.Vector3(3.35,0,-3.45)
  };

  let jamesRoot=null,groups={},travel=null;

  function setActiveButton(id){ document.querySelectorAll('.scene-actions .chip').forEach(x=>x.classList.remove('active')); const b=document.getElementById(id); if(b)b.classList.add('active'); }
  function play(name,loop=true){ const g=groups[name]; if(!g)return; Object.values(groups).forEach(q=>{if(q!==g)q.stop();}); g.loopAnimation=!!loop; g.start(!!loop,1,g.from,g.to,false); document.getElementById('currentAnim').textContent=name; log('James → '+name); }
  function resolveAnimations(arr){ arr.forEach(g=>{groups[g.name]=g;g.stop();}); if(!groups['Neutral Idle']&&arr[0])groups['Neutral Idle']=arr[0]; if(!groups['Standard Walk']&&arr[1])groups['Standard Walk']=arr[1]; if(!groups['Waving']&&arr[2])groups['Waving']=arr[2]; }

  loading.textContent='James wird geladen …';
  BABYLON.SceneLoader.ImportMeshAsync('','./assets/','James_NEXUS_Animated.glb',scene).then(result=>{
    jamesRoot=new BABYLON.TransformNode('JamesRoot',scene); result.meshes.forEach(m=>{if(!m.parent)m.parent=jamesRoot;});
    jamesRoot.position.copyFrom(locations.desk); jamesRoot.scaling.setAll(1.38); jamesRoot.rotation.y=-.35;
    resolveAnimations(result.animationGroups||[]); play('Neutral Idle',true); loading.style.display='none';
    document.getElementById('assetState').textContent='geladen'; document.getElementById('inspectorStatus').textContent='Ready';
    log('Office 1.58 · scharf · animated server rack LEDs');
  }).catch(err=>{ console.error(err); loading.textContent='James konnte nicht geladen werden.'; document.getElementById('assetState').textContent='GLB-Fehler'; log('GLB-Ladefehler'); });

  function travelTo(targetName){
    if(!jamesRoot)return;
    const from=jamesRoot.position.clone(),to=locations[targetName].clone();
    const path=findPath(from,to);
    if(!path||path.length<2){ log('Kein freier Weg zu '+targetName+' gefunden'); return; }
    travel={path,index:1,targetName,speed:1.65};
    const d=path[1].subtract(from); jamesRoot.rotation.y=Math.atan2(d.x,d.z);
    play('Standard Walk',true); log('Pathfinding V2: '+(path.length-1)+' Wegsegmente');
  }

  document.getElementById('idleBtn').addEventListener('click',()=>{travel=null;play('Neutral Idle',true);setActiveButton('idleBtn');});
  document.getElementById('walkBtn').addEventListener('click',()=>{travel=null;play('Standard Walk',true);setActiveButton('walkBtn');});
  document.getElementById('waveBtn').addEventListener('click',()=>{travel=null;play('Waving',false);setActiveButton('waveBtn');});
  document.getElementById('meetingBtn').addEventListener('click',()=>{travelTo('meeting');setActiveButton('meetingBtn');});
  document.getElementById('deskBtn').addEventListener('click',()=>{travelTo('desk');setActiveButton('deskBtn');});

  scene.onBeforeRenderObservable.add(()=>{
    if(!jamesRoot)return;

    const frameDt=Math.min(.05,(engine.getDeltaTime()||16)/1000);

    if(!travel)return;
    let remaining=travel.speed*frameDt;
    while(remaining>0&&travel){
      const target=travel.path[travel.index];
      const delta=target.subtract(jamesRoot.position); const dist=delta.length();
      if(dist<.001){ travel.index++; if(travel.index>=travel.path.length){
        const where=travel.targetName==='desk'?'Leitungsbereich':'Meetingraum'; travel=null; play('Neutral Idle',true); setActiveButton('idleBtn'); log('James angekommen: '+where); break;
      } continue; }
      const dir=delta.scale(1/dist); jamesRoot.rotation.y=Math.atan2(dir.x,dir.z);
      if(dist<=remaining){ jamesRoot.position.copyFrom(target); remaining-=dist; travel.index++; if(travel.index>=travel.path.length){
        const where=travel.targetName==='desk'?'Leitungsbereich':'Meetingraum'; travel=null; play('Neutral Idle',true); setActiveButton('idleBtn'); log('James angekommen: '+where); break;
      }} else { jamesRoot.position.addInPlace(dir.scale(remaining)); remaining=0; }
    }
  });

  engine.runRenderLoop(()=>scene.render());
  window.addEventListener('resize',()=>engine.resize());
  setTimeout(()=>engine.resize(),120);
})();
