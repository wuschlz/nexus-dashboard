(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    const james = scene && scene.getTransformNodeByName('JamesRoot');
    if(!scene || !james) return false;
    if(scene.getTransformNodeByName('v17OfficeRoot')) return true;

    const root = new BABYLON.TransformNode('v17OfficeRoot', scene);
    const C = h => BABYLON.Color3.FromHexString(h);
    const pbr = (n,h,r=.55,m=.05) => { const x=new BABYLON.PBRMaterial(n,scene); x.albedoColor=C(h); x.roughness=r; x.metallic=m; return x; };
    const std = (n,h,e=null,a=1) => { const x=new BABYLON.StandardMaterial(n,scene); x.diffuseColor=C(h); x.alpha=a; if(e)x.emissiveColor=C(e); return x; };
    const box = (n,w,h,d,x,y,z,mat,parent=root,rot=0) => { const m=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene); m.position.set(x,y,z); m.rotation.y=rot; m.material=mat; if(parent)m.parent=parent; return m; };
    const cyl = (n,diam,h,x,y,z,mat,parent=root) => { const m=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:diam,height:h,tessellation:28},scene); m.position.set(x,y,z); m.material=mat; if(parent)m.parent=parent; return m; };

    const keep = new Set(['floor','backWall','leftWall','rightWall']);
    james.getChildMeshes(false).forEach(m => keep.add(m.name));
    scene.meshes.forEach(m => { if(!keep.has(m.name)) m.setEnabled(false); });
    scene.transformNodes.forEach(t => {
      if(t===root || t===james || t.name==='JamesRoot') return;
      if(/^v(?:7|8|9|10|11|12|13|14|15|16)/.test(t.name)) t.setEnabled(false);
    });

    // Premium daylight sky: smooth atmospheric gradient, soft horizon haze and subtle clouds.
    scene.clearColor = new BABYLON.Color4(.72,.83,.92,1);

    try{
      const skyTex=new BABYLON.DynamicTexture(
        'v17PremiumSkyTex',
        {width:1024,height:512},
        scene,
        false
      );
      const sctx=skyTex.getContext();
      const SW=1024, SH=512;

      // Deeper blue overhead, bright airy horizon.
      const skyGrad=sctx.createLinearGradient(0,0,0,SH);
      skyGrad.addColorStop(0.00,'#5f9dd2');
      skyGrad.addColorStop(0.23,'#79add8');
      skyGrad.addColorStop(0.50,'#a6c9e5');
      skyGrad.addColorStop(0.72,'#d5e6f2');
      skyGrad.addColorStop(1.00,'#eef4f7');
      sctx.fillStyle=skyGrad;
      sctx.fillRect(0,0,SW,SH);

      // Atmospheric brightness near the skyline.
      const horizon=sctx.createLinearGradient(0,SH*.54,0,SH);
      horizon.addColorStop(0,'rgba(255,255,255,0)');
      horizon.addColorStop(.55,'rgba(255,248,238,.10)');
      horizon.addColorStop(1,'rgba(255,255,255,.22)');
      sctx.fillStyle=horizon;
      sctx.fillRect(0,SH*.54,SW,SH*.46);

      // Layered translucent ellipses create soft clouds without relying on canvas filters.
      function skyCloud(cx,cy,scale,alpha){
        const parts=[
          [-78,8,88,21],[-28,-8,74,29],[25,-14,83,34],[78,5,92,24],
          [0,8,145,28],[-45,10,105,24],[52,9,115,25]
        ];
        sctx.save();
        for(let layer=0;layer<3;layer++){
          sctx.globalAlpha=alpha*(layer===0?.25:layer===1?.19:.12);
          sctx.fillStyle=layer===0?'#ffffff':layer===1?'#f8fbfd':'#e8f1f7';
          for(const [dx,dy,rx,ry] of parts){
            sctx.beginPath();
            sctx.ellipse(
              cx+dx*scale,
              cy+dy*scale+layer*3,
              rx*scale*(1+layer*.08),
              ry*scale*(1+layer*.15),
              0,0,Math.PI*2
            );
            sctx.fill();
          }
        }
        sctx.restore();
      }

      // Spread cloud banks around the panorama so gentle texture is visible from most angles.
      skyCloud(130,150,.72,.62);
      skyCloud(360,108,.52,.48);
      skyCloud(610,165,.66,.52);
      skyCloud(865,118,.56,.44);
      skyCloud(250,260,.45,.24);
      skyCloud(760,245,.50,.22);

      // Very soft high-altitude wisps.
      sctx.save();
      sctx.globalAlpha=.10;
      sctx.fillStyle='#ffffff';
      sctx.beginPath(); sctx.ellipse(510,70,250,14,-.05,0,Math.PI*2); sctx.fill();
      sctx.beginPath(); sctx.ellipse(875,55,145,9,.03,0,Math.PI*2); sctx.fill();
      sctx.restore();

      skyTex.update();

      const skyMat=new BABYLON.StandardMaterial('v17PremiumSkyM',scene);
      skyMat.backFaceCulling=false;
      skyMat.disableLighting=true;
      skyMat.disableDepthWrite=true;
      skyMat.diffuseTexture=skyTex;
      skyMat.emissiveTexture=skyTex;
      skyMat.emissiveColor=new BABYLON.Color3(1,1,1);
      skyMat.specularColor=new BABYLON.Color3(0,0,0);

      const sky=BABYLON.MeshBuilder.CreateSphere(
        'v17PremiumSky',
        {diameter:220,segments:32,sideOrientation:BABYLON.Mesh.BACKSIDE},
        scene
      );
      sky.material=skyMat;
      sky.infiniteDistance=true;
      sky.isPickable=false;
      sky.applyFog=false;
      sky.renderingGroupId=0;

      window.NEXUS_SKY_READY=true;
    }catch(err){
      window.NEXUS_SKY_READY=false;
      console.error('Premium sky failed safely:',err);
    }

    scene.imageProcessingConfiguration.exposure = 1.16;
    scene.imageProcessingConfiguration.contrast = 1.07;
    const floor=scene.getMeshByName('floor'); if(floor) floor.material=pbr('v17Floor','#4b3022',.54,.03);
    const back=scene.getMeshByName('backWall'); if(back) back.material=pbr('v17Back','#202a35',.80,.06);
    const left=scene.getMeshByName('leftWall'); if(left) left.material=pbr('v17Left','#25303a',.82,.05);
    const right=scene.getMeshByName('rightWall'); if(right) right.material=pbr('v17Right','#25303a',.82,.05);

    const dark=pbr('v17Dark','#202a34',.34,.30);
    const dark2=pbr('v17Dark2','#303b47',.42,.25);
    const black=pbr('v17Black','#0f161f',.24,.42);
    const metal=pbr('v17Metal','#566372',.30,.50);
    const wood=pbr('v17Wood','#9a7555',.45,.04);
    const woodExec=pbr('v17WoodExec','#7d5b42',.41,.06);
    const trim=pbr('v17Trim','#d0ad82',.48,.03);
    const fabric=pbr('v17Fabric','#657384',.90,.01);
    const cabinet=pbr('v17Cabinet','#bcc4ca',.58,.06);
    const cabinetDark=pbr('v17CabinetDark','#5c6874',.42,.18);
    const serverBody=pbr('v17ServerBody','#141c25',.26,.58);
    const serverFront=pbr('v17ServerFront','#091018',.22,.44);
    const screen=pbr('v17Screen','#143a58',.20,.08); screen.emissiveColor=C('#368bd1');
    const blueGlow=std('v17BlueGlow','#112d49','#4caaff',1);
    const warmGlow=std('v17WarmGlow','#5d4027','#ffc080',1);
    const glassMat=new BABYLON.PBRMaterial('v17Glass',scene);
    glassMat.albedoColor=C('#9ccff1'); glassMat.alpha=.20; glassMat.roughness=.06; glassMat.metallic=.02; glassMat.backFaceCulling=false;

    const woodSeam=pbr('v17WoodSeam','#2f1c14',.72,.01);
    const woodHighlight=pbr('v17WoodHighlight','#6b4935',.63,.015);
    for(let i=0,x=-9.85;x<=9.85;x+=.58,i++){
      box('v17WoodSeam'+i,.012,.008,13.72,x,.004,0,woodSeam,root);
      if(i%4===1) box('v17WoodHighlight'+i,.008,.006,13.72,x+.19,.003,0,woodHighlight,root);
    }

    // Deep modern high-rise beneath the office floor.
    // A projecting office slab sits on a recessed dark-glass curtain-wall tower.
    const towerCore=pbr('v17TowerCore','#111820',.32,.24);
    const towerFrame=pbr('v17TowerFrame','#273440',.26,.48);
    const towerGlass=pbr('v17TowerGlass','#10283a',.15,.28);
    const towerGlassAlt=pbr('v17TowerGlassAlt','#173447',.16,.24);
    const towerLit=std('v17TowerLit','#173849','#4bb6d6',1);
    const towerAccent=std('v17TowerAccent','#0f3440','#00A19C',1);

    // Recessed tower body: much deeper than before so it reads as a real high-rise.
    box('v17TowerCore',19.10,6.30,12.62,0,-3.20,.05,towerCore,root);

    // Floating floor slab / shadow reveal below the office.
    box('v17TowerSlab',20.35,.26,13.78,0,-.22,0,towerFrame,root);
    box('v17TowerRevealFront',19.75,.075,.09,0,-.43,6.73,towerAccent,root);
    box('v17TowerRevealRight',.09,.075,13.10,9.73,-.43,0,towerAccent,root);
    box('v17TowerRevealLeft',.09,.075,13.10,-9.73,-.43,0,towerAccent,root);

    // Floor bands create the modern stacked-glass facade.
    for(let row=0;row<7;row++){
      const y=-.82-row*.78;
      box('v17TowerFrontBand'+row,19.18,.055,.10,0,y-.31,6.38,towerFrame,root);
      box('v17TowerRightBand'+row,.10,.055,12.54,9.58,y-.31,.05,towerFrame,root);
      box('v17TowerLeftBand'+row,.10,.055,12.54,-9.58,y-.31,.05,towerFrame,root);

      // Front curtain-wall glazing.
      for(let i=0;i<15;i++){
        const x=-8.55+i*1.22;
        const mat=((i+row)%5===0)?towerLit:(((i+row)%2===0)?towerGlassAlt:towerGlass);
        box('v17TowerFrontGlass'+row+'_'+i,1.05,.55,.045,x,y,6.44,mat,root);
        box('v17TowerFrontMullion'+row+'_'+i,.035,.60,.075,x+.57,y,6.46,towerFrame,root);
      }

      // Right-hand curtain wall, clearly visible from the default camera.
      for(let i=0;i<9;i++){
        const z=-4.86+i*1.20;
        const mat=((i+row)%4===0)?towerLit:(((i+row)%2===0)?towerGlass:towerGlassAlt);
        box('v17TowerRightGlass'+row+'_'+i,.045,.55,1.02,9.64,y,z,mat,root);
        box('v17TowerRightMullion'+row+'_'+i,.075,.60,.035,9.66,y,z+.56,towerFrame,root);
      }

      // Left facade so rotation still shows a complete tower.
      for(let i=0;i<9;i++){
        const z=-4.86+i*1.20;
        const mat=((i+row)%6===0)?towerLit:(((i+row)%2===0)?towerGlassAlt:towerGlass);
        box('v17TowerLeftGlass'+row+'_'+i,.045,.55,1.02,-9.64,y,z,mat,root);
      }
    }

    // Strong vertical corner fins and a few Petronas-toned light lines.
    box('v17TowerCornerR',.18,5.95,.18,9.67,-3.16,6.36,towerFrame,root);
    box('v17TowerCornerL',.18,5.95,.18,-9.67,-3.16,6.36,towerFrame,root);
    box('v17TowerAccentFrontA',.06,5.35,.075,-6.10,-3.12,6.49,towerAccent,root);
    box('v17TowerAccentFrontB',.06,5.35,.075,6.10,-3.12,6.49,towerAccent,root);

    // High-altitude city far below the office.
    // Kept deliberately low-poly so the iPhone can rotate the camera smoothly.
    try{
      const city=new BABYLON.TransformNode('v17CityRoot',scene);
      city.parent=root;

      const cityGroundY=-22.0;
      const cityGround=pbr('v17CityGroundM','#151c22',.80,.04);
      const cityRoad=pbr('v17CityRoadM','#252d33',.74,.05);
      const cityRoof=pbr('v17CityRoofM','#34414b',.48,.28);
      const cityGlassA=pbr('v17CityGlassAM','#1c3443',.26,.22);
      const cityGlassB=pbr('v17CityGlassBM','#243e4d',.30,.18);
      const cityGlassC=pbr('v17CityGlassCM','#2c4653',.34,.14);
      const cityLitWarm=std('v17CityLitWarmM','#4d402f','#e7bb77',1);
      const cityLitCool=std('v17CityLitCoolM','#18394a','#60b9d8',1);
      const cityBeacon=std('v17CityBeaconM','#3b1010','#ff6b63',1);

      // Large city slab, intentionally much lower than the office.
      box('v17CityGround',148,.38,148,0,cityGroundY-.22,0,cityGround,city);

      // Simple road grid seen from far above.
      const roadCoords=[-54,-36,-18,18,36,54];
      roadCoords.forEach((p,i)=>{
        box('v17CityRoadX'+i,146,.05,2.4,0,cityGroundY+.02,p,cityRoad,city);
        box('v17CityRoadZ'+i,2.4,.05,146,p,cityGroundY+.025,0,cityRoad,city);
      });

      // A wider cross-axis boulevard around our tower.
      box('v17CityBoulevardX',146,.06,4.2,0,cityGroundY+.04,0,cityRoad,city);
      box('v17CityBoulevardZ',4.2,.06,146,0,cityGroundY+.045,0,cityRoad,city);

      // Extend the host tower down toward the city without adding hundreds of façade meshes.
      box('v17TowerLowerCore',18.55,15.7,12.05,0,-13.85,.05,towerCore,city);
      for(let r=0;r<9;r++){
        const y=-7.1-r*1.62;
        box('v17TowerLowerBandF'+r,18.72,.075,.08,0,y,6.10,towerFrame,city);
        box('v17TowerLowerBandR'+r,.08,.075,11.90,9.31,y,.05,towerFrame,city);
        box('v17TowerLowerBandL'+r,.08,.075,11.90,-9.31,y,.05,towerFrame,city);
      }
      box('v17TowerLowerAccentF1',.07,14.9,.09,-5.80,-13.85,6.16,towerAccent,city);
      box('v17TowerLowerAccentF2',.07,14.9,.09,5.80,-13.85,6.16,towerAccent,city);

      // Deterministic pseudo-random generator so the city remains stable between loads.
      let citySeed=157031;
      const rnd=()=>{
        citySeed=(citySeed*1664525+1013904223)>>>0;
        return citySeed/4294967296;
      };

      const buildingMats=[cityGlassA,cityGlassB,cityGlassC];
      let bi=0;

      // City blocks in a broad square around the central tower.
      for(let gx=-3;gx<=3;gx++){
        for(let gz=-3;gz<=3;gz++){
          // Keep a wide empty plaza around the NEXUS skyscraper.
          if(Math.abs(gx)<=1 && Math.abs(gz)<=1) continue;

          const cellX=gx*17.5;
          const cellZ=gz*17.5;

          // 1–2 towers per city block, with taller landmarks mixed in.
          const count=(rnd()>.50)?2:1;
          for(let k=0;k<count;k++){
            const x=cellX+(rnd()-.5)*8.5;
            const z=cellZ+(rnd()-.5)*8.5;
            const landmark=rnd()>.88;
            const h=landmark?(13+rnd()*12):(4.5+rnd()*10.5);
            const w=3.0+rnd()*5.0;
            const d=3.0+rnd()*5.0;
            const y=cityGroundY+h/2;

            const mat=buildingMats[Math.floor(rnd()*buildingMats.length)];
            box('v17CityBuilding'+bi,w,h,d,x,y,z,mat,city);

            // Roof cap / mechanical penthouse gives silhouettes more detail.
            box('v17CityRoof'+bi,w*.72,.22,d*.72,x,cityGroundY+h+.12,z,cityRoof,city);

            // One glowing façade strip per building is enough at this distance.
            const lit=(rnd()>.58)?cityLitWarm:cityLitCool;
            if(rnd()>.28){
              box(
                'v17CityLightStrip'+bi,
                Math.max(.16,w*.06),
                Math.max(.9,h*.68),
                .035,
                x+w*.32,
                y,
                z+d/2+.03,
                lit,
                city
              );
            }

            // Occasional aviation beacon on taller towers.
            if(h>14 && rnd()>.45){
              const b=box('v17CityBeacon'+bi,.16,.16,.16,x,cityGroundY+h+.42,z,cityBeacon,city);
              b.isPickable=false;
            }
            bi++;
          }
        }
      }

      // A few distant signature towers make the skyline interesting at every camera angle.
      const landmarks=[
        [-48,-10,7.5,20], [45,13,8.5,24], [-18,50,6.8,19], [23,-51,7.8,22],
        [-55,43,6.5,17], [54,-42,7.2,21]
      ];
      landmarks.forEach((v,i)=>{
        const [x,z,w,h]=v;
        box('v17CityLandmark'+i,w,h,w*.72,x,cityGroundY+h/2,z,i%2?cityGlassA:cityGlassB,city);
        box('v17CityLandmarkRoof'+i,w*.62,.28,w*.42,x,cityGroundY+h+.15,z,cityRoof,city);
        box('v17CityLandmarkGlow'+i,.18,h*.72,.05,x-w*.28,cityGroundY+h*.52,z+w*.36+.03,i%2?cityLitCool:cityLitWarm,city);
      });

      // Subtle atmospheric plane softens the city and exaggerates the height.
      const hazeMat=new BABYLON.StandardMaterial('v17CityHazeM',scene);
      hazeMat.diffuseColor=C('#8fb5ca');
      hazeMat.emissiveColor=C('#58798c');
      hazeMat.alpha=.085;
      hazeMat.disableLighting=true;
      hazeMat.backFaceCulling=false;
      const haze=BABYLON.MeshBuilder.CreatePlane(
        'v17CityHaze',
        {width:155,height:155,sideOrientation:BABYLON.Mesh.DOUBLESIDE},
        scene
      );
      haze.parent=city;
      haze.rotation.x=Math.PI/2;
      haze.position.set(0,cityGroundY+8.0,0);
      haze.material=hazeMat;
      haze.isPickable=false;

      window.NEXUS_CITY_READY=true;
    }catch(err){
      window.NEXUS_CITY_READY=false;
      console.error('City skyline failed safely:',err);
    }

    const winMat=std('v17Win','#a8d5ef',null,.26);
    for(let i=0;i<6;i++){
      const x=-8.8+i*3.15;
      const p=BABYLON.MeshBuilder.CreatePlane('v17Window'+i,{width:2.95,height:3.15,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
      p.parent=root; p.position.set(x,2.0,-7.12); p.material=winMat;
    }

    const BACK=-7.10, FRONT=-2.82, H=2.82;
    const server={left:-10.22,right:-4.92,cx:-7.57};
    const jamesRoom={left:-4.92,right:1.55,cx:-1.685};
    const meeting={left:1.55,right:10.22,cx:5.885};

    const autoDoors=[];
    function registerAutoDoor(name,doorX,z,doorW){
      const panelW=(doorW-.10)/2;
      const panelH=H-.20;
      const closedLeft=doorX-panelW/2;
      const closedRight=doorX+panelW/2;

      // Sliding groups: glass + full frame + handle move together.
      const leftSlide=new BABYLON.TransformNode(name+'SlideL',scene);
      leftSlide.parent=root;
      leftSlide.position.set(closedLeft,0,z+.025);

      const rightSlide=new BABYLON.TransformNode(name+'SlideR',scene);
      rightSlide.parent=root;
      rightSlide.position.set(closedRight,0,z+.025);

      // Left framed panel.
      box(name+'DoorLGlass',panelW-.08,panelH-.10,.035,0,H/2,0,glassMat,leftSlide);
      box(name+'DoorLTop',panelW,.055,.060,0,H-.125,0,dark,leftSlide);
      box(name+'DoorLBottom',panelW,.055,.060,0,.125,0,dark,leftSlide);
      box(name+'DoorLFrameOuter',.045,panelH,.060,-panelW/2+.022,H/2,0,dark,leftSlide);
      box(name+'DoorLFrameInner',.045,panelH,.060,panelW/2-.022,H/2,0,dark,leftSlide);
      box(name+'HandleL',.035,.34,.075,panelW/2-.105,1.34,.048,dark,leftSlide);

      // Right framed panel.
      box(name+'DoorRGlass',panelW-.08,panelH-.10,.035,0,H/2,0,glassMat,rightSlide);
      box(name+'DoorRTop',panelW,.055,.060,0,H-.125,0,dark,rightSlide);
      box(name+'DoorRBottom',panelW,.055,.060,0,.125,0,dark,rightSlide);
      box(name+'DoorRFrameOuter',.045,panelH,.060,panelW/2-.022,H/2,0,dark,rightSlide);
      box(name+'DoorRFrameInner',.045,panelH,.060,-panelW/2+.022,H/2,0,dark,rightSlide);
      box(name+'HandleR',.035,.34,.075,-panelW/2+.105,1.34,.048,dark,rightSlide);

      autoDoors.push({
        name,
        x:doorX,
        z,
        width:doorW,
        panelW,
        leftSlide,
        rightSlide,
        closedLeft,
        closedRight,
        openLeft:closedLeft-panelW*1.08,
        openRight:closedRight+panelW*1.08,
        openness:0,
        holdUntil:0
      });
    }
    function glassWallZ(name,left,right,z,doorX=null,doorW=1.08){
      const frameH=.065;
      box(name+'Top',right-left,frameH,.08,(left+right)/2,H,z,dark,root);
      box(name+'Bottom',right-left,frameH,.08,(left+right)/2,.08,z,dark,root);
      box(name+'LeftPost',.07,H,.08,left,H/2,z,dark,root);
      box(name+'RightPost',.07,H,.08,right,H/2,z,dark,root);
      const panels=[];
      if(doorX===null){ panels.push([left+.08,right-.08]); }
      else { panels.push([left+.08,doorX-doorW/2-.05],[doorX+doorW/2+.05,right-.08]); }
      panels.filter(p=>p[1]-p[0]>.16).forEach((p,i)=>{
        box(name+'Glass'+i,p[1]-p[0],H-.20,.035,(p[0]+p[1])/2,H/2,z,glassMat,root);
      });
      if(doorX!==null){
        box(name+'DoorPostL',.055,H,.08,doorX-doorW/2,H/2,z,dark,root);
        box(name+'DoorPostR',.055,H,.08,doorX+doorW/2,H/2,z,dark,root);
        registerAutoDoor(name,doorX,z,doorW);
      }
    }
    function glassWallX(name,x,z1,z2){
      const len=Math.abs(z2-z1), cz=(z1+z2)/2;
      box(name+'Top',.08,.065,len,x,H,cz,dark,root);
      box(name+'Bottom',.08,.065,len,x,.08,cz,dark,root);
      box(name+'FrontPost',.08,H,.07,x,H/2,z2,dark,root);
      box(name+'BackPost',.08,H,.07,x,H/2,z1,dark,root);
      box(name+'Glass',.035,H-.20,len-.16,x,H/2,cz,glassMat,root);
    }

    glassWallZ('v17ServerFront',server.left,server.right,FRONT,server.cx+.95,1.10);
    glassWallZ('v17JamesFront',jamesRoom.left,jamesRoom.right,FRONT,jamesRoom.cx,1.12);
    glassWallZ('v17MeetingFront',meeting.left,meeting.right,FRONT,meeting.cx-2.55,1.18);
    glassWallX('v17ServerJamesDivider',server.right,BACK,FRONT);
    glassWallX('v17JamesMeetingDivider',jamesRoom.right,BACK,FRONT);

    box('v17ServerWarm',server.right-server.left-.15,.024,.035,server.cx,.065,FRONT+.055,warmGlow,root);
    box('v17JamesWarm',jamesRoom.right-jamesRoom.left-.15,.024,.035,jamesRoom.cx,.065,FRONT+.055,warmGlow,root);
    box('v17MeetingWarm',meeting.right-meeting.left-.15,.024,.035,meeting.cx,.065,FRONT+.055,warmGlow,root);

    const roles={
      James:['Leitung','crown'], Walter:['Technik','wrench'], Gisela:['Wissen & Archiv','database'],
      Nora:['Mail','mail'], Kevin:['Recherche','search'], Lina:['Kalender','calendar'], Sarah:['Kontakte','people'], Finn:['Follow-up','check']
    };
    function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
    function drawIcon(ctx,type,cx,cy,s){
      ctx.strokeStyle='#e5f7ff';ctx.fillStyle='#e5f7ff';ctx.lineWidth=10*s;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#39a4ff';ctx.shadowBlur=18*s;
      const line=(...p)=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.stroke();};
      const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
      if(type==='mail'){ctx.strokeRect(cx-36*s,cy-23*s,72*s,46*s);line(cx-36*s,cy-22*s,cx,cy+6*s,cx+36*s,cy-22*s);}
      else if(type==='search'){circle(cx-5*s,cy-5*s,24*s);line(cx+12*s,cy+12*s,cx+38*s,cy+38*s);}
      else if(type==='database'){for(const yy of [-21,0,21]){ctx.beginPath();ctx.ellipse(cx,cy+yy*s,33*s,10*s,0,0,Math.PI*2);ctx.stroke();}line(cx-33*s,cy-21*s,cx-33*s,cy+21*s);line(cx+33*s,cy-21*s,cx+33*s,cy+21*s);}
      else if(type==='calendar'){ctx.strokeRect(cx-34*s,cy-29*s,68*s,58*s);line(cx-34*s,cy-9*s,cx+34*s,cy-9*s);line(cx-17*s,cy-38*s,cx-17*s,cy-24*s);line(cx+17*s,cy-38*s,cx+17*s,cy-24*s);}
      else if(type==='wrench'){line(cx-21*s,cy+21*s,cx+20*s,cy-20*s);circle(cx+25*s,cy-25*s,9*s);}
      else if(type==='people'){circle(cx-13*s,cy-11*s,13*s);circle(cx+16*s,cy-14*s,10*s);ctx.beginPath();ctx.arc(cx-13*s,cy+22*s,22*s,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.arc(cx+16*s,cy+19*s,17*s,Math.PI,0);ctx.stroke();}
      else if(type==='check'){line(cx-29*s,cy+2*s,cx-7*s,cy+23*s,cx+33*s,cy-23*s);}
      else if(type==='crown'){line(cx-36*s,cy+21*s,cx-28*s,cy-18*s,cx-6*s,cy+2*s,cx,cy-26*s,cx+6*s,cy+2*s,cx+28*s,cy-18*s,cx+36*s,cy+21*s);line(cx-36*s,cy+21*s,cx+36*s,cy+21*s);}
    }
    function panelTex(name){
      const [,icon]=roles[name];
      const tex=new BABYLON.DynamicTexture('v17PanelTex'+name,{width:700,height:280},scene,false);
      const ctx=tex.getContext();
      ctx.clearRect(0,0,700,280);

      // Premium smoked plaque, but intentionally icon-only.
      const g=ctx.createLinearGradient(0,0,700,280);
      g.addColorStop(0,'#061019');
      g.addColorStop(.55,'#0a1822');
      g.addColorStop(1,'#0d202b');
      ctx.fillStyle=g;
      roundRect(ctx,8,8,684,264,24);
      ctx.fill();

      // Segmented cyan frame like James' NEXUS wall sign.
      ctx.save();
      ctx.strokeStyle='#00dff4';
      ctx.lineWidth=5;
      ctx.shadowColor='#00dff4';
      ctx.shadowBlur=22;
      ctx.beginPath();
      ctx.moveTo(28,30);ctx.lineTo(236,30);
      ctx.moveTo(464,30);ctx.lineTo(672,30);
      ctx.moveTo(28,250);ctx.lineTo(194,250);
      ctx.moveTo(506,250);ctx.lineTo(672,250);
      ctx.stroke();
      ctx.restore();

      // Each workplace gets only its functional symbol.
      drawIcon(ctx,icon,350,140,2.15);

      tex.update();
      return tex;
    }

    function chair(name,parent,x,z,rot=0){
      const g=new BABYLON.TransformNode('v17Chair'+name,scene);g.parent=parent;g.position.set(x,0,z);g.rotation.y=rot;
      cyl('v17ChairBase'+name,.50,.055,0,.32,0,black,g);cyl('v17ChairStem'+name,.055,.36,0,.54,0,metal,g);
      box('v17ChairSeat'+name,.58,.11,.58,0,.76,0,fabric,g);box('v17ChairBack'+name,.60,.78,.10,0,1.12,.29,fabric,g);
      box('v17ChairArmL'+name,.07,.18,.45,-.26,.82,.01,dark,g);box('v17ChairArmR'+name,.07,.18,.45,.26,.82,.01,dark,g);
    }
    function monitor(name,parent,x,z,yaw=0){
      const g=new BABYLON.TransformNode('v17Mon'+name,scene);
      g.parent=parent;
      g.position.set(x,0,z);
      g.rotation.y=yaw;

      const deskName=name.replace(/[AB]$/,'');
      const variant=name.endsWith('B')?'work':'desktop';

      function monitorTexture(){
        const tex=new BABYLON.DynamicTexture(
          'v17MonitorTex'+name,
          {width:1024,height:612},
          scene,
          false
        );
        const ctx=tex.getContext();

        // Dark NEXUS desktop background.
        const bg=ctx.createLinearGradient(0,0,1024,612);
        bg.addColorStop(0,'#07131d');
        bg.addColorStop(.55,'#0d2637');
        bg.addColorStop(1,'#103b52');
        ctx.fillStyle=bg;
        ctx.fillRect(0,0,1024,612);

        // Soft cyan ambient glow in the wallpaper.
        const glow=ctx.createRadialGradient(760,185,20,760,185,320);
        glow.addColorStop(0,'rgba(70,210,245,.24)');
        glow.addColorStop(1,'rgba(20,80,110,0)');
        ctx.fillStyle=glow;
        ctx.fillRect(0,0,1024,612);

        // Tiny NEXUS mark in the wallpaper, subtle rather than a giant name.
        ctx.save();
        ctx.globalAlpha=.10;
        ctx.fillStyle='#bffaff';
        ctx.font='800 86px Arial';
        ctx.textAlign='right';
        ctx.fillText('NEXUS',955,115);
        ctx.restore();

        if(variant==='desktop'){
          // A believable desktop with a few icons and one small open system card.
          const iconItems=[
            ['FILES',42,64],['MAIL',42,150],['TASKS',42,236],['NEXUS',42,322]
          ];
          iconItems.forEach(([label,ix,iy],i)=>{
            ctx.fillStyle=i===3?'#1c718a':'#17384a';
            roundRect(ctx,ix,iy,54,54,10);
            ctx.fill();
            ctx.strokeStyle='#55d8ee';
            ctx.lineWidth=2;
            ctx.stroke();
            ctx.fillStyle='#bedce6';
            ctx.font='600 14px Arial';
            ctx.textAlign='left';
            ctx.fillText(label,ix+68,iy+33);
          });

          // Small centered desktop widget.
          ctx.fillStyle='rgba(5,14,22,.72)';
          roundRect(ctx,610,300,292,150,18);
          ctx.fill();
          ctx.strokeStyle='rgba(82,215,238,.55)';
          ctx.lineWidth=2;
          ctx.stroke();

          ctx.fillStyle='#74dff0';
          ctx.font='700 18px Arial';
          ctx.textAlign='left';
          ctx.fillText('NEXUS DESKTOP',636,335);

          // Name appears only as a normal user/profile label.
          ctx.fillStyle='#ecfbff';
          ctx.font='700 31px Arial';
          ctx.fillText(deskName,636,382);

          ctx.fillStyle='#7898a5';
          ctx.font='500 15px Arial';
          ctx.fillText('Workspace ready',636,414);

          // User avatar dot.
          ctx.fillStyle='#00dff4';
          ctx.beginPath();
          ctx.arc(861,375,19,0,Math.PI*2);
          ctx.fill();
        }else{
          // Second monitor: ordinary work window, not another name display.
          ctx.fillStyle='rgba(8,18,27,.92)';
          roundRect(ctx,84,62,850,458,16);
          ctx.fill();

          // Window chrome.
          ctx.fillStyle='#172a37';
          roundRect(ctx,84,62,850,48,16);
          ctx.fill();
          ctx.fillRect(84,90,850,20);

          ['#ff726d','#ffd36a','#62df8e'].forEach((col,i)=>{
            ctx.fillStyle=col;
            ctx.beginPath();
            ctx.arc(111+i*28,84,7,0,Math.PI*2);
            ctx.fill();
          });

          // Sidebar.
          ctx.fillStyle='#10212c';
          ctx.fillRect(84,110,188,410);
          for(let i=0;i<6;i++){
            ctx.fillStyle=i===1?'#1a465a':'#17313f';
            roundRect(ctx,104,135+i*54,148,35,8);
            ctx.fill();
          }

          // Main content blocks.
          ctx.fillStyle='#173847';
          roundRect(ctx,304,144,580,70,12);
          ctx.fill();
          ctx.fillStyle='#244d5e';
          roundRect(ctx,304,238,275,118,12);
          ctx.fill();
          roundRect(ctx,609,238,275,118,12);
          ctx.fill();
          ctx.fillStyle='#163443';
          roundRect(ctx,304,382,580,92,12);
          ctx.fill();

          // Small data lines.
          ctx.strokeStyle='#48bfd6';
          ctx.lineWidth=4;
          ctx.beginPath();
          ctx.moveTo(334,438);
          ctx.lineTo(405,420);
          ctx.lineTo(470,446);
          ctx.lineTo(548,405);
          ctx.lineTo(620,429);
          ctx.lineTo(692,397);
          ctx.lineTo(772,417);
          ctx.lineTo(847,391);
          ctx.stroke();
        }

        // Windows-like taskbar on both screens.
        ctx.fillStyle='rgba(4,10,15,.90)';
        ctx.fillRect(0,566,1024,46);

        // Start/menu button.
        ctx.fillStyle='#35bfd8';
        roundRect(ctx,18,576,27,27,6);
        ctx.fill();

        // Pinned app hints.
        [68,108,148,188].forEach((px,i)=>{
          ctx.fillStyle=i===1?'#49d7ee':'#24495a';
          roundRect(ctx,px,579,23,23,5);
          ctx.fill();
        });

        // Clock/status hint.
        ctx.fillStyle='#9fb7c1';
        ctx.font='500 14px Arial';
        ctx.textAlign='right';
        ctx.fillText('NEXUS  •  ONLINE',998,595);

        tex.update();
        return tex;
      }

      const tex=monitorTexture();
      const screenMat=new BABYLON.StandardMaterial('v17MonitorScreenM'+name,scene);
      screenMat.diffuseTexture=tex;
      screenMat.emissiveTexture=tex;
      screenMat.emissiveColor=C('#a8dfee');
      screenMat.disableLighting=true;
      screenMat.backFaceCulling=false;

      box('v17MonFrame'+name,.65,.41,.050,0,1.22,0,black,g);
      box('v17MonScreen'+name,.57,.34,.014,0,1.22,.031,screenMat,g);
      box('v17MonStem'+name,.045,.27,.045,0,.99,0,metal,g);
      box('v17MonFoot'+name,.25,.025,.14,0,.84,0,metal,g);
    }
    function deskPropBox(parent,name,w,h,d,x,y,z,hex,rot=0){
      return box('v17Prop'+name,w,h,d,x,y,z,pbr('v17PropM'+name,hex,.58,.025),parent,rot);
    }
    function deskPropCyl(parent,name,diam,h,x,y,z,hex){
      return cyl('v17Prop'+name,diam,h,x,y,z,pbr('v17PropM'+name,hex,.60,.03),parent);
    }
    function addDeskProps(parent,name){
      if(!parent) return;
      switch(name){
        case 'James':
          deskPropBox(parent,'JamesFolio',.31,.026,.22,.58,.866,.24,'#5f422f',-.08);
          deskPropBox(parent,'JamesPhone',.085,.014,.16,.88,.858,.26,'#161c23',-.10);
          deskPropCyl(parent,'JamesPen',.018,.22,.38,.872,.25,'#c6a56e');
          break;
        case 'Walter':
          deskPropBox(parent,'WalterToolCase',.34,.09,.20,.58,.895,.30,'#283641',.04);
          deskPropBox(parent,'WalterDiagnostic',.20,.035,.15,.88,.866,.26,'#142432',-.08);
          deskPropCyl(parent,'WalterSensor',.09,.055,.90,.885,.47,'#4d9bd6');
          break;
        case 'Gisela':
          deskPropBox(parent,'GiselaFileA',.31,.035,.21,.58,.86,.26,'#6f8291',.04);
          deskPropBox(parent,'GiselaFileB',.29,.035,.20,.58,.900,.26,'#c2a66f',.04);
          deskPropBox(parent,'GiselaFileC',.27,.035,.19,.58,.940,.26,'#8d6b59',.04);
          break;
        case 'Nora':
          deskPropBox(parent,'NoraInbox',.34,.055,.23,.58,.876,.26,'#80909d',.02);
          deskPropBox(parent,'NoraEnvelopeA',.23,.012,.14,.58,.913,.26,'#eee7da',-.05);
          deskPropBox(parent,'NoraEnvelopeB',.21,.012,.13,.62,.929,.29,'#d9e1e6',.06);
          break;
        case 'Kevin':
          deskPropBox(parent,'KevinTablet',.27,.018,.19,.58,.858,.27,'#15212c',-.10);
          deskPropBox(parent,'KevinNotes',.24,.020,.17,.88,.860,.28,'#d8d0bf',.08);
          deskPropCyl(parent,'KevinLens',.11,.025,.88,.878,.47,'#6ba2c7');
          break;
        case 'Lina':
          deskPropBox(parent,'LinaPlanner',.28,.030,.20,.58,.865,.27,'#a37b59',-.04);
          deskPropBox(parent,'LinaCalendar',.22,.09,.035,.89,.91,.31,'#c8d3df',0);
          deskPropBox(parent,'LinaTab',.05,.014,.10,.73,.890,.25,'#6e91b4',.02);
          break;
        case 'Sarah':
          deskPropBox(parent,'SarahContactBook',.29,.030,.20,.58,.865,.26,'#718aa3',.06);
          deskPropBox(parent,'SarahPhoneBase',.21,.045,.15,.88,.873,.27,'#252d36',-.06);
          deskPropBox(parent,'SarahPhoneHandset',.18,.035,.055,.88,.915,.27,'#151a20',-.06);
          break;
        case 'Finn':
          deskPropBox(parent,'FinnClipboard',.25,.022,.31,.58,.861,.27,'#b89969',-.06);
          deskPropBox(parent,'FinnChecklist',.20,.010,.25,.58,.879,.27,'#ece8de',-.06);
          deskPropBox(parent,'FinnFollowupTray',.30,.055,.20,.89,.878,.28,'#536f89',.04);
          break;
      }
    }

    function centerPlanter(name,x,z,scale=1){
      const g=new BABYLON.TransformNode('v17CenterPlanter'+name,scene);g.parent=root;g.position.set(x,0,z);
      const pot=pbr('v17CenterPlanterPotM'+name,'#2b343d',.46,.24);
      const soil=pbr('v17CenterPlanterSoilM'+name,'#30251d',.88,.01);
      const leaf=pbr('v17CenterPlanterLeafM'+name,'#35795b',.72,.01);
      cyl('v17CenterPlanterPot'+name,.48*scale,.40*scale,0,.20*scale,0,pot,g);
      cyl('v17CenterPlanterSoil'+name,.39*scale,.04*scale,0,.42*scale,0,soil,g);
      for(let i=0;i<7;i++){
        const a=(i/7)*Math.PI*2;
        const stem=box('v17CenterStem'+name+i,.035*scale,.50*scale,.035*scale,Math.cos(a)*.08*scale,.70*scale,Math.sin(a)*.08*scale,leaf,g);
        stem.rotation.z=(i%2?1:-1)*(.18+.04*(i%3));
        const l=BABYLON.MeshBuilder.CreateSphere('v17CenterLeaf'+name+i,{diameter:.24*scale,segments:10},scene);
        l.parent=g;l.position.set(Math.cos(a)*.16*scale,(.78+(i%3)*.08)*scale,Math.sin(a)*.16*scale);
        l.scaling.set(.72,1.45,.36);l.rotation.y=a;l.material=leaf;
      }
      return g;
    }

    function haloDeskName(name,parent,exec=false){
      if(!parent) return;

      const haloRoot=new BABYLON.TransformNode('v17HaloDeskName'+name,scene);
      haloRoot.parent=parent;
      haloRoot.position.set(0,1.80,.14);

      const labelW=exec?1.22:1.04;
      const labelH=exec?.25:.22;

      const tex=new BABYLON.DynamicTexture(
        'v17HaloDeskNameTex'+name,
        {width:1024,height:280},
        scene,
        false
      );
      tex.hasAlpha=true;
      const ctx=tex.getContext();
      ctx.clearRect(0,0,1024,280);
      ctx.textAlign='center';
      ctx.textBaseline='middle';

      // Layered cyan hologram lettering.
      ctx.save();
      ctx.globalAlpha=.22;
      ctx.shadowColor='#00dff4';
      ctx.shadowBlur=42;
      ctx.fillStyle='#00dff4';
      ctx.font='900 124px Arial';
      ctx.fillText(name.toUpperCase(),512,142);
      ctx.restore();

      ctx.save();
      ctx.shadowColor='#00dff4';
      ctx.shadowBlur=22;
      ctx.fillStyle='rgba(226,253,255,.94)';
      ctx.font='800 112px Arial';
      ctx.fillText(name.toUpperCase(),512,142);
      ctx.restore();

      ctx.strokeStyle='rgba(0,223,244,.72)';
      ctx.lineWidth=2;
      ctx.strokeText(name.toUpperCase(),512,142);
      tex.update();

      const mat=new BABYLON.StandardMaterial('v17HaloDeskNameM'+name,scene);
      mat.diffuseTexture=tex;
      mat.emissiveTexture=tex;
      mat.opacityTexture=tex;
      mat.emissiveColor=C('#b9fbff');
      mat.disableLighting=true;
      mat.backFaceCulling=false;
      mat.alpha=.92;

      const plane=BABYLON.MeshBuilder.CreatePlane(
        'v17HaloDeskNamePlane'+name,
        {width:labelW,height:labelH,sideOrientation:BABYLON.Mesh.DOUBLESIDE},
        scene
      );
      plane.parent=haloRoot;
      plane.position.set(0,.055,0);
      plane.material=mat;
      plane.isPickable=false;
      plane.renderingGroupId=0;
      plane.billboardMode=BABYLON.Mesh.BILLBOARDMODE_Y;

      // A few tiny scan markers keep it holographic without becoming a full sign.
      const markerMat=std('v17HaloDeskMarkerM'+name,'#04171c','#00a8bb',.62);
      box('v17HaloDeskMarkerL'+name,.12,.010,.010,-labelW*.38,-.045,.012,markerMat,haloRoot);
      box('v17HaloDeskMarkerR'+name,.12,.010,.010,labelW*.38,-.045,.012,markerMat,haloRoot);

      window.NEXUS_HALO_LABELS=window.NEXUS_HALO_LABELS||[];
      haloRoot.metadata={
        baseY:haloRoot.position.y,
        phase:window.NEXUS_HALO_LABELS.length*.67,
        visualMeshes:[plane].concat(haloRoot.getChildMeshes(false).filter(m=>m!==plane))
      };
      window.NEXUS_HALO_LABELS.push(haloRoot);

      if(!window.NEXUS_HALO_LABELS_ANIM){
        window.NEXUS_HALO_LABELS_ANIM=true;
        scene.registerBeforeRender(()=>{
          const t=performance.now()/1000;
          (window.NEXUS_HALO_LABELS||[]).forEach(node=>{
            if(!node || !node.metadata) return;

            node.position.y=node.metadata.baseY+Math.sin(t*1.55+node.metadata.phase)*.018;
            const pulse=.94+Math.sin(t*2.05+node.metadata.phase)*.035;
            node.scaling.set(pulse,pulse,pulse);

            // Halo may be visible through glass. Only opaque masonry/outer walls occlude it.
            const cam=scene.activeCamera;
            let blocked=false;
            if(cam){
              const camPos=(cam.globalPosition||cam.position).clone();
              const target=node.getAbsolutePosition().add(new BABYLON.Vector3(0,.055,0));
              const dir=target.subtract(camPos);
              const distance=dir.length();

              if(distance>.05){
                dir.normalize();
                const ray=new BABYLON.Ray(camPos,dir,distance-.04);

                for(const mesh of scene.meshes){
                  if(!mesh || !mesh.isEnabled() || mesh===plane) continue;
                  const n=mesh.name||'';
                  const isOpaqueWall=n==='backWall' || n==='leftWall' || n==='rightWall';
                  if(!isOpaqueWall) continue;

                  const hit=ray.intersectsMesh(mesh,false);
                  if(hit && hit.hit && hit.distance<distance-.05){
                    blocked=true;
                    break;
                  }
                }
              }
            }

            (node.metadata.visualMeshes||node.getChildMeshes(false)).forEach(mesh=>{
              mesh.isVisible=!blocked;
            });
          });
        });
      }

      return haloRoot;
    }

    function desk(name,x,z,rot=0,exec=false,signSide=1){
      const g=new BABYLON.TransformNode('v17Desk'+name,scene);g.parent=root;g.position.set(x,0,z);g.rotation.y=rot;
      const W=exec?2.72:2.28,D=exec?1.05:.94,RW=exec?.86:.74,RD=exec?1.22:1.10,top=exec?woodExec:wood;
      box('v17DeskBase'+name,W-.12,.62,.38,0,.33,-D/2+.20,dark2,g);
      box('v17DeskTop'+name,W,.10,D,0,.78,0,top,g);box('v17DeskTrim'+name,W,.022,D,0,.842,0,trim,g);
      box('v17DeskReturn'+name,RW,.10,RD,W/2-RW/2,.78,D/2+RD/2-.06,top,g);
      box('v17DeskReturnTrim'+name,RW,.022,RD,W/2-RW/2,.842,D/2+RD/2-.06,trim,g);
      box('v17DeskCab'+name,.44,.61,.66,-W/2+.25,.34,-.04,dark2,g);

      // Full underbuild below the L-return: inset cabinet/pedestal so the return is visibly supported.
      const returnX=W/2-RW/2;
      const returnZ=D/2+RD/2-.06;
      box('v17DeskReturnUnderbuild'+name,RW-.14,.61,RD-.22,returnX,.34,returnZ,dark2,g);
      box('v17DeskReturnBase'+name,RW-.06,.055,RD-.14,returnX,.035,returnZ,dark,g);
      box('v17DeskReturnReveal'+name,RW-.24,.035,RD-.32,returnX,.665,returnZ,pbr('v17DeskReturnRevealM'+name,'#121a22',.36,.18),g);
      monitor(name+'A',g,-.37,-.20,.08); monitor(name+'B',g,.34,-.20,-.08);
      box('v17Key'+name,.50,.025,.15,-.10,.86,.18,pbr('v17KeyM'+name,'#e0e6eb',.82,.02),g);
      box('v17Mouse'+name,.09,.023,.13,.31,.862,.18,pbr('v17MouseM'+name,'#e0e6eb',.82,.02),g);
      cyl('v17Mug'+name,.11,.11,-W*.38,.90,.16,pbr('v17MugM'+name,'#eef2f5',.82,.02),g);
      const tex=panelTex(name);
      const mat=new BABYLON.StandardMaterial('v17PanelM'+name,scene);
      mat.diffuseTexture=tex;
      mat.emissiveTexture=tex;
      mat.emissiveColor=C('#a8fbff');
      mat.disableLighting=true;
      mat.backFaceCulling=false;

      const pw=exec?1.18:1.04,ph=exec?.49:.43;
      const centerSideSign=['Gisela','Nora','Kevin','Lina'].includes(name);

      // James-style materials: smoked plaque, inset panel, segmented cyan edge light.
      const signBackMat=pbr('v17DeskSignBackM'+name,'#07121b',.18,.44);
      const signInnerMat=pbr('v17DeskSignInnerM'+name,'#0b1a25',.20,.34);
      const signEdgeMat=std('v17DeskSignEdgeM'+name,'#062d36','#00dff4',1);
      const signEdgeSoftMat=std('v17DeskSignEdgeSoftM'+name,'#09262d','#009fb7',1);

      function buildPremiumDeskSign(x,y,z,rotY,width,height){
        const sg=new BABYLON.TransformNode('v17DeskSignRoot'+name,scene);
        sg.parent=g;
        sg.position.set(x,y,z);
        sg.rotation.y=rotY;

        box('v17DeskSignBack'+name,width+.18,height+.16,.085,0,0,0,signBackMat,sg);
        box('v17DeskSignInner'+name,width+.035,height+.015,.030,0,0,.058,signInnerMat,sg);

        const topSeg=Math.max(.16,width*.31);
        const bottomSeg=Math.max(.13,width*.23);
        box('v17DeskSignTopL'+name,topSeg,.018,.024,-width*.27,height/2+.048,.090,signEdgeMat,sg);
        box('v17DeskSignTopR'+name,topSeg,.018,.024,width*.27,height/2+.048,.090,signEdgeMat,sg);
        box('v17DeskSignBottomL'+name,bottomSeg,.016,.022,-width*.31,-height/2-.048,.090,signEdgeSoftMat,sg);
        box('v17DeskSignBottomR'+name,bottomSeg,.016,.022,width*.31,-height/2-.048,.090,signEdgeSoftMat,sg);
        box('v17DeskSignSideL'+name,.016,height*.50,.022,-width/2-.072,0,.090,signEdgeSoftMat,sg);
        box('v17DeskSignSideR'+name,.016,height*.50,.022,width/2+.072,0,.090,signEdgeSoftMat,sg);

        const p=BABYLON.MeshBuilder.CreatePlane(
          'v17Panel'+name,
          {width,height,sideOrientation:BABYLON.Mesh.DOUBLESIDE},
          scene
        );
        p.parent=sg;
        p.position.set(0,0,.108);
        p.material=mat;
        p.renderingGroupId=0;
        p.isPickable=false;

        // Subtle lower accent, matching James rather than the old full-width neon strip.
        box('v17DeskGlow'+name,width*.58,.014,.016,0,-height/2-.087,.098,blueGlow,sg);
      }

      if(centerSideSign){
        // Keep the four center signs on the SHORT END FACE of the L-return.
        const endPw=Math.min(.68,RW-.18);
        const underbuildDepth=RD-.22;
        const endX=returnX;
        const endZ=returnZ+underbuildDepth/2+.028;
        buildPremiumDeskSign(endX,.39,endZ+.010,0,endPw,ph);
      }else{
        // All other desks retain their existing sign face.
        const signZ=signSide*(D/2+.052);
        const signRotY=signSide>0?Math.PI:0;
        buildPremiumDeskSign(-.16,.39,signZ,signRotY,pw,ph);
      }
      haloDeskName(name,g,exec);
      chair(name,g,-.27,D/2+.78,0);
      return g;
    }

    function premiumJamesDesk(parent){
      if(!parent) return;

      const premiumDark=pbr('v17JamesPremiumDarkM','#1a232c',.28,.34);
      const premiumMid=pbr('v17JamesPremiumMidM','#2d3944',.34,.26);
      const premiumEdge=pbr('v17JamesPremiumEdgeM','#647583',.24,.48);
      const premiumWood=pbr('v17JamesPremiumWoodM','#a88463',.38,.06);
      const premiumShelf=pbr('v17JamesPremiumShelfM','#111920',.34,.24);
      const binderWhite=pbr('v17JamesBinderWhiteM','#e8ecef',.66,.02);
      const binderGrey=pbr('v17JamesBinderGreyM','#aab4bd',.58,.04);
      const binderBlue=pbr('v17JamesBinderBlueM','#426983',.48,.08);
      const plantPot=pbr('v17JamesPlantPotM','#202a31',.36,.30);
      const plantSoil=pbr('v17JamesPlantSoilM','#2b211a',.88,.01);
      const plantLeafA=pbr('v17JamesPlantLeafAM','#2f6e4f',.70,.01);
      const plantLeafB=pbr('v17JamesPlantLeafBM','#4d8a65',.68,.01);
      const logoGlow=std('v17JamesDeskLogoGlowM','#082d37','#36dfff',1);
      const deskMat=pbr('v17JamesDeskMatM','#20272e',.76,.04);

      // Strong architectural front fascia, closer to the reference image.
      box('v17JamesPremiumFront',2.50,.64,.10,0,.34,-.575,premiumDark,parent);
      box('v17JamesPremiumFrontInset',1.26,.48,.035,.26,.36,-.635,premiumMid,parent);
      box('v17JamesPremiumFrontKick',2.42,.055,.11,0,.045,-.59,premiumShelf,parent);
      box('v17JamesPremiumFrontTopEdge',2.46,.040,.06,0,.665,-.615,premiumEdge,parent);

      // Left open storage cubbies under the worktop.
      const sx=-1.03;
      box('v17JamesShelfBack',.57,.59,.055,sx,.34,-.38,premiumShelf,parent);
      box('v17JamesShelfSideL',.045,.59,.38,sx-.285,.34,-.20,premiumDark,parent);
      box('v17JamesShelfSideR',.045,.59,.38,sx+.285,.34,-.20,premiumDark,parent);
      box('v17JamesShelfTop',.61,.045,.40,sx,.655,-.20,premiumDark,parent);
      box('v17JamesShelfMid',.57,.035,.37,sx,.365,-.20,premiumMid,parent);
      box('v17JamesShelfBottom',.57,.035,.37,sx,.075,-.20,premiumMid,parent);

      // Binder row in the upper cubby.
      const binderCols=[binderWhite,binderGrey,binderWhite,binderBlue,binderWhite];
      for(let i=0;i<5;i++){
        const bx=sx-.19+i*.095;
        box('v17JamesBinder'+i,.075,.235,.20,bx,.485,-.18,binderCols[i],parent);
        box('v17JamesBinderSpine'+i,.052,.018,.012,bx,.485,-.288,premiumEdge,parent);
      }

      // Lower storage boxes/books.
      box('v17JamesStorageBoxA',.23,.16,.24,sx-.15,.19,-.18,binderGrey,parent);
      box('v17JamesStorageBoxB',.19,.13,.24,sx+.12,.175,-.18,binderBlue,parent);

      // Premium drawer faces on the L-return pedestal.
      const rx=.93;
      [.18,.39,.60].forEach((yy,i)=>{
        box('v17JamesReturnDrawer'+i,.58,.16,.028,rx,yy,.99,premiumMid,parent);
        box('v17JamesReturnHandle'+i,.20,.018,.020,rx,yy,.972,premiumEdge,parent);
      });

      // Slim desk mat beneath keyboard/mouse.
      box('v17JamesDeskMat',1.15,.012,.42,-.02,.858,.19,deskMat,parent);

      // Monitor shelf / cable channel behind both screens.
      box('v17JamesMonitorRail',1.45,.055,.20,-.02,.875,-.24,premiumDark,parent);
      box('v17JamesMonitorRailGlow',1.30,.018,.022,-.02,.855,-.355,blueGlow,parent);

      // Cleaner premium monitor bases layered over the existing functional monitor geometry.
      [-.37,.34].forEach((mx,i)=>{
        box('v17JamesMonitorBasePremium'+i,.31,.025,.18,mx,.855,-.20,premiumEdge,parent);
        box('v17JamesMonitorNeckPremium'+i,.055,.22,.055,mx,1.00,-.20,premiumDark,parent);
      });

      // Small premium desk lamp.
      const lampBase=cyl('v17JamesLampBase',.24,.035,.94,.87,.38,premiumDark,parent);
      const lampStem=box('v17JamesLampStem',.035,.43,.035,.94,1.08,.38,premiumEdge,parent);
      lampStem.rotation.z=-.12;
      const lampHead=box('v17JamesLampHead',.30,.055,.11,.91,1.30,.38,premiumDark,parent,-.10);
      box('v17JamesLampGlow',.23,.018,.075,.90,1.275,.38,warmGlow,parent,-.10);

      // Small helper for premium desk plants.
      function deskPlant(name,x,z,scale=1){
        const g=new BABYLON.TransformNode('v17JamesDeskPlant'+name,scene);
        g.parent=parent;
        g.position.set(x,.86,z);
        cyl('v17JamesPlantPot'+name,.22*scale,.20*scale,0,.10*scale,0,plantPot,g);
        cyl('v17JamesPlantSoil'+name,.17*scale,.025*scale,0,.205*scale,0,plantSoil,g);

        for(let i=0;i<8;i++){
          const ang=i/8*Math.PI*2+.30;
          const h=(.25+(i%3)*.055)*scale;
          const stem=BABYLON.MeshBuilder.CreateCylinder(
            'v17JamesPlantStem'+name+i,
            {diameter:.018*scale,height:h,tessellation:7},
            scene
          );
          stem.parent=g;
          stem.position.set(Math.cos(ang)*.025*scale,.21*scale+h/2,Math.sin(ang)*.025*scale);
          stem.rotation.z=Math.cos(ang)*.16;
          stem.material=plantLeafA;

          const leaf=BABYLON.MeshBuilder.CreateSphere(
            'v17JamesPlantLeaf'+name+i,
            {diameter:.16*scale,segments:9},
            scene
          );
          leaf.parent=g;
          leaf.position.set(Math.cos(ang)*.10*scale,.21*scale+h,Math.sin(ang)*.10*scale);
          leaf.scaling.set(.48,1.55,.28);
          leaf.rotation.z=Math.cos(ang)*.55;
          leaf.rotation.x=Math.sin(ang)*.24;
          leaf.rotation.y=-ang;
          leaf.material=i%3===0?plantLeafB:plantLeafA;
        }
      }

      // Greenery placed around the work surface like the reference.

      // A few tactile accessories.
      box('v17JamesNotebookPremium',.30,.025,.22,.57,.877,.18,premiumWood,parent,-.08);
      box('v17JamesTabletPremium',.21,.016,.15,.83,.870,.24,black,parent,-.10);
      cyl('v17JamesCoasterPremium',.13,.012,-.73,.868,.25,premiumMid,parent);
      cyl('v17JamesCupPremium',.105,.12,-.73,.925,.25,pbr('v17JamesCupPremiumM','#dadfe3',.62,.03),parent);

      // Glowing front logo inspired by the reference image.
      // Square outline.
      box('v17JamesDeskLogoTop',.42,.025,.028,.37,.49,-.658,logoGlow,parent);
      box('v17JamesDeskLogoBottom',.42,.025,.028,.37,.22,-.658,logoGlow,parent);
      box('v17JamesDeskLogoLeft',.025,.29,.028,.16,.355,-.658,logoGlow,parent);
      box('v17JamesDeskLogoRight',.025,.29,.028,.58,.355,-.658,logoGlow,parent);

      // Checkmark / stylized NEXUS action glyph.
      const tickA=box('v17JamesDeskTickA',.20,.035,.032,.33,.37,-.676,logoGlow,parent);
      tickA.rotation.z=-.72;
      const tickB=box('v17JamesDeskTickB',.30,.035,.032,.45,.40,-.676,logoGlow,parent);
      tickB.rotation.z=.78;

      // Under-desk ambient strip adds depth without turning it into a neon prop.
      box('v17JamesPremiumUnderGlow',1.78,.018,.020,-.14,.08,-.635,blueGlow,parent);

      // --- Detail pass 2: visible furniture construction and workstation realism ---

      // Layered desktop edge, so the top reads as a manufactured furniture panel rather than one box.
      box('v17JamesTopEdgeFront',2.64,.030,.045,0,.815,-.505,premiumEdge,parent);
      box('v17JamesTopEdgeLeft',.045,.030,.98,-1.335,.815,-.01,premiumEdge,parent);
      box('v17JamesReturnEdge',.80,.030,1.12,.96,.815,.58,premiumEdge,parent);

      // Rear cable-management channel and two desk grommets.
      box('v17JamesCableTray',1.56,.075,.14,-.06,.72,-.38,premiumShelf,parent);
      [-.54,.49].forEach((gx,i)=>{
        const grom=cyl('v17JamesGrommet'+i,.095,.018,gx,.862,-.30,premiumDark,parent);
        grom.rotation.x=Math.PI/2;
      });

      // Visible PC / dock equipment in the open storage.
      box('v17JamesMiniPC',.22,.29,.25,sx+.12,.19,-.18,premiumDark,parent);
      for(let vi=0;vi<5;vi++){
        box('v17JamesMiniPCVent'+vi,.12,.012,.012,sx+.12,.12+vi*.04,-.312,premiumEdge,parent);
      }
      box('v17JamesDock',.31,.055,.11,.15,.895,-.27,premiumDark,parent);
      box('v17JamesDockGlow',.18,.012,.012,.15,.905,-.333,logoGlow,parent);

      // Monitor backs, camera bar and subtle rear ventilation.
      [-.37,.34].forEach((mx,i)=>{
        box('v17JamesMonRearShell'+i,.59,.35,.018,mx,1.22,-.228,premiumDark,parent);
        box('v17JamesMonRearVent'+i,.27,.025,.010,mx,1.12,-.239,premiumEdge,parent);
        box('v17JamesMonCam'+i,.12,.035,.022,mx,1.435,-.205,black,parent);
      });

      // Keyboard detail: individual key rows are large enough to read from the normal camera.
      const keyMat=pbr('v17JamesKeyCapM','#d9dfe4',.60,.025);
      const keyDark=pbr('v17JamesKeyCapDarkM','#7e8b94',.55,.05);
      for(let row=0;row<3;row++){
        const count=row===2?9:11;
        for(let k=0;k<count;k++){
          box(
            'v17JamesKeyCap'+row+'_'+k,
            .038,.012,.034,
            -.30+k*.058+(row===2?.055:0),
            .878,
            .135+row*.048,
            (k+row)%7===0?keyDark:keyMat,
            parent
          );
        }
      }
      box('v17JamesSpaceBar',.31,.012,.034,-.03,.878,.285,keyMat,parent);
      cyl('v17JamesMouseWheel',.022,.018,.31,.884,.145,premiumEdge,parent);

      // Paperwork stack, inbox and document separators.
      box('v17JamesInboxBase',.38,.035,.27,-.93,.885,.24,premiumDark,parent);
      box('v17JamesInboxBack',.38,.16,.030,-.93,.955,.355,premiumMid,parent);
      box('v17JamesInboxSideL',.030,.13,.26,-1.105,.945,.24,premiumMid,parent);
      box('v17JamesInboxSideR',.030,.13,.26,-.755,.945,.24,premiumMid,parent);
      const paper=pbr('v17JamesPaperM','#f0eee8',.84,.01);
      for(let p=0;p<4;p++){
        box('v17JamesPaper'+p,.31,.008,.21,-.93,.905+p*.010,.24,paper,parent,(p-1.5)*.015);
      }

      // Pen holder with visible pens/pencils.
      cyl('v17JamesPenCup',.12,.13,.72,.925,.39,premiumDark,parent);
      const pencilM=pbr('v17JamesPencilM','#c99b58',.52,.02);
      const penM=pbr('v17JamesPenDarkM','#304c63',.46,.08);
      [-.028,0,.028].forEach((px,i)=>{
        const pen=cyl('v17JamesDeskPen'+i,.014,.22,.72+px,1.035,.39,i===1?pencilM:penM,parent);
        pen.rotation.z=(i-1)*.08;
      });

      // Phone stand and a thin glowing notification line.
      box('v17JamesPhoneStand',.16,.055,.13,.88,.89,.06,premiumDark,parent,-.10);
      const phone=box('v17JamesPhoneDisplay',.13,.22,.018,.88,1.005,.04,black,parent,-.10);
      phone.rotation.x=-.38;
      box('v17JamesPhoneNotify',.055,.010,.012,.88,1.09,.025,logoGlow,parent,-.10);

      // Extra front-panel furniture seams and handles.
      [-.43,.04,.51].forEach((fx,i)=>{
        box('v17JamesFrontSeam'+i,.018,.46,.012,fx,.37,-.658,premiumShelf,parent);
      });
      box('v17JamesFrontHandleA',.18,.018,.018,-.63,.43,-.672,premiumEdge,parent);
      box('v17JamesFrontHandleB',.18,.018,.018,-.63,.29,-.672,premiumEdge,parent);

      // Executive-chair upgrade layered onto the existing James chair.
      const chairZ=1.305;
      const chairLeather=pbr('v17JamesChairLeatherM','#252c33',.46,.10);
      const chairMetal=pbr('v17JamesChairMetalM','#56616a',.26,.48);
      box('v17JamesChairHeadrest',.55,.24,.13,-.27,1.25,chairZ+.25,chairLeather,parent);
      box('v17JamesChairLumbar',.50,.18,.09,-.27,.83,chairZ+.18,premiumMid,parent);
      box('v17JamesChairArmL',.09,.07,.46,-.62,.77,chairZ-.02,chairLeather,parent);
      box('v17JamesChairArmR',.09,.07,.46,.08,.77,chairZ-.02,chairLeather,parent);
      box('v17JamesChairArmStemL',.055,.32,.055,-.62,.59,chairZ-.02,chairMetal,parent);
      box('v17JamesChairArmStemR',.055,.32,.055,.08,.59,chairZ-.02,chairMetal,parent);

      // Larger floor plant beside James for the richer office composition seen in the reference.
      const floorPlant=new BABYLON.TransformNode('v17JamesFloorPlant',scene);
      floorPlant.parent=parent;
      floorPlant.position.set(1.28,0,-.26);
      cyl('v17JamesFloorPlantPot',.42,.42,0,.21,0,plantPot,floorPlant);
      cyl('v17JamesFloorPlantSoil',.33,.035,0,.43,0,plantSoil,floorPlant);
      for(let i=0;i<12;i++){
        const ang=i/12*Math.PI*2+.17;
        const h=.66+(i%4)*.10;
        const stem=BABYLON.MeshBuilder.CreateCylinder(
          'v17JamesFloorStem'+i,
          {diameter:.025,height:h,tessellation:8},
          scene
        );
        stem.parent=floorPlant;
        stem.position.set(Math.cos(ang)*.055,.43+h/2,Math.sin(ang)*.055);
        stem.rotation.z=Math.cos(ang)*.12;
        stem.material=plantLeafA;

        for(let q=0;q<2;q++){
          const leaf=BABYLON.MeshBuilder.CreateSphere(
            'v17JamesFloorLeaf'+i+'_'+q,
            {diameter:.24,segments:10},
            scene
          );
          leaf.parent=floorPlant;
          const spread=.15+q*.08;
          leaf.position.set(Math.cos(ang)*spread,.43+h-q*.18,Math.sin(ang)*spread);
          leaf.scaling.set(.50,1.75-q*.18,.30);
          leaf.rotation.z=Math.cos(ang)*(.50+q*.10);
          leaf.rotation.x=Math.sin(ang)*.22;
          leaf.rotation.y=-ang;
          leaf.material=(i+q)%3===0?plantLeafB:plantLeafA;
        }
      }

      window.NEXUS_JAMES_PREMIUM_READY=true;
    }

    function premiumKevinDesk(parent){
      if(!parent) return;

      const kDark=pbr('v17KevinPremiumDarkM','#182129',.28,.34);
      const kMid=pbr('v17KevinPremiumMidM','#2b3741',.34,.26);
      const kEdge=pbr('v17KevinPremiumEdgeM','#687985',.24,.48);
      const kWood=pbr('v17KevinPremiumWoodM','#9f7c5e',.38,.06);
      const kShelf=pbr('v17KevinPremiumShelfM','#101820',.34,.24);
      const kPaper=pbr('v17KevinPaperM','#eceae4',.82,.01);
      const kBlue=pbr('v17KevinBlueM','#456f89',.46,.08);
      const kGrey=pbr('v17KevinGreyM','#a8b2ba',.58,.04);
      const kPlantPot=pbr('v17KevinPlantPotM','#202a31',.36,.30);
      const kSoil=pbr('v17KevinPlantSoilM','#2c221a',.88,.01);
      const kLeafA=pbr('v17KevinLeafAM','#2f6c4d',.70,.01);
      const kLeafB=pbr('v17KevinLeafBM','#4f8b66',.68,.01);
      const kGlow=std('v17KevinDeskGlowM','#082f38','#39ddf7',1);
      const kMat=pbr('v17KevinDeskMatM','#20272d',.76,.04);

      // Stronger front construction and inset fascia.
      box('v17KevinPremiumFront',2.10,.59,.095,0,.32,-.515,kDark,parent);
      box('v17KevinPremiumInset',1.02,.43,.030,.22,.34,-.575,kMid,parent);
      box('v17KevinPremiumKick',2.02,.050,.10,0,.045,-.53,kShelf,parent);
      box('v17KevinPremiumTopEdge',2.05,.035,.055,0,.625,-.555,kEdge,parent);

      // Visible open shelving on the left side.
      const sx=-.82;
      box('v17KevinShelfBack',.50,.54,.045,sx,.31,-.31,kShelf,parent);
      box('v17KevinShelfSideL',.040,.54,.34,sx-.25,.31,-.15,kDark,parent);
      box('v17KevinShelfSideR',.040,.54,.34,sx+.25,.31,-.15,kDark,parent);
      box('v17KevinShelfMid',.50,.032,.33,sx,.33,-.15,kMid,parent);
      box('v17KevinShelfBottom',.50,.032,.33,sx,.075,-.15,kMid,parent);

      // Books / binders.
      const kBinders=[kPaper,kGrey,kBlue,kPaper];
      for(let i=0;i<4;i++){
        box('v17KevinBinder'+i,.082,.21,.18,sx-.14+i*.095,.455,-.14,kBinders[i],parent);
        box('v17KevinBinderLabel'+i,.050,.018,.010,sx-.14+i*.095,.455,-.236,kEdge,parent);
      }
      box('v17KevinStorageBox',.28,.14,.22,sx,.17,-.14,kGrey,parent);

      // L-return drawer stack.
      const rx=.77;
      [.18,.39,.58].forEach((yy,i)=>{
        box('v17KevinReturnDrawer'+i,.49,.15,.025,rx,yy,.88,kMid,parent);
        box('v17KevinReturnHandle'+i,.17,.016,.018,rx,yy,.862,kEdge,parent);
      });

      // Layered desktop edge and mat.
      box('v17KevinTopEdgeFront',2.18,.028,.040,0,.815,-.445,kEdge,parent);
      box('v17KevinReturnEdge',.68,.028,1.02,.83,.815,.51,kEdge,parent);
      box('v17KevinDeskMat',1.00,.012,.36,-.02,.858,.16,kMat,parent);

      // Monitor rail, premium bases, rear shells and camera bars.
      box('v17KevinMonitorRail',1.27,.050,.18,-.02,.875,-.22,kDark,parent);
      box('v17KevinMonitorRailGlow',1.12,.016,.020,-.02,.855,-.318,kGlow,parent);
      [-.37,.34].forEach((mx,i)=>{
        box('v17KevinMonitorBase'+i,.28,.023,.16,mx,.855,-.20,kEdge,parent);
        box('v17KevinMonitorNeck'+i,.050,.21,.050,mx,1.00,-.20,kDark,parent);
        box('v17KevinMonRear'+i,.58,.34,.018,mx,1.22,-.228,kDark,parent);
        box('v17KevinMonVent'+i,.25,.022,.010,mx,1.12,-.239,kEdge,parent);
        box('v17KevinMonCam'+i,.11,.032,.022,mx,1.43,-.205,black,parent);
      });

      // Cable tray, grommets and dock.
      box('v17KevinCableTray',1.35,.07,.13,-.05,.72,-.34,kShelf,parent);
      [-.50,.46].forEach((gx,i)=>{
        const gm=cyl('v17KevinGrommet'+i,.085,.016,gx,.862,-.27,kDark,parent);
        gm.rotation.x=Math.PI/2;
      });
      box('v17KevinDock',.27,.050,.10,.16,.892,-.25,kDark,parent);
      box('v17KevinDockGlow',.16,.010,.010,.16,.900,-.307,kGlow,parent);

      // Keyboard with visible keycaps.
      const keyMat=pbr('v17KevinKeyCapM','#d9dfe4',.60,.025);
      const keyDark=pbr('v17KevinKeyCapDarkM','#7f8b94',.55,.05);
      for(let row=0;row<3;row++){
        const count=row===2?8:10;
        for(let k=0;k<count;k++){
          box(
            'v17KevinKey'+row+'_'+k,
            .038,.011,.033,
            -.28+k*.057+(row===2?.055:0),
            .878,
            .12+row*.046,
            (k+row)%6===0?keyDark:keyMat,
            parent
          );
        }
      }
      box('v17KevinSpaceBar',.28,.011,.033,-.02,.878,.258,keyMat,parent);
      cyl('v17KevinMouseWheel',.020,.016,.31,.884,.14,kEdge,parent);

      // Research / analysis props: tablet stand, paper stack, magnifier dock.
      box('v17KevinTabletStand',.22,.050,.13,.63,.89,.18,kDark,parent,-.10);
      const tab=box('v17KevinTabletScreen',.18,.24,.016,.63,1.00,.16,black,parent,-.10);
      tab.rotation.x=-.35;
      box('v17KevinTabletGlow',.09,.010,.010,.63,1.08,.145,kGlow,parent,-.10);

      box('v17KevinInbox',.34,.032,.24,-.82,.885,.20,kDark,parent);
      for(let p=0;p<4;p++){
        box('v17KevinPaper'+p,.28,.007,.19,-.82,.904+p*.010,.20,kPaper,parent,(p-1.5)*.014);
      }

      // Small plant helper.
      function kPlant(name,x,z,scale=1){
        const g=new BABYLON.TransformNode('v17KevinPlant'+name,scene);
        g.parent=parent; g.position.set(x,.86,z);
        cyl('v17KevinPlantPot'+name,.20*scale,.18*scale,0,.09*scale,0,kPlantPot,g);
        cyl('v17KevinPlantSoil'+name,.15*scale,.022*scale,0,.185*scale,0,kSoil,g);
        for(let i=0;i<7;i++){
          const ang=i/7*Math.PI*2+.24;
          const h=(.23+(i%3)*.05)*scale;
          const stem=BABYLON.MeshBuilder.CreateCylinder(
            'v17KevinStem'+name+i,
            {diameter:.016*scale,height:h,tessellation:7},scene
          );
          stem.parent=g;
          stem.position.set(Math.cos(ang)*.022*scale,.19*scale+h/2,Math.sin(ang)*.022*scale);
          stem.rotation.z=Math.cos(ang)*.15;
          stem.material=kLeafA;
          const leaf=BABYLON.MeshBuilder.CreateSphere(
            'v17KevinLeaf'+name+i,
            {diameter:.15*scale,segments:9},scene
          );
          leaf.parent=g;
          leaf.position.set(Math.cos(ang)*.09*scale,.19*scale+h,Math.sin(ang)*.09*scale);
          leaf.scaling.set(.48,1.50,.28);
          leaf.rotation.z=Math.cos(ang)*.52;
          leaf.rotation.x=Math.sin(ang)*.22;
          leaf.rotation.y=-ang;
          leaf.material=i%3===0?kLeafB:kLeafA;
        }
      }

      // More visible from the normal camera than James' rear-room placement.

      // Pen cup, notebook and cup.
      cyl('v17KevinPenCup',.11,.12,.48,.92,.34,kDark,parent);
      [-.025,0,.025].forEach((px,i)=>{
        const pen=cyl('v17KevinPen'+i,.013,.20,.48+px,1.02,.34,i===1?kWood:kBlue,parent);
        pen.rotation.z=(i-1)*.08;
      });
      box('v17KevinNotebook',.28,.023,.20,.42,.874,.18,kWood,parent,-.06);
      cyl('v17KevinCoaster',.12,.010,-.63,.868,.24,kMid,parent);
      cyl('v17KevinCup',.10,.11,-.63,.923,.24,pbr('v17KevinCupM','#dce1e5',.62,.03),parent);

      // Front glow logo / research node.
      box('v17KevinLogoTop',.36,.022,.025,.31,.46,-.598,kGlow,parent);
      box('v17KevinLogoBottom',.36,.022,.025,.31,.24,-.598,kGlow,parent);
      box('v17KevinLogoLeft',.022,.24,.025,.13,.35,-.598,kGlow,parent);
      box('v17KevinLogoRight',.022,.24,.025,.49,.35,-.598,kGlow,parent);
      const ka=box('v17KevinLogoA',.17,.030,.028,.27,.36,-.614,kGlow,parent);
      ka.rotation.z=-.72;
      const kb=box('v17KevinLogoB',.25,.030,.028,.38,.39,-.614,kGlow,parent);
      kb.rotation.z=.78;

      box('v17KevinUnderGlow',1.48,.016,.018,-.10,.08,-.575,blueGlow,parent);

      window.NEXUS_KEVIN_PREMIUM_READY=true;
    }

    const walterDesk=desk('Walter',-7.55,-3.96,-Math.PI/2,false,-1);

    // Animated server activity LEDs: subtle, asynchronous and intentionally non-uniform.
    const rackLeds=[];
    const rackLedCyan=std('v17RackLedCyanM','#071e25','#36d7ff',1);
    const rackLedGreen=std('v17RackLedGreenM','#0b2519','#51f59a',1);
    const rackLedAmber=std('v17RackLedAmberM','#2c2110','#ffc15c',1);

    for(let r=0;r<3;r++){
      const x=-9.15+r*1.02;
      box('v17RackBody'+r,.78,2.10,.72,x,1.05,-6.79,serverBody,root);
      box('v17RackFront'+r,.66,1.90,.035,x,.99,-6.40,serverFront,root);

      for(let i=0;i<9;i++){
        const y=.29+i*.18;
        box('v17RackSlot'+r+'_'+i,.52,.066,.018,x,y,-6.375,i%3===0?blueGlow:serverFront,root);

        // Two tiny activity lights per selected rack unit.
        if(i%2===0 || i===3 || i===7){
          const ledA=box(
            'v17RackLedA'+r+'_'+i,
            .042,.030,.024,
            x+.205,y,-6.350,
            ((r+i)%5===0)?rackLedGreen:rackLedCyan,
            root
          );
          const ledB=box(
            'v17RackLedB'+r+'_'+i,
            .030,.022,.024,
            x+.145,y,-6.349,
            ((r*3+i)%7===0)?rackLedAmber:rackLedGreen,
            root
          );

          ledA.isPickable=false;
          ledB.isPickable=false;

          rackLeds.push({
            mesh:ledA,
            freq:1.65+((r*11+i*7)%9)*.31,
            phase:r*1.73+i*.91,
            threshold:.08+((r+i)%4)*.12
          });
          rackLeds.push({
            mesh:ledB,
            freq:2.15+((r*7+i*13)%11)*.27,
            phase:r*2.21+i*1.37+.8,
            threshold:.18+((r+i+1)%4)*.11
          });
        }
      }
    }

    // Animate by visibility instead of changing shared materials.
    // Result: believable network/disk activity rather than synchronized flashing.
    scene.registerBeforeRender(()=>{
      if(!rackLeds.length) return;
      const t=performance.now()/1000;
      rackLeds.forEach((led,idx)=>{
        const wave=Math.sin(t*led.freq+led.phase);
        const pulse=Math.sin(t*(led.freq*.47)+led.phase*1.7);
        const on=(wave>led.threshold) || (pulse>.88 && idx%3===0);
        if(led.mesh.isEnabled()!==on) led.mesh.setEnabled(on);
      });
    });

    const jamesDesk=desk('James',jamesRoom.cx,-4.62,Math.PI,true,-1);
    premiumJamesDesk(jamesDesk);

    // Premium NEXUS wall sign behind James.
    // Built at the proven visible early scene point; isolated so it can never abort the office.
    try{
      const sign=new BABYLON.TransformNode('v17JamesNexusSign',scene);
      sign.parent=root;
      sign.position.set(jamesRoom.cx,1.96,BACK+.34);

      const backMat=pbr('v17JamesSignBackM','#07121b',.18,.44);
      const innerMat=pbr('v17JamesSignInnerM','#0b1a25',.20,.34);
      const edgeMat=std('v17JamesSignEdgeM','#062d36','#00dff4',1);
      const edgeSoft=std('v17JamesSignEdgeSoftM','#09262d','#009fb7',1);

      // Slim smoked-glass / metal plaque.
      box('v17JamesSignBack',5.25,1.48,.10,0,0,0,backMat,sign);
      box('v17JamesSignInner',5.02,1.23,.040,0,0,.068,innerMat,sign);

      // Thin premium frame with small sci-fi breaks.
      box('v17JamesSignTopL',1.78,.025,.032,-1.47,.64,.105,edgeMat,sign);
      box('v17JamesSignTopR',1.78,.025,.032,1.47,.64,.105,edgeMat,sign);
      box('v17JamesSignBottomL',1.24,.020,.028,-1.76,-.64,.105,edgeSoft,sign);
      box('v17JamesSignBottomR',1.24,.020,.028,1.76,-.64,.105,edgeSoft,sign);
      box('v17JamesSignSideL',.024,.52,.030,-2.48,.08,.105,edgeSoft,sign);
      box('v17JamesSignSideR',.024,.52,.030,2.48,.08,.105,edgeSoft,sign);

      // High-resolution wordmark texture.
      const tex=new BABYLON.DynamicTexture(
        'v17JamesNexusTex',
        {width:2048,height:640},
        scene,
        false
      );
      tex.hasAlpha=true;
      const ctx=tex.getContext();
      ctx.clearRect(0,0,2048,640);
      ctx.textAlign='center';
      ctx.textBaseline='middle';

      // Soft bloom layer.
      ctx.save();
      ctx.shadowColor='#00e6ff';
      ctx.shadowBlur=62;
      ctx.fillStyle='rgba(70,235,255,.72)';
      ctx.font='800 250px Arial';
      ctx.fillText('NEXUS',1024,300);
      ctx.restore();

      // Crisp premium face.
      const grad=ctx.createLinearGradient(0,185,0,420);
      grad.addColorStop(0,'#f6ffff');
      grad.addColorStop(.48,'#bffaff');
      grad.addColorStop(1,'#56ddec');
      ctx.fillStyle=grad;
      ctx.font='800 250px Arial';
      ctx.fillText('NEXUS',1024,300);

      // Thin cyan contour.
      ctx.strokeStyle='#00cfe6';
      ctx.lineWidth=4;
      ctx.strokeText('NEXUS',1024,300);

      // Minimal tech underline; no cluttered subtitle.
      ctx.fillStyle='#00b7cd';
      ctx.fillRect(610,500,300,4);
      ctx.fillRect(1138,500,300,4);
      ctx.fillStyle='#d9ffff';
      ctx.beginPath();
      ctx.arc(1024,502,7,0,Math.PI*2);
      ctx.fill();

      tex.update();

      const textMat=new BABYLON.StandardMaterial('v17JamesNexusTextM',scene);
      textMat.diffuseTexture=tex;
      textMat.emissiveTexture=tex;
      textMat.opacityTexture=tex;
      textMat.emissiveColor=C('#a8fbff');
      textMat.disableLighting=true;
      textMat.backFaceCulling=true;

      const plane=BABYLON.MeshBuilder.CreatePlane(
        'v17JamesNexusText',
        {width:4.65,height:1.20,sideOrientation:BABYLON.Mesh.FRONTSIDE},
        scene
      );
      plane.parent=sign;
      plane.position.set(0,.015,.135);

      // Babylon's front face points toward -Z; rotate only the wordmark toward the office (+Z).
      plane.rotation.y=Math.PI;
      plane.material=textMat;
      plane.isPickable=false;

      // Soft cyan wall wash.
      const halo=new BABYLON.PointLight(
        'v17JamesNexusHalo',
        new BABYLON.Vector3(jamesRoom.cx,2.04,BACK+.70),
        scene
      );
      halo.diffuse=C('#00d9ee');
      halo.intensity=.48;
      halo.range=4.5;

      const glowLayer=scene.getEffectLayerByName('glow');
      if(glowLayer) glowLayer.intensity=Math.max(glowLayer.intensity||0,.30);

      window.NEXUS_SIGN_READY=true;
    }catch(err){
      window.NEXUS_SIGN_READY=false;
      console.error('NEXUS sign failed safely:',err);
    }

    const aktenX=-10.09;
    for(let i=0;i<5;i++){
      const z=-2.35+i*.72;
      box('v17AktenCab'+i,.58,1.70,.66,aktenX,.85,z,cabinet,root,Math.PI/2);
      [.35,.76,1.17].forEach((y,j)=>box('v17AktenDrawer'+i+j,.50,.31,.035,aktenX+.34,y,z,cabinetDark,root,Math.PI/2));
    }
    // Exact four-desk island from the latest hand sketch.
    // Four L-desks form the four quadrants of a compact cross; planters fill both axes.
    const islandCX=-1.05;
    const islandCZ=2.15;

    // Tight spacing: desk inner edges nearly meet the planter cross.
    const islandLeftX=islandCX-1.82;
    const islandRightX=islandCX+1.82;
    const islandTopZ=islandCZ-1.42;
    const islandBottomZ=islandCZ+1.42;

    // Quadrants from the sketch:
    // top-left ┘, top-right └, bottom-left ┐, bottom-right ┌
    const giselaDesk=desk('Gisela',islandLeftX,islandTopZ,-Math.PI/2,false,-1);
    const noraDesk=desk('Nora',islandRightX,islandTopZ,Math.PI,false,-1);
    const kevinDesk=desk('Kevin',islandLeftX,islandBottomZ,0,false,-1);
    premiumKevinDesk(kevinDesk);
    const linaDesk=desk('Lina',islandRightX,islandBottomZ,Math.PI/2,false,-1);

    // Long, low planter strips instead of loose flower pots.
    function islandPlanterStrip(name,w,d,x,z){
      const g=new BABYLON.TransformNode('v17IslandPlanter'+name,scene);g.parent=root;g.position.set(x,0,z);

      const shell=pbr('v17IslandPlanterShellM'+name,'#232d35',.38,.30);
      const rim=pbr('v17IslandPlanterRimM'+name,'#3d4b55',.30,.38);
      const soil=pbr('v17IslandPlanterSoilM'+name,'#2d241d',.90,.01);
      const stemMat=pbr('v17IslandStemM'+name,'#315f48',.76,.01);
      const leafDark=pbr('v17IslandLeafDarkM'+name,'#275f47',.73,.01);
      const leafMid=pbr('v17IslandLeafMidM'+name,'#3c7f5e',.70,.01);
      const leafLight=pbr('v17IslandLeafLightM'+name,'#579a73',.68,.01);

      // Taller premium planter with a metallic rim.
      box('v17IslandPlanterShell'+name,w,.42,d,0,.21,0,shell,g);
      box('v17IslandPlanterRim'+name,w+.035,.055,d+.035,0,.435,0,rim,g);
      box('v17IslandPlanterSoil'+name,Math.max(.12,w-.10),.045,Math.max(.12,d-.10),0,.455,0,soil,g);

      const vertical=d>w;
      const length=vertical?d:w;
      const count=Math.max(3,Math.round(length/.52));

      for(let i=0;i<count;i++){
        const t=count===1?.5:i/(count-1);
        const px=vertical?((i%2?1:-1)*.035):(-w/2+.22+t*(w-.44));
        const pz=vertical?(-d/2+.22+t*(d-.44)):((i%2?1:-1)*.035);

        // One dense clump per position, with uneven heights and leaf angles.
        for(let j=0;j<5;j++){
          const a=(Math.PI*2/5)*j + i*.37;
          const stemH=.68 + ((i*3+j*2)%5)*.10;
          const radial=.035 + (j%2)*.025;

          const stem=BABYLON.MeshBuilder.CreateCylinder(
            'v17IslandStem'+name+i+'_'+j,
            {diameter:.022,height:stemH,tessellation:8},
            scene
          );
          stem.parent=g;
          stem.position.set(
            px+Math.cos(a)*radial,
            .47+stemH/2,
            pz+Math.sin(a)*radial
          );
          stem.rotation.z=Math.cos(a)*.10;
          stem.material=stemMat;

          // Two long leaves per stem at different heights for a layered, natural crown.
          for(let k=0;k<2;k++){
            const leaf=BABYLON.MeshBuilder.CreateSphere(
              'v17IslandLeaf'+name+i+'_'+j+'_'+k,
              {diameter:.18,segments:10},
              scene
            );
            leaf.parent=g;
            const leafY=.47+stemH-(k*.18);
            const spread=.12+k*.06;
            leaf.position.set(
              px+Math.cos(a)*spread,
              leafY,
              pz+Math.sin(a)*spread
            );
            leaf.scaling.set(.42,2.05-k*.28,.22);
            leaf.rotation.z=Math.cos(a)*(.52+k*.10);
            leaf.rotation.x=Math.sin(a)*.24;
            leaf.rotation.y=-a;
            leaf.material=((i+j+k)%3===0)?leafLight:(((i+j+k)%2===0)?leafMid:leafDark);
          }
        }
      }
      return g;
    }

    // Cross-shaped planter exactly between the four desks.
    islandPlanterStrip('Vertical',.34,5.35,islandCX,islandCZ);
    islandPlanterStrip('Horizontal',6.10,.34,islandCX,islandCZ);

    const sarahDesk=desk('Sarah',7.15,.10,Math.PI/2,false);
    const finnDesk=desk('Finn',7.15,3.45,Math.PI/2,false);

    addDeskProps(walterDesk,'Walter');
    addDeskProps(jamesDesk,'James');
    addDeskProps(giselaDesk,'Gisela');
    addDeskProps(noraDesk,'Nora');
    addDeskProps(kevinDesk,'Kevin');
    addDeskProps(linaDesk,'Lina');
    addDeskProps(sarahDesk,'Sarah');
    addDeskProps(finnDesk,'Finn');

    box('v17MeetingTable',4.25,.12,1.38,meeting.cx,.78,-5.18,wood,root);
    [-1.35,0,1.35].forEach((dx,i)=>{
      chair('MeetNear'+i,root,meeting.cx+dx,-4.18,0);
      chair('MeetFar'+i,root,meeting.cx+dx,-6.18,Math.PI);
    });
    chair('MeetLeft',root,meeting.cx-2.45,-5.18,-Math.PI/2);
    chair('MeetRight',root,meeting.cx+2.45,-5.18,Math.PI/2);
    const meetScreen=box('v17MeetingScreen',1.65,.92,.055,9.72,1.63,-5.20,black,root,Math.PI/2); meetScreen.material.emissiveColor=C('#173b59');

    const lounge=new BABYLON.TransformNode('v17Lounge',scene);lounge.parent=root;lounge.position.set(-6.85,0,5.25);
    box('v17LoungeRug',4.45,.030,3.20,-.05,.015,-.10,pbr('v17LoungeRugM','#00A19C',.92,.01),lounge);
    box('v17SofaSeat',2.30,.30,.86,-.62,.42,.38,fabric,lounge);
    box('v17SofaBack',2.30,.78,.15,-.62,.84,.78,fabric,lounge);
    const arm=new BABYLON.TransformNode('v17Armchair',scene);arm.parent=lounge;arm.position.set(1.18,0,-.28);arm.rotation.y=Math.PI/2;
    box('v17ArmSeat',.88,.30,.84,0,.42,0,fabric,arm);box('v17ArmBack',.88,.72,.15,0,.82,.34,fabric,arm);
    cyl('v17Coffee',.92,.08,-.62,.36,-.82,wood,lounge);cyl('v17CoffeeStem',.10,.62,-.62,.18,-.82,metal,lounge);

    james.scaling.setAll(1.55);
    james.position.set(jamesRoom.cx-.30,0,-3.78);
    james.rotation.y=Math.PI;

    // Self-contained automatic sliding doors.
    // Direct node references, no lookup, no window bridge, no dependency on app.js.
    scene.registerBeforeRender(()=>{
      if(!autoDoors.length) return;

      const now=performance.now();
      const dt=Math.max(.001,Math.min(.05,(scene.getEngine().getDeltaTime()||16)/1000));
      const pos=(typeof james.getAbsolutePosition==='function')?james.getAbsolutePosition():james.position;

      autoDoors.forEach(d=>{
        const dx=Math.abs(pos.x-d.x);
        const dz=Math.abs(pos.z-d.z);

        // Open early on both sides of the glass wall.
        const near=dx<(d.width/2+1.35) && dz<2.95;
        if(near) d.holdUntil=now+1700;

        const target=(near || now<d.holdUntil)?1:0;
        const rate=target>0?12.5:4.2;
        d.openness += (target-d.openness)*Math.min(1,dt*rate);
        if(Math.abs(target-d.openness)<.001) d.openness=target;

        const smooth=d.openness*d.openness*(3-2*d.openness);

        d.leftSlide.position.x=d.closedLeft+(d.openLeft-d.closedLeft)*smooth;
        d.rightSlide.position.x=d.closedRight+(d.openRight-d.closedRight)*smooth;

        d.leftSlide.computeWorldMatrix(true);
        d.rightSlide.computeWorldMatrix(true);
      });
    });

    // Small runtime hook for checking live door state in dev tools if needed.
    window.NEXUS_DOOR_STATE=autoDoors;

    [-7.8,-2.0,3.0,7.8].forEach((x,i)=>{const p=new BABYLON.PointLight('v17Accent'+i,new BABYLON.Vector3(x,3.05,.20),scene);p.diffuse=C('#8cc7ff');p.intensity=.30;p.range=7.5;});
    const cam=scene.activeCamera;
    if(cam && typeof cam.radius==='number'){
      cam.radius=18.5;
      cam.alpha=Math.PI*.225;
      cam.beta=.77;
      cam.target=new BABYLON.Vector3(-.05,.78,-.12);
    }
    const gl=scene.getEffectLayerByName('glow'); if(gl) gl.intensity=.24;

    // Door animation is driven by app.js in the same render loop that moves James.
    // This avoids a separate animation observer getting out of sync with pathfinding.
    function ui(){
      const t=document.getElementById('viewTitle'); if(t)t.textContent='Office 1.76';
      const m=document.querySelector('.stage-toolbar .muted'); if(m)m.textContent=' · Character-System vorbereitet · James als erster von 8 Charakteren registriert';
      const b=document.querySelector('.scene-badge'); if(b)b.innerHTML='<span class="dot live"></span>OFFICE 1.76 · CHARACTER SYSTEM 1/8';
    }
    ui(); let ticks=0; const uiTimer=setInterval(()=>{ui(); if(++ticks>24)clearInterval(uiTimer);},250);
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office 1.76 · kompletter Möbel-Neuaufbau · feste Orientierung · Glasfronten · keine Pflanzen</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++; if(boot()||tries>260)clearInterval(timer);},100);
})();