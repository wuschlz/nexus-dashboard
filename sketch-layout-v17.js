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
      const [role,icon]=roles[name]; const tex=new BABYLON.DynamicTexture('v17PanelTex'+name,{width:700,height:280},scene,false); const ctx=tex.getContext(); ctx.clearRect(0,0,700,280);
      const g=ctx.createLinearGradient(0,0,700,280);g.addColorStop(0,'#07111e');g.addColorStop(1,'#10263e');ctx.fillStyle=g;roundRect(ctx,8,8,684,264,28);ctx.fill();
      ctx.strokeStyle='#3d9fff';ctx.lineWidth=7;ctx.shadowColor='#2f9dff';ctx.shadowBlur=20;roundRect(ctx,14,14,672,252,22);ctx.stroke();
      drawIcon(ctx,icon,130,140,1.25);ctx.shadowBlur=0;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#f0f9ff';ctx.font='800 55px Arial';ctx.fillText(name.toUpperCase(),245,118);
      ctx.fillStyle='#7bc1ff';ctx.font='700 27px Arial';ctx.fillText(role.toUpperCase(),245,174);ctx.fillStyle='#6f8ca5';ctx.font='600 18px Arial';ctx.fillText('NEXUS OFFICE',245,220);tex.update(); return tex;
    }

    function chair(name,parent,x,z,rot=0){
      const g=new BABYLON.TransformNode('v17Chair'+name,scene);g.parent=parent;g.position.set(x,0,z);g.rotation.y=rot;
      cyl('v17ChairBase'+name,.50,.055,0,.32,0,black,g);cyl('v17ChairStem'+name,.055,.36,0,.54,0,metal,g);
      box('v17ChairSeat'+name,.58,.11,.58,0,.76,0,fabric,g);box('v17ChairBack'+name,.60,.78,.10,0,1.12,.29,fabric,g);
      box('v17ChairArmL'+name,.07,.18,.45,-.26,.82,.01,dark,g);box('v17ChairArmR'+name,.07,.18,.45,.26,.82,.01,dark,g);
    }
    function monitor(name,parent,x,z,yaw=0){
      const g=new BABYLON.TransformNode('v17Mon'+name,scene);g.parent=parent;g.position.set(x,0,z);g.rotation.y=yaw;
      box('v17MonFrame'+name,.65,.41,.050,0,1.22,0,black,g);box('v17MonScreen'+name,.57,.34,.014,0,1.22,.031,screen,g);
      box('v17MonStem'+name,.045,.27,.045,0,.99,0,metal,g);box('v17MonFoot'+name,.25,.025,.14,0,.84,0,metal,g);
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
      const tex=panelTex(name);const mat=new BABYLON.StandardMaterial('v17PanelM'+name,scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;mat.backFaceCulling=false;
      const pw=exec?1.18:1.04,ph=exec?.49:.43,signZ=signSide*(D/2+.025);box('v17PanelFrame'+name,pw+.10,ph+.10,.045,-.16,.39,signZ,black,g);
      const p=BABYLON.MeshBuilder.CreatePlane('v17Panel'+name,{width:pw,height:ph,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);p.parent=g;p.position.set(-.16,.39,signSide*(D/2+.052));p.rotation.y=signSide>0?Math.PI:0;p.material=mat;p.renderingGroupId=0;p.isPickable=false;
      box('v17DeskGlow'+name,W-.27,.025,.035,0,.065,signSide*(D/2+.018),blueGlow,g);
      chair(name,g,-.27,D/2+.78,0);
      return g;
    }

    const walterDesk=desk('Walter',-7.55,-3.96,-Math.PI/2,false,-1);
    for(let r=0;r<3;r++){
      const x=-9.15+r*1.02;
      box('v17RackBody'+r,.78,2.10,.72,x,1.05,-6.79,serverBody,root);
      box('v17RackFront'+r,.66,1.90,.035,x,.99,-6.40,serverFront,root);
      for(let i=0;i<9;i++) box('v17RackSlot'+r+'_'+i,.52,.066,.018,x,.29+i*.18,-6.375,i%3===0?blueGlow:serverFront,root);
    }

    const jamesDesk=desk('James',jamesRoom.cx,-4.62,Math.PI,true,-1);

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
      const t=document.getElementById('viewTitle'); if(t)t.textContent='Office 1.56';
      const m=document.querySelector('.stage-toolbar .muted'); if(m)m.textContent=' · Premium-Tageshimmel · atmosphärischer Horizont · zarte Wolken';
      const b=document.querySelector('.scene-badge'); if(b)b.innerHTML='<span class="dot live"></span>OFFICE 1.56 · PREMIUM DAYLIGHT SKY';
    }
    ui(); let ticks=0; const uiTimer=setInterval(()=>{ui(); if(++ticks>24)clearInterval(uiTimer);},250);
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office 1.56 · kompletter Möbel-Neuaufbau · feste Orientierung · Glasfronten · keine Pflanzen</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++; if(boot()||tries>260)clearInterval(timer);},100);
})();