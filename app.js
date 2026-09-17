(() => {
  const loading = document.getElementById('loading');
  const feed = document.getElementById('activityFeed');

  function log(text) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    const t = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    item.innerHTML = `<div class="activity-time">${t}</div><div class="activity-text">${text}</div>`;
    feed.prepend(item);
    while (feed.children.length > 3) feed.removeChild(feed.lastChild);
  }

  const team = [
    ['James', 'Leitung', true],
    ['Nora', 'Mail', false],
    ['Kevin', 'Recherche', false],
    ['Gisela', 'Wissen', false],
    ['Lina', 'Kalender', false],
    ['Walter', 'Technik', false],
    ['Sarah', 'Kontakte', false],
    ['Finn', 'Follow-ups', false],
  ];

  const teamList = document.getElementById('teamList');
  for (const [name, role, ready] of team) {
    const el = document.createElement('div');
    el.className = 'person' + (name === 'James' ? ' selected' : '');
    el.innerHTML = `
      <div class="avatar">${name.slice(0, 2).toUpperCase()}</div>
      <div><div class="person-name">${name}</div><div class="person-role">${role}</div></div>
      <span class="person-state ${ready ? 'ready' : ''}"></span>`;
    el.addEventListener('click', () => {
      document.querySelectorAll('.person').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('inspectorName').textContent = name;
      document.getElementById('inspectorRole').textContent = role;
      document.getElementById('assetState').textContent = ready ? 'geladen' : 'noch offen';
      document.getElementById('inspectorStatus').textContent = ready ? 'Ready' : '3D Asset pending';
    });
    teamList.appendChild(el);
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('viewTitle').textContent = btn.textContent;
    });
  });

  log('Dashboard-JavaScript gestartet');

  if (!window.BABYLON) {
    loading.textContent = '3D-Engine konnte nicht geladen werden.';
    document.getElementById('assetState').textContent = 'Engine-Fehler';
    log('Babylon.js nicht verfügbar');
    return;
  }

  const canvas = document.getElementById('officeCanvas');
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true }, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.043, 0.063, 0.09, 1);

  const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 4, 1.05, 13, new BABYLON.Vector3(0, 1.1, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 6;
  camera.upperRadiusLimit = 18;
  camera.lowerBetaLimit = 0.45;
  camera.upperBetaLimit = 1.45;
  camera.wheelPrecision = 45;
  camera.pinchPrecision = 120;

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 1.1;
  hemi.diffuse = new BABYLON.Color3(0.78, 0.88, 1);
  hemi.groundColor = new BABYLON.Color3(0.12, 0.15, 0.2);

  const key = new BABYLON.DirectionalLight('key', new BABYLON.Vector3(-0.5, -1, -0.4), scene);
  key.position = new BABYLON.Vector3(6, 9, 7);
  key.intensity = 1.6;

  function material(name, hex, rough = 0.75, metal = 0) {
    const m = new BABYLON.PBRMaterial(name, scene);
    const c = BABYLON.Color3.FromHexString(hex);
    m.albedoColor = c;
    m.roughness = rough;
    m.metallic = metal;
    return m;
  }

  function box(name, w, h, d, x, y, z, hex, rough = 0.75, metal = 0) {
    const mesh = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.position.set(x, y, z);
    mesh.material = material(name + 'Mat', hex, rough, metal);
    return mesh;
  }

  function cyl(name, diameter, height, x, y, z, hex) {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(name, { diameter, height, tessellation: 24 }, scene);
    mesh.position.set(x, y, z);
    mesh.material = material(name + 'Mat', hex, 0.8, 0);
    return mesh;
  }

  box('floor', 15, 0.18, 10, 0, -0.09, 0, '#1b222c', 0.95, 0);
  box('backWall', 15, 3.4, 0.18, 0, 1.7, -5, '#18202a', 0.9, 0);
  box('leftWall', 0.18, 3.4, 10, -7.5, 1.7, 0, '#141b24', 0.9, 0);

  const desks = [
    [-3.8, -2.8], [-0.9, -2.8], [2.0, -2.8], [4.9, -2.8],
    [-3.8, 2.0], [-0.9, 2.0], [2.0, 2.0], [4.9, 2.0],
  ];

  desks.forEach(([x, z], i) => {
    box('desk' + i, 2.15, 0.12, 1.05, x, 0.72, z, '#5b4332', 0.6, 0);
    box('deskLegL' + i, 0.12, 1.38, 0.8, x - 0.85, 0.02, z, '#222831', 0.55, 0.25);
    box('deskLegR' + i, 0.12, 1.38, 0.8, x + 0.85, 0.02, z, '#222831', 0.55, 0.25);
    box('monitor' + i, 0.86, 0.53, 0.06, x, 1.2, z - 0.18, '#0a0d12', 0.3, 0.35);
    box('screen' + i, 0.77, 0.44, 0.015, x, 1.2, z - 0.145, '#164268', 0.35, 0.05);
    box('stand' + i, 0.08, 0.35, 0.08, x, 0.94, z - 0.18, '#222831', 0.45, 0.35);
    cyl('seat' + i, 0.68, 0.10, x, 0.46, z + 0.65, '#222933');
    box('chairBack' + i, 0.72, 0.86, 0.10, x, 0.92, z + 0.93, '#222933', 0.85, 0);
  });

  box('meetingTable', 2.7, 0.12, 1.25, 4.8, 0.73, -1.75, '#433628', 0.58, 0);
  [[4.1, -1.15], [5.5, -1.15], [4.1, -2.35], [5.5, -2.35]].forEach(([x, z], i) => {
    cyl('meetingChair' + i, 0.6, 0.10, x, 0.45, z, '#202831');
  });

  const glassMat = new BABYLON.PBRMaterial('glassMat', scene);
  glassMat.albedoColor = new BABYLON.Color3(0.5, 0.75, 1);
  glassMat.alpha = 0.22;
  glassMat.metallic = 0;
  glassMat.roughness = 0.08;
  const glassA = BABYLON.MeshBuilder.CreateBox('glassA', { width: 4.0, height: 2.7, depth: 0.06 }, scene);
  glassA.position.set(4.8, 1.35, 0.1);
  glassA.material = glassMat;
  const glassB = BABYLON.MeshBuilder.CreateBox('glassB', { width: 0.06, height: 2.7, depth: 3.8 }, scene);
  glassB.position.set(2.82, 1.35, -1.78);
  glassB.material = glassMat;

  [[-6.6, -4.1], [6.6, 3.9], [2.7, 4.0]].forEach(([x, z], i) => {
    cyl('plantPot' + i, 0.64, 0.5, x, 0.25, z, '#3a332b');
    cyl('plantStem' + i, 0.10, 0.9, x, 0.8, z, '#35543b');
    for (let n = 0; n < 5; n++) {
      const leaf = BABYLON.MeshBuilder.CreateSphere('leaf' + i + '_' + n, { diameter: 0.42, segments: 12 }, scene);
      leaf.scaling.set(0.7, 1.6, 0.45);
      leaf.position.set(x + Math.sin(n * 1.25) * 0.25, 0.95 + n * 0.09, z + Math.cos(n * 1.25) * 0.2);
      leaf.rotation.z = n * 0.55;
      leaf.material = material('leafMat' + i + '_' + n, '#2d6b4b', 0.9, 0);
    }
  });

  const locations = {
    desk: new BABYLON.Vector3(-3.8, 0, -1.95),
    meeting: new BABYLON.Vector3(4.0, 0, -0.75),
  };

  let jamesRoot = null;
  let groups = {};
  let currentGroup = null;
  let travel = null;

  function setActiveButton(id) {
    document.querySelectorAll('.scene-actions .chip').forEach(x => x.classList.remove('active'));
    const b = document.getElementById(id);
    if (b) b.classList.add('active');
  }

  function play(name, loop) {
    const g = groups[name];
    if (!g) return;
    Object.values(groups).forEach(group => {
      if (group !== g) group.stop();
    });
    g.loopAnimation = !!loop;
    g.start(!!loop, 1.0, g.from, g.to, false);
    currentGroup = g;
    document.getElementById('currentAnim').textContent = name;
    log('James → ' + name);
  }

  function resolveAnimations(animationGroups) {
    const names = animationGroups.map(g => g.name);
    animationGroups.forEach(g => { groups[g.name] = g; g.stop(); });
    if (!groups['Neutral Idle'] && animationGroups[0]) groups['Neutral Idle'] = animationGroups[0];
    if (!groups['Standard Walk'] && animationGroups[1]) groups['Standard Walk'] = animationGroups[1];
    if (!groups['Waving'] && animationGroups[2]) groups['Waving'] = animationGroups[2];
    log('Animationen erkannt: ' + names.join(' · '));
  }

  loading.textContent = 'James wird geladen …';

  BABYLON.SceneLoader.ImportMeshAsync('', './assets/', 'James_NEXUS_Animated.glb', scene)
    .then(result => {
      jamesRoot = new BABYLON.TransformNode('JamesRoot', scene);
      result.meshes.forEach(mesh => {
        if (!mesh.parent) mesh.parent = jamesRoot;
      });
      jamesRoot.position.copyFrom(locations.desk);
      jamesRoot.scaling.setAll(1);
      resolveAnimations(result.animationGroups || []);
      play('Neutral Idle', true);
      loading.style.display = 'none';
      document.getElementById('assetState').textContent = 'geladen';
      document.getElementById('inspectorStatus').textContent = 'Ready';
      log('James 3D geladen');
    })
    .catch(err => {
      console.error(err);
      loading.textContent = 'James konnte nicht geladen werden.';
      document.getElementById('assetState').textContent = 'GLB-Fehler';
      log('GLB-Ladefehler');
    });

  function travelTo(targetName) {
    if (!jamesRoot) return;
    const from = jamesRoot.position.clone();
    const to = locations[targetName].clone();
    const delta = to.subtract(from);
    const dist = delta.length();
    if (dist < 0.05) {
      play('Neutral Idle', true);
      return;
    }
    const dir = delta.normalize();
    jamesRoot.rotation.y = Math.atan2(dir.x, dir.z);
    travel = {
      from,
      to,
      started: performance.now(),
      duration: Math.max(1800, dist * 700),
      targetName,
    };
    play('Standard Walk', true);
  }

  document.getElementById('idleBtn').addEventListener('click', () => {
    travel = null;
    play('Neutral Idle', true);
    setActiveButton('idleBtn');
  });
  document.getElementById('walkBtn').addEventListener('click', () => {
    travel = null;
    play('Standard Walk', true);
    setActiveButton('walkBtn');
  });
  document.getElementById('waveBtn').addEventListener('click', () => {
    travel = null;
    play('Waving', false);
    setActiveButton('waveBtn');
  });
  document.getElementById('meetingBtn').addEventListener('click', () => {
    travelTo('meeting');
    setActiveButton('meetingBtn');
  });
  document.getElementById('deskBtn').addEventListener('click', () => {
    travelTo('desk');
    setActiveButton('deskBtn');
  });

  scene.onBeforeRenderObservable.add(() => {
    if (!travel || !jamesRoot) return;
    const t = Math.min(1, (performance.now() - travel.started) / travel.duration);
    const smooth = t * t * (3 - 2 * t);
    jamesRoot.position = BABYLON.Vector3.Lerp(travel.from, travel.to, smooth);
    if (t >= 1) {
      jamesRoot.position.copyFrom(travel.to);
      const where = travel.targetName === 'desk' ? 'Schreibtisch' : 'Meetingraum';
      travel = null;
      play('Neutral Idle', true);
      setActiveButton('idleBtn');
      log('James angekommen: ' + where);
    }
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());
  setTimeout(() => engine.resize(), 100);
})();
