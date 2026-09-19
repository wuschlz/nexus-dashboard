(() => {
  const P={
    ink:'#2f2830',navy:'#19283a',navy2:'#253b51',steel:'#627282',steelHi:'#9eacb9',
    cyan:'#35d6e9',cyan2:'#8eeaf2',glass:'#7fc6d8',glass2:'#d8f4f7',glassDark:'#406f82',
    red:'#db5634',red2:'#ef7650',redDark:'#823929',cream:'#eee2be',paper:'#f7edd3',
    plant:'#2f7d51',plant2:'#4aa066',plantHi:'#86c17c',pot:'#9a5a42',potHi:'#cf8460',
    screen:'#10283b',screen2:'#235a77',wall:'#9e6a49',wall2:'#c48a61',wallHi:'#e3b37f',
    sofa:'#26394f',sofa2:'#425f7a',sofaHi:'#6f89a4',gold:'#ffc96f',white:'#f8f4ec'
  };

  function rr(ctx,x,y,w,h,r,fill,stroke=null,lw=1){
    const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);
    if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
  }
  function line(ctx,x1,y1,x2,y2,c,w=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();}
  function shadow(ctx,x,y,w,h,b=14,a=.22){ctx.save();ctx.shadowColor='rgba(46,32,31,'+a+')';ctx.shadowBlur=b;ctx.shadowOffsetY=6;rr(ctx,x,y,w,h,8,'rgba(40,30,30,.12)');ctx.restore();}
  function txt(ctx,s,x,y,size=12,c='#fff',align='center',weight=700){ctx.font=weight+' '+size+'px ui-monospace,monospace';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=c;ctx.fillText(s,x,y);}
  function glow(ctx,x,y,r,c,a=.25){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c.replace(')',','+a+')').replace('rgb','rgba'));g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}

  function drawFloor(ctx,map){
    const T=map.tile;
    for(let y=0;y<map.rows;y++)for(let x=0;x<map.cols;x++){
      const X=x*T,Y=y*T;ctx.fillStyle=((x+y)&1)?map.floor.base:map.floor.alt;ctx.fillRect(X,Y,T,T);
      line(ctx,X,Y+T,X+T,Y+T,map.floor.line,1);line(ctx,X+T,Y,X+T,Y+T,map.floor.line,1);
      ctx.fillStyle='rgba(255,255,255,.11)';ctx.fillRect(X+4,Y+4,T-8,1);
      if((x*7+y*5)%17===0){ctx.fillStyle=map.floor.highlight;ctx.fillRect(X+23,Y+20,2,2);}
    }
  }

  function frame(ctx,o,T){
    const W=o.w*T,H=o.h*T;
    ctx.fillStyle='#0d1118';ctx.fillRect(0,0,W,18);ctx.fillRect(0,H-18,W,18);ctx.fillRect(0,0,18,H);ctx.fillRect(W-18,0,18,H);
    ctx.fillStyle='#2a3040';ctx.fillRect(18,18,W-36,7);ctx.fillRect(18,H-25,W-36,7);
    ctx.fillStyle='#755039';ctx.fillRect(18,25,W-36,10);
    for(let x=60;x<W-60;x+=110){ctx.fillStyle=P.gold;ctx.fillRect(x,28,26,4);}
  }

  function brandWall(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const g=ctx.createLinearGradient(X,Y,X,Y+H);g.addColorStop(0,'#263447');g.addColorStop(1,'#151f2c');rr(ctx,X,Y,W,H,5,g,P.ink,3);
    rr(ctx,X+W/2-118,Y+23,236,60,4,'#1d2938','#39495b',2);
    rr(ctx,X+W/2-101,Y+35,36,36,7,'#1d3b50',P.cyan,3);txt(ctx,'N',X+W/2-83,Y+53,20,'#d9fbff','center',800);
    txt(ctx,'N E X U S',X+W/2+24,Y+51,22,'#e7f5fb','center',700);
    line(ctx,X+W/2+115,Y+33,X+W/2+115,Y+70,'#536477',2);
    txt(ctx,'PEOPLE',X+W/2+147,Y+41,8,'#c7d1dc','left',600);txt(ctx,'IDEAS',X+W/2+147,Y+52,8,'#c7d1dc','left',600);txt(ctx,'SYSTEMS',X+W/2+147,Y+63,8,'#c7d1dc','left',600);
    for(const lx of [X+86,X+W-118]){ctx.save();ctx.shadowColor=P.gold;ctx.shadowBlur=12;ctx.fillStyle=P.gold;ctx.fillRect(lx,Y+9,22,4);ctx.restore();}
  }

  function topBackWall(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // Flat architectural back wall, intentionally without a platform shadow.
    const g=ctx.createLinearGradient(X,Y,X,Y+H);
    g.addColorStop(0,'#263443');
    g.addColorStop(.55,'#202c39');
    g.addColorStop(1,'#18232f');
    rr(ctx,X,Y,W,H,5,g,'#101821',3);

    // Vertical wall panels establish one continuous room boundary.
    const panelCount=11;
    const pw=W/panelCount;
    for(let i=1;i<panelCount;i++){
      line(ctx,X+i*pw,Y+8,X+i*pw,Y+H-10,'rgba(116,139,157,.22)',1);
    }

    // Warm top trim + lower baseboard.
    ctx.fillStyle='#75513a';
    ctx.fillRect(X+5,Y+4,W-10,7);
    ctx.fillStyle='#b9845d';
    ctx.fillRect(X+8,Y+5,W-16,2);
    ctx.fillStyle='#34495c';
    ctx.fillRect(X+6,Y+H-12,W-12,7);
    ctx.fillStyle='rgba(160,198,219,.20)';
    ctx.fillRect(X+8,Y+H-11,W-16,2);

    // Integrated NEXUS sign, flush with the wall rather than a raised mezzanine.
    const signW=Math.min(330,W*.56);
    const signH=Math.min(48,H*.62);
    const sx=X+W/2-signW/2;
    const sy=Y+H/2-signH/2+2;
    rr(ctx,sx,sy,signW,signH,5,'#142331','#30485b',2);

    rr(ctx,sx+14,sy+8,32,32,7,'#17384a',P.cyan,2);
    txt(ctx,'N',sx+30,sy+24,17,'#d8fbff','center',800);
    txt(ctx,'N E X U S',sx+signW*.53,sy+20,17,'#ecf7fb','center',800);
    txt(ctx,'OPERATIONS',sx+signW*.53,sy+34,7,'#829daf','center',700);

    // Wall washers point down into the same floor plane.
    for(const lx of [X+55,X+W-77]){
      ctx.save();
      ctx.shadowColor='#ffc96f';
      ctx.shadowBlur=10;
      rr(ctx,lx,Y+14,22,4,2,'#ffc96f');
      ctx.restore();

      const lg=ctx.createLinearGradient(lx,Y+18,lx,Y+H);
      lg.addColorStop(0,'rgba(255,201,111,.16)');
      lg.addColorStop(1,'rgba(255,201,111,0)');
      ctx.fillStyle=lg;
      ctx.beginPath();
      ctx.moveTo(lx+2,Y+18);
      ctx.lineTo(lx+20,Y+18);
      ctx.lineTo(lx+35,Y+H-2);
      ctx.lineTo(lx-13,Y+H-2);
      ctx.closePath();
      ctx.fill();
    }
  }

  function embeddedOffice(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const left=o.variant!=='right';

    // Flush wall recess: no deep external shadow, no raised floor slab.
    rr(ctx,X,Y,W,H,5,'#31404a','#18222b',3);
    rr(ctx,X+5,Y+5,W-10,H-10,3,'#d8b98c','#745942',2);

    // Back wall, same warm palette as the main floor.
    const bg=ctx.createLinearGradient(X,Y,X,Y+H);
    bg.addColorStop(0,'#e6c79b');
    bg.addColorStop(1,'#cfa77a');
    rr(ctx,X+10,Y+10,W-20,H-20,3,bg,'#9a7557',1);

    // Built-in wall cabinetry and shelf details.
    const shelfX=left?X+17:X+W-78;
    rr(ctx,shelfX,Y+18,61,42,4,'#8b5d43','#5e4234',2);
    for(let i=0;i<3;i++){
      ctx.fillStyle='#c39a6d';
      ctx.fillRect(shelfX+6,Y+27+i*10,49,2);
    }
    for(let i=0;i<5;i++){
      ctx.fillStyle=i%2?'#31596b':'#a85744';
      ctx.fillRect(shelfX+9+i*9,Y+21+(i%2)*10,5,9);
    }

    // Desk is aligned with the same floor, not sitting on a platform.
    const deskX=left?X+W*.40:X+W*.17;
    const deskY=Y+68;
    rr(ctx,deskX,deskY,W*.43,27,5,'#8e4937','#633126',2);
    rr(ctx,deskX+3,deskY+3,W*.43-6,7,3,'#d16b4b');
    rr(ctx,deskX+5,deskY+12,W*.43-10,11,3,'#b6533d');

    monitor(ctx,deskX+W*.12,deskY-24,.72);
    rr(ctx,deskX+W*.29,deskY+8,28,4,2,'#eadab7','#a98b67',1);
    cup(ctx,deskX+W*.36,deskY-2);

    // Office chair with back, seat and five-star hint.
    const cx=deskX+W*.21, cy=deskY+38;
    rr(ctx,cx-17,cy-18,34,14,7,'#384957','#222d36',2);
    rr(ctx,cx-13,cy-5,26,12,6,'#526775','#293640',2);
    line(ctx,cx,cy+6,cx,cy+15,'#4d5962',3);
    line(ctx,cx,cy+15,cx-13,cy+20,'#4d5962',2);
    line(ctx,cx,cy+15,cx+13,cy+20,'#4d5962',2);

    // Small side plant and framed wall print.
    plantMini(ctx,left?X+W-43:X+15,Y+55,.65);
    const artX=left?X+W-67:X+16;
    rr(ctx,artX,Y+16,42,28,3,'#24394a','#77553d',2);
    line(ctx,artX+7,Y+35,artX+18,Y+23,P.cyan,2);
    line(ctx,artX+18,Y+23,artX+34,Y+34,'#e5b56f',2);

    // Full-height glass frontage, visually thin and transparent.
    const gy=Y+H-58;
    ctx.save();
    ctx.globalAlpha=.28;
    ctx.fillStyle='#d9f6f7';
    ctx.fillRect(X+7,gy,W-14,51);
    ctx.restore();

    line(ctx,X+7,gy,X+W-7,gy,'#47778a',2);
    line(ctx,X+7,Y+H-7,X+W-7,Y+H-7,'#47778a',2);
    const panes=4;
    for(let i=1;i<panes;i++){
      const px=X+7+i*(W-14)/panes;
      line(ctx,px,gy,px,Y+H-7,'#47778a',1.5);
    }

    // Central doorway gap in the glass frontage.
    const doorC=left?X+W*.48:X+W*.52;
    const doorW=37;
    ctx.clearRect(doorC-doorW/2,gy+2,doorW,49);
    line(ctx,doorC-doorW/2,gy,doorC-doorW/2,Y+H-7,'#426d7f',2);
    line(ctx,doorC+doorW/2,gy,doorC+doorW/2,Y+H-7,'#426d7f',2);
    ctx.fillStyle='#80654c';
    ctx.fillRect(doorC+doorW/2-4,gy+26,3,7);

    // Glass reflections make it read as a wall opening, not a separate level.
    ctx.save();
    ctx.globalAlpha=.50;
    ctx.fillStyle='#efffff';
    ctx.beginPath();
    ctx.moveTo(X+18,gy+5);
    ctx.lineTo(X+53,gy+5);
    ctx.lineTo(X+36,Y+H-12);
    ctx.lineTo(X+13,Y+H-12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Thin flush threshold only—specifically no stair or elevated lip.
    ctx.fillStyle='#8a7256';
    ctx.fillRect(X+8,Y+H-7,W-16,3);
    ctx.fillStyle='rgba(255,255,255,.22)';
    ctx.fillRect(X+10,Y+H-7,W-20,1);
  }

  function wallCore(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    rr(ctx,X,Y,W,H,5,'#263542','#151f29',3);
    rr(ctx,X+7,Y+7,W-14,H-14,3,'#344858','#21303c',2);

    // Vertical cladding ties directly into the back wall.
    for(let i=1;i<5;i++){
      line(ctx,X+8+i*(W-16)/5,Y+8,X+8+i*(W-16)/5,Y+H-8,'rgba(148,174,190,.18)',1);
    }

    // Flush access door, deliberately not styled like an elevator.
    const dw=W*.58,dh=H*.67;
    const dx=X+W/2-dw/2,dy=Y+H-dh-8;
    rr(ctx,dx,dy,dw,dh,4,'#72523e','#161e26',2);
    rr(ctx,dx+6,dy+6,dw-12,dh-12,3,'#8d684d','#5c4334',1);
    ctx.fillStyle='#b88b67';
    ctx.fillRect(dx+10,dy+10,dw-20,4);

    // Narrow glass slit + handle instead of lift doors.
    rr(ctx,dx+dw*.63,dy+18,13,dh-37,3,'rgba(105,177,193,.65)','#315b6d',1);
    ctx.fillStyle='#e0c28d';
    ctx.fillRect(dx+14,dy+dh*.58,4,15);

    // NEXUS wall plaque.
    rr(ctx,X+W/2-32,Y+13,64,27,5,'#132a3a','#356b82',2);
    txt(ctx,'N',X+W/2,Y+26,16,P.cyan,'center',800);

    // Two downlights cast light onto the same floor.
    for(const lx of [X+20,X+W-32]){
      ctx.save();
      ctx.shadowColor='#ffc96f';
      ctx.shadowBlur=8;
      rr(ctx,lx,Y+48,12,3,2,'#ffc96f');
      ctx.restore();
    }
  }

  function topTransition(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // A flat architectural threshold, not a step.
    ctx.fillStyle='rgba(116,86,59,.16)';
    ctx.fillRect(X,Y,W,H);
    ctx.fillStyle='#a27d59';
    ctx.fillRect(X,Y+H*.35,W,3);
    ctx.fillStyle='#e6c895';
    ctx.fillRect(X+4,Y+H*.35+3,W-8,2);

    // Repeated small floor inlays visually continue the main room.
    for(let x=X+18;x<X+W-12;x+=42){
      rr(ctx,x,Y+H*.62,22,5,2,'#c19c69','#8d704d',1);
      ctx.fillStyle='rgba(255,255,255,.16)';
      ctx.fillRect(x+4,Y+H*.62+1,14,1);
    }
  }

  function glassOffice(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X,Y,W,H,16,.2);
    rr(ctx,X,Y,W,H,5,'#c89b70',P.ink,3);rr(ctx,X+7,Y+7,W-14,H-14,3,'#e0bd90','#8b6148',2);
    rr(ctx,X+18,Y+28,W-36,57,6,'#e6c99e','#9d7457',2);
    rr(ctx,X+28,Y+43,76,36,4,P.redDark,'#6f3125',2);rr(ctx,X+W-102,Y+42,70,35,4,'#d8c39b','#8f7658',2);
    monitor(ctx,X+W/2-27,Y+22,.9);
    const fy=Y+88;ctx.save();ctx.globalAlpha=.52;ctx.fillStyle=P.glass2;ctx.fillRect(X+8,fy,W-16,H-(fy-Y)-8);ctx.restore();
    line(ctx,X+8,fy,X+W-8,fy,P.glassDark,3);for(let k=1;k<4;k++)line(ctx,X+8+k*(W-16)/4,fy,X+8+k*(W-16)/4,Y+H-8,P.glassDark,2);
    line(ctx,X+18,fy+12,X+W-18,fy+12,'rgba(220,250,253,.8)',2);
    // chair silhouette
    rr(ctx,X+W/2-25,Y+H-46,50,17,8,'#44505c','#293039',2);rr(ctx,X+W/2-18,Y+H-29,36,14,7,'#566675','#293039',2);
  }

  function doorBank(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X+8,Y,W-16,H,15,.18);
    rr(ctx,X+5,Y,W-10,H,5,'#4c5965','#252e38',3);rr(ctx,X+16,Y+10,W-32,H-24,3,'#c7a674','#7d6750',2);
    const dw=(W-40)/2;rr(ctx,X+20,Y+16,dw,H-36,2,'#76bfd2','#386e82',2);rr(ctx,X+20+dw,Y+16,dw,H-36,2,'#75bacc','#386e82',2);
    ctx.fillStyle=P.cyan;ctx.fillRect(X+W/2-20,Y+4,40,4);
  }

  function poster(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;rr(ctx,X,Y,W,H,4,'#15304a','#2d5e80',2);
    txt(ctx,o.side==='left'?'GOOD\nPEOPLE':'BUILD\nCONNECT',X+W/2,Y+H*.28,10,'#d8f7ff');
    line(ctx,X+9,Y+H*.58,X+W-9,Y+H*.58,P.cyan,3);
    txt(ctx,o.side==='left'?'GREAT\nTHINGS':'GROW\nEVOLVE',X+W/2,Y+H*.73,9,'#d8f7ff');
  }

  function monitor(ctx,x,y,s=1){
    shadow(ctx,x,y,44*s,36*s,7,.12);rr(ctx,x,y,44*s,28*s,4*s,P.ink);rr(ctx,x+4*s,y+4*s,36*s,20*s,2*s,P.screen2);
    line(ctx,x+8*s,y+9*s,x+33*s,y+9*s,P.cyan,2*s);line(ctx,x+8*s,y+15*s,x+26*s,y+15*s,'#8ecbd9',1.5*s);
    ctx.fillStyle='#677988';ctx.fillRect(x+19*s,y+28*s,6*s,7*s);ctx.fillRect(x+12*s,y+34*s,20*s,3*s);
  }

  function counterDesk(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X,Y+10,W,H-10,18,.18);
    rr(ctx,X,Y+8,W,H-8,8,P.redDark,P.ink,3);rr(ctx,X+3,Y+4,W-6,24,6,P.red2,'#8a392a',2);rr(ctx,X+5,Y+20,W-10,H-28,4,P.red,'#9a402d',2);
    monitor(ctx,X+W*.28,Y+22,.75);monitor(ctx,X+W*.58,Y+22,.75);
    rr(ctx,X+W*.44,Y+55,48,8,3,P.cream,'#a98d6b',1);
    plantMini(ctx,X+14,Y+17,.8);cup(ctx,X+W-30,Y+20);
  }

  function stairs(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X+3,Y,W-6,H,16,.15);rr(ctx,X,Y,W,H,4,'#174a68','#122d40',3);
    const n=13,sh=H/n;for(let i=0;i<n;i++){const yy=Y+i*sh;ctx.fillStyle=i%2?'#1f5b7b':'#246681';ctx.fillRect(X+9,yy,W-18,sh-2);ctx.fillStyle='#3f87a2';ctx.fillRect(X+12,yy+1,W-24,2);}
    ctx.fillStyle='#222a36';ctx.fillRect(X+3,Y,7,H);ctx.fillRect(X+W-10,Y,7,H);ctx.fillStyle=P.cyan;ctx.fillRect(o.side==='left'?X+W-13:X+9,Y+10,3,H-20);
  }

  function techPod(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X,Y+8,W,H-8,18,.17);rr(ctx,X,Y+7,W,H-7,7,'#d8d3c3','#777168',2);rr(ctx,X+4,Y+10,W-8,18,4,'#efeadb','#aba392',1);
    for(let i=0;i<4;i++){const bx=X+18+i*(W-36)/4;monitor(ctx,bx,Y+30,.72);rr(ctx,bx+7,Y+66,42,7,2,'#c6bdad');}
    for(let i=0;i<3;i++) plantTall(ctx,X+92+i*96,Y+15,.85);
  }

  function reception(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X+6,Y+7,W-12,H-7,22,.24);
    rr(ctx,X,Y+8,W,32,7,P.redDark,P.ink,3);rr(ctx,X+4,Y+5,W-8,25,6,P.red2,'#8d3b2a',2);
    rr(ctx,X,Y+5,36,H-5,7,P.redDark,P.ink,3);rr(ctx,X+4,Y+9,28,H-13,5,P.red,'#953e2c',2);
    rr(ctx,X+W-36,Y+5,36,H-5,7,P.redDark,P.ink,3);rr(ctx,X+W-32,Y+9,28,H-13,5,P.red,'#953e2c',2);
    rr(ctx,X+38,Y+38,W-76,H-48,4,'#d9d4c5','#7a756d',2);monitor(ctx,X+W/2-22,Y+46,.85);plantMini(ctx,X+W/2-77,Y+51,.85);
    rr(ctx,X+W/2-40,Y+92,80,20,5,'#173247','#284d63',2);txt(ctx,'N',X+W/2,Y+102,17,P.cyan,'center',800);
  }

  function logo(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X,Y,W,H,14,.12);rr(ctx,X,Y,W,H,24,'#26374a','#304a60',3);
    ctx.strokeStyle=P.cyan;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(X+W/2,Y+H/2,W*.32,H*.30,0,0,Math.PI*2);ctx.stroke();rr(ctx,X+W/2-34,Y+H/2-22,68,44,8,'#193346',P.cyan,4);txt(ctx,'N',X+W/2,Y+H/2,23,'#d4fbff','center',800);
  }

  function sofa(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const left=o.side!=='right';

    // broad contact shadow + softer ambient falloff
    shadow(ctx,X+1,Y+7,W-2,H-8,22,.24);
    ctx.save();
    ctx.fillStyle='rgba(29,24,28,.11)';
    ctx.beginPath();
    ctx.ellipse(X+W/2,Y+H-3,W*.43,6,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // structural shell
    rr(ctx,X,Y+8,W,H-10,13,'#172431','#101821',3);
    rr(ctx,X+4,Y+10,W-8,H-16,11,'#223448','#152431',2);

    // lower plinth / recessed base
    rr(ctx,X+8,Y+48,W-16,H-55,7,'#182734','#111b24',2);
    rr(ctx,X+12,Y+51,W-24,H-61,5,'#263b4f','#16222e',1);
    ctx.fillStyle='rgba(255,255,255,.06)';
    ctx.fillRect(X+15,Y+53,W-30,2);

    // back frame behind cushions
    rr(ctx,X+6,Y+9,W-12,30,10,'#263a50','#172533',2);
    ctx.fillStyle='rgba(255,255,255,.055)';
    ctx.fillRect(X+13,Y+13,W-26,3);

    // pronounced armrests
    rr(ctx,X+1,Y+20,18,H-30,8,'#1f3042','#121d28',2);
    rr(ctx,X+4,Y+23,12,H-36,6,'#30485f','#1a2836',1);
    rr(ctx,X+W-19,Y+20,18,H-30,8,'#1f3042','#121d28',2);
    rr(ctx,X+W-16,Y+23,12,H-36,6,'#30485f','#1a2836',1);

    // armrest top pads
    rr(ctx,X+3,Y+18,15,11,6,'#415d77','#223548',1.5);
    rr(ctx,X+W-18,Y+18,15,11,6,'#415d77','#223548',1.5);
    ctx.fillStyle='rgba(255,255,255,.11)';
    ctx.fillRect(X+6,Y+20,9,2);
    ctx.fillRect(X+W-15,Y+20,9,2);

    // two large back cushions
    const backGap=5;
    const backW=(W-30-backGap)/2;
    const backY=Y+13;
    const backH=27;

    rr(ctx,X+12,backY,backW,backH,9,'#456580','#213446',2);
    rr(ctx,X+13+backW+backGap,backY,backW,backH,9,'#456580','#213446',2);

    // back-cushion gradients / raised centers
    rr(ctx,X+16,backY+4,backW-8,backH-8,7,'#4f718d');
    rr(ctx,X+17+backW+backGap,backY+4,backW-8,backH-8,7,'#4f718d');
    ctx.fillStyle='rgba(255,255,255,.11)';
    ctx.fillRect(X+19,backY+5,backW-14,3);
    ctx.fillRect(X+20+backW+backGap,backY+5,backW-14,3);

    // cushion piping
    ctx.strokeStyle='rgba(175,205,225,.35)';
    ctx.lineWidth=1;
    ctx.strokeRect(X+16,backY+4,backW-8,backH-8);
    ctx.strokeRect(X+17+backW+backGap,backY+4,backW-8,backH-8);

    // subtle tufting buttons
    for(const cx of [X+12+backW*.5, X+13+backW+backGap+backW*.5]){
      for(const cy of [backY+10,backY+19]){
        ctx.save();
        ctx.shadowColor='rgba(9,17,24,.45)';
        ctx.shadowBlur=2;
        ctx.fillStyle='#2d4358';
        ctx.beginPath();
        ctx.arc(cx,cy,1.8,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle='rgba(255,255,255,.12)';
        ctx.fillRect(cx-1,cy-1,1,1);
      }
    }

    // seat deck
    rr(ctx,X+10,Y+38,W-20,19,8,'#263b50','#162431',2);

    // two separate seat cushions
    const seatGap=5;
    const seatW=(W-31-seatGap)/2;
    rr(ctx,X+13,Y+35,seatW,19,7,'#3b5872','#213344',2);
    rr(ctx,X+13+seatW+seatGap,Y+35,seatW,19,7,'#3b5872','#213344',2);

    rr(ctx,X+16,Y+38,seatW-6,12,6,'#46647f');
    rr(ctx,X+16+seatW+seatGap,Y+38,seatW-6,12,6,'#46647f');

    // seat highlights and seams
    ctx.fillStyle='rgba(255,255,255,.10)';
    ctx.fillRect(X+19,Y+39,seatW-12,2);
    ctx.fillRect(X+19+seatW+seatGap,Y+39,seatW-12,2);
    ctx.fillStyle='rgba(13,23,31,.28)';
    ctx.fillRect(X+W/2-1,Y+38,2,14);

    // front cushion edge / depth
    rr(ctx,X+12,Y+52,W-24,8,4,'#2a4258','#182736',1);
    ctx.fillStyle='rgba(255,255,255,.065)';
    ctx.fillRect(X+17,Y+53,W-34,1);

    // decorative pillows: one warm accent + one matching blue
    const p1x=left?X+17:X+W-35;
    const p2x=left?X+W-34:X+16;
    rr(ctx,p1x,Y+26,18,14,5,'#b46b4c','#6f4437',1);
    rr(ctx,p1x+3,Y+28,12,4,3,'#d78a65');
    rr(ctx,p2x,Y+27,17,13,5,'#5d7892','#2b4358',1);
    rr(ctx,p2x+3,Y+29,11,3,2,'#8199ad');

    // folded throw blanket draped over the outer arm
    const bx=left?X+4:X+W-24;
    rr(ctx,bx,Y+33,20,22,5,'#8a654e','#5b4638',1);
    ctx.fillStyle='#b38a6d';
    ctx.fillRect(bx+4,Y+36,12,3);
    ctx.fillStyle='#6f5545';
    ctx.fillRect(bx+4,Y+43,12,2);
    ctx.fillRect(bx+4,Y+49,12,2);
    for(let i=0;i<4;i++){
      ctx.fillStyle=i%2?'#a67d62':'#8d6b56';
      ctx.fillRect(bx+3+i*4,Y+53,2,5);
    }

    // small side seam / upholstery stitches
    ctx.strokeStyle='rgba(194,214,230,.20)';
    ctx.lineWidth=1;
    ctx.setLineDash([2,2]);
    line(ctx,X+11,Y+46,X+11,Y+55,'rgba(194,214,230,.20)',1);
    line(ctx,X+W-11,Y+46,X+W-11,Y+55,'rgba(194,214,230,.20)',1);
    ctx.setLineDash([]);

    // feet: dark metal with tiny specular edge
    const footY=Y+H-9;
    for(const fx of [X+12,X+W-20]){
      rr(ctx,fx,footY,8,5,2,'#10171e','#080d12',1);
      ctx.fillStyle='rgba(255,255,255,.12)';
      ctx.fillRect(fx+2,footY+1,4,1);
    }

    // tiny floor reflection under front edge
    ctx.fillStyle='rgba(255,255,255,.04)';
    ctx.fillRect(X+16,Y+H-2,W-32,1);
  }

  function entry(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;rr(ctx,X,Y,W,H,6,'#1d2634','#101720',3);rr(ctx,X+16,Y+18,W-32,H-36,4,'#d3d0c8','#6e6d6a',2);rr(ctx,X+W/2-46,Y+H-28,92,20,5,'#d84d3a','#8d3226',2);
  }

  function server(ctx,o,T,elapsed=0){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const pulseA=Math.sin(elapsed*7.0)>0;
    const pulseB=Math.sin(elapsed*5.2+1.3)>0;
    const pulseC=Math.sin(elapsed*8.7+2.1)>0;

    shadow(ctx,X,Y,W,H,18,.22);

    // heavy outer rack + inset chassis
    rr(ctx,X,Y,W,H,6,'#0b1826','#2f4d68',3);
    rr(ctx,X+4,Y+4,W-8,H-8,4,'#13283a','#3a5a77',2);
    rr(ctx,X+8,Y+8,W-16,H-16,3,'#08131d','#1b3145',1);

    // top status panel
    rr(ctx,X+10,Y+10,W-20,18,3,'#10283b','#24435d',1);
    rr(ctx,X+14,Y+14,W-28,10,2,'#07131d');

    ctx.save();
    ctx.shadowBlur=pulseA?10:0;
    ctx.shadowColor=pulseA?'#35d6e9':'transparent';
    rr(ctx,X+18,Y+17,22,4,2,pulseA?'#35d6e9':'rgba(53,214,233,.20)');
    ctx.restore();

    ctx.save();
    ctx.shadowBlur=pulseB?9:0;
    ctx.shadowColor=pulseB?'#5e8eff':'transparent';
    rr(ctx,X+46,Y+17,Math.max(10,W-64),4,2,pulseB?'#5e8eff':'rgba(94,142,255,.18)');
    ctx.restore();

    // six individual rack units
    const unitCount=6;
    const gap=4;
    const unitsTop=34;
    const unitsBottom=22;
    const unitH=(H-unitsTop-unitsBottom-gap*(unitCount-1))/unitCount;

    for(let i=0;i<unitCount;i++){
      const uy=Y+unitsTop+i*(unitH+gap);
      rr(ctx,X+10,uy,W-20,unitH,3,'#102030','#243b50',1);

      // metallic highlight
      ctx.fillStyle='rgba(255,255,255,.055)';
      ctx.fillRect(X+13,uy+2,W-26,2);

      // vents
      for(let v=0;v<4;v++){
        ctx.fillStyle=v%2?'#183047':'#1e394f';
        ctx.fillRect(X+15,uy+5+v*4,Math.max(12,W*.27),2);
      }

      // drive / compute module
      const moduleX=X+W*.44;
      const moduleW=Math.max(15,W*.28);
      rr(ctx,moduleX,uy+4,moduleW,Math.max(8,unitH-8),2,'#091722','#1b3144',1);
      ctx.fillStyle='#29445a';
      ctx.fillRect(moduleX+4,uy+7,Math.max(6,moduleW-8),2);
      ctx.fillRect(moduleX+4,uy+12,Math.max(4,moduleW-13),2);

      // asynchronous status LEDs
      const led1=(i%2===0)?pulseA:pulseB;
      const led2=(i%3===0)?pulseC:pulseA;
      const ledY=uy+Math.max(5,unitH/2-2);

      ctx.save();
      ctx.shadowBlur=led1?8:0;
      ctx.shadowColor=led1?'#35d6e9':'transparent';
      rr(ctx,X+W-26,ledY,7,4,2,led1?'#35d6e9':'rgba(53,214,233,.18)');
      ctx.restore();

      ctx.save();
      ctx.shadowBlur=led2?8:0;
      ctx.shadowColor=led2?'#4de28b':'transparent';
      rr(ctx,X+W-16,ledY,7,4,2,led2?'#4de28b':'rgba(77,226,139,.16)');
      ctx.restore();
    }

    // structural rails + screws
    ctx.fillStyle='#1d3145';
    ctx.fillRect(X+6,Y+12,2,H-24);
    ctx.fillRect(X+W-8,Y+12,2,H-24);
    for(const sy of [Y+18,Y+H-18]){
      ctx.fillStyle='#8393a1';
      ctx.fillRect(X+6,sy,2,2);
      ctx.fillRect(X+W-8,sy,2,2);
    }

    // lower power / network strip
    rr(ctx,X+10,Y+H-18,W-20,10,3,'#101f2d','#22394e',1);
    ctx.save();
    ctx.shadowBlur=pulseC?9:0;
    ctx.shadowColor=pulseC?'#35d6e9':'transparent';
    rr(ctx,X+W/2-18,Y+H-14,36,3,2,pulseC?'#35d6e9':'rgba(53,214,233,.18)');
    ctx.restore();
  }

  function plantMini(ctx,x,y,s=1){rr(ctx,x+4*s,y+16*s,20*s,16*s,5*s,P.pot,'#603a2e',1);rr(ctx,x+7*s,y+17*s,14*s,5*s,3*s,P.potHi);rr(ctx,x+2*s,y+6*s,15*s,11*s,7*s,P.plant2);rr(ctx,x+12*s,y+1*s,14*s,13*s,7*s,P.plantHi);rr(ctx,x+18*s,y+8*s,11*s,10*s,6*s,P.plant);}
  function plantTall(ctx,x,y,s=1){line(ctx,x+18*s,y+45*s,x+18*s,y+5*s,P.plant,4*s);rr(ctx,x+3*s,y+12*s,16*s,10*s,7*s,P.plant2);rr(ctx,x+17*s,y+3*s,16*s,12*s,7*s,P.plantHi);rr(ctx,x+18*s,y+20*s,18*s,11*s,8*s,P.plant);rr(ctx,x+8*s,y+45*s,22*s,16*s,5*s,P.pot,'#603a2e',1);}
  function plant(ctx,o,T){plantTall(ctx,o.x*T,o.y*T,.9);}
  function cup(ctx,x,y){rr(ctx,x,y,10,13,2,'#f2eee7','#b6aea3',1);ctx.strokeStyle='#b6aea3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+10,y+6,5,-Math.PI/2,Math.PI/2);ctx.stroke();}

  function drawHair(ctx,a,x,y,s){
    if(a.style==='bob'||a.style==='graybob'){rr(ctx,x+7*s,y+1*s,22*s,11*s,6*s,a.hair);rr(ctx,x+5*s,y+7*s,6*s,18*s,4*s,a.hair);rr(ctx,x+25*s,y+7*s,6*s,18*s,4*s,a.hair);rr(ctx,x+10*s,y+1*s,14*s,4*s,3*s,a.hairHi);}
    else if(a.style==='long'){rr(ctx,x+7*s,y+1*s,22*s,11*s,6*s,a.hair);rr(ctx,x+5*s,y+7*s,6*s,24*s,4*s,a.hair);rr(ctx,x+25*s,y+7*s,6*s,24*s,4*s,a.hair);rr(ctx,x+10*s,y+1*s,14*s,4*s,3*s,a.hairHi);}
    else if(a.style==='bun'){rr(ctx,x+11*s,y-5*s,14*s,10*s,5*s,a.hair);rr(ctx,x+7*s,y+1*s,22*s,11*s,6*s,a.hair);rr(ctx,x+5*s,y+8*s,5*s,15*s,3*s,a.hair);rr(ctx,x+26*s,y+8*s,5*s,15*s,3*s,a.hair);}
    else if(a.style==='spiky'){rr(ctx,x+7*s,y+2*s,22*s,10*s,6*s,a.hair);rr(ctx,x+6*s,y-1*s,6*s,8*s,3*s,a.hair);rr(ctx,x+16*s,y-4*s,6*s,10*s,3*s,a.hair);rr(ctx,x+25*s,y-1*s,6*s,8*s,3*s,a.hair);rr(ctx,x+11*s,y+1*s,12*s,3*s,2*s,a.hairHi);}
    else {rr(ctx,x+7*s,y+1*s,22*s,11*s,6*s,a.hair);rr(ctx,x+5*s,y+7*s,5*s,13*s,3*s,a.hair);rr(ctx,x+26*s,y+7*s,5*s,13*s,3*s,a.hair);rr(ctx,x+11*s,y+1*s,12*s,3*s,2*s,a.hairHi);}
  }

  function characterJamesFront(ctx,a,T,selected,elapsed){
    const s=.86;
    const X=Math.round(a.x*T-2);
    const Y=Math.round(a.y*T-28);
    const walk=a.state==='Walk';
    const phase=walk?Math.sin(a.step*18):0;
    const stepA=walk?phase*1.7:0;
    const stepB=walk?-phase*1.7:0;
    const breath=walk?0:Math.sin(elapsed*1.75+a.phase)*.45;
    const sway=walk?Math.sin(a.step*9)*.35:Math.sin(elapsed*.68+a.phase)*.22;
    const blink=((elapsed+a.phase*1.9)%4.9)<.10;
    const y=Y+breath;
    const skin=a.skin,skinHi=a.skinHi;
    const beard=a.beard||'#4b352e';
    const trouser=a.trouser||'#1b293a';
    const shoe=a.shoe||'#3a2b27';
    const folio=a.folio||'#162432';

    // Ground contact: broader and calmer than the generic sprites.
    ctx.save();
    ctx.fillStyle='rgba(31,25,28,.22)';
    ctx.beginPath();
    ctx.ellipse(X+22*s,y+58*s,14*s,4.3*s,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Shoes with sole and a tiny leather highlight.
    rr(ctx,X+8*s,y+(53+stepA)*s,11*s,5*s,2*s,'#241c1b','#151113',1);
    rr(ctx,X+25*s,y+(53+stepB)*s,11*s,5*s,2*s,'#241c1b','#151113',1);
    ctx.fillStyle=shoe;
    ctx.fillRect(X+10*s,y+(52+stepA)*s,8*s,2*s);
    ctx.fillRect(X+27*s,y+(52+stepB)*s,8*s,2*s);
    ctx.fillStyle='rgba(255,255,255,.12)';
    ctx.fillRect(X+11*s,y+(52+stepA)*s,4*s,1*s);
    ctx.fillRect(X+28*s,y+(52+stepB)*s,4*s,1*s);

    // Tailored trousers: separate legs, crease and waistband.
    rr(ctx,X+10*s,y+(40+stepA*.25)*s,10*s,14*s,3*s,trouser,'#111c28',1);
    rr(ctx,X+24*s,y+(40+stepB*.25)*s,10*s,14*s,3*s,trouser,'#111c28',1);
    ctx.fillStyle='rgba(255,255,255,.07)';
    ctx.fillRect(X+14*s,y+(42+stepA*.25)*s,1*s,9*s);
    ctx.fillRect(X+28*s,y+(42+stepB*.25)*s,1*s,9*s);
    rr(ctx,X+10*s,y+38*s,24*s,6*s,2*s,'#182638','#101925',1);
    ctx.fillStyle='#8e7257';
    ctx.fillRect(X+20*s,y+39*s,4*s,2*s);

    // Neck.
    rr(ctx,X+18*s,y+21*s,9*s,7*s,3*s,skin,'#9a6954',1);
    ctx.fillStyle='rgba(255,255,255,.12)';
    ctx.fillRect(X+20*s,y+22*s,5*s,1*s);

    // Jacket silhouette: upright shoulders and slightly tapered waist.
    rr(ctx,X+6*s+sway,y+25*s,32*s,17*s,6*s,'#121d2b','#0c141e',1.3*s);
    rr(ctx,X+8*s+sway,y+26*s,28*s,16*s,5*s,a.body,'#16273a',1);
    rr(ctx,X+11*s+sway,y+27*s,22*s,5*s,3*s,a.bodyHi);

    // White shirt front.
    ctx.beginPath();
    ctx.moveTo(X+18*s+sway,y+27*s);
    ctx.lineTo(X+27*s+sway,y+27*s);
    ctx.lineTo(X+29*s+sway,y+39*s);
    ctx.lineTo(X+16*s+sway,y+39*s);
    ctx.closePath();
    ctx.fillStyle=a.accent;
    ctx.fill();

    // Jacket lapels.
    ctx.beginPath();
    ctx.moveTo(X+11*s+sway,y+28*s);
    ctx.lineTo(X+18*s+sway,y+27*s);
    ctx.lineTo(X+19*s+sway,y+36*s);
    ctx.lineTo(X+13*s+sway,y+32*s);
    ctx.closePath();
    ctx.fillStyle='#2b4a6b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(X+33*s+sway,y+28*s);
    ctx.lineTo(X+27*s+sway,y+27*s);
    ctx.lineTo(X+25*s+sway,y+36*s);
    ctx.lineTo(X+31*s+sway,y+32*s);
    ctx.closePath();
    ctx.fillStyle='#2b4a6b';
    ctx.fill();

    // Dark tie, pocket square and tiny cyan NEXUS pin.
    ctx.beginPath();
    ctx.moveTo(X+21*s+sway,y+28*s);
    ctx.lineTo(X+24*s+sway,y+28*s);
    ctx.lineTo(X+25*s+sway,y+35*s);
    ctx.lineTo(X+22.5*s+sway,y+38*s);
    ctx.lineTo(X+20*s+sway,y+35*s);
    ctx.closePath();
    ctx.fillStyle='#1b2c42';
    ctx.fill();

    ctx.fillStyle='#f5f1e8';
    ctx.fillRect(X+29*s+sway,y+30*s,4*s,2*s);
    ctx.fillStyle=a.pin||P.cyan;
    ctx.fillRect(X+30*s+sway,y+33*s,2*s,2*s);

    // Left arm relaxed, with cuff and hand.
    const armSwing=walk?-phase*1.25:0;
    rr(ctx,X+3*s+sway,y+(28+armSwing)*s,8*s,15*s,4*s,'#142238','#0d1723',1);
    rr(ctx,X+4*s+sway,y+(30+armSwing)*s,6*s,10*s,3*s,a.body);
    ctx.fillStyle='#eef2f4';
    ctx.fillRect(X+5*s+sway,y+(39+armSwing)*s,4*s,2*s);
    rr(ctx,X+4*s+sway,y+(41+armSwing)*s,6*s,5*s,3*s,skin,'#9a6954',1);

    // Right arm holds a slim folio/tablet, reinforcing his coordinating role.
    const holdX=X+35*s+sway;
    const holdY=y+30*s;
    rr(ctx,holdX,holdY,7*s,14*s,4*s,'#142238','#0d1723',1);
    ctx.fillStyle='#eef2f4';
    ctx.fillRect(holdX+1*s,holdY+9*s,4*s,2*s);
    rr(ctx,holdX-2*s,holdY+10*s,7*s,5*s,3*s,skin,'#9a6954',1);
    rr(ctx,holdX-5*s,holdY+12*s,9*s,15*s,2*s,folio,'#0d151e',1);
    ctx.fillStyle='rgba(53,214,233,.42)';
    ctx.fillRect(holdX-3*s,holdY+14*s,5*s,2*s);
    ctx.fillStyle='rgba(255,255,255,.10)';
    ctx.fillRect(holdX-3*s,holdY+18*s,5*s,1*s);

    // Ears behind the head.
    rr(ctx,X+5*s,y+8*s,6*s,10*s,3*s,skin,'#9a6954',1);
    rr(ctx,X+33*s,y+8*s,6*s,10*s,3*s,skin,'#9a6954',1);

    // Head and face.
    rr(ctx,X+8*s,y+3*s,28*s,20*s,8*s,'#241a1b');
    rr(ctx,X+9*s,y+4*s,26*s,19*s,8*s,skin,'#9a6954',1);
    rr(ctx,X+12*s,y+5*s,20*s,5*s,4*s,skinHi);

    // Structured short hair: clean side part, slightly mature temples.
    rr(ctx,X+8*s,y+2*s,28*s,8*s,6*s,a.hair);
    rr(ctx,X+7*s,y+6*s,6*s,10*s,3*s,a.hair);
    rr(ctx,X+32*s,y+5*s,5*s,9*s,3*s,a.hair);
    ctx.fillStyle=a.hairHi;
    ctx.fillRect(X+12*s,y+3*s,13*s,2*s);
    ctx.fillRect(X+11*s,y+5*s,8*s,1*s);
    ctx.fillStyle='#786056';
    ctx.fillRect(X+9*s,y+8*s,2*s,3*s);
    ctx.fillRect(X+33*s,y+7*s,2*s,3*s);

    // Brows give him a focused but not stern expression.
    ctx.fillStyle='#46302b';
    ctx.fillRect(X+13*s,y+11*s,6*s,1.4*s);
    ctx.fillRect(X+26*s,y+11*s,6*s,1.4*s);

    // Eyes and blink cycle.
    if(blink){
      ctx.fillStyle='#5a4037';
      ctx.fillRect(X+14*s,y+14*s,5*s,1.2*s);
      ctx.fillRect(X+27*s,y+14*s,5*s,1.2*s);
    }else{
      ctx.fillStyle='#302428';
      rr(ctx,X+14*s,y+13*s,5*s,3*s,1.5*s,'#302428');
      rr(ctx,X+27*s,y+13*s,5*s,3*s,1.5*s,'#302428');
      ctx.fillStyle='#f8f3ea';
      ctx.fillRect(X+15*s,y+13*s,2*s,1*s);
      ctx.fillRect(X+28*s,y+13*s,2*s,1*s);
    }

    // Nose.
    ctx.fillStyle='#bc8065';
    ctx.fillRect(X+22*s,y+15*s,2*s,3*s);
    ctx.fillStyle='rgba(255,255,255,.13)';
    ctx.fillRect(X+22*s,y+15*s,1*s,1*s);

    // Trim beard / jaw shadow.
    ctx.fillStyle=beard;
    ctx.globalAlpha=.72;
    ctx.fillRect(X+11*s,y+18*s,3*s,2*s);
    ctx.fillRect(X+31*s,y+18*s,3*s,2*s);
    ctx.fillRect(X+14*s,y+20*s,17*s,3*s);
    ctx.fillRect(X+12*s,y+19*s,2*s,2*s);
    ctx.fillRect(X+31*s,y+19*s,2*s,2*s);
    ctx.globalAlpha=1;

    // Small calm smile.
    ctx.fillStyle='#7e4f49';
    ctx.fillRect(X+19*s,y+19*s,7*s,1*s);
    ctx.fillStyle='#d59a83';
    ctx.fillRect(X+21*s,y+18*s,3*s,1*s);

    // A couple of single-pixel highlights make the sprite read as intentionally detailed.
    ctx.fillStyle='rgba(255,255,255,.16)';
    ctx.fillRect(X+10*s,y+29*s,1*s,6*s);
    ctx.fillRect(X+34*s,y+29*s,1*s,5*s);

    if(selected){
      ctx.fillStyle=P.cyan;
      ctx.beginPath();
      ctx.moveTo(X+22*s,y-7*s);
      ctx.lineTo(X+17*s,y-1*s);
      ctx.lineTo(X+27*s,y-1*s);
      ctx.closePath();
      ctx.fill();
    }
  }


  function jamesMarker(ctx,X,y,s){
    ctx.fillStyle=P.cyan;
    ctx.beginPath();
    ctx.moveTo(X+22*s,y-7*s);
    ctx.lineTo(X+17*s,y-1*s);
    ctx.lineTo(X+27*s,y-1*s);
    ctx.closePath();
    ctx.fill();
  }

  function characterJamesBack(ctx,a,T,selected,elapsed){
    const s=.86;
    const X=Math.round(a.x*T-2);
    const Y=Math.round(a.y*T-28);
    const walk=a.state==='Walk';
    const phase=walk?Math.sin(a.step*18):0;
    const stepA=walk?phase*1.7:0;
    const stepB=walk?-phase*1.7:0;
    const breath=walk?0:Math.sin(elapsed*1.75+a.phase)*.45;
    const sway=walk?Math.sin(a.step*9)*.35:Math.sin(elapsed*.68+a.phase)*.22;
    const y=Y+breath;
    const trouser=a.trouser||'#1b293a';
    const shoe=a.shoe||'#3a2b27';
    const folio=a.folio||'#162432';

    // Ground contact.
    ctx.save();
    ctx.fillStyle='rgba(31,25,28,.22)';
    ctx.beginPath();
    ctx.ellipse(X+22*s,y+58*s,14*s,4.3*s,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Shoes and trouser legs.
    rr(ctx,X+8*s,y+(53+stepA)*s,11*s,5*s,2*s,'#241c1b','#151113',1);
    rr(ctx,X+25*s,y+(53+stepB)*s,11*s,5*s,2*s,'#241c1b','#151113',1);
    ctx.fillStyle=shoe;
    ctx.fillRect(X+10*s,y+(52+stepA)*s,8*s,2*s);
    ctx.fillRect(X+27*s,y+(52+stepB)*s,8*s,2*s);

    rr(ctx,X+10*s,y+(40+stepA*.25)*s,10*s,14*s,3*s,trouser,'#111c28',1);
    rr(ctx,X+24*s,y+(40+stepB*.25)*s,10*s,14*s,3*s,trouser,'#111c28',1);
    ctx.fillStyle='rgba(255,255,255,.06)';
    ctx.fillRect(X+14*s,y+(42+stepA*.25)*s,1*s,8*s);
    ctx.fillRect(X+28*s,y+(42+stepB*.25)*s,1*s,8*s);

    // Belt line and jacket from the rear.
    rr(ctx,X+10*s,y+38*s,24*s,6*s,2*s,'#182638','#101925',1);
    rr(ctx,X+6*s+sway,y+25*s,32*s,17*s,6*s,'#121d2b','#0c141e',1.3*s);
    rr(ctx,X+8*s+sway,y+26*s,28*s,16*s,5*s,a.body,'#16273a',1);
    rr(ctx,X+11*s+sway,y+27*s,22*s,5*s,3*s,a.bodyHi);

    // Jacket center seam, shoulder shaping and rear vents.
    ctx.fillStyle='rgba(255,255,255,.07)';
    ctx.fillRect(X+12*s+sway,y+28*s,20*s,2*s);
    ctx.fillStyle='#17283c';
    ctx.fillRect(X+21.5*s+sway,y+28*s,1.5*s,11*s);
    ctx.fillRect(X+17*s+sway,y+37*s,1*s,4*s);
    ctx.fillRect(X+27*s+sway,y+37*s,1*s,4*s);

    // Arms; folio is tucked against his right side.
    const armSwing=walk?-phase*1.1:0;
    rr(ctx,X+3*s+sway,y+(28+armSwing)*s,8*s,15*s,4*s,'#142238','#0d1723',1);
    rr(ctx,X+34*s+sway,y+(28-armSwing)*s,8*s,15*s,4*s,'#142238','#0d1723',1);
    rr(ctx,X+4*s+sway,y+(41+armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+35*s+sway,y+(41-armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+36*s+sway,y+34*s,8*s,15*s,2*s,folio,'#0d151e',1);
    ctx.fillStyle='rgba(53,214,233,.34)';
    ctx.fillRect(X+38*s+sway,y+37*s,4*s,2*s);

    // Neck and head from behind.
    rr(ctx,X+18*s,y+21*s,9*s,7*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+8*s,y+3*s,28*s,20*s,8*s,'#241a1b');
    rr(ctx,X+9*s,y+4*s,26*s,19*s,8*s,a.skin,'#9a6954',1);

    // Hair carries the same clean side-part silhouette, now visible from the back.
    rr(ctx,X+8*s,y+2*s,28*s,11*s,7*s,a.hair);
    rr(ctx,X+7*s,y+7*s,6*s,12*s,3*s,a.hair);
    rr(ctx,X+32*s,y+6*s,5*s,12*s,3*s,a.hair);
    rr(ctx,X+11*s,y+8*s,22*s,10*s,5*s,a.hair);
    ctx.fillStyle=a.hairHi;
    ctx.fillRect(X+13*s,y+4*s,13*s,2*s);
    ctx.fillRect(X+14*s,y+9*s,12*s,2*s);

    // Ear edges and nape make the rear view unmistakable.
    ctx.fillStyle='#b77860';
    ctx.fillRect(X+9*s,y+15*s,2*s,4*s);
    ctx.fillRect(X+34*s,y+14*s,2*s,4*s);
    ctx.fillStyle=a.skin;
    ctx.fillRect(X+19*s,y+20*s,7*s,3*s);

    if(selected) jamesMarker(ctx,X,y,s);
  }

  function characterJamesSideRight(ctx,a,T,selected,elapsed){
    const s=.86;
    const X=Math.round(a.x*T-2);
    const Y=Math.round(a.y*T-28);
    const walk=a.state==='Walk';
    const phase=walk?Math.sin(a.step*18):0;
    const stepA=walk?phase*1.9:0;
    const stepB=walk?-phase*1.9:0;
    const breath=walk?0:Math.sin(elapsed*1.75+a.phase)*.45;
    const sway=walk?Math.sin(a.step*9)*.4:Math.sin(elapsed*.68+a.phase)*.2;
    const blink=((elapsed+a.phase*1.9)%4.9)<.10;
    const y=Y+breath;
    const trouser=a.trouser||'#1b293a';
    const shoe=a.shoe||'#3a2b27';
    const beard=a.beard||'#4b352e';
    const folio=a.folio||'#162432';

    ctx.save();
    ctx.fillStyle='rgba(31,25,28,.22)';
    ctx.beginPath();
    ctx.ellipse(X+22*s,y+58*s,14*s,4.3*s,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Side-on legs have stronger fore/aft separation while walking.
    rr(ctx,X+(9+stepA*.5)*s,y+52*s,12*s,5*s,2*s,'#241c1b','#151113',1);
    rr(ctx,X+(23+stepB*.5)*s,y+52*s,12*s,5*s,2*s,'#241c1b','#151113',1);
    ctx.fillStyle=shoe;
    ctx.fillRect(X+(12+stepA*.5)*s,y+51*s,9*s,2*s);
    ctx.fillRect(X+(26+stepB*.5)*s,y+51*s,9*s,2*s);

    rr(ctx,X+(12+stepA*.35)*s,y+39*s,9*s,14*s,3*s,trouser,'#111c28',1);
    rr(ctx,X+(23+stepB*.35)*s,y+39*s,9*s,14*s,3*s,trouser,'#111c28',1);

    // Slim tailored jacket in profile.
    rr(ctx,X+10*s+sway,y+25*s,25*s,18*s,6*s,'#121d2b','#0c141e',1.2*s);
    rr(ctx,X+12*s+sway,y+26*s,22*s,16*s,5*s,a.body,'#16273a',1);
    rr(ctx,X+14*s+sway,y+27*s,17*s,4*s,3*s,a.bodyHi);

    // Shirt, tie edge and lapel remain visible from the side.
    ctx.fillStyle=a.accent;
    ctx.beginPath();
    ctx.moveTo(X+27*s+sway,y+27*s);
    ctx.lineTo(X+33*s+sway,y+28*s);
    ctx.lineTo(X+31*s+sway,y+38*s);
    ctx.lineTo(X+26*s+sway,y+36*s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#2b4a6b';
    ctx.beginPath();
    ctx.moveTo(X+24*s+sway,y+27*s);
    ctx.lineTo(X+30*s+sway,y+28*s);
    ctx.lineTo(X+25*s+sway,y+36*s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#1b2c42';
    ctx.fillRect(X+29*s+sway,y+29*s,2*s,8*s);
    ctx.fillStyle=a.pin||P.cyan;
    ctx.fillRect(X+23*s+sway,y+31*s,2*s,2*s);

    // Rear arm swings; forward arm keeps the folio under control.
    const armSwing=walk?phase*1.35:0;
    rr(ctx,X+8*s+sway,y+(29+armSwing)*s,7*s,14*s,4*s,'#142238','#0d1723',1);
    rr(ctx,X+9*s+sway,y+(41+armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);

    rr(ctx,X+31*s+sway,y+(29-armSwing*.35)*s,7*s,14*s,4*s,'#142238','#0d1723',1);
    rr(ctx,X+33*s+sway,y+40*s,6*s,5*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+35*s+sway,y+34*s,9*s,15*s,2*s,folio,'#0d151e',1);
    ctx.fillStyle='rgba(53,214,233,.42)';
    ctx.fillRect(X+37*s+sway,y+37*s,5*s,2*s);

    // Neck.
    rr(ctx,X+20*s,y+20*s,9*s,7*s,3*s,a.skin,'#9a6954',1);

    // Profile head: forehead -> nose -> mouth -> chin.
    ctx.fillStyle='#241a1b';
    rr(ctx,X+10*s,y+3*s,27*s,20*s,8*s,'#241a1b');
    rr(ctx,X+12*s,y+4*s,23*s,19*s,8*s,a.skin,'#9a6954',1);
    rr(ctx,X+15*s,y+5*s,16*s,4*s,3*s,a.skinHi);

    // Nose projects beyond the facial oval in profile.
    ctx.fillStyle=a.skin;
    ctx.beginPath();
    ctx.moveTo(X+33*s,y+12*s);
    ctx.lineTo(X+38*s,y+15*s);
    ctx.lineTo(X+33*s,y+17*s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#bc8065';
    ctx.fillRect(X+35*s,y+15*s,2*s,1*s);

    // Hair / side part.
    rr(ctx,X+10*s,y+2*s,26*s,9*s,6*s,a.hair);
    rr(ctx,X+9*s,y+7*s,6*s,12*s,3*s,a.hair);
    ctx.fillStyle=a.hairHi;
    ctx.fillRect(X+15*s,y+3*s,12*s,2*s);
    ctx.fillRect(X+14*s,y+5*s,7*s,1*s);
    ctx.fillStyle='#786056';
    ctx.fillRect(X+11*s,y+9*s,2*s,3*s);

    // One eyebrow and eye are visible in profile.
    ctx.fillStyle='#46302b';
    ctx.fillRect(X+26*s,y+11*s,6*s,1.4*s);
    if(blink){
      ctx.fillStyle='#5a4037';
      ctx.fillRect(X+28*s,y+14*s,4*s,1.2*s);
    }else{
      rr(ctx,X+28*s,y+13*s,4*s,3*s,1.5*s,'#302428');
      ctx.fillStyle='#f8f3ea';
      ctx.fillRect(X+29*s,y+13*s,1*s,1*s);
    }

    // Ear, beard line and restrained smile.
    rr(ctx,X+12*s,y+12*s,5*s,7*s,3*s,a.skin,'#9a6954',1);
    ctx.fillStyle=beard;
    ctx.globalAlpha=.72;
    ctx.fillRect(X+17*s,y+19*s,16*s,3*s);
    ctx.fillRect(X+30*s,y+17*s,4*s,3*s);
    ctx.globalAlpha=1;
    ctx.fillStyle='#7e4f49';
    ctx.fillRect(X+31*s,y+18*s,5*s,1*s);

    if(selected) jamesMarker(ctx,X,y,s);
  }

  function characterJamesSide(ctx,a,T,selected,elapsed,left){
    if(!left) return characterJamesSideRight(ctx,a,T,selected,elapsed);

    // Mirror the complete right-facing profile around James' visual center.
    const s=.86;
    const X=Math.round(a.x*T-2);
    const center=X+22*s;
    ctx.save();
    ctx.translate(center*2,0);
    ctx.scale(-1,1);
    characterJamesSideRight(ctx,a,T,selected,elapsed);
    ctx.restore();
  }

  function characterJames(ctx,a,T,selected,elapsed){
    const facing=a.facing||'down';
    if(facing==='up') return characterJamesBack(ctx,a,T,selected,elapsed);
    if(facing==='left') return characterJamesSide(ctx,a,T,selected,elapsed,true);
    if(facing==='right') return characterJamesSide(ctx,a,T,selected,elapsed,false);
    return characterJamesFront(ctx,a,T,selected,elapsed);
  }


  function character(ctx,a,T,selected,elapsed){
    if(a.id==='james') return characterJames(ctx,a,T,selected,elapsed);
    const s=.78,X=Math.round(a.x*T+1),Y=Math.round(a.y*T-21),wf=a.state==='Walk'?(Math.floor(a.step*10)%2):0,bob=a.state==='Walk'?wf*1.5:Math.sin(elapsed*2+a.phase)*.7,y=Y+bob;
    ctx.save();ctx.fillStyle='rgba(39,29,31,.18)';ctx.beginPath();ctx.ellipse(X+18*s,y+43*s,12*s,3.8*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
    rr(ctx,X+10*s,y+31*s,7*s,13*s,2*s,a.body);rr(ctx,X+20*s,y+31*s+wf*1.5,7*s,13*s,2*s,a.body);rr(ctx,X+9*s,y+42*s,9*s,4*s,2*s,'#252832');rr(ctx,X+19*s,y+42*s+wf*1.5,10*s,4*s,2*s,'#252832');
    rr(ctx,X+6*s,y+19*s,25*s,15*s,5*s,P.ink);rr(ctx,X+8*s,y+20*s,21*s,13*s,4*s,a.body);rr(ctx,X+10*s,y+20*s,17*s,5*s,3*s,a.bodyHi);rr(ctx,X+16*s,y+21*s,5*s,10*s,2*s,a.accent);
    if(a.wave>0){rr(ctx,X+3*s,y+20*s,7*s,14*s,4*s,a.body);rr(ctx,X+1*s,y+4*s,7*s,19*s,4*s,a.skin);rr(ctx,X,y+2*s,9*s,7*s,4*s,a.skinHi);}
    else {rr(ctx,X+3*s,y+21*s,7*s,14*s,4*s,a.body);rr(ctx,X+28*s,y+21*s,7*s,14*s,4*s,a.body);rr(ctx,X+4*s,y+32*s,6*s,5*s,3*s,a.skin);rr(ctx,X+29*s,y+32*s,6*s,5*s,3*s,a.skin);}
    rr(ctx,X+15*s,y+15*s,8*s,7*s,3*s,a.skin);rr(ctx,X+5*s,y+2*s,27*s,18*s,7*s,P.ink);rr(ctx,X+7*s,y+4*s,23*s,15*s,7*s,a.skin);rr(ctx,X+10*s,y+5*s,17*s,4*s,3*s,a.skinHi);drawHair(ctx,a,X,y,s);
    ctx.fillStyle='#34282a';ctx.fillRect(X+12*s,y+12*s,3*s,2*s);ctx.fillRect(X+24*s,y+12*s,3*s,2*s);ctx.fillStyle='#fff4e8';ctx.fillRect(X+13*s,y+12*s,1*s,1*s);ctx.fillRect(X+25*s,y+12*s,1*s,1*s);
    ctx.fillStyle='#b87562';ctx.fillRect(X+19*s,y+14*s,2*s,2*s);rr(ctx,X+16*s,y+17*s,6*s,1.5*s,1*s,'#8c5a51');
    if(selected){ctx.fillStyle=P.cyan;ctx.beginPath();ctx.moveTo(X+19*s,y-9*s);ctx.lineTo(X+14*s,y-3*s);ctx.lineTo(X+24*s,y-3*s);ctx.closePath();ctx.fill();}
  }

  const drawers={frame,brandWall,topBackWall,embeddedOffice,wallCore,topTransition,glassOffice,doorBank,poster,counterDesk,stairs,techPod,reception,logo,sofa,entry,server,plant};
  window.NEXUS_SPRITES={drawFloor,drawObject(ctx,o,T,elapsed=0){const fn=drawers[o.type];if(fn)fn(ctx,o,T,elapsed);},drawCharacter:character};
})();
