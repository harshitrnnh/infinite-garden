import * as THREE from 'three';
import { PoeticFlower, MEADOW_PALETTES } from './poetic-flower.js';
import { LivingPlant } from '../plant.js';

/**
 * 3D BOTANICAL MORPHOLOGY & ARTICULATED KINEMATICS LAB
 * Generates distinct 3D mathematical mesh topologies for each flower species
 * mounted on single articulated continuous stems with branches, foliage leaves,
 * and smaller companion flowers responding to hand and leg movements.
 */

// ============================================================================
// PROCEDURAL FOLIAGE LEAF GEOMETRY GENERATOR
// Sculpted natural leaf blade with curved rachis vein and arched cross-section
// ============================================================================
export function createSculptedFoliageLeaf(length = 0.38, width = 0.12, segs = 10) {
  const vertices = [];
  const uvs = [];
  const indices = [];
  const colors = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs; // 0 (base) to 1 (tip)
    // Tapering leaf envelope: narrow at base (stem attachment), swells at 0.4, pointed apex at 1.0
    const w = width * Math.sin(Math.pow(t, 0.75) * Math.PI);
    // Longitudinal arch curve
    const y = Math.sin(t * Math.PI * 0.48) * length;
    const zArch = Math.pow(t, 1.4) * (length * 0.20);

    for (let u = 0; u <= 4; u++) {
      const uNorm = (u / 4) * 2 - 1; // -1 (left edge) to 0 (midrib) to +1 (right edge)
      const x = uNorm * w * 0.5;
      // Transverse V-cup or downward curl
      const vCup = Math.pow(Math.abs(uNorm), 1.6) * (w * 0.22);
      const z = zArch - vCup;

      vertices.push(x, y, z);
      uvs.push(u / 4, t);

      // Color variation from dark forest green midrib to fresh sage edge
      const edgeFactor = Math.abs(uNorm);
      const c = new THREE.Color(0x283b27).lerp(new THREE.Color(0x456041), edgeFactor * 0.7 + t * 0.3);
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < segs; i++) {
    for (let u = 0; u < 4; u++) {
      const a = i * 5 + u;
      const b = (i + 1) * 5 + u;
      const c = (i + 1) * 5 + (u + 1);
      const d = i * 5 + (u + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ============================================================================
// SINGLE UNIFIED ARTICULATED BOTANICAL STEM
// 5-segment continuous kinematic spine with branches, leaves, and companion flowers
// ============================================================================
export class BotanicalArticulatedStem {
  constructor(options = {}) {
    this.totalHeight = options.totalHeight || 1.55;
    this.numSegments = options.numSegments || 5;
    this.segmentHeight = this.totalHeight / this.numSegments;
    this.stemColor = options.stemColor || 0x3d5438;
    this.leafColor = options.leafColor || 0x314a2c;
    this.neckTiltX = options.neckTiltX !== undefined ? options.neckTiltX : 0.06;
    this.createFloretFn = options.createFloretFn || null;
    this.enableBranches = options.enableBranches !== undefined ? options.enableBranches : (options.createFloretFn ? true : false);
    this.enableStanceBalancing = options.enableStanceBalancing !== undefined ? options.enableStanceBalancing : true;
    this.showBasalLeaves = options.showBasalLeaves !== undefined ? options.showBasalLeaves : false; // Default false to avoid odd flapping base leaves
    this.reduceStemLeaves = options.reduceStemLeaves !== undefined ? options.reduceStemLeaves : false;
    this.caulineLeafScale = options.caulineLeafScale !== undefined ? options.caulineLeafScale : 1.0;

    this.group = new THREE.Group();
    this.segments = [];
    this.basalLeaves = [];
    this.branchlets = [];
    this.florets = [];
    this.idleTime = 0;

    // Kinematic smoothing state
    this.currentLeanX = 0;
    this.currentLeanZ = 0;
    this.currentHeight = 1.0;
    this.currentArmL = 0.5;
    this.currentArmR = 0.5;
    this.currentArmExtL = 0;
    this.currentArmExtR = 0;
    this.currentWingspan = 0.5;
    this.currentLegL = 0;
    this.currentLegR = 0;
    this.currentBloom = 0.08;

    this.initMaterials();
    this.buildSkeleton();
  }

  initMaterials() {
    this.stemMat = new THREE.MeshStandardMaterial({
      color: this.stemColor,
      roughness: 0.58,
      metalness: 0.04
    });

    this.leafMat = new THREE.MeshStandardMaterial({
      color: this.leafColor,
      roughness: 0.45,
      metalness: 0.03,
      side: THREE.DoubleSide
    });
  }

  buildSkeleton() {
    let parent = this.group;

    for (let i = 0; i < this.numSegments; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.set(0, i === 0 ? 0.0 : this.segmentHeight, 0);

      const t0 = i / this.numSegments;
      const t1 = (i + 1) / this.numSegments;
      // Natural botanical taper from base to slender tip
      const rBottom = THREE.MathUtils.lerp(0.036, 0.012, t0);
      const rTop = THREE.MathUtils.lerp(0.036, 0.012, t1);

      const geom = new THREE.CylinderGeometry(rTop, rBottom, this.segmentHeight, 10);
      geom.translate(0, this.segmentHeight * 0.5, 0);

      const mesh = new THREE.Mesh(geom, this.stemMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      segGroup.add(mesh);

      // =====================================================================
      // NODE 0 (GROUND BASE): Large Sculpted Basal Leaves (Leg Movement Response)
      // =====================================================================
      if (i === 0) {
        // 1. Left Ground Leaf - Forward-Left (responds to left leg)
        const pL0 = new THREE.Group();
        pL0.position.set(-0.015, 0.03, 0.02);
        const geoL0 = createSculptedFoliageLeaf(0.65, 0.18, 10);
        const meshL0 = new THREE.Mesh(geoL0, this.leafMat);
        meshL0.castShadow = true;
        pL0.add(meshL0);
        pL0.rotation.y = -Math.PI * 0.22;
        pL0.rotation.z = -0.85;
        pL0.rotation.x = 0.28;
        segGroup.add(pL0);
        this.basalLeaves.push({ pivot: pL0, side: -1, baseZ: -0.85, baseX: 0.28, baseY: -Math.PI * 0.22, order: 0 });

        // 2. Left Ground Leaf - Lateral-Left (responds to left leg)
        const pL1 = new THREE.Group();
        pL1.position.set(-0.025, 0.07, -0.015);
        const geoL1 = createSculptedFoliageLeaf(0.55, 0.16, 10);
        const meshL1 = new THREE.Mesh(geoL1, this.leafMat);
        meshL1.castShadow = true;
        pL1.add(meshL1);
        pL1.rotation.y = -Math.PI * 0.55;
        pL1.rotation.z = -0.75;
        pL1.rotation.x = 0.18;
        segGroup.add(pL1);
        this.basalLeaves.push({ pivot: pL1, side: -1, baseZ: -0.75, baseX: 0.18, baseY: -Math.PI * 0.55, order: 1 });

        // 3. Right Ground Leaf - Forward-Right (responds to right leg)
        const pR0 = new THREE.Group();
        pR0.position.set(0.015, 0.03, 0.02);
        const geoR0 = createSculptedFoliageLeaf(0.65, 0.18, 10);
        const meshR0 = new THREE.Mesh(geoR0, this.leafMat);
        meshR0.castShadow = true;
        pR0.add(meshR0);
        pR0.rotation.y = Math.PI * 0.22;
        pR0.rotation.z = 0.85;
        pR0.rotation.x = 0.28;
        segGroup.add(pR0);
        this.basalLeaves.push({ pivot: pR0, side: 1, baseZ: 0.85, baseX: 0.28, baseY: Math.PI * 0.22, order: 2 });

        // 4. Right Ground Leaf - Lateral-Right (responds to right leg)
        const pR1 = new THREE.Group();
        pR1.position.set(0.025, 0.07, -0.015);
        const geoR1 = createSculptedFoliageLeaf(0.55, 0.16, 10);
        const meshR1 = new THREE.Mesh(geoR1, this.leafMat);
        meshR1.castShadow = true;
        pR1.add(meshR1);
        pR1.rotation.y = Math.PI * 0.55;
        pR1.rotation.z = 0.75;
        pR1.rotation.x = 0.18;
        segGroup.add(pR1);
        this.basalLeaves.push({ pivot: pR1, side: 1, baseZ: 0.75, baseX: 0.18, baseY: Math.PI * 0.55, order: 3 });
      }

      // =====================================================================
      // NODE 1 (LOWER STEM): Mid-Basal Leaves (Arching Up from Soil)
      // =====================================================================
      if (i === 1) {
        // Left Mid-Basal Leaf
        const pL2 = new THREE.Group();
        pL2.position.set(-0.015, this.segmentHeight * 0.35, -0.015);
        const geoL2 = createSculptedFoliageLeaf(0.48, 0.14, 10);
        const meshL2 = new THREE.Mesh(geoL2, this.leafMat);
        meshL2.castShadow = true;
        pL2.add(meshL2);
        pL2.rotation.y = -Math.PI * 0.82;
        pL2.rotation.z = -0.68;
        pL2.rotation.x = -0.15;
        segGroup.add(pL2);
        this.basalLeaves.push({ pivot: pL2, side: -1, baseZ: -0.68, baseX: -0.15, baseY: -Math.PI * 0.82, order: 4 });

        // Right Mid-Basal Leaf
        const pR2 = new THREE.Group();
        pR2.position.set(0.015, this.segmentHeight * 0.35, -0.015);
        const geoR2 = createSculptedFoliageLeaf(0.48, 0.14, 10);
        const meshR2 = new THREE.Mesh(geoR2, this.leafMat);
        meshR2.castShadow = true;
        pR2.add(meshR2);
        pR2.rotation.y = Math.PI * 0.82;
        pR2.rotation.z = 0.68;
        pR2.rotation.x = -0.15;
        segGroup.add(pR2);
        this.basalLeaves.push({ pivot: pR2, side: 1, baseZ: 0.68, baseX: -0.15, baseY: Math.PI * 0.82, order: 5 });
      }

      // =====================================================================
      // NODE 2: Left Arching Branch or Cauline Stem Leaves
      // =====================================================================
      if (i === 2) {
        if (this.enableBranches) {
          const branchL = new THREE.Group();
          branchL.position.set(-0.015, this.segmentHeight * 0.40, 0);
          branchL.rotation.y = 0.28;
          branchL.rotation.z = -0.52; // Angled upward-left (~30° from vertical / 60° above horizontal)
          branchL.rotation.x = 0.15;

          const branchLen = 0.44;
          const bStemGeo = new THREE.CylinderGeometry(0.008, 0.016, branchLen, 8);
          bStemGeo.translate(0, branchLen * 0.5, 0);
          const bStemMesh = new THREE.Mesh(bStemGeo, this.stemMat);
          bStemMesh.castShadow = true;
          branchL.add(bStemMesh);

          // Small delicate foliage leaflets along left branch
          const bLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.20, 0.052, 8), this.leafMat);
          bLeaf1.position.set(-0.005, branchLen * 0.35, 0.005);
          bLeaf1.rotation.set(0.20, -0.30, -0.32);
          branchL.add(bLeaf1);

          const bLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.15, 0.040, 8), this.leafMat);
          bLeaf2.position.set(0.005, branchLen * 0.65, -0.005);
          bLeaf2.rotation.set(-0.15, 0.25, 0.28);
          branchL.add(bLeaf2);

          const bLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.11, 0.030, 8), this.leafMat);
          bLeaf3.position.set(-0.004, branchLen * 0.85, 0.004);
          bLeaf3.rotation.set(0.15, -0.40, -0.22);
          branchL.add(bLeaf3);

          // Delicate companion smaller flower mount at branch tip (scaled down)
          const floretMountL = new THREE.Group();
          floretMountL.position.set(0, branchLen, 0);
          floretMountL.rotation.z = -0.15;
          floretMountL.rotation.x = 0.12;
          branchL.add(floretMountL);

          if (typeof this.createFloretFn === 'function') {
            const floretL = this.createFloretFn(0.28, true);
            if (floretL && floretL.group) {
              floretMountL.add(floretL.group);
              this.florets.push(floretL);
            }
          }

          segGroup.add(branchL);
          this.branchlets.push({
            group: branchL,
            mount: floretMountL,
            side: -1,
            baseZ: -0.52,
            baseX: 0.15
          });
        } else {
          // Single spine mode: elegant natural stem leaf hugging the central spine
          const spineLeafL = new THREE.Mesh(createSculptedFoliageLeaf(0.42, 0.11, 8), this.leafMat);
          spineLeafL.position.set(-0.012, this.segmentHeight * 0.35, 0.008);
          spineLeafL.rotation.set(0.18, 0.45, -0.42);
          spineLeafL.castShadow = true;
          segGroup.add(spineLeafL);
        }

        // Cauline leaf along main stem ABOVE left branch (scaled down in Poppy to prevent floret intersection)
        if (this.reduceStemLeaves) {
          const stemLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.18, 0.046, 8), this.leafMat);
          stemLeaf2.position.set(0.010, this.segmentHeight * 0.72, 0.006);
          stemLeaf2.rotation.set(0.12, 0.40, 0.18);
          stemLeaf2.castShadow = true;
          segGroup.add(stemLeaf2);
        } else {
          const stemLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.52, 0.138, 10), this.leafMat);
          stemLeaf2.position.set(0.014, this.segmentHeight * 0.80, 0.008);
          stemLeaf2.rotation.set(0.20, 0.55, 0.34);
          stemLeaf2.castShadow = true;
          segGroup.add(stemLeaf2);
        }
      }

      // =====================================================================
      // NODE 3: Right Arching Branch or Cauline Stem Leaves
      // =====================================================================
      if (i === 3) {
        if (this.enableBranches) {
          const branchR = new THREE.Group();
          branchR.position.set(0.015, this.segmentHeight * 0.32, 0);
          branchR.rotation.y = -0.28;
          branchR.rotation.z = 0.62; // Angled upward-right (~35.5° from vertical / 54.5° above horizontal)
          branchR.rotation.x = 0.12;

          const branchLen = 0.46;
          const bStemGeo = new THREE.CylinderGeometry(0.008, 0.016, branchLen, 8);
          bStemGeo.translate(0, branchLen * 0.5, 0);
          const bStemMesh = new THREE.Mesh(bStemGeo, this.stemMat);
          bStemMesh.castShadow = true;
          branchR.add(bStemMesh);

          // Small delicate foliage leaflets along right branch
          const bLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.21, 0.054, 8), this.leafMat);
          bLeaf1.position.set(0.005, branchLen * 0.34, 0.005);
          bLeaf1.rotation.set(0.18, 0.28, 0.32);
          branchR.add(bLeaf1);

          const bLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.16, 0.042, 8), this.leafMat);
          bLeaf2.position.set(-0.005, branchLen * 0.64, -0.005);
          bLeaf2.rotation.set(-0.12, -0.25, -0.26);
          branchR.add(bLeaf2);

          const bLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.12, 0.032, 8), this.leafMat);
          bLeaf3.position.set(0.004, branchLen * 0.86, 0.004);
          bLeaf3.rotation.set(0.15, 0.35, 0.22);
          branchR.add(bLeaf3);

          // Delicate companion smaller flower mount at branch tip (scaled down)
          const floretMountR = new THREE.Group();
          floretMountR.position.set(0, branchLen, 0);
          floretMountR.rotation.z = 0.16;
          floretMountR.rotation.x = 0.14;
          branchR.add(floretMountR);

          if (typeof this.createFloretFn === 'function') {
            const floretR = this.createFloretFn(0.32, false);
            if (floretR && floretR.group) {
              floretMountR.add(floretR.group);
              this.florets.push(floretR);
            }
          }

          segGroup.add(branchR);
          this.branchlets.push({
            group: branchR,
            mount: floretMountR,
            side: 1,
            baseZ: 0.62,
            baseX: 0.12
          });
        } else {
          // Single spine mode: alternating natural stem leaf hugging the central spine
          const spineLeafR = new THREE.Mesh(createSculptedFoliageLeaf(0.44, 0.115, 8), this.leafMat);
          spineLeafR.position.set(0.012, this.segmentHeight * 0.30, -0.008);
          spineLeafR.rotation.set(-0.16, -0.45, 0.40);
          spineLeafR.castShadow = true;
          segGroup.add(spineLeafR);
        }

        // Cauline leaf along main stem ABOVE right branch (scaled down in Poppy to prevent floret intersection)
        if (this.reduceStemLeaves) {
          const stemLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.18, 0.046, 8), this.leafMat);
          stemLeaf3.position.set(-0.010, this.segmentHeight * 0.68, 0.006);
          stemLeaf3.rotation.set(0.12, -0.35, -0.16);
          stemLeaf3.castShadow = true;
          segGroup.add(stemLeaf3);
        } else {
          const stemLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.56, 0.145, 10), this.leafMat);
          stemLeaf3.position.set(-0.015, this.segmentHeight * 0.72, 0.010);
          stemLeaf3.rotation.set(0.22, -0.45, -0.36);
          stemLeaf3.castShadow = true;
          segGroup.add(stemLeaf3);
        }
      }

      // =====================================================================
      // NODE 4: Upper Stem Segment (Larger Alternating Cauline Leaves)
      // =====================================================================
      if (i === 4) {
        if (this.reduceStemLeaves) {
          // Delicate compact sub-floral leaflets under poppy head
          const stemLeaf4a = new THREE.Mesh(createSculptedFoliageLeaf(0.20, 0.052, 8), this.leafMat);
          stemLeaf4a.position.set(0.010, this.segmentHeight * 0.35, 0.008);
          stemLeaf4a.rotation.set(0.16, 0.50, 0.20);
          stemLeaf4a.castShadow = true;
          segGroup.add(stemLeaf4a);

          const stemLeaf4b = new THREE.Mesh(createSculptedFoliageLeaf(0.16, 0.042, 8), this.leafMat);
          stemLeaf4b.position.set(-0.008, this.segmentHeight * 0.75, -0.008);
          stemLeaf4b.rotation.set(0.14, -1.80, -0.18);
          stemLeaf4b.castShadow = true;
          segGroup.add(stemLeaf4b);
        } else {
          // Lower large leaf along Segment 4 pointing forward-right
          const stemLeaf4a = new THREE.Mesh(createSculptedFoliageLeaf(0.48, 0.125, 10), this.leafMat);
          stemLeaf4a.position.set(0.012, this.segmentHeight * 0.35, 0.012);
          stemLeaf4a.rotation.set(0.24, 0.65, 0.32);
          stemLeaf4a.castShadow = true;
          segGroup.add(stemLeaf4a);

          // Upper leaf along Segment 4 pointing left-backward
          const stemLeaf4b = new THREE.Mesh(createSculptedFoliageLeaf(0.40, 0.108, 10), this.leafMat);
          stemLeaf4b.position.set(-0.010, this.segmentHeight * 0.78, -0.012);
          stemLeaf4b.rotation.set(0.18, -2.10, -0.28);
          stemLeaf4b.castShadow = true;
          segGroup.add(stemLeaf4b);
        }
      }

      parent.add(segGroup);
      this.segments.push({ group: segGroup, mesh: mesh });
      parent = segGroup;
    }

    // --- TOP PEDICEL & FLOWER RECEPTACLE ---
    // Elevated pedicel neck connecting top segment to main flower head (elevates top flower by +0.32m)
    this.neckGroup = new THREE.Group();
    this.neckGroup.position.set(0, this.segmentHeight, 0);
    this.neckGroup.rotation.x = this.neckTiltX;
    parent.add(this.neckGroup);

    const pedicelH = 0.42;
    const pedGeo = new THREE.CylinderGeometry(0.010, 0.013, pedicelH, 8);
    pedGeo.translate(0, pedicelH * 0.5, 0);
    const pedMesh = new THREE.Mesh(pedGeo, this.stemMat);
    pedMesh.castShadow = true;
    this.neckGroup.add(pedMesh);

    // Sub-floral leaves along elevated pedicel neck leading to top flower
    if (this.reduceStemLeaves) {
      const pedLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.14, 0.038, 8), this.leafMat);
      pedLeaf1.position.set(0.008, pedicelH * 0.32, 0.004);
      pedLeaf1.rotation.set(0.14, 0.85, 0.16);
      pedLeaf1.castShadow = true;
      this.neckGroup.add(pedLeaf1);

      const pedLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.11, 0.030, 8), this.leafMat);
      pedLeaf2.position.set(-0.006, pedicelH * 0.68, 0.004);
      pedLeaf2.rotation.set(0.12, -0.90, -0.14);
      pedLeaf2.castShadow = true;
      this.neckGroup.add(pedLeaf2);
    } else {
      const pedLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.30, 0.082, 8), this.leafMat);
      pedLeaf1.position.set(0.010, pedicelH * 0.32, 0.006);
      pedLeaf1.rotation.set(0.20, 1.15, 0.24);
      pedLeaf1.castShadow = true;
      this.neckGroup.add(pedLeaf1);

      const pedLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.24, 0.065, 8), this.leafMat);
      pedLeaf2.position.set(-0.008, pedicelH * 0.68, 0.005);
      pedLeaf2.rotation.set(0.18, -1.25, -0.22);
      pedLeaf2.castShadow = true;
      this.neckGroup.add(pedLeaf2);
    }

    // Receptacle where the species-specific 3D flower head is attached
    this.receptacle = new THREE.Group();
    this.receptacle.position.set(0, pedicelH, 0);
    this.neckGroup.add(this.receptacle);
  }

  setStanceBalancing(enabled) {
    this.enableStanceBalancing = !!enabled;
  }

  setShowBasalLeaves(enabled) {
    this.showBasalLeaves = !!enabled;
    this.basalLeaves.forEach(l => {
      if (l.pivot) l.pivot.visible = this.showBasalLeaves;
    });
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.idleTime += dt;

    const rawLeanX = kinematics.spineLeanX || 0;
    const rawLeanZ = kinematics.spineLeanZ || 0;
    const rawHeight = kinematics.heightFactor || 1.0;
    const rawArmL = kinematics.armHeightL !== undefined ? kinematics.armHeightL : 0.5;
    const rawArmR = kinematics.armHeightR !== undefined ? kinematics.armHeightR : 0.5;
    const rawWingspan = kinematics.wingspanSpread !== undefined ? kinematics.wingspanSpread : 0.5;
    const rawLegL = kinematics.legLiftL || 0;
    const rawLegR = kinematics.legLiftR || 0;
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;

    // Smooth responsive interpolation
    this.currentLeanX += (rawLeanX - this.currentLeanX) * 0.24;
    this.currentLeanZ += (rawLeanZ - this.currentLeanZ) * 0.24;
    this.currentHeight += (rawHeight - this.currentHeight) * 0.18;
    this.currentArmL += (rawArmL - this.currentArmL) * 0.24;
    this.currentArmR += (rawArmR - this.currentArmR) * 0.24;
    this.currentWingspan += (rawWingspan - this.currentWingspan) * 0.20;
    this.currentLegL += (rawLegL - this.currentLegL) * 0.22;
    this.currentLegR += (rawLegR - this.currentLegR) * 0.22;
    this.currentBloom = bloom;

    // Continuous, graceful single-spine curvature from ground anchor to apex bloom
    const maxCurveAngle = 0.28;
    const scaledSegH = this.segmentHeight * this.currentHeight;
    const numSegs = this.segments.length;
    this.segments.forEach((segObj, i) => {
      const seg = segObj.group;
      if (i > 0) {
        seg.position.y = scaledSegH;
      }
      segObj.mesh.scale.y = this.currentHeight;

      const t = (i + 1) / numSegs;
      // Monotonic natural botanical flex: gentle at root, increasing progressively to crown
      const flex = THREE.MathUtils.lerp(0.14, 0.28, t);
      const legSway = this.enableStanceBalancing ? (this.currentLegL - this.currentLegR) * 0.04 * t : 0;

      const rotZ = (-this.currentLeanX * maxCurveAngle) * flex + legSway;
      const rotX = (this.currentLeanZ * maxCurveAngle) * flex;

      seg.rotation.z = rotZ;
      seg.rotation.x = rotX;
    });

    // 2. Animate Lateral Branches in Direct Response to Hands
    // Branches always face upward at natural asymmetrical angles, never collapsing horizontally
    this.branchlets.forEach(b => {
      const isLeft = b.side === -1;
      const armElev = isLeft ? this.currentArmL : this.currentArmR;
      const verticalLift = THREE.MathUtils.clamp((armElev - 0.48) / 0.50, -1.0, 1.4);
      const wingSpread = Math.max(0, this.currentWingspan - 0.40) * 0.45;

      if (isLeft) {
        // Left branch: baseZ is -0.52 (facing upward-left)
        // Upward reach elevates branch up towards -0.28, resting stays at gentle upward angle (never horizontal)
        const liftZ = verticalLift > 0 ? (verticalLift * 0.22) : (verticalLift * 0.12);
        const targetZ = Math.min(-0.28, Math.max(-0.62, b.baseZ + liftZ - wingSpread * 0.20));
        b.group.rotation.z = targetZ;
        b.group.rotation.x = b.baseX + verticalLift * 0.12;
      } else {
        // Right branch: baseZ is +0.62 (facing upward-right at a slightly different angle)
        // Upward reach elevates branch up towards +0.34, resting stays at gentle upward angle (never horizontal)
        const liftZ = verticalLift > 0 ? (-verticalLift * 0.22) : (-verticalLift * 0.12);
        const targetZ = Math.max(0.34, Math.min(0.72, b.baseZ + liftZ + wingSpread * 0.20));
        b.group.rotation.z = targetZ;
        b.group.rotation.x = b.baseX + verticalLift * 0.12;
      }

      if (b.growthScale !== undefined && b.growthScale < (b.targetGrowthScale || 1.0)) {
        b.growthScale = THREE.MathUtils.lerp(b.growthScale, b.targetGrowthScale || 1.0, 0.08);
      }
      const growthMult = b.growthScale !== undefined ? b.growthScale : 1.0;

      // Gentle reach scale
      const reachScale = (1.0 + Math.max(0, verticalLift) * 0.15 + wingSpread * 0.20) * growthMult;
      b.group.scale.set(reachScale, reachScale, reachScale);
    });

    // 3. Basal Bottom Leaves Move Dramatically with Leg Movements
    const activeLegL = Math.max(this.currentLegL, Math.max(0, -(kinematics.bodyShiftX || 0)) * 0.90);
    const activeLegR = Math.max(this.currentLegR, Math.max(0, (kinematics.bodyShiftX || 0)) * 0.90);

    this.basalLeaves.forEach(leaf => {
      leaf.pivot.visible = this.showBasalLeaves;
      if (!this.showBasalLeaves) return;
      const drive = leaf.side === -1 ? activeLegL : activeLegR;
      const flutter = Math.sin(this.idleTime * 5.0 + leaf.order) * drive * 0.22;
      const breath = Math.sin(this.idleTime * 1.5 + leaf.order) * 0.025;

      if (leaf.side === -1) {
        // Left bottom leaf: rotates UP from ground when left leg moves
        leaf.pivot.rotation.z = leaf.baseZ + drive * 1.15 + breath;
        leaf.pivot.rotation.x = leaf.baseX + drive * 0.60;
        leaf.pivot.rotation.y = leaf.baseY + flutter;
      } else {
        // Right bottom leaf: rotates UP from ground when right leg moves
        leaf.pivot.rotation.z = leaf.baseZ - drive * 1.15 - breath;
        leaf.pivot.rotation.x = leaf.baseX + drive * 0.60;
        leaf.pivot.rotation.y = leaf.baseY + flutter;
      }

      const s = 1.0 + drive * 0.55;
      leaf.pivot.scale.set(s, s, s);
    });

    // 4. Update companion florets bloom in harmony
    this.florets.forEach(f => {
      if (typeof f.setBloom === 'function') {
        f.setBloom(this.currentBloom);
      }
    });
  }

  setBloom(val) {
    this.currentBloom = val;
    this.florets.forEach(f => {
      if (typeof f.setBloom === 'function') {
        f.setBloom(val);
      }
    });
  }

  setWireframe(wire) {
    this.stemMat.wireframe = wire;
    this.leafMat.wireframe = wire;
    this.florets.forEach(f => {
      if (typeof f.setWireframe === 'function') {
        f.setWireframe(wire);
      }
    });
  }

  /**
   * EASTER EGG: Namaste Mudra Sprouting
   * When dancer holds Namaste pose (hands clasped at heart), a new living botanical branch sprouts!
   */
  sproutNamasteBranch(immediate = false) {
    this.namasteBranchCount = (this.namasteBranchCount || 0) + 1;
    const count = this.namasteBranchCount;

    // Distribute among visible stem segments (e.g. segments 2, 3, 1)
    const segIndices = [2, 3, 1, 3, 2];
    const segIdx = segIndices[(count - 1) % segIndices.length];
    const segObj = this.segments[segIdx];
    if (!segObj) return null;

    const segGroup = segObj.group;
    const side = (count % 2 === 1) ? 1 : -1;
    const branchLen = 0.38 + ((count * 0.04) % 0.12);

    const branch = new THREE.Group();
    // Positioned along the segment height
    const heightOffset = this.segmentHeight * (0.35 + (count % 3) * 0.16);
    branch.position.set(side * 0.012, heightOffset, 0.008);

    // Natural botanical angles: tilted upwards & slightly forward
    const baseZ = side === 1 ? (0.50 + Math.random() * 0.10) : (-0.46 - Math.random() * 0.10);
    const baseX = 0.14 + (count % 2) * 0.06;
    const baseY = (side === 1 ? -0.32 : 0.32) + (Math.random() - 0.5) * 0.15;
    branch.rotation.set(baseX, baseY, baseZ);

    // Sprouting animation: full size immediately if loaded/planted, or microscopic bud if actively sprouting
    const initialGrowth = immediate ? 1.0 : 0.001;
    branch.scale.set(initialGrowth, initialGrowth, initialGrowth);

    // Arching sculpted branch stem
    const stemGeom = new THREE.CylinderGeometry(0.011, 0.020, branchLen, 8);
    stemGeom.translate(0, branchLen * 0.5, 0);
    const stemMesh = new THREE.Mesh(stemGeom, this.stemMat);
    stemMesh.castShadow = true;
    branch.add(stemMesh);

    // Sculpted foliage leaves along new branch
    const leafMesh1 = new THREE.Mesh(createSculptedFoliageLeaf(branchLen * 0.60, 0.07, 8), this.leafMat);
    leafMesh1.position.set(side * 0.006, branchLen * 0.40, 0.004);
    leafMesh1.rotation.set(0.18, side * 0.30, side * 0.25);
    leafMesh1.castShadow = true;
    branch.add(leafMesh1);

    const leafMesh2 = new THREE.Mesh(createSculptedFoliageLeaf(branchLen * 0.46, 0.05, 8), this.leafMat);
    leafMesh2.position.set(-side * 0.005, branchLen * 0.70, -0.004);
    leafMesh2.rotation.set(-0.14, -side * 0.28, -side * 0.22);
    leafMesh2.castShadow = true;
    branch.add(leafMesh2);

    // Tip floret mount
    const floretMount = new THREE.Group();
    floretMount.position.set(0, branchLen, 0);
    floretMount.rotation.z = side * -0.16;
    floretMount.rotation.x = 0.12;
    branch.add(floretMount);

    if (typeof this.createFloretFn === 'function') {
      const floret = this.createFloretFn(0.30, true);
      if (floret && floret.group) {
        floretMount.add(floret.group);
        if (typeof floret.setBloom === 'function') floret.setBloom(this.currentBloom);
        this.florets.push(floret);
      }
    }

    segGroup.add(branch);

    const branchEntry = {
      group: branch,
      mount: floretMount,
      side: side,
      baseZ: baseZ,
      baseX: baseX,
      growthScale: initialGrowth,
      targetGrowthScale: 1.0,
      isNamasteBranch: true
    };

    this.branchlets.push(branchEntry);
    return branchEntry;
  }

  resetNamasteBranches() {
    this.namasteBranchCount = 0;
    const retainedBranchlets = [];
    for (let i = 0; i < this.branchlets.length; i++) {
      const b = this.branchlets[i];
      if (b.isNamasteBranch) {
        if (b.group && b.group.parent) {
          b.group.parent.remove(b.group);
        }
        if (b.mount && b.mount.children) {
          b.mount.children.forEach(c => {
            const fIdx = this.florets.findIndex(f => f.group === c);
            if (fIdx !== -1) this.florets.splice(fIdx, 1);
          });
        }
      } else {
        retainedBranchlets.push(b);
      }
    }
    this.branchlets = retainedBranchlets;
  }
}

