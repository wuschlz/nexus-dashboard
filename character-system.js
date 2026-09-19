(() => {
  const actions = Object.freeze([
    'idle','walk','wave',
    'sit','stand','jump','type','talk','phone','meeting','celebrate'
  ]);

  const list = Object.freeze([
    { id:'james',  name:'James',  role:'Leitung',         icon:'crown',    asset:'James_NEXUS_Animated.glb',  rootName:'JamesRoot',  deskNode:'v17DeskJames',  assetReady:true  },
    { id:'nora',   name:'Nora',   role:'Mail',            icon:'mail',     asset:'Nora_NEXUS_Animated.glb',   rootName:'NoraRoot',   deskNode:'v17DeskNora',   assetReady:true  },
    { id:'kevin',  name:'Kevin',  role:'Recherche',       icon:'search',   asset:'Kevin_NEXUS_Animated.glb',  rootName:'KevinRoot',  deskNode:'v17DeskKevin',  assetReady:false },
    { id:'gisela', name:'Gisela', role:'Wissen & Archiv', icon:'database', asset:'Gisela_NEXUS_Animated.glb', rootName:'GiselaRoot', deskNode:'v17DeskGisela', assetReady:false },
    { id:'lina',   name:'Lina',   role:'Kalender',        icon:'calendar', asset:'Lina_NEXUS_Animated.glb',   rootName:'LinaRoot',   deskNode:'v17DeskLina',   assetReady:false },
    { id:'walter', name:'Walter', role:'Technik',         icon:'wrench',   asset:'Walter_NEXUS_Animated.glb', rootName:'WalterRoot', deskNode:'v17DeskWalter', assetReady:false },
    { id:'sarah',  name:'Sarah',  role:'Kontakte',        icon:'people',   asset:'Sarah_NEXUS_Animated.glb',  rootName:'SarahRoot',  deskNode:'v17DeskSarah',  assetReady:false },
    { id:'finn',   name:'Finn',   role:'Follow-ups',      icon:'check',    asset:'Finn_NEXUS_Animated.glb',   rootName:'FinnRoot',   deskNode:'v17DeskFinn',   assetReady:false }
  ]);

  const byName = Object.freeze(Object.fromEntries(list.map(def => [def.name, def])));
  const byId = Object.freeze(Object.fromEntries(list.map(def => [def.id, def])));

  window.NEXUS_CHARACTER_CATALOG = Object.freeze({
    version: 2,
    actions,
    list,
    byName,
    byId
  });
})();
