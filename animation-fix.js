(() => {
  if (!window.BABYLON || !BABYLON.AnimationGroup) return;

  const originalStart = BABYLON.AnimationGroup.prototype.start;

  function fixWalkRootMotion(group) {
    if (!group || group.__nexusWalkLoopFixed || group.name !== 'Standard Walk') return;

    let fixed = false;
    for (const targeted of group.targetedAnimations || []) {
      const targetName = targeted.target && targeted.target.name ? targeted.target.name : '';
      const animation = targeted.animation;
      if (!animation || !targetName.includes('Hips')) continue;
      if (animation.targetProperty !== 'position') continue;

      const keys = animation.getKeys();
      if (!keys || keys.length < 2) continue;

      const first = keys[0];
      const last = keys[keys.length - 1];
      if (!first.value || !last.value || typeof first.value.z !== 'number') continue;

      const span = (last.frame - first.frame) || 1;
      const driftX = last.value.x - first.value.x;
      const driftZ = last.value.z - first.value.z;

      const patchedKeys = keys.map(key => {
        const t = (key.frame - first.frame) / span;
        const value = key.value.clone ? key.value.clone() : new BABYLON.Vector3(key.value.x, key.value.y, key.value.z);
        value.x -= driftX * t;
        value.z -= driftZ * t;
        return {
          ...key,
          value
        };
      });

      animation.setKeys(patchedKeys);
      fixed = true;
    }

    group.__nexusWalkLoopFixed = true;
    if (fixed) console.info('[NEXUS] Standard Walk root motion removed for seamless looping.');
  }

  BABYLON.AnimationGroup.prototype.start = function(loop, speedRatio, from, to, isAdditive) {
    fixWalkRootMotion(this);
    return originalStart.call(this, loop, speedRatio, from, to, isAdditive);
  };
})();