// ============================================================================
// 1. POPPY FLAME GEOMETRY (Papaver rhoeas)
// 4 broad, ruffled/crinkled paper-thin overlapping petals + Papaver seed capsule
// ============================================================================
function createPoppyPetalGeometry(width = 0.38, length = 0.52, uSegs = 16, vSegs = 20) {
  const vertices = [];
  const uvs = [];
  const indices = [];
  const colors = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const wProfile = Math.sin(Math.pow(vNorm, 0.75) * Math.PI * 0.7) * 1.35;
    const currentW = width * wProfile;

    const y = Math.sin(vNorm * Math.PI * 0.44) * length;
    const zBase = Math.pow(vNorm, 1.4) * (length * 0.42);

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1;
      const x = uNorm * currentW * 0.5;

      // Authentic papery crinkles & ruffles along perimeter
      const dish = Math.pow(Math.abs(uNorm), 1.7) * (0.05 * wProfile);
      const ruffles = (vNorm > 0.35) 
        ? Math.sin(uNorm * Math.PI * 4.5 + vNorm * 5.0) * (0.024 * vNorm)
        + Math.cos(uNorm * Math.PI * 9.0) * (0.009 * vNorm)
        : 0;

      const z = zBase + dish + ruffles;

      vertices.push(x, y, z);
      uvs.push(u / uSegs, vNorm);

      const c = new THREE.Color(0xd62817).lerp(new THREE.Color(0xff5733), Math.pow(vNorm, 1.1));
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = (v + 1) * (uSegs + 1) + u;
      const c = (v + 1) * (uSegs + 1) + (u + 1);
      const d = v * (uSegs + 1) + (u + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createPapaverCapsule(scale = 1.0) {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.045 * scale, 0.032 * scale, 0.09 * scale, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x3d4a36,
    roughness: 0.55,
    metalness: 0.05
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.045 * scale;
  group.add(bodyMesh);

  const crownGeo = new THREE.CylinderGeometry(0.052 * scale, 0.045 * scale, 0.015 * scale, 12);
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0x221a18,
    roughness: 0.45
  });
  const crownMesh = new THREE.Mesh(crownGeo, crownMat);
  crownMesh.position.y = 0.092 * scale;
  group.add(crownMesh);

  const rayGeo = new THREE.CylinderGeometry(0.003 * scale, 0.003 * scale, 0.046 * scale, 3);
  for (let i = 0; i < 10; i++) {
    const ray = new THREE.Mesh(rayGeo, crownMat);
    const ang = (i / 10) * Math.PI * 2;
    ray.position.set(Math.cos(ang) * 0.024 * scale, 0.098 * scale, Math.sin(ang) * 0.024 * scale);
    ray.rotation.y = ang;
    ray.rotation.z = Math.PI * 0.5;
    group.add(ray);
  }

  return group;
}

