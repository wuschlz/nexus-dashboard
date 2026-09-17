(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('JamesRoot')) return false;
    if(scene.getTransformNodeByName('v12LayoutRoot')) return true;

    const root = new BABYLON.TransformNode('v12LayoutRoot', scene);
    const C = h => BABYLON.Color3.FromHexString(h);
    const pbr = (name, hex, rough=.58, metal=.05) => {
      const m = new BABYLON.PBRMaterial(name, scene);
      m.albedoColor = C(hex); m.roughness = rough; m.metallic = metal;
      return m;
    };
    const std = (name, hex, emissive=null, alpha=1) => {
      const m = new BABYLON.StandardMaterial(name, scene);
      m.diffuseColor = C(hex); m.alpha = alpha;
      if(emissive) m.emissiveColor = C(emissive);
      return m;
    };
    const box = (name,w,h,d,x,y,z,mat,parent=root,rot=0) => {
      const m = BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
      m.position.set(x,y,z); m.rotation.y=rot; m.material=mat; if(parent) m.parent=parent; return m;
    };
    const cyl = (name,diameter,height,x,y,z,mat,parent=root) => {
      const m = BABYLON.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:24},scene);
      m.position.set(x,y,z); m.material=mat; if(parent) m.parent=parent; return m;
    };

    ['v8DetailsRoot','v9DeskIconsRoot','v10VisibilityRoot','v11ReadabilityRoot'].forEach(n=>{
      const t=scene.getTransformNodeByName(n); if(t) t.setEnabled(false);
    });
    const staff=['James','Nora','Kevin','Gisela','Lina','Walter','Sarah','Finn'];
    const oldSuffixes=['DeskTop','DeskBeam','DeskLeg0','DeskLeg1','DeskLed','MonFrame','MonScreen','MonStand','ChairBase','ChairStem','ChairSeat','ChairBack','Label'];
    staff.forEach(name=>{
      oldSuffixes.forEach(s=>{const m=scene.getMeshByName(name+s); if(m) m.setEnabled(false);});
    });
    scene.meshes.forEach(m=>{
      const n=m.name;
      if(
        n.startsWith('v7Rug_') || n.startsWith('v7Cabinet_') || n.startsWith('v7FrontGlow_') ||
        n.startsWith('v7P') || n.startsWith('v7Sofa') || n.startsWith('v7Coffee') || n.startsWith('v7LoungeRug') ||
        n.startsWith('leadPlant') || n.startsWith('teamPlant') || n.startsWith('rightPlant') ||
        n.startsWith('loungePlant') || n.startsWith('loungeA') || n.startsWith('loungeB') || n==='coffee'
      ) m.setEnabled(false);
    });

    const wood = pbr('v12Wood','#9b7a5d',.46,.04);
    const woodExec = pbr('v12WoodExec','#7a5941',.42,.06);
    const woodEdge = pbr('v12WoodEdge','#c6a785',.52,.02);
    const dark = pbr('v12Dark','#28323e',.38,.32);
    const metal = pbr('v12Metal','#3b4856',.32,.48);
    const screen = pbr('v12Screen','#123653',.24,.08);
    screen.emissiveColor = C('#1e6eaa');
    const chairMat = pbr('v12Chair','#59697a',.82,.02);
    const chairDark = pbr('v12ChairDark','#202935',.60,.18);
    const rugMat = pbr('v12Rug','#c8c2b8',.96,0);
    const panelFrame = pbr('v12PanelFrame','#101924',.30,.36);
    const cabinetMat = pbr('v12Cabinet','#c3cbd2',.62,.08);
    const cabinetDark = pbr('v12CabinetDark','#697786',.42,.28);
    const serverMat = pbr('v12Server','#171e27',.34,.52);
    const serverFront = pbr('v12ServerFront','#0d131a',.26,.38);
    const glassMat = new BABYLON.PBRMaterial('v12Glass',scene);
    glassMat.albedoColor=C('#b8d9ed'); glassMat.alpha=.18; glassMat.roughness=.08; glassMat.metallic=.03;
    const glowMat = std('v12Glow','#173657','#43a8ff',1);

    function roundRect(ctx,x,y,w,h,r){
      ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    }
    function drawIcon(ctx,type,cx,cy,s){
      ctx.strokeStyle='#dff5ff'; ctx.fillStyle='#dff5ff'; ctx.lineWidth=10*s; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.shadowColor='#42a5ff'; ctx.shadowBlur=20*s;
      const line=(...p)=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.stroke();};
      const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
      if(type==='mail'){ctx.strokeRect(cx-38*s,cy-24*s,76*s,48*s);line(cx-38*s,cy-23*s,cx,cy+6*s,cx+38*s,cy-23*s);}
      else if(type==='search'){circle(cx-5*s,cy-5*s,25*s);line(cx+13*s,cy+13*s,cx+40*s,cy+40*s);}
      else if(type==='database'){for(const yy of [-22,0,22]){ctx.beginPath();ctx.ellipse(cx,cy+yy*s,34*s,11*s,0,0,Math.PI*2);ctx.stroke();}line(cx-34*s,cy-22*s,cx-34*s,cy+22*s);line(cx+34*s,cy-22*s,cx+34*s,cy+22*s);}
      else if(type==='calendar'){ctx.strokeRect(cx-36*s,cy-30*s,72*s,60*s);line(cx-36*s,cy-10*s,cx+36*s,cy-10*s);line(cx-18*s,cy-38*s,cx-18*s,cy-24*s);line(cx+18*s,cy-38*s,cx+18*s,cy-24*s);}
      else if(type==='wrench'){line(cx-22*s,cy+22*s,cx+21*s,cy-21*s);circle(cx+26*s,cy-26*s,10*s);}
      else if(type==='people'){circle(cx-13*s,cy-11*s,13*s);circle(cx+17*s,cy-15*s,11*s);ctx.beginPath();ctx.arc(cx-13*s,cy+22*s,23*s,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.arc(cx+17*s,cy+19*s,18*s,Math.PI,0);ctx.stroke();}
      else if(type==='check'){line(cx-30*s,cy+2*s,cx-7*s,cy+24*s,cx+34*s,cy-24*s);}
      else if(type==='crown'){line(cx-38*s,cy+22*s,cx-29*s,cy-18*s,cx-7*s,cy+2*s,cx,cy-27*s,cx+7*s,cy+2*s,cx+29*s,cy-18*s,cx+38*s,cy+22*s);line(cx-38*s,cy+22*s,cx+38*s,cy+22*s);}
    }
    function panelTexture(name,role,icon){
      const tex=new BABYLON.DynamicTexture('v12Tex_'+name,{width:768,height:300},scene,false);
      const ctx=tex.getContext(); ctx.clearRect(0,0,768,300);
      const g=ctx.createLinearGradient(0,0,768,300); g.addColorStop(0,'#07111f'); g.addColorStop(1,'#10243a');
      ctx.fillStyle=g; roundRect(ctx,8,8,752,284,30); ctx.fill();
      ctx.strokeStyle='#3d9fff'; ctx.lineWidth=7; ctx.shadowColor='#2f9dff'; ctx.shadowBlur=22; roundRect(ctx,14,14,740,272,24); ctx.stroke();
      drawIcon(ctx,icon,145,150,1.35);
      ctx.shadowBlur=10; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.font='800 60px Arial'; ctx.fillStyle='#eef9ff'; ctx.fillText(name.toUpperCase(),278,126);
      ctx.shadowBlur=0; ctx.font='700 31px Arial'; ctx.fillStyle='#74bfff'; ctx.fillText(role.toUpperCase(),278,188);
      ctx.font='600 19px Arial'; ctx.fillStyle='#668aa8'; ctx.fillText('NEXUS OFFICE',278,232);
      tex.update(); return tex;
    }
    const roles={
      James:['Leitung','crown'], Nora:['Mail','mail'], Kevin:['Recherche','search'], Gisela:['Wissen & Archiv','database'],
      Lina:['Kalender','calendar'], Walter:['Technik / Server','wrench'], Sarah:['Kontakte','people'], Finn:['Follow-up','check']
    };

    function makeChair(name,parent,z){
      const g=new BABYLON.TransformNode('v12Chair_'+name,scene); g.parent=parent; g.position.set(0,0,z);
      cyl('v12_'+name+'_ChairBase',.48,.06,0,.33,0,chairDark,g);
      box('v12_'+name+'_ChairStem',.055,.31,.055,0,.52,0,metal,g);
      box('v12_'+name+'_ChairSeat',.56,.10,.56,0,.72,0,chairMat,g);
      box('v12_'+name+'_ChairBack',.58,.70,.085,0,1.05,-.25,chairMat,g);
      box('v12_'+name+'_ArmL',.07,.16,.42,-.25,.80,.02,chairDark,g);
      box('v12_'+name+'_ArmR',.07,.16,.42,.25,.80,.02,chairDark,g);
    }
    function monitor(name,parent,x,z,yaw){
      const g=new BABYLON.TransformNode('v12Mon_'+name,scene); g.parent=parent; g.position.set(x,0,z); g.rotation.y=yaw;
      box('v12_'+name+'_MonFrame',.58,.38,.045,0,1.17,0,dark,g);
      box('v12_'+name+'_MonScreen',.52,.31,.012,0,1.17,.03,screen,g);
      box('v12_'+name+'_MonStem',.045,.27,.045,0,.96,0,metal,g);
      box('v12_'+name+'_MonFoot',.24,.025,.14,0,.82,0,metal,g);
    }
    function makeLDesk(name,x,z,rot=0,exec=false){
      const g=new BABYLON.TransformNode('v12Desk_'+name,scene); g.parent=root; g.position.set(x,0,z); g.rotation.y=rot;
      const W=exec?2.55:2.10, D=exec?1.05:.92, retD=exec?1.30:1.10, retW=exec?.82:.72;
      const top=exec?woodExec:wood;
      box('v12_'+name+'_Top',W,.085,D,0,.76,0,top,g);
      box('v12_'+name+'_TopEdge',W,.018,D,0,.815,0,woodEdge,g);
      box('v12_'+name+'_Return',retW,.085,retD,W/2-retW/2,.76,-(D/2+retD/2-.16),top,g);
      box('v12_'+name+'_ReturnEdge',retW,.018,retD,W/2-retW/2,.815,-(D/2+retD/2-.16),woodEdge,g);
      const legPts=[[-W/2+.10,-D/2+.10],[-W/2+.10,D/2-.10],[W/2-.10,D/2-.10],[W/2-.10,-D/2-retD+.22],[W/2-retW+.10,-D/2-retD+.22]];
      legPts.forEach((p,i)=>box('v12_'+name+'_Leg'+i,.08,1.38,.08,p[0],.04,p[1],dark,g));
      box('v12_'+name+'_Drawer',.40,.58,.50,-W/2+.32,.31,.02,pbr('v12Drawer_'+name,'#46515f',.58,.18),g);
      [.15,.31,.47].forEach((yy,i)=>box('v12_'+name+'_Handle'+i,.28,.018,.018,-W/2+.32,yy,.27,metal,g));
      monitor(name+'A',g,-.33,-.14,.10); monitor(name+'B',g,.33,-.14,-.10);
      box('v12_'+name+'_Keyboard',.46,.025,.15,-.03,.835,.19,pbr('v12Key_'+name,'#dce4ea',.82,.02),g);
      box('v12_'+name+'_Mouse',.08,.022,.12,.33,.838,.20,pbr('v12Mouse_'+name,'#dce4ea',.82,.02),g);
      box('v12_'+name+'_Notebook',.25,.028,.18,-W*.34,.835,.20,pbr('v12Book_'+name,'#5e7893',.72,.02),g,-.05);
      cyl('v12_'+name+'_Mug',.10,.10,W*.35,.87,.17,pbr('v12Mug_'+name,'#eef2f5',.82,.02),g);
      const [role,icon]=roles[name];
      const tex=panelTexture(name,role,icon);
      const mat=new BABYLON.StandardMaterial('v12PanelMat_'+name,scene);
      mat.diffuseTexture=tex; mat.emissiveTexture=tex; mat.emissiveColor=C('#ffffff'); mat.disableLighting=true; mat.backFaceCulling=true;
      const pw=exec?1.25:1.08, ph=exec?.52:.46;
      box('v12_'+name+'_PanelFrame',pw+.10,ph+.10,.05,0,.47,D/2+.008,panelFrame,g);
      const plane=BABYLON.MeshBuilder.CreatePlane('v12_'+name+'_Panel',{width:pw,height:ph,sideOrientation:BABYLON.Mesh.FRONTSIDE},scene);
      plane.parent=g; plane.position.set(0,.47,D/2+.037); plane.rotation.y=Math.PI; plane.material=mat; plane.renderingGroupId=2;
      box('v12_'+name+'_GlowBar',pw*.78,.02,.025,0,.16,D/2+.018,glowMat,g);
      makeChair(name,g,-D/2-.68);
      box('v12_'+name+'_Rug',W+1.2,.024,2.25,0,.018,-.20,rugMat,g);
      return g;
    }

    function realisticPlant(name,x,z,s=1){
      const g=new BABYLON.TransformNode('v12Plant_'+name,scene); g.parent=root; g.position.set(x,0,z);
      const pot=pbr('v12Pot_'+name,'#8d7562',.76,.03), stem=pbr('v12Stem_'+name,'#456e4d',.82,0), leaf=pbr('v12Leaf_'+name,'#4f8f66',.78,0);
      cyl('v12_'+name+'_Pot',.46*s,.42*s,0,.21*s,0,pot,g);
      [[0,0],[-.10,.07],[.10,-.06],[.04,.10]].forEach((p,si)=>{
        const st=cyl('v12_'+name+'_Stem'+si,.035*s,.60*s,p[0]*s,.58*s,p[1]*s,stem,g);
        st.rotation.z=(si-1.5)*.11;
        for(let i=0;i<4;i++){
          const l=BABYLON.MeshBuilder.CreateSphere('v12_'+name+'_Leaf'+si+'_'+i,{diameter:.24*s,segments:12},scene);
          l.parent=g; l.scaling.set(.72,1.75,.22);
          l.position.set((p[0]+(i%2?1:-1)*(.10+i*.018))*s,(.69+i*.12)*s,(p[1]+(i-1.5)*.035)*s);
          l.rotation.z=(i%2?1:-1)*(1.0+i*.10); l.rotation.y=(si*.72+i*.43); l.material=leaf;
        }
      });
    }

    function glassBox(name,w,h,d,x,y,z,rot=0){
      const m=BABYLON.MeshBuilder.CreateBox('v12_'+name,{width:w,height:h,depth:d},scene);
      m.parent=root; m.position.set(x,y,z); m.rotation.y=rot; m.material=glassMat; return m;
    }
    function serverRack(name,x,z){
      const g=new BABYLON.TransformNode('v12Rack_'+name,scene); g.parent=root; g.position.set(x,0,z);
      box('v12_'+name+'_RackBody',.82,2.15,.92,0,1.075,0,serverMat,g);
      box('v12_'+name+'_RackFront',.70,1.95,.05,0,1.08,.47,serverFront,g);
      for(let i=0;i<9;i++) box('v12_'+name+'_RackSlot'+i,.56,.075,.02,0,.30+i*.19,.505,(i%3===0?glowMat:dark),g);
    }
    function archiveCabinet(name,x,z){
      const g=new BABYLON.TransformNode('v12Archive_'+name,scene); g.parent=root; g.position.set(x,0,z);
      box('v12_'+name+'_Cab',.74,1.65,.60,0,.825,0,cabinetMat,g);
      [.35,.76,1.17].forEach((yy,i)=>{
        box('v12_'+name+'_Drawer'+i,.64,.33,.04,0,yy,.32,cabinetDark,g);
        box('v12_'+name+'_Handle'+i,.20,.025,.025,0,yy,.35,metal,g);
      });
    }
    function zoneSign(name,text,x,y,z,rot=0){
      const tex=new BABYLON.DynamicTexture('v12ZoneTex_'+name,{width:768,height:180},scene,false);
      const ctx=tex.getContext(); ctx.clearRect(0,0,768,180); ctx.fillStyle='#07111f'; roundRect(ctx,5,5,758,170,22); ctx.fill();
      ctx.strokeStyle='#3d9fff'; ctx.lineWidth=6; roundRect(ctx,10,10,748,160,18); ctx.stroke();
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='800 58px Arial'; ctx.fillStyle='#e6f5ff'; ctx.fillText(text,384,90); tex.update();
      const mat=new BABYLON.StandardMaterial('v12ZoneMat_'+name,scene); mat.diffuseTexture=tex; mat.emissiveTexture=tex; mat.emissiveColor=C('#ffffff'); mat.disableLighting=true; mat.backFaceCulling=false;
      const p=BABYLON.MeshBuilder.CreatePlane('v12Zone_'+name,{width:3.1,height:.72,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene); p.parent=root; p.position.set(x,y,z); p.rotation.y=rot; p.material=mat;
    }

    makeLDesk('James',-4.65,2.75,Math.PI,true);
    makeLDesk('Nora',-1.80,-.35,0,false);
    makeLDesk('Kevin',1.45,2.00,Math.PI,false);
    makeLDesk('Lina',-.55,4.70,Math.PI,false);
    makeLDesk('Sarah',3.75,4.55,Math.PI,false);
    makeLDesk('Finn',7.65,2.55,Math.PI/2,false);
    makeLDesk('Gisela',-2.35,-3.55,0,false);
    makeLDesk('Walter',-7.80,-3.05,0,false);

    glassBox('ServerBack',4.10,2.85,.055,-7.80,1.43,-6.15,0);
    glassBox('ServerLeft',.055,2.85,3.15,-9.83,1.43,-4.58,0);
    glassBox('ServerRightTop',.055,2.85,1.05,-5.77,1.43,-5.62,0);
    glassBox('ServerRightBottom',.055,2.85,.75,-5.77,1.43,-3.00,0);
    serverRack('ServerA',-9.10,-5.45); serverRack('ServerB',-7.85,-5.45); serverRack('ServerC',-6.60,-5.45);
    zoneSign('Server','SERVER / TECHNIK',-7.80,2.62,-6.05,Math.PI);
    const serverLight=new BABYLON.PointLight('v12ServerLight',new BABYLON.Vector3(-7.8,2.5,-4.7),scene); serverLight.diffuse=C('#62b8ff'); serverLight.intensity=.48; serverLight.range=5.5;

    archiveCabinet('ArchivA',-3.95,-6.28); archiveCabinet('ArchivB',-3.12,-6.28); archiveCabinet('ArchivC',-2.29,-6.28); archiveCabinet('ArchivD',-1.46,-6.28);
    box('v12ArchiveSort',1.65,.78,.55,-.35,.39,-5.85,wood,root);
    zoneSign('Archiv','ARCHIV / WISSEN',-2.70,2.45,-6.68,Math.PI);

    const sofaMat=pbr('v12Sofa','#66727f',.90,0);
    box('v12SofaSeat',2.2,.30,.85,7.55,.36,5.55,sofaMat,root);
    box('v12SofaBack',2.2,.78,.16,7.55,.78,5.90,sofaMat,root);
    box('v12Coffee',1.0,.10,.72,6.10,.34,5.30,pbr('v12CoffeeMat','#7d6048',.54,.04),root);

    [
      ['A',-9.75,5.75,1.08],['B',-6.80,5.65,.92],['C',-3.05,5.80,.88],
      ['D',2.10,5.85,.90],['E',5.75,5.90,1.0],['F',9.35,5.60,1.02],
      ['G',9.45,-5.65,1.0],['H',3.05,-6.10,.92],['I',-4.75,-5.70,.86],['J',-9.65,-1.15,.94]
    ].forEach(p=>realisticPlant(...p));

    const smallLeaf=pbr('v12SmallLeaf','#5b9b70',.82,0), smallPot=pbr('v12SmallPot','#a28770',.78,.02);
    ['James','Nora','Kevin','Gisela','Lina','Sarah','Finn','Walter'].forEach(name=>{
      const g=scene.getTransformNodeByName('v12Desk_'+name); if(!g) return;
      cyl('v12_'+name+'_DeskPot',.11,.10,.66,.87,.16,smallPot,g);
      const l=BABYLON.MeshBuilder.CreateSphere('v12_'+name+'_DeskPlant',{diameter:.14,segments:10},scene);
      l.parent=g; l.position.set(.66,.98,.16); l.scaling.set(.65,1.45,.45); l.material=smallLeaf;
    });

    const camera=scene.activeCamera;
    if(camera && typeof camera.radius==='number'){
      camera.radius=16.6; camera.alpha=Math.PI*.235; camera.beta=.83; camera.target=new BABYLON.Vector3(-.15,.82,.10);
    }
    const glow=scene.getEffectLayerByName('glow'); if(glow) glow.intensity=.26;

    const james=scene.getTransformNodeByName('JamesRoot');
    if(james && BABYLON.Vector3.Distance(james.position,new BABYLON.Vector3(-4.48,0,3.75))<1.2) james.position.set(-4.48,0,3.75);

    const title=document.getElementById('viewTitle'); if(title) title.textContent='Office v12';
    const muted=document.querySelector('.stage-toolbar .muted'); if(muted) muted.textContent=' · neues Layout · L-Desks · Serverraum · Archiv · mehr Pflanzen';
    const badge=document.querySelector('.scene-badge'); if(badge) badge.innerHTML='<span class="dot live"></span>OFFICE V12 · NEW LAYOUT · SERVER · ARCHIVE';
    const feed=document.getElementById('activityFeed');
    if(feed){
      const item=document.createElement('div'); item.className='activity-item';
      item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v12 · L-Desks, Serverraum, Archiv und neue Pflanzen</div>';
      feed.prepend(item); while(feed.children.length>3) feed.removeChild(feed.lastChild);
    }
    return true;
  }
  let tries=0;
  const timer=setInterval(()=>{tries++; if(boot() || tries>240) clearInterval(timer);},100);
})();