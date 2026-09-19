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
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X,Y+4,W,H-4,16,.16);rr(ctx,X,Y+5,W,H-5,10,P.sofa,'#182431',3);rr(ctx,X+6,Y+10,W-12,30,8,P.sofa2,'#26394f',2);rr(ctx,X+6,Y+43,W-12,H-51,6,'#304a64','#1b2938',2);ctx.fillStyle=P.sofaHi;ctx.fillRect(X+10,Y+15,W-20,3);
  }

  function entry(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;rr(ctx,X,Y,W,H,6,'#1d2634','#101720',3);rr(ctx,X+16,Y+18,W-32,H-36,4,'#d3d0c8','#6e6d6a',2);rr(ctx,X+W/2-46,Y+H-28,92,20,5,'#d84d3a','#8d3226',2);
  }

  function server(ctx,o,T){
    const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T;shadow(ctx,X,Y,W,H,14,.16);rr(ctx,X,Y,W,H,5,'#132538','#2b455d',3);for(let i=0;i<6;i++){line(ctx,X+8,Y+12+i*15,X+W-8,Y+12+i*15,i%2?P.cyan:'#5e8eff',2);ctx.fillStyle='#50d98c';ctx.fillRect(X+W-12,Y+10+i*15,3,3);}
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

  function character(ctx,a,T,selected,elapsed){
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

  const drawers={frame,brandWall,glassOffice,doorBank,poster,counterDesk,stairs,techPod,reception,logo,sofa,entry,server,plant};
  window.NEXUS_SPRITES={drawFloor,drawObject(ctx,o,T){const fn=drawers[o.type];if(fn)fn(ctx,o,T);},drawCharacter:character};
})();