export class PoppyMorphology {
  constructor() {
    this.name = 'Wild Poppy (Papaver rhoeas)';
    this.family = 'Papaveraceae';
    this.tagline = '4 Ruffled Crinkled Petals • Velvet Stigmatic Capsule';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    // Build articulated botanical stem with companion poppy florets on lateral branches
    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.50,
      stemColor: 0x5a6349,
      leafColor: 0x3a4f37,
      neckTiltX: 0.08, // Subtle natural poppy poise
      createFloretFn: (scale) => this.createFloret(scale),
      reduceStemLeaves: true, // In Poppy alone, reduce main stem leaves so branch florets don't intersect on extension
      caulineLeafScale: 0.35
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // Papaver Seed Capsule
    this.capsule = createPapaverCapsule(1.0);
    this.headGroup.add(this.capsule);

    // Ring of velvety dark stamens
    const stamenMat = new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.4 });
    const stamenGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.075, 4);
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2;
      const st = new THREE.Mesh(stamenGeo, stamenMat);
      st.position.set(Math.cos(ang) * 0.065, 0.038, Math.sin(ang) * 0.065);
      st.rotation.z = 0.25 * Math.cos(ang);
      st.rotation.x = 0.25 * Math.sin(ang);
      this.headGroup.add(st);
    }

    // 4 Broad Ruffled Scarlet Petals
    this.petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xeb3823,
      roughness: 0.38,
      metalness: 0.04,
      sheen: 0.5,
      sheenColor: new THREE.Color(0xff8866),
      side: THREE.DoubleSide
    });

    const outerGeo = createPoppyPetalGeometry(0.42, 0.56, 16, 20);
    const innerGeo = createPoppyPetalGeometry(0.36, 0.48, 14, 18);

    // 2 Outer petals (0° and 180°)
    for (let i = 0; i < 2; i++) {
      const holder = new THREE.Group();
      holder.rotation.y = i * Math.PI;
      const mesh = new THREE.Mesh(outerGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.rotation.x = 0.75;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, baseAngle: 0.75 });
    }

    // 2 Inner petals (90° and 270°)
    for (let j = 0; j < 2; j++) {
      const holder = new THREE.Group();
      holder.rotation.y = (j * Math.PI) + (Math.PI * 0.5);
      const mesh = new THREE.Mesh(innerGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.rotation.x = 0.58;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, baseAngle: 0.58 });
    }

    // Mount physically into the top receptacle of the articulated stem!
    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();
    const fCapsule = createPapaverCapsule(scale);
    fGroup.add(fCapsule);

    const fPetalMat = new THREE.MeshPhysicalMaterial({
      color: 0xeb3823,
      roughness: 0.40,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const fGeo = createPoppyPetalGeometry(0.36 * scale, 0.48 * scale, 12, 14);
    const holders = [];

    for (let i = 0; i < 4; i++) {
      const holder = new THREE.Group();
      holder.rotation.y = i * (Math.PI * 0.5);
      const mesh = new THREE.Mesh(fGeo, fPetalMat);
      mesh.castShadow = true;
      mesh.rotation.x = 0.65;
      holder.add(mesh);
      fGroup.add(holder);
      holders.push(mesh);
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(m => {
          m.rotation.x = THREE.MathUtils.lerp(0.16, 1.15, b);
          const s = THREE.MathUtils.lerp(0.85, 1.12, b);
          m.scale.set(s, s, s);
        });
      },
      setWireframe: (w) => {
        fPetalMat.wireframe = w;
      }
    };
  }

  setStanceBalancing(enabled) {
    if (this.stem) this.stem.setStanceBalancing(enabled);
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to 1.16 rad so petal tip reaches max 90° horizontal, strictly zero drooping
      p.mesh.rotation.x = THREE.MathUtils.lerp(0.16, 1.16, val);
      const s = THREE.MathUtils.lerp(0.85, 1.15, val);
      p.mesh.scale.set(s, s, s);
    });
    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

