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
    const T=map.tile,W=map.width,H=map.height,f=map.floor;

    // Premium large-format stone / microcement base.
    ctx.fillStyle=f.stone;
    ctx.fillRect(0,0,W,H);

    const slabW=T*4;
    const slabH=T*2;
    for(let row=0,y=0;y<H;row++,y+=slabH){
      const offset=(row%2)*slabW*.5;
      for(let col=-1,x=-offset;x<W;x+=slabW,col++){
        const hash=Math.abs(((row+11)*73856093)^((col+17)*19349663));
        const tone=hash%5;
        ctx.fillStyle=tone===0?f.stoneWarm:(tone===1?f.stoneAlt:f.stone);
        ctx.fillRect(x+1,y+1,slabW-2,slabH-2);

        // Soft polished edge: enough detail to read as premium stone, not retro tiles.
        ctx.fillStyle='rgba(255,255,255,.14)';
        ctx.fillRect(x+5,y+5,slabW-10,1);
        ctx.fillStyle='rgba(53,65,69,.055)';
        ctx.fillRect(x+slabW-2,y+5,1,slabH-10);

        // Deterministic micro-terrazzo / mineral flecks.
        for(let i=0;i<5;i++){
          const sx=x+10+((hash>>(i*3))%(slabW-20));
          const sy=y+9+((hash>>(i*4+2))%(slabH-18));
          ctx.fillStyle=i%3===0?'rgba(70,82,82,.12)':(i%3===1?'rgba(255,255,255,.25)':'rgba(169,127,92,.12)');
          ctx.fillRect(sx,sy,i%2?2:1,i%2?1:2);
        }
      }
    }

    // Hairline joints between oversized slabs.
    ctx.strokeStyle=f.grout;
    ctx.lineWidth=1;
    for(let y=0,row=0;y<=H;y+=slabH,row++){
      line(ctx,0,y,W,y,'rgba(132,143,142,.38)',1);
      const offset=(row%2)*slabW*.5;
      for(let x=-offset;x<=W;x+=slabW){
        line(ctx,x,y,x,Math.min(H,y+slabH),'rgba(132,143,142,.30)',1);
      }
    }

    // Soft architectural reflections from ceiling lights.
    ctx.save();
    const wash=ctx.createLinearGradient(0,0,W,0);
    wash.addColorStop(0,'rgba(255,255,255,0)');
    wash.addColorStop(.18,'rgba(255,255,255,.10)');
    wash.addColorStop(.28,'rgba(255,255,255,0)');
    wash.addColorStop(.66,'rgba(255,255,255,0)');
    wash.addColorStop(.78,'rgba(255,255,255,.08)');
    wash.addColorStop(.88,'rgba(255,255,255,0)');
    ctx.fillStyle=wash;
    ctx.fillRect(0,0,W,H);
    ctx.restore();

    // Central operations zone: flush acoustic carpet inset, not a platform.
    const ox=4.35*T,oy=13.15*T,ow=15.3*T,oh=8.85*T;
    rr(ctx,ox,oy,ow,oh,16,f.graphite,'rgba(91,110,123,.55)',2);
    const carpet=ctx.createLinearGradient(ox,oy,ox+ow,oy+oh);
    carpet.addColorStop(0,'rgba(255,255,255,.025)');
    carpet.addColorStop(.5,'rgba(255,255,255,0)');
    carpet.addColorStop(1,'rgba(0,0,0,.09)');
    ctx.fillStyle=carpet;
    rr(ctx,ox+3,oy+3,ow-6,oh-6,13,carpet);

    // Fine textile grain.
    for(let yy=oy+10;yy<oy+oh-8;yy+=7){
      for(let xx=ox+10;xx<ox+ow-8;xx+=11){
        const n=((xx*13+yy*7)|0)%5;
        ctx.fillStyle=n===0?'rgba(142,164,177,.08)':'rgba(255,255,255,.025)';
        ctx.fillRect(xx+(n%3),yy,2,1);
      }
    }

    // Warm lounge wood islands under both sofas.
    function loungeWood(x,y,w,h,flip=false){
      rr(ctx,x,y,w,h,12,'#9f7757','rgba(99,76,59,.48)',2);
      ctx.save();
      rr(ctx,x+3,y+3,w-6,h-6,10,'#a97f5c');
      ctx.clip();

      const plankH=12;
      for(let py=y-10,row=0;py<y+h+10;py+=plankH,row++){
        const start=x-32+(row%2)*34;
        for(let px=start;px<x+w+40;px+=68){
          const warm=((row+Math.floor(px/68))%3);
          ctx.fillStyle=warm===0?f.oak: warm===1?f.oakAlt:'#b28763';
          ctx.fillRect(px,py,66,plankH-1);
          ctx.fillStyle='rgba(255,255,255,.10)';
          ctx.fillRect(px+4,py+2,52,1);
          ctx.fillStyle='rgba(92,64,45,.14)';
          ctx.fillRect(px+65,py+1,1,plankH-3);
        }
      }

      // Subtle linear grain.
      for(let gy=y+8;gy<y+h-5;gy+=17){
        ctx.fillStyle='rgba(79,55,42,.12)';
        ctx.fillRect(x+10,gy,w-20,1);
      }
      ctx.restore();

      // Brushed metal transition strip.
      ctx.strokeStyle='rgba(139,151,157,.72)';
      ctx.lineWidth=2;
      rr(ctx,x,y,w,h,12,null,'rgba(139,151,157,.72)',2);
      ctx.fillStyle='rgba(255,255,255,.22)';
      ctx.fillRect(x+13,y+4,w-26,1);
    }
    loungeWood(1.0*T,23.45*T,5.25*T,4.55*T,false);
    loungeWood(17.75*T,23.45*T,5.25*T,4.55*T,true);

    // Brushed-metal circulation spine with thin NEXUS cyan inlays.
    const spineX=10.9*T,spineW=2.2*T;
    ctx.fillStyle='rgba(100,113,120,.10)';
    ctx.fillRect(spineX,9.35*T,spineW,20.3*T);
    ctx.fillStyle='rgba(255,255,255,.11)';
    ctx.fillRect(spineX+3,9.55*T,1,19.9*T);
    ctx.fillStyle='rgba(72,87,95,.13)';
    ctx.fillRect(spineX+spineW-4,9.55*T,1,19.9*T);

    for(const lx of [spineX+6,spineX+spineW-8]){
      ctx.save();
      ctx.shadowColor=f.cyan;
      ctx.shadowBlur=5;
      ctx.fillStyle='rgba(53,214,233,.62)';
      ctx.fillRect(lx,9.65*T,2,4.5*T);
      ctx.fillRect(lx,27.0*T,2,2.15*T);
      ctx.restore();
    }

    // Discreet stainless thresholds at the main entrance.
    const ey=29.0*T;
    ctx.fillStyle='rgba(91,105,112,.64)';
    ctx.fillRect(9.1*T,ey,5.8*T,3);
    ctx.fillStyle='rgba(255,255,255,.45)';
    ctx.fillRect(9.2*T,ey+1,5.6*T,1);

    // A final very soft global sheen makes the floor feel polished without becoming glossy.
    const sheen=ctx.createLinearGradient(0,H*.10,0,H*.85);
    sheen.addColorStop(0,'rgba(255,255,255,.045)');
    sheen.addColorStop(.45,'rgba(255,255,255,0)');
    sheen.addColorStop(1,'rgba(17,31,40,.035)');
    ctx.fillStyle=sheen;
    ctx.fillRect(0,0,W,H);
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

  function doorWall(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const g=ctx.createLinearGradient(X,Y,X,Y+H);
    g.addColorStop(0,'#1d2a35');g.addColorStop(.55,'#253744');g.addColorStop(1,'#1a2731');
    rr(ctx,X,Y,W,H,6,g,'#0f181f',3);
    for(let i=1;i<12;i++) line(ctx,X+i*W/12,Y+9,X+i*W/12,Y+H-12,'rgba(145,169,183,.13)',1);
    ctx.fillStyle='#75513a';ctx.fillRect(X+7,Y+7,W-14,6);
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(X+10,Y+8,W-20,1);
    ctx.fillStyle='#52616a';ctx.fillRect(X+6,Y+H-12,W-12,7);
    ctx.save();ctx.shadowColor=P.cyan;ctx.shadowBlur=5;ctx.fillStyle='rgba(53,214,233,.42)';
    ctx.fillRect(X+20,Y+H-19,W-40,2);ctx.restore();
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

  function wallCore(ctx,o,T,elapsed=0,state=null){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const progress=Math.max(0,Math.min(1,state?.doors?.[o.doorId]||0));
    const eased=progress*progress*(3-2*progress);

    rr(ctx,X,Y,W,H,5,'#202d39','#111a22',3);
    rr(ctx,X+7,Y+7,W-14,H-14,3,'#314451','#1d2a34',2);

    for(let i=1;i<5;i++){
      line(ctx,X+8+i*(W-16)/5,Y+8,X+8+i*(W-16)/5,Y+H-8,'rgba(151,174,187,.16)',1);
    }

    const labelTop=o.labelTop||'MEETING',labelBottom=o.labelBottom||'ROOM';
    rr(ctx,X+W/2-43,Y+12,86,28,6,'#112b3a','#315b6e',2);
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=7;
    txt(ctx,labelTop,X+W/2,Y+22,9,'#d9fbff','center',800);
    ctx.restore();
    txt(ctx,labelBottom,X+W/2,Y+32,6,'#86a9b7','center',700);

    const fw=W*.70;
    const fh=H*.64;
    const fx=X+W/2-fw/2;
    const fy=Y+H-fh-7;
    rr(ctx,fx,fy,fw,fh,5,'#101820','#0a1016',2);
    rr(ctx,fx+5,fy+5,fw-10,fh-10,3,'#182733','#304654',1);

    const corridorAlpha=.16+.46*eased;
    const cg=ctx.createLinearGradient(fx,fy,fx,fy+fh);
    cg.addColorStop(0,'rgba(53,214,233,'+(corridorAlpha*.52)+')');
    cg.addColorStop(.35,'rgba(74,117,136,'+(corridorAlpha*.42)+')');
    cg.addColorStop(1,'rgba(8,17,23,.94)');
    rr(ctx,fx+9,fy+9,fw-18,fh-18,2,cg);

    const gap=4;
    const innerX=fx+8,innerY=fy+8,innerW=fw-16,innerH=fh-16;
    const panelW=(innerW-gap)/2;
    const shift=eased*(panelW*.86);

    function panel(px,dir){
      const dx=px+dir*shift;
      rr(ctx,dx,innerY,panelW,innerH,3,'rgba(102,160,176,.62)','#456c7b',2);
      ctx.save();
      ctx.globalAlpha=.34;
      ctx.fillStyle='#eaffff';
      ctx.beginPath();
      ctx.moveTo(dx+5,innerY+6);
      ctx.lineTo(dx+panelW*.55,innerY+6);
      ctx.lineTo(dx+panelW*.36,innerY+innerH-6);
      ctx.lineTo(dx+2,innerY+innerH-6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.20)';
      ctx.fillRect(dx+5,innerY+4,panelW-10,2);
    }

    panel(innerX,-1);
    panel(innerX+panelW+gap,1);

    if(progress<.92){
      ctx.fillStyle='rgba(20,35,44,.70)';
      ctx.fillRect(X+W/2-1,innerY+4,2,innerH-8);
    }

    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=progress>0?10:4;
    rr(ctx,fx+fw-9,fy+fh*.52,4,17,2,progress>0?'#35d6e9':'rgba(53,214,233,.46)');
    ctx.restore();

    ctx.fillStyle='rgba(128,142,150,.70)';
    ctx.fillRect(fx+7,fy+fh-7,fw-14,3);
    ctx.fillStyle='rgba(255,255,255,.46)';
    ctx.fillRect(fx+10,fy+fh-6,fw-20,1);
  }

  function topTransition(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // Flush contemporary threshold: brushed aluminium + a thin cyan identity line.
    const g=ctx.createLinearGradient(X,Y,X,Y+H);
    g.addColorStop(0,'rgba(205,211,211,.30)');
    g.addColorStop(.5,'rgba(111,125,132,.20)');
    g.addColorStop(1,'rgba(223,226,222,.16)');
    ctx.fillStyle=g;
    ctx.fillRect(X,Y,W,H);

    ctx.fillStyle='rgba(104,118,125,.52)';
    ctx.fillRect(X,Y+H*.44,W,2);
    ctx.fillStyle='rgba(255,255,255,.48)';
    ctx.fillRect(X+5,Y+H*.44+2,W-10,1);

    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=6;
    ctx.fillStyle='rgba(53,214,233,.58)';
    ctx.fillRect(X+18,Y+H*.69,W-36,2);
    ctx.restore();

    // Small stainless service markers instead of decorative retro blocks.
    for(let x=X+28;x<X+W-20;x+=72){
      rr(ctx,x,Y+H*.20,30,4,2,'rgba(135,148,154,.55)','rgba(230,235,233,.45)',1);
    }
  }

  function archiveBinder(ctx,x,y,w,h,color,label=true,lean=0){
    ctx.save();
    if(lean){
      ctx.translate(x+w/2,y+h);
      ctx.rotate(lean);
      x=-w/2;y=-h;
    }
    rr(ctx,x,y,w,h,2,color,'rgba(50,38,31,.42)',1);
    ctx.fillStyle='rgba(255,255,255,.15)';
    ctx.fillRect(x+2,y+2,Math.max(2,w-4),2);
    ctx.fillStyle='rgba(46,35,30,.26)';
    ctx.fillRect(x+2,y+h-4,Math.max(2,w-4),2);
    if(label){
      rr(ctx,x+2,y+5,Math.max(3,w-4),Math.max(4,h*.20),1,'#eee0b8','rgba(107,88,66,.45)',1);
      ctx.fillStyle='#816d55';
      ctx.fillRect(x+3,y+7,Math.max(2,w-6),1);
    }
    ctx.restore();
  }

  function archiveFolder(ctx,x,y,w,h,color,tab=''){
    rr(ctx,x,y+4,w,h-4,2,color,'rgba(91,72,53,.55)',1);
    rr(ctx,x+3,y,w*.42,7,2,color,'rgba(91,72,53,.55)',1);
    ctx.fillStyle='rgba(255,255,255,.15)';
    ctx.fillRect(x+3,y+6,w-6,1);
    if(tab){
      rr(ctx,x+w*.48,y+5,w*.42,7,2,'#efe1bc','#a88e67',1);
      txt(ctx,tab,x+w*.69,y+8.5,4,'#695b49','center',800);
    }
  }

  function archiveBox(ctx,x,y,w,h,label){
    rr(ctx,x,y,w,h,4,'#bea981','#75624c',2);
    ctx.fillStyle='rgba(255,255,255,.15)';
    ctx.fillRect(x+5,y+5,w-10,2);
    rr(ctx,x+6,y+h*.38,w-12,13,2,'#eadfca','#9d896c',1);
    txt(ctx,label||'ARCHIV',x+w/2,y+h*.38+6.5,5,'#6f604d','center',800);
    ctx.fillStyle='#7e6a51';
    ctx.fillRect(x+w*.40,y+8,w*.20,4);
  }

  function archiveCabinet(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X,Y,W,H,16,.20);
    rr(ctx,X,Y,W,H,7,'#515d64','#252f35',3);
    rr(ctx,X+5,Y+5,W-10,H-10,5,'#6c777d','#3a454b',1);

    // Category cap.
    rr(ctx,X+10,Y+9,W-20,22,5,'#263943','#16262e',1);
    txt(ctx,o.label||'AKTEN',X+W/2,Y+20,8,'#d7eef1','center',800);

    // Lateral filing drawers.
    const top=Y+38,rows=5,gap=5;
    const rh=(H-52-gap*(rows-1))/rows;
    for(let r=0;r<rows;r++){
      const yy=top+r*(rh+gap);
      rr(ctx,X+9,yy,W-18,rh,4,r%2?'#667178':'#707b81','#3c474d',1);
      ctx.fillStyle='rgba(255,255,255,.13)';
      ctx.fillRect(X+13,yy+4,W-26,2);

      rr(ctx,X+W*.34,yy+rh*.31,W*.32,11,2,'#d7d1c2','#7f7d74',1);
      ctx.fillStyle='#6a6d6e';
      ctx.fillRect(X+W*.42,yy+rh*.31+4,W*.16,2);

      rr(ctx,X+W*.43,yy+rh-9,W*.14,4,2,'#313a3f');
    }

    // Feet + small inventory tag.
    rr(ctx,X+9,Y+H-4,16,7,2,'#2a3237');
    rr(ctx,X+W-25,Y+H-4,16,7,2,'#2a3237');
    rr(ctx,X+W-27,Y+34,17,10,2,'#e6d7af','#8e7b5e',1);
    txt(ctx,String(o.label||'A'),X+W-18.5,Y+39,4,'#6e5d48','center',800);
  }

  function archiveShelf(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X,Y,W,H,15,.18);
    rr(ctx,X,Y,W,H,7,'#49362c','#211a16',3);
    rr(ctx,X+5,Y+5,W-10,H-10,5,'#6a4e3b','#34271f',1);

    rr(ctx,X+10,Y+9,W-20,22,5,'#2b3438','#171e21',1);
    txt(ctx,o.label||'REGAL',X+W/2,Y+20,7,'#f2e8d7','center',800);

    const top=Y+37,rows=5;
    const rh=(H-49)/rows;
    const binderColors=['#b78359','#755b73','#587482','#9b604e','#c8aa6d','#64806b'];

    for(let r=0;r<rows;r++){
      const sy=top+r*rh;
      ctx.fillStyle='#9c7455';
      ctx.fillRect(X+9,sy+rh-5,W-18,5);
      ctx.fillStyle='rgba(255,255,255,.09)';
      ctx.fillRect(X+12,sy+rh-5,W-24,1);

      const variant=o.variant||'binders';
      const mode=variant==='mixed'?(r%3===0?'boxes':r%3===1?'folders':'binders'):variant;

      if(mode==='boxes'){
        const bw=(W-30)/2;
        archiveBox(ctx,X+11,sy+8,bw,rh-17,r%2?'ALT':'JAHR');
        archiveBox(ctx,X+17+bw,sy+8,bw,rh-17,r%2?'SCAN':'AKTE');
      }else if(mode==='folders'){
        const fw=(W-28)/4;
        for(let c=0;c<4;c++){
          const col=['#d4b25f','#bd806d','#7d9a73','#9b7c9d'][c%4];
          archiveFolder(ctx,X+11+c*fw,sy+10,fw-4,rh-18,col,(r+c)%2?'U':'');
        }
      }else{
        const cols=7,bw=(W-28)/cols;
        for(let c=0;c<cols;c++){
          const lean=(c===5&&r%2===0)?-.07:0;
          archiveBinder(ctx,X+11+c*bw,sy+8,bw-3,rh-17,binderColors[(r+c)%binderColors.length],true,lean);
        }
      }
    }

    // Uprights and brass shelf-index tabs.
    ctx.fillStyle='#2f241e';
    ctx.fillRect(X+7,Y+34,3,H-43);
    ctx.fillRect(X+W-10,Y+34,3,H-43);
    for(let r=0;r<rows;r++){
      rr(ctx,X+W-19,top+r*rh+5,9,7,2,'#caa36a','#7f603c',1);
    }
  }

  function archiveCart(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    shadow(ctx,X,Y+7,W,H-5,12,.18);

    // Mobile circulation cart.
    rr(ctx,X,Y+8,W,H-22,6,'#4f5b61','#252f34',2);
    rr(ctx,X+5,Y+13,W-10,18,4,'#6e7b81','#38454b',1);
    rr(ctx,X+5,Y+38,W-10,18,4,'#6e7b81','#38454b',1);

    // Hanging / circulation folders in two trays.
    const colors=['#d6b55e','#b97b68','#7f9a73','#8b789b','#5f8292'];
    for(let row=0;row<2;row++){
      for(let i=0;i<5;i++){
        const fx=X+8+i*(W-19)/5;
        archiveFolder(ctx,fx,Y+15+row*25,(W-25)/5,13,colors[(row+i)%colors.length],i===0?'U':'');
      }
    }

    rr(ctx,X+7,Y+H-29,W-14,16,4,'#202c31','#10171a',1);
    txt(ctx,o.label||'UMLAUF',X+W/2,Y+H-21,6,'#d9eef0','center',800);

    // Handle and wheels.
    line(ctx,X+W-7,Y+14,X+W+8,Y+4,'#616f75',4);
    rr(ctx,X+8,Y+H-12,12,12,6,'#23282b','#0f1315',1);
    rr(ctx,X+W-20,Y+H-12,12,12,6,'#23282b','#0f1315',1);
    ctx.fillStyle='#8f9ba0';
    ctx.fillRect(X+11,Y+H-8,6,3);
    ctx.fillRect(X+W-17,Y+H-8,6,3);
  }

  function archiveShell(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    ctx.fillStyle='#090d11';
    ctx.fillRect(X,Y,W,H);

    const ix=X+18,iy=Y+18,iw=W-36,ih=H-36;

    // Warm mineral floor with large slabs and subtle paper-like flecks.
    rr(ctx,ix,iy,iw,ih,8,'#cbc4b6','#20282d',3);
    const slabW=T*4,slabH=T*2.5;
    for(let row=0,py=iy;py<iy+ih;row++,py+=slabH){
      const off=(row%2)*slabW*.5;
      for(let px=ix-off;px<ix+iw;px+=slabW){
        const tone=(row+Math.floor(px/slabW))%3;
        ctx.fillStyle=tone===0?'#d6cfc1':tone===1?'#c8c1b4':'#cec7b9';
        ctx.fillRect(px+1,py+1,slabW-2,slabH-2);
        ctx.fillStyle='rgba(255,255,255,.16)';
        ctx.fillRect(px+7,py+6,slabW-14,1);
        for(let i=0;i<3;i++){
          ctx.fillStyle=i===0?'rgba(94,78,64,.08)':'rgba(255,255,255,.13)';
          ctx.fillRect(px+16+i*27,py+18+(i%2)*11,2,1);
        }
      }
    }

    // Deep back wall and NEXUS archive identity.
    const wallY=iy+8,wallH=108;
    const wg=ctx.createLinearGradient(ix,wallY,ix,wallY+wallH);
    wg.addColorStop(0,'#17242c');
    wg.addColorStop(1,'#24323a');
    rr(ctx,ix+7,wallY,iw-14,wallH,7,wg,'#0c1216',2);

    rr(ctx,8.1*T,2.05*T,7.8*T,1.45*T,8,'#102733','#315a6d',2);
    txt(ctx,'ARCHIV',12*T,2.48*T,16,'#d9fbff','center',800);
    txt(ctx,'WISSEN  //  DOKUMENTE',12*T,3.05*T,7,'#93b0ba','center',700);

    // Category wayfinding panels.
    const labels=['A–D','E–K','L–R','S–Z','UMLAUF','BOXEN'];
    for(let i=0;i<labels.length;i++){
      const x=2.3*T+i*3.25*T;
      rr(ctx,x,3.55*T,2.65*T,24,5,i<3?'#554438':'#37434a','#1d2529',1);
      txt(ctx,labels[i],x+1.325*T,3.55*T+12,6,'#eadfca','center',800);
    }

    // Long central reading / sorting carpet.
    rr(ctx,6.15*T,12.25*T,11.7*T,11.65*T,20,'#3c4143','rgba(91,101,101,.42)',2);
    for(let yy=12.7*T;yy<23.4*T;yy+=10){
      ctx.fillStyle='rgba(255,255,255,.024)';
      ctx.fillRect(6.6*T,yy,10.8*T,1);
    }

    // Two warm suspended archive luminaires.
    for(const lx of [8.0*T,13.0*T]){
      ctx.save();
      ctx.shadowColor='#ffe4b0';
      ctx.shadowBlur=14;
      rr(ctx,lx,4.15*T,3.0*T,6,3,'rgba(255,230,183,.82)');
      ctx.restore();
    }

    // Bottom wall around the exit; quiet and solid.
    rr(ctx,2*T,25.2*T,20*T,4.7*T,8,'#1b262d','#10171c',2);
    ctx.save();
    ctx.shadowColor='#ffc96f';
    ctx.shadowBlur=9;
    ctx.fillStyle='rgba(255,201,111,.58)';
    ctx.fillRect(4.0*T,25.65*T,3.6*T,3);
    ctx.fillRect(16.4*T,25.65*T,3.6*T,3);
    ctx.restore();

    // Small archival climate / humidity panel.
    rr(ctx,2.4*T,25.9*T,3.2*T,1.05*T,5,'#202e35','#394b53',1);
    txt(ctx,'21°C',3.15*T,26.23*T,7,'#d8e8e8','center',800);
    txt(ctx,'45%',4.65*T,26.23*T,7,'#8fc9d2','center',800);
  }

  function serverShell(ctx,o,T){
    const W=o.w*T,H=o.h*T;
    ctx.fillStyle='#060b10';ctx.fillRect(0,0,W,H);
    rr(ctx,18,18,W-36,H-36,8,'#17242d','#0a1117',3);
    for(let y=20;y<H-20;y+=64) for(let x=20;x<W-20;x+=64){
      ctx.fillStyle=((x+y)/64)%2?'#1b2a34':'#182730';ctx.fillRect(x+1,y+1,62,62);
      ctx.fillStyle='rgba(255,255,255,.04)';ctx.fillRect(x+6,y+6,50,1);
    }
    for(const x of [5.8,10.9,13.0,18.1]){
      ctx.fillStyle='rgba(7,15,21,.72)';ctx.fillRect(x*T,3.8*T,5,21.4*T);
      ctx.save();ctx.shadowColor=P.cyan;ctx.shadowBlur=6;ctx.fillStyle='rgba(53,214,233,.28)';
      ctx.fillRect(x*T+1,4.2*T,2,20.6*T);ctx.restore();
    }
    rr(ctx,2*T,1.9*T,20*T,1.75*T,8,'#0c1c28','#26485d',2);
    txt(ctx,'SERVER',12*T,2.45*T,16,'#d9fbff','center',800);
    txt(ctx,'NEXUS CORE  //  TECHNIK',12*T,3.02*T,7,'#74b8c9','center',700);
    rr(ctx,6.4*T,15.7*T,11.2*T,8.4*T,18,'#202e37','rgba(77,102,115,.62)',2);
    rr(ctx,2*T,25.2*T,20*T,4.7*T,8,'#111d25','#0a1217',2);
  }

  function personalDesk(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T,isServer=o.variant==='server';
    shadow(ctx,X,Y+8,W,H-8,20,.24);

    if(isServer){
      rr(ctx,X,Y+12,W,H-20,10,'#172630','#0b141b',3);
      rr(ctx,X+4,Y+5,W-8,30,8,'#304552','#15232c',2);
      monitor(ctx,X+W*.23,Y+35,.95);monitor(ctx,X+W*.57,Y+35,.95);
      rr(ctx,X+W*.44,Y+48,40,26,5,'#0d202c','#33566a',2);
      ctx.save();ctx.shadowColor=P.cyan;ctx.shadowBlur=5;ctx.fillStyle=P.cyan;ctx.fillRect(X+W*.46,Y+54,20,2);ctx.restore();
      rr(ctx,X+W*.34,Y+H-33,W*.32,22,6,'#102733','#315a6d',2);
      txt(ctx,o.owner||'WALTER',X+W/2,Y+H-24,9,'#d9fbff','center',800);
      txt(ctx,o.subtitle||'TECHNIK',X+W/2,Y+H-15,5,'#83afbc','center',700);
    }else{
      // Gisela's large sorting desk.
      rr(ctx,X,Y+12,W,H-20,10,'#684a38','#30251f',3);
      rr(ctx,X+4,Y+5,W-8,30,8,'#a77a58','#5c4232',2);
      ctx.fillStyle='rgba(255,255,255,.14)';
      ctx.fillRect(X+13,Y+9,W-26,2);

      // Leather work mat + keyboard.
      rr(ctx,X+W*.30,Y+35,W*.40,48,6,'#4d3e39','#2e2927',1);
      monitor(ctx,X+W*.43,Y+27,.96);
      rr(ctx,X+W*.39,Y+71,W*.22,10,3,'#d5d1c6','#8d877c',1);
      for(let k=0;k<6;k++) ctx.fillRect(X+W*.405+k*8,Y+74,5,2);

      // Desk lamp.
      rr(ctx,X+18,Y+41,23,8,4,'#343a3c','#1e2426',1);
      line(ctx,X+30,Y+42,X+42,Y+21,'#4f5759',4);
      rr(ctx,X+37,Y+15,27,10,5,'#536064','#2b3336',1);
      ctx.save();
      ctx.shadowColor='#ffe2a6';
      ctx.shadowBlur=9;
      ctx.fillStyle='rgba(255,226,166,.42)';
      ctx.fillRect(X+41,Y+25,19,4);
      ctx.restore();

      // Standing reference binders.
      const cols=['#b7885f','#7a5d76','#657b87','#8b6d53'];
      for(let i=0;i<4;i++) archiveBinder(ctx,X+19+i*15,Y+55-(i%2)*3,13,39+(i%2)*3,cols[i],true,i===3?-.05:0);

      // Three tier IN / UMLAUF / ABLAGE trays.
      const trayX=X+W-88,trayY=Y+44;
      for(let i=0;i<3;i++){
        rr(ctx,trayX+i*3,trayY+i*18,62-i*6,13,3,i===1?'#c8b58e':'#d9c6a1','#806f59',1);
        ctx.fillStyle='rgba(255,255,255,.28)';
        ctx.fillRect(trayX+7+i*3,trayY+4+i*18,40-i*6,2);
        txt(ctx,['EINGANG','UMLAUF','ABLAGE'][i],trayX+31,trayY+7+i*18,4,'#6d5c49','center',800);
      }

      // Fanned circulation folders in active work area.
      archiveFolder(ctx,X+W*.28,Y+86,58,21,'#d7b45f','U');
      archiveFolder(ctx,X+W*.37,Y+91,58,21,'#b97d69','U');
      archiveFolder(ctx,X+W*.46,Y+86,58,21,'#829a75','U');
      archiveFolder(ctx,X+W*.55,Y+92,58,21,'#8d789d','U');

      // Open document + stamp pad.
      rr(ctx,X+W*.36,Y+112,84,31,3,'#f0e6d1','#a79578',1);
      line(ctx,X+W*.38,Y+120,X+W*.56,Y+120,'#a99b87',1);
      line(ctx,X+W*.38,Y+127,X+W*.53,Y+127,'#a99b87',1);
      line(ctx,X+W*.38,Y+134,X+W*.49,Y+134,'#a99b87',1);
      rr(ctx,X+W*.64,Y+118,29,19,4,'#5b3d47','#34252b',1);
      rr(ctx,X+W*.655,Y+112,19,8,3,'#7c5562','#432e35',1);

      // Roll container below left side.
      rr(ctx,X+15,Y+H-18,68,49,5,'#4f5960','#2d3539',2);
      for(let r=0;r<3;r++){
        rr(ctx,X+21,Y+H-12+r*13,56,10,2,'#626d73','#3b454a',1);
        rr(ctx,X+43,Y+H-9+r*13,12,3,2,'#2f373b');
      }

      // Gisela plaque.
      rr(ctx,X+W*.32,Y+H-33,W*.36,22,6,'#4f3946','#7d5b70',2);
      txt(ctx,o.owner||'GISELA',X+W/2,Y+H-24,9,'#f4ece5','center',800);
      txt(ctx,o.subtitle||'WISSEN & ARCHIV',X+W/2,Y+H-15,5,'#d8c7d4','center',700);
    }

    const cx=X+W/2,cy=Y+H+8;
    rr(ctx,cx-22,cy-20,44,18,9,'#31434f','#17232b',2);
    rr(ctx,cx-17,cy-4,34,14,7,'#455d6b','#1f2d35',2);
    line(ctx,cx,cy+10,cx,cy+19,'#4e6069',3);
    line(ctx,cx,cy+19,cx-16,cy+24,'#4e6069',2);
    line(ctx,cx,cy+19,cx+16,cy+24,'#4e6069',2);
  }

  function meetingShell(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // Executive-room shell: deliberately calm, architectural and spacious.
    ctx.fillStyle='#0a1016';
    ctx.fillRect(X,Y,W,H);

    const ix=X+18,iy=Y+18,iw=W-36,ih=H-36;

    // Warm pale mineral floor, visually related to the main office but cleaner.
    rr(ctx,ix,iy,iw,ih,8,'#d8d9d5','#202c35',3);

    const slabW=T*4.5,slabH=T*2.4;
    for(let row=0,py=iy;py<iy+ih;row++,py+=slabH){
      const offset=(row%2)*slabW*.5;
      for(let px=ix-offset;px<ix+iw;px+=slabW){
        const tone=(row+Math.floor(px/slabW))%4;
        ctx.fillStyle=tone===0?'#dedfd9':tone===1?'#d1d4d0':'#d8d9d5';
        ctx.fillRect(px+1,py+1,slabW-2,slabH-2);

        ctx.fillStyle='rgba(255,255,255,.17)';
        ctx.fillRect(px+7,py+6,slabW-14,1);

        const seed=Math.abs(((row+17)*73856093)^((Math.floor(px/slabW)+23)*19349663));
        for(let i=0;i<4;i++){
          const sx=px+12+((seed>>(i*3))%Math.max(20,Math.floor(slabW-24)));
          const sy=py+12+((seed>>(i*5+1))%Math.max(16,Math.floor(slabH-24)));
          ctx.fillStyle=i===0?'rgba(83,92,92,.09)':'rgba(255,255,255,.18)';
          ctx.fillRect(sx,sy,i%2?2:1,1);
        }
      }

      line(ctx,ix,py,ix+iw,py,'rgba(112,123,123,.26)',1);
      const seamOffset=(row%2)*slabW*.5;
      for(let px=ix-seamOffset;px<ix+iw;px+=slabW){
        line(ctx,px,py,px,Math.min(iy+ih,py+slabH),'rgba(112,123,123,.20)',1);
      }
    }

    // Deep architectural presentation wall.
    const wallY=iy+8,wallH=176;
    const wg=ctx.createLinearGradient(ix,wallY,ix,wallY+wallH);
    wg.addColorStop(0,'#15222c');
    wg.addColorStop(.65,'#1c2b35');
    wg.addColorStop(1,'#202f38');
    rr(ctx,ix+7,wallY,iw-14,wallH,7,wg,'#0b1218',2);

    // Walnut acoustic slats frame the screen but do not dominate it.
    for(const sx of [ix+15,ix+iw-143]){
      rr(ctx,sx,wallY+12,128,148,5,'#4f3d31','#29221d',1);
      for(let k=0;k<15;k++){
        ctx.fillStyle=k%3===0?'#8d674d':k%2?'#765841':'#826047';
        ctx.fillRect(sx+7+k*7.8,wallY+18,4.6,136);
      }
      ctx.fillStyle='rgba(255,255,255,.055)';
      ctx.fillRect(sx+7,wallY+20,108,2);
    }

    // Frosted side-glass walls create depth without turning into another "game level".
    function glassWall(x,w){
      rr(ctx,x,wallY+182,w,ih-315,6,'rgba(112,161,172,.16)','rgba(82,121,132,.42)',1.5);
      for(let py=wallY+205;py<iy+ih-135;py+=88){
        line(ctx,x+6,py,x+w-6,py,'rgba(187,224,228,.18)',1);
      }
      ctx.save();
      ctx.globalAlpha=.20;
      ctx.fillStyle='#ffffff';
      ctx.beginPath();
      ctx.moveTo(x+9,wallY+195);
      ctx.lineTo(x+w*.56,wallY+195);
      ctx.lineTo(x+w*.28,iy+ih-154);
      ctx.lineTo(x+5,iy+ih-154);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    glassWall(ix+8,54);
    glassWall(ix+iw-62,54);

    // Large inset acoustic rug under table, flush with the mineral floor.
    const rx=5.25*T,ry=8.3*T,rw=13.5*T,rh=10.3*T;
    rr(ctx,rx,ry,rw,rh,22,'#26333c','rgba(92,108,117,.46)',2);
    for(let yy=ry+12;yy<ry+rh-10;yy+=8){
      for(let xx=rx+12;xx<rx+rw-10;xx+=12){
        const n=((xx*7+yy*11)|0)%4;
        ctx.fillStyle=n===0?'rgba(141,161,171,.07)':'rgba(255,255,255,.018)';
        ctx.fillRect(xx,yy,2,1);
      }
    }

    // Twin suspended linear luminaires above the table.
    for(const ly of [7.55*T,8.05*T]){
      ctx.save();
      ctx.shadowColor='#d9fbff';
      ctx.shadowBlur=18;
      rr(ctx,7.1*T,ly,9.8*T,7,4,'rgba(231,246,244,.82)');
      ctx.restore();

      const lg=ctx.createLinearGradient(0,ly,0,ly+90);
      lg.addColorStop(0,'rgba(255,255,255,.075)');
      lg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=lg;
      ctx.fillRect(6.7*T,ly+7,10.6*T,92);
    }

    // Bottom wall is quiet graphite with a central portal.
    rr(ctx,ix+7,iy+ih-128,iw-14,111,7,'#18252e','#0d151b',2);
    for(let x=ix+22;x<ix+iw-22;x+=86){
      ctx.fillStyle='rgba(255,255,255,.035)';
      ctx.fillRect(x,iy+ih-119,1,93);
    }

    // Flush cyan wayfinding line, restrained.
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=6;
    ctx.fillStyle='rgba(53,214,233,.52)';
    ctx.fillRect(8.0*T,iy+ih-136,8.0*T,2);
    ctx.restore();

    // Soft global reflection for a premium polished finish.
    const sheen=ctx.createLinearGradient(ix,iy,ix+iw,iy+ih);
    sheen.addColorStop(0,'rgba(255,255,255,.035)');
    sheen.addColorStop(.45,'rgba(255,255,255,0)');
    sheen.addColorStop(1,'rgba(17,28,34,.045)');
    ctx.fillStyle=sheen;
    ctx.fillRect(ix,iy,iw,ih);
  }

  function meetingScreen(ctx,o,T,elapsed=0){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // Screen is recessed into the architecture instead of floating like a game prop.
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.44)';
    ctx.shadowBlur=20;
    ctx.shadowOffsetY=5;
    rr(ctx,X,Y,W,H,8,'rgba(9,15,20,.26)');
    ctx.restore();

    rr(ctx,X,Y,W,H,8,'#071118','#344751',3);
    rr(ctx,X+7,Y+7,W-14,H-14,5,'#0c202a','#1b4453',1);

    const bg=ctx.createLinearGradient(X+8,Y+8,X+W-8,Y+H-8);
    bg.addColorStop(0,'#123745');
    bg.addColorStop(.48,'#0b222d');
    bg.addColorStop(1,'#111b25');
    rr(ctx,X+12,Y+12,W-24,H-24,4,bg);

    // Calm animated dashboard.
    const pulse=.62+.16*Math.sin(elapsed*1.4);
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=9;
    rr(ctx,X+26,Y+22,48,48,10,'#123d4e','rgba(53,214,233,'+pulse+')',2);
    txt(ctx,'N',X+50,Y+46,23,'#d9fbff','center',800);
    ctx.restore();

    txt(ctx,'NEXUS',X+W*.54,Y+28,17,'#eef9fa','center',800);
    txt(ctx,'COLLABORATION ROOM',X+W*.54,Y+47,8,'#8eabb5','center',700);

    // Minimal agenda surface instead of fake dense UI.
    const ax=X+W*.36,ay=Y+65,aw=W*.50;
    for(let i=0;i<3;i++){
      rr(ctx,ax,ay+i*10,aw-(i*24),4,2,i===0?'rgba(53,214,233,.64)':'rgba(133,161,171,.30)');
    }

    // Glass reflection.
    ctx.save();
    ctx.globalAlpha=.14;
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.moveTo(X+16,Y+14);
    ctx.lineTo(X+W*.43,Y+14);
    ctx.lineTo(X+W*.30,Y+H-14);
    ctx.lineTo(X+10,Y+H-14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function meetingTable(ctx,o,T,elapsed=0){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    function chair(cx,cy,rot=0){
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(rot);

      // Soft floor contact.
      ctx.fillStyle='rgba(10,16,20,.24)';
      ctx.beginPath();
      ctx.ellipse(0,15,21,7,0,0,Math.PI*2);
      ctx.fill();

      // Five-star aluminium base with tiny casters.
      line(ctx,0,19,0,32,'#56666d',3);
      const legs=[[-17,36],[-9,39],[9,39],[17,36],[0,41]];
      for(const [lx,ly] of legs){
        line(ctx,0,31,lx,ly,'#56666d',2);
        rr(ctx,lx-3,ly-1,6,4,2,'#20292e','#727f83',1);
      }

      // Gas lift / tilt mechanism.
      rr(ctx,-5,14,10,10,4,'#2a3439','#69777b',1);
      ctx.fillStyle='#909ca0';
      ctx.fillRect(-2,19,4,4);

      // Seat shell + upholstered cushion.
      rr(ctx,-19,3,38,18,9,'#1b2931','#10191f',2);
      rr(ctx,-16,5,32,14,7,'#465f6b','#253942',1);
      ctx.fillStyle='rgba(255,255,255,.08)';
      ctx.fillRect(-11,7,22,2);

      // Tall ergonomic mesh back.
      rr(ctx,-20,-25,40,31,11,'#24353e','#121e24',2);
      rr(ctx,-16,-21,32,23,9,'#425b66','#24363f',1);
      for(let yy=-17;yy<-1;yy+=5){
        ctx.fillStyle='rgba(206,226,230,.08)';
        ctx.fillRect(-11,yy,22,1);
      }

      // Lumbar support and stitching.
      rr(ctx,-10,-11,20,8,4,'#334b55','#263b43',1);
      ctx.fillStyle='rgba(255,255,255,.11)';
      ctx.fillRect(-9,-17,18,1);

      // Armrests with brushed metal supports.
      line(ctx,-18,-3,-23,5,'#7b898d',2);
      line(ctx,18,-3,23,5,'#7b898d',2);
      rr(ctx,-27,3,9,4,2,'#202d33','#59676c',1);
      rr(ctx,18,3,9,4,2,'#202d33','#59676c',1);

      ctx.restore();
    }

    // Eight large executive chairs: four per long side.
    // No head chairs: both ends stay visually open and clear of wall furniture.
    const xs=[X+W*.17,X+W*.39,X+W*.61,X+W*.83];
    for(const cx of xs){
      chair(cx,Y-20,0);
      chair(cx,Y+H+20,Math.PI);
    }

    // Broad realistic contact shadow.
    ctx.save();
    ctx.shadowColor='rgba(8,13,17,.36)';
    ctx.shadowBlur=30;
    ctx.shadowOffsetY=11;
    rr(ctx,X,Y,W,H,52,'rgba(17,22,26,.22)');
    ctx.restore();

    // Sculpted pedestal.
    const pedX=X+W*.30,pedY=Y+H*.18,pedW=W*.40,pedH=H*.64;
    const pg=ctx.createLinearGradient(pedX,pedY,pedX+pedW,pedY+pedH);
    pg.addColorStop(0,'#303b41');
    pg.addColorStop(.55,'#202b31');
    pg.addColorStop(1,'#151e23');
    rr(ctx,pedX,pedY,pedW,pedH,35,pg,'#11181c',2);
    ctx.fillStyle='rgba(255,255,255,.05)';
    rr(ctx,pedX+10,pedY+9,pedW-20,6,3,'rgba(255,255,255,.05)');

    // Smoked walnut veneer tabletop.
    const tg=ctx.createLinearGradient(X,Y,X+W,Y+H);
    tg.addColorStop(0,'#4a382f');
    tg.addColorStop(.22,'#6f503e');
    tg.addColorStop(.50,'#755542');
    tg.addColorStop(.78,'#624637');
    tg.addColorStop(1,'#43332b');
    rr(ctx,X,Y,W,H,50,tg,'#2a211d',3);

    // Fine veneer grain.
    ctx.save();
    rr(ctx,X+4,Y+4,W-8,H-8,46,'#000');
    ctx.clip();
    for(let gy=Y+13,i=0;gy<Y+H-10;gy+=10,i++){
      ctx.strokeStyle=i%3===0?'rgba(25,15,12,.18)':i%2?'rgba(255,255,255,.035)':'rgba(37,23,18,.11)';
      ctx.lineWidth=i%4===0?1.4:1;
      ctx.beginPath();
      ctx.moveTo(X+15,gy);
      ctx.bezierCurveTo(X+W*.27,gy-4-(i%3),X+W*.63,gy+5+(i%4),X+W-15,gy-1);
      ctx.stroke();
    }
    // Small natural veneer pores.
    for(let i=0;i<26;i++){
      const px=X+24+((i*47)%Math.max(40,W-48));
      const py=Y+18+((i*29)%Math.max(30,H-36));
      ctx.fillStyle=i%3?'rgba(24,15,12,.13)':'rgba(255,255,255,.04)';
      ctx.fillRect(px,py,i%4===0?5:2,1);
    }
    ctx.restore();

    // Brushed aluminium perimeter with corner catches.
    rr(ctx,X+7,Y+7,W-14,H-14,44,null,'rgba(175,184,186,.48)',2);
    rr(ctx,X+11,Y+11,W-22,H-22,42,null,'rgba(55,66,69,.32)',1);
    for(const [cx,cy] of [
      [X+28,Y+25],[X+W-28,Y+25],[X+28,Y+H-25],[X+W-28,Y+H-25]
    ]){
      ctx.fillStyle='#98a4a7';
      ctx.beginPath();ctx.arc(cx,cy,2.3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.55)';
      ctx.fillRect(cx-1,cy-1,1,1);
    }

    // Central embedded technology spine.
    const sx=X+W*.385,sy=Y+H*.075,sw=W*.23,sh=H*.85;
    const sg=ctx.createLinearGradient(sx,sy,sx+sw,sy);
    sg.addColorStop(0,'#0d1820');
    sg.addColorStop(.5,'#172a34');
    sg.addColorStop(1,'#0b151c');
    rr(ctx,sx,sy,sw,sh,20,sg,'#35505d',2);
    rr(ctx,sx+6,sy+6,sw-12,sh-12,15,'rgba(22,42,52,.76)','rgba(98,125,134,.28)',1);

    // Animated NEXUS status blade.
    const pulse=.42+.16*Math.sin(elapsed*1.7);
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=9;
    ctx.fillStyle='rgba(53,214,233,'+pulse+')';
    ctx.fillRect(X+W*.50-1,sy+18,2,sh-36);
    ctx.restore();

    // Flush cable hatch with USB-C, HDMI and power marks.
    const hx=X+W*.43,hy=Y+H*.42,hw=W*.14,hh=H*.16;
    rr(ctx,hx,hy,hw,hh,8,'#101b22','#617177',1.5);
    ctx.fillStyle='#263840';
    rr(ctx,hx+5,hy+5,hw-10,hh-10,5,'#263840');
    // USB-C ports.
    rr(ctx,hx+10,hy+10,14,5,2,'#0b1115','#6d7a7d',1);
    rr(ctx,hx+29,hy+10,14,5,2,'#0b1115','#6d7a7d',1);
    // HDMI.
    ctx.fillStyle='#080d11';
    ctx.fillRect(hx+49,hy+9,15,7);
    ctx.fillStyle='#798588';
    ctx.fillRect(hx+51,hy+10,11,1);
    // Power button.
    ctx.strokeStyle='rgba(53,214,233,.78)';
    ctx.lineWidth=1.3;
    ctx.beginPath();ctx.arc(hx+hw-13,hy+12,4,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(53,214,233,.72)';
    ctx.fillRect(hx+hw-13.5,hy+7,1,5);

    // Wireless charging pads with etched symbols.
    for(const [px,py] of [
      [X+W*.28,Y+H*.28],[X+W*.72,Y+H*.28],
      [X+W*.28,Y+H*.72],[X+W*.72,Y+H*.72]
    ]){
      ctx.save();
      ctx.shadowColor='rgba(0,0,0,.20)';
      ctx.shadowBlur=5;
      rr(ctx,px-18,py-11,36,22,10,'#16242b','#647278',1);
      ctx.restore();

      ctx.strokeStyle='rgba(153,172,177,.46)';
      ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.stroke();

      ctx.save();
      ctx.shadowColor=P.cyan;
      ctx.shadowBlur=4;
      ctx.fillStyle='rgba(53,214,233,.58)';
      ctx.fillRect(px-5,py+7,10,2);
      ctx.restore();
    }

    // Directional boundary microphones with LED rings.
    const micPositions=[
      [X+W*.36,Y+H*.20],[X+W*.64,Y+H*.20],
      [X+W*.36,Y+H*.80],[X+W*.64,Y+H*.80]
    ];
    for(let i=0;i<micPositions.length;i++){
      const [mx,my]=micPositions[i];
      rr(ctx,mx-10,my-7,20,14,7,'#111b20','#657378',1);
      ctx.strokeStyle='rgba(53,214,233,'+(.42+.12*Math.sin(elapsed*2+i))+')';
      ctx.lineWidth=1.4;
      ctx.beginPath();ctx.arc(mx,my,5,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#556267';
      for(const ox of [-4,0,4]) ctx.fillRect(mx+ox-1,my-1,2,2);
    }

    // Tablet with on-screen meeting agenda.
    const tx=X+31,ty=Y+31,tw=55,th=36;
    rr(ctx,tx,ty,tw,th,6,'#0a1117','#485d68',1.5);
    rr(ctx,tx+4,ty+4,tw-8,th-8,4,'#112733');
    ctx.fillStyle='rgba(53,214,233,.70)';
    ctx.fillRect(tx+9,ty+9,tw-18,3);
    ctx.fillStyle='rgba(197,221,226,.34)';
    ctx.fillRect(tx+9,ty+17,tw-26,2);
    ctx.fillRect(tx+9,ty+23,tw-19,2);
    ctx.fillRect(tx+9,ty+29,tw-31,2);
    ctx.fillStyle='#889aa0';
    ctx.beginPath();ctx.arc(tx+tw-7,ty+th/2,1.5,0,Math.PI*2);ctx.fill();

    // Leather notebook, paper edge and pen.
    const nx=X+W-95,ny=Y+H-70;
    rr(ctx,nx,ny,56,34,5,'#6b523f','#352a23',1.5);
    ctx.fillStyle='#d9ccb3';
    ctx.fillRect(nx+5,ny+4,46,2);
    ctx.fillStyle='rgba(255,255,255,.08)';
    ctx.fillRect(nx+7,ny+8,37,1);
    ctx.fillStyle='#233640';
    rr(ctx,nx+11,ny+26,38,3,1.5,'#233640');
    ctx.fillStyle=P.cyan;
    ctx.fillRect(nx+43,ny+26,5,3);

    // Water carafe with visible water line and glass highlights.
    const cx=X+W-70,cy=Y+31;
    rr(ctx,cx,cy,16,35,7,'rgba(202,231,234,.40)','#708d95',1);
    ctx.fillStyle='rgba(122,187,199,.20)';
    rr(ctx,cx+2,cy+16,12,16,5,'rgba(122,187,199,.20)');
    ctx.fillStyle='rgba(255,255,255,.42)';
    ctx.fillRect(cx+4,cy+5,4,21);
    ctx.fillStyle='#82989e';
    ctx.fillRect(cx+4,cy-3,8,6);

    for(const [gx,gy] of [[cx-19,cy+14],[cx-32,cy+18],[cx+23,cy+17]]){
      rr(ctx,gx,gy,10,15,4,'rgba(218,240,241,.36)','#80979d',1);
      ctx.fillStyle='rgba(122,187,199,.18)';
      ctx.fillRect(gx+2,gy+8,6,5);
      ctx.fillStyle='rgba(255,255,255,.38)';
      ctx.fillRect(gx+2,gy+3,2,8);
    }

    // Two subtle cable exit points at the pedestal edge.
    for(const ex of [X+W*.43,X+W*.57]){
      rr(ctx,ex-7,Y+H-13,14,7,3,'#151e23','#68767a',1);
      ctx.fillStyle='#0a0f12';
      ctx.fillRect(ex-3,Y+H-10,6,2);
    }
  }

  function meetingWhiteboard(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // Wall-mounted smart glass board. Its shallow shadow falls down the wall,
    // never across the floor, so it reads as architecture rather than furniture.
    ctx.save();
    ctx.shadowColor='rgba(3,9,13,.42)';
    ctx.shadowBlur=14;
    ctx.shadowOffsetY=5;
    rr(ctx,X,Y,W,H,7,'rgba(10,19,24,.28)');
    ctx.restore();

    // Recess/backplate ties the board physically into the presentation wall.
    rr(ctx,X-5,Y-5,W+10,H+10,9,'#17242c','#0a1218',2);
    ctx.fillStyle='rgba(255,255,255,.055)';
    ctx.fillRect(X+7,Y-2,W-14,2);

    // Four short stainless stand-offs.
    for(const [mx,my] of [
      [X+9,Y+9],[X+W-9,Y+9],
      [X+9,Y+H-9],[X+W-9,Y+H-9]
    ]){
      ctx.fillStyle='#77888d';
      ctx.beginPath();ctx.arc(mx,my,3.3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d6dfdf';
      ctx.beginPath();ctx.arc(mx-1,my-1,1.1,0,Math.PI*2);ctx.fill();
    }

    // Laminated writing glass with a subtle edge tint.
    const glass=ctx.createLinearGradient(X,Y,X+W,Y+H);
    glass.addColorStop(0,'rgba(245,249,247,.96)');
    glass.addColorStop(.42,'rgba(229,238,235,.94)');
    glass.addColorStop(1,'rgba(205,220,218,.92)');
    rr(ctx,X,Y,W,H,7,glass,'rgba(100,123,128,.72)',2);
    rr(ctx,X+5,Y+5,W-10,H-10,5,'rgba(249,251,248,.76)','rgba(255,255,255,.50)',1);

    // Compact smart-board header.
    rr(ctx,X+9,Y+8,W-18,22,5,'rgba(28,47,55,.94)','#667a80',1);
    txt(ctx,'NEXUS / DECISIONS',X+16,Y+19,7,'#e8f8f8','left',800);
    txt(ctx,'TODAY',X+W-14,Y+19,6,'#8fc2ca','right',700);

    // Tiny status LEDs and camera/sensor.
    for(let i=0;i<3;i++){
      const c=i===0?'#35d6e9':i===1?'#79c48b':'#d8ad5e';
      ctx.fillStyle=c;
      ctx.beginPath();ctx.arc(X+16+i*9,Y+28,1.7,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#111a1f';
    ctx.beginPath();ctx.arc(X+W-17,Y+27,2.3,0,Math.PI*2);ctx.fill();

    // Three compact planning columns.
    const innerX=X+10,innerY=Y+36,innerW=W-20,innerH=H-55;
    const colW=innerW/3;
    const labels=[
      ['OPEN','#577b88'],
      ['DECIDE','#836c58'],
      ['NEXT','#587861']
    ];

    for(let i=0;i<3;i++){
      const cx=innerX+i*colW;
      ctx.fillStyle='rgba(58,78,84,.09)';
      ctx.fillRect(cx,innerY,colW-2,15);
      txt(ctx,labels[i][0],cx+colW/2,innerY+7.5,5,labels[i][1],'center',800);
      if(i>0) line(ctx,cx-1,innerY,cx-1,innerY+innerH,'rgba(78,99,104,.25)',1);
    }

    // Fine etched planning grid.
    ctx.save();
    ctx.globalAlpha=.15;
    for(let gx=innerX;gx<innerX+innerW;gx+=11) line(ctx,gx,innerY+16,gx,innerY+innerH,'#7b9297',.7);
    for(let gy=innerY+16;gy<innerY+innerH;gy+=10) line(ctx,innerX,gy,innerX+innerW,gy,'#7b9297',.7);
    ctx.restore();

    // Mini sticky notes remain readable at the new wall-mounted scale.
    const notes=[
      [innerX+3,innerY+20,18,15,'#ecc875','API'],
      [innerX+25,innerY+38,18,15,'#8fcbd0','UX'],
      [innerX+colW+5,innerY+24,19,16,'#d99580','GO'],
      [innerX+colW+27,innerY+43,18,15,'#e2bd71','QA'],
      [innerX+colW*2+5,innerY+20,19,16,'#9fc28f','SHIP'],
      [innerX+colW*2+28,innerY+40,18,15,'#a7b7d6','DOC']
    ];

    for(const [sx,sy,sw,sh,c,label] of notes){
      ctx.save();
      ctx.shadowColor='rgba(20,28,30,.16)';
      ctx.shadowBlur=3;
      ctx.shadowOffsetY=1.5;
      rr(ctx,sx,sy,sw,sh,2,c);
      ctx.restore();

      txt(ctx,label,sx+4,sy+5,4,'rgba(45,54,54,.76)','left',800);

      ctx.fillStyle='rgba(52,61,61,.35)';
      ctx.fillRect(sx+4,sy+9,sw-8,1);
      ctx.fillRect(sx+4,sy+12,sw-11,1);

      // Folded corner.
      ctx.fillStyle='rgba(255,255,255,.28)';
      ctx.beginPath();
      ctx.moveTo(sx+sw-5,sy);
      ctx.lineTo(sx+sw,sy);
      ctx.lineTo(sx+sw,sy+5);
      ctx.closePath();
      ctx.fill();
    }

    // Hand-drawn decision arrows.
    ctx.strokeStyle='#4a7079';
    ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(innerX+21,innerY+62);
    ctx.bezierCurveTo(
      innerX+36,innerY+52,
      innerX+colW+8,innerY+66,
      innerX+colW+24,innerY+56
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(innerX+colW+20,innerY+52);
    ctx.lineTo(innerX+colW+25,innerY+56);
    ctx.lineTo(innerX+colW+19,innerY+59);
    ctx.stroke();

    // Tiny KPI chart in OPEN.
    const bx=innerX+4,by=Y+H-28,bw=colW-9,bh=13;
    line(ctx,bx,by+bh,bx+bw,by+bh,'#829094',1);
    const vals=[.4,.7,.55,.88,.68];
    for(let i=0;i<vals.length;i++){
      const h=bh*vals[i];
      ctx.fillStyle=i===3?'rgba(53,214,233,.76)':'rgba(85,119,128,.48)';
      ctx.fillRect(bx+3+i*7,by+bh-h,4,h);
    }

    // Center relationship map.
    const cx=innerX+colW*1.5,cy=Y+H-21;
    for(const [dx,dy] of [[-11,-5],[10,-6],[-10,6],[11,6]]){
      line(ctx,cx,cy,cx+dx,cy+dy,'rgba(76,107,114,.48)',1);
      ctx.fillStyle='#73959c';
      ctx.beginPath();ctx.arc(cx+dx,cy+dy,2.4,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#35d6e9';
    ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fill();

    // NEXT checklist.
    const qx=innerX+colW*2+5,qy=Y+H-32;
    for(let i=0;i<3;i++){
      const yy=qy+i*6;
      ctx.strokeStyle='#617b82';
      ctx.lineWidth=.8;
      ctx.strokeRect(qx,yy,4,4);
      if(i<2){
        ctx.strokeStyle='#4f817b';
        ctx.beginPath();
        ctx.moveTo(qx+1,yy+2);
        ctx.lineTo(qx+2,yy+4);
        ctx.lineTo(qx+5,yy-1);
        ctx.stroke();
      }
      ctx.fillStyle='rgba(64,78,82,.42)';
      ctx.fillRect(qx+7,yy+1,colW-15-(i*4),1.5);
    }

    // Thin magnetic marker rail attached to the wall board.
    const railY=Y+H-8;
    rr(ctx,X+18,railY,W-36,5,2.5,'#78888c','#4c5f64',1);
    const markerXs=[X+27,X+43,X+59,X+75];
    const markerCs=['#35d6e9','#d77b6b','#e0b85f','#4f6972'];
    for(let i=0;i<markerXs.length;i++){
      rr(ctx,markerXs[i],railY-3,12,3,1.5,markerCs[i],'rgba(48,58,61,.48)',.7);
    }

    // Touch/NFC control puck.
    rr(ctx,X+W-31,railY-5,15,10,4,'#18272d','#61757b',1);
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=4;
    ctx.fillStyle='rgba(53,214,233,.72)';
    ctx.beginPath();ctx.arc(X+W-23.5,railY,2,0,Math.PI*2);ctx.fill();
    ctx.restore();

    // Clear diagonal reflection across the vertical glass.
    ctx.save();
    ctx.globalAlpha=.12;
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.moveTo(X+7,Y+6);
    ctx.lineTo(X+W*.42,Y+6);
    ctx.lineTo(X+W*.26,Y+H-10);
    ctx.lineTo(X+4,Y+H-10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Bottom metal edge separates the mounted board from the wall behind it.
    ctx.fillStyle='rgba(131,146,151,.72)';
    ctx.fillRect(X+11,Y+H-2,W-22,2);
    ctx.fillStyle='rgba(255,255,255,.40)';
    ctx.fillRect(X+16,Y+H-2,W-32,1);
  }

  function meetingDoor(ctx,o,T,elapsed=0,state=null){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;
    const progress=Math.max(0,Math.min(1,state?.doors?.[o.doorId]||0));
    const eased=progress*progress*(3-2*progress);

    rr(ctx,X,Y,W,H,6,'#1a2832','#0e171e',3);

    const fx=X+8,fy=Y+8,fw=W-16,fh=H-15;
    rr(ctx,fx,fy,fw,fh,4,'#0b151c','#293b46',2);

    const innerX=fx+6,innerY=fy+5,innerW=fw-12,innerH=fh-10;
    const gap=4,panelW=(innerW-gap)/2,shift=eased*(panelW*.86);

    const bg=ctx.createLinearGradient(innerX,innerY,innerX,innerY+innerH);
    bg.addColorStop(0,'rgba(96,151,166,.45)');
    bg.addColorStop(1,'rgba(14,25,31,.95)');
    rr(ctx,innerX,innerY,innerW,innerH,2,bg);

    function panel(px,dir){
      const dx=px+dir*shift;
      rr(ctx,dx,innerY,panelW,innerH,3,'rgba(103,164,180,.63)','#486f7e',2);
      ctx.save();
      ctx.globalAlpha=.28;
      ctx.fillStyle='#ffffff';
      ctx.beginPath();
      ctx.moveTo(dx+4,innerY+4);
      ctx.lineTo(dx+panelW*.55,innerY+4);
      ctx.lineTo(dx+panelW*.38,innerY+innerH-5);
      ctx.lineTo(dx+2,innerY+innerH-5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    panel(innerX,-1);
    panel(innerX+panelW+gap,1);

    rr(ctx,X+W/2-43,Y-20,86,24,5,'#102a39','#315a6d',2);
    txt(ctx,'EXIT',X+W/2,Y-8,8,'#d9fbff','center',800);

    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=progress>0?10:4;
    rr(ctx,X+W-12,Y+H*.45,4,16,2,progress>0?'#35d6e9':'rgba(53,214,233,.44)');
    ctx.restore();

    ctx.fillStyle='rgba(145,157,162,.72)';
    ctx.fillRect(X+9,Y+H-6,W-18,3);
    ctx.fillStyle='rgba(255,255,255,.42)';
    ctx.fillRect(X+12,Y+H-5,W-24,1);
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
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;

    // Recessed smoked-glass floor emblem instead of a raised rug.
    ctx.save();
    ctx.shadowColor='rgba(18,30,39,.24)';
    ctx.shadowBlur=16;
    ctx.shadowOffsetY=3;
    rr(ctx,X+4,Y+4,W-8,H-8,28,'rgba(28,42,52,.16)');
    ctx.restore();

    rr(ctx,X,Y,W,H,28,'rgba(26,39,50,.88)','rgba(118,137,148,.60)',2);
    rr(ctx,X+6,Y+6,W-12,H-12,23,'rgba(34,51,63,.78)','rgba(225,235,235,.12)',1);

    // Brushed metallic perimeter.
    ctx.strokeStyle='rgba(156,171,178,.55)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.ellipse(X+W/2,Y+H/2,W*.37,H*.35,0,0,Math.PI*2);
    ctx.stroke();

    // Thin cyan illuminated ring.
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=11;
    ctx.strokeStyle='rgba(53,214,233,.82)';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.ellipse(X+W/2,Y+H/2,W*.30,H*.27,0,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Central glass N plaque.
    rr(ctx,X+W/2-30,Y+H/2-20,60,40,10,'rgba(14,35,47,.92)','rgba(75,180,195,.82)',2);
    ctx.save();
    ctx.shadowColor=P.cyan;
    ctx.shadowBlur=8;
    txt(ctx,'N',X+W/2,Y+H/2,22,'#d8fbff','center',800);
    ctx.restore();

    // Long soft reflection across the smoked glass.
    ctx.save();
    ctx.globalAlpha=.20;
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    ctx.moveTo(X+W*.20,Y+H*.18);
    ctx.lineTo(X+W*.60,Y+H*.18);
    ctx.lineTo(X+W*.46,Y+H*.34);
    ctx.lineTo(X+W*.14,Y+H*.34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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


  const ROLE_PROFILES={
    nora:{
      key:'mail',body:'#263f67',body2:'#3b5e8e',lower:'#28364e',shoe:'#2a2430',
      accent:'#f3f5f7',signature:'#d85e55',prop:'#f4ead7',propEdge:'#b79c7d',
      posture:0,width:0,hair:'bob',glasses:false,headset:false
    },
    kevin:{
      key:'research',body:'#426852',body2:'#5d886d',lower:'#263b34',shoe:'#34413b',
      accent:'#deeadf',signature:'#35d6e9',prop:'#173548',propEdge:'#2d6f86',
      posture:-1,width:-1,hair:'spiky',glasses:false,headset:true
    },
    gisela:{
      key:'archive',body:'#67465a',body2:'#845e74',lower:'#493d47',shoe:'#49372f',
      accent:'#eee5dc',signature:'#d2ab68',prop:'#8b5b3d',propEdge:'#d7b474',
      posture:1,width:1,hair:'graybob',glasses:true,headset:false
    },
    lina:{
      key:'calendar',body:'#744b3a',body2:'#97684f',lower:'#564039',shoe:'#412f2c',
      accent:'#efdfca',signature:'#e1af62',prop:'#e9d8b4',propEdge:'#b88b56',
      posture:0,width:-1,hair:'long',glasses:false,headset:false
    },
    walter:{
      key:'tech',body:'#3a4e59',body2:'#58717c',lower:'#313d43',shoe:'#293136',
      accent:'#d7e4e8',signature:'#55dce8',prop:'#102d3d',propEdge:'#3f8296',
      posture:1.5,width:2,hair:'grayshort',glasses:true,headset:false
    },
    sarah:{
      key:'contacts',body:'#65527a',body2:'#826b99',lower:'#493e59',shoe:'#352b3e',
      accent:'#ece0f2',signature:'#d48ad9',prop:'#202f48',propEdge:'#705889',
      posture:-.5,width:0,hair:'bun',glasses:false,headset:true
    },
    finn:{
      key:'followup',body:'#4a5878',body2:'#66779c',lower:'#34425e',shoe:'#293242',
      accent:'#e1e7ef',signature:'#8fc4e8',prop:'#e8e1d2',propEdge:'#8e806c',
      posture:.5,width:0,hair:'short2',glasses:false,headset:false
    }
  };

  function roleMarker(ctx,X,y,s){
    ctx.fillStyle=P.cyan;
    ctx.beginPath();
    ctx.moveTo(X+22*s,y-7*s);
    ctx.lineTo(X+17*s,y-1*s);
    ctx.lineTo(X+27*s,y-1*s);
    ctx.closePath();
    ctx.fill();
  }

  function roleHairFront(ctx,a,p,X,y,s){
    if(p.hair==='bob'||p.hair==='graybob'){
      rr(ctx,X+8*s,y+2*s,28*s,9*s,6*s,a.hair);
      rr(ctx,X+7*s,y+7*s,6*s,16*s,4*s,a.hair);
      rr(ctx,X+32*s,y+7*s,6*s,16*s,4*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+13*s,y+3*s,13*s,2*s);
      if(p.hair==='graybob'){
        ctx.fillStyle='rgba(255,255,255,.22)';
        ctx.fillRect(X+11*s,y+6*s,3*s,11*s);
        ctx.fillRect(X+31*s,y+7*s,2*s,10*s);
      }
    }else if(p.hair==='spiky'){
      rr(ctx,X+9*s,y+4*s,27*s,7*s,5*s,a.hair);
      for(const [dx,dy] of [[9,2],[15,-1],[22,1],[29,0],[34,3]]){
        ctx.beginPath();
        ctx.moveTo(X+dx*s,y+7*s);
        ctx.lineTo(X+(dx+4)*s,y+dy*s);
        ctx.lineTo(X+(dx+7)*s,y+8*s);
        ctx.closePath();
        ctx.fillStyle=a.hair;
        ctx.fill();
      }
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+16*s,y+3*s,11*s,2*s);
    }else if(p.hair==='long'){
      rr(ctx,X+8*s,y+2*s,28*s,10*s,6*s,a.hair);
      rr(ctx,X+6*s,y+8*s,7*s,24*s,4*s,a.hair);
      rr(ctx,X+31*s,y+8*s,7*s,24*s,4*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+13*s,y+3*s,13*s,2*s);
    }else if(p.hair==='bun'){
      rr(ctx,X+15*s,y-5*s,15*s,11*s,6*s,a.hair);
      rr(ctx,X+8*s,y+2*s,28*s,10*s,6*s,a.hair);
      rr(ctx,X+7*s,y+8*s,6*s,13*s,3*s,a.hair);
      rr(ctx,X+32*s,y+8*s,6*s,13*s,3*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+17*s,y-3*s,9*s,2*s);
    }else{
      rr(ctx,X+8*s,y+2*s,28*s,9*s,6*s,a.hair);
      rr(ctx,X+7*s,y+7*s,6*s,11*s,3*s,a.hair);
      rr(ctx,X+32*s,y+7*s,6*s,11*s,3*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+14*s,y+3*s,12*s,2*s);
    }
  }

  function roleHairBack(ctx,a,p,X,y,s){
    if(p.hair==='bun'){
      rr(ctx,X+15*s,y-5*s,15*s,11*s,6*s,a.hair);
      rr(ctx,X+8*s,y+2*s,28*s,12*s,7*s,a.hair);
      rr(ctx,X+10*s,y+9*s,24*s,13*s,6*s,a.hair);
    }else if(p.hair==='long'){
      rr(ctx,X+8*s,y+2*s,28*s,11*s,7*s,a.hair);
      rr(ctx,X+6*s,y+8*s,32*s,27*s,8*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+13*s,y+4*s,13*s,2*s);
      ctx.fillRect(X+11*s,y+14*s,3*s,14*s);
    }else if(p.hair==='bob'||p.hair==='graybob'){
      rr(ctx,X+8*s,y+2*s,28*s,11*s,7*s,a.hair);
      rr(ctx,X+7*s,y+8*s,31*s,16*s,7*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+13*s,y+4*s,13*s,2*s);
      if(p.hair==='graybob'){
        ctx.fillStyle='rgba(255,255,255,.22)';
        ctx.fillRect(X+10*s,y+9*s,3*s,10*s);
      }
    }else if(p.hair==='spiky'){
      roleHairFront(ctx,a,p,X,y,s);
      rr(ctx,X+10*s,y+9*s,25*s,12*s,6*s,a.hair);
    }else{
      rr(ctx,X+8*s,y+2*s,28*s,11*s,7*s,a.hair);
      rr(ctx,X+10*s,y+8*s,24*s,11*s,5*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+13*s,y+4*s,13*s,2*s);
    }
  }

  function roleHairSide(ctx,a,p,X,y,s){
    if(p.hair==='bun'){
      rr(ctx,X+13*s,y-4*s,14*s,10*s,6*s,a.hair);
      rr(ctx,X+10*s,y+2*s,26*s,10*s,6*s,a.hair);
      rr(ctx,X+9*s,y+8*s,7*s,14*s,4*s,a.hair);
    }else if(p.hair==='long'){
      rr(ctx,X+10*s,y+2*s,26*s,10*s,6*s,a.hair);
      rr(ctx,X+8*s,y+8*s,11*s,25*s,6*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+15*s,y+3*s,11*s,2*s);
    }else if(p.hair==='bob'||p.hair==='graybob'){
      rr(ctx,X+10*s,y+2*s,26*s,10*s,6*s,a.hair);
      rr(ctx,X+9*s,y+8*s,9*s,17*s,5*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+15*s,y+3*s,11*s,2*s);
    }else if(p.hair==='spiky'){
      rr(ctx,X+10*s,y+4*s,25*s,7*s,5*s,a.hair);
      for(const [dx,dy] of [[11,1],[18,-2],[26,0],[33,2]]){
        ctx.beginPath();
        ctx.moveTo(X+dx*s,y+7*s);
        ctx.lineTo(X+(dx+5)*s,y+dy*s);
        ctx.lineTo(X+(dx+8)*s,y+8*s);
        ctx.closePath();
        ctx.fillStyle=a.hair;
        ctx.fill();
      }
    }else{
      rr(ctx,X+10*s,y+2*s,26*s,9*s,6*s,a.hair);
      rr(ctx,X+9*s,y+7*s,7*s,12*s,4*s,a.hair);
      ctx.fillStyle=a.hairHi;
      ctx.fillRect(X+15*s,y+3*s,10*s,2*s);
    }
  }

  function roleFaceFront(ctx,a,p,X,y,s,blink){
    // Brows tuned by personality: Kevin/Sarah more open, Finn/Walter calmer and flatter.
    const browY=(p.key==='research'||p.key==='contacts')?11.5:11;
    ctx.fillStyle='#4a342f';
    ctx.fillRect(X+13*s,y+browY*s,6*s,1.3*s);
    ctx.fillRect(X+26*s,y+browY*s,6*s,1.3*s);

    if(blink){
      ctx.fillStyle='#6a4940';
      ctx.fillRect(X+14*s,y+14*s,5*s,1.2*s);
      ctx.fillRect(X+27*s,y+14*s,5*s,1.2*s);
    }else{
      rr(ctx,X+14*s,y+13*s,5*s,3*s,1.5*s,'#33262a');
      rr(ctx,X+27*s,y+13*s,5*s,3*s,1.5*s,'#33262a');
      ctx.fillStyle='#fff6eb';
      ctx.fillRect(X+15*s,y+13*s,2*s,1*s);
      ctx.fillRect(X+28*s,y+13*s,2*s,1*s);
    }

    ctx.fillStyle='#b77861';
    ctx.fillRect(X+22*s,y+15*s,2*s,3*s);

    // Different mouths give each role a different resting energy.
    ctx.fillStyle='#87554d';
    if(p.key==='contacts'||p.key==='research'){
      ctx.fillRect(X+18*s,y+19*s,8*s,1*s);
      ctx.fillStyle='#d9a18a';
      ctx.fillRect(X+20*s,y+18*s,4*s,1*s);
    }else if(p.key==='archive'){
      ctx.fillRect(X+19*s,y+19*s,7*s,1*s);
    }else{
      ctx.fillRect(X+19*s,y+19*s,6*s,1*s);
    }

    if(p.glasses){
      ctx.strokeStyle='#4a5860';
      ctx.lineWidth=1.2*s;
      ctx.strokeRect(X+12*s,y+12*s,8*s,6*s);
      ctx.strokeRect(X+25*s,y+12*s,8*s,6*s);
      line(ctx,X+20*s,y+14*s,X+25*s,y+14*s,'#4a5860',1*s);
    }

    if(p.headset){
      ctx.strokeStyle='#253848';
      ctx.lineWidth=1.8*s;
      ctx.beginPath();
      ctx.arc(X+22*s,y+11*s,15*s,Math.PI*1.05,Math.PI*1.95);
      ctx.stroke();
      rr(ctx,X+7*s,y+12*s,4*s,8*s,2*s,'#253848');
      line(ctx,X+9*s,y+18*s,X+15*s,y+21*s,'#253848',1.5*s);
      rr(ctx,X+14*s,y+20*s,4*s,3*s,1.5*s,p.signature);
    }
  }

  function rolePropFront(ctx,a,p,X,y,s,sway){
    if(p.key==='mail'){
      // Two envelopes: immediately says Nora / mail.
      rr(ctx,X+34*s+sway,y+34*s,12*s,10*s,2*s,p.prop,p.propEdge,1);
      line(ctx,X+35*s+sway,y+35*s,X+40*s+sway,y+39*s,'#b79c7d',1);
      line(ctx,X+45*s+sway,y+35*s,X+40*s+sway,y+39*s,'#b79c7d',1);
      rr(ctx,X+31*s+sway,y+40*s,11*s,9*s,2*s,'#efe3cc','#b79c7d',1);
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+36*s+sway,y+42*s,3*s,3*s);
    }else if(p.key==='research'){
      // Kevin's search tablet + bright cyan scan line.
      rr(ctx,X+34*s+sway,y+33*s,11*s,17*s,3*s,p.prop,p.propEdge,1);
      rr(ctx,X+36*s+sway,y+35*s,7*s,11*s,2*s,'#17475c');
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+37*s+sway,y+37*s,5*s,2*s);
      ctx.fillRect(X+38*s+sway,y+41*s,3*s,1*s);
    }else if(p.key==='archive'){
      // Gisela carries a thick archive folder / book stack.
      rr(ctx,X+33*s+sway,y+34*s,13*s,16*s,2*s,p.prop,'#5c3d2c',1);
      ctx.fillStyle=p.propEdge;
      ctx.fillRect(X+35*s+sway,y+36*s,9*s,2*s);
      ctx.fillStyle='#eadbb9';
      ctx.fillRect(X+36*s+sway,y+40*s,7*s,6*s);
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+34*s+sway,y+47*s,10*s,2*s);
    }else if(p.key==='calendar'){
      // Lina's cream planner with visible colored tabs.
      rr(ctx,X+34*s+sway,y+33*s,12*s,17*s,3*s,p.prop,p.propEdge,1);
      ctx.fillStyle='#fff7df';
      ctx.fillRect(X+36*s+sway,y+35*s,8*s,12*s);
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+36*s+sway,y+37*s,8*s,2*s);
      ctx.fillRect(X+43*s+sway,y+41*s,3*s,2*s);
      ctx.fillStyle='#b96959';
      ctx.fillRect(X+43*s+sway,y+44*s,3*s,2*s);
    }else if(p.key==='tech'){
      // Walter's chunky diagnostic meter and amber tool accent.
      rr(ctx,X+33*s+sway,y+32*s,13*s,18*s,3*s,p.prop,p.propEdge,1);
      rr(ctx,X+35*s+sway,y+34*s,9*s,8*s,2*s,'#173e4e');
      ctx.save();
      ctx.shadowColor=p.signature;
      ctx.shadowBlur=5;
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+37*s+sway,y+36*s,5*s,2*s);
      ctx.restore();
      ctx.fillStyle='#e0a657';
      ctx.fillRect(X+35*s+sway,y+45*s,3*s,3*s);
      ctx.fillRect(X+40*s+sway,y+45*s,3*s,3*s);
    }else if(p.key==='contacts'){
      // Sarah: phone in one hand; headset already frames her face.
      rr(ctx,X+35*s+sway,y+34*s,8*s,15*s,3*s,p.prop,p.propEdge,1);
      ctx.fillStyle='#283f62';
      ctx.fillRect(X+37*s+sway,y+36*s,4*s,8*s);
      ctx.save();
      ctx.shadowColor=p.signature;
      ctx.shadowBlur=4;
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+38*s+sway,y+37*s,2*s,2*s);
      ctx.restore();
    }else if(p.key==='followup'){
      // Finn's checklist clipboard has unmistakable tick marks.
      rr(ctx,X+33*s+sway,y+33*s,13*s,18*s,3*s,p.prop,p.propEdge,1);
      rr(ctx,X+37*s+sway,y+31*s,6*s,4*s,2*s,'#7c6f5e');
      ctx.strokeStyle='#446d78';
      ctx.lineWidth=1.2*s;
      for(let i=0;i<3;i++){
        const yy=y+(37+i*4)*s;
        ctx.beginPath();
        ctx.moveTo(X+35*s+sway,yy);
        ctx.lineTo(X+37*s+sway,yy+2*s);
        ctx.lineTo(X+40*s+sway,yy-1*s);
        ctx.stroke();
        ctx.fillStyle='#9c8f7d';
        ctx.fillRect(X+41*s+sway,yy-1*s,3*s,1*s);
      }
    }
  }

  function rolePropBack(ctx,a,p,X,y,s,sway){
    if(p.key==='mail'){
      // Nora's cross-body mail satchel is even clearer from behind.
      line(ctx,X+12*s+sway,y+28*s,X+33*s+sway,y+43*s,p.signature,2*s);
      rr(ctx,X+27*s+sway,y+39*s,14*s,12*s,3*s,'#9f4f49','#623638',1);
      rr(ctx,X+29*s+sway,y+41*s,10*s,4*s,2*s,'#c76a5d');
    }else if(p.key==='research'){
      // Headphones around Kevin's neck/back.
      ctx.strokeStyle='#24333b';
      ctx.lineWidth=3*s;
      ctx.beginPath();
      ctx.arc(X+22*s,y+27*s,9*s,0,Math.PI);
      ctx.stroke();
      rr(ctx,X+11*s,y+25*s,5*s,8*s,2*s,'#1d2b31');
      rr(ctx,X+28*s,y+25*s,5*s,8*s,2*s,'#1d2b31');
    }else if(p.key==='archive'){
      rr(ctx,X+34*s+sway,y+34*s,12*s,17*s,2*s,p.prop,'#5c3d2c',1);
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+35*s+sway,y+47*s,9*s,2*s);
    }else if(p.key==='calendar'){
      rr(ctx,X+34*s+sway,y+34*s,11*s,17*s,3*s,p.prop,p.propEdge,1);
      ctx.fillStyle=p.signature;
      ctx.fillRect(X+42*s+sway,y+38*s,3*s,2*s);
    }else if(p.key==='tech'){
      // Tool belt and meter make Walter instantly technical from behind.
      rr(ctx,X+9*s+sway,y+39*s,27*s,5*s,2*s,'#766044','#3f352b',1);
      ctx.fillStyle='#e0a657';
      ctx.fillRect(X+12*s+sway,y+41*s,5*s,5*s);
      ctx.fillRect(X+28*s+sway,y+41*s,5*s,6*s);
      rr(ctx,X+35*s+sway,y+34*s,10*s,16*s,3*s,p.prop,p.propEdge,1);
    }else if(p.key==='contacts'){
      // Headset band is visible behind Sarah's bun.
      ctx.strokeStyle='#283848';
      ctx.lineWidth=2*s;
      ctx.beginPath();
      ctx.arc(X+22*s,y+12*s,15*s,Math.PI*1.05,Math.PI*1.95);
      ctx.stroke();
      rr(ctx,X+35*s+sway,y+35*s,8*s,14*s,3*s,p.prop,p.propEdge,1);
    }else if(p.key==='followup'){
      rr(ctx,X+34*s+sway,y+34*s,12*s,17*s,3*s,p.prop,p.propEdge,1);
      ctx.fillStyle='#446d78';
      ctx.fillRect(X+36*s+sway,y+38*s,7*s,2*s);
      ctx.fillRect(X+36*s+sway,y+43*s,7*s,2*s);
    }
  }

  function rolePropSide(ctx,a,p,X,y,s,sway){
    // Side view keeps one oversized signature prop readable.
    rolePropFront(ctx,a,p,X,y,s,sway);
  }

  function detailedRoleFront(ctx,a,p,T,selected,elapsed){
    const s=.84;
    const X=Math.round(a.x*T-2);
    const Y=Math.round(a.y*T-28+p.posture);
    const walk=a.state==='Walk';
    const phase=walk?Math.sin(a.step*18):0;
    const stepA=walk?phase*1.7:0;
    const stepB=walk?-phase*1.7:0;
    const breath=walk?0:Math.sin(elapsed*1.8+a.phase)*.45;
    const sway=walk?Math.sin(a.step*9)*.35:Math.sin(elapsed*.72+a.phase)*.22;
    const blink=((elapsed+a.phase*1.7)%4.5)<.10;
    const y=Y+breath;
    const bw=28+p.width;

    ctx.save();
    ctx.fillStyle='rgba(31,25,28,.20)';
    ctx.beginPath();
    ctx.ellipse(X+22*s,y+58*s,14*s,4*s,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Feet and legs.
    rr(ctx,X+9*s,y+(53+stepA)*s,10*s,5*s,2*s,p.shoe,'#17151a',1);
    rr(ctx,X+25*s,y+(53+stepB)*s,10*s,5*s,2*s,p.shoe,'#17151a',1);
    rr(ctx,X+10*s,y+(40+stepA*.25)*s,9*s,14*s,3*s,p.lower,'#1a2028',1);
    rr(ctx,X+25*s,y+(40+stepB*.25)*s,9*s,14*s,3*s,p.lower,'#1a2028',1);

    // Torso with role-specific tailoring.
    rr(ctx,X+(22-bw/2)*s+sway,y+25*s,bw*s,18*s,6*s,'#161d28','#10161f',1);
    rr(ctx,X+(23-bw/2)*s+sway,y+26*s,(bw-2)*s,16*s,5*s,p.body,'#182435',1);
    rr(ctx,X+(26-bw/2)*s+sway,y+27*s,(bw-8)*s,4*s,3*s,p.body2);

    // Shirt/blouse center and signature accent.
    ctx.fillStyle=p.accent;
    ctx.beginPath();
    ctx.moveTo(X+18*s+sway,y+27*s);
    ctx.lineTo(X+27*s+sway,y+27*s);
    ctx.lineTo(X+28*s+sway,y+38*s);
    ctx.lineTo(X+17*s+sway,y+38*s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle=p.signature;
    if(p.key==='mail'){
      rr(ctx,X+19*s+sway,y+29*s,7*s,5*s,2*s,p.signature);
    }else if(p.key==='research'){
      ctx.fillRect(X+20*s+sway,y+29*s,5*s,8*s);
    }else if(p.key==='archive'){
      rr(ctx,X+18*s+sway,y+30*s,9*s,3*s,1.5*s,p.signature);
    }else if(p.key==='calendar'){
      ctx.fillRect(X+20*s+sway,y+28*s,4*s,10*s);
    }else if(p.key==='tech'){
      ctx.fillRect(X+13*s+sway,y+29*s,3*s,9*s);
      ctx.fillRect(X+29*s+sway,y+29*s,3*s,9*s);
    }else if(p.key==='contacts'){
      rr(ctx,X+19*s+sway,y+30*s,8*s,3*s,2*s,p.signature);
    }else{
      ctx.fillRect(X+20*s+sway,y+29*s,5*s,7*s);
    }

    // Arms.
    const armSwing=walk?-phase*1.2:0;
    rr(ctx,X+5*s+sway,y+(29+armSwing)*s,7*s,14*s,4*s,p.body,'#111925',1);
    rr(ctx,X+33*s+sway,y+(29-armSwing*.4)*s,7*s,14*s,4*s,p.body,'#111925',1);
    rr(ctx,X+6*s+sway,y+(41+armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+34*s+sway,y+41*s,6*s,5*s,3*s,a.skin,'#9a6954',1);

    // Neck/head.
    rr(ctx,X+18*s,y+21*s,9*s,7*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+8*s,y+3*s,28*s,20*s,8*s,'#241a1b');
    rr(ctx,X+9*s,y+4*s,26*s,19*s,8*s,a.skin,'#9a6954',1);
    rr(ctx,X+12*s,y+5*s,20*s,5*s,4*s,a.skinHi);
    roleHairFront(ctx,a,p,X,y,s);
    roleFaceFront(ctx,a,p,X,y,s,blink);
    rolePropFront(ctx,a,p,X,y,s,sway);

    if(selected) roleMarker(ctx,X,y,s);
  }

  function detailedRoleBack(ctx,a,p,T,selected,elapsed){
    const s=.84;
    const X=Math.round(a.x*T-2);
    const Y=Math.round(a.y*T-28+p.posture);
    const walk=a.state==='Walk';
    const phase=walk?Math.sin(a.step*18):0;
    const stepA=walk?phase*1.7:0;
    const stepB=walk?-phase*1.7:0;
    const breath=walk?0:Math.sin(elapsed*1.8+a.phase)*.45;
    const sway=walk?Math.sin(a.step*9)*.35:Math.sin(elapsed*.72+a.phase)*.22;
    const y=Y+breath;
    const bw=28+p.width;

    ctx.save();
    ctx.fillStyle='rgba(31,25,28,.20)';
    ctx.beginPath();
    ctx.ellipse(X+22*s,y+58*s,14*s,4*s,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    rr(ctx,X+9*s,y+(53+stepA)*s,10*s,5*s,2*s,p.shoe,'#17151a',1);
    rr(ctx,X+25*s,y+(53+stepB)*s,10*s,5*s,2*s,p.shoe,'#17151a',1);
    rr(ctx,X+10*s,y+(40+stepA*.25)*s,9*s,14*s,3*s,p.lower,'#1a2028',1);
    rr(ctx,X+25*s,y+(40+stepB*.25)*s,9*s,14*s,3*s,p.lower,'#1a2028',1);

    rr(ctx,X+(22-bw/2)*s+sway,y+25*s,bw*s,18*s,6*s,'#161d28','#10161f',1);
    rr(ctx,X+(23-bw/2)*s+sway,y+26*s,(bw-2)*s,16*s,5*s,p.body,'#182435',1);
    rr(ctx,X+(26-bw/2)*s+sway,y+27*s,(bw-8)*s,4*s,3*s,p.body2);

    // Rear seams / role cues.
    ctx.fillStyle='rgba(255,255,255,.07)';
    ctx.fillRect(X+14*s+sway,y+28*s,17*s,2*s);
    ctx.fillStyle=p.signature;
    if(p.key==='tech'){
      ctx.fillRect(X+11*s+sway,y+31*s,3*s,8*s);
      ctx.fillRect(X+31*s+sway,y+31*s,3*s,8*s);
    }else if(p.key==='contacts'){
      ctx.fillRect(X+20*s+sway,y+38*s,5*s,2*s);
    }else if(p.key==='mail'){
      ctx.fillRect(X+20*s+sway,y+27*s,5*s,3*s);
    }

    const armSwing=walk?-phase*1.1:0;
    rr(ctx,X+5*s+sway,y+(29+armSwing)*s,7*s,14*s,4*s,p.body,'#111925',1);
    rr(ctx,X+33*s+sway,y+(29-armSwing)*s,7*s,14*s,4*s,p.body,'#111925',1);
    rr(ctx,X+6*s+sway,y+(41+armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+34*s+sway,y+(41-armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);

    rr(ctx,X+18*s,y+21*s,9*s,7*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+8*s,y+3*s,28*s,20*s,8*s,'#241a1b');
    rr(ctx,X+9*s,y+4*s,26*s,19*s,8*s,a.skin,'#9a6954',1);
    roleHairBack(ctx,a,p,X,y,s);
    rolePropBack(ctx,a,p,X,y,s,sway);

    if(selected) roleMarker(ctx,X,y,s);
  }

  function detailedRoleSideRight(ctx,a,p,T,selected,elapsed){
    const s=.84;
    const X=Math.round(a.x*T-2);
    const Y=Math.round(a.y*T-28+p.posture);
    const walk=a.state==='Walk';
    const phase=walk?Math.sin(a.step*18):0;
    const stepA=walk?phase*1.8:0;
    const stepB=walk?-phase*1.8:0;
    const breath=walk?0:Math.sin(elapsed*1.8+a.phase)*.45;
    const sway=walk?Math.sin(a.step*9)*.38:Math.sin(elapsed*.72+a.phase)*.20;
    const blink=((elapsed+a.phase*1.7)%4.5)<.10;
    const y=Y+breath;

    ctx.save();
    ctx.fillStyle='rgba(31,25,28,.20)';
    ctx.beginPath();
    ctx.ellipse(X+22*s,y+58*s,14*s,4*s,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    rr(ctx,X+(9+stepA*.5)*s,y+52*s,12*s,5*s,2*s,p.shoe,'#17151a',1);
    rr(ctx,X+(23+stepB*.5)*s,y+52*s,12*s,5*s,2*s,p.shoe,'#17151a',1);
    rr(ctx,X+(12+stepA*.35)*s,y+39*s,9*s,14*s,3*s,p.lower,'#1a2028',1);
    rr(ctx,X+(23+stepB*.35)*s,y+39*s,9*s,14*s,3*s,p.lower,'#1a2028',1);

    rr(ctx,X+10*s+sway,y+25*s,25*s,18*s,6*s,'#161d28','#10161f',1);
    rr(ctx,X+12*s+sway,y+26*s,22*s,16*s,5*s,p.body,'#182435',1);
    rr(ctx,X+14*s+sway,y+27*s,17*s,4*s,3*s,p.body2);

    // Side-visible role color and shirt.
    ctx.fillStyle=p.accent;
    ctx.beginPath();
    ctx.moveTo(X+27*s+sway,y+27*s);
    ctx.lineTo(X+33*s+sway,y+28*s);
    ctx.lineTo(X+31*s+sway,y+38*s);
    ctx.lineTo(X+26*s+sway,y+36*s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle=p.signature;
    ctx.fillRect(X+24*s+sway,y+30*s,3*s,7*s);

    const armSwing=walk?phase*1.25:0;
    rr(ctx,X+8*s+sway,y+(29+armSwing)*s,7*s,14*s,4*s,p.body,'#111925',1);
    rr(ctx,X+31*s+sway,y+(29-armSwing*.35)*s,7*s,14*s,4*s,p.body,'#111925',1);
    rr(ctx,X+9*s+sway,y+(41+armSwing)*s,6*s,5*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+33*s+sway,y+40*s,6*s,5*s,3*s,a.skin,'#9a6954',1);

    rr(ctx,X+20*s,y+20*s,9*s,7*s,3*s,a.skin,'#9a6954',1);
    rr(ctx,X+10*s,y+3*s,27*s,20*s,8*s,'#241a1b');
    rr(ctx,X+12*s,y+4*s,23*s,19*s,8*s,a.skin,'#9a6954',1);
    rr(ctx,X+15*s,y+5*s,16*s,4*s,3*s,a.skinHi);

    // Profile nose.
    ctx.fillStyle=a.skin;
    ctx.beginPath();
    ctx.moveTo(X+33*s,y+12*s);
    ctx.lineTo(X+38*s,y+15*s);
    ctx.lineTo(X+33*s,y+17*s);
    ctx.closePath();
    ctx.fill();

    roleHairSide(ctx,a,p,X,y,s);

    ctx.fillStyle='#4a342f';
    ctx.fillRect(X+26*s,y+11*s,6*s,1.3*s);
    if(blink){
      ctx.fillStyle='#6a4940';
      ctx.fillRect(X+28*s,y+14*s,4*s,1.2*s);
    }else{
      rr(ctx,X+28*s,y+13*s,4*s,3*s,1.5*s,'#33262a');
      ctx.fillStyle='#fff6eb';
      ctx.fillRect(X+29*s,y+13*s,1*s,1*s);
    }

    rr(ctx,X+12*s,y+12*s,5*s,7*s,3*s,a.skin,'#9a6954',1);
    ctx.fillStyle='#87554d';
    ctx.fillRect(X+31*s,y+18*s,5*s,1*s);

    if(p.glasses){
      ctx.strokeStyle='#4a5860';
      ctx.lineWidth=1.2*s;
      ctx.strokeRect(X+26*s,y+12*s,8*s,6*s);
      line(ctx,X+34*s,y+14*s,X+37*s,y+14*s,'#4a5860',1*s);
    }

    if(p.headset){
      ctx.strokeStyle='#253848';
      ctx.lineWidth=1.8*s;
      ctx.beginPath();
      ctx.arc(X+22*s,y+11*s,14*s,Math.PI*1.05,Math.PI*1.85);
      ctx.stroke();
      rr(ctx,X+10*s,y+13*s,4*s,8*s,2*s,'#253848');
      line(ctx,X+12*s,y+19*s,X+20*s,y+21*s,'#253848',1.5*s);
      rr(ctx,X+19*s,y+20*s,4*s,3*s,1.5*s,p.signature);
    }

    rolePropSide(ctx,a,p,X,y,s,sway);

    if(selected) roleMarker(ctx,X,y,s);
  }

  function detailedRoleSide(ctx,a,p,T,selected,elapsed,left){
    if(!left) return detailedRoleSideRight(ctx,a,p,T,selected,elapsed);

    const s=.84;
    const X=Math.round(a.x*T-2);
    const center=X+22*s;
    ctx.save();
    ctx.translate(center*2,0);
    ctx.scale(-1,1);
    detailedRoleSideRight(ctx,a,p,T,selected,elapsed);
    ctx.restore();
  }

  function detailedRoleCharacter(ctx,a,T,selected,elapsed){
    const p=ROLE_PROFILES[a.id];
    if(!p) return;
    const facing=a.facing||'down';
    if(facing==='up') return detailedRoleBack(ctx,a,p,T,selected,elapsed);
    if(facing==='left') return detailedRoleSide(ctx,a,p,T,selected,elapsed,true);
    if(facing==='right') return detailedRoleSide(ctx,a,p,T,selected,elapsed,false);
    return detailedRoleFront(ctx,a,p,T,selected,elapsed);
  }

  function character(ctx,a,T,selected,elapsed){
    if(a.id==='james') return characterJames(ctx,a,T,selected,elapsed);
    return detailedRoleCharacter(ctx,a,T,selected,elapsed);
  }

  const drawers={frame,brandWall,topBackWall,doorWall,embeddedOffice,wallCore,topTransition,archiveShell,archiveCabinet,archiveShelf,archiveCart,serverShell,personalDesk,meetingShell,meetingScreen,meetingWhiteboard,meetingTable,meetingDoor,glassOffice,doorBank,poster,counterDesk,stairs,techPod,reception,logo,sofa,entry,server,plant};
  window.NEXUS_SPRITES={drawFloor,drawObject(ctx,o,T,elapsed=0,state=null){const fn=drawers[o.type];if(fn)fn(ctx,o,T,elapsed,state);},drawCharacter:character};
})();
