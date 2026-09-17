(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene=BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('v10VisibilityRoot')) return false;
    if(scene.getTransformNodeByName('v11ReadabilityRoot')) return true;

    const root=new BABYLON.TransformNode('v11ReadabilityRoot',scene);
    const C=h=>BABYLON.Color3.FromHexString(h);

    const desks={
      James:{x:-6.35,z:2.75,r:0,exec:true,icon:'crown',role:'LEITUNG'},
      Nora:{x:-2.25,z:-.65,r:0,icon:'mail',role:'MAIL'},
      Kevin:{x:1.05,z:-.65,r:Math.PI,icon:'search',role:'RECHERCHE'},
      Gisela:{x:-2.25,z:2.05,r:0,icon:'database',role:'WISSEN'},
      Lina:{x:1.05,z:2.05,r:Math.PI,icon:'calendar',role:'KALENDER'},
      Walter:{x:6.9,z:1.55,r:Math.PI,icon:'wrench',role:'TECHNIK'},
      Finn:{x:6.9,z:4.0,r:Math.PI,icon:'check',role:'FOLLOW-UP'},
      Sarah:{x:-3.85,z:5.0,r:-Math.PI/2,icon:'people',role:'KONTAKTE'}
    };

    // Remove the older tiny icon treatments and horizontal light-strip clutter.
    Object.keys(desks).forEach(name=>{
      scene.meshes.filter(m=>m.name.startsWith(name+'V9') || m.name.startsWith(name+'V10')).forEach(m=>m.setEnabled(false));
      const strip=scene.getMeshByName(name+'V8GlowStrip'); if(strip) strip.setEnabled(false);
      const frontGlow=scene.getMeshByName('v7FrontGlow_'+name); if(frontGlow) frontGlow.setEnabled(false);
    });

    function roundRect(ctx,x,y,w,h,r){
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    }

    function icon(ctx,type,cx,cy,s){
      ctx.strokeStyle='#d9f3ff'; ctx.fillStyle='#d9f3ff';
      ctx.lineWidth=10*s; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.shadowColor='#39a5ff'; ctx.shadowBlur=22*s;
      const line=(...p)=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.stroke();};
      const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
      if(type==='mail'){
        ctx.strokeRect(cx-42*s,cy-27*s,84*s,54*s); line(cx-42*s,cy-25*s,cx,cy+8*s,cx+42*s,cy-25*s);
      } else if(type==='search'){
        circle(cx-6*s,cy-6*s,27*s); line(cx+14*s,cy+14*s,cx+45*s,cy+45*s);
      } else if(type==='database'){
        for(const yy of [-25,0,25]){ctx.beginPath();ctx.ellipse(cx,cy+yy*s,38*s,13*s,0,0,Math.PI*2);ctx.stroke();}
        line(cx-38*s,cy-25*s,cx-38*s,cy+25*s); line(cx+38*s,cy-25*s,cx+38*s,cy+25*s);
      } else if(type==='calendar'){
        ctx.strokeRect(cx-40*s,cy-34*s,80*s,68*s); line(cx-40*s,cy-12*s,cx+40*s,cy-12*s);
        line(cx-20*s,cy-43*s,cx-20*s,cy-27*s); line(cx+20*s,cy-43*s,cx+20*s,cy-27*s);
        line(cx-14*s,cy+4*s,cx+14*s,cy+4*s); line(cx-14*s,cy+20*s,cx+14*s,cy+20*s);
      } else if(type==='wrench'){
        ctx.beginPath();ctx.arc(cx-14*s,cy-14*s,25*s,.55,4.9);ctx.stroke(); line(cx+3*s,cy+4*s,cx+38*s,cy+39*s); circle(cx+40*s,cy+41*s,9*s);
      } else if(type==='people'){
        circle(cx-17*s,cy-13*s,16*s); circle(cx+20*s,cy-16*s,13*s);
        ctx.beginPath();ctx.arc(cx-17*s,cy+29*s,28*s,Math.PI,0);ctx.stroke();
        ctx.beginPath();ctx.arc(cx+20*s,cy+25*s,21*s,Math.PI,0);ctx.stroke();
      } else if(type==='check'){
        line(cx-36*s,cy+2*s,cx-9*s,cy+28*s,cx+39*s,cy-28*s);
      } else if(type==='crown'){
        line(cx-44*s,cy+24*s,cx-33*s,cy-21*s,cx-8*s,cy+2*s,cx,cy-31*s,cx+8*s,cy+2*s,cx+33*s,cy-21*s,cx+44*s,cy+24*s);
        line(cx-44*s,cy+24*s,cx+44*s,cy+24*s);
      }
    }

    function makeDeskTexture(name,d){
      const tex=new BABYLON.DynamicTexture(name+'V11Tex',{width:768,height:320},scene,false);
      const ctx=tex.getContext(); ctx.clearRect(0,0,768,320);
      const grad=ctx.createLinearGradient(0,0,768,320); grad.addColorStop(0,'#07111f'); grad.addColorStop(1,'#10243a');
      ctx.fillStyle=grad; roundRect(ctx,8,8,752,304,30); ctx.fill();
      ctx.strokeStyle='#3a9fff'; ctx.lineWidth=7; ctx.shadowColor='#2f9dff'; ctx.shadowBlur=24; roundRect(ctx,13,13,742,294,25); ctx.stroke();
      icon(ctx,d.icon,155,160,1.45);
      ctx.shadowBlur=12; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.font='800 66px Arial'; ctx.fillStyle='#e8f7ff'; ctx.fillText(name.toUpperCase(),292,130);
      ctx.shadowBlur=0; ctx.font='700 34px Arial'; ctx.fillStyle='#78bfff'; ctx.fillText(d.role,292,197);
      ctx.font='600 20px Arial'; ctx.fillStyle='#6d8da8'; ctx.fillText('NEXUS OFFICE',292,242);
      tex.update(); return tex;
    }

    function createFace(name,d,side,mat){
      const g=new BABYLON.TransformNode(`v11_${name}_${side}`,scene); g.parent=root; g.position.set(d.x,0,d.z); g.rotation.y=d.r;
      const D=d.exec?1.08:.84, w=d.exec?1.28:1.10, h=d.exec?.55:.48;
      const z=side*(D*.53+.072);
      const frameMat=new BABYLON.PBRMaterial(name+'V11FrameMat'+side,scene);
      frameMat.albedoColor=C('#101924'); frameMat.roughness=.30; frameMat.metallic=.36;
      const frame=BABYLON.MeshBuilder.CreateBox(name+'V11Frame'+side,{width:w+.11,height:h+.11,depth:.055},scene);
      frame.parent=g; frame.position.set(0,.49,z); frame.material=frameMat;
      const plane=BABYLON.MeshBuilder.CreatePlane(name+'V11Panel'+side,{width:w,height:h,sideOrientation:BABYLON.Mesh.FRONTSIDE},scene);
      plane.parent=g; plane.position.set(0,.49,z+side*.035); plane.rotation.y=side>0?Math.PI:0; plane.material=mat; plane.renderingGroupId=2;
    }

    Object.entries(desks).forEach(([name,d])=>{
      const tex=makeDeskTexture(name,d);
      const mat=new BABYLON.StandardMaterial(name+'V11Mat',scene);
      mat.diffuseTexture=tex; mat.emissiveTexture=tex; mat.emissiveColor=C('#ffffff');
      mat.disableLighting=true; mat.backFaceCulling=true;
      createFace(name,d,1,mat); createFace(name,d,-1,mat);
    });

    // Replace the mirrored v8 sign with two correctly oriented one-sided planes.
    const oldSign=scene.getMeshByName('v8SignPlane'); if(oldSign) oldSign.setEnabled(false);
    ['v8SignGlowTop','v8SignGlowBottom','v8SignGlowL','v8SignGlowR'].forEach(n=>{const m=scene.getMeshByName(n); if(m) m.setEnabled(false);});
    const signTex=new BABYLON.DynamicTexture('v11SignTex',{width:1280,height:320},scene,false);
    const sctx=signTex.getContext(); sctx.clearRect(0,0,1280,320); sctx.fillStyle='#07111f'; roundRect(sctx,8,8,1264,304,28); sctx.fill();
    sctx.strokeStyle='#3a9fff'; sctx.lineWidth=8; sctx.shadowColor='#2f9dff'; sctx.shadowBlur=30; roundRect(sctx,16,16,1248,288,24); sctx.stroke();
    sctx.textAlign='center'; sctx.textBaseline='middle'; sctx.font='800 126px Arial'; sctx.fillStyle='#e9f7ff'; sctx.shadowColor='#49adff'; sctx.shadowBlur=38; sctx.fillText('NEXUS',640,145);
    sctx.shadowBlur=0; sctx.font='700 30px Arial'; sctx.fillStyle='#74bfff'; sctx.fillText('OFFICE',640,238); signTex.update();
    const signMat=new BABYLON.StandardMaterial('v11SignMat',scene); signMat.diffuseTexture=signTex; signMat.emissiveTexture=signTex; signMat.emissiveColor=C('#ffffff'); signMat.disableLighting=true; signMat.backFaceCulling=true;
    const signA=BABYLON.MeshBuilder.CreatePlane('v11SignA',{width:4.8,height:1.2,sideOrientation:BABYLON.Mesh.FRONTSIDE},scene); signA.position.set(5.35,2.45,-6.70); signA.rotation.y=Math.PI; signA.material=signMat; signA.renderingGroupId=2;
    const signB=BABYLON.MeshBuilder.CreatePlane('v11SignB',{width:4.8,height:1.2,sideOrientation:BABYLON.Mesh.FRONTSIDE},scene); signB.position.set(5.35,2.45,-6.72); signB.rotation.y=0; signB.material=signMat; signB.renderingGroupId=2;

    const glow=scene.getEffectLayerByName('glow'); if(glow){glow.intensity=.28;}
    const camera=scene.activeCamera;
    if(camera && typeof camera.radius==='number'){
      camera.radius=14.6; camera.alpha=Math.PI*.23; camera.beta=.82; camera.target=new BABYLON.Vector3(-.25,.78,.55);
    }

    const title=document.getElementById('viewTitle'); if(title) title.textContent='Office v11';
    const muted=document.querySelector('.stage-toolbar .muted'); if(muted) muted.textContent=' · große Glow-Panels · lesbare Rollen · Sign korrigiert · 8 Plätze';
    const badge=document.querySelector('.scene-badge'); if(badge) badge.innerHTML='<span class="dot live"></span>OFFICE V11 · BIG GLOW PANELS';
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v11 · große lesbare Desk-Panels + NEXUS Sign Fix</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0; const timer=setInterval(()=>{tries++; if(boot()||tries>200) clearInterval(timer);},100);
})();