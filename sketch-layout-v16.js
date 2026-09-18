(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene=BABYLON.EngineStore.LastCreatedScene;
    const james=scene && scene.getTransformNodeByName('JamesRoot');
    if(!scene || !james) return false;
    if(scene.getTransformNodeByName('v16SketchRoot')) return true;

    const root=new BABYLON.TransformNode('v16SketchRoot',scene);
    const C=h=>BABYLON.Color3.FromHexString(h);
    const pbr=(n,h,r=.55,m=.05)=>{const x=new BABYLON.PBRMaterial(n,scene);x.albedoColor=C(h);x.roughness=r;x.metallic=m;return x;};
    const std=(n,h,e=null,a=1)=>{const x=new BABYLON.StandardMaterial(n,scene);x.diffuseColor=C(h);x.alpha=a;if(e)x.emissiveColor=C(e);return x;};
    const box=(n,w,h,d,x,y,z,mat,parent=root,rot=0)=>{const m=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.rotation.y=rot;m.material=mat;if(parent)m.parent=parent;return m;};
    const cyl=(n,diam,h,x,y,z,mat,parent=root)=>{const m=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:diam,height:h,tessellation:28},scene);m.position.set(x,y,z);m.material=mat;if(parent)m.parent=parent;return m;};
    const sphere=(n,diam,x,y,z,mat,parent=root)=>{const m=BABYLON.MeshBuilder.CreateSphere(n,{diameter:diam,segments:14},scene);m.position.set(x,y,z);m.material=mat;if(parent)m.parent=parent;return m;};

    // STEP 1: clear the complete interior before rebuilding it.
    // Keep only the architectural shell and James. Everything else from older versions is switched off.
    const keep=new Set(['floor','backWall','leftWall','rightWall']);
    james.getChildMeshes(false).forEach(m=>keep.add(m.name));
    scene.meshes.forEach(m=>{ if(!keep.has(m.name)) m.setEnabled(false); });
    scene.transformNodes.forEach(t=>{
      if(t===james || t===root) return;
      if(t.name==='JamesRoot') return;
      if(t.name.startsWith('v16')) return;
      // Older additive scene layers are completely disabled.
      if(t.name.startsWith('v7')||t.name.startsWith('v8')||t.name.startsWith('v9')||t.name.startsWith('v10')||t.name.startsWith('v11')||t.name.startsWith('v12')||t.name.startsWith('v13')||t.name.startsWith('v14')||t.name.startsWith('v15')) t.setEnabled(false);
    });

    // Architectural base.
    scene.clearColor=new BABYLON.Color4(.55,.70,.82,1);
    scene.imageProcessingConfiguration.exposure=1.15;
    scene.imageProcessingConfiguration.contrast=1.08;
    const floor=scene.getMeshByName('floor'); if(floor) floor.material=pbr('v16Floor','#d9d3c8',.88,.02);
    const back=scene.getMeshByName('backWall'); if(back) back.material=pbr('v16Back','#222c37',.82,.04);
    const left=scene.getMeshByName('leftWall'); if(left) left.material=pbr('v16Left','#222c37',.82,.04);
    const right=scene.getMeshByName('rightWall'); if(right) right.material=pbr('v16Right','#26313d',.82,.04);

    const wall=pbr('v16Wall','#303b47',.82,.08);
    const wallAccent=pbr('v16WallAccent','#1f2934',.78,.10);
    const frame=pbr('v16Frame','#34414f',.34,.42);
    const wood=pbr('v16Wood','#9b795b',.46,.05);
    const woodExec=pbr('v16WoodExec','#775740',.42,.06);
    const trim=pbr('v16Trim','#c9aa86',.54,.03);
    const dark=pbr('v16Dark','#26303b',.36,.30);
    const dark2=pbr('v16Dark2','#343f4c',.46,.22);
    const black=pbr('v16Black','#111821',.26,.44);
    const metal=pbr('v16Metal','#4b5967',.32,.48);
    const screen=pbr('v16Screen','#173f61',.22,.08); screen.emissiveColor=C('#2d86c6');
    const fabric=pbr('v16Fabric','#667482',.90,.01);
    const rug=pbr('v16Rug','#b5aea5',.97,0);
    const cabinet=pbr('v16Cab','#c4cbd0',.62,.04);
    const cabinetDark=pbr('v16CabDark','#66737f',.50,.16);
    const serverBody=pbr('v16ServerBody','#151d26',.30,.55);
    const serverFront=pbr('v16ServerFront','#0b1219',.24,.42);
    const blueGlow=std('v16BlueGlow','#173552','#4ca9ff',1);
    const warmGlow=std('v16WarmGlow','#5b3a20','#ffbd76',1);

    // Floor tile detail.
    for(let x=-9.6;x<=9.6;x+=1.6) box('v16TileX'+x,.018,.012,13.7,x,.006,0,pbr('v16TileMX'+x,'#a9a39a',.96,0),root);
    for(let z=-6.4;z<=6.4;z+=1.6) box('v16TileZ'+z,19.3,.012,.018,0,.006,z,pbr('v16TileMZ'+z,'#a9a39a',.96,0),root);

    // Window wall across the back, retained from the reference vibe.
    const winMat=std('v16Win','#94c8e8',null,.32);
    for(let i=0;i<6;i++){
      const x=-8.8+i*3.15;
      const p=BABYLON.MeshBuilder.CreatePlane('v16Window'+i,{width:2.95,height:3.15,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
      p.parent=root;p.position.set(x,2.0,-7.12);p.material=winMat;
      box('v16WinPost'+i,.07,3.35,.08,x-1.51,2,-7.09,frame,root);
    }
    box('v16WinTop',18.8,.07,.08,-.1,3.66,-7.09,frame,root);
    box('v16WinBottom',18.8,.07,.08,-.1,.34,-7.09,frame,root);

    // Tiny skyline silhouettes outside.
    for(let i=0;i<25;i++){const h=.5+(i%6)*.22;box('v16City'+i,.34,h,.13,-9.2+i*.75,.25+h/2,-7.34,pbr('v16CityM'+i,i%3?'#789ab6':'#90aec6',.44,.02),root);}

    // ----- TOP ZONE FROM THE PAPER SKETCH -----
    // Server room: top-left.
    const server={x:-7.35,z:-4.55,w:5.55,d:4.25};
    // James room: top-middle.
    const jamesRoom={x:-1.45,z:-4.55,w:4.45,d:4.25};
    // Meeting room: top-right.
    const meeting={x:5.55,z:-4.55,w:8.15,d:4.25};

    function roomShell(prefix,cfg,title){
      const h=2.8, front=cfg.z+cfg.d/2, backZ=cfg.z-cfg.d/2, leftX=cfg.x-cfg.w/2, rightX=cfg.x+cfg.w/2;
      box(prefix+'Back',cfg.w,h,.12,cfg.x,h/2,backZ,wall,root);
      box(prefix+'Left',.12,h,cfg.d,leftX,h/2,cfg.z,wall,root);
      box(prefix+'Right',.12,h,cfg.d,rightX,h/2,cfg.z,wall,root);
      // front wall with centered doorway
      const door=1.10, seg=(cfg.w-door)/2;
      box(prefix+'FrontL',seg,h,.12,cfg.x-(door/2+seg/2),h/2,front,wall,root);
      box(prefix+'FrontR',seg,h,.12,cfg.x+(door/2+seg/2),h/2,front,wall,root);
      box(prefix+'WarmLine',cfg.w-.25,.025,.035,cfg.x,.07,front+.07,warmGlow,root);
      zoneSign(prefix+'Sign',title,cfg.x,2.48,front+.09);
    }

    function zoneSign(name,text,x,y,z){
      const tex=new BABYLON.DynamicTexture(name+'Tex',{width:900,height:190},scene,false);
      const ctx=tex.getContext();ctx.clearRect(0,0,900,190);ctx.fillStyle='#07111f';ctx.fillRect(0,0,900,190);
      ctx.strokeStyle='#3c9fff';ctx.lineWidth=7;ctx.strokeRect(9,9,882,172);ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='#eef9ff';ctx.font='800 60px Arial';ctx.fillText(text,450,95);tex.update();
      const mat=new BABYLON.StandardMaterial(name+'Mat',scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;mat.backFaceCulling=false;
      const p=BABYLON.MeshBuilder.CreatePlane(name,{width:3.25,height:.62,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);p.parent=root;p.position.set(x,y,z);p.rotation.y=Math.PI;p.material=mat;
    }
    roomShell('v16ServerRoom',server,'SERVER-RAUM');
    roomShell('v16JamesRoom',jamesRoom,'JAMES');
    roomShell('v16MeetingRoom',meeting,'MEETING-RAUM');

    // ----- DESK SYSTEM -----
    const roles={
      James:['Leitung','crown'], Walter:['Technik','wrench'], Gisela:['Wissen & Archiv','database'],
      Nora:['Mail','mail'], Kevin:['Recherche','search'], Lina:['Kalender','calendar'], Sarah:['Kontakte','people'], Finn:['Follow-up','check']
    };
    function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
    function drawIcon(ctx,type,cx,cy,s){
      ctx.strokeStyle='#dff6ff';ctx.fillStyle='#dff6ff';ctx.lineWidth=10*s;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#37a3ff';ctx.shadowBlur=18*s;
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
      const [role,icon]=roles[name];const tex=new BABYLON.DynamicTexture('v16PanelTex'+name,{width:700,height:280},scene,false);const ctx=tex.getContext();ctx.clearRect(0,0,700,280);
      const g=ctx.createLinearGradient(0,0,700,280);g.addColorStop(0,'#07111e');g.addColorStop(1,'#10263e');ctx.fillStyle=g;roundRect(ctx,8,8,684,264,28);ctx.fill();
      ctx.strokeStyle='#3d9fff';ctx.lineWidth=7;ctx.shadowColor='#2f9dff';ctx.shadowBlur=20;roundRect(ctx,14,14,672,252,22);ctx.stroke();
      drawIcon(ctx,icon,130,140,1.25);ctx.shadowBlur=0;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#f0f9ff';ctx.font='800 55px Arial';ctx.fillText(name.toUpperCase(),245,118);
      ctx.fillStyle='#7bc1ff';ctx.font='700 27px Arial';ctx.fillText(role.toUpperCase(),245,174);ctx.fillStyle='#6f8ca5';ctx.font='600 18px Arial';ctx.fillText('NEXUS OFFICE',245,220);tex.update();return tex;
    }
    function chair(name,parent,z){
      const g=new BABYLON.TransformNode('v16Chair'+name,scene);g.parent=parent;g.position.set(0,0,z);
      cyl('v16ChairBase'+name,.50,.055,0,.32,0,black,g);cyl('v16ChairStem'+name,.055,.36,0,.54,0,metal,g);
      box('v16ChairSeat'+name,.58,.11,.58,0,.76,0,fabric,g);
      box('v16ChairBack'+name,.60,.78,.10,0,1.12,-.28,fabric,g);
      box('v16ChairArmL'+name,.07,.18,.45,-.26,.82,.01,dark,g);box('v16ChairArmR'+name,.07,.18,.45,.26,.82,.01,dark,g);
    }
    function monitor(name,parent,x,z,yaw){
      const g=new BABYLON.TransformNode('v16Mon'+name,scene);g.parent=parent;g.position.set(x,0,z);g.rotation.y=yaw;
      box('v16MonFrame'+name,.62,.40,.045,0,1.22,0,black,g);box('v16MonScreen'+name,.55,.33,.012,0,1.22,.03,screen,g);
      box('v16MonStem'+name,.045,.27,.045,0,.99,0,metal,g);box('v16MonFoot'+name,.25,.025,.14,0,.84,0,metal,g);
    }
    function desk(name,x,z,rot=0,exec=false){
      const g=new BABYLON.TransformNode('v16Desk'+name,scene);g.parent=root;g.position.set(x,0,z);g.rotation.y=rot;
      const W=exec?2.65:2.25,D=exec?1.08:.96,RW=exec?.86:.76,RD=exec?1.28:1.10,top=exec?woodExec:wood;
      box('v16DeskRug'+name,W+1.05,.024,2.35,0,.016,-.18,rug,g);
      box('v16DeskBase'+name,W-.08,.64,.40,0,.34,D/2-.19,dark2,g);
      box('v16DeskTop'+name,W,.10,D,0,.78,0,top,g);box('v16DeskTrim'+name,W,.022,D,0,.842,0,trim,g);
      // L-return exactly like the sketch, on the right.
      box('v16DeskReturn'+name,RW,.10,RD,W/2-RW/2,.78,-D/2-RD/2+.08,top,g);box('v16DeskReturnTrim'+name,RW,.022,RD,W/2-RW/2,.842,-D/2-RD/2+.08,trim,g);
      box('v16DeskCab'+name,.45,.62,.70,-W/2+.25,.35,-.08,dark2,g);
      monitor(name+'A',g,-.34,-.14,.10);monitor(name+'B',g,.34,-.14,-.10);
      box('v16Key'+name,.48,.025,.15,-.04,.86,.20,pbr('v16KeyM'+name,'#e1e7eb',.82,.02),g);
      box('v16Mouse'+name,.08,.022,.12,.34,.862,.20,pbr('v16MouseM'+name,'#e1e7eb',.82,.02),g);
      cyl('v16Mug'+name,.11,.11,W*.36,.90,.18,pbr('v16MugM'+name,'#eef2f5',.82,.02),g);
      // single front-facing name plate only.
      const tex=panelTex(name);const mat=new BABYLON.StandardMaterial('v16PanelM'+name,scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;mat.backFaceCulling=false;
      const pw=exec?1.16:1.04,ph=exec?.49:.43;box('v16PanelFrame'+name,pw+.10,ph+.10,.045,0,.38,D/2+.024,black,g);
      const p=BABYLON.MeshBuilder.CreatePlane('v16Panel'+name,{width:pw,height:ph,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);p.parent=g;p.position.set(0,.38,D/2+.052);p.rotation.y=Math.PI;p.material=mat;p.renderingGroupId=2;
      box('v16DeskGlow'+name,W-.25,.025,.035,0,.065,D/2+.015,warmGlow,g);
      chair(name,g,-D/2-.76);
      return g;
    }

    // Fixed desk positions from the sketch.
    // Walter in server room, James in his own room.
    desk('Walter',server.x-.20,server.z+.20,0,false);
    desk('James',jamesRoom.x,jamesRoom.z+.25,0,true);

    // Gisela dedicated to Akten wall (third fixed person), plus five open workstations.
    desk('Gisela',-8.15,1.70,-Math.PI/2,false);
    desk('Nora',-5.55,.35,0,false);
    desk('Kevin',-1.65,.55,0,false);
    desk('Lina',2.45,.80,0,false);
    desk('Sarah',7.55,.35,-Math.PI/2,false);
    desk('Finn',7.55,3.40,-Math.PI/2,false);

    // Server racks behind Walter.
    for(let r=0;r<3;r++){
      const g=new BABYLON.TransformNode('v16Rack'+r,scene);g.parent=root;g.position.set(server.x-1.35+r*1.05,0,server.z-1.35);
      box('v16RackBody'+r,.80,1.95,.74,0,.975,0,serverBody,g);box('v16RackFront'+r,.66,1.76,.035,0,.98,.39,serverFront,g);
      for(let i=0;i<9;i++) box('v16RackSlot'+r+'_'+i,.52,.064,.018,0,.28+i*.17,.415,i%3===0?blueGlow:serverFront,g);
    }

    // Meeting table + 8 chairs.
    box('v16MeetingRug',meeting.w-.60,.024,meeting.d-.50,meeting.x,.016,meeting.z,rug,root);
    box('v16MeetingTable',3.45,.12,1.35,meeting.x,.78,meeting.z,wood,root);
    const chairs=[
      [-1.8,0,Math.PI/2],[1.8,0,-Math.PI/2],
      [-1.05,-1.10,0],[-.35,-1.10,0],[.35,-1.10,0],[1.05,-1.10,0],
      [-1.05,1.10,Math.PI],[-.35,1.10,Math.PI],[.35,1.10,Math.PI],[1.05,1.10,Math.PI]
    ];
    chairs.forEach((p,i)=>{const g=new BABYLON.TransformNode('v16MeetChair'+i,scene);g.parent=root;g.position.set(meeting.x+p[0],0,meeting.z+p[1]);g.rotation.y=p[2];
      cyl('v16MeetBase'+i,.44,.055,0,.32,0,black,g);box('v16MeetSeat'+i,.52,.10,.52,0,.72,0,fabric,g);box('v16MeetBack'+i,.54,.66,.085,0,1.03,-.23,fabric,g);});

    // Akten wall along left side, exactly like the sketch.
    const aktenX=-9.45;
    for(let i=0;i<5;i++){
      const z=-.25+i*.73;
      box('v16AktenCab'+i,.58,1.62,.66,aktenX,.81,z,cabinet,root,Math.PI/2);
      [.34,.73,1.12].forEach((y,j)=>{box('v16AktenDrawer'+i+j,.50,.30,.035,aktenX+.34,y,z,cabinetDark,root,Math.PI/2);});
    }
    zoneSign('v16AktenLabel','AKTEN',-9.13,2.30,1.15);

    // Sitzecke bottom-left.
    const lounge=new BABYLON.TransformNode('v16Lounge',scene);lounge.parent=root;lounge.position.set(-6.40,0,5.30);
    box('v16LoungeRug',4.2,.024,2.7,0,.014,0,pbr('v16LoungeRugM','#8f8982',.97,0),lounge);
    box('v16SofaSeat',2.15,.30,.84,-.60,.42,.30,fabric,lounge);box('v16SofaBack',2.15,.76,.15,-.60,.84,.66,fabric,lounge);
    const arm=new BABYLON.TransformNode('v16Armchair',scene);arm.parent=lounge;arm.position.set(1.20,0,.30);arm.rotation.y=-.35;
    box('v16ArmSeat',.86,.30,.84,0,.42,0,fabric,arm);box('v16ArmBack',.86,.72,.15,0,.82,-.34,fabric,arm);
    cyl('v16Coffee',.88,.08,.22,.36,-.55,wood,lounge);cyl('v16CoffeeStem',.10,.62,.22,.18,-.55,metal,lounge);

    // Plants and decor — much less random, placed at room edges.
    function plant(name,x,z,s=1){
      const g=new BABYLON.TransformNode('v16Plant'+name,scene);g.parent=root;g.position.set(x,0,z);
      const pot=pbr('v16PotM'+name,'#8f7662',.76,.03),stem=pbr('v16StemM'+name,'#496f50',.82,0),leaf=pbr('v16LeafM'+name,'#4f9368',.80,0);
      cyl('v16Pot'+name,.46*s,.42*s,0,.21*s,0,pot,g);
      for(let j=0;j<4;j++){const a=j*Math.PI/2,rx=Math.cos(a)*.07*s,rz=Math.sin(a)*.07*s;const st=cyl('v16Stem'+name+j,.032*s,.62*s,rx,.57*s,rz,stem,g);st.rotation.z=(j-1.5)*.10;
        for(let k=0;k<4;k++){const l=sphere('v16Leaf'+name+j+'_'+k,.23*s,rx+(k%2?1:-1)*(.09+k*.018)*s,(.68+k*.12)*s,rz+(k-1.5)*.03*s,leaf,g);l.scaling.set(.70,1.72,.22);l.rotation.z=(k%2?1:-1)*(1.0+k*.1);l.rotation.y=j*.8+k*.4;}}
    }
    [
      ['A',-9.35,-5.95,1.00],['B',-4.55,-5.85,.90],['C',.70,-5.85,.92],['D',9.20,-5.65,1.05],
      ['E',-9.20,5.80,1.05],['F',-3.60,5.95,.92],['G',4.70,5.85,.98],['H',9.20,5.50,1.08]
    ].forEach(p=>plant(...p));

    // James for now just stands near his room; other figures come after the room/furniture layout is approved.
    james.scaling.setAll(1.55);james.position.set(jamesRoom.x-.10,0,jamesRoom.z+1.25);james.rotation.y=0;

    // Camera: broad top-down-ish isometric view matching the hand sketch.
    const cam=scene.activeCamera;
    if(cam && typeof cam.radius==='number'){cam.radius=18.0;cam.alpha=Math.PI*.225;cam.beta=.78;cam.target=new BABYLON.Vector3(-.15,.80,.15);}
    const gl=scene.getEffectLayerByName('glow');if(gl)gl.intensity=.24;

    function ui(){
      const t=document.getElementById('viewTitle');if(t)t.textContent='Office v16';
      const m=document.querySelector('.stage-toolbar .muted');if(m)m.textContent=' · Komplett neu nach Handskizze · Server · James · Meeting · Akten · Sitzecke';
      const b=document.querySelector('.scene-badge');if(b)b.innerHTML='<span class="dot live"></span>OFFICE V16 · PAPER SKETCH REBUILD';
    }
    ui();let ticks=0;const uiTimer=setInterval(()=>{ui();if(++ticks>24)clearInterval(uiTimer);},250);
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v16 · alte Einrichtung gelöscht und komplett nach Handskizze neu gesetzt</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>260)clearInterval(timer);},100);
})();