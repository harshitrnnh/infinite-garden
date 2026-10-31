import * as THREE from 'three';

/**
 * Creates wild meadow grasses, wheat awns, and feathery seedheads
 * as seen in the reference image
 */
export class WildGrassesField {
  constructor(scene, count = 280, radius = 9.0) {
    this.scene = scene;
    this.count = count;
    this.radius = radius;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.grassMeshes = [];
    this.seedheadMeshes = [];

    this.initMaterials();
    this.generateGroundCover();   // Dense short carpet layer - kept!
    // Tall grass and tall wheat/seedheads removed: only short grass is kept.
  }

  initMaterials() {
    // Dry golden wheat straw
    this.wheatMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8b593,
      roughness: 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Feathery awns / seedhead material
    this.seedheadMaterial = new THREE.MeshStandardMaterial({
      color: 0xbaa482,
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    // Muted meadow green grass
    this.grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a6953,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Mauve / lavender wild grass stalk tint
    this.mauveStalkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a7f8e,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Short dark ground-cover grass
    this.groundCoverMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5e44,
      roughness: 0.72,
      metalness: 0.03,
      side: THREE.DoubleSide
    });

    // Pale-mint sparse accent grass
    this.mintGrassMaterial = new THREE.MeshStandardMaterial({
      color: 0x7a9e87,
      roughness: 0.65,
      metalness: 0.04,
      side: THREE.DoubleSide
    });
  }

