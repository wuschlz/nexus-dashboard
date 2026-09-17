(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene=BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('v8DetailsRoot')) return false;
    if(scene.getTransformNodeByName('v9DeskIconsRoot')) return true;

    const root=new BABYLON.TransformNode('v9DeskIconsRoot',scene);
    const C=h=>BABYLON.Color3.FromHexString(h);
    const pbr=(n,h,r=.42,m=.22)=>{const x=new BABYLON.PBRMaterial(n,scene);x.albedoColor=C(h);x.roughness=r;x.metallic=m;return x;};
    const panelMat=pbr('v9IconPanelMat','#18222e',.34,.30);
    const edgeMat=new BABYLON.StandardMaterial('v9IconEdgeMat',scene);
    edgeMat.diffuseColor=C('#173657'); edgeMat.emissiveColor=C('#2f92ff'); edgeMat.disableLighting=false;

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
      const S=256;
      ctx.clearRect(0,0,S,S);
      ctx.strokeStyle='#8fd0ff';
      ctx.fillStyle='#8fd0ff';
      ctx.lineWidth=15;
      ctx.lineCap='round';
      ctx.lineJoin='round';
      ctx.shadowColor='#339cff';
      ctx.shadowBlur=24;
      const line=(...pts)=>{ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke();};
      const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
      if(type==='mail'){
        ctx.strokeRect(52,78,152,104); line(55,82,128,138,201,82);
      }else if(type==='search'){
        circle(109,108,50); line(145,145,202,202);
      }else if(type==='database'){
        for(const y of [78,124,170]){ctx.beginPath();ctx.ellipse(128,y,68,24,0,0,Math.PI*2);ctx.stroke();}
        line(60,78,60,170); line(196,78,196,170);
      }else if(type==='calendar'){
        ctx.strokeRect(55,66,146,132); line(56,104,200,104); line(88,52,88,82); line(168,52,168,82);
        for(const x of [88,128,168]) for(const y of [132,166]) circle(x,y,3);
      }else if(type==='wrench'){
        ctx.beginPath();ctx.arc(94,92,35,.6,4.95);ctx.stroke(); line(118,118,188,188); circle(191,191,14);
      }else if(type==='people'){
        circle(104,94,26); circle(162,104,22); line(62,182,68,156,86,140,120,140,138,156,144,182); line(132,180,140,154,158,143,184,150,194,180);
      }else if(type==='check'){
        line(60,132,105,177,198,78); ctx.strokeRect(48,48,160,160);
      }else if(type==='crown'){
        line(52,164,68,86,111,127,128,68,145,127,188,86,204,164); line(52,164,204,164); line(72,190,184,190);
      }
    }

    function addIcon(name,d){
      const g=new BABYLON.TransformNode('v9Icon_'+name,scene); g.parent=root; g.position.set(d.x,0,d.z); g.rotation.y=d.r;
      const D=d.exec?1.08:.84;
      const w=d.exec?.64:.54, h=d.exec?.43:.38;
      const panel=BABYLON.MeshBuilder.CreateBox(name+'V9IconPanel',{width:w,height:h,depth:.045},scene);
      panel.parent=g; panel.position.set(0,.49,D*.52+.025); panel.material=panelMat;

      const tex=new BABYLON.DynamicTexture(name+'V9IconTex',{width:256,height:256},scene,false);
      tex.hasAlpha=true; drawIcon(tex.getContext(),d.icon); tex.update();
      const mat=new BABYLON.StandardMaterial(name+'V9IconMat',scene);
      mat.diffuseTexture=tex; mat.opacityTexture=tex; mat.emissiveTexture=tex; mat.emissiveColor=C('#56b6ff'); mat.disableLighting=true;
      const plane=BABYLON.MeshBuilder.CreatePlane(name+'V9IconPlane',{width:w*.76,height:h*.76},scene);
      plane.parent=g; plane.position.set(0,.49,D*.52+.051); plane.material=mat;

      const top=BABYLON.MeshBuilder.CreateBox(name+'V9IconGlowTop',{width:w*.9,height:.018,depth:.014},scene);
      top.parent=g; top.position.set(0,.49+h*.46,D*.52+.055); top.material=edgeMat;
      const bottom=top.clone(name+'V9IconGlowBottom'); bottom.parent=g; bottom.position.y=.49-h*.46;
    }
    Object.entries(desks).forEach(([name,d])=>addIcon(name,d));

    // Make the wall NEXUS sign much easier to read from the default mobile view.
    const sign=scene.getTransformNodeByName('v8SignRoot');
    if(sign){ sign.scaling.setAll(1.42); sign.position.y=2.42; }

    // Slightly closer framing so the new desk details are actually visible on a phone.
    const camera=scene.activeCamera;
    if(camera && typeof camera.radius==='number'){
      camera.radius=15.7;
      camera.target=new BABYLON.Vector3(0,.82,.42);
    }

    const title=document.getElementById('viewTitle'); if(title) title.textContent='Office v9';
    const muted=document.querySelector('.stage-toolbar .muted'); if(muted) muted.textContent=' · Desk-Glow-Icons · detaillierte Arbeitsplätze · 8 Plätze';
    const badge=document.querySelector('.scene-badge'); if(badge) badge.innerHTML='<span class="dot live"></span>OFFICE V9 · DESK GLOW ICONS';
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v9 · Glow-Symbole an allen Schreibtischen</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0; const timer=setInterval(()=>{tries++; if(boot()||tries>160) clearInterval(timer);},100);
})();