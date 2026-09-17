(() => {
  function boot() {
    if (!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    if (!scene || !scene.getTransformNodeByName('JamesRoot')) return false;
    if (scene.getTransformNodeByName('v8DetailsRoot')) return true;

    const root = new BABYLON.TransformNode('v8DetailsRoot', scene);
    const c = hex => BABYLON.Color3.FromHexString(hex);
    const pbr = (name, hex, rough=.55, metal=0) => {
      const m = new BABYLON.PBRMaterial(name, scene);
      m.albedoColor = c(hex); m.roughness = rough; m.metallic = metal;
      return m;
    };
    const std = (name, hex, emissive=null, alpha=1) => {
      const m = new BABYLON.StandardMaterial(name, scene);
      m.diffuseColor = c(hex); m.alpha = alpha;
      if (emissive) m.emissiveColor = c(emissive);
      return m;
    };
    const makeBox = (name,w,h,d,x,y,z,mat,parent,rot=0) => {
      const m = BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
      m.position.set(x,y,z); m.rotation.y=rot; m.material=mat;
      if (parent) m.parent=parent;
      return m;
    };
    const makeCyl = (name,diameter,height,x,y,z,mat,parent,rotX=0,rotZ=0) => {
      const m = BABYLON.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:24},scene);
      m.position.set(x,y,z); m.rotation.x=rotX; m.rotation.z=rotZ; m.material=mat;
      if (parent) m.parent=parent;
      return m;
    };

    const metal = pbr('v8Metal','#202832',.34,.58);
    const dark = pbr('v8Dark','#171d25',.42,.34);
    const charcoal = pbr('v8Charcoal','#303944',.58,.20);
    const keyMat = pbr('v8Keys','#b6bec7',.62,.08);
    const black = pbr('v8Black','#10151b',.38,.35);
    const paper = pbr('v8Paper','#e8e5df',.88,0);
    const leather = pbr('v8Leather','#29313b',.90,.02);
    const ceramic = pbr('v8Ceramic','#e7edf2',.78,.02);
    const plantGreen = pbr('v8Plant','#4f8b64',.86,0);
    const potMat = pbr('v8Pot','#8a7868',.78,.02);
    const phoneMat = pbr('v8Phone','#202730',.36,.22);
    const brass = pbr('v8Brass','#b89056',.38,.58);
    const neon = std('v8Neon','#0b2040','#42a5ff',1);

    const desks={
      James:{x:-6.35,z:2.75,r:0,exec:true},
      Nora:{x:-2.25,z:-.65,r:0},
      Kevin:{x:1.05,z:-.65,r:Math.PI},
      Gisela:{x:-2.25,z:2.05,r:0},
      Lina:{x:1.05,z:2.05,r:Math.PI},
      Walter:{x:6.9,z:1.55,r:Math.PI},
      Finn:{x:6.9,z:4.0,r:Math.PI},
      Sarah:{x:-3.85,z:5.0,r:-Math.PI/2}
    };

    function addDeskDetails(name,d,index){
      const g=new BABYLON.TransformNode('v8Desk_'+name,scene); g.parent=root;
      g.position.set(d.x,0,d.z); g.rotation.y=d.r;
      const W=d.exec?2.35:1.72, D=d.exec?1.08:.84;

      // Thin premium edge trim around the existing wood top.
      makeBox(name+'V8EdgeFront',W*.96,.035,.035,0,.795,D*.48,metal,g);
      makeBox(name+'V8EdgeBack',W*.96,.035,.035,0,.795,-D*.48,metal,g);
      makeBox(name+'V8EdgeL',.035,.035,D*.90,-W*.48,.795,0,metal,g);
      makeBox(name+'V8EdgeR',.035,.035,D*.90,W*.48,.795,0,metal,g);

      // Desk pad, keyboard, mouse and subtle cable grommet.
      makeBox(name+'V8Pad',W*.43,.015,D*.38,0,.817,.16,leather,g);
      const kb=makeBox(name+'V8Keyboard',.43,.028,.14,-.03,.835,.14,keyMat,g);
      for(let k=0;k<7;k++) makeBox(name+'V8Key'+k,.045,.006,.018,-.16+k*.052,.853,.12,black,g);
      makeBox(name+'V8Mouse',.075,.025,.115,W*.19,.838,.16,black,g);
      makeCyl(name+'V8Grommet',.075,.018,W*.32,.818,-D*.25,black,g);

      // Monitor arm: pedestal, articulated arm and VESA joint.
      makeCyl(name+'V8ArmBase',.12,.035,0,.835,-D*.28,metal,g);
      makeCyl(name+'V8ArmPost',.055,.46,0,1.06,-D*.28,metal,g);
      makeBox(name+'V8Arm1',.34,.045,.045,.15,1.22,-D*.28,metal,g,-.08);
      makeBox(name+'V8Arm2',.24,.04,.04,.36,1.21,-D*.24,metal,g,.24);
      makeCyl(name+'V8Vesa',.10,.025,.45,1.20,-D*.18,metal,g,Math.PI/2);

      // Notebook/tablet, smartphone and pen.
      makeBox(name+'V8Notebook',.27,.025,.19,-W*.31,.835,.14,index%2?paper:pbr(name+'NotebookMat','#526c88',.72,.02),g,-.06);
      makeBox(name+'V8Phone',.075,.018,.145,-W*.14,.837,-.12,phoneMat,g,.08);
      makeCyl(name+'V8Pen',.012,.22,-W*.28,.855,.29,brass,g,0,Math.PI/2);

      // Mug + tiny desk plant. Slightly varied per workstation.
      const mugX=W*.30, mugZ=(index%2===0?.18:-.02);
      makeCyl(name+'V8Mug',.105,.115,mugX,.885,mugZ,ceramic,g);
      makeCyl(name+'V8Pot',.105,.10,-W*.38,.87,-.18,potMat,g);
      const leaf=BABYLON.MeshBuilder.CreateSphere(name+'V8PlantLeaf',{diameter:.13,segments:10},scene);
      leaf.parent=g; leaf.position.set(-W*.38,.99,-.18); leaf.scaling.set(.65,1.5,.55); leaf.material=plantGreen;

      // Under-desk cable spine and a small blue ambient strip.
      makeBox(name+'V8CableSpine',.07,.45,.07,W*.38,.49,-.22,charcoal,g);
      makeBox(name+'V8GlowStrip',W*.34,.018,.025,0,.675,D*.47,neon,g);

      // James gets a little more executive detail.
      if(d.exec){
        makeBox('JamesV8DeskLampBase',.22,.035,.22,-W*.35,.835,-.16,black,g);
        makeCyl('JamesV8DeskLampStem',.035,.48,-W*.35,1.06,-.16,metal,g);
        const lamp=makeBox('JamesV8DeskLampHead',.34,.055,.12,-W*.26,1.27,-.16,black,g,-.18);
        const lampGlow=makeBox('JamesV8DeskLampGlow',.27,.012,.07,-W*.26,1.235,-.16,std('JamesV8LampGlow','#fff4da','#ffd990',1),g,-.18);
        const l=new BABYLON.PointLight('JamesV8TaskLight',new BABYLON.Vector3(d.x-W*.28,1.45,d.z-.2),scene);
        l.diffuse=c('#ffd7a2'); l.intensity=.35; l.range=2.4;
      }
    }

    Object.entries(desks).forEach(([name,d],i)=>addDeskDetails(name,d,i));

    // Premium NEXUS neon wall sign above the credenza.
    const signRoot=new BABYLON.TransformNode('v8SignRoot',scene); signRoot.parent=root;
    signRoot.position.set(5.35,2.20,-6.82);

    const back=makeBox('v8SignBack',3.25,.88,.06,0,0,0,pbr('v8SignBackMat','#151d27',.34,.30),signRoot);
    const inner=makeBox('v8SignInner',3.02,.70,.025,0,0,.045,pbr('v8SignInnerMat','#0f1823',.30,.22),signRoot);

    const tex=new BABYLON.DynamicTexture('v8SignTex',{width:1024,height:256},scene,false);
    tex.hasAlpha=true;
    const ctx=tex.getContext();
    ctx.clearRect(0,0,1024,256);
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='#42a5ff'; ctx.shadowBlur=30;
    ctx.font='800 112px Arial'; ctx.fillStyle='#dff3ff'; ctx.fillText('NEXUS',570,126);
    ctx.shadowBlur=18; ctx.font='900 150px Arial'; ctx.fillStyle='#68b8ff'; ctx.fillText('N',120,126);
    tex.update();
    const signMat=new BABYLON.StandardMaterial('v8SignTextMat',scene);
    signMat.diffuseTexture=tex; signMat.opacityTexture=tex; signMat.emissiveTexture=tex;
    signMat.emissiveColor=c('#5db3ff'); signMat.disableLighting=true;
    const signPlane=BABYLON.MeshBuilder.CreatePlane('v8SignPlane',{width:3.0,height:.72},scene);
    signPlane.parent=signRoot; signPlane.position.z=.065; signPlane.material=signMat;

    // Thin luminous frame around the sign.
    makeBox('v8SignGlowTop',3.14,.025,.02,0,.39,.075,neon,signRoot);
    makeBox('v8SignGlowBottom',3.14,.025,.02,0,-.39,.075,neon,signRoot);
    makeBox('v8SignGlowL',.025,.80,.02,-1.57,0,.075,neon,signRoot);
    makeBox('v8SignGlowR',.025,.80,.02,1.57,0,.075,neon,signRoot);
    const signLight=new BABYLON.PointLight('v8SignLight',new BABYLON.Vector3(5.35,2.3,-5.95),scene);
    signLight.diffuse=c('#4ca9ff'); signLight.intensity=.58; signLight.range=5.2;

    // A few decor pieces on the rear credenza for depth.
    makeBox('v8CredenzaBook1',.10,.34,.24,4.10,1.00,-6.17,pbr('v8Book1','#8f5e50',.76),root,.03);
    makeBox('v8CredenzaBook2',.10,.29,.24,4.23,.975,-6.17,pbr('v8Book2','#5b708d',.76),root,-.03);
    makeCyl('v8CredenzaVase',.20,.34,6.48,1.00,-6.18,pbr('v8Vase','#d6d0c6',.62,.04),root);

    const badge=document.querySelector('.scene-badge');
    if(badge) badge.innerHTML='<span class="dot live"></span>OFFICE V8 · DETAILED DESKS · NEXUS GLOW';
    const title=document.getElementById('viewTitle'); if(title) title.textContent='Office v8';
    const muted=document.querySelector('.stage-toolbar .muted'); if(muted) muted.textContent=' · detaillierte Arbeitsplätze · Glow Branding · 8 Plätze';
    const feed=document.getElementById('activityFeed');
    if(feed){
      const item=document.createElement('div'); item.className='activity-item';
      item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v8 · Desk Details + NEXUS Glow geladen</div>';
      feed.prepend(item); while(feed.children.length>3) feed.removeChild(feed.lastChild);
    }
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{ tries++; if(boot() || tries>140) clearInterval(timer); },100);
})();
