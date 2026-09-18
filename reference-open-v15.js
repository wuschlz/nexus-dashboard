(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene=BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('v13PremiumRoot')) return false;
    if(scene.getTransformNodeByName('v15ReferenceRoot')) return true;

    const root=new BABYLON.TransformNode('v15ReferenceRoot',scene);
    const C=h=>BABYLON.Color3.FromHexString(h);
    const pbr=(n,h,r=.55,m=.05)=>{const x=new BABYLON.PBRMaterial(n,scene);x.albedoColor=C(h);x.roughness=r;x.metallic=m;return x;};
    const std=(n,h,e=null,a=1)=>{const x=new BABYLON.StandardMaterial(n,scene);x.diffuseColor=C(h);x.alpha=a;if(e)x.emissiveColor=C(e);return x;};
    const box=(n,w,h,d,x,y,z,mat,parent=root,rot=0)=>{const m=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.rotation.y=rot;m.material=mat;if(parent)m.parent=parent;return m;};
    const cyl=(n,diam,h,x,y,z,mat,parent=root)=>{const m=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:diam,height:h,tessellation:28},scene);m.position.set(x,y,z);m.material=mat;if(parent)m.parent=parent;return m;};

    // Remove the individual glass offices completely.
    const v14=scene.getTransformNodeByName('v14GlassOfficesRoot');
    if(v14) v14.setEnabled(false);

    // Restore the reference-like common areas from v13.
    ['v13Meeting','v13Lounge','v13ShelfWall'].forEach(n=>{const t=scene.getTransformNodeByName(n);if(t)t.setEnabled(true);});
    const arch=scene.getTransformNodeByName('v13ArchiveWall');
    if(arch){arch.setEnabled(true);arch.position.set(4.1,0,-6.05);}
    const oldServer=scene.getTransformNodeByName('v13ServerRoom'); if(oldServer) oldServer.setEnabled(false);

    // Bring the v13 desk assets back and spread them according to the reference image.
    const layout={
      Nora:   {x:-6.15,z:-1.85,r:0},
      Kevin:  {x:-1.95,z:-2.85,r:0},
      Gisela: {x: 2.90,z:-1.55,r:0},
      James:  {x:-1.55,z: 0.75,r:0},
      Lina:   {x:-6.25,z: 2.25,r:0},
      Walter: {x:-4.20,z: 4.55,r:0},
      Sarah:  {x: 0.35,z: 4.65,r:0},
      Finn:   {x: 5.65,z: 2.35,r:0}
    };
    Object.entries(layout).forEach(([name,cfg])=>{
      const d=scene.getTransformNodeByName('v13Desk_'+name);
      if(d){d.setEnabled(true);d.position.set(cfg.x,0,cfg.z);d.rotation.y=cfg.r;}
      const panel=scene.getMeshByName('v13Panel'+name);
      if(panel && panel.material) panel.material.backFaceCulling=false;
    });

    // Keep the server concept, but open like the reference — racks behind Walter, no glass enclosure.
    const rackBody=pbr('v15RackBody','#151d27',.32,.56);
    const rackFront=pbr('v15RackFront','#0c1219',.24,.42);
    const metal=pbr('v15Metal','#445362',.34,.45);
    const glow=std('v15BlueGlow','#16334e','#4aa9ff',1);
    for(let r=0;r<3;r++){
      const g=new BABYLON.TransformNode('v15Rack'+r,scene);g.parent=root;g.position.set(-8.75+r*1.10,0,4.45);
      box('v15RackBody'+r,.82,2.05,.78,0,1.025,0,rackBody,g);
      box('v15RackFront'+r,.68,1.86,.04,0,1.03,.41,rackFront,g);
      for(let i=0;i<10;i++) box('v15RackSlot'+r+'_'+i,.54,.065,.018,0,.26+i*.17,.435,i%3===0?glow:rackFront,g);
    }

    // Tech label, no room around it.
    function sign(name,text,x,y,z,w=2.4){
      const tex=new BABYLON.DynamicTexture('v15SignTex'+name,{width:768,height:180},scene,false);
      const ctx=tex.getContext();ctx.clearRect(0,0,768,180);ctx.fillStyle='#07111f';ctx.fillRect(0,0,768,180);
      ctx.strokeStyle='#3c9fff';ctx.lineWidth=6;ctx.strokeRect(8,8,752,164);
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#eef9ff';ctx.font='800 52px Arial';ctx.fillText(text,384,90);tex.update();
      const mat=new BABYLON.StandardMaterial('v15SignMat'+name,scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;mat.backFaceCulling=false;
      const p=BABYLON.MeshBuilder.CreatePlane('v15Sign'+name,{width:w,height:.55,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);p.parent=root;p.position.set(x,y,z);p.rotation.y=Math.PI;p.material=mat;
    }
    sign('Server','SERVER / TECHNIK',-7.65,2.45,4.08,2.65);

    // Extra archive wall details near Gisela.
    const cabinet=pbr('v15Cab','#c2c9ce',.62,.05),cabFront=pbr('v15CabFront','#6e7a86',.48,.18);
    for(let i=0;i<3;i++){
      const x=3.35+i*.76;
      box('v15ArchiveCab'+i,.68,1.48,.52,x,.74,-5.25,cabinet,root);
      [.36,.74,1.12].forEach((y,j)=>{box('v15ArchiveDrawer'+i+j,.57,.29,.035,x,y,-4.97,cabFront,root);box('v15ArchiveHandle'+i+j,.16,.02,.02,x,y,-4.945,metal,root);});
    }

    // Denser decor and greenery like the reference.
    function plant(name,x,z,s=1,kind=0){
      const g=new BABYLON.TransformNode('v15Plant'+name,scene);g.parent=root;g.position.set(x,0,z);
      const pot=pbr('v15Pot'+name,kind%2?'#4c5055':'#907661',.76,.03),stem=pbr('v15Stem'+name,'#496f50',.82,0),leaf=pbr('v15Leaf'+name,kind%2?'#5d8e67':'#4e9368',.80,0);
      cyl('v15PotMesh'+name,.46*s,.42*s,0,.21*s,0,pot,g);
      const stems=kind%2?5:4;
      for(let j=0;j<stems;j++){
        const a=j*Math.PI*2/stems,rx=Math.cos(a)*.08*s,rz=Math.sin(a)*.08*s;
        const st=cyl('v15StemMesh'+name+j,.032*s,.62*s,rx,.57*s,rz,stem,g);st.rotation.z=(j-2)*.09;
        for(let k=0;k<4;k++){
          const l=BABYLON.MeshBuilder.CreateSphere('v15Leaf'+name+j+'_'+k,{diameter:.23*s,segments:12},scene);
          l.parent=g;l.scaling.set(kind%2?.58:.72,kind%2?1.9:1.7,.22);
          l.position.set(rx+(k%2?1:-1)*(.09+k*.018)*s,(.68+k*.12)*s,rz+(k-1.5)*.03*s);
          l.rotation.z=(k%2?1:-1)*(1.0+k*.1);l.rotation.y=j*.8+k*.4;l.material=leaf;
        }
      }
    }
    const plants=[
      ['A',-9.25,-5.85,1.08,0],['B',-6.85,-5.75,.88,1],['C',-3.90,-5.85,.92,0],
      ['D',.30,-5.95,.90,1],['E',4.95,-5.75,1.03,0],['F',9.15,-5.55,1.10,1],
      ['G',-9.45,1.10,1.00,0],['H',9.20,.45,.96,1],['I',-8.80,5.75,1.05,0],
      ['J',-2.20,5.85,.92,1],['K',3.45,5.70,1.08,0],['L',9.15,5.35,1.12,1]
    ];
    plants.forEach(p=>plant(...p));

    // Low credenzas / books around edges for more visual density.
    const sideMat=pbr('v15Side','#55616d',.56,.14),wood=pbr('v15Wood','#957258',.48,.05);
    box('v15CredenzaA',3.3,.70,.48,-8.15,.35,-4.90,sideMat,root);
    box('v15CredenzaATop',3.4,.06,.50,-8.15,.73,-4.90,wood,root);
    box('v15CredenzaB',3.0,.70,.48,7.70,.35,-5.05,sideMat,root);
    box('v15CredenzaBTop',3.1,.06,.50,7.70,.73,-5.05,wood,root);

    // Warm accent strips similar to the reference.
    const warm=std('v15Warm','#55371f','#ffbd76',1);
    box('v15WarmA',4.4,.025,.03,-7.8,.08,-5.12,warm,root);
    box('v15WarmB',3.7,.025,.03,7.65,.08,-5.27,warm,root);

    // James in the center near his desk.
    const james=scene.getTransformNodeByName('JamesRoot');
    if(james){james.scaling.setAll(1.55);james.position.set(-1.55,0,1.75);james.rotation.y=0;}

    // Camera matches the broad isometric reference view.
    const cam=scene.activeCamera;
    if(cam && typeof cam.radius==='number'){cam.radius=17.2;cam.alpha=Math.PI*.225;cam.beta=.80;cam.target=new BABYLON.Vector3(-.2,.88,.10);}
    const gl=scene.getEffectLayerByName('glow');if(gl)gl.intensity=.25;

    function ui(){
      const t=document.getElementById('viewTitle');if(t)t.textContent='Office v15';
      const m=document.querySelector('.stage-toolbar .muted');if(m)m.textContent=' · Open Office nach Referenz · neue Verteilung · Meeting · Lounge · Archiv · Server';
      const b=document.querySelector('.scene-badge');if(b)b.innerHTML='<span class="dot live"></span>OFFICE V15 · REFERENCE OPEN PLAN';
    }
    ui();let ticks=0;const timer=setInterval(()=>{ui();if(++ticks>24)clearInterval(timer);},250);
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v15 · Glasbüros entfernt, offene Verteilung nach Referenzbild</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>260)clearInterval(timer);},100);
})();