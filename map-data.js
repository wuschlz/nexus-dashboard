(() => {
  const T=32;
  const team=[
    {id:'james',name:'James',role:'Leitung',skin:'#d8a47b',skinHi:'#efc097',hair:'#35241f',hairHi:'#5c4034',body:'#213955',bodyHi:'#3a5b82',accent:'#eef2f5',style:'short',detail:'leader',beard:'#4b352e',trouser:'#1b293a',shoe:'#3a2b27',pin:'#35d6e9',folio:'#162432',x:5,y:7,desk:[5,7]},
    {id:'nora',name:'Nora',role:'Mail',skin:'#d9a481',skinHi:'#efbd9a',hair:'#503228',hairHi:'#7b5646',body:'#263f67',bodyHi:'#3b5e8e',accent:'#f3f5f7',style:'bob',detail:'mail',x:18,y:7,desk:[18,7]},
    {id:'kevin',name:'Kevin',role:'Recherche',skin:'#dcae84',skinHi:'#f2c49a',hair:'#9b5f32',hairHi:'#c98548',body:'#426852',bodyHi:'#5d886d',accent:'#deeadf',style:'spiky',detail:'research',x:7,y:11,desk:[7,11]},
    {id:'gisela',name:'Gisela',role:'Wissen & Archiv',skin:'#d3a17b',skinHi:'#e8b690',hair:'#bab8ad',hairHi:'#e1ddd2',body:'#67465a',bodyHi:'#845e74',accent:'#eee5dc',style:'graybob',detail:'archive',x:11,y:11,desk:[11,11]},
    {id:'lina',name:'Lina',role:'Kalender',skin:'#c99070',skinHi:'#dfa889',hair:'#28211f',hairHi:'#493a35',body:'#744b3a',bodyHi:'#97684f',accent:'#efdfca',style:'long',detail:'calendar',x:15,y:11,desk:[15,11]},
    {id:'walter',name:'Walter',role:'Technik',skin:'#ca9874',skinHi:'#dfae8a',hair:'#b5b3ac',hairHi:'#dedbd2',body:'#3a4e59',bodyHi:'#58717c',accent:'#d7e4e8',style:'grayshort',detail:'tech',x:19,y:11,desk:[19,11]},
    {id:'sarah',name:'Sarah',role:'Kontakte',skin:'#be8261',skinHi:'#d99d7d',hair:'#2b211f',hairHi:'#4a3833',body:'#65527a',bodyHi:'#826b99',accent:'#ece0f2',style:'bun',detail:'contacts',x:11,y:20,desk:[11,20]},
    {id:'finn',name:'Finn',role:'Follow-ups',skin:'#d5a07b',skinHi:'#ecb991',hair:'#59402e',hairHi:'#806047',body:'#4a5878',bodyHi:'#66779c',accent:'#e1e7ef',style:'short2',detail:'followup',x:14,y:20,desk:[14,20]}
  ];

  const objects=[
    {type:'frame',x:0,y:0,w:24,h:32,layer:0},

    // One continuous back wall: the upper rooms are embedded in this same floor.
    {type:'topBackWall',x:1,y:1,w:22,h:2.25,layer:0},
    {type:'embeddedOffice',x:2,y:3.15,w:7.4,h:5.15,layer:1,variant:'left'},
    {type:'wallCore',x:9.7,y:3.15,w:4.6,h:5.15,layer:1,doorId:'mainMeetingDoor'},
    {type:'embeddedOffice',x:14.6,y:3.15,w:7.4,h:5.15,layer:1,variant:'right'},
    {type:'topTransition',x:1.6,y:8.3,w:20.8,h:1.05,layer:1},

    {type:'counterDesk',x:5,y:10,w:6,h:2.8,layer:1,variant:0},
    {type:'counterDesk',x:13,y:10,w:6,h:2.8,layer:1,variant:1},
    {type:'techPod',x:5.5,y:14,w:13,h:4,layer:1},
    {type:'reception',x:8,y:18,w:8,h:4,layer:1},
    {type:'logo',x:8.5,y:22.3,w:7,h:4.3,layer:0},
    {type:'sofa',x:1,y:24.2,w:4,h:2.5,layer:1,side:'left'},
    {type:'sofa',x:19,y:24.2,w:4,h:2.5,layer:1,side:'right'},
    {type:'entry',x:9.2,y:29,w:5.6,h:3,layer:1},
    {type:'server',x:18.25,y:13.9,w:2.2,h:4.5,layer:1},

    {type:'plant',x:2.3,y:9.2,w:1,h:1,layer:2},
    {type:'plant',x:6.1,y:9.0,w:1,h:1,layer:2},
    {type:'plant',x:18.7,y:9.0,w:1,h:1,layer:2},
    {type:'plant',x:20.8,y:9.2,w:1,h:1,layer:2},
    {type:'plant',x:4.1,y:23.0,w:1,h:1,layer:2},
    {type:'plant',x:18.8,y:23.0,w:1,h:1,layer:2},
    {type:'plant',x:4.0,y:27.0,w:1,h:1,layer:2},
    {type:'plant',x:19.5,y:27.3,w:1,h:1,layer:2}
  ];

  const collisions=[
    [0,0,24,1],[0,31,24,1],[0,0,1,32],[23,0,1,32],

    // Back wall and embedded same-level offices. Door gaps remain walkable.
    [1,1,22,2],
    [2,3,7,1],[2,3,1,5],[8,3,1,5],[2,7,3,1],[6,7,3,1],
    [10,3,4,5],
    [15,3,7,1],[15,3,1,5],[21,3,1,5],[15,7,3,1],[19,7,3,1],

    [5,10,6,3],[13,10,6,3],
    [5,14,14,4],[8,18,8,4],
    [1,24,4,3],[19,24,4,3],
    [9,29,6,3],[18,14,3,4]
  ];

  const meetingObjects=[
    {type:'meetingShell',x:0,y:0,w:24,h:32,layer:0},
    {type:'meetingScreen',x:5.15,y:3.45,w:13.7,h:3.0,layer:1},
    {type:'meetingWhiteboard',x:18.15,y:6.75,w:3.45,h:8.35,layer:1},
    {type:'meetingTable',x:5.85,y:9.0,w:12.3,h:8.7,layer:1},
    {type:'meetingDoor',x:9.6,y:27.65,w:4.8,h:3.25,layer:1,doorId:'meetingExitDoor'},
    {type:'plant',x:3.35,y:4.35,w:1,h:1,layer:2},
    {type:'plant',x:19.65,y:4.35,w:1,h:1,layer:2},
    {type:'plant',x:4.15,y:25.35,w:1,h:1,layer:2},
    {type:'plant',x:18.85,y:25.35,w:1,h:1,layer:2}
  ];

  const meetingCollisions=[
    [0,0,24,2],[0,30,24,2],[0,0,2,32],[22,0,2,32],
    [18,6,4,10],
    [5,8,14,11]
  ];

  const scenes={
    main:{
      id:'main',
      objects,
      collisions,
      portals:[
        {
          id:'main-to-meeting',
          doorId:'mainMeetingDoor',
          target:'meeting',
          targetDoorId:'meetingExitDoor',
          clickRect:[9.6,3.0,4.8,6.2],
          approach:[12,8],
          sourceFacing:'up',
          targetFacing:'up',
          exitVector:[0,-1]
        }
      ]
    },
    meeting:{
      id:'meeting',
      camera:{scale:1.20,center:[12,16.8]},
      objects:meetingObjects,
      collisions:meetingCollisions,
      portals:[
        {
          id:'meeting-to-main',
          doorId:'meetingExitDoor',
          target:'main',
          targetDoorId:'mainMeetingDoor',
          clickRect:[9.2,27.0,5.6,5.0],
          approach:[12,27],
          sourceFacing:'down',
          targetFacing:'down',
          exitVector:[0,1]
        }
      ]
    }
  };

  window.NEXUS_MAP={
    version:'2.15',tile:T,cols:24,rows:32,width:24*T,height:32*T,
    floor:{stone:'#d7d9d6',stoneAlt:'#cfd3d1',stoneWarm:'#ddd9d1',grout:'#b7bfbd',highlight:'#f3f5f2',graphite:'#1f2b36',graphiteAlt:'#273642',oak:'#a97f5c',oakAlt:'#bc9169',oakDark:'#765944',metal:'#8f9ba2',cyan:'#35d6e9'},
    team,objects,collisions,scenes,meetingSpot:[12,27],doorSpot:[12,8]
  };
})();
