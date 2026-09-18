(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('JamesRoot')) return false;
    if(scene.getTransformNodeByName('v13PremiumRoot')) return true;

    const root = new BABYLON.TransformNode('v13PremiumRoot', scene);
    const C = h => BABYLON.Color3.FromHexString(h);
    const pbr = (n,h,r=.55,m=.05) => { const x=new BABYLON.PBRMaterial(n,scene); x.albedoColor=C(h); x.roughness=r; x.metallic=m; return x; };
    const std = (n,h,e=null,a=1) => { const x=new BABYLON.StandardMaterial(n,scene); x.diffuseColor=C(h); x.alpha=a; if(e) x.emissiveColor=C(e); return x; };
    const box = (n,w,h,d,x,y,z,mat,parent=root,rot=0) => { const m=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene); m.position.set(x,y,z); m.rotation.y=rot; m.material=mat; if(parent) m.parent=parent; return m; };
    const cyl = (n,diam,h,x,y,z,mat,parent=root) => { const m=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:diam,height:h,tessellation:28},scene); m.position.set(x,y,z); m.material=mat; if(parent) m.parent=parent; return m; };
    const sphere = (n,diam,x,y,z,mat,parent=root) => { const m=BABYLON.MeshBuilder.CreateSphere(n,{diameter:diam,segments:14},scene); m.position.set(x,y,z); m.material=mat; if(parent) m.parent=parent; return m; };

    // Remove earlier additive furniture/decor layers and the original workstation geometry.
    ['v8DetailsRoot','v9DeskIconsRoot','v10VisibilityRoot','v11ReadabilityRoot','v12LayoutRoot'].forEach(n=>{const t=scene.getTransformNodeByName(n); if(t) t.setEnabled(false);});
    scene.meshes.forEach(m=>{
      const n=m.name;
      if(n.startsWith('v7') || n.startsWith('v8') || n.startsWith('v9') || n.startsWith('v10') || n.startsWith('v11') || n.startsWith('v12')) m.setEnabled(false);
    });
    ['centralPlatform','leadPlatform','loungePlatform','meetingPlatform','receptionGlass','receptionLed',
     'meetGlassLTop','meetGlassLBottom','meetGlassBack','meetGlassFront','meetTableTop','meetTableBeam',
     'meetTableLeg0','meetTableLeg1','meetTableLed','meetingScreen','brandPanel','wallBlue','wallBlue2','wallBlue3'].forEach(n=>{const m=scene.getMeshByName(n); if(m) m.setEnabled(false);});
    const staff=['James','Nora','Kevin','Gisela','Lina','Walter','Sarah','Finn'];
    scene.meshes.forEach(m=>{
      if(staff.some(s=>m.name.startsWith(s+'Desk')||m.name.startsWith(s+'Mon')||m.name.startsWith(s+'Chair')||m.name.startsWith(s+'Label'))) m.setEnabled(false);
    });

    // Premium architectural palette.
    scene.clearColor = new BABYLON.Color4(.56,.70,.82,1);
    scene.imageProcessingConfiguration.exposure=1.16;
    scene.imageProcessingConfiguration.contrast=1.08;
    const floor=scene.getMeshByName('floor'); if(floor) floor.material=pbr('v13Floor','#d9d3c8',.86,.02);
    const back=scene.getMeshByName('backWall'); if(back) back.material=pbr('v13Back','#1f2935',.82,.04);
    const left=scene.getMeshByName('leftWall'); if(left) left.material=pbr('v13Left','#202936',.84,.04);
    const right=scene.getMeshByName('rightWall'); if(right) right.material=pbr('v13Right','#26313d',.84,.04);

    const stone=pbr('v13Stone','#ddd7cc',.88,.02);
    const dark=pbr('v13Dark','#242d38',.38,.34);
    const dark2=pbr('v13Dark2','#303a47',.48,.26);
    const wood=pbr('v13Wood','#9b7a5a',.46,.05);
    const woodDark=pbr('v13WoodDark','#76573f',.42,.06);
    const trim=pbr('v13Trim','#c9aa86',.54,.03);
    const metal=pbr('v13Metal','#4b5867',.32,.48);
    const screen=pbr('v13Screen','#173d5e',.22,.08); screen.emissiveColor=C('#2e86c5');
    const fabric=pbr('v13Fabric','#657383',.90,.01);
    const black=pbr('v13Black','#111821',.28,.44);
    const glass=new BABYLON.PBRMaterial('v13Glass',scene); glass.albedoColor=C('#b8dff2'); glass.alpha=.20; glass.roughness=.05; glass.metallic=.03;
    const glow=std('v13Glow','#13314e','#4ba7ff',1);
    const warmGlow=std('v13WarmGlow','#53351f','#ffb86b',1);

    // Stone tile grid for more material detail.
    for(let x=-9.6;x<=9.6;x+=1.6) box('v13TileX'+x,.018,.012,13.7,x,.006,0,pbr('v13TileLineX'+x,'#aaa49a',.94,0),root);
    for(let z=-6.4;z<=6.4;z+=1.6) box('v13TileZ'+z,19.3,.012,.018,0,.006,z,pbr('v13TileLineZ'+z,'#aaa49a',.94,0),root);

    // City windows + skyline.
    const windowFrame=pbr('v13WindowFrame','#2f3b48',.34,.42);
    const sky=std('v13Sky','#8fc3e9',null,.36);
    for(let i=0;i<5;i++){
      const x=-8.8+i*3.2;
      const pane=BABYLON.MeshBuilder.CreatePlane('v13Window'+i,{width:3.0,height:3.2,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
      pane.parent=root; pane.position.set(x,2.0,-7.13); pane.material=sky;
      box('v13WindowPost'+i,.07,3.4,.08,x-1.53,2,-7.10,windowFrame,root);
    }
    box('v13WindowTop',16.0,.07,.08,-2.4,3.67,-7.10,windowFrame,root);
    box('v13WindowBottom',16.0,.07,.08,-2.4,.34,-7.10,windowFrame,root);
    for(let i=0;i<24;i++){
      const h=.5+(i%7)*.18, x=-9.3+i*.72;
      box('v13City'+i,.35,h,.14,x,.25+h/2,-7.34,pbr('v13CityMat'+i,i%3===0?'#8daec7':'#7598b4',.42,.02),root);
    }

    // Dark NEXUS feature wall with warm base lighting.
    box('v13FeatureWall',4.7,3.2,.20,-8.05,2.0,-5.9,pbr('v13FeatureWallMat','#18212c',.74,.08),root);
    box('v13FeatureGlow',4.5,.035,.10,-8.05,.42,-5.76,warmGlow,root);
    function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
    const signTex=new BABYLON.DynamicTexture('v13SignTex',{width:1024,height:420},scene,false);
    const sctx=signTex.getContext(); sctx.clearRect(0,0,1024,420); sctx.textAlign='center'; sctx.textBaseline='middle'; sctx.shadowColor='#6bc1ff'; sctx.shadowBlur=34; sctx.fillStyle='#f2fbff'; sctx.font='700 120px Arial'; sctx.fillText('NEXUS',512,170); sctx.shadowBlur=0; sctx.fillStyle='#c6dff1'; sctx.font='500 60px Arial'; sctx.fillText('Office',512,275); signTex.update();
    const signMat=new BABYLON.StandardMaterial('v13SignMat',scene); signMat.diffuseTexture=signTex; signMat.emissiveTexture=signTex; signMat.emissiveColor=C('#ffffff'); signMat.disableLighting=true; signMat.backFaceCulling=false;
    const sign=BABYLON.MeshBuilder.CreatePlane('v13NexusSign',{width:3.4,height:1.4,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene); sign.parent=root; sign.position.set(-8.04,2.45,-5.76); sign.rotation.y=Math.PI/2; sign.material=signMat;

    // Floor edge lighting.
    box('v13EdgeGlowA',19.4,.03,.04,0,.05,6.55,warmGlow,root);
    box('v13EdgeGlowB',.04,.03,13.2,-9.85,.05,0,warmGlow,root);

    const roles={
      James:['Leitung','crown'],Nora:['Mail','mail'],Kevin:['Recherche','search'],Gisela:['Wissen & Gedächtnis','database'],
      Lina:['Kalender & Erinnerungen','calendar'],Walter:['Technischer Support','wrench'],Sarah:['Identität & Kontakte','people'],Finn:['Nachverfolgung','check']
    };

    function drawIcon(ctx,type,cx,cy,s){
      ctx.strokeStyle='#dff6ff'; ctx.fillStyle='#dff6ff'; ctx.lineWidth=10*s; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowColor='#37a3ff'; ctx.shadowBlur=18*s;
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
    function iconTexture(name,role,icon){
      const tex=new BABYLON.DynamicTexture('v13IconTex'+name,{width:700,height:280},scene,false); const ctx=tex.getContext(); ctx.clearRect(0,0,700,280);
      const g=ctx.createLinearGradient(0,0,700,280);g.addColorStop(0,'#07111e');g.addColorStop(1,'#10263e');ctx.fillStyle=g;roundRect(ctx,8,8,684,264,28);ctx.fill();
      ctx.strokeStyle='#3d9fff';ctx.lineWidth=7;ctx.shadowColor='#2f9dff';ctx.shadowBlur=20;roundRect(ctx,14,14,672,252,22);ctx.stroke();
      drawIcon(ctx,icon,130,140,1.25);ctx.shadowBlur=0;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#f0f9ff';ctx.font='800 55px Arial';ctx.fillText(name.toUpperCase(),245,118);ctx.fillStyle='#7bc1ff';ctx.font='700 27px Arial';ctx.fillText(role.toUpperCase(),245,174);ctx.fillStyle='#6f8ca5';ctx.font='600 18px Arial';ctx.fillText('NEXUS OFFICE',245,220);tex.update();return tex;
    }

    function highChair(name,parent,x,z){
      const g=new BABYLON.TransformNode('v13Chair'+name,scene);g.parent=parent;g.position.set(x,0,z);
      cyl('v13ChairBase'+name,.52,.055,0,.32,0,black,g);cyl('v13ChairStem'+name,.055,.36,0,.54,0,metal,g);
      box('v13ChairSeat'+name,.58,.11,.58,0,.76,0,fabric,g);
      box('v13ChairBack'+name,.60,.78,.10,0,1.12,-.28,fabric,g);
      box('v13ArmL'+name,.07,.18,.45,-.26,.82,.01,dark,g);box('v13ArmR'+name,.07,.18,.45,.26,.82,.01,dark,g);
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;box('v13Caster'+name+i,.035,.035,.24,Math.sin(a)*.16,.30,Math.cos(a)*.16,black,g,a);}
    }
    function monitor(name,parent,x,z,yaw){
      const g=new BABYLON.TransformNode('v13Monitor'+name,scene);g.parent=parent;g.position.set(x,0,z);g.rotation.y=yaw;
      box('v13MonFrame'+name,.62,.40,.045,0,1.22,0,black,g);box('v13MonScreen'+name,.55,.33,.012,0,1.22,.03,screen,g);
      box('v13MonStem'+name,.045,.27,.045,0,.99,0,metal,g);box('v13MonFoot'+name,.25,.025,.14,0,.84,0,metal,g);
    }
    function deskPlant(name,parent,x,z){
      const pot=pbr('v13DeskPot'+name,'#9c7d65',.78,.02),leaf=pbr('v13DeskLeaf'+name,'#5a9870',.82,0);
      cyl('v13DeskPotM'+name,.13,.11,x,.88,z,pot,parent);const l=sphere('v13DeskLeafM'+name,.17,x,.99,z,leaf,parent);l.scaling.set(.65,1.45,.42);
    }
    function addBooks(parent,prefix,x,z,count=5){
      for(let i=0;i<count;i++){const colors=['#7d5b48','#64758a','#9a8058','#536a5b','#795d72'];box(prefix+i,.08+.02*(i%2),.30+.04*(i%3),.18,x+i*.11,.42,z,pbr(prefix+'Mat'+i,colors[i%colors.length],.76,0),parent);}
    }
    function premiumDesk(name,x,z,rot=0,exec=false){
      const g=new BABYLON.TransformNode('v13Desk_'+name,scene);g.parent=root;g.position.set(x,0,z);g.rotation.y=rot;
      const W=exec?2.85:2.35,D=exec?1.15:1.02,RW=exec?.82:.72,RD=exec?1.20:1.02,top=exec?woodDark:wood;
      // solid front cabinet base for the reference-image look
      box('v13Base'+name,W-.08,.64,.42,0,.34,D/2-.20,dark2,g);
      box('v13Top'+name,W,.10,D,0,.78,0,top,g);box('v13TopTrim'+name,W,.022,D,0,.842,0,trim,g);
      // L return only on one side, leaving a clear seat pocket
      box('v13Return'+name,RW,.10,RD,W/2-RW/2,.78,-D/2-RD/2+.08,top,g);box('v13ReturnTrim'+name,RW,.022,RD,W/2-RW/2,.842,-D/2-RD/2+.08,trim,g);
      // side shelving
      box('v13SideCab'+name,.45,.62,.72,-W/2+.25,.35,-.08,dark2,g);
      addBooks(g,'v13Book'+name,-W/2+.09,.28,4);
      // LED underglow
      box('v13UnderGlow'+name,W-.25,.025,.035,0,.065,D/2+.015,warmGlow,g);
      // dual monitors
      monitor(name+'A',g,-.34,-.14,.10);monitor(name+'B',g,.34,-.14,-.10);
      box('v13Keyboard'+name,.48,.025,.15,-.04,.86,.20,pbr('v13KeyMat'+name,'#dfe6eb',.82,.02),g);
      box('v13Mouse'+name,.08,.022,.12,.34,.862,.20,pbr('v13MouseMat'+name,'#dfe6eb',.82,.02),g);
      box('v13Notebook'+name,.26,.03,.18,-W*.35,.858,.20,pbr('v13NotebookMat'+name,'#5d7690',.72,.02),g,-.06);
      cyl('v13Mug'+name,.11,.11,W*.36,.90,.18,pbr('v13MugMat'+name,'#eef2f5',.82,.02),g);
      deskPlant(name,g,W*.30,.18);
      // lamp
      cyl('v13LampStem'+name,.035,.55,-W*.37,1.08,-.22,metal,g);box('v13LampHead'+name,.30,.07,.18,-W*.37,1.35,-.16,black,g,-.18);
      // front icon panel ONLY; no panel on chair side
      const [role,icon]=roles[name];const tex=iconTexture(name,role,icon);const mat=new BABYLON.StandardMaterial('v13PanelMat'+name,scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;mat.backFaceCulling=true;
      const pw=exec?1.15:1.02,ph=exec?.48:.42;box('v13PanelFrame'+name,pw+.10,ph+.10,.045,0,.38,D/2+.024,black,g);
      const p=BABYLON.MeshBuilder.CreatePlane('v13Panel'+name,{width:pw,height:ph,sideOrientation:BABYLON.Mesh.FRONTSIDE},scene);p.parent=g;p.position.set(0,.38,D/2+.052);p.rotation.y=Math.PI;p.material=mat;p.renderingGroupId=2;
      // chair clearly behind the desk, offset away from return wing
      highChair(name,g,-.28,-D/2-.75);
      // rug
      box('v13Rug'+name,W+1.05,.024,2.35,-.05,.016,-.18,pbr('v13RugMat'+name,exec?'#aaa49c':'#bcb7ae',.97,0),g);
      return g;
    }

    function plant(name,x,z,s=1,type=0){
      const g=new BABYLON.TransformNode('v13Plant'+name,scene);g.parent=root;g.position.set(x,0,z);
      const pot=pbr('v13PotMat'+name,type%2?'#3e4348':'#9a8068',.72,.04),stem=pbr('v13StemMat'+name,'#496f4f',.82,0),leaf=pbr('v13LeafMat'+name,type%2?'#568a62':'#4f9369',.80,0);
      cyl('v13Pot'+name,.50*s,.46*s,0,.23*s,0,pot,g);
      const stems=type%2?5:4;
      for(let j=0;j<stems;j++){
        const a=(j/stems)*Math.PI*2,rx=Math.cos(a)*.09*s,rz=Math.sin(a)*.09*s;const st=cyl('v13Stem'+name+j,.035*s,.70*s,rx,.61*s,rz,stem,g);st.rotation.z=(j-2)*.10;
        for(let i=0;i<4;i++){const l=sphere('v13Leaf'+name+j+'_'+i,.25*s,rx+(i%2?1:-1)*(.10+i*.018)*s,(.73+i*.13)*s,rz+(i-1.5)*.035*s,leaf,g);l.scaling.set(type%2?.55:.72,type%2?1.95:1.65,.22);l.rotation.z=(i%2?1:-1)*(1.0+i*.10);l.rotation.y=j*.8+i*.4;}
      }
    }

    function filingWall(){
      const g=new BABYLON.TransformNode('v13ArchiveWall',scene);g.parent=root;g.position.set(1.7,0,-5.95);
      box('v13ArchiveBack',4.6,2.45,.42,0,1.23,0,pbr('v13ArchiveBackMat','#45515e',.52,.16),g);
      for(let i=0;i<5;i++){const x=-1.75+i*.88;box('v13ArchiveUnit'+i,.78,2.18,.52,x,1.10,.08,pbr('v13ArchiveUnitMat'+i,'#677480',.58,.12),g);
        for(let y=.40;y<1.85;y+=.38){box('v13Drawer'+i+'_'+y,.65,.29,.035,x,y,.36,pbr('v13DrawerMat'+i+y,'#b9c2c8',.60,.05),g);box('v13Handle'+i+'_'+y,.18,.025,.02,x,y,.39,metal,g);}
      }
      box('v13ArchiveLight',4.25,.035,.04,0,2.23,.24,warmGlow,g);
      const tex=new BABYLON.DynamicTexture('v13ArchiveSignTex',{width:768,height:170},scene,false);const ctx=tex.getContext();ctx.clearRect(0,0,768,170);ctx.fillStyle='#07111f';roundRect(ctx,5,5,758,160,22);ctx.fill();ctx.strokeStyle='#399cf5';ctx.lineWidth=6;roundRect(ctx,10,10,748,150,18);ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 55px Arial';ctx.fillStyle='#e7f5ff';ctx.fillText('ARCHIV / WISSEN',384,85);tex.update();
      const mat=new BABYLON.StandardMaterial('v13ArchiveSignMat',scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;
      const p=BABYLON.MeshBuilder.CreatePlane('v13ArchiveSign',{width:3.0,height:.66},scene);p.parent=g;p.position.set(0,2.72,.28);p.rotation.y=Math.PI;p.material=mat;
    }

    function serverRoom(){
      const g=new BABYLON.TransformNode('v13ServerRoom',scene);g.parent=root;
      // glass room in lower-left/back, Walter directly in front/inside.
      const gm=glass,frame=metal;
      const gb=(n,w,h,d,x,y,z)=>box(n,w,h,d,x,y,z,gm,g);
      gb('v13ServerGlassBack',4.2,2.8,.045,-7.6,1.42,-5.55);gb('v13ServerGlassL',.045,2.8,3.3,-9.68,1.42,-3.92);gb('v13ServerGlassRTop',.045,2.8,1.0,-5.52,1.42,-5.04);gb('v13ServerGlassRBottom',.045,2.8,.72,-5.52,1.42,-2.62);
      box('v13ServerFrameTop',4.25,.07,.07,-7.6,2.83,-5.53,frame,g);box('v13ServerFrameL',.07,2.85,.07,-9.68,1.42,-3.92,frame,g);box('v13ServerFrameR',.07,2.85,.07,-5.52,1.42,-3.92,frame,g);
      for(let r=0;r<3;r++){const rg=new BABYLON.TransformNode('v13Rack'+r,scene);rg.parent=g;rg.position.set(-8.85+r*1.25,0,-4.85);box('v13RackBody'+r,.88,2.12,.92,0,1.06,0,pbr('v13RackBodyMat'+r,'#151d27',.32,.54),rg);box('v13RackFront'+r,.72,1.95,.04,0,1.06,.48,pbr('v13RackFrontMat'+r,'#0d131a',.24,.42),rg);for(let i=0;i<10;i++){box('v13Slot'+r+'_'+i,.58,.07,.018,0,.28+i*.18,.505,i%3===0?glow:dark,rg);}}
      const lt=new BABYLON.PointLight('v13ServerBlue',new BABYLON.Vector3(-7.6,2.4,-4.1),scene);lt.diffuse=C('#53b5ff');lt.intensity=.52;lt.range=5;
    }

    function meetingRoom(){
      const g=new BABYLON.TransformNode('v13Meeting',scene);g.parent=root;
      box('v13MeetingRug',5.2,.024,4.1,6.25,.016,-3.7,pbr('v13MeetingRugMat','#b9b4ac',.96,0),g);
      box('v13MeetGlassL',.045,2.85,4.6,3.60,1.42,-3.55,glass,g);
      box('v13MeetGlassBack',5.4,2.85,.045,6.30,1.42,-5.82,glass,g);
      box('v13MeetGlassFront',5.4,2.85,.045,6.30,1.42,-1.28,glass,g);
      box('v13MeetFrameTop',5.45,.07,.07,6.30,2.83,-5.80,metal,g);
      box('v13MeetTable',3.55,.12,1.35,6.35,.78,-3.55,wood,g);
      for(const x of [5.05,7.65]) for(const z of [-3.95,-3.15]) box('v13MeetLeg'+x+z,.09,1.36,.09,x,.05,z,dark,g);
      [[4.65,-3.55,Math.PI/2],[8.05,-3.55,-Math.PI/2],[5.55,-2.65,Math.PI],[6.35,-2.65,Math.PI],[7.15,-2.65,Math.PI],[5.55,-4.45,0],[6.35,-4.45,0],[7.15,-4.45,0]].forEach((p,i)=>{const cg=new BABYLON.TransformNode('v13MeetChair'+i,scene);cg.parent=g;cg.position.set(p[0],0,p[1]);cg.rotation.y=p[2];highChair('Meet'+i,cg,0,0);});
      // pendant lights
      for(const x of [5.65,7.05]){cyl('v13PendantStem'+x,.025,.55,x,2.85,-3.55,black,g);const sh=BABYLON.MeshBuilder.CreateCylinder('v13PendantShade'+x,{diameterTop:.12,diameterBottom:.48,height:.28,tessellation:28},scene);sh.parent=g;sh.position.set(x,2.52,-3.55);sh.material=black;const pl=new BABYLON.PointLight('v13PendantLight'+x,new BABYLON.Vector3(x,2.35,-3.55),scene);pl.diffuse=C('#ffd39c');pl.intensity=.33;pl.range=3.5;}
    }

    function lounge(){
      const g=new BABYLON.TransformNode('v13Lounge',scene);g.parent=root;
      box('v13LoungeRug',4.2,.024,3.2,6.45,.016,4.85,pbr('v13LoungeRugMat','#8e8983',.97,0),g);
      box('v13SofaSeat',2.4,.30,.88,7.3,.42,5.30,fabric,g);box('v13SofaBack',2.4,.82,.16,7.3,.88,5.67,fabric,g);box('v13SofaArmL',.18,.52,.88,6.2,.56,5.30,fabric,g);box('v13SofaArmR',.18,.52,.88,8.4,.56,5.30,fabric,g);
      const ag=new BABYLON.TransformNode('v13Armchair',scene);ag.parent=g;ag.position.set(5.05,0,4.80);ag.rotation.y=-.45;box('v13ArmSeat',.90,.30,.88,0,.42,0,fabric,ag);box('v13ArmBack',.90,.75,.15,0,.84,-.36,fabric,ag);box('v13ArmL',.15,.48,.88,-.38,.55,0,fabric,ag);box('v13ArmR',.15,.48,.88,.38,.55,0,fabric,ag);
      cyl('v13CoffeeTable',1.05,.08,6.1,.38,4.65,pbr('v13CoffeeTableMat','#7a5d45',.50,.08),g);cyl('v13CoffeeStem',.12,.65,6.1,.18,4.65,metal,g);
      // floor lamp
      cyl('v13FloorLampStem',.05,1.55,9.15,.78,5.35,metal,g);const shade=BABYLON.MeshBuilder.CreateCylinder('v13LampShade',{diameterTop:.22,diameterBottom:.55,height:.38,tessellation:28},scene);shade.parent=g;shade.position.set(9.15,1.62,5.35);shade.material=black;const lp=new BABYLON.PointLight('v13LoungeLamp',new BABYLON.Vector3(9.15,1.48,5.35),scene);lp.diffuse=C('#ffc986');lp.intensity=.35;lp.range=4;
    }

    // Workstation placement: spacious and reference-like.
    premiumDesk('James',-2.7,1.8,Math.PI,true);
    premiumDesk('Nora',-6.1,.2,0,false);
    premiumDesk('Kevin',-1.0,-1.0,0,false);
    premiumDesk('Gisela',2.55,-.05,Math.PI,false);
    premiumDesk('Lina',-6.25,3.65,0,false);
    premiumDesk('Walter',-7.65,-2.35,0,false);
    premiumDesk('Sarah',-.15,4.45,Math.PI,false);
    premiumDesk('Finn',6.95,1.85,Math.PI,false);

    filingWall();
    serverRoom();
    meetingRoom();
    lounge();

    // Cabinet/shelf wall for visual density like the reference.
    const shelf=new BABYLON.TransformNode('v13ShelfWall',scene);shelf.parent=root;shelf.position.set(1.1,0,-6.45);
    box('v13ShelfBase',4.7,1.10,.42,0,.55,0,pbr('v13ShelfBaseMat','#586470',.55,.12),shelf);
    for(let i=0;i<5;i++){box('v13ShelfDiv'+i,.07,1.05,.42,-1.85+i*.92,.55,0,dark,shelf);addBooks(shelf,'v13ShelfBook'+i,-1.65+i*.92,.18,4);}
    box('v13ShelfTop',4.8,.07,.44,0,1.12,0,trim,shelf);box('v13ShelfLight',4.45,.03,.035,0,1.18,.20,warmGlow,shelf);

    // Many plant clusters, two clearly larger extras.
    [
      ['P1',-9.4,5.55,1.18,0],['P2',-7.85,5.75,.88,1],['P3',-4.4,5.85,.92,0],['P4',2.9,5.75,1.0,1],
      ['P5',5.1,5.95,.95,0],['P6',9.35,5.55,1.15,1],['P7',9.45,-5.55,1.05,0],['P8',4.2,-6.0,.88,1],
      ['P9',-4.9,-5.75,.95,0],['P10',-9.55,-.65,1.0,1],['ExtraA',3.6,3.8,1.28,0],['ExtraB',8.75,-.55,1.30,1]
    ].forEach(p=>plant(...p));

    // Warm wall/desk accent lighting.
    [[-6.1,.2],[-1,-1],[2.55,-.05],[-6.25,3.65],[-7.65,-2.35],[-.15,4.45],[6.95,1.85],[-2.7,1.8]].forEach((p,i)=>{const l=new BABYLON.PointLight('v13DeskLight'+i,new BABYLON.Vector3(p[0],2.2,p[1]),scene);l.diffuse=i%2?C('#ffd2a0'):C('#80bdff');l.intensity=.16;l.range=3.8;});

    // James stays visible and near his main desk; do not move if he is currently travelling.
    const james=scene.getTransformNodeByName('JamesRoot');
    if(james){james.scaling.setAll(1.55);if(BABYLON.Vector3.Distance(james.position,new BABYLON.Vector3(-4.48,0,3.75))<1.3) james.position.set(-3.7,0,2.65);}

    const camera=scene.activeCamera;
    if(camera && typeof camera.radius==='number'){camera.radius=16.9;camera.alpha=Math.PI*.23;camera.beta=.80;camera.target=new BABYLON.Vector3(-.15,.88,.15);}
    const gl=scene.getEffectLayerByName('glow'); if(gl) gl.intensity=.25;

    function forceUI(){
      const t=document.getElementById('viewTitle');if(t)t.textContent='Office v13';
      const m=document.querySelector('.stage-toolbar .muted');if(m)m.textContent=' · Premium Detail · neue Desks · Server · Archiv · Meeting · Lounge';
      const b=document.querySelector('.scene-badge');if(b)b.innerHTML='<span class="dot live"></span>OFFICE V13 · PREMIUM DETAIL';
    }
    forceUI(); let ticks=0; const uiTimer=setInterval(()=>{forceUI(); if(++ticks>24)clearInterval(uiTimer);},250);
    const feed=document.getElementById('activityFeed');if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v13 · Premium-Layout nach Referenzbild geladen</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0; const timer=setInterval(()=>{tries++; if(boot()||tries>260)clearInterval(timer);},100);
})();