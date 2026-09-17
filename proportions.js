(() => {
  function applyProportions() {
    if (!window.BABYLON || !BABYLON.EngineStore) return false;
    const scene = BABYLON.EngineStore.LastCreatedScene;
    if (!scene) return false;

    // Human scale: James should read like an adult next to a ~75 cm desk,
    // without turning the office into a giant room.
    const james = scene.getTransformNodeByName('JamesRoot');
    if (!james) return false;
    james.scaling.setAll(1.62);

    // More natural office-chair proportions: seat around 46 cm,
    // back around 1.1 m, base close to the floor.
    const chairPrefixes = [
      'JamesChair','NoraChair','KevinChair','GiselaChair','LinaChair',
      'WalterChair','FinnChair','SarahChair','meetL','meetR','meetT','meetB'
    ];
    for (const prefix of chairPrefixes) {
      const base = scene.getMeshByName(prefix + 'Base');
      const stem = scene.getMeshByName(prefix + 'Stem');
      const seat = scene.getMeshByName(prefix + 'Seat');
      const back = scene.getMeshByName(prefix + 'Back');
      if (base) base.position.y = 0.08;
      if (stem) stem.position.y = 0.28;
      if (seat) seat.position.y = 0.47;
      if (back) back.position.y = 0.80;
    }

    // Monitors were visually oversized. Bring them closer to a modern
    // 24–27 inch display relative to the desks and character.
    const monitorPrefixes = [
      'JamesMon','NoraMon','KevinMon','GiselaMon','LinaMon',
      'WalterMon','FinnMon','SarahMon'
    ];
    for (const prefix of monitorPrefixes) {
      const frame = scene.getMeshByName(prefix + 'Frame');
      const screen = scene.getMeshByName(prefix + 'Screen');
      const stand = scene.getMeshByName(prefix + 'Stand');
      if (frame) { frame.scaling.x *= 0.80; frame.scaling.y *= 0.84; frame.position.y = 1.12; }
      if (screen) { screen.scaling.x *= 0.80; screen.scaling.y *= 0.84; screen.position.y = 1.12; }
      if (stand) { stand.scaling.y *= 0.82; stand.position.y = 0.91; }
    }

    // Slightly less oversized desk surfaces while retaining generous spacing.
    const deskPrefixes = [
      'JamesDesk','NoraDesk','KevinDesk','GiselaDesk','LinaDesk',
      'WalterDesk','FinnDesk','SarahDesk','meetTable'
    ];
    for (const prefix of deskPrefixes) {
      const top = scene.getMeshByName(prefix + 'Top');
      const beam = scene.getMeshByName(prefix + 'Beam');
      const led = scene.getMeshByName(prefix + 'Led');
      if (top) { top.scaling.x *= 0.92; top.scaling.z *= 0.94; top.position.y = 0.74; }
      if (beam) beam.scaling.x *= 0.92;
      if (led) led.scaling.x *= 0.92;
    }

    // Bring the isometric camera a little closer so people and furniture
    // are easier to judge on a phone without changing the office layout.
    const camera = scene.activeCamera;
    if (camera && typeof camera.radius === 'number') {
      camera.radius = 16.0;
      camera.target = new BABYLON.Vector3(0, 1.05, 0.15);
    }

    const feed = document.getElementById('activityFeed');
    if (feed) {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = '<div class="activity-time">Preview</div><div class="activity-text">Proportionen v6 angepasst</div>';
      feed.prepend(item);
      while (feed.children.length > 3) feed.removeChild(feed.lastChild);
    }
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (applyProportions() || tries > 100) clearInterval(timer);
  }, 100);
})();