  /** Dense low carpet of short blades covering the full ground plane */
  generateGroundCover() {
    const coverCount = Math.floor(this.count * 0.8); // extra dense carpet
    const bladeGeo = new THREE.PlaneGeometry(0.018, 0.45, 1, 3);
    const pos = bladeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + 0.225) / 0.45;
      pos.setX(i, pos.getX(i) * (1.0 - t * 0.8));
      pos.setZ(i, Math.pow(t, 2) * 0.08);
    }
    bladeGeo.computeVertexNormals();

    for (let i = 0; i < coverCount; i++) {
      // Fill in from centre all the way to the outer radius edge
      const r = Math.sqrt(Math.random()) * (this.radius + 2.0);
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const mats = [this.groundCoverMaterial, this.grassMaterial, this.mintGrassMaterial];
      const mat = mats[Math.floor(Math.random() * mats.length)];
      const mesh = new THREE.Mesh(bladeGeo, mat);

      const h = 0.3 + Math.random() * 0.4;
      mesh.scale.set(0.8 + Math.random() * 0.5, h, 1.0);
      mesh.position.set(x, h * 0.42, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.x = (Math.random() - 0.5) * 0.28;
      mesh.rotation.z = (Math.random() - 0.5) * 0.28;

      this.group.add(mesh);
      this.grassMeshes.push({
        mesh,
        baseRotX: mesh.rotation.x,
        baseRotZ: mesh.rotation.z,
        speed: 1.0 + Math.random() * 0.7,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  generateGrasses() {
    // Instanced or grouped slender curved grass blades
    const bladeGeo = new THREE.PlaneGeometry(0.024, 0.95, 1, 4);
    // Taper top
    const pos = bladeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + 0.475) / 0.95;
      const x = pos.getX(i);
      pos.setX(i, x * (1.0 - t * 0.75));
      // Curve blade back
      pos.setZ(i, Math.pow(t, 2) * 0.16);
    }
    bladeGeo.computeVertexNormals();

    const n = Math.floor(this.count * 0.65);
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(Math.random()) * (this.radius + 1.5);
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const mat = (Math.random() > 0.45) ? this.grassMaterial : this.wheatMaterial;
      const mesh = new THREE.Mesh(bladeGeo, mat);

      const h = 0.6 + Math.random() * 0.7;
      mesh.scale.set(1.0 + Math.random() * 0.5, h, 1.0);
      mesh.position.set(x, h * 0.45, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.x = (Math.random() - 0.5) * 0.35;
      mesh.rotation.z = (Math.random() - 0.5) * 0.35;

      this.group.add(mesh);
      this.grassMeshes.push({
        mesh,
        baseRotX: mesh.rotation.x,
        baseRotZ: mesh.rotation.z,
        speed: 1.2 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  generateWheatAndSeedheads() {
    // Tall slender wheat stems with feathery spikelets and seed heads
    const n = Math.floor(this.count * 0.35);
    for (let i = 0; i < n; i++) {
      const r = 0.8 + Math.sqrt(Math.random()) * (this.radius + 1.0);
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const stalkGroup = new THREE.Group();
      stalkGroup.position.set(x, 0, z);

      const stalkHeight = 1.2 + Math.random() * 0.85;
      const stalkGeo = new THREE.CylinderGeometry(0.005, 0.012, stalkHeight, 4);
      const stalkMat = (Math.random() > 0.4) ? this.wheatMaterial : this.mauveStalkMaterial;
      const stalkMesh = new THREE.Mesh(stalkGeo, stalkMat);
      stalkMesh.position.y = stalkHeight * 0.5;
      stalkGroup.add(stalkMesh);

      // Add feathery wheat head / panicle at the top
      const headType = Math.random();
      if (headType > 0.5) {
        // Wheat spike with awns
        const headLen = 0.22 + Math.random() * 0.14;
        const headGeo = new THREE.ConeGeometry(0.022, headLen, 5);
        const headMesh = new THREE.Mesh(headGeo, this.seedheadMaterial);
        headMesh.position.y = stalkHeight + headLen * 0.45;
        stalkGroup.add(headMesh);

        // Awn bristles fanning out
        const awnCount = 8;
        for (let a = 0; a < awnCount; a++) {
          const awnGeo = new THREE.CylinderGeometry(0.001, 0.002, 0.12, 3);
          const awn = new THREE.Mesh(awnGeo, this.seedheadMaterial);
          awn.position.set(0, stalkHeight + headLen * 0.5 + (a / awnCount) * 0.08, 0);
          awn.rotation.z = 0.35 + Math.random() * 0.3;
          awn.rotation.y = (a / awnCount) * Math.PI * 2;
          stalkGroup.add(awn);
        }
      } else {
        // Delicate branching umbel / seedhead with tiny beads
        const branchCount = 6;
        for (let b = 0; b < branchCount; b++) {
          const angle = (b / branchCount) * Math.PI * 2;
          const brLen = 0.14 + Math.random() * 0.08;
          const brGeo = new THREE.CylinderGeometry(0.001, 0.003, brLen, 3);
          const br = new THREE.Mesh(brGeo, this.seedheadMaterial);
          br.position.set(0, stalkHeight, 0);
          br.rotation.y = angle;
          br.rotation.z = 0.5 + Math.random() * 0.3;
          stalkGroup.add(br);

          // Seed bead at branch tip
          const beadGeo = new THREE.SphereGeometry(0.007, 4, 4);
          const bead = new THREE.Mesh(beadGeo, this.seedheadMaterial);
          bead.position.y = brLen;
          br.add(bead);
        }
      }

      // Gentle natural lean
      stalkGroup.rotation.x = (Math.random() - 0.5) * 0.2;
      stalkGroup.rotation.z = (Math.random() - 0.5) * 0.2;

      this.group.add(stalkGroup);
      this.seedheadMeshes.push({
        group: stalkGroup,
        baseRotX: stalkGroup.rotation.x,
        baseRotZ: stalkGroup.rotation.z,
        speed: 0.9 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(time, windStrength = 1.0) {
    // Sway grass blades
    for (let i = 0; i < this.grassMeshes.length; i++) {
      const g = this.grassMeshes[i];
      const t = time * g.speed + g.offset;
      g.mesh.rotation.x = g.baseRotX + Math.sin(t) * 0.12 * windStrength;
      g.mesh.rotation.z = g.baseRotZ + Math.cos(t * 0.8) * 0.10 * windStrength;
    }

    // Sway tall wheat stalks
    for (let j = 0; j < this.seedheadMeshes.length; j++) {
      const s = this.seedheadMeshes[j];
      const t = time * s.speed + s.phase;
      s.group.rotation.x = s.baseRotX + Math.sin(t * 1.1) * 0.08 * windStrength;
      s.group.rotation.z = s.baseRotZ + Math.cos(t * 0.9) * 0.07 * windStrength;
    }
  }
}
