(() => {
  'use strict';

  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;

  const TILE=16, COLS=24, ROWS=16;
  const palette={
    floorA:'#d9c58f', floorB:'#cfb97d', wall:'#bd8253', wallHi:'#e0a46c',
    trim:'#6f4936', desk:'#c45d38', deskHi:'#e8834e', deskDark:'#783629',
    glass:'#78bdd0', glassDark:'#447b91', screen:'#162d42', screenGlow:'#35d6e9',
    plant:'#378b63', plantHi:'#67bb7b', pot:'#9b5940', rug:'#1c6d68',
    shadow:'rgba(31,28,34,.28)', chair:'#334659', chairHi:'#60788d',
    outline:'#3c2c2e'
  };

  const team=[
    {id:'james',name:'James',role:'Leitung',skin:'#d7a476',hair:'#3a271f',body:'#24364e',accent:'#d9e6f2',x:4,y:11,desk:[4,11]},
    {id:'nora',name:'Nora',role:'Mail',skin:'#d8a27f',hair:'#4a3028',body:'#253d64',accent:'#e7edf4',x:8,y:11,desk:[8,11]},
    {id:'kevin',name:'Kevin',role:'Recherche',skin:'#d9ad83',hair:'#aa6a37',body:'#446b56',accent:'#dcebdc',x:13,y:11,desk:[13,11]},
    {id:'gisela',name:'Gisela',role:'Wissen & Archiv',skin:'#d0a079',hair:'#c8c4b8',body:'#6b445a',accent:'#eee4dd',x:18,y:11,desk:[18,11]},
    {id:'lina',name:'Lina',role:'Kalender',skin:'#c99070',hair:'#27211f',body:'#744d3b',accent:'#f0dfc9',x:5,y:6,desk:[5,6]},
    {id:'walter',name:'Walter',role:'Technik',skin:'#c99672',hair:'#b8b7b0',body:'#3c4e58',accent:'#d3e3e9',x:11,y:6,desk:[11,6]},
    {id:'sarah',name:'Sarah',role:'Kontakte',skin:'#bd805f',hair:'#2c211f',body:'#62517a',accent:'#eadff3',x:16,y:6,desk:[16,6]},
    {id:'finn',name:'Finn',role:'Follow-ups',skin:'#d5a17d',hair:'#59402e',body:'#495879',accent:'#e0e6f1',x:20,y:6,desk:[20,6]}
  ].map((a,i)=>({...a,tx:a.x,ty:a.y,path:[],state:'Idle',facing:'down',step:0,wave:0,phase:i*.7}));

  let selected=team[0];
  let elapsed=0, last=performance.now(), doorOpen=0;
  const feed=document.getElementById('feed');

  // 0 walkable, 1 solid.
  const solid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  const block=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&yy>=0&&xx<COLS&&yy<ROWS)solid[yy][xx]=1;};

  // Outer walls are visual only along the top/edges; furniture forms obstacles.
  block(1,1,7,3);             // meeting counter / upper office
  block(9,1,5,2);             // archive/storage
  block(16,1,6,2);            // server / contacts bank
  block(3,7,4,2); block(8,7,4,2); block(13,7,4,2); block(18,7,4,2); // desks
  block(10,11,4,2);           // central meeting table
  block(21,10,2,4);           // plant bank

  // Clear standing positions in front of desks.
  team.forEach(a=>solid[a.desk[1]][a.desk[0]]=0);

  const meetingSpot=[12,14];

  function log(text){
    const d=document.createElement('div');
    d.className='feed-item';
    const now=new Date();
    d.innerHTML='<time>'+now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'</time><div>'+text+'</div>';
    feed.prepend(d);
    while(feed.children.length>3) feed.removeChild(feed.lastChild);
  }

  function teamUI(){
    const list=document.getElementById('teamList');
    list.innerHTML='';
    team.forEach(a=>{
      const b=document.createElement('button');
      b.className='team-card'+(a===selected?' active':'');
      b.innerHTML='<span class="avatar">▦</span><span><strong>'+a.name+'</strong><small>'+a.role+'</small></span><i class="online"></i>';
      b.onclick=()=>{selected=a;updateUI();log(a.name+' ausgewählt');};
      list.appendChild(b);
    });
  }

  function updateUI(){
    teamUI();
    document.getElementById('selectedName').textContent=selected.name;
    document.getElementById('selectedRole').textContent=selected.role;
    document.getElementById('selectedState').textContent=selected.state;
    document.getElementById('selectedPos').textContent='['+Math.round(selected.x)+', '+Math.round(selected.y)+']';
  }

  function tileFloor(){
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      ctx.fillStyle=((x+y)&1)?palette.floorA:palette.floorB;
      ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
      ctx.fillStyle='rgba(255,255,255,.08)';
      ctx.fillRect(x*TILE+2,y*TILE+2,TILE-4,1);
    }
  }

  function pxRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function tileRect(x,y,w,h,c){pxRect(x*TILE,y*TILE,w*TILE,h*TILE,c);}

  function drawWall(x,y,w,h){
    tileRect(x,y,w,h,palette.wall);
    pxRect(x*TILE,y*TILE,w*TILE,4,palette.wallHi);
    pxRect(x*TILE,(y+h)*TILE-4,w*TILE,4,palette.trim);
  }

  function drawDesk(x,y,w=4,h=2){
    pxRect(x*TILE+2,y*TILE+7,w*TILE-4,h*TILE-9,palette.shadow);
    tileRect(x,y,w,h,palette.deskDark);
    pxRect(x*TILE+2,y*TILE+2,w*TILE-4,9,palette.deskHi);
    pxRect(x*TILE+4,y*TILE+11,w*TILE-8,h*TILE-15,palette.desk);
    // monitor
    pxRect((x+1)*TILE+2,y*TILE+4,18,11,palette.screen);
    pxRect((x+1)*TILE+4,y*TILE+6,14,7,'#24526b');
    pxRect((x+1)*TILE+5,y*TILE+7,9,1,palette.screenGlow);
    // keyboard
    pxRect((x+2)*TILE+7,(y+1)*TILE+1,18,3,'#e7d9b8');
  }

  function drawChair(cx,cy){
    const x=cx*TILE+3,y=cy*TILE+1;
    pxRect(x+2,y+2,10,11,palette.shadow);
    pxRect(x,y,10,8,palette.chair);
    pxRect(x+2,y+1,6,3,palette.chairHi);
    pxRect(x+2,y+8,2,6,palette.chair);
    pxRect(x+7,y+8,2,6,palette.chair);
  }

  function drawPlant(x,y){
    pxRect(x*TILE+5,y*TILE+9,7,6,palette.pot);
    pxRect(x*TILE+7,y*TILE+2,3,9,palette.plant);
    pxRect(x*TILE+3,y*TILE+3,5,3,palette.plantHi);
    pxRect(x*TILE+9,y*TILE+1,4,5,palette.plant);
  }

  function drawOffice(){
    tileFloor();

    // top border / walls
    drawWall(0,0,24,1);
    pxRect(0,15*TILE,24*TILE,5,palette.trim);
    pxRect(0,0,5,16*TILE,palette.trim);
    pxRect(379,0,5,16*TILE,palette.trim);

    // Meeting room upper left: glass frontage.
    tileRect(1,1,7,3,'#c99a6c');
    for(let x=1;x<8;x++){
      pxRect(x*TILE,4*TILE-2,TILE,2,palette.glassDark);
      if(x!==4) pxRect(x*TILE+1,1*TILE+3,1,3*TILE-5,palette.glass);
    }
    pxRect(4*TILE-2,1*TILE+3,4,3*TILE-5,doorOpen>.5?'#8ddbea':palette.glassDark);
    pxRect(2*TILE,2*TILE+3,5*TILE,10,palette.deskDark);
    pxRect(2*TILE+2,2*TILE+2,5*TILE-4,7,palette.deskHi);
    pxRect(3*TILE,1*TILE+8,3*TILE,5,palette.rug);

    // Archive / tech upper banks.
    drawWall(9,1,5,2); drawWall(16,1,6,2);
    for(let x=10;x<14;x++){pxRect(x*TILE+2,1*TILE+7,10,16,'#76533d');pxRect(x*TILE+4,1*TILE+10,6,2,'#e3c16e');}
    for(let x=17;x<22;x++){pxRect(x*TILE+2,1*TILE+5,10,20,palette.screen);pxRect(x*TILE+4,1*TILE+8,6,2,(x%2)?palette.screenGlow:'#5f9aff');}

    // Four main desks.
    drawDesk(3,7);drawDesk(8,7);drawDesk(13,7);drawDesk(18,7);
    drawChair(4,9);drawChair(9,9);drawChair(14,9);drawChair(19,9);

    // Central meeting table.
    pxRect(10*TILE+4,11*TILE+5,4*TILE-8,2*TILE-10,palette.shadow);
    pxRect(10*TILE+2,11*TILE+2,4*TILE-4,18,palette.deskDark);
    pxRect(10*TILE+4,11*TILE+4,4*TILE-8,13,'#d47a4b');
    for(const p of [[10,13],[13,13],[9,12],[14,12]]) drawChair(p[0],p[1]);

    // Floor emblem.
    pxRect(1*TILE+3,11*TILE+3,30,30,'#276b6b');
    pxRect(1*TILE+8,11*TILE+8,20,20,'#1e3a43');
    pxRect(1*TILE+12,11*TILE+13,12,3,palette.screenGlow);
    pxRect(1*TILE+12,11*TILE+20,12,3,palette.screenGlow);

    // Plant bank + scattered greenery.
    for(let y=10;y<14;y++)for(let x=21;x<23;x++) drawPlant(x,y);
    [[7,6],[12,6],[17,6],[22,6],[8,13],[16,13]].forEach(p=>drawPlant(p[0],p[1]));

    // tiny cyan floor strips
    [[1,5,5],[9,5,4],[15,5,6],[2,14,5],[17,14,4]].forEach(s=>pxRect(s[0]*TILE,s[1]*TILE+14,s[2]*TILE,2,'#45cfe0'));
  }

  function drawCharacter(a){
    const sx=Math.round(a.x*TILE+2), sy=Math.round(a.y*TILE-7);
    const bob=a.state==='Walk'?((Math.floor(a.step*8)%2)?1:0):Math.sin(elapsed*2+a.phase)*.25;
    const y=Math.round(sy+bob);
    const flip=a.facing==='left';

    // shadow
    pxRect(sx+2,y+22,9,3,'rgba(39,35,37,.28)');

    // legs
    const walk=(a.state==='Walk' && Math.floor(a.step*8)%2)?2:0;
    pxRect(sx+4,y+16,3,6,a.body);
    pxRect(sx+8,y+16+walk,3,6,a.body);
    pxRect(sx+3,y+21,4,2,'#28272e');
    pxRect(sx+8,y+21+walk,4,2,'#28272e');

    // body + shirt/accent
    pxRect(sx+3,y+9,9,9,a.body);
    pxRect(sx+6,y+10,3,6,a.accent);

    // arms
    if(a.wave>0){
      pxRect(sx+1,y+8,3,8,a.skin);
      pxRect(sx,y+4,3,6,a.skin);
    }else{
      pxRect(sx+1,y+10,3,7,a.body);
      pxRect(sx+11,y+10,3,7,a.body);
      pxRect(sx+1,y+16,3,2,a.skin);pxRect(sx+11,y+16,3,2,a.skin);
    }

    // head
    pxRect(sx+4,y+2,8,8,a.skin);
    pxRect(sx+4,y+1,8,3,a.hair);
    pxRect(flip?sx+4:sx+10,y+3,2,5,a.hair);
    pxRect(sx+6,y+5,1,1,'#2d2526');
    pxRect(sx+10,y+5,1,1,'#2d2526');

    // selection marker
    if(a===selected){
      pxRect(sx+4,y-4,8,2,'#35d6e9');
      pxRect(sx+6,y-6,4,2,'#35d6e9');
    }

    // tiny name tag
    ctx.font='6px monospace';
    ctx.textAlign='center';
    ctx.fillStyle='rgba(8,13,21,.78)';
    const tw=Math.max(20,ctx.measureText(a.name.toUpperCase()).width+6);
    pxRect(sx+8-tw/2,y-14,tw,7,'rgba(8,13,21,.78)');
    ctx.fillStyle='#dffcff';
    ctx.fillText(a.name.toUpperCase(),sx+8,y-9);
  }

  function key(x,y){return x+','+y}
  function neighbors(x,y){
    const out=[];
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
      const nx=x+dx,ny=y+dy;
      if(nx>0&&ny>0&&nx<COLS-1&&ny<ROWS-1&&!solid[ny][nx]) out.push([nx,ny]);
    });
    return out;
  }

  function findPath(sx,sy,tx,ty){
    sx=Math.round(sx);sy=Math.round(sy);tx=Math.round(tx);ty=Math.round(ty);
    if(tx<1||ty<1||tx>=COLS-1||ty>=ROWS-1||solid[ty][tx]) return null;
    const q=[[sx,sy]], came=new Map(), seen=new Set([key(sx,sy)]);
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
    if(label) log(a.name+' → '+label);
    updateUI();
  }

  function update(dt){
    elapsed+=dt;
    let nearDoor=false;
    for(const a of team){
      if(a.wave>0){a.wave-=dt;if(a.wave<=0)a.state='Idle';}
      if(!a.path.length) continue;
      const [tx,ty]=a.path[0];
      const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);
      if(Math.abs(dx)>.02) a.facing=dx>0?'right':'left';
      else if(Math.abs(dy)>.02) a.facing=dy>0?'down':'up';
      const speed=2.6;
      if(d<speed*dt){a.x=tx;a.y=ty;a.path.shift();if(!a.path.length){a.state='Idle';log(a.name+' angekommen');}}
      else{a.x+=dx/d*speed*dt;a.y+=dy/d*speed*dt;a.step+=dt;}
      if(Math.hypot(a.x-4,a.y-4)<2.2) nearDoor=true;
    }
    doorOpen+=((nearDoor?1:0)-doorOpen)*Math.min(1,dt*8);
  }

  function render(){
    drawOffice();
    [...team].sort((a,b)=>a.y-b.y).forEach(drawCharacter);
  }

  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    update(dt);render();
    if((now|0)%300<17) updateUI();
    requestAnimationFrame(loop);
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
    if(i!==0) log(b.textContent+' · UI-Platzhalter für Backend-Projektion');
  });

  teamUI();updateUI();
  log('NEXUS Retro Office 2.0 gestartet');
  log('8 Charakter-Slots aktiv · eigener Pixelstil');
  log('3D-System vollständig entfernt');
  requestAnimationFrame(t=>{last=t;requestAnimationFrame(loop);});
})();
