(() => {
  'use strict';

  const map=window.NEXUS_MAP;
  const sprites=window.NEXUS_SPRITES;
  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=true;

  const team=map.team.map((a,i)=>({...a,path:[],state:'Idle',facing:'down',step:0,wave:0,phase:i*.72}));
  let selected=team[0];
  let elapsed=0,last=performance.now();

  const solid=Array.from({length:map.rows},()=>Array(map.cols).fill(0));
  for(const [x,y,w,h] of map.collisions){
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
      if(xx>=0&&yy>=0&&xx<map.cols&&yy<map.rows)solid[yy][xx]=1;
    }
  }
  for(const a of team) solid[a.desk[1]][a.desk[0]]=0;
  solid[map.meetingSpot[1]][map.meetingSpot[0]]=0;

  const feed=document.getElementById('feed');

  function log(text){
    const d=document.createElement('div');d.className='feed-item';
    d.innerHTML='<time>'+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'</time><div>'+text+'</div>';
    feed.prepend(d);while(feed.children.length>3)feed.removeChild(feed.lastChild);
  }

  function initials(name){return name.slice(0,2).toUpperCase();}
  function teamUI(){
    const list=document.getElementById('teamList');list.innerHTML='';
    team.forEach(a=>{
      const b=document.createElement('button');
      b.className='team-card'+(a===selected?' active':'');
      b.innerHTML='<span class="avatar">'+initials(a.name)+'</span><span><strong>'+a.name+'</strong><small>'+a.role+'</small></span><i class="online"></i>';
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

  function key(x,y){return x+','+y;}
  function neighbors(x,y){
    const out=[];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy;
      if(nx>=0&&ny>=0&&nx<map.cols&&ny<map.rows&&!solid[ny][nx])out.push([nx,ny]);
    }
    return out;
  }

  function findPath(sx,sy,tx,ty){
    sx=Math.round(sx);sy=Math.round(sy);tx=Math.round(tx);ty=Math.round(ty);
    if(tx<0||ty<0||tx>=map.cols||ty>=map.rows||solid[ty][tx])return null;
    const q=[[sx,sy]],came=new Map(),seen=new Set([key(sx,sy)]);
    while(q.length){
      const [x,y]=q.shift();
      if(x===tx&&y===ty){
        const p=[[x,y]];let k=key(x,y);
        while(came.has(k)){const prev=came.get(k);p.push(prev);k=key(prev[0],prev[1]);}
        return p.reverse();
      }
      for(const n of neighbors(x,y)){
        const k=key(n[0],n[1]);
        if(!seen.has(k)){seen.add(k);came.set(k,[x,y]);q.push(n);}
      }
    }
    return null;
  }

  function nearestFree(tx,ty,maxR=3){
    tx=Math.max(0,Math.min(map.cols-1,tx));ty=Math.max(0,Math.min(map.rows-1,ty));
    if(!solid[ty][tx])return [tx,ty];
    for(let r=1;r<=maxR;r++){
      for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
        const x=tx+dx,y=ty+dy;
        if(x>=0&&y>=0&&x<map.cols&&y<map.rows&&!solid[y][x])return [x,y];
      }
    }
    return null;
  }

  function moveActor(a,tx,ty,label=''){
    const free=nearestFree(tx,ty);
    if(!free){log('Kein freier Zielpunkt für '+a.name);return;}
    const path=findPath(a.x,a.y,free[0],free[1]);
    if(!path||path.length<2){log('Kein freier Weg für '+a.name);return;}
    a.path=path.slice(1);a.state='Walk';a.step=0;
    if(label)log(a.name+' → '+label);
    updateUI();
  }

  function update(dt){
    elapsed+=dt;
    for(const a of team){
      if(a.wave>0){a.wave-=dt;if(a.wave<=0)a.state='Idle';}
      if(!a.path.length)continue;
      const [tx,ty]=a.path[0];
      const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);
      if(Math.abs(dx)>.02)a.facing=dx>0?'right':'left';
      else if(Math.abs(dy)>.02)a.facing=dy>0?'down':'up';
      const speed=2.45;
      if(d<speed*dt){
        a.x=tx;a.y=ty;a.path.shift();
        if(!a.path.length){a.state='Idle';log(a.name+' angekommen');}
      }else{
        a.x+=dx/d*speed*dt;a.y+=dy/d*speed*dt;a.step+=dt;
      }
    }
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    sprites.drawFloor(ctx,map);

    const low=map.objects.filter(o=>(o.layer||0)===0);
    const mid=map.objects.filter(o=>(o.layer||0)===1);
    const high=map.objects.filter(o=>(o.layer||0)>=2);

    low.forEach(o=>sprites.drawObject(ctx,o,map.tile));
    mid.forEach(o=>sprites.drawObject(ctx,o,map.tile));

    [...team].sort((a,b)=>a.y-b.y).forEach(a=>sprites.drawCharacter(ctx,a,map.tile,a===selected,elapsed));
    high.forEach(o=>sprites.drawObject(ctx,o,map.tile));
  }

  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    update(dt);render();
    if((now|0)%350<18)updateUI();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect();
    const x=Math.floor((e.clientX-r.left)/r.width*map.cols);
    const y=Math.floor((e.clientY-r.top)/r.height*map.rows);
    moveActor(selected,x,y,'Ziel ['+x+', '+y+']');
  });

  document.getElementById('idleBtn').onclick=()=>{
    selected.path=[];selected.state='Idle';selected.wave=0;log(selected.name+' → Idle');updateUI();
  };
  document.getElementById('waveBtn').onclick=()=>{
    selected.path=[];selected.state='Wave';selected.wave=1.5;log(selected.name+' → Wave');updateUI();
  };
  document.getElementById('deskBtn').onclick=()=>moveActor(selected,selected.desk[0],selected.desk[1],'Arbeitsplatz');
  document.getElementById('meetingBtn').onclick=()=>moveActor(selected,map.meetingSpot[0],map.meetingSpot[1],'Meeting');

  document.querySelectorAll('.tabs button').forEach((b,i)=>b.onclick=()=>{
    document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    if(i!==0)log(b.textContent+' · UI-Platzhalter für Backend-Projektion');
  });

  teamUI();updateUI();
  log('NEXUS Retro Office 2.2 gestartet');
  log('Map, Sprites und Logik jetzt getrennt');
  log('960×640 Soft-Retro Rendering aktiv');
  requestAnimationFrame(t=>{last=t;requestAnimationFrame(loop);});
})();
