(() => {
  'use strict';

  const map=window.NEXUS_MAP;
  const sprites=window.NEXUS_SPRITES;
  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=true;

  const scenes=map.scenes||{
    main:{id:'main',objects:map.objects,collisions:map.collisions,portals:[]}
  };

  const team=map.team.map((a,i)=>({
    ...a,
    scene:'main',
    path:[],
    state:'Idle',
    facing:'down',
    step:0,
    wave:0,
    phase:i*.72,
    pendingPortal:null
  }));

  let currentScene='main';
  let selected=team[0];
  let elapsed=0;
  let last=performance.now();
  let transition=null;
  let fadeAlpha=0;

  const doors={mainMeetingDoor:0,meetingExitDoor:0};

  function buildSolid(scene){
    const solid=Array.from({length:map.rows},()=>Array(map.cols).fill(0));

    for(const [x,y,w,h] of scene.collisions||[]){
      for(let yy=y;yy<y+h;yy++){
        for(let xx=x;xx<x+w;xx++){
          if(xx>=0&&yy>=0&&xx<map.cols&&yy<map.rows) solid[yy][xx]=1;
        }
      }
    }

    if(scene.id==='main'){
      for(const a of team){
        if(a.desk&&solid[a.desk[1]]) solid[a.desk[1]][a.desk[0]]=0;
      }
    }

    for(const portal of scene.portals||[]){
      const [px,py]=portal.approach;
      if(py>=0&&py<map.rows&&px>=0&&px<map.cols) solid[py][px]=0;
    }

    return solid;
  }

  const solids=Object.fromEntries(
    Object.entries(scenes).map(([id,scene])=>[id,buildSolid(scene)])
  );

  function key(x,y){return x+','+y;}

  function neighbors(sceneId,x,y){
    const solid=solids[sceneId];
    const out=[];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy;
      if(nx>=0&&ny>=0&&nx<map.cols&&ny<map.rows&&!solid[ny][nx]) out.push([nx,ny]);
    }
    return out;
  }

  function findPath(sceneId,sx,sy,tx,ty){
    const solid=solids[sceneId];
    sx=Math.round(sx); sy=Math.round(sy);
    tx=Math.round(tx); ty=Math.round(ty);

    if(!solid||tx<0||ty<0||tx>=map.cols||ty>=map.rows||solid[ty][tx]) return null;

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

      for(const n of neighbors(sceneId,x,y)){
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

  function nearestFree(sceneId,tx,ty,maxR=4){
    const solid=solids[sceneId];
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
    if(transition||actor.scene!==currentScene) return;
    const free=nearestFree(actor.scene,tx,ty);
    if(!free) return;

    const path=findPath(actor.scene,actor.x,actor.y,free[0],free[1]);
    if(!path) return;

    actor.pendingPortal=null;
    if(path.length<2){
      actor.x=free[0];
      actor.y=free[1];
      actor.state='Idle';
      return;
    }

    actor.path=path.slice(1);
    actor.state='Walk';
    actor.step=0;
  }

  function scenePortal(sceneId,portalId){
    return (scenes[sceneId].portals||[]).find(p=>p.id===portalId)||null;
  }

  function counterpartPortal(portal){
    return (scenes[portal.target].portals||[]).find(p=>p.doorId===portal.targetDoorId)||null;
  }

  function beginPortal(actor,portal){
    if(transition) return;

    actor.pendingPortal=null;
    actor.path=[];
    actor.state='Portal';
    actor.facing=portal.sourceFacing||actor.facing;

    transition={
      actorId:actor.id,
      portal,
      from:actor.scene,
      to:portal.target,
      phase:'open',
      t:0,
      origin:[actor.x,actor.y]
    };
  }

  function requestPortal(actor,portal){
    if(transition||actor.scene!==currentScene) return;

    const [tx,ty]=portal.approach;
    const path=findPath(actor.scene,actor.x,actor.y,tx,ty);
    if(!path) return;

    actor.pendingPortal=portal.id;
    actor.facing=portal.sourceFacing||actor.facing;

    if(path.length<2){
      actor.x=tx;
      actor.y=ty;
      beginPortal(actor,portal);
      return;
    }

    actor.path=path.slice(1);
    actor.state='Walk';
    actor.step=0;
  }

  function updateActorMovement(actor,dt){
    if(actor.wave>0){
      actor.wave-=dt;
      if(actor.wave<=0&&actor.state!=='Portal') actor.state='Idle';
    }

    if(actor.state==='Portal'||!actor.path.length) return;

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

      if(!actor.path.length){
        actor.state='Idle';
        if(actor.pendingPortal&&!transition){
          const portal=scenePortal(actor.scene,actor.pendingPortal);
          if(portal) beginPortal(actor,portal);
        }
      }
    }else{
      actor.x+=dx/distance*speed*dt;
      actor.y+=dy/distance*speed*dt;
      actor.step+=dt;
    }
  }

  function updateTransition(dt){
    if(!transition) return;

    const actor=team.find(a=>a.id===transition.actorId);
    const portal=transition.portal;
    transition.t+=dt;

    if(transition.phase==='open'){
      const u=Math.min(1,transition.t/.38);
      doors[portal.doorId]=u*u*(3-2*u);
      fadeAlpha=0;

      if(u>=1){
        transition.phase='cross';
        transition.t=0;
        transition.origin=[actor.x,actor.y];
      }
      return;
    }

    if(transition.phase==='cross'){
      const u=Math.min(1,transition.t/.30);
      doors[portal.doorId]=1;
      actor.x=transition.origin[0]+portal.exitVector[0]*u*.82;
      actor.y=transition.origin[1]+portal.exitVector[1]*u*.82;
      actor.step+=dt;
      fadeAlpha=Math.max(0,(u-.48)/.52);

      if(u>=1){
        const targetPortal=counterpartPortal(portal);
        actor.scene=portal.target;
        currentScene=portal.target;
        selected=actor;

        const targetApproach=targetPortal?targetPortal.approach:[12,27];
        const targetVector=targetPortal?targetPortal.exitVector:[0,1];

        actor.x=targetApproach[0]+targetVector[0]*.78;
        actor.y=targetApproach[1]+targetVector[1]*.78;
        actor.facing=portal.targetFacing||actor.facing;

        doors[portal.doorId]=0;
        if(portal.targetDoorId) doors[portal.targetDoorId]=1;

        transition.targetPortal=targetPortal;
        transition.arrivalStart=[actor.x,actor.y];
        transition.arrivalEnd=[targetApproach[0],targetApproach[1]];
        transition.phase='arrive';
        transition.t=0;
        fadeAlpha=1;
      }
      return;
    }

    if(transition.phase==='arrive'){
      const u=Math.min(1,transition.t/.28);
      const ease=1-Math.pow(1-u,3);

      actor.x=transition.arrivalStart[0]+(transition.arrivalEnd[0]-transition.arrivalStart[0])*ease;
      actor.y=transition.arrivalStart[1]+(transition.arrivalEnd[1]-transition.arrivalStart[1])*ease;
      actor.step+=dt;
      fadeAlpha=1-u;

      if(u>=1){
        actor.x=transition.arrivalEnd[0];
        actor.y=transition.arrivalEnd[1];
        transition.phase='close';
        transition.t=0;
        fadeAlpha=0;
      }
      return;
    }

    if(transition.phase==='close'){
      const u=Math.min(1,transition.t/.38);
      if(portal.targetDoorId) doors[portal.targetDoorId]=1-(u*u*(3-2*u));

      if(u>=1){
        if(portal.targetDoorId) doors[portal.targetDoorId]=0;
        actor.state='Idle';
        actor.path=[];
        transition=null;
      }
    }
  }

  function update(dt){
    elapsed+=dt;
    for(const actor of team) updateActorMovement(actor,dt);
    updateTransition(dt);
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const scene=scenes[currentScene];
    const renderState={
      doors,
      currentScene,
      transition,
      occupants:{
        main:team.filter(a=>a.scene==='main').length,
        meeting:team.filter(a=>a.scene==='meeting').length
      }
    };

    sprites.drawFloor(ctx,map,scene);

    const low=scene.objects.filter(o=>(o.layer||0)===0);
    const mid=scene.objects.filter(o=>(o.layer||0)===1);
    const high=scene.objects.filter(o=>(o.layer||0)>=2);

    low.forEach(o=>sprites.drawObject(ctx,o,map.tile,elapsed,renderState));
    mid.forEach(o=>sprites.drawObject(ctx,o,map.tile,elapsed,renderState));

    [...team]
      .filter(actor=>actor.scene===currentScene)
      .sort((a,b)=>a.y-b.y)
      .forEach(actor=>sprites.drawCharacter(ctx,actor,map.tile,false,elapsed));

    high.forEach(o=>sprites.drawObject(ctx,o,map.tile,elapsed,renderState));

    if(fadeAlpha>0){
      ctx.fillStyle='rgba(6,10,14,'+Math.min(1,fadeAlpha)+')';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  }

  function pointInRect(x,y,rect){
    return x>=rect[0]&&y>=rect[1]&&x<=rect[0]+rect[2]&&y<=rect[1]+rect[3];
  }

  canvas.addEventListener('pointerdown',event=>{
    if(transition) return;

    const rect=canvas.getBoundingClientRect();
    const tx=(event.clientX-rect.left)/rect.width*map.cols;
    const ty=(event.clientY-rect.top)/rect.height*map.rows;
    const scene=scenes[currentScene];

    let hit=null;
    let hitDistance=.95;
    for(const actor of team){
      if(actor.scene!==currentScene) continue;
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

    const portal=(scene.portals||[]).find(p=>pointInRect(tx,ty,p.clickRect));
    if(portal){
      requestPortal(selected,portal);
      return;
    }

    moveActor(selected,Math.floor(tx),Math.floor(ty));
  });

  requestAnimationFrame(now=>{
    last=now;
    requestAnimationFrame(function loop(now2){
      const dt=Math.min(.05,(now2-last)/1000);
      last=now2;
      update(dt);
      render();
      requestAnimationFrame(loop);
    });
  });
})();