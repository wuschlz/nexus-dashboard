(() => {
  function boot(){
    if(!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    if(!scene || !scene.getTransformNodeByName('v13PremiumRoot')) return false;
    if(scene.getTransformNodeByName('v14GlassOfficesRoot')) return true;

    const root = new BABYLON.TransformNode('v14GlassOfficesRoot',scene);
    const C = h => BABYLON.Color3.FromHexString(h);
    const pbr = (n,h,r=.5,m=.05) => { const x=new BABYLON.PBRMaterial(n,scene); x.albedoColor=C(h); x.roughness=r; x.metallic=m; return x; };
    const std = (n,h,e=null,a=1) => { const x=new BABYLON.StandardMaterial(n,scene); x.diffuseColor=C(h); x.alpha=a; if(e)x.emissiveColor=C(e); return x; };
    const box = (n,w,h,d,x,y,z,mat,parent=root,rot=0) => { const m=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.rotation.y=rot;m.material=mat;if(parent)m.parent=parent;return m; };
    const cyl = (n,diam,h,x,y,z,mat,parent=root) => { const m=BABYLON.MeshBuilder.CreateCylinder(n,{diameter:diam,height:h,tessellation:28},scene);m.position.set(x,y,z);m.material=mat;if(parent)m.parent=parent;return m; };

    // Replace v13's open-plan functional zones with individual glass offices.
    ['v13ArchiveWall','v13ServerRoom','v13Meeting','v13Lounge','v13ShelfWall'].forEach(n=>{const t=scene.getTransformNodeByName(n); if(t)t.setEnabled(false);});
    scene.transformNodes.filter(t=>t.name.startsWith('v13Plant')).forEach(t=>t.setEnabled(false));

    const frame=pbr('v14Frame','#273441',.32,.46);
    const frameLight=pbr('v14FrameLight','#425365',.36,.30);
    const rug=pbr('v14OfficeRug','#b6b0a8',.96,0);
    const cabinet=pbr('v14Cabinet','#63717e',.56,.15);
    const cabinetFront=pbr('v14CabinetFront','#b9c3c9',.62,.04);
    const black=pbr('v14Black','#101720',.26,.46);
    const wood=pbr('v14Wood','#997758',.46,.04);
    const fabric=pbr('v14Fabric','#687686',.90,.01);
    const serverBody=pbr('v14ServerBody','#151d26',.30,.55);
    const serverFront=pbr('v14ServerFront','#0b1219',.24,.42);
    const blueGlow=std('v14BlueGlow','#173452','#4baaff',1);
    const warmGlow=std('v14WarmGlow','#55371f','#ffbf7c',1);

    // Stronger, more visible architectural glass.
    const glass=new BABYLON.PBRMaterial('v14Glass',scene);
    glass.albedoColor=C('#7db6d8');
    glass.alpha=.34;
    glass.roughness=.08;
    glass.metallic=.04;
    glass.indexOfRefraction=1.48;
    glass.subSurface.isRefractionEnabled=true;
    glass.subSurface.refractionIntensity=.34;
    glass.backFaceCulling=false;

    // Remove v13 desk rugs because each office gets its own room rug.
    scene.meshes.filter(m=>m.name.startsWith('v13Rug')).forEach(m=>m.setEnabled(false));

    const offices = {
      Nora:   {x:-6.9,z:-3.75,w:4.0,d:3.0},
      Kevin:  {x:-2.3,z:-3.75,w:4.0,d:3.0},
      Gisela: {x: 2.3,z:-3.75,w:4.0,d:3.0},
      Lina:   {x:-6.9,z: 0.00,w:4.0,d:3.0},
      James:  {x:-2.3,z: 0.00,w:4.0,d:3.0},
      Sarah:  {x: 2.3,z: 0.00,w:4.0,d:3.0},
      Walter: {x:-6.9,z: 3.75,w:4.0,d:3.0},
      Finn:   {x:-2.3,z: 3.75,w:4.0,d:3.0}
    };

    function roomLabel(name,role,parent){
      const tex=new BABYLON.DynamicTexture('v14RoomTex'+name,{width:700,height:170},scene,false);
      const ctx=tex.getContext();ctx.clearRect(0,0,700,170);
      ctx.fillStyle='rgba(7,16,28,.94)';ctx.fillRect(0,0,700,170);
      ctx.strokeStyle='#3a9fff';ctx.lineWidth=6;ctx.strokeRect(8,8,684,154);
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#eef9ff';ctx.font='800 48px Arial';ctx.fillText(name.toUpperCase(),350,70);
      ctx.fillStyle='#75bdff';ctx.font='700 25px Arial';ctx.fillText(role.toUpperCase(),350,117);tex.update();
      const mat=new BABYLON.StandardMaterial('v14RoomLabelMat'+name,scene);mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.emissiveColor=C('#ffffff');mat.disableLighting=true;mat.backFaceCulling=false;
      const p=BABYLON.MeshBuilder.CreatePlane('v14RoomLabel'+name,{width:2.2,height:.54,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
      p.parent=parent;p.position.set(0,2.58,1.52);p.rotation.y=Math.PI;p.material=mat;
    }

    function officeRoom(name,cfg,role){
      const g=new BABYLON.TransformNode('v14Office_'+name,scene);g.parent=root;g.position.set(cfg.x,0,cfg.z);
      const w=cfg.w,d=cfg.d,h=2.7,door=.86,frontZ=d/2;
      box('v14Rug_'+name,w-.35,.022,d-.25,0,.014,0,rug,g);

      // back and side glass
      box('v14GlassBack_'+name,w,h,.055,0,h/2,-d/2,glass,g);
      box('v14GlassLeft_'+name,.055,h,d,-w/2,h/2,0,glass,g);
      box('v14GlassRight_'+name,.055,h,d,w/2,h/2,0,glass,g);
      // front wall with a real door opening in the middle
      const seg=(w-door)/2;
      box('v14GlassFrontL_'+name,seg,h,.055,-(door/2+seg/2),h/2,frontZ,glass,g);
      box('v14GlassFrontR_'+name,seg,h,.055,(door/2+seg/2),h/2,frontZ,glass,g);
      const doorGlass=box('v14Door_'+name,door-.08,h-.15,.045,door/2+.48,h/2,frontZ+.018,glass,g);
      // dark structural frames: visible from mobile immediately
      box('v14FrameTopBack_'+name,w,.075,.075,0,h,-d/2,frame,g);
      box('v14FrameTopFront_'+name,w,.075,.075,0,h,frontZ,frame,g);
      box('v14FrameTopL_'+name,.075,.075,d,-w/2,h,0,frame,g);
      box('v14FrameTopR_'+name,.075,.075,d,w/2,h,0,frame,g);
      [[-w/2,-d/2],[-w/2,d/2],[w/2,-d/2],[w/2,d/2],[-door/2,d/2],[door/2,d/2]].forEach((p,i)=>box('v14Post_'+name+i,.075,h,.075,p[0],h/2,p[1],frame,g));
      // door handle + blue base accent
      box('v14DoorHandle_'+name,.035,.32,.035,door/2+.12,1.25,frontZ+.06,frameLight,g);
      box('v14GlassGlow_'+name,w-.15,.025,.035,0,.06,frontZ+.02,blueGlow,g);
      roomLabel(name,role,g);
      return g;
    }

    const roles={
      James:'Leitung',Nora:'Mail',Kevin:'Recherche',Gisela:'Wissen & Gedächtnis',
      Lina:'Kalender & Erinnerungen',Walter:'Technischer Support',Sarah:'Identität & Kontakte',Finn:'Nachverfolgung'
    };

    Object.entries(offices).forEach(([name,cfg])=>officeRoom(name,cfg,roles[name]));

    // Reuse the detailed v13 desks, but put every desk in its office and face every worker toward the viewer.
    // This also guarantees the single front sign is immediately visible.
    Object.entries(offices).forEach(([name,cfg])=>{
      const d=scene.getTransformNodeByName('v13Desk_'+name);
      if(d){
        d.setEnabled(true);
        d.position.set(cfg.x,0,cfg.z+.10);
        d.rotation.y=0;
        const panel=scene.getMeshByName('v13Panel'+name);
        if(panel && panel.material) panel.material.backFaceCulling=false;
      }
    });

    // Gisela: filing cabinets inside her own glass office.
    function filingCabinet(name,x,z){
      const g=new BABYLON.TransformNode('v14Cab_'+name,scene);g.parent=root;g.position.set(x,0,z);
      box('v14CabBody'+name,.66,1.62,.52,0,.81,0,cabinet,g);
      [.34,.73,1.12].forEach((y,i)=>{
        box('v14CabDrawer'+name+i,.56,.30,.035,0,y,.28,cabinetFront,g);
        box('v14CabHandle'+name+i,.16,.023,.02,0,y,.31,frameLight,g);
      });
    }
    filingCabinet('G1',1.05,-4.72); filingCabinet('G2',1.80,-4.72); filingCabinet('G3',2.55,-4.72); filingCabinet('G4',3.30,-4.72);

    // Walter: server racks inside his own glass office.
    function rack(name,x,z){
      const g=new BABYLON.TransformNode('v14Rack_'+name,scene);g.parent=root;g.position.set(x,0,z);
      box('v14RackBody'+name,.72,1.92,.70,0,.96,0,serverBody,g);
      box('v14RackFront'+name,.61,1.72,.035,0,.96,.37,serverFront,g);
      for(let i=0;i<9;i++) box('v14RackSlot'+name+i,.49,.065,.018,0,.27+i*.17,.39,i%3===0?blueGlow:black,g);
    }
    rack('W1',-8.0,2.80); rack('W2',-7.15,2.80); rack('W3',-6.30,2.80);

    // Add a compact cabinet/shelf to every office for more realism.
    Object.entries(offices).forEach(([name,cfg],i)=>{
      if(name==='Gisela' || name==='Walter') return;
      const x=cfg.x+1.38,z=cfg.z-.88;
      const g=new BABYLON.TransformNode('v14Shelf_'+name,scene);g.parent=root;g.position.set(x,0,z);
      box('v14ShelfBody'+name,.52,1.18,.42,0,.59,0,pbr('v14ShelfMat'+name,'#566371',.56,.15),g);
      for(let s=0;s<3;s++) box('v14ShelfLine'+name+s,.44,.035,.38,0,.23+s*.35,.02,frameLight,g);
    });

    // Plants: one substantial plant in each office plus corridor clusters.
    function plant(name,x,z,s=1){
      const g=new BABYLON.TransformNode('v14Plant_'+name,scene);g.parent=root;g.position.set(x,0,z);
      const pot=pbr('v14PotMat'+name,'#8f7764',.76,.02),stem=pbr('v14StemMat'+name,'#466f50',.82,0),leaf=pbr('v14LeafMat'+name,'#4f9369',.80,0);
      cyl('v14Pot'+name,.42*s,.38*s,0,.19*s,0,pot,g);
      for(let j=0;j<4;j++){
        const a=j*Math.PI/2,rx=Math.cos(a)*.07*s,rz=Math.sin(a)*.07*s;
        const st=cyl('v14Stem'+name+j,.032*s,.58*s,rx,.54*s,rz,stem,g);st.rotation.z=(j-1.5)*.10;
        for(let k=0;k<4;k++){
          const l=BABYLON.MeshBuilder.CreateSphere('v14Leaf'+name+j+'_'+k,{diameter:.22*s,segments:12},scene);
          l.parent=g;l.scaling.set(.68,1.70,.22);
          l.position.set(rx+(k%2?1:-1)*(.09+k*.018)*s,(.65+k*.12)*s,rz+(k-1.5)*.03*s);
          l.rotation.z=(k%2?1:-1)*(1.0+k*.1);l.rotation.y=j*.8+k*.42;l.material=leaf;
        }
      }
    }
    Object.entries(offices).forEach(([name,cfg],i)=>plant(name,cfg.x-1.35,cfg.z-.92,.82+(i%3)*.04));
    [['C1',4.65,5.65,1.05],['C2',9.15,5.55,1.08],['C3',4.70,-5.85,.95],['C4',9.20,-5.65,1.00]].forEach(p=>plant(...p));

    // New dedicated glass meeting room on the right.
    const meet=new BABYLON.TransformNode('v14MeetingRoom',scene);meet.parent=root;meet.position.set(7.15,0,-1.65);
    const mw=4.2,md=4.9,mh=2.75;
    box('v14MeetBack',mw,mh,.055,0,mh/2,-md/2,glass,meet);
    box('v14MeetLeft',.055,mh,md,-mw/2,mh/2,0,glass,meet);
    box('v14MeetRight',.055,mh,md,mw/2,mh/2,0,glass,meet);
    box('v14MeetFrontL',1.55,mh,.055,-1.28,mh/2,md/2,glass,meet);
    box('v14MeetFrontR',1.55,mh,.055,1.28,mh/2,md/2,glass,meet);
    [[-mw/2,-md/2],[-mw/2,md/2],[mw/2,-md/2],[mw/2,md/2],[-.50,md/2],[.50,md/2]].forEach((p,i)=>box('v14MeetPost'+i,.075,mh,.075,p[0],mh/2,p[1],frame,meet));
    box('v14MeetTop',mw,.075,.075,0,mh,-md/2,frame,meet);
    box('v14MeetTable',3.0,.12,1.25,0,.78,0,wood,meet);
    [[-1.7,0,Math.PI/2],[1.7,0,-Math.PI/2],[-.9,-1.0,0],[0,-1.0,0],[.9,-1.0,0],[-.9,1.0,Math.PI],[0,1.0,Math.PI],[.9,1.0,Math.PI]].forEach((p,i)=>{
      const cg=new BABYLON.TransformNode('v14MeetChair'+i,scene);cg.parent=meet;cg.position.set(p[0],0,p[1]);cg.rotation.y=p[2];
      cyl('v14MeetBase'+i,.44,.055,0,.32,0,black,cg);box('v14MeetSeat'+i,.52,.10,.52,0,.72,0,fabric,cg);box('v14MeetBackrest'+i,.54,.66,.085,0,1.03,-.23,fabric,cg);
    });
    box('v14MeetGlow',mw-.18,.025,.035,0,.06,md/2+.02,blueGlow,meet);

    // Lounge remains outside offices, lower right.
    const lounge=new BABYLON.TransformNode('v14Lounge',scene);lounge.parent=root;lounge.position.set(7.15,0,4.55);
    box('v14LoungeRug',4.0,.024,2.6,0,.014,0,pbr('v14LoungeRugMat','#918b84',.97,0),lounge);
    box('v14SofaSeat',2.2,.28,.82,.55,.42,.35,fabric,lounge);box('v14SofaBack',2.2,.76,.15,.55,.84,.69,fabric,lounge);
    cyl('v14Coffee',.90,.08,-1.05,.36,.05,wood,lounge);cyl('v14CoffeeStem',.10,.62,-1.05,.18,.05,metal,lounge);

    // Subtle warm illumination along room fronts makes the glass boundaries read better.
    Object.entries(offices).forEach(([name,cfg],i)=>{
      box('v14WarmLine'+name,cfg.w-.25,.022,.025,cfg.x,.055,cfg.z+cfg.d/2+.035,warmGlow,root);
      const l=new BABYLON.PointLight('v14OfficeLight'+name,new BABYLON.Vector3(cfg.x,2.35,cfg.z),scene);
      l.diffuse=i%2?C('#ffd3a3'):C('#c6e7ff');l.intensity=.16;l.range=3.4;
    });

    // James character follows the new James office.
    const james=scene.getTransformNodeByName('JamesRoot');
    if(james){james.scaling.setAll(1.55);james.position.set(-2.55,0,.95);james.rotation.y=0;}

    const cam=scene.activeCamera;
    if(cam && typeof cam.radius==='number'){
      cam.radius=17.8; cam.alpha=Math.PI*.23; cam.beta=.79; cam.target=new BABYLON.Vector3(-.15,.82,.05);
    }
    const gl=scene.getEffectLayerByName('glow');if(gl)gl.intensity=.28;

    function forceUI(){
      const t=document.getElementById('viewTitle');if(t)t.textContent='Office v14';
      const m=document.querySelector('.stage-toolbar .muted');if(m)m.textContent=' · 8 Glasbüros · sichtbares Glas · Frontsicht · Server · Archiv';
      const b=document.querySelector('.scene-badge');if(b)b.innerHTML='<span class="dot live"></span>OFFICE V14 · GLASS OFFICES';
    }
    forceUI();let ticks=0;const ui=setInterval(()=>{forceUI();if(++ticks>24)clearInterval(ui);},250);
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v14 · 8 eigene Glasbüros, alle Desks frontal ausgerichtet</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(boot()||tries>260)clearInterval(timer);},100);
})();