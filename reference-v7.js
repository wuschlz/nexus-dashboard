(() => {
  function waitForScene() {
    if (!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    if (!scene || !scene.getTransformNodeByName('JamesRoot')) return false;

    const color = hex => BABYLON.Color3.FromHexString(hex);
    const pbr = (name, hex, rough=.72, metal=0) => {
      const m = new BABYLON.PBRMaterial(name, scene);
      m.albedoColor = color(hex);
      m.roughness = rough;
      m.metallic = metal;
      return m;
    };
    const std = (name, hex, emissive=null, alpha=1) => {
      const m = new BABYLON.StandardMaterial(name, scene);
      m.diffuseColor = color(hex);
      m.alpha = alpha;
      if (emissive) m.emissiveColor = color(emissive);
      return m;
    };
    const box = (name,w,h,d,x,y,z,mat,rot=0) => {
      const mesh = BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
      mesh.position.set(x,y,z);
      mesh.rotation.y = rot;
      mesh.material = mat;
      return mesh;
    };
    const cyl = (name,diameter,height,x,y,z,mat) => {
      const mesh = BABYLON.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:24},scene);
      mesh.position.set(x,y,z);
      mesh.material = mat;
      return mesh;
    };

    // --- brighter premium architectural palette ---
    scene.clearColor = new BABYLON.Color4(0.58,0.72,0.84,1);
    scene.imageProcessingConfiguration.exposure = 1.20;
    scene.imageProcessingConfiguration.contrast = 1.06;

    const floor = scene.getMeshByName('floor');
    if (floor) floor.material = pbr('v7FloorMat','#d8d2c7',.88,.02);

    ['centralPlatform','leadPlatform','loungePlatform','meetingPlatform'].forEach((name,i)=>{
      const m = scene.getMeshByName(name);
      if (m) m.material = pbr('v7Rug'+i, i===0 ? '#c9c3b8' : '#b9b4ac', .96, 0);
    });

    const backWall = scene.getMeshByName('backWall');
    const leftWall = scene.getMeshByName('leftWall');
    const rightWall = scene.getMeshByName('rightWall');
    if (backWall) backWall.material = pbr('v7BackWall','#26313e',.88,.03);
    if (leftWall) leftWall.material = pbr('v7LeftWall','#222c38',.88,.03);
    if (rightWall) rightWall.material = pbr('v7RightWall','#27323f',.88,.03);

    // --- full-height city windows along the back/left side ---
    const glassMat = new BABYLON.PBRMaterial('v7WindowGlass',scene);
    glassMat.albedoColor = color('#80b9df');
    glassMat.alpha = .32;
    glassMat.roughness = .12;
    glassMat.metallic = .06;
    const skyMat = std('v7Sky','#87b9dc','#5d8fb5',1);
    const frameMat = pbr('v7Frame','#18222d',.40,.42);

    box('v7SkyWall',11.8,3.15,.05,-2.8,1.72,-7.05,skyMat);
    for(let i=0;i<6;i++) {
      const x=-8.2+i*2.15;
      box('v7Window'+i,1.92,3.0,.035,x,1.72,-6.99,glassMat);
      box('v7Mullion'+i,.07,3.12,.07,x+1.02,1.72,-6.94,frameMat);
    }
    box('v7WindowTop',11.9,.08,.08,-2.8,3.25,-6.93,frameMat);
    box('v7WindowBottom',11.9,.08,.08,-2.8,.18,-6.93,frameMat);

    // city silhouette for depth, very lightweight
    const cityMat = std('v7City','#456780','#456780',1);
    [
      [-7.8,1.05,.7],[-6.7,1.35,1.05],[-5.4,.92,.55],[-4.25,1.60,1.28],
      [-2.9,1.15,.82],[-1.55,1.45,1.12],[-.2,1.0,.65],[1.15,1.58,1.25],[2.45,1.2,.88]
    ].forEach((b,i)=>box('v7City'+i,.72,b[1],.04,b[0],.22+b[1]/2,-7.01,cityMat));

    // --- desk palette & workstation cabinets, based on reference image ---
    const names=['James','Nora','Kevin','Gisela','Lina','Walter','Finn','Sarah'];
    const deskInfo={
      James:{x:-6.35,z:2.75,r:0,exec:true},
      Nora:{x:-2.25,z:-.65,r:0},
      Kevin:{x:1.05,z:-.65,r:Math.PI},
      Gisela:{x:-2.25,z:2.05,r:0},
      Lina:{x:1.05,z:2.05,r:Math.PI},
      Walter:{x:6.9,z:1.55,r:Math.PI},
      Finn:{x:6.9,z:4.0,r:Math.PI},
      Sarah:{x:-3.85,z:5.0,r:-Math.PI/2}
    };
    const wood = pbr('v7Wood','#a88768',.52,.02);
    const charcoal = pbr('v7DeskBody','#2b333d',.48,.18);
    const cabinet = pbr('v7Cabinet','#313943',.56,.12);
    const carpet = pbr('v7Carpet','#b9b3aa',.97,0);
    const blueGlow = std('v7BlueGlow','#17385a','#2f94ff',1);

    names.forEach((name,idx)=>{
      ['Top'].forEach(s=>{ const m=scene.getMeshByName(name+'Desk'+s); if(m) m.material=wood; });
      ['Beam','Leg0','Leg1','Led'].forEach(s=>{ const m=scene.getMeshByName(name+'Desk'+s); if(m) m.material = s==='Led' ? blueGlow : charcoal; });
      const d=deskInfo[name];
      if(!d) return;
      const w=d.exec?2.35:1.72;
      box('v7Rug_'+name,w+1.0,.022,1.85,d.x,.035,d.z,carpet,d.r);
      const dz=Math.cos(d.r)*.31, dx=Math.sin(d.r)*.31;
      box('v7Cabinet_'+name,w*.78,.58,.45,d.x-dx,.30,d.z-dz,cabinet,d.r);
      box('v7FrontGlow_'+name,w*.42,.025,.02,d.x+dx*.9,.58,d.z+dz*.9,blueGlow,d.r);
    });

    // Reference-style James centerpiece: warmer wood and larger rug.
    const jamesTop=scene.getMeshByName('JamesDeskTop');
    if(jamesTop) jamesTop.material=pbr('v7JamesWood','#997357',.46,.02);
    const jr=scene.getMeshByName('v7Rug_James');
    if(jr){jr.scaling.x*=1.18; jr.scaling.z*=1.20;}

    // --- shelf / credenza wall and decor ---
    const shelfMat=pbr('v7Shelf','#39424c',.60,.12);
    const shelfTop=pbr('v7ShelfTop','#b39373',.56,.02);
    box('v7ShelfBase',4.4,.72,.56,5.3,.37,-6.55,shelfMat);
    box('v7ShelfTop',4.55,.07,.62,5.3,.77,-6.55,shelfTop);
    for(let i=0;i<4;i++) box('v7ShelfDoor'+i,.92,.52,.03,3.85+i*.95,.38,-6.25,pbr('v7ShelfDoorMat'+i,'#46515e',.62,.08));

    function plant(name,x,z,s=1){
      const pot=pbr(name+'Pot','#636058',.78,.02);
      const green=pbr(name+'Green','#4c8a61',.90,0);
      cyl(name+'Pot',.44*s,.42*s,x,.21*s,z,pot);
      for(let i=0;i<6;i++){
        const leaf=BABYLON.MeshBuilder.CreateSphere(name+'Leaf'+i,{diameter:.30*s,segments:10},scene);
        leaf.scaling.set(.58,1.72,.45);
        leaf.position.set(x+Math.cos(i*1.08)*.15*s,.62*s+i*.06*s,z+Math.sin(i*1.08)*.14*s);
        leaf.rotation.z=i*.48; leaf.material=green;
      }
    }
    [
      ['v7P1',-9.1,-5.7,1.15],['v7P2',-7.8,-1.6,.9],['v7P3',-4.1,-5.9,.88],
      ['v7P4',2.65,-5.9,.9],['v7P5',8.8,-5.6,1.05],['v7P6',8.9,5.5,.95],['v7P7',3.2,5.4,.82]
    ].forEach(p=>plant(...p));

    // --- Meeting room: stronger black frame and premium table zone ---
    ['meetGlassLTop','meetGlassLBottom','meetGlassBack','meetGlassFront'].forEach(n=>{
      const g=scene.getMeshByName(n); if(g && g.material){ g.material.alpha=.24; g.material.albedoColor=color('#b8d6e8'); }
    });
    box('v7MeetTop',5.55,.11,.11,6.07,2.83,-5.82,frameMat);
    box('v7MeetFrontTop',5.55,.11,.11,6.07,2.83,-1.28,frameMat);
    [3.35,5.15,7.0,8.77].forEach((x,i)=>box('v7MeetPost'+i,.10,2.85,.10,x,1.42,-5.80,frameMat));
    [3.35,8.78].forEach((x,i)=>box('v7MeetFrontPost'+i,.10,2.85,.10,x,1.42,-1.30,frameMat));

    // --- new lounge at front/right, matching the reference composition ---
    const sofaMat=pbr('v7Sofa','#777f88',.90,0);
    const cushionMat=pbr('v7Cushion','#223c62',.88,0);
    const tableMat=pbr('v7Coffee','#5f4d3c',.54,.05);
    box('v7SofaSeat',2.25,.30,.88,5.3,.33,5.35,sofaMat,0);
    box('v7SofaBack',2.25,.82,.18,5.3,.75,5.72,sofaMat,0);
    box('v7SofaArmL',.18,.52,.90,4.22,.52,5.35,sofaMat,0);
    box('v7SofaArmR',.18,.52,.90,6.38,.52,5.35,sofaMat,0);
    box('v7Cushion1',.62,.16,.52,4.78,.70,5.24,cushionMat,-.12);
    box('v7Cushion2',.62,.16,.52,5.55,.70,5.24,cushionMat,.10);
    cyl('v7CoffeeTable',1.05,.12,3.75,.30,5.05,tableMat);
    box('v7LoungeRug',4.0,.024,2.3,5.0,.028,5.0,carpet,0);

    // --- lighting: cool daylight + warm task ambience ---
    const hemi=scene.getLightByName('hemi'); if(hemi) hemi.intensity=.92;
    const key=scene.getLightByName('key'); if(key){key.intensity=1.40; key.diffuse=color('#fff0da');}
    [
      [-6.3,3.1,2.0],[-2.0,3.0,.7],[1.1,3.0,.7],[6.0,3.0,-3.5],[5.1,2.7,5.0]
    ].forEach((p,i)=>{
      const l=new BABYLON.PointLight('v7Warm'+i,new BABYLON.Vector3(p[0],p[1],p[2]),scene);
      l.diffuse=color('#ffd7a8'); l.intensity=.36; l.range=5.2;
    });

    // --- labels as camera-facing premium badges ---
    scene.meshes.filter(m=>m.name.endsWith('Label')).forEach(m=>{
      m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      m.scaling.scaleInPlace(.92);
    });

    // --- Camera: closer to the reference render composition ---
    const camera=scene.activeCamera;
    if(camera){
      camera.alpha=Math.PI*.22;
      camera.beta=.84;
      camera.radius=17.2;
      camera.target=new BABYLON.Vector3(0,.78,.35);
      camera.fov=.72;
    }

    const badge=document.querySelector('.scene-badge');
    if(badge) badge.innerHTML='<span class="dot live"></span>OFFICE V7 · REFERENCE REDESIGN';
    const feed=document.getElementById('activityFeed');
    if(feed){
      const item=document.createElement('div');
      item.className='activity-item';
      item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v7 · Referenz-Look geladen</div>';
      feed.prepend(item); while(feed.children.length>3) feed.removeChild(feed.lastChild);
    }
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(waitForScene() || tries>120) clearInterval(timer);
  },100);
})();
