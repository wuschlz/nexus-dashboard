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

    scene.clearColor = new BABYLON.Color4(.66,.77,.86,1);
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
      const left=box(name+'DoorL',panelW,H-.20,.045,doorX-panelW/2,H/2,z+.025,glassMat,root);
      const right=box(name+'DoorR',panelW,H-.20,.045,doorX+panelW/2,H/2,z+.025,glassMat,root);
      box(name+'HandleL',.035,.34,.055,panelW/2-.07,0,.035,dark,left);
      box(name+'HandleR',.035,.34,.055,-panelW/2+.07,0,.035,dark,right);
      autoDoors.push({
        name, x:doorX, z,
        left, right,
        closedLeft:doorX-panelW/2,
        closedRight:doorX+panelW/2,
        openLeft:doorX-panelW*1.52,
        openRight:doorX+panelW*1.52,
        openness:0
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

    function desk(name,x,z,rot=0,exec=false,signSide=1){
      const g=new BABYLON.TransformNode('v17Desk'+name,scene);g.parent=root;g.position.set(x,0,z);g.rotation.y=rot;
      const W=exec?2.72:2.28,D=exec?1.05:.94,RW=exec?.86:.74,RD=exec?1.22:1.10,top=exec?woodExec:wood;
      box('v17DeskBase'+name,W-.12,.62,.38,0,.33,-D/2+.20,dark2,g);
      box('v17DeskTop'+name,W,.10,D,0,.78,0,top,g);box('v17DeskTrim'+name,W,.022,D,0,.842,0,trim,g);
      box('v17DeskReturn'+name,RW,.10,RD,W/2-RW/2,.78,D/2+RD/2-.06,top,g);
      box('v17DeskReturnTrim'+name,RW,.022,RD,W/2-RW/2,.842,D/2+RD/2-.06,trim,g);
      box('v17DeskCab'+name,.44,.61,.66,-W/2+.25,.34,-.04,dark2,g);
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

    const aktenX=-10.09;
    for(let i=0;i<5;i++){
      const z=-2.35+i*.72;
      box('v17AktenCab'+i,.58,1.70,.66,aktenX,.85,z,cabinet,root,Math.PI/2);
      [.35,.76,1.17].forEach((y,j)=>box('v17AktenDrawer'+i+j,.50,.31,.035,aktenX+.34,y,z,cabinetDark,root,Math.PI/2));
    }
    const lineZ=1.15;
    const giselaDesk=desk('Gisela',-7.72,lineZ,Math.PI,false,-1);
    const noraDesk=desk('Nora',-4.65,lineZ,Math.PI,false,-1);
    const kevinDesk=desk('Kevin',-.95,lineZ,Math.PI,false,-1);
    const linaDesk=desk('Lina',2.75,lineZ,Math.PI,false,-1);
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

    [-7.8,-2.0,3.0,7.8].forEach((x,i)=>{const p=new BABYLON.PointLight('v17Accent'+i,new BABYLON.Vector3(x,3.05,.20),scene);p.diffuse=C('#8cc7ff');p.intensity=.30;p.range=7.5;});
    const cam=scene.activeCamera;
    if(cam && typeof cam.radius==='number'){
      cam.radius=18.5;
      cam.alpha=Math.PI*.225;
      cam.beta=.77;
      cam.target=new BABYLON.Vector3(-.05,.78,-.12);
    }
    const gl=scene.getEffectLayerByName('glow'); if(gl) gl.intensity=.24;

    scene.onBeforeRenderObservable.add(()=>{
      if(!autoDoors.length) return;
      const dt=Math.min(.05,(scene.getEngine().getDeltaTime()||16)/1000);
      const actors=[james,...scene.transformNodes.filter(t=>t!==james && t.metadata && t.metadata.nexusActor===true)];
      autoDoors.forEach(d=>{
        let nearest=Infinity;
        actors.forEach(actor=>{
          if(!actor || !actor.position) return;
          const dist=Math.hypot(actor.position.x-d.x,actor.position.z-d.z);
          if(dist<nearest) nearest=dist;
        });
        const shouldOpen=nearest<1.55;
        const target=shouldOpen?1:0;
        const speed=dt*4.8;
        d.openness += (target-d.openness)*Math.min(1,speed);
        const smooth=d.openness*d.openness*(3-2*d.openness);
        d.left.position.x=d.closedLeft+(d.openLeft-d.closedLeft)*smooth;
        d.right.position.x=d.closedRight+(d.openRight-d.closedRight)*smooth;
      });
    });

    function ui(){
      const t=document.getElementById('viewTitle'); if(t)t.textContent='Office v17';
      const m=document.querySelector('.stage-toolbar .muted'); if(m)m.textContent=' · dunkles Holz · Petronas-Teppich · Auto-Glasschiebetüren · Arbeitsplätze neu ausgerichtet';
      const b=document.querySelector('.scene-badge'); if(b)b.innerHTML='<span class="dot live"></span>OFFICE V17 · AUTO DOORS';
    }
    ui(); let ticks=0; const uiTimer=setInterval(()=>{ui(); if(++ticks>24)clearInterval(uiTimer);},250);
    const feed=document.getElementById('activityFeed');
    if(feed){const item=document.createElement('div');item.className='activity-item';item.innerHTML='<div class="activity-time">Preview</div><div class="activity-text">Office v17 · kompletter Möbel-Neuaufbau · feste Orientierung · Glasfronten · keine Pflanzen</div>';feed.prepend(item);while(feed.children.length>3)feed.removeChild(feed.lastChild);}
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++; if(boot()||tries>260)clearInterval(timer);},100);
})();