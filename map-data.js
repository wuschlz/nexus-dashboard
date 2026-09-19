(() => {
  const T=40;

  const team=[
    {id:'james',name:'James',role:'Leitung',skin:'#d8a47b',skinHi:'#f0c099',hair:'#36241f',hairHi:'#5a3d31',body:'#233a57',bodyHi:'#3b5b82',accent:'#e7eef4',style:'short',x:4,y:5,desk:[4,5]},
    {id:'nora',name:'Nora',role:'Mail',skin:'#d9a481',skinHi:'#efbd9a',hair:'#503228',hairHi:'#795243',body:'#263f67',bodyHi:'#3a5d8c',accent:'#edf2f6',style:'bob',x:18,y:5,desk:[18,5]},
    {id:'kevin',name:'Kevin',role:'Recherche',skin:'#dcae84',skinHi:'#f2c49a',hair:'#9b5f32',hairHi:'#c98548',body:'#426852',bodyHi:'#5d886d',accent:'#deeadf',style:'spiky',x:5,y:8,desk:[5,8]},
    {id:'gisela',name:'Gisela',role:'Wissen & Archiv',skin:'#d3a17b',skinHi:'#e8b690',hair:'#bab8ad',hairHi:'#e1ddd2',body:'#67465a',bodyHi:'#845e74',accent:'#eee5dc',style:'graybob',x:10,y:8,desk:[10,8]},
    {id:'lina',name:'Lina',role:'Kalender',skin:'#c99070',skinHi:'#dfa889',hair:'#28211f',hairHi:'#493a35',body:'#744b3a',bodyHi:'#97684f',accent:'#efdfca',style:'long',x:15,y:8,desk:[15,8]},
    {id:'walter',name:'Walter',role:'Technik',skin:'#ca9874',skinHi:'#dfae8a',hair:'#b5b3ac',hairHi:'#dedbd2',body:'#3a4e59',bodyHi:'#58717c',accent:'#d7e4e8',style:'grayshort',x:19,y:8,desk:[19,8]},
    {id:'sarah',name:'Sarah',role:'Kontakte',skin:'#be8261',skinHi:'#d99d7d',hair:'#2b211f',hairHi:'#4a3833',body:'#65527a',bodyHi:'#826b99',accent:'#ece0f2',style:'bun',x:10,y:14,desk:[10,14]},
    {id:'finn',name:'Finn',role:'Follow-ups',skin:'#d5a07b',skinHi:'#ecb991',hair:'#59402e',hairHi:'#806047',body:'#4a5878',bodyHi:'#66779c',accent:'#e1e7ef',style:'short2',x:14,y:14,desk:[14,14]}
  ];

  const objects=[
    {type:'topWall',x:0,y:0,w:24,h:1,layer:0},
    {type:'glassOffice',x:1,y:1,w:7,h:4,layer:1,label:'JAMES'},
    {type:'elevator',x:9,y:1,w:5,h:3,layer:1},
    {type:'glassOffice',x:15,y:1,w:7,h:4,layer:1,label:'NORA'},
    {type:'stairs',x:0,y:6,w:3,h:7,layer:1,side:'left'},
    {type:'stairs',x:21,y:6,w:3,h:7,layer:1,side:'right'},
    {type:'desk',x:4,y:6,w:4,h:2,layer:1,variant:0},
    {type:'desk',x:9,y:6,w:4,h:2,layer:1,variant:1},
    {type:'desk',x:14,y:6,w:4,h:2,layer:1,variant:2},
    {type:'desk',x:18,y:6,w:3,h:2,layer:1,variant:3},
    {type:'techPod',x:7,y:9,w:10,h:2,layer:1},
    {type:'reception',x:8,y:11,w:8,h:3,layer:1},
    {type:'logo',x:9.5,y:14,w:5,h:1.6,layer:0},
    {type:'sofa',x:1,y:12,w:3,h:2,layer:1},
    {type:'sofa',x:19,y:12,w:3,h:2,layer:1},
    {type:'plant',x:3.2,y:5.1,w:1,h:1,layer:2},
    {type:'plant',x:7.3,y:5.0,w:1,h:1,layer:2},
    {type:'plant',x:13.1,y:5.0,w:1,h:1,layer:2},
    {type:'plant',x:19.8,y:5.1,w:1,h:1,layer:2},
    {type:'plant',x:4.0,y:14.0,w:1,h:1,layer:2},
    {type:'plant',x:18.0,y:14.0,w:1,h:1,layer:2}
  ];

  const collisions=[
    [1,1,7,4],[9,1,5,3],[15,1,7,4],
    [0,6,3,7],[21,6,3,7],
    [4,6,4,2],[9,6,4,2],[14,6,4,2],[18,6,3,2],
    [7,9,10,2],[8,11,8,3],[1,12,3,2],[19,12,3,2]
  ];

  window.NEXUS_MAP={
    version:'2.2',
    tile:T,
    cols:24,
    rows:16,
    width:24*T,
    height:16*T,
    floor:{base:'#e7c98e',alt:'#efd7a5',line:'#d0ad73',highlight:'#f7e6bf'},
    team,
    objects,
    collisions,
    meetingSpot:[12,15],
    doorSpot:[12,4]
  };
})();
