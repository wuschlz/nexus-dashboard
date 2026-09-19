(() => {
  const P={
    ink:'#3a2a2d',deep:'#1f2733',deep2:'#29384a',steel:'#687887',steelHi:'#a9b7c2',
    cyan:'#35d7e7',cyan2:'#87e7ef',glass:'#8bcdda',glass2:'#d8f4f7',glassDark:'#45768a',
    red:'#d95535',redHi:'#f07b4e',redDark:'#863b2c',cream:'#eee2bd',paper:'#f5ead0',
    plant:'#2e7d51',plant2:'#4aa065',plantHi:'#83c178',pot:'#9b5c43',potHi:'#cf8660',
    screen:'#112b40',screen2:'#255b78',gold:'#e7a54d',gold2:'#ffd386',
    wall:'#9d6948',wall2:'#c18a60',wallHi:'#e4b17c',floorShadow:'rgba(76,52,46,.18)',
    sofa:'#26384e',sofa2:'#425d78',sofaHi:'#6f89a2',white:'#f6f4ec'
  };

  function rr(ctx,x,y,w,h,r,fill,stroke=null,lw=1){
    const q=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function shadow(ctx,x,y,w,h,blur=14,alpha=.22){
    ctx.save();ctx.shadowColor='rgba(44,31,31,'+alpha+')';ctx.shadowBlur=blur;ctx.shadowOffsetY=6;
    rr(ctx,x,y,w,h,8,'rgba(38,28,28,.14)');ctx.restore();
  }
  function line(ctx,x1,y1,x2,y2,c,w=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();}
  function text(ctx,s,x,y,size=14,color='#fff',align='center',weight=700){
    ctx.font=weight+' '+size+'px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(s,x,y);
  }

  function drawFloor(ctx,map){
    const T=map.tile;
    for(let y=0;y<map.rows;y++)for(let x=0;x<map.cols;x++){
      const X=x*T,Y=y*T;
      ctx.fillStyle=((x+y)&1)?map.floor.base:map.floor.alt;ctx.fillRect(X,Y,T,T);
      line(ctx,X,Y+T,X+T,Y+T,map.floor.line,1);
      line(ctx,X+T,Y,X+T,Y+T,map.floor.line,1);
      ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(X+4,Y+4,T-8,1);
      if((x*5+y*7)%13===0){ctx.fillStyle=map.floor.highlight;ctx.fillRect(X+27,Y+25,2,2);}
    }
  }

  function topWall(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const g=ctx.createLinearGradient(0,Y,0,Y+H);
    g.addColorStop(0,P.wallHi);g.addColorStop(.28,P.wall2);g.addColorStop(1,P.wall);
    ctx.fillStyle=g;ctx.fillRect(X,Y,W,H);
    ctx.fillStyle='#56372b';ctx.fillRect(X,Y+H-7,W,7);
    ctx.fillStyle='#f5d79b';ctx.fillRect(X+16,Y+8,W-32,3);
    for(let x=X+80;x<X+W;x+=120){ctx.fillStyle='#ffd484';ctx.fillRect(x,Y+14,28,5);}
  }

  function glassOffice(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X,Y,W,H,18,.18);
    rr(ctx,X,Y,W,H,4,'#c8976e',P.ink,3);
    rr(ctx,X+8,Y+8,W-16,H-16,3,'#d6b189','#885c43',2);

    // back office furniture
    rr(ctx,X+18,Y+30,W-36,54,6,'#e7c99e','#9e7252',2);
    rr(ctx,X+28,Y+40,74,34,4,'#c95b3b','#7a3629',2);
    rr(ctx,X+W-106,Y+38,76,38,4,'#d9c7a2','#8b7259',2);
    rr(ctx,X+W/2-32,Y+18,64,34,3,P.screen,P.ink,2);
    line(ctx,X+W/2-24,Y+29,X+W/2+20,Y+29,P.cyan,3);
    line(ctx,X+W/2-24,Y+39,X+W/2+10,Y+39,'#6ba8bf',2);

    // glass front
    ctx.save();ctx.globalAlpha=.52;ctx.fillStyle=P.glass2;ctx.fillRect(X+8,Y+85,W-16,H-93);ctx.restore();
    ctx.strokeStyle=P.glassDark;ctx.lineWidth=3;ctx.strokeRect(X+8,Y+8,W-16,H-16);
    for(let k=1;k<4;k++) line(ctx,X+8+k*(W-16)/4,Y+86,X+8+k*(W-16)/4,Y+H-8,P.glassDark,2);
    line(ctx,X+10,Y+93,X+W-10,Y+93,P.glass2,2);

    // label plate
    rr(ctx,X+W/2-38,Y+H-29,76,18,9,'rgba(15,31,43,.78)','#3c697d',1);
    text(ctx,o.label||'OFFICE',X+W/2,Y+H-20,10,'#c9fbff');
  }

  function elevator(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X+10,Y+5,W-20,H-5,16,.15);
    rr(ctx,X+8,Y+4,W-16,H-8,5,'#52606b','#2b3540',3);
    rr(ctx,X+20,Y+12,W-40,H-28,3,'#c4a171','#7d654d',2);
    const dW=(W-52)/2;
    rr(ctx,X+26,Y+17,dW,H-38,2,'#7dc6d9','#3c7184',2);
    rr(ctx,X+26+dW,Y+17,dW,H-38,2,'#79bed0','#3c7184',2);
    ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#e4f9fb';ctx.fillRect(X+34,Y+25,7,H-54);ctx.restore();
    ctx.fillStyle=P.cyan;ctx.fillRect(X+W/2-22,Y+7,44,4);
  }

  function stairs(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X+3,Y,W-6,H,18,.16);
    rr(ctx,X,Y,W,H,4,'#1e4e69','#172b3a',3);
    const steps=12,sh=H/steps;
    for(let i=0;i<steps;i++){
      const y=Y+i*sh;
      ctx.fillStyle=i%2?'#285f7c':'#2f6b89';ctx.fillRect(X+10,y,W-20,sh-2);
      ctx.fillStyle='#4d8eaa';ctx.fillRect(X+12,y+1,W-24,2);
    }
    ctx.fillStyle=P.ink;ctx.fillRect(X+3,Y,7,H);ctx.fillRect(X+W-10,Y,7,H);
    ctx.fillStyle=P.cyan;ctx.fillRect(o.side==='left'?X+W-14:X+9,Y+8,3,H-16);
  }

  function monitor(ctx,x,y,s=1){
    shadow(ctx,x,y,46*s,38*s,8,.13);
    rr(ctx,x,y,46*s,30*s,4*s,P.ink);
    rr(ctx,x+4*s,y+4*s,38*s,22*s,2*s,P.screen2);
    line(ctx,x+8*s,y+10*s,x+34*s,y+10*s,P.cyan,2*s);
    line(ctx,x+8*s,y+16*s,x+28*s,y+16*s,'#8ecbd9',1.6*s);
    ctx.fillStyle='#63798a';ctx.fillRect(x+20*s,y+30*s,6*s,7*s);
    ctx.fillRect(x+13*s,y+36*s,20*s,3*s);
  }

  function desk(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X+5,Y+8,W-10,H-8,18,.18);
    rr(ctx,X,Y+10,W,H-10,7,P.redDark,P.ink,3);
    rr(ctx,X+3,Y+4,W-6,24,5,P.redHi,P.ink,2);
    rr(ctx,X+5,Y+18,W-10,H-24,4,P.red,P.redDark,2);
    monitor(ctx,X+22,Y+18,.85);
    if(W>130) monitor(ctx,X+W-68,Y+18,.85);
    rr(ctx,X+W/2-28,Y+48,56,8,3,P.cream,'#a58d69',1);
    for(let i=0;i<6;i++)line(ctx,X+W/2-22+i*8,Y+50,X+W/2-17+i*8,Y+50,'#9f8b70',1);
    rr(ctx,X+12,Y+H-9,15,12,2,P.redDark);
    rr(ctx,X+W-27,Y+H-9,15,12,2,P.redDark);
  }

  function techPod(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X,Y+10,W,H-10,16,.17);
    rr(ctx,X,Y+6,W,H-6,7,'#d5d0c0','#6f6a60',2);
    rr(ctx,X+4,Y+10,W-8,18,4,'#ece7d6','#a49d8e',1);
    for(let i=0;i<4;i++){
      const bx=X+18+i*(W-36)/4;
      monitor(ctx,bx,Y+24,.72);
      rr(ctx,bx+6,Y+58,44,8,2,'#c1b9a9');
    }
    for(let i=0;i<3;i++){
      ctx.fillStyle=P.plant;ctx.fillRect(X+90+i*95,Y+10,6,42);
      ctx.fillStyle=P.plantHi;ctx.fillRect(X+82+i*95,Y+15,14,7);
      ctx.fillStyle=P.plant2;ctx.fillRect(X+94+i*95,Y+22,14,8);
    }
  }

  function reception(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X+8,Y+8,W-16,H-8,22,.23);
    // U-shape
    rr(ctx,X,Y+8,W,34,7,P.redDark,P.ink,3);
    rr(ctx,X+4,Y+4,W-8,28,6,P.redHi,P.redDark,2);
    rr(ctx,X,Y+4,38,H-4,7,P.redDark,P.ink,3);
    rr(ctx,X+4,Y+8,30,H-12,5,P.red,P.redDark,2);
    rr(ctx,X+W-38,Y+4,38,H-4,7,P.redDark,P.ink,3);
    rr(ctx,X+W-34,Y+8,30,H-12,5,P.red,P.redDark,2);
    rr(ctx,X+40,Y+38,W-80,H-50,4,'#dad5c6','#7a756d',2);
    monitor(ctx,X+W/2-24,Y+44,.9);
    rr(ctx,X+W/2-42,Y+90,84,22,5,'#173247','#284d63',2);
    text(ctx,'N',X+W/2,Y+101,18,P.cyan, 'center',800);
  }

  function sofa(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X,Y+6,W,H-6,18,.17);
    rr(ctx,X,Y+5,W,H-5,10,P.sofa,'#172231',3);
    rr(ctx,X+6,Y+10,W-12,30,8,P.sofa2,'#26384e',2);
    rr(ctx,X+6,Y+44,W-12,H-52,6,'#304861','#1b2938',2);
    line(ctx,X+W/2,Y+47,X+W/2,Y+H-10,P.sofaHi,1.5);
    ctx.fillStyle=P.sofaHi;ctx.fillRect(X+10,Y+15,W-20,3);
  }

  function plant(ctx,o,T){
    const X=o.x*T,Y=o.y*T;
    shadow(ctx,X+8,Y+23,28,25,10,.13);
    rr(ctx,X+9,Y+24,26,24,5,P.pot,'#5e392d',2);
    rr(ctx,X+12,Y+25,20,6,4,P.potHi);
    const stems=[[20,25,18,2],[16,24,10,-2],[24,24,28,-4],[19,23,20,-10],[22,26,31,8]];
    stems.forEach(([x1,y1,x2,y2])=>line(ctx,X+x1,Y+y1,X+x2,Y+y2,P.plant,4));
    rr(ctx,X+8,Y+9,16,11,8,P.plant2);
    rr(ctx,X+18,Y+2,15,13,8,P.plantHi);
    rr(ctx,X+25,Y+10,14,12,8,P.plant);
    rr(ctx,X+4,Y+18,14,10,8,P.plant);
  }

  function logo(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    rr(ctx,X,Y,W,H,18,'#22384a','#334f64',3);
    ctx.save();ctx.globalAlpha=.2;ctx.fillStyle=P.cyan;ctx.fillRect(X+18,Y+8,W-36,H-16);ctx.restore();
    ctx.strokeStyle=P.cyan;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(X+W/2,Y+H/2,W*.33,H*.31,0,0,Math.PI*2);ctx.stroke();
    rr(ctx,X+W/2-34,Y+H/2-22,68,44,8,'#183143',P.cyan,4);
    text(ctx,'N',X+W/2,Y+H/2,24,'#c9fbff','center',800);
  }

  function drawHair(ctx,a,x,y){
    ctx.fillStyle=a.hair;
    if(a.style==='bob'||a.style==='graybob'){
      rr(ctx,x+10,y+2,30,17,9,a.hair);rr(ctx,x+7,y+10,9,25,5,a.hair);rr(ctx,x+35,y+10,9,25,5,a.hair);
      rr(ctx,x+14,y+2,20,6,4,a.hairHi);
    }else if(a.style==='long'){
      rr(ctx,x+10,y+2,30,17,9,a.hair);rr(ctx,x+7,y+10,9,34,5,a.hair);rr(ctx,x+35,y+10,9,34,5,a.hair);
      rr(ctx,x+14,y+2,20,6,4,a.hairHi);
    }else if(a.style==='bun'){
      rr(ctx,x+15,y-7,18,14,7,a.hair);rr(ctx,x+10,y+2,30,17,9,a.hair);rr(ctx,x+7,y+10,8,20,5,a.hair);rr(ctx,x+36,y+10,8,20,5,a.hair);
      rr(ctx,x+18,y-5,11,5,3,a.hairHi);
    }else if(a.style==='spiky'){
      rr(ctx,x+10,y+4,30,14,8,a.hair);rr(ctx,x+8,y+1,9,10,4,a.hair);rr(ctx,x+20,y-4,8,12,4,a.hair);rr(ctx,x+32,y+1,9,10,4,a.hair);
      rr(ctx,x+16,y+2,16,5,3,a.hairHi);
    }else{
      rr(ctx,x+10,y+3,30,15,8,a.hair);rr(ctx,x+7,y+10,8,17,4,a.hair);rr(ctx,x+36,y+10,8,17,4,a.hair);
      rr(ctx,x+16,y+3,17,5,3,a.hairHi);
    }
  }

  function character(ctx,a,T,selected,elapsed){
    const X=Math.round(a.x*T-6),Y=Math.round(a.y*T-26);
    const wf=a.state==='Walk'?(Math.floor(a.step*9)%2):0;
    const bob=a.state==='Walk'?wf*2:Math.sin(elapsed*2+a.phase)*1.2;
    const y=Y+bob;

    ctx.save();
    ctx.shadowColor='rgba(41,28,28,.20)';ctx.shadowBlur=7;ctx.fillStyle='rgba(40,31,31,.18)';
    ctx.beginPath();ctx.ellipse(X+26,y+61,18,5,0,0,Math.PI*2);ctx.fill();ctx.restore();

    // legs
    rr(ctx,X+15,y+43,10,18,3,a.body);rr(ctx,X+29,y+43+wf*2,10,18,3,a.body);
    rr(ctx,X+13,y+58,14,6,3,'#252832');rr(ctx,X+28,y+58+wf*2,14,6,3,'#252832');

    // torso
    rr(ctx,X+10,y+26,34,22,7,P.ink);
    rr(ctx,X+12,y+27,30,20,6,a.body);
    rr(ctx,X+14,y+28,26,7,5,a.bodyHi);
    rr(ctx,X+22,y+28,8,16,2,a.accent);
    ctx.fillStyle=P.white;ctx.fillRect(X+24,y+30,4,11);

    // arms
    if(a.wave>0){
      rr(ctx,X+5,y+28,10,19,5,a.body);
      rr(ctx,X+2,y+8,9,25,5,a.skin);
      rr(ctx,X+1,y+5,11,9,5,a.skinHi);
    }else{
      rr(ctx,X+5,y+29,10,19,5,a.body);rr(ctx,X+40,y+29,10,19,5,a.body);
      rr(ctx,X+6,y+43,8,7,4,a.skin);rr(ctx,X+41,y+43,8,7,4,a.skin);
    }

    // neck
    rr(ctx,X+21,y+20,12,9,4,a.skin);

    // head
    rr(ctx,X+8,y+3,38,24,10,P.ink);
    rr(ctx,X+10,y+5,34,21,9,a.skin);
    rr(ctx,X+15,y+6,24,6,5,a.skinHi);
    drawHair(ctx,a,X,y);

    // face
    rr(ctx,X+8,y+13,5,8,2,a.skin);rr(ctx,X+43,y+13,5,8,2,a.skin);
    ctx.fillStyle='#34282a';ctx.fillRect(X+17,y+16,4,3);ctx.fillRect(X+34,y+16,4,3);
    ctx.fillStyle='#fff4e8';ctx.fillRect(X+18,y+16,1,1);ctx.fillRect(X+35,y+16,1,1);
    ctx.fillStyle='#b87562';ctx.fillRect(X+27,y+19,3,2);
    rr(ctx,X+23,y+23,9,2,1,'#8c5a51');

    if(selected){
      ctx.fillStyle=P.cyan;ctx.beginPath();ctx.moveTo(X+27,y-14);ctx.lineTo(X+19,y-5);ctx.lineTo(X+35,y-5);ctx.closePath();ctx.fill();
      ctx.fillStyle=P.cyan2;ctx.beginPath();ctx.moveTo(X+27,y-11);ctx.lineTo(X+23,y-7);ctx.lineTo(X+31,y-7);ctx.closePath();ctx.fill();
    }

    const label=a.name.toUpperCase();
    text(ctx,label,X+27,y-24,11,'#e6fbff');
  }

  const drawers={topWall,glassOffice,elevator,stairs,desk,techPod,reception,sofa,plant,logo};

  window.NEXUS_SPRITES={
    drawFloor,
    drawObject(ctx,o,T){const fn=drawers[o.type];if(fn)fn(ctx,o,T);},
    drawCharacter:character
  };
})();