// ============================================================================
// 2. PERIWINKLE / VINCA GEOMETRY (Vinca minor)
// 5 salverform propeller/pinwheel petals radiating from pentagonal throat
// ============================================================================
function createPeriwinklePetalGeometry(width = 0.22, length = 0.46, uSegs = 12, vSegs = 16) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const currentW = width * Math.sin(vNorm * Math.PI * 0.85);

    // Propeller skew: blade sweeps sideways as it extends outward
    const skew = Math.pow(vNorm, 1.4) * (width * 0.45);
    const y = Math.sin(vNorm * Math.PI * 0.5) * length;
    const z = Math.pow(vNorm, 1.6) * 0.08;

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1;
      const x = uNorm * currentW * 0.5 + skew;
      vertices.push(x, y, z);
      uvs.push(u / uSegs, vNorm);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = (v + 1) * (uSegs + 1) + u;
      const c = (v + 1) * (uSegs + 1) + (u + 1);
      const d = v * (uSegs + 1) + (u + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export class PeriwinkleMorphology {
  constructor() {
    this.name = 'Periwinkle (Vinca minor)';
    this.family = 'Apocynaceae';
    this.tagline = '5 Salverform Propeller Petals • Pentagonal Throat';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.55,
      stemColor: 0x5b6b60,
      leafColor: 0x365239,
      neckTiltX: 0.04,
      createFloretFn: (scale) => this.createFloret(scale)
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // Pentagonal tubular throat
    const throatGeo = new THREE.CylinderGeometry(0.034, 0.018, 0.08, 5);
    const throatMat = new THREE.MeshStandardMaterial({ color: 0x3a457a });
    const throatMesh = new THREE.Mesh(throatGeo, throatMat);
    throatMesh.position.y = -0.04;
    this.headGroup.add(throatMesh);

    // Star-shaped white coronal eye ring
    const eyeGeo = new THREE.RingGeometry(0.012, 0.038, 5);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, side: THREE.DoubleSide });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.y = 0.002;
    eyeMesh.rotation.x = -Math.PI * 0.5;
    this.headGroup.add(eyeMesh);

    // 5 Salverform Pinwheel Petals
    this.petalMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f5ba8,
      roughness: 0.40,
      metalness: 0.05,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xc4ccff),
      side: THREE.DoubleSide
    });

    const petalGeo = createPeriwinklePetalGeometry(0.24, 0.48, 12, 16);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(petalGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.rotation.x = 0.85;
      mesh.rotation.z = 0.12;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh });
    }

    // Mount physically into the top receptacle of the articulated stem!
    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();

    const fEyeGeo = new THREE.RingGeometry(0.010 * scale, 0.030 * scale, 5);
    const fEyeMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, side: THREE.DoubleSide });
    const fEyeMesh = new THREE.Mesh(fEyeGeo, fEyeMat);
    fEyeMesh.rotation.x = -Math.PI * 0.5;
    fGroup.add(fEyeMesh);

    const fPetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f5ba8,
      roughness: 0.42,
      side: THREE.DoubleSide
    });

    const fGeo = createPeriwinklePetalGeometry(0.22 * scale, 0.42 * scale, 10, 12);
    const holders = [];

    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(fGeo, fPetalMat);
      mesh.castShadow = true;
      mesh.rotation.x = 0.75;
      mesh.rotation.z = 0.10;
      holder.add(mesh);
      fGroup.add(holder);
      holders.push(mesh);
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(m => {
          m.rotation.x = THREE.MathUtils.lerp(0.18, 1.18, b);
          const s = THREE.MathUtils.lerp(0.85, 1.12, b);
          m.scale.set(s, s, s);
        });
      },
      setWireframe: (w) => {
        fPetalMat.wireframe = w;
      }
    };
  }

  setStanceBalancing(enabled) {
    if (this.stem) this.stem.setStanceBalancing(enabled);
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to 1.20 rad so petal tip reaches max 90° horizontal, strictly zero drooping
      p.mesh.rotation.x = THREE.MathUtils.lerp(0.18, 1.20, val);
      const s = THREE.MathUtils.lerp(0.85, 1.15, val);
      p.mesh.scale.set(s, s, s);
    });
    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

