(() => {
  const T=32;
  const team=[
    {id:'james',name:'James',role:'Leitung',skin:'#d8a47b',skinHi:'#efc097',hair:'#35241f',hairHi:'#5c4034',body:'#213955',bodyHi:'#3a5b82',accent:'#eef2f5',style:'short',x:5,y:7,desk:[5,7]},
    {id:'nora',name:'Nora',role:'Mail',skin:'#d9a481',skinHi:'#efbd9a',hair:'#503228',hairHi:'#7b5646',body:'#263f67',bodyHi:'#3b5e8e',accent:'#f3f5f7',style:'bob',x:18,y:7,desk:[18,7]},
    {id:'kevin',name:'Kevin',role:'Recherche',skin:'#dcae84',skinHi:'#f2c49a',hair:'#9b5f32',hairHi:'#c98548',body:'#426852',bodyHi:'#5d886d',accent:'#deeadf',style:'spiky',x:7,y:11,desk:[7,11]},
    {id:'gisela',name:'Gisela',role:'Wissen & Archiv',skin:'#d3a17b',skinHi:'#e8b690',hair:'#bab8ad',hairHi:'#e1ddd2',body:'#67465a',bodyHi:'#845e74',accent:'#eee5dc',style:'graybob',x:11,y:11,desk:[11,11]},
    {id:'lina',name:'Lina',role:'Kalender',skin:'#c99070',skinHi:'#dfa889',hair:'#28211f',hairHi:'#493a35',body:'#744b3a',bodyHi:'#97684f',accent:'#efdfca',style:'long',x:15,y:11,desk:[15,11]},
    {id:'walter',name:'Walter',role:'Technik',skin:'#ca9874',skinHi:'#dfae8a',hair:'#b5b3ac',hairHi:'#dedbd2',body:'#3a4e59',bodyHi:'#58717c',accent:'#d7e4e8',style:'grayshort',x:19,y:11,desk:[19,11]},
    {id:'sarah',name:'Sarah',role:'Kontakte',skin:'#be8261',skinHi:'#d99d7d',hair:'#2b211f',hairHi:'#4a3833',body:'#65527a',bodyHi:'#826b99',accent:'#ece0f2',style:'bun',x:11,y:20,desk:[11,20]},
    {id:'finn',name:'Finn',role:'Follow-ups',skin:'#d5a07b',skinHi:'#ecb991',hair:'#59402e',hairHi:'#806047',body:'#4a5878',bodyHi:'#66779c',accent:'#e1e7ef',style:'short2',x:14,y:20,desk:[14,20]}
  ];

  const objects=[
    {type:'frame',x:0,y:0,w:24,h:32,layer:0},
    {type:'brandWall',x:2,y:1,w:20,h:3,layer:0},
    {type:'glassOffice',x:2,y:4,w:7,h:5,layer:1,variant:'left'},
    {type:'doorBank',x:10,y:4,w:4,h:4,layer:1},
    {type:'glassOffice',x:15,y:4,w:7,h:5,layer:1,variant:'right'},
    {type:'poster',x:.5,y:4.3,w:1.5,h:5,layer:1,side:'left'},
    {type:'poster',x:22,y:4.2,w:1.5,h:5,layer:1,side:'right'},
    {type:'counterDesk',x:5,y:10,w:6,h:2.8,layer:1,variant:0},
    {type:'counterDesk',x:13,y:10,w:6,h:2.8,layer:1,variant:1},
    {type:'stairs',x:0,y:12,w:2.5,h:8,layer:1,side:'left'},
    {type:'stairs',x:21.5,y:12,w:2.5,h:8,layer:1,side:'right'},
    {type:'techPod',x:5.5,y:14,w:13,h:4,layer:1},
    {type:'reception',x:8,y:18,w:8,h:4,layer:1},
    {type:'logo',x:8.5,y:22.3,w:7,h:4.3,layer:0},
    {type:'sofa',x:1,y:24.2,w:4,h:2.5,layer:1,side:'left'},
    {type:'sofa',x:19,y:24.2,w:4,h:2.5,layer:1,side:'right'},
    {type:'entry',x:9.2,y:29,w:5.6,h:3,layer:1},
    {type:'server',x:18.6,y:14.2,w:1.8,h:3.5,layer:1},
    {type:'plant',x:2.3,y:9.2,w:1,h:1,layer:2},
    {type:'plant',x:6.1,y:9.0,w:1,h:1,layer:2},
    {type:'plant',x:11.8,y:8.9,w:1,h:1,layer:2},
    {type:'plant',x:18.7,y:9.0,w:1,h:1,layer:2},
    {type:'plant',x:20.8,y:9.2,w:1,h:1,layer:2},
    {type:'plant',x:4.1,y:23.0,w:1,h:1,layer:2},
    {type:'plant',x:18.8,y:23.0,w:1,h:1,layer:2},
    {type:'plant',x:4.0,y:27.0,w:1,h:1,layer:2},
    {type:'plant',x:19.5,y:27.3,w:1,h:1,layer:2}
  ];

  const collisions=[
    [0,0,24,1],[0,31,24,1],[0,0,1,32],[23,0,1,32],
    [2,4,7,5],[10,4,4,4],[15,4,7,5],
    [5,10,6,3],[13,10,6,3],
    [0,12,3,8],[21,12,3,8],
    [5,14,14,4],[8,18,8,4],
    [1,24,4,3],[19,24,4,3],
    [9,29,6,3],[18,14,3,4]
  ];

  window.NEXUS_MAP={
    version:'2.4',tile:T,cols:24,rows:32,width:24*T,height:32*T,
    floor:{base:'#ebcb8b',alt:'#f2d79c',line:'#d7b675',highlight:'#fae9c3'},
    team,objects,collisions,meetingSpot:[12,27],doorSpot:[12,8]
  };
})();
