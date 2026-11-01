import * as THREE from 'three';

/**
 * 🦋 Meadow Butterflies System
 * Living procedural 3D butterflies that flutter organically across the infinite meadow,
 * visit blooming flowers randomly, and fly directly to spotlighted flowers when searched.
 */
export class MeadowButterflies {
  constructor(scene, getFlowersFn, getTerrainHeightFn, count = 7) {
    this.scene = scene;
    this.getFlowers = getFlowersFn;
    this.getTerrainHeight = getTerrainHeightFn;
    this.count = count;
    this.butterflies = [];

    this.speciesPalettes = [
      { name: 'Monarch', color: 0xff851b, edgeColor: 0x111111, size: 0.20 },
      { name: 'Azure Blue', color: 0x4fc3f7, edgeColor: 0x0277bd, size: 0.18 },
      { name: 'Swallowtail Gold', color: 0xffd54f, edgeColor: 0x212121, size: 0.22 },
      { name: 'Emerald Teardrop', color: 0x69f0ae, edgeColor: 0x004d40, size: 0.19 },
      { name: 'Lavender Gossamer', color: 0xce93d8, edgeColor: 0x4a148c, size: 0.17 },
      { name: 'Saffron Pearl', color: 0xffab91, edgeColor: 0xbf360c, size: 0.21 },
      { name: 'Celadon White', color: 0xf1f8e9, edgeColor: 0x33691e, size: 0.18 }
    ];

    this.wingGeometry = this.createWingGeometry();
    this.bodyGeometry = new THREE.CylinderGeometry(0.004, 0.003, 0.055, 6);
    this.bodyGeometry.rotateX(Math.PI / 2); // align along Z forward
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x181412,
      roughness: 0.7,
      metalness: 0.1
    });

    this.initButterflies();
  }

  /**
   * Sculpted authentic botanical butterfly wing geometry using Bezier curves.
   */
  createWingGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // Root / hinge point
    shape.bezierCurveTo(0.03, 0.06, 0.08, 0.13, 0.13, 0.12);  // Forewing apex
    shape.bezierCurveTo(0.14, 0.08, 0.11, 0.02, 0.08, -0.01); // Outer forewing margin
    shape.bezierCurveTo(0.10, -0.05, 0.08, -0.11, 0.04, -0.09); // Hindwing scallop
    shape.bezierCurveTo(0.01, -0.05, 0.005, -0.02, 0, 0);      // Inner margin to base
    return new THREE.ShapeGeometry(shape, 10);
  }

  initButterflies() {
    for (let i = 0; i < this.count; i++) {
      const pal = this.speciesPalettes[i % this.speciesPalettes.length];
      const bGroup = new THREE.Group();

      // Slender dark velvet thorax/body
      const bodyMesh = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial);
      bodyMesh.castShadow = true;
      bGroup.add(bodyMesh);

      // Antennae
      const antMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const antGeoL = new THREE.CylinderGeometry(0.0008, 0.0008, 0.03, 4);
      antGeoL.rotateZ(0.4);
      antGeoL.rotateX(0.4);
      const antL = new THREE.Mesh(antGeoL, antMat);
      antL.position.set(0.004, 0.010, 0.032);
      bGroup.add(antL);

      const antGeoR = new THREE.CylinderGeometry(0.0008, 0.0008, 0.03, 4);
      antGeoR.rotateZ(-0.4);
      antGeoR.rotateX(0.4);
      const antR = new THREE.Mesh(antGeoR, antMat);
      antR.position.set(-0.004, 0.010, 0.032);
      bGroup.add(antR);

      // Wing materials with subtle translucency and vibrant meadow tones
      const wingMat = new THREE.MeshStandardMaterial({
        color: pal.color,
        roughness: 0.38,
        metalness: 0.15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94,
        depthWrite: false
      });

      // Left wing pivot (rotates around Z-axis along the body hinge)
      const leftPivot = new THREE.Group();
      leftPivot.position.set(0.003, 0.002, 0);
      const leftMesh = new THREE.Mesh(this.wingGeometry, wingMat);
      leftMesh.castShadow = true;
      leftPivot.add(leftMesh);
      bGroup.add(leftPivot);

      // Right wing pivot (mirrored on X)
      const rightPivot = new THREE.Group();
      rightPivot.position.set(-0.003, 0.002, 0);
      const rightMesh = new THREE.Mesh(this.wingGeometry, wingMat);
      rightMesh.scale.x = -1; // mirror horizontally
      rightMesh.castShadow = true;
      rightPivot.add(rightMesh);
      bGroup.add(rightPivot);

      // Apply species scale
      const s = pal.size / 0.20;
      bGroup.scale.set(s, s, s);

      // Initial distributed spawn across meadow glade
      const spawnAng = (i / this.count) * Math.PI * 2 + Math.random() * 0.5;
      const spawnDist = 3.5 + Math.random() * 14.0;
      const spawnX = Math.cos(spawnAng) * spawnDist;
      const spawnZ = Math.sin(spawnAng) * spawnDist;
      const groundY = this.getTerrainHeight ? this.getTerrainHeight(spawnX, spawnZ) : 0;
      const spawnY = groundY + 1.2 + Math.random() * 1.5;

      bGroup.position.set(spawnX, spawnY, spawnZ);
      this.scene.add(bGroup);

      const butterfly = {
        id: i,
        group: bGroup,
        leftPivot,
        rightPivot,
        species: pal.name,
        color: pal.color,
        position: bGroup.position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.8
        ),
        targetPos: new THREE.Vector3(),
        state: 'roaming', // 'roaming' | 'approaching' | 'perching' | 'summoned'
        perchTimer: 0,
        perchDuration: 0,
        targetFlower: null,
        flapFrequency: 14.0 + Math.random() * 6.0,
        flapPhase: Math.random() * Math.PI * 2,
        flightSpeed: 1.1 + Math.random() * 0.6,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: 0.35 + Math.random() * 0.35
      };

      this.pickNewTarget(butterfly);
      this.butterflies.push(butterfly);
    }
  }

  /**
   * Selects a flower or free-flight waypoint for the butterfly.
   */
  pickNewTarget(b) {
    const flowers = (typeof this.getFlowers === 'function') ? this.getFlowers() : [];
    const validFlowers = flowers.filter(f => f && (f.group || f.position));

    // 70% chance to target an authentic flower in the meadow, 30% to explore open air
    if (validFlowers.length > 0 && Math.random() < 0.72) {
      const chosen = validFlowers[Math.floor(Math.random() * validFlowers.length)];
      const pos = chosen.group ? chosen.group.position : chosen.position;
      const crownY = (pos.y || 0) + 1.35 + (Math.random() - 0.5) * 0.25;

      b.targetPos.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        crownY,
        pos.z + (Math.random() - 0.5) * 0.4
      );
      b.targetFlower = chosen;
      b.state = 'approaching';
    } else {
      // Roam across open meadow glade
      const ang = Math.random() * Math.PI * 2;
      const r = 2.0 + Math.random() * 20.0;
      const tx = Math.cos(ang) * r;
      const tz = Math.sin(ang) * r;
      const groundY = this.getTerrainHeight ? this.getTerrainHeight(tx, tz) : 0;
      const ty = groundY + 1.0 + Math.random() * 1.8;

      b.targetPos.set(tx, ty, tz);
      b.targetFlower = null;
      b.state = 'roaming';
    }
  }

  /**
   * Summon one or two butterflies directly to a searched/spotlighted flower!
   */
  summonToFlower(flower, durationSeconds = 18) {
    if (!flower) return;
    const pos = flower.group ? flower.group.position : flower.position;
    if (!pos) return;

    // Find the two closest or best suited butterflies to fly to the searched flower
    const sorted = [...this.butterflies].sort((a, b) => {
      const dA = a.position.distanceToSquared(pos);
      const dB = b.position.distanceToSquared(pos);
      return dA - dB;
    });

    // Send the closest 1 or 2 butterflies on a graceful mission to the flower
    const countToSummon = Math.min(2, sorted.length);
    for (let i = 0; i < countToSummon; i++) {
      const b = sorted[i];
      b.state = 'summoned';
      b.targetFlower = flower;
      b.summonDuration = durationSeconds;
      b.summonTimer = 0;
      b.flightSpeed = 1.8 + Math.random() * 0.5; // fly briskly with joyful urgency
      b.orbitAngle = Math.random() * Math.PI * 2;
      b.orbitRadius = 0.28 + i * 0.18;
      b.orbitSpeed = (i === 0 ? 1 : -1) * (1.6 + Math.random() * 0.6);

      const crownY = (pos.y || 0) + 1.42 + (i * 0.15);
      b.targetPos.set(pos.x, crownY, pos.z);
    }
  }

  update(time, dt = 0.016) {
    const flowers = (typeof this.getFlowers === 'function') ? this.getFlowers() : [];

    for (let i = 0; i < this.butterflies.length; i++) {
      const b = this.butterflies[i];

      // 1. BEHAVIOR LOGIC
      if (b.state === 'summoned') {
        b.summonTimer += dt;
        const flPos = b.targetFlower.group ? b.targetFlower.group.position : b.targetFlower.position;
        const crownY = (flPos.y || 0) + 1.42;

        const distToFlower = b.position.distanceTo(flPos);

        if (distToFlower > 0.8) {
          // Still flying toward the spotlighted flower
          const dir = new THREE.Vector3().subVectors(
            new THREE.Vector3(flPos.x, crownY, flPos.z),
            b.position
          ).normalize();
          b.velocity.lerp(dir.multiplyScalar(b.flightSpeed), 0.08);
        } else {
          // Arrived! Gracefully orbit around the crown of petals and hover
          b.orbitAngle += (b.orbitSpeed || 1.4) * dt;
          const targetX = flPos.x + Math.cos(b.orbitAngle) * b.orbitRadius;
          const targetZ = flPos.z + Math.sin(b.orbitAngle) * b.orbitRadius;
          const targetY = crownY + Math.sin(time * 3.5 + b.id) * 0.06;

          const orbitTarget = new THREE.Vector3(targetX, targetY, targetZ);
          const dir = new THREE.Vector3().subVectors(orbitTarget, b.position);
          b.velocity.copy(dir.multiplyScalar(2.4));
        }

        // Return to normal meadow roaming after summon duration completes
        if (b.summonTimer > (b.summonDuration || 18)) {
          b.state = 'roaming';
          b.flightSpeed = 1.1 + Math.random() * 0.6;
          this.pickNewTarget(b);
        }
      } else if (b.state === 'perching') {
        b.perchTimer += dt;
        b.velocity.set(0, 0, 0);

        // Gentle resting flutter while sipping nectar
        const restFlap = Math.sin(time * 3.0 + b.id) * 0.18 + 0.35; // wings held upright at ~35-50°
        b.leftPivot.rotation.z = -restFlap;
        b.rightPivot.rotation.z = restFlap;

        if (b.perchTimer >= b.perchDuration) {
          // Take off!
          this.pickNewTarget(b);
        }
        continue;
      } else {
        // 'roaming' or 'approaching'
        const distToTarget = b.position.distanceTo(b.targetPos);

        if (distToTarget < 0.35) {
          if (b.state === 'approaching' && b.targetFlower) {
            // Perch gently on the flower crown for 3 to 6 seconds!
            b.state = 'perching';
            b.perchTimer = 0;
            b.perchDuration = 3.0 + Math.random() * 4.0;
            continue;
          } else {
            this.pickNewTarget(b);
          }
        }

        // Steer toward target with gentle fluid acceleration
        const desired = new THREE.Vector3().subVectors(b.targetPos, b.position).normalize();
        desired.multiplyScalar(b.flightSpeed);

        // Add soft organic sinusoidal flutter turbulence
        desired.x += Math.sin(time * 2.8 + b.id * 1.5) * 0.35;
        desired.y += Math.cos(time * 4.2 + b.id * 2.0) * 0.22;
        desired.z += Math.cos(time * 3.1 + b.id * 1.1) * 0.35;

        b.velocity.lerp(desired, 0.06);

        // Keep safely above terrain ground
        if (this.getTerrainHeight) {
          const terrainY = this.getTerrainHeight(b.position.x, b.position.z);
          if (b.position.y < terrainY + 0.6) {
            b.velocity.y += 0.035;
          }
        }
      }

      // 2. POSITION & ORIENTATION UPDATE
      b.position.addScaledVector(b.velocity, dt);

      // Smooth body banking and look-ahead heading
      if (b.velocity.lengthSq() > 0.001) {
        const lookTarget = b.position.clone().add(b.velocity);
        // Add vertical bob to lookTarget so butterfly tilts naturally with each flap
        lookTarget.y += Math.sin(time * b.flapFrequency + b.flapPhase) * 0.02;

        const currentRot = b.group.quaternion.clone();
        b.group.lookAt(lookTarget);
        b.group.quaternion.slerp(currentRot, 0.4); // smooth banking turn
      }

      // 3. WING FLAPPING
      // Flap wings dynamically: rapid rhythmic flutter when flying, smoother glide when descending
      const speed = b.velocity.length();
      const currentFreq = b.flapFrequency * (0.8 + speed * 0.4);
      const flapSine = Math.sin(time * currentFreq + b.flapPhase);
      const flapAngle = flapSine * 0.82; // flap range -47° to +47°

      b.leftPivot.rotation.z = -flapAngle;
      b.rightPivot.rotation.z = flapAngle;

      // Slight secondary pitch flutter on wings
      b.leftPivot.rotation.x = Math.sin(time * currentFreq * 0.5) * 0.10;
      b.rightPivot.rotation.x = Math.sin(time * currentFreq * 0.5) * 0.10;
    }
  }

  dispose() {
    this.butterflies.forEach(b => {
      this.scene.remove(b.group);
    });
    this.butterflies = [];
    if (this.wingGeometry) this.wingGeometry.dispose();
    if (this.bodyGeometry) this.bodyGeometry.dispose();
    if (this.bodyMaterial) this.bodyMaterial.dispose();
  }
}