// ============================================================================
// 3. CHAMOMILE WHEAT GEOMETRY (Matricaria chamomilla)
// 16 slender radiating ray petals surrounding a conical golden disk dome
// ============================================================================
function createRayPetalGeometry(width = 0.075, length = 0.42, segs = 14) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const w = width * Math.sin(t * Math.PI * 0.9);
    const y = Math.sin(t * Math.PI * 0.48) * length;
    const zArch = -Math.pow(t, 2) * (length * 0.15);

    vertices.push(-w * 0.5, y, zArch);
    uvs.push(0, t);
    vertices.push(w * 0.5, y, zArch);
    uvs.push(1, t);
  }

  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, d);
    indices.push(a, d, c);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export class ChamomileMorphology {
  constructor() {
    this.name = 'Chamomile Wheat (Matricaria)';
    this.family = 'Asteraceae';
    this.tagline = '16 Radiating Ray Petals • Conical Golden Disk Florets';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.45,
      stemColor: 0x626651,
      leafColor: 0x3d503b,
      neckTiltX: 0.04,
      createFloretFn: (scale) => this.createFloret(scale)
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // Conical Raised Golden Disk Dome
    const diskGeo = new THREE.ConeGeometry(0.095, 0.085, 16);
    this.diskMat = new THREE.MeshStandardMaterial({
      color: 0xdeb82c,
      emissive: 0xbf8513,
      emissiveIntensity: 0.35,
      roughness: 0.50
    });
    const diskMesh = new THREE.Mesh(diskGeo, this.diskMat);
    diskMesh.position.y = 0.042;
    this.headGroup.add(diskMesh);

    // 16 Radiating Ray Petals
    this.petalMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0dc,
      roughness: 0.35,
      metalness: 0.03,
      side: THREE.DoubleSide
    });

    const rayGeo = createRayPetalGeometry(0.082, 0.44, 14);
    const count = 16;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(rayGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.012, 0.065);
      mesh.rotation.x = 1.15;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh });
    }

    // Mount physically into the top receptacle of the articulated stem!
    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();
    const fDiskGeo = new THREE.ConeGeometry(0.075 * scale, 0.065 * scale, 12);
    const fDiskMat = new THREE.MeshStandardMaterial({
      color: 0xdeb82c,
      emissive: 0xbf8513,
      emissiveIntensity: 0.30,
      roughness: 0.55
    });
    const fDiskMesh = new THREE.Mesh(fDiskGeo, fDiskMat);
    fDiskMesh.position.y = 0.032 * scale;
    fGroup.add(fDiskMesh);

    const fPetalMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0dc,
      roughness: 0.38,
      side: THREE.DoubleSide
    });

    const fGeo = createRayPetalGeometry(0.070 * scale, 0.36 * scale, 10);
    const holders = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(fGeo, fPetalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.010 * scale, 0.048 * scale);
      mesh.rotation.x = 1.10;
      holder.add(mesh);
      fGroup.add(holder);
      holders.push(mesh);
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(m => {
          m.rotation.x = THREE.MathUtils.lerp(0.18, 1.20, b);
          const s = THREE.MathUtils.lerp(0.85, 1.10, b);
          m.scale.set(s, s, s);
        });
      },
      setWireframe: (w) => {
        fPetalMat.wireframe = w;
        fDiskMat.wireframe = w;
      }
    };
  }

  setStanceBalancing(enabled) {
    if (this.stem) this.stem.setStanceBalancing(enabled);
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to 1.22 rad so petal tip reaches max 90° horizontal, strictly zero drooping
      p.mesh.rotation.x = THREE.MathUtils.lerp(0.18, 1.22, val);
      const s = THREE.MathUtils.lerp(0.85, 1.10, val);
      p.mesh.scale.set(s, s, s);
    });
    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    this.diskMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

