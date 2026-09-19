(() => {
  'use strict';

  const map=window.NEXUS_MAP;
  const sprites=window.NEXUS_SPRITES;
  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=true;

  const team=map.team.map((a,i)=>({
    ...a,
    path:[],
    state:'Idle',
    facing:'down',
    step:0,
    wave:0,
    phase:i*.72
  }));

  let selected=team[0];
  let elapsed=0;
  let last=performance.now();

  const solid=Array.from({length:map.rows},()=>Array(map.cols).fill(0));
  for(const [x,y,w,h] of map.collisions){
    for(let yy=y;yy<y+h;yy++){
      for(let xx=x;xx<x+w;xx++){
        if(xx>=0&&yy>=0&&xx<map.cols&&yy<map.rows) solid[yy][xx]=1;
      }
    }
  }
  for(const a of team) solid[a.desk[1]][a.desk[0]]=0;
  solid[map.meetingSpot[1]][map.meetingSpot[0]]=0;

  function key(x,y){return x+','+y;}

  function neighbors(x,y){
    const out=[];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy;
      if(nx>=0&&ny>=0&&nx<map.cols&&ny<map.rows&&!solid[ny][nx]) out.push([nx,ny]);
    }
    return out;
  }

  function findPath(sx,sy,tx,ty){
    sx=Math.round(sx);sy=Math.round(sy);tx=Math.round(tx);ty=Math.round(ty);
    if(tx<0||ty<0||tx>=map.cols||ty>=map.rows||solid[ty][tx]) return null;

    const queue=[[sx,sy]];
    const came=new Map();
    const seen=new Set([key(sx,sy)]);

    while(queue.length){
      const [x,y]=queue.shift();

      if(x===tx&&y===ty){
        const path=[[x,y]];
        let k=key(x,y);
        while(came.has(k)){
          const prev=came.get(k);
          path.push(prev);
          k=key(prev[0],prev[1]);
        }
        return path.reverse();
      }

      for(const n of neighbors(x,y)){
        const k=key(n[0],n[1]);
        if(!seen.has(k)){
          seen.add(k);
          came.set(k,[x,y]);
          queue.push(n);
        }
      }
    }
    return null;
  }

  function nearestFree(tx,ty,maxR=4){
    tx=Math.max(0,Math.min(map.cols-1,tx));
    ty=Math.max(0,Math.min(map.rows-1,ty));
    if(!solid[ty][tx]) return [tx,ty];

    for(let r=1;r<=maxR;r++){
      for(let dy=-r;dy<=r;dy++){
        for(let dx=-r;dx<=r;dx++){
          if(Math.abs(dx)!==r&&Math.abs(dy)!==r) continue;
          const x=tx+dx,y=ty+dy;
          if(x>=0&&y>=0&&x<map.cols&&y<map.rows&&!solid[y][x]) return [x,y];
        }
      }
    }
    return null;
  }

  function moveActor(actor,tx,ty){
    const free=nearestFree(tx,ty);
    if(!free) return;

    const path=findPath(actor.x,actor.y,free[0],free[1]);
    if(!path||path.length<2) return;

    actor.path=path.slice(1);
    actor.state='Walk';
    actor.step=0;
  }

  function update(dt){
    elapsed+=dt;

    for(const actor of team){
      if(actor.wave>0){
        actor.wave-=dt;
        if(actor.wave<=0) actor.state='Idle';
      }

      if(!actor.path.length) continue;

      const [tx,ty]=actor.path[0];
      const dx=tx-actor.x;
      const dy=ty-actor.y;
      const distance=Math.hypot(dx,dy);

      if(Math.abs(dx)>.02) actor.facing=dx>0?'right':'left';
      else if(Math.abs(dy)>.02) actor.facing=dy>0?'down':'up';

      const speed=2.7;
      if(distance<speed*dt){
        actor.x=tx;
        actor.y=ty;
        actor.path.shift();
        if(!actor.path.length) actor.state='Idle';
      }else{
        actor.x+=dx/distance*speed*dt;
        actor.y+=dy/distance*speed*dt;
        actor.step+=dt;
      }
    }
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    sprites.drawFloor(ctx,map);

    const low=map.objects.filter(o=>(o.layer||0)===0);
    const mid=map.objects.filter(o=>(o.layer||0)===1);
    const high=map.objects.filter(o=>(o.layer||0)>=2);

    low.forEach(o=>sprites.drawObject(ctx,o,map.tile,elapsed));
    mid.forEach(o=>sprites.drawObject(ctx,o,map.tile,elapsed));

    [...team]
      .sort((a,b)=>a.y-b.y)
      .forEach(actor=>sprites.drawCharacter(ctx,actor,map.tile,false,elapsed));

    high.forEach(o=>sprites.drawObject(ctx,o,map.tile,elapsed));
  }

  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);
    last=now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('pointerdown',event=>{
    const rect=canvas.getBoundingClientRect();
    const tx=(event.clientX-rect.left)/rect.width*map.cols;
    const ty=(event.clientY-rect.top)/rect.height*map.rows;

    let hit=null;
    let hitDistance=.9;
    for(const actor of team){
      const d=Math.hypot(actor.x-tx,actor.y-ty);
      if(d<hitDistance){
        hit=actor;
        hitDistance=d;
      }
    }

    if(hit){
      selected=hit;
      return;
    }

    moveActor(selected,Math.floor(tx),Math.floor(ty));
  });

  requestAnimationFrame(now=>{
    last=now;
    requestAnimationFrame(loop);
  });
})();
