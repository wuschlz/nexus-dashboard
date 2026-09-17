(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene=BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('v9DeskIconsRoot')) return false;
    if(scene.getTransformNodeByName('v10VisibilityRoot')) return true;

    const root=new BABYLON.TransformNode('v10VisibilityRoot',scene);
    const C=h=>BABYLON.Color3.FromHexString(h);
    const pbr=(n,h,r=.38,m=.28)=>{const x=new BABYLON.PBRMaterial(n,scene);x.albedoColor=C(h);x.roughness=r;x.metallic=m;return x;};
    const panelMat=pbr('v10PanelMat','#121b26',.32,.34);
    const glowMat=new BABYLON.StandardMaterial('v10GlowMat',scene);
    glowMat.diffuseColor=C('#17395c'); glowMat.emissiveColor=C('#2f9dff'); glowMat.backFaceCulling=false;

    const desks={
      James:{x:-6.35,z:2.75,r:0,exec:true,icon:'crown'},
      Nora:{x:-2.25,z:-.65,r:0,icon:'mail'},
      Kevin:{x:1.05,z:-.65,r:Math.PI,icon:'search'},
      Gisela:{x:-2.25,z:2.05,r:0,icon:'database'},
      Lina:{x:1.05,z:2.05,r:Math.PI,icon:'calendar'},
      Walter:{x:6.9,z:1.55,r:Math.PI,icon:'wrench'},
      Finn:{x:6.9,z:4.0,r:Math.PI,icon:'check'},
      Sarah:{x:-3.85,z:5.0,r:-Math.PI/2,icon:'people'}
    };

    function drawIcon(ctx,type){
      const S=256; ctx.clearRect(0,0,S,S);
      ctx.strokeStyle='#d7f0ff'; ctx.fillStyle='#d7f0ff'; ctx.lineWidth=17;
      ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowColor='#42a5ff'; ctx.shadowBlur=28;
      const line=(...p)=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.stroke();};
      const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
      if(type==='mail'){ctx.strokeRect(50,76,156,108); line(53,80,128,139,203,80);}
      else if(type==='search'){circle(108,108,51); line(144,145,203,204);}
      else if(type==='database'){for(const y of [76,124,172]){ctx.beginPath();ctx.ellipse(128,y,68,24,0,0,Math.PI*2);ctx.stroke();} line(60,76,60,172); line(196,76,196,172);}
      else if(type==='calendar'){ctx.strokeRect(54,65,148,134); line(55,104,201,104); line(88,50,88,82); line(168,50,168,82); for(const x of [88,128,168]) for(const y of [134,168]) circle(x,y,3);}
      else if(type==='wrench'){ctx.beginPath();ctx.arc(95,93,36,.58,4.95);ctx.stroke(); line(119,119,190,190); circle(191,191,14);}
      else if(type==='people'){circle(103,92,27); circle(164,103,22); line(62,185,68,157,88,140,119,140,139,158,144,184); line(134,181,140,156,159,144,185,151,195,181);}
      else if(type==='check'){line(58,133,105,180,200,77); ctx.strokeRect(46,46,164,164);}
      else if(type==='crown'){line(50,164,67,84,111,128,128,66,145,128,189,84,206,164); line(50,164,206,164); line(71,191,185,191);}
    }

    // Hide v9 plaques: they were placed on only one desk side and disappear from the default mobile camera.
    Object.keys(desks).forEach(name=>{
      ['V9IconPanel','V9IconPlane','V9IconGlowTop','V9IconGlowBottom'].forEach(s=>{const m=scene.getMeshByName(name+s); if(m) m.setEnabled(false);});
    });

    function makeFace(name,d,side,mat){
      const g=new BABYLON.TransformNode(`v10_${name}_${side}`,scene); g.parent=root; g.position.set(d.x,0,d.z); g.rotation.y=d.r;
      const D=d.exec?1.08:.84, w=d.exec?.78:.68, h=d.exec?.50:.45;
      const z=side*(D*.52+.055);
      const panel=BABYLON.MeshBuilder.CreateBox(`${name}V10Panel${side}`,{width:w,height:h,depth:.05},scene);
      panel.parent=g; panel.position.set(0,.51,z); panel.material=panelMat;
      const plane=BABYLON.MeshBuilder.CreatePlane(`${name}V10Plane${side}`,{width:w*.76,height:h*.76,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
      plane.parent=g; plane.position.set(0,.51,z+side*.032); plane.rotation.y=side<0?Math.PI:0; plane.material=mat;
      const top=BABYLON.MeshBuilder.CreateBox(`${name}V10GlowTop${side}`,{width:w*.92,height:.02,depth:.018},scene);
      top.parent=g; top.position.set(0,.51+h*.46,z+side*.035); top.material=glowMat;
      const bot=top.clone(`${name}V10GlowBottom${side}`); bot.parent=g; bot.position.y=.51-h*.46;
    }

    Object.entries(desks).forEach(([name,d])=>{
      const tex=new BABYLON.DynamicTexture(name+'V10Tex',{width:256,height:256},scene,false);
      tex.hasAlpha=true; drawIcon(tex.getContext(),d.icon); tex.update();
      const mat=new BABYLON.StandardMaterial(name+'V10Mat',scene);
      mat.diffuseTexture=tex; mat.opacityTexture=tex; mat.emissiveTexture=tex;
      mat.emissiveColor=C('#62bdff'); mat.disableLighting=true; mat.backFaceCulling=false;
      makeFace(name,d,1,mat); makeFace(name,d,-1,mat);
    });

    // Fix the NEXUS wall text: the frame was visible, but the texture plane was back-face culled on mobile.
    const signMat=scene.getMaterialByName('v8SignTextMat'); if(signMat) signMat.backFaceCulling=false;
    const signPlane=scene.getMeshByName('v8SignPlane'); if(signPlane){ signPlane.isVisible=true; signPlane.scaling.set(1.08,1.08,1.08); }

    const title=document.getElementById('viewTitle'); if(title) title.textContent='Office v10';
    const muted=document.querySelector('.stage-toolbar .muted'); if(muted) muted.textContent=' · sichtbare Glow-Icons · NEXUS Sign Fix · 8 Plätze';
    const badge=document.querySelector('.scene-badge'); if(badge) badge.innerHTML='<span class="dot live"></span>OFFICE V10 · VISIBLE GLOW ICONS';
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v10 · Glow-Icons beidseitig + Sign Fix</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0; const timer=setInterval(()=>{tries++; if(boot()||tries>180) clearInterval(timer);},100);
})();