// ============================================================================
// 4. CHAMPA (FRANGIPANI) GEOMETRY (Plumeria rubra / alba)
// 5 broad velvety obovate pinwheel petals with organic biological asymmetry,
// natural leading-edge flare, feathered golden-saffron heart, and gentle reflex.
// ============================================================================
function createChampaPetalGeometry(width = 0.33, length = 0.52, uSegs = 16, vSegs = 20) {
  const vertices = [];
  const uvs = [];
  const colors = [];
  const indices = [];

  // Authentic Plumeria palette:
  // Deep saffron amber throat -> warm golden yolk -> butter yellow -> velvety warm ivory with delicate blush
  const cAmber = new THREE.Color(0xff8000);   // Deep saffron core
  const cGold = new THREE.Color(0xffbe0b);    // Warm sunny gold
  const cButter = new THREE.Color(0xfff1b8);  // Soft creamy butter
  const cIvory = new THREE.Color(0xfcfaf6);   // Velvet porcelain white
  const cBlush = new THREE.Color(0xfcf2ec);   // Delicate petal margin blush

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;

    // Organic obovate paddle profile:
    // Narrow tapering claw at base, swells into wide generous blade at 0.55-0.70,
    // and rounds with a soft organic curve toward the tip
    let wFactor;
    if (vNorm < 0.18) {
      wFactor = 0.20 + Math.sin((vNorm / 0.18) * Math.PI * 0.5) * 0.42;
    } else if (vNorm < 0.68) {
      const t = (vNorm - 0.18) / 0.50;
      wFactor = 0.62 + Math.sin(t * Math.PI * 0.5) * 0.38;
    } else {
      const t = (vNorm - 0.68) / 0.32;
      wFactor = 1.0 - Math.pow(t, 1.65) * 0.84;
    }

    // Natural longitudinal reflex curve: gentle arch outward with subtle recurve at the petal tip
    const y = Math.sin(vNorm * Math.PI * 0.47) * length;
    const zArch = Math.pow(vNorm, 1.30) * (length * 0.24);
    // Tip reflex: tip relaxes slightly backward into the breeze
    const tipReflex = Math.pow(Math.max(0, vNorm - 0.72) / 0.28, 2.2) * 0.018;

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1; // -1 to 1 across width

      // Natural Botanical Asymmetry:
      // In real Plumeria, the overlapping leading edge (u > 0) sweeps out slightly broader (+14%),
      // giving each petal its characteristic pinwheel sickle curve
      const asymWidth = uNorm > 0 ? (1.0 + uNorm * 0.14) : (1.0 - Math.abs(uNorm) * 0.04);
      const currentW = Math.max(0.015, width * wFactor * asymWidth);
      const x = uNorm * currentW * 0.5;

      // 1. Organic pinwheel spiral twist: leading edge curves upward, trailing edge rolls under
      const pinwheelCurl = Math.sin(uNorm * Math.PI * 0.5) * (0.028 * Math.pow(vNorm, 0.95));

      // 2. Gentle central dish / canoe concavity (midrib depth)
      const midribDish = -Math.cos(uNorm * Math.PI * 0.5) * (0.018 * Math.sin(vNorm * Math.PI * 0.85));

      // 3. Subtle organic blade undulation along margin (giving the velvety petal gentle life)
      const edgeUndulation = (Math.abs(uNorm) > 0.6)
        ? Math.sin(vNorm * Math.PI * 3.5 + uNorm * 1.5) * 0.005 * vNorm
        : 0;

      const z = zArch - tipReflex + pinwheelCurl + midribDish + edgeUndulation;

      vertices.push(x, y, z);
      uvs.push(u / uSegs, vNorm);

      // Feathered organic color bleed with soft striae along petal veins
      const centerFeather = Math.max(0, 1.0 - Math.abs(uNorm) * 1.3) * 0.14;
      const veinStriae = Math.sin(uNorm * Math.PI * 4.0) * 0.025 * (1.0 - vNorm);
      const effV = Math.max(0, Math.min(1.0, vNorm - (centerFeather + veinStriae)));

      const c = new THREE.Color();
      if (effV < 0.16) {
        c.copy(cAmber).lerp(cGold, effV / 0.16);
      } else if (effV < 0.45) {
        const t = (effV - 0.16) / 0.29;
        c.copy(cGold).lerp(cButter, Math.pow(t, 1.15));
      } else if (effV < 0.75) {
        const t = (effV - 0.45) / 0.30;
        c.copy(cButter).lerp(cIvory, Math.pow(t, 1.25));
      } else {
        // Soft outer ivory with very subtle warm blush near edges
        const edgeT = Math.pow(Math.abs(uNorm), 2.0) * 0.35;
        c.copy(cIvory).lerp(cBlush, edgeT);
      }
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = (v + 1) * (uSegs + 1) + u;
      const c = (v + 1) * (uSegs + 1) + (u + 1);
      const d = v * (uSegs + 1) + (u + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

const createChalicePetalGeometry = createChampaPetalGeometry;

export class ChampaMorphology {
  constructor() {
    this.name = 'Champa (Plumeria)';
    this.family = 'Apocynaceae';
    this.tagline = '5 Spiral Pinwheel Petals • Golden Sunlight Heart';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    // Articulated botanical stem with companion Champa florets on lateral branches
    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.52,
      stemColor: 0x4a5d42,
      leafColor: 0x2b4528,
      neckTiltX: 0.06,
      createFloretFn: (scale) => this.createFloret(scale)
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // Calyx / Receptacle base collar
    const calyxGeo = new THREE.CylinderGeometry(0.040, 0.022, 0.04, 8);
    const calyxMat = new THREE.MeshStandardMaterial({ color: 0x3d5438, roughness: 0.60 });
    const calyxMesh = new THREE.Mesh(calyxGeo, calyxMat);
    calyxMesh.position.y = -0.025;
    this.headGroup.add(calyxMesh);

    // Central floral throat tube (characteristic sunken eye of Champa)
    const throatGeo = new THREE.CylinderGeometry(0.026, 0.014, 0.045, 12, 1, true);
    this.throatMat = new THREE.MeshStandardMaterial({
      color: 0xff8c00,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const throatMesh = new THREE.Mesh(throatGeo, this.throatMat);
    throatMesh.position.y = -0.012;
    this.headGroup.add(throatMesh);

    // Micro-anthers ring inside throat
    const stamenMat = new THREE.MeshStandardMaterial({ color: 0xffa000, roughness: 0.4 });
    const stamenGeo = new THREE.SphereGeometry(0.005, 6, 6);
    for (let s = 0; s < 5; s++) {
      const ang = (s / 5) * Math.PI * 2;
      const st = new THREE.Mesh(stamenGeo, stamenMat);
      st.position.set(Math.cos(ang) * 0.012, -0.008, Math.sin(ang) * 0.012);
      this.headGroup.add(st);
    }

    // Champa petal material with soft velvety texture, warm sheen and vertex colors
    this.petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.36, // Velvety soft-matte finish
      metalness: 0.01,
      sheen: 0.65,
      sheenColor: new THREE.Color(0xffe8ba), // Warm golden rim glow
      clearcoat: 0.08, // Subtle waxy natural cuticle
      clearcoatRoughness: 0.35,
      side: THREE.DoubleSide
    });

    // 5 Naturally Varied Pinwheel Petals (subtle biological asymmetry)
    const petalGeo = createChampaPetalGeometry(0.33, 0.52, 16, 20);
    const petalVariations = [
      { rotX: 0.82, rotZ: 0.22, rotYOff: 0.000, scale: 1.00 },
      { rotX: 0.80, rotZ: 0.24, rotYOff: 0.022, scale: 0.98 },
      { rotX: 0.84, rotZ: 0.20, rotYOff: -0.018, scale: 1.02 },
      { rotX: 0.81, rotZ: 0.23, rotYOff: 0.014, scale: 0.99 },
      { rotX: 0.83, rotZ: 0.21, rotYOff: -0.016, scale: 1.01 },
    ];

    for (let i = 0; i < 5; i++) {
      const v = petalVariations[i];
      const ang = (i / 5) * Math.PI * 2 + v.rotYOff;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(petalGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.rotation.x = v.rotX;
      mesh.rotation.z = v.rotZ;
      mesh.scale.set(v.scale, v.scale, v.scale);
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({
        holder,
        mesh,
        baseRotX: v.rotX,
        baseRotZ: v.rotZ,
        baseScale: v.scale
      });
    }

    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();

    const fThroatGeo = new THREE.CylinderGeometry(0.020 * scale, 0.010 * scale, 0.035 * scale, 8, 1, true);
    const fThroatMesh = new THREE.Mesh(fThroatGeo, this.throatMat);
    fGroup.add(fThroatMesh);

    const fGeo = createChampaPetalGeometry(0.28 * scale, 0.44 * scale, 12, 16);
    const holders = [];

    const floretVariations = [
      { rotX: 0.78, rotZ: 0.20, rotYOff: 0.000, scale: 1.00 },
      { rotX: 0.76, rotZ: 0.22, rotYOff: 0.020, scale: 0.97 },
      { rotX: 0.80, rotZ: 0.18, rotYOff: -0.018, scale: 1.03 },
      { rotX: 0.77, rotZ: 0.21, rotYOff: 0.015, scale: 0.98 },
      { rotX: 0.79, rotZ: 0.19, rotYOff: -0.015, scale: 1.01 }
    ];

    for (let i = 0; i < 5; i++) {
      const v = floretVariations[i];
      const ang = (i / 5) * Math.PI * 2 + v.rotYOff;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(fGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.rotation.x = v.rotX;
      mesh.rotation.z = v.rotZ;
      mesh.scale.set(v.scale, v.scale, v.scale);
      holder.add(mesh);
      fGroup.add(holder);
      holders.push({ mesh, baseRotX: v.rotX, baseRotZ: v.rotZ, baseScale: v.scale });
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(h => {
          h.mesh.rotation.x = THREE.MathUtils.lerp(h.baseRotX * 0.22, h.baseRotX * 1.42, b);
          h.mesh.rotation.z = THREE.MathUtils.lerp(h.baseRotZ * 1.80, h.baseRotZ * 0.70, b);
          const s = h.baseScale * THREE.MathUtils.lerp(0.85, 1.10, b);
          h.mesh.scale.set(s, s, s);
        });
      }
    };
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to baseRotX * 1.42 so petal tips reach max 90° horizontal, strictly zero drooping
      p.mesh.rotation.x = THREE.MathUtils.lerp(p.baseRotX * 0.22, p.baseRotX * 1.42, val);
      p.mesh.rotation.z = THREE.MathUtils.lerp(p.baseRotZ * 1.80, p.baseRotZ * 0.70, val);
      const s = p.baseScale * THREE.MathUtils.lerp(0.85, 1.12, val);
      p.mesh.scale.set(s, s, s);
    });

    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    if (this.throatMat) this.throatMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

export const MeadowChaliceMorphology = ChampaMorphology;

// ============================================================================
// 5. FESTIVE INDIAN MARIGOLD (Tagetes erecta / Genda)
// Auspicious festive bloom with dense multi-tiered ruffled saffron-gold petals
// ============================================================================
function createMarigoldPetalGeometry(width = 0.16, length = 0.36, uSegs = 8, vSegs = 12) {
  const vertices = [];
  const uvs = [];
  const colors = [];
  const indices = [];

  // Gradient: Deep festive saffron orange at base -> sunny marigold gold at tip
  const baseColor = new THREE.Color(0xd94e00);
  const tipColor = new THREE.Color(0xffb703);

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const currentW = width * Math.pow(vNorm, 0.65);
    const y = Math.sin(vNorm * Math.PI * 0.5) * length;
    const archZ = Math.pow(vNorm, 1.4) * 0.08;
    const col = baseColor.clone().lerp(tipColor, Math.pow(vNorm, 0.9));

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1; // -1 to +1
      // Scalloped / ruffled flute along petal edges
      const flute = Math.sin(uNorm * Math.PI * 2.5) * (0.012 * vNorm);
      // Spoon-like longitudinal cup
      const cup = (1 - uNorm * uNorm) * (currentW * 0.25);
      const x = uNorm * currentW * 0.5;
      const z = archZ + cup + flute;

      vertices.push(x, y, z);
      uvs.push(u / uSegs, vNorm);
      colors.push(col.r, col.g, col.b);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = (v + 1) * (uSegs + 1) + u;
      const c = (v + 1) * (uSegs + 1) + (u + 1);
      const d = v * (uSegs + 1) + (u + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export class MarigoldMorphology {
  constructor() {
    this.name = 'Festive Marigold (Tagetes erecta)';
    this.family = 'Asteraceae (Genda)';
    this.tagline = 'Concentric Ruffled Rosette • Golden Saffron Pom-Pom';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.50,
      stemColor: 0x485a3c,
      leafColor: 0x344d2d,
      neckTiltX: 0.04,
      createFloretFn: (scale) => this.createFloret(scale)
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // 1. Dark roasted saffron / mossy calyx base cup
    const cupGeo = new THREE.CylinderGeometry(0.048, 0.024, 0.07, 14);
    this.cupMat = new THREE.MeshStandardMaterial({
      color: 0x3a4c2f,
      roughness: 0.6
    });
    const cupMesh = new THREE.Mesh(cupGeo, this.cupMat);
    cupMesh.position.y = -0.02;
    this.headGroup.add(cupMesh);

    // 2. Central golden pollen core dome
    const coreGeo = new THREE.SphereGeometry(0.048, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xe67e00,
      emissive: 0xb35300,
      emissiveIntensity: 0.35,
      roughness: 0.45
    });
    const coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    coreMesh.position.y = 0.015;
    this.headGroup.add(coreMesh);

    // 3. Multi-Tiered Concentric Ruffled Saffron Petals
    this.petalMat = new THREE.MeshStandardMaterial({
      roughness: 0.35,
      metalness: 0.04,
      vertexColors: true,
      side: THREE.DoubleSide
    });

    const innerGeo = createMarigoldPetalGeometry(0.13, 0.26, 8, 10);
    const midGeo = createMarigoldPetalGeometry(0.16, 0.34, 8, 12);
    const outerGeo = createMarigoldPetalGeometry(0.18, 0.42, 8, 12);
    const collarGeo = createMarigoldPetalGeometry(0.19, 0.46, 8, 12);

    // Tier 1: Inner rosette (8 upright ruffled petals)
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(innerGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.015, 0.035);
      mesh.rotation.x = 0.45;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, baseRotX: 0.45, openAngle: 0.85 });
    }

    // Tier 2: Mid rosette (10 radiating ruffled petals)
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + 0.15;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(midGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.010, 0.050);
      mesh.rotation.x = 0.75;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, baseRotX: 0.75, openAngle: 1.15 });
    }

    // Tier 3: Outer whorl (12 broad ruffled petals)
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2 + 0.08;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(outerGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.005, 0.065);
      mesh.rotation.x = 1.05;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, baseRotX: 1.05, openAngle: 1.20 });
    }

    // Tier 4: Base collar (12 spreading petals)
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2 + 0.22;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(collarGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.000, 0.075);
      mesh.rotation.x = 1.20;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, baseRotX: 1.20, openAngle: 1.35 });
    }

    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();
    const fGeo = createMarigoldPetalGeometry(0.12 * scale, 0.24 * scale, 6, 8);
    const fMat = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      vertexColors: true,
      side: THREE.DoubleSide
    });

    const holders = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;
      const mesh = new THREE.Mesh(fGeo, fMat);
      mesh.position.set(0, 0, 0.02 * scale);
      mesh.rotation.x = 0.35;
      holder.add(mesh);
      fGroup.add(holder);
      holders.push(mesh);
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(m => {
          m.rotation.x = THREE.MathUtils.lerp(0.20, 1.15, b);
        });
      },
      setWireframe: (w) => {
        fMat.wireframe = w;
      }
    };
  }

  setStanceBalancing(enabled) {
    if (this.stem) this.stem.setStanceBalancing(enabled);
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to max 1.35 rad so outer whorl reaches max 90° horizontal, strictly zero drooping
      const targetAngle = THREE.MathUtils.lerp(p.baseRotX * 0.22, Math.min(1.35, p.openAngle), val);
      p.mesh.rotation.x = targetAngle;
      const s = THREE.MathUtils.lerp(0.85, 1.10, val);
      p.mesh.scale.set(s, s, s);
    });
    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    this.cupMat.wireframe = wire;
    this.coreMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

