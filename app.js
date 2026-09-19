(() => {
  'use strict';

  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;

  const TILE=32, COLS=24, ROWS=16;
  const palette={
    floorA:'#dec994',floorB:'#d5bd83',floorLine:'#b69d68',floorSpark:'#ead9ac',
    wall:'#b9774e',wallMid:'#c8895d',wallHi:'#e7ae79',wallDark:'#704331',trim:'#543428',
    desk:'#bb5637',deskHi:'#e18151',deskMid:'#ce6944',deskDark:'#71342a',deskEdge:'#51261f',
    glass:'#7fc6d8',glassHi:'#b8eef4',glassDark:'#3c7890',
    screen:'#122a3e',screen2:'#285a73',screenGlow:'#3bd9e9',
    plant:'#2f7d55',plant2:'#449a62',plantHi:'#75ba79',pot:'#95523b',potHi:'#c47753',
    rug:'#1f6d68',rug2:'#318782',shadow:'rgba(42,31,34,.24)',
    chair:'#344758',chair2:'#486276',chairHi:'#7891a5',chairDark:'#23313f',
    outline:'#3d2b2d',paper:'#efe4c8',paper2:'#d8cbaa',metal:'#8997a2'
  };

  const team=[
    {id:'james',name:'James',role:'Leitung',skin:'#d8a47b',skinHi:'#efbf95',hair:'#37251f',hairHi:'#5a3b30',body:'#263a54',bodyHi:'#395477',accent:'#dce7ef',style:'short',x:4,y:11,desk:[4,11]},
    {id:'nora',name:'Nora',role:'Mail',skin:'#d9a481',skinHi:'#efbd9a',hair:'#503228',hairHi:'#765041',body:'#263f67',bodyHi:'#3a5d8c',accent:'#edf2f6',style:'bob',x:8,y:11,desk:[8,11]},
    {id:'kevin',name:'Kevin',role:'Recherche',skin:'#dcae84',skinHi:'#f2c49a',hair:'#9b5f32',hairHi:'#c98548',body:'#426852',bodyHi:'#5d886d',accent:'#deeadf',style:'spiky',x:13,y:11,desk:[13,11]},
    {id:'gisela',name:'Gisela',role:'Wissen & Archiv',skin:'#d3a17b',skinHi:'#e8b690',hair:'#bab8ad',hairHi:'#e1ddd2',body:'#67465a',bodyHi:'#845e74',accent:'#eee5dc',style:'graybob',x:18,y:11,desk:[18,11]},
    {id:'lina',name:'Lina',role:'Kalender',skin:'#c99070',skinHi:'#dfa889',hair:'#28211f',hairHi:'#493a35',body:'#744b3a',bodyHi:'#97684f',accent:'#efdfca',style:'long',x:5,y:6,desk:[5,6]},
    {id:'walter',name:'Walter',role:'Technik',skin:'#ca9874',skinHi:'#dfae8a',hair:'#b5b3ac',hairHi:'#dedbd2',body:'#3a4e59',bodyHi:'#58717c',accent:'#d7e4e8',style:'grayshort',x:11,y:6,desk:[11,6]},
    {id:'sarah',name:'Sarah',role:'Kontakte',skin:'#be8261',skinHi:'#d99d7d',hair:'#2b211f',hairHi:'#4a3833',body:'#65527a',bodyHi:'#826b99',accent:'#ece0f2',style:'bun',x:16,y:6,desk:[16,6]},
    {id:'finn',name:'Finn',role:'Follow-ups',skin:'#d5a07b',skinHi:'#ecb991',hair:'#59402e',hairHi:'#806047',body:'#4a5878',bodyHi:'#66779c',accent:'#e1e7ef',style:'short2',x:20,y:6,desk:[20,6]}
  ].map((a,i)=>({...a,path:[],state:'Idle',facing:'down',step:0,wave:0,phase:i*.7}));

  let selected=team[0];
  let elapsed=0,last=performance.now(),doorOpen=0;
  const feed=document.getElementById('feed');

  const solid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  const block=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&yy>=0&&xx<COLS&&yy<ROWS)solid[yy][xx]=1;};
  block(1,1,7,3);block(9,1,5,2);block(16,1,6,2);
  block(3,7,4,2);block(8,7,4,2);block(13,7,4,2);block(18,7,4,2);
  block(10,11,4,2);block(21,10,2,4);
  team.forEach(a=>solid[a.desk[1]][a.desk[0]]=0);
  const meetingSpot=[12,14];

  function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function tr(x,y,w,h,c){px(x*TILE,y*TILE,w*TILE,h*TILE,c);}
  function strokeBox(x,y,w,h,c,t=2){
    px(x,y,w,t,c);px(x,y+h-t,w,t,c);px(x,y,t,h,c);px(x+w-t,y,t,h,c);
  }

  function log(text){
    const d=document.createElement('div');d.className='feed-item';
    const now=new Date();
    d.innerHTML='<time>'+now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'</time><div>'+text+'</div>';
    feed.prepend(d);while(feed.children.length>3)feed.removeChild(feed.lastChild);
  }

  function initials(name){return name.slice(0,2).toUpperCase();}
  function teamUI(){
    const list=document.getElementById('teamList');list.innerHTML='';
    team.forEach(a=>{
      const b=document.createElement('button');b.className='team-card'+(a===selected?' active':'');
      b.innerHTML='<span class="avatar">'+initials(a.name)+'</span><span><strong>'+a.name+'</strong><small>'+a.role+'</small></span><i class="online"></i>';
      b.onclick=()=>{selected=a;updateUI();log(a.name+' ausgewählt');};list.appendChild(b);
    });
  }
  function updateUI(){
    teamUI();
    document.getElementById('selectedName').textContent=selected.name;
    document.getElementById('selectedRole').textContent=selected.role;
    document.getElementById('selectedState').textContent=selected.state;
    document.getElementById('selectedPos').textContent='['+Math.round(selected.x)+', '+Math.round(selected.y)+']';
  }

  function drawFloor(){
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const sx=x*TILE,sy=y*TILE;
      px(sx,sy,TILE,TILE,((x+y)&1)?palette.floorA:palette.floorB);
      px(sx,sy,TILE,2,palette.floorLine);
      px(sx,sy,2,TILE,palette.floorLine);
      px(sx+4,sy+4,TILE-8,1,'rgba(255,255,255,.10)');
      if((x*7+y*5)%11===0){px(sx+23,sy+20,2,2,palette.floorSpark);px(sx+25,sy+22,1,1,palette.floorSpark);}
    }
  }

  function drawWall(x,y,w,h){
    const X=x*TILE,Y=y*TILE,W=w*TILE,H=h*TILE;
    px(X,Y,W,H,palette.wallDark);
    px(X+3,Y+4,W-6,H-7,palette.wall);
    px(X+3,Y+4,W-6,8,palette.wallHi);
    px(X+3,Y+12,W-6,4,palette.wallMid);
    px(X,Y+H-7,W,7,palette.trim);
    for(let xx=X+12;xx<X+W;xx+=24) px(xx,Y+17,2,H-28,'rgba(102,56,42,.10)');
  }

  function drawMonitor(x,y,variant=0){
    px(x+2,y+4,38,28,palette.shadow);
    px(x,y,38,27,palette.outline);
    px(x+3,y+3,32,20,palette.screen);
    px(x+5,y+5,28,16,variant? '#244b66':palette.screen2);
    px(x+7,y+8,20,2,palette.screenGlow);
    px(x+7,y+13,15,2,'#79c9da');
    px(x+7,y+18,22,1,'#3d7890');
    px(x+17,y+27,4,9,palette.metal);
    px(x+10,y+35,18,3,palette.chairDark);
  }

  function drawDesk(x,y,w=4,h=2,variant=0){
    const X=x*TILE,Y=y*TILE,W=w*TILE,H=h*TILE;
    px(X+6,Y+15,W-4,H-8,palette.shadow);
    px(X,Y+8,W,H-8,palette.deskEdge);
    px(X+3,Y+4,W-6,H-12,palette.deskDark);
    px(X+4,Y+4,W-8,15,palette.deskHi);
    px(X+4,Y+19,W-8,H-29,palette.deskMid);
    px(X+5,Y+19,W-10,4,palette.desk);
    px(X+8,Y+H-11,10,8,palette.deskDark);
    px(X+W-18,Y+H-11,10,8,palette.deskDark);

    drawMonitor(X+25,Y+9,variant);
    drawMonitor(X+71,Y+10,1-variant);

    px(X+44,Y+42,38,6,palette.outline);
    px(X+46,Y+43,34,4,palette.paper2);
    for(let i=0;i<6;i++)px(X+49+i*5,Y+44,3,1,'#8a816f');
    px(X+88,Y+43,10,7,palette.outline);
    px(X+90,Y+44,6,5,'#d9d8d1');

    px(X+10,Y+38,18,12,palette.outline);
    px(X+12,Y+40,14,8,variant? '#d6d0b9':palette.paper);
    px(X+14,Y+42,9,1,'#aa9c7e');
  }

  function drawChair(cx,cy){
    const X=cx*TILE+4,Y=cy*TILE-1;
    px(X+4,Y+8,23,31,palette.shadow);
    px(X,Y,24,23,palette.chairDark);
    px(X+3,Y+3,18,17,palette.chair);
    px(X+5,Y+4,14,5,palette.chairHi);
    px(X+2,Y+22,20,8,palette.chair2);
    px(X-3,Y+17,5,10,palette.chairDark);px(X+22,Y+17,5,10,palette.chairDark);
    px(X+6,Y+29,4,13,palette.chairDark);px(X+14,Y+29,4,13,palette.chairDark);
    px(X+2,Y+40,9,3,palette.chairDark);px(X+13,Y+40,9,3,palette.chairDark);
  }

  function drawPlant(x,y,scale=1){
    const X=x*TILE,Y=y*TILE;
    const u=scale;
    px(X+9*u,Y+18*u,16*u,13*u,palette.outline);
    px(X+11*u,Y+20*u,12*u,10*u,palette.pot);
    px(X+12*u,Y+20*u,10*u,3*u,palette.potHi);
    px(X+16*u,Y+7*u,3*u,14*u,palette.plant);
    px(X+8*u,Y+9*u,10*u,6*u,palette.plant2);
    px(X+19*u,Y+4*u,9*u,8*u,palette.plant);
    px(X+12*u,Y+2*u,8*u,9*u,palette.plantHi);
    px(X+5*u,Y+13*u,10*u,6*u,palette.plant);
  }

  function drawMeetingRoom(){
    const X=TILE,Y=TILE,W=7*TILE,H=3*TILE;
    px(X,Y,W,H,'#c79a70');
    px(X+4,Y+4,W-8,H-8,'#d6b189');
    px(X+8,Y+20,W-16,H-31,palette.rug2);
    px(X+18,Y+34,W-36,25,palette.deskDark);
    px(X+22,Y+30,W-44,20,palette.deskHi);
    for(let i=0;i<5;i++) drawChair(2+i,3);

    // glass front
    px(X,H+Y-6,W,6,palette.glassDark);
    for(let i=0;i<=7;i++) px(X+i*TILE-1,Y+8,2,H-14,palette.glassDark);
    for(let i=0;i<7;i++) px(X+i*TILE+3,Y+10,TILE-6,2,'rgba(184,238,244,.55)');
    const doorX=X+3*TILE+10;
    px(doorX,Y+12,12,H-18,doorOpen>.5?palette.glassHi:palette.glass);
    px(doorX+8,Y+45,2,2,'#edf7f8');
  }

  function drawArchiveAndTech(){
    drawWall(9,1,5,2);drawWall(16,1,6,2);
    for(let i=0;i<4;i++){
      const X=(10+i)*TILE+3,Y=TILE+18;
      px(X,Y,22,35,'#5e4234');px(X+2,Y+2,18,31,'#815a43');
      px(X+4,Y+6,14,3,'#e0c06e');px(X+4,Y+15,14,3,'#b99654');px(X+4,Y+24,14,3,'#e0c06e');
    }
    for(let i=0;i<5;i++){
      const X=(17+i)*TILE+3,Y=TILE+12;
      px(X,Y,22,44,'#152638');strokeBox(X,Y,22,44,'#314a60',2);
      for(let j=0;j<4;j++){px(X+4,Y+6+j*9,12,3,(i+j)%2?palette.screenGlow:'#5e8eff');px(X+18,Y+6+j*9,2,2,'#5be29d');}
    }
  }

  function drawLogoTile(){
    const X=32,Y=11*TILE;
    px(X+4,Y+4,54,54,'#215a5b');strokeBox(X+4,Y+4,54,54,'#174446',3);
    px(X+11,Y+11,40,40,'#193c45');
    px(X+19,Y+18,4,25,palette.screenGlow);px(X+35,Y+18,4,25,palette.screenGlow);
    px(X+23,Y+22,12,4,palette.screenGlow);px(X+23,Y+35,12,4,palette.screenGlow);
  }

  function drawOffice(){
    drawFloor();
    drawWall(0,0,24,1);
    px(0,15*TILE,24*TILE,10,palette.trim);px(0,0,10,16*TILE,palette.trim);px(758,0,10,16*TILE,palette.trim);

    drawMeetingRoom();
    drawArchiveAndTech();

    drawDesk(3,7,4,2,0);drawDesk(8,7,4,2,1);drawDesk(13,7,4,2,0);drawDesk(18,7,4,2,1);
    drawChair(4,9);drawChair(9,9);drawChair(14,9);drawChair(19,9);

    // central conference table
    const X=10*TILE,Y=11*TILE;
    px(X+12,Y+20,4*TILE-10,2*TILE-14,palette.shadow);
    px(X+6,Y+8,4*TILE-12,38,palette.deskEdge);
    px(X+10,Y+6,4*TILE-20,32,'#c86d47');
    px(X+14,Y+9,4*TILE-28,7,'#e19563');
    px(X+34,Y+21,56,3,'#9b4a36');
    for(const p of [[10,13],[13,13],[9,12],[14,12]]) drawChair(p[0],p[1]);

    drawLogoTile();
    for(let y=10;y<14;y++)for(let x=21;x<23;x++)drawPlant(x,y,.9);
    [[7,6],[12,6],[17,6],[22,6],[8,13],[16,13]].forEach(p=>drawPlant(p[0],p[1],.85));

    [[1,5,5],[9,5,4],[15,5,6],[2,14,5],[17,14,4]].forEach(s=>{
      px(s[0]*TILE,s[1]*TILE+27,s[2]*TILE,3,'#2f9ca8');px(s[0]*TILE+4,s[1]*TILE+27,s[2]*TILE-8,1,'#77deea');
    });
  }

  function drawHair(a,x,y){
    const h=a.hair,hh=a.hairHi;
    if(a.style==='bob'||a.style==='graybob'){
      px(x+5,y+1,18,7,h);px(x+3,y+5,5,14,h);px(x+21,y+5,5,14,h);px(x+7,y,13,3,hh);px(x+4,y+14,4,7,h);px(x+21,y+14,4,7,h);
    }else if(a.style==='long'){
      px(x+5,y+1,18,7,h);px(x+3,y+5,5,20,h);px(x+21,y+5,5,20,h);px(x+7,y,12,3,hh);
    }else if(a.style==='bun'){
      px(x+7,y-4,12,8,h);px(x+5,y+1,18,7,h);px(x+3,y+6,5,11,h);px(x+21,y+6,5,11,h);px(x+9,y-3,7,2,hh);
    }else if(a.style==='spiky'){
      px(x+5,y+2,18,6,h);px(x+4,y,5,5,h);px(x+10,y-2,5,6,h);px(x+17,y,6,5,h);px(x+7,y+1,10,2,hh);
    }else{
      px(x+5,y+1,18,7,h);px(x+4,y+5,5,8,h);px(x+20,y+5,5,8,h);px(x+8,y,10,2,hh);
      if(a.style==='grayshort')px(x+18,y+2,5,2,hh);
    }
  }

  function drawCharacter(a){
    const baseX=Math.round(a.x*TILE+2);
    const baseY=Math.round(a.y*TILE-17);
    const walkFrame=a.state==='Walk'?(Math.floor(a.step*10)%2):0;
    const bob=a.state==='Walk'?walkFrame*2:Math.round(Math.sin(elapsed*2+a.phase));
    const x=baseX,y=baseY+bob;

    // soft pixel shadow
    px(x+7,y+50,22,5,'rgba(36,30,34,.20)');
    px(x+10,y+48,16,6,'rgba(36,30,34,.18)');

    // legs + shoes
    px(x+10,y+36,7,13,a.body);px(x+20,y+36+walkFrame*2,7,13,a.body);
    px(x+9,y+47,9,4,'#262832');px(x+19,y+47+walkFrame*2,10,4,'#262832');
    px(x+10,y+47,5,1,'#555d69');px(x+20,y+47+walkFrame*2,6,1,'#555d69');

    // torso outline and jacket
    px(x+7,y+21,23,18,palette.outline);
    px(x+9,y+22,19,16,a.body);
    px(x+10,y+22,17,4,a.bodyHi);
    px(x+16,y+23,5,12,a.accent);
    px(x+17,y+24,3,8,'#f8f5ee');
    px(x+14,y+23,3,11,a.body);px(x+21,y+23,3,11,a.body);

    // arms
    if(a.wave>0){
      px(x+4,y+22,7,17,palette.outline);px(x+6,y+23,5,14,a.body);
      px(x+2,y+9,7,18,palette.outline);px(x+4,y+10,5,15,a.skin);
      px(x+3,y+8,7,6,a.skinHi);
    }else{
      px(x+4,y+23,7,16,palette.outline);px(x+6,y+24,5,13,a.body);
      px(x+27,y+23,7,16,palette.outline);px(x+27,y+24,5,13,a.body);
      px(x+6,y+35,5,5,a.skin);px(x+27,y+35,5,5,a.skin);
    }

    // neck
    px(x+15,y+17,9,7,a.skin);

    // head outline + face
    px(x+5,y+4,23,17,palette.outline);
    px(x+7,y+5,19,15,a.skin);
    px(x+9,y+6,15,4,a.skinHi);
    drawHair(a,x,y);

    // ears / eyes / nose
    px(x+5,y+11,3,5,a.skin);px(x+26,y+11,3,5,a.skin);
    px(x+11,y+12,3,2,'#3b2b2c');px(x+21,y+12,3,2,'#3b2b2c');
    px(x+12,y+12,1,1,'#f5efe6');px(x+22,y+12,1,1,'#f5efe6');
    px(x+17,y+14,2,2,'#b87562');
    px(x+14,y+18,7,1,'#8b574f');

    // selection arrow
    if(a===selected){
      px(x+13,y-10,12,3,'#36d9e9');px(x+16,y-7,6,3,'#36d9e9');
      px(x+18,y-4,2,2,'#36d9e9');
    }

    // label
    ctx.font='bold 11px ui-monospace,monospace';ctx.textAlign='center';
    const label=a.name.toUpperCase(),tw=Math.ceil(ctx.measureText(label).width)+12;
    px(x+18-tw/2,y-24,tw,13,'rgba(7,12,19,.82)');
    strokeBox(x+18-tw/2,y-24,tw,13,'rgba(57,99,126,.65)',1);
    ctx.fillStyle='#e4fbff';ctx.fillText(label,x+18,y-14);
  }

  function key(x,y){return x+','+y;}
  function neighbors(x,y){
    const out=[];
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
      const nx=x+dx,ny=y+dy;
      if(nx>0&&ny>0&&nx<COLS-1&&ny<ROWS-1&&!solid[ny][nx])out.push([nx,ny]);
    });
    return out;
  }
  function findPath(sx,sy,tx,ty){
    sx=Math.round(sx);sy=Math.round(sy);tx=Math.round(tx);ty=Math.round(ty);
    if(tx<1||ty<1||tx>=COLS-1||ty>=ROWS-1||solid[ty][tx])return null;
    const q=[[sx,sy]],came=new Map(),seen=new Set([key(sx,sy)]);
    while(q.length){
      const [x,y]=q.shift();
      if(x===tx&&y===ty){
        const path=[[x,y]];let k=key(x,y);
        while(came.has(k)){const p=came.get(k);path.push(p);k=key(p[0],p[1]);}
        return path.reverse();
      }
      for(const n of neighbors(x,y)){
        const k=key(n[0],n[1]);
        if(!seen.has(k)){seen.add(k);came.set(k,[x,y]);q.push(n);}
      }
    }
    return null;
  }

  function moveActor(a,tx,ty,label=''){
    const p=findPath(a.x,a.y,tx,ty);
    if(!p||p.length<2){log('Kein freier Weg für '+a.name);return;}
    a.path=p.slice(1);a.state='Walk';a.step=0;
    if(label)log(a.name+' → '+label);updateUI();
  }

  function update(dt){
    elapsed+=dt;let nearDoor=false;
    for(const a of team){
      if(a.wave>0){a.wave-=dt;if(a.wave<=0)a.state='Idle';}
      if(!a.path.length)continue;
      const [tx,ty]=a.path[0],dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);
      if(Math.abs(dx)>.02)a.facing=dx>0?'right':'left';else if(Math.abs(dy)>.02)a.facing=dy>0?'down':'up';
      const speed=2.6;
      if(d<speed*dt){a.x=tx;a.y=ty;a.path.shift();if(!a.path.length){a.state='Idle';log(a.name+' angekommen');}}
      else{a.x+=dx/d*speed*dt;a.y+=dy/d*speed*dt;a.step+=dt;}
      if(Math.hypot(a.x-4,a.y-4)<2.2)nearDoor=true;
    }
    doorOpen+=((nearDoor?1:0)-doorOpen)*Math.min(1,dt*8);
  }

  function render(){drawOffice();[...team].sort((a,b)=>a.y-b.y).forEach(drawCharacter);}
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();
    if((now|0)%300<17)updateUI();requestAnimationFrame(loop);
  }

  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect();
    const x=Math.floor((e.clientX-r.left)/r.width*COLS);
    const y=Math.floor((e.clientY-r.top)/r.height*ROWS);
    moveActor(selected,x,y,'Ziel ['+x+', '+y+']');
  });

  document.getElementById('idleBtn').onclick=()=>{selected.path=[];selected.state='Idle';selected.wave=0;log(selected.name+' → Idle');updateUI();};
  document.getElementById('waveBtn').onclick=()=>{selected.path=[];selected.state='Wave';selected.wave=1.4;log(selected.name+' → Wave');updateUI();};
  document.getElementById('deskBtn').onclick=()=>moveActor(selected,selected.desk[0],selected.desk[1],'Arbeitsplatz');
  document.getElementById('meetingBtn').onclick=()=>moveActor(selected,meetingSpot[0],meetingSpot[1],'Meeting');

  document.querySelectorAll('.tabs button').forEach((b,i)=>b.onclick=()=>{
    document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    if(i!==0)log(b.textContent+' · UI-Platzhalter für Backend-Projektion');
  });

  teamUI();updateUI();
  log('NEXUS Retro Office 2.1 gestartet');
  log('HD-Pixel-Art aktiv · doppelte Renderauflösung');
  log('Pathfinding und 8 Charakter-Slots unverändert');
  requestAnimationFrame(t=>{last=t;requestAnimationFrame(loop);});
})();