// Backward compatibility: Celadon Bell
export class CeladonBellMorphology extends MarigoldMorphology {}

// ============================================================================
// 5. SACRED LOTUS GEOMETRY (Nelumbo nucifera)
// Clean architectural lotus: 3 concentric tiers of cymbiform boat petals,
// flat-topped golden torus seed pod, and articulated botanical spine.
// ============================================================================
function createLotusPetalGeometry(width = 0.22, length = 0.48, uSegs = 10, vSegs = 16) {
  const vertices = [];
  const uvs = [];
  const colors = [];
  const indices = [];

  // Gradient: Sacred soft ivory at base -> radiant rose pink at tip
  const baseColor = new THREE.Color(0xfcf7f9);
  const tipColor = new THREE.Color(0xeb4d88);

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;

    // Graceful boat-shaped lotus petal: narrow base, wide center (v~0.55), pointed apex
    let widthProfile;
    if (vNorm < 0.55) {
      widthProfile = Math.sin((vNorm / 0.55) * (Math.PI * 0.5));
    } else {
      widthProfile = Math.cos(((vNorm - 0.55) / 0.45) * (Math.PI * 0.5));
    }
    const currentW = width * (0.16 + 0.84 * Math.pow(Math.max(0, widthProfile), 0.85));

    // Longitudinal curvature: cups upward and forward
    const y = Math.sin(vNorm * Math.PI * 0.5) * length;
    const archZ = Math.sin(vNorm * Math.PI * 0.85) * (length * 0.12);

    // Tip color blush interpolation
    const col = baseColor.clone().lerp(tipColor, Math.pow(vNorm, 1.35));

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1; // -1 to +1
      // Lateral spoon/cymbiform cupping
      const cupZ = (1 - uNorm * uNorm) * (currentW * 0.35);
      const x = uNorm * currentW * 0.5;
      const z = archZ + cupZ;

      vertices.push(x, y, z);
      uvs.push(u / uSegs, vNorm);
      colors.push(col.r, col.g, col.b);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = (v + 1) * (uSegs + 1) + u;
      const c = (v + 1) * (uSegs + 1) + (u + 1);
      const d = v * (uSegs + 1) + (u + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export class LotusMorphology {
  constructor() {
    this.name = 'Sacred Lotus (Nelumbo nucifera)';
    this.family = 'Nelumbonaceae';
    this.tagline = 'Multi-Tiered Rose Petals • Golden Seed Pod Torus';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.55,
      stemColor: 0x485c49,
      leafColor: 0x364f3c,
      neckTiltX: 0.04,
      createFloretFn: (scale) => this.createFloret(scale)
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // 1. Central Iconic Flat-Topped Golden Lotus Torus (Seed Pod)
    const torusGeo = new THREE.CylinderGeometry(0.065, 0.038, 0.052, 16);
    this.torusMat = new THREE.MeshStandardMaterial({
      color: 0xdeb82c,
      emissive: 0xa87510,
      emissiveIntensity: 0.28,
      roughness: 0.45,
      metalness: 0.08
    });
    const torusMesh = new THREE.Mesh(torusGeo, this.torusMat);
    torusMesh.position.y = 0.026;
    this.headGroup.add(torusMesh);

    // Golden flat seed pod disc with carpel dots
    const discGeo = new THREE.CircleGeometry(0.064, 16);
    discGeo.rotateX(-Math.PI * 0.5);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0xbf9515,
      roughness: 0.50
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.y = 0.053;
    this.headGroup.add(discMesh);

    // 2. Ring of Golden Anther Stamens around the Pod
    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      roughness: 0.40,
      metalness: 0.1
    });
    const stamenCount = 28;
    for (let i = 0; i < stamenCount; i++) {
      const ang = (i / stamenCount) * Math.PI * 2;
      const sGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.035, 4);
      const sMesh = new THREE.Mesh(sGeo, stamenMat);
      const r = 0.072;
      sMesh.position.set(Math.cos(ang) * r, 0.035, Math.sin(ang) * r);
      sMesh.rotation.z = (Math.random() - 0.5) * 0.15;
      this.headGroup.add(sMesh);
    }

    // 3. Three Concentric Tiers of Cymbiform Lotus Petals
    this.petalMat = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.04,
      vertexColors: true,
      side: THREE.DoubleSide
    });

    const innerGeo = createLotusPetalGeometry(0.20, 0.38, 10, 14);
    const midGeo = createLotusPetalGeometry(0.24, 0.46, 10, 16);
    const outerGeo = createLotusPetalGeometry(0.26, 0.52, 10, 16);

    // Tier 1: Inner Whorl (6 petals cupping close around torus pod)
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + 0.1;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(innerGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.015, 0.065);
      mesh.rotation.x = 0.55;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, tier: 'inner', baseRotX: 0.55, openAngle: 0.95 });
    }

    // Tier 2: Mid Whorl (8 petals radiating outward)
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + (Math.PI / 8);
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(midGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.010, 0.085);
      mesh.rotation.x = 0.85;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, tier: 'mid', baseRotX: 0.85, openAngle: 1.05 });
    }

    // Tier 3: Outer Whorl (8 broad outer petals floating gracefully)
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(outerGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.005, 0.095);
      mesh.rotation.x = 1.05;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh, tier: 'outer', baseRotX: 1.05, openAngle: 1.28 });
    }

    // Mount physically into the top receptacle of the articulated stem!
    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();
    const fGeo = createLotusPetalGeometry(0.14 * scale, 0.32 * scale, 8, 12);
    const fMat = new THREE.MeshStandardMaterial({
      roughness: 0.40,
      vertexColors: true,
      side: THREE.DoubleSide
    });

    const holders = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(fGeo, fMat);
      mesh.position.set(0, 0, 0.035 * scale);
      mesh.rotation.x = 0.35; // tightly folded bud
      holder.add(mesh);
      fGroup.add(holder);
      holders.push(mesh);
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(m => {
          m.rotation.x = THREE.MathUtils.lerp(0.20, 1.10, b);
        });
      },
      setWireframe: (w) => {
        fMat.wireframe = w;
      }
    };
  }

  setStanceBalancing(enabled) {
    if (this.stem) this.stem.setStanceBalancing(enabled);
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to max 1.35 rad so outer whorl reaches max 90° horizontal, strictly zero drooping
      const targetAngle = THREE.MathUtils.lerp(p.baseRotX * 0.22, Math.min(1.35, p.openAngle), val);
      p.mesh.rotation.x = targetAngle;
      const s = THREE.MathUtils.lerp(0.85, 1.10, val);
      p.mesh.scale.set(s, s, s);
    });
    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    this.torusMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

// ============================================================================
// 6. ROYAL HIBISCUS GEOMETRY (Hibiscus rosa-sinensis)
// 5 broad radiant trumpet petals with projecting staminal column
// ============================================================================
function createHibiscusPetalGeometry(width = 0.30, length = 0.48, uSegs = 10, vSegs = 14) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const currentW = width * Math.pow(vNorm, 0.75);
    const y = Math.sin(vNorm * Math.PI * 0.5) * length;
    const z = Math.pow(vNorm, 1.35) * 0.10;

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1;
      const ripple = Math.sin(uNorm * Math.PI * 3.0) * (0.015 * vNorm);
      const x = uNorm * currentW * 0.5;
      vertices.push(x, y, z + ripple);
      uvs.push(u / uSegs, vNorm);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = (v + 1) * (uSegs + 1) + u;
      const c = (v + 1) * (uSegs + 1) + (u + 1);
      const d = v * (uSegs + 1) + (u + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export class HibiscusMorphology {
  constructor() {
    this.name = 'Royal Hibiscus (Hibiscus rosa-sinensis)';
    this.family = 'Malvaceae';
    this.tagline = 'Flared Scarlet Trumpet Petals • Projecting Staminal Column';
    this.petalHolders = [];
    this.currentBloom = 0.08;

    this.stem = new BotanicalArticulatedStem({
      totalHeight: 1.55,
      stemColor: 0x5a5445,
      leafColor: 0x364f34,
      neckTiltX: 0.06,
      createFloretFn: (scale) => this.createFloret(scale)
    });

    this.group = this.stem.group;
    this.initMainHead();
  }

  initMainHead() {
    this.headGroup = new THREE.Group();

    // 1. Projecting Staminal Column (Iconic Hibiscus feature)
    const colGeo = new THREE.CylinderGeometry(0.010, 0.018, 0.38, 12);
    colGeo.translate(0, 0.19, 0);
    this.colMat = new THREE.MeshStandardMaterial({
      color: 0xd92626,
      roughness: 0.35
    });
    this.columnMesh = new THREE.Mesh(colGeo, this.colMat);
    this.columnMesh.rotation.x = 0.15;
    this.headGroup.add(this.columnMesh);

    // Golden anthers dusting the upper column
    const antherMat = new THREE.MeshStandardMaterial({
      color: 0xf5b041,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      roughness: 0.40
    });
    const antherCount = 20;
    for (let i = 0; i < antherCount; i++) {
      const aGeo = new THREE.SphereGeometry(0.009, 6, 6);
      const aMesh = new THREE.Mesh(aGeo, antherMat);
      const y = 0.22 + Math.random() * 0.12;
      const ang = Math.random() * Math.PI * 2;
      const r = 0.016 + Math.random() * 0.014;
      aMesh.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
      this.columnMesh.add(aMesh);
    }

    // 5 velvety red stigmatic pads at the top tip
    const tipPadMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const padGeo = new THREE.SphereGeometry(0.008, 6, 6);
      const padMesh = new THREE.Mesh(padGeo, tipPadMat);
      padMesh.position.set(Math.cos(ang) * 0.018, 0.385, Math.sin(ang) * 0.018);
      this.columnMesh.add(padMesh);
    }

    // 2. 5 Radiant Scarlet Flared Trumpet Petals
    this.petalMat = new THREE.MeshStandardMaterial({
      color: 0xeb2f2f,
      roughness: 0.38,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const petalGeo = createHibiscusPetalGeometry(0.32, 0.48, 12, 16);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(petalGeo, this.petalMat);
      mesh.castShadow = true;
      mesh.position.set(0, 0.012, 0.05);
      mesh.rotation.x = 0.95;
      holder.add(mesh);
      this.headGroup.add(holder);
      this.petalHolders.push({ holder, mesh });
    }

    this.stem.receptacle.add(this.headGroup);
  }

  createFloret(scale = 0.65) {
    const fGroup = new THREE.Group();
    const fGeo = createHibiscusPetalGeometry(0.18 * scale, 0.32 * scale, 8, 10);
    const fMat = new THREE.MeshStandardMaterial({
      color: 0xeb2f2f,
      roughness: 0.40,
      side: THREE.DoubleSide
    });

    const holders = [];
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = ang;

      const mesh = new THREE.Mesh(fGeo, fMat);
      mesh.position.set(0, 0, 0.03 * scale);
      mesh.rotation.x = 0.45;
      holder.add(mesh);
      fGroup.add(holder);
      holders.push(mesh);
    }

    return {
      group: fGroup,
      setBloom: (b) => {
        holders.forEach(m => {
          m.rotation.x = THREE.MathUtils.lerp(0.18, 1.18, b);
        });
      },
      setWireframe: (w) => {
        fMat.wireframe = w;
      }
    };
  }

  setStanceBalancing(enabled) {
    if (this.stem) this.stem.setStanceBalancing(enabled);
  }

  applyKinematics(kinematics, dt = 0.016) {
    this.stem.applyKinematics(kinematics, dt);
    const bloom = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : this.currentBloom;
    this.setBloom(bloom);
  }

  setBloom(val) {
    this.currentBloom = val;
    this.petalHolders.forEach(p => {
      // Clamped to 1.20 rad so petal tip reaches max 90° horizontal, strictly zero drooping
      p.mesh.rotation.x = THREE.MathUtils.lerp(0.18, 1.20, val);
      const s = THREE.MathUtils.lerp(0.85, 1.15, val);
      p.mesh.scale.set(s, s, s);
    });
    this.stem.setBloom(val);
  }

  setWireframe(wire) {
    this.petalMat.wireframe = wire;
    this.colMat.wireframe = wire;
    this.stem.setWireframe(wire);
  }
}

// Backward compatibility aliases
export const OriginalLotusMorphology = LotusMorphology;
export const OriginalHibiscusMorphology = HibiscusMorphology;
