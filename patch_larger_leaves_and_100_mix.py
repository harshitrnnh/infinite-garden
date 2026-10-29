import re

# =============================================================================
# 1. Update src/meadow-lab/flower-geometries.js with LARGER main stem leaves
# =============================================================================
with open('src/meadow-lab/flower-geometries.js', 'r') as f:
    fg = f.read()

# Make main stem leaves above branches larger & fuller
old_upper_leaves = '''        // Delicate cauline leaf along main stem ABOVE the right branch
        const stemLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.25, 0.062, 8), this.leafMat);
        stemLeaf3.position.set(-0.012, this.segmentHeight * 0.75, 0.008);
        stemLeaf3.rotation.set(0.22, -0.45, -0.32);
        segGroup.add(stemLeaf3);
      }

      // =====================================================================
      // NODE 4: Upper Stem Segment (Alternating Cauline Leaves Leading to Top Flower)
      // =====================================================================
      if (i === 4) {
        // Lower leaf along Segment 4 pointing forward-right
        const stemLeaf4a = new THREE.Mesh(createSculptedFoliageLeaf(0.22, 0.055, 8), this.leafMat);
        stemLeaf4a.position.set(0.010, this.segmentHeight * 0.35, 0.010);
        stemLeaf4a.rotation.set(0.24, 0.65, 0.30);
        segGroup.add(stemLeaf4a);

        // Upper leaf along Segment 4 pointing left-backward
        const stemLeaf4b = new THREE.Mesh(createSculptedFoliageLeaf(0.18, 0.046, 8), this.leafMat);
        stemLeaf4b.position.set(-0.008, this.segmentHeight * 0.78, -0.010);
        stemLeaf4b.rotation.set(0.18, -2.10, -0.25);
        segGroup.add(stemLeaf4b);
      }'''

new_upper_leaves = '''        // Noticeably larger sculpted cauline leaf along main stem ABOVE right branch
        const stemLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.44, 0.115, 10), this.leafMat);
        stemLeaf3.position.set(-0.015, this.segmentHeight * 0.72, 0.010);
        stemLeaf3.rotation.set(0.22, -0.45, -0.36);
        stemLeaf3.castShadow = true;
        segGroup.add(stemLeaf3);
      }

      // =====================================================================
      // NODE 4: Upper Stem Segment (Larger Alternating Cauline Leaves)
      // =====================================================================
      if (i === 4) {
        // Lower large leaf along Segment 4 pointing forward-right
        const stemLeaf4a = new THREE.Mesh(createSculptedFoliageLeaf(0.38, 0.100, 10), this.leafMat);
        stemLeaf4a.position.set(0.012, this.segmentHeight * 0.35, 0.012);
        stemLeaf4a.rotation.set(0.24, 0.65, 0.32);
        stemLeaf4a.castShadow = true;
        segGroup.add(stemLeaf4a);

        // Upper leaf along Segment 4 pointing left-backward
        const stemLeaf4b = new THREE.Mesh(createSculptedFoliageLeaf(0.32, 0.086, 10), this.leafMat);
        stemLeaf4b.position.set(-0.010, this.segmentHeight * 0.78, -0.012);
        stemLeaf4b.rotation.set(0.18, -2.10, -0.28);
        stemLeaf4b.castShadow = true;
        segGroup.add(stemLeaf4b);
      }'''

assert old_upper_leaves in fg, 'old_upper_leaves not found in flower-geometries.js'
fg = fg.replace(old_upper_leaves, new_upper_leaves)

# Also enlarge pedicel neck leaves
old_ped_leaves = '''    // Delicate sub-floral leaflets along pedicel neck leading to top flower
    const pedLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.15, 0.038, 8), this.leafMat);
    pedLeaf1.position.set(0.008, pedicelH * 0.32, 0.005);
    pedLeaf1.rotation.set(0.20, 1.15, 0.22);
    this.neckGroup.add(pedLeaf1);

    const pedLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.12, 0.030, 8), this.leafMat);
    pedLeaf2.position.set(-0.006, pedicelH * 0.68, 0.004);
    pedLeaf2.rotation.set(0.18, -1.25, -0.20);
    this.neckGroup.add(pedLeaf2);'''

new_ped_leaves = '''    // Larger sub-floral leaves along elevated pedicel neck leading to top flower
    const pedLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.25, 0.068, 8), this.leafMat);
    pedLeaf1.position.set(0.010, pedicelH * 0.32, 0.006);
    pedLeaf1.rotation.set(0.20, 1.15, 0.24);
    pedLeaf1.castShadow = true;
    this.neckGroup.add(pedLeaf1);

    const pedLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.19, 0.052, 8), this.leafMat);
    pedLeaf2.position.set(-0.008, pedicelH * 0.68, 0.005);
    pedLeaf2.rotation.set(0.18, -1.25, -0.22);
    pedLeaf2.castShadow = true;
    this.neckGroup.add(pedLeaf2);'''

assert old_ped_leaves in fg, 'old_ped_leaves not found'
fg = fg.replace(old_ped_leaves, new_ped_leaves)

# Also add a leaf above Node 2 (Left branch) on Segment 2
old_node2_end = '''        segGroup.add(branchL);
        this.branchlets.push({
          group: branchL,
          mount: floretMountL,
          side: -1,
          baseZ: -0.75,
          baseX: 0.15
        });
      }'''

new_node2_end = '''        segGroup.add(branchL);
        this.branchlets.push({
          group: branchL,
          mount: floretMountL,
          side: -1,
          baseZ: -0.75,
          baseX: 0.15
        });

        // Larger cauline leaf along main stem ABOVE left branch
        const stemLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.42, 0.110, 10), this.leafMat);
        stemLeaf2.position.set(0.014, this.segmentHeight * 0.80, 0.008);
        stemLeaf2.rotation.set(0.20, 0.55, 0.34);
        stemLeaf2.castShadow = true;
        segGroup.add(stemLeaf2);
      }'''

assert old_node2_end in fg, 'old_node2_end not found'
fg = fg.replace(old_node2_end, new_node2_end)

with open('src/meadow-lab/flower-geometries.js', 'w') as f:
    f.write(fg)
print('Updated flower-geometries.js with larger main stem leaves!')


# =============================================================================
# 2. Update src/meadow-lab/poetic-flower.js with:
#    - Larger main stem leaves
#    - Real 3D morphologies for Periwinkle, Poppy, Meadow, Chamomile
# =============================================================================
with open('src/meadow-lab/poetic-flower.js', 'r') as f:
    pf = f.read()

# Make main stem leaves in poetic-flower.js significantly larger and broader
old_pf_leaves = '''      // Clean stem base: NO leaves at segments 0 and 1.
      // Attach graceful lanceolate leaves above branches along segments 2, 3, 4 till top flower!
      if (i >= 2 && i <= 4) {
        const isLeft = (i % 2 === 0);
        const leafGroup = new THREE.Group();
        leafGroup.position.y = (i === 4) ? segH * 0.55 : segH * 0.75;
        leafGroup.rotation.y = (i * 2.4) + (isLeft ? 0.35 : -0.35);

        const baseRotX = 0.32 + (i - 2) * 0.08;
        leafGroup.rotation.x = baseRotX;

        // Slender, graceful leaves tapering toward top flower
        const leafLen = 0.38 - (i - 2) * 0.06;
        const leafW = 0.060 - (i - 2) * 0.008;
        const leafGeo = getLanceolateLeafGeometry(leafLen, leafW, 10);
        const leafMesh = new THREE.Mesh(leafGeo, this.leafMaterial);
        leafMesh.castShadow = this.castShadow;
        leafGroup.add(leafMesh);

        segGroup.add(leafGroup);
        this.leafHolders.push({
          group: leafGroup,
          baseRotX: baseRotX,
          isLeft: isLeft
        });

        // Extra sub-floral leaflet on top segment 4 just below flower head
        if (i === 4) {
          const subLeafGroup = new THREE.Group();
          subLeafGroup.position.y = segH * 0.88;
          subLeafGroup.rotation.y = -1.2;
          subLeafGroup.rotation.x = 0.28;
          const subGeo = getLanceolateLeafGeometry(0.18, 0.035, 8);
          const subMesh = new THREE.Mesh(subGeo, this.leafMaterial);
          subLeafGroup.add(subMesh);
          segGroup.add(subLeafGroup);
          this.leafHolders.push({ group: subLeafGroup, baseRotX: 0.28, isLeft: !isLeft });
        }
      }'''

new_pf_leaves = '''      // Clean stem base: NO leaves at segments 0 and 1.
      // Attach noticeably larger sculpted leaves above branches along segments 2, 3, 4 till top flower!
      if (i >= 2 && i <= 4) {
        const isLeft = (i % 2 === 0);
        const leafGroup = new THREE.Group();
        leafGroup.position.y = (i === 4) ? segH * 0.55 : segH * 0.72;
        leafGroup.rotation.y = (i * 2.4) + (isLeft ? 0.40 : -0.40);

        const baseRotX = 0.32 + (i - 2) * 0.08;
        leafGroup.rotation.x = baseRotX;

        // Significantly larger, broader leaves along main stem
        const leafLen = 0.54 - (i - 2) * 0.08;
        const leafW = 0.115 - (i - 2) * 0.016;
        const leafGeo = getLanceolateLeafGeometry(leafLen, leafW, 12);
        const leafMesh = new THREE.Mesh(leafGeo, this.leafMaterial);
        leafMesh.castShadow = this.castShadow;
        leafGroup.add(leafMesh);

        segGroup.add(leafGroup);
        this.leafHolders.push({
          group: leafGroup,
          baseRotX: baseRotX,
          isLeft: isLeft
        });

        // Larger sub-floral leaf on top segment 4 just below flower head
        if (i === 4) {
          const subLeafGroup = new THREE.Group();
          subLeafGroup.position.y = segH * 0.88;
          subLeafGroup.rotation.y = -1.25;
          subLeafGroup.rotation.x = 0.28;
          const subGeo = getLanceolateLeafGeometry(0.26, 0.058, 8);
          const subMesh = new THREE.Mesh(subGeo, this.leafMaterial);
          subLeafGroup.add(subMesh);
          segGroup.add(subLeafGroup);
          this.leafHolders.push({ group: subLeafGroup, baseRotX: 0.28, isLeft: !isLeft });
        }
      }'''

assert old_pf_leaves in pf, 'old_pf_leaves not found'
pf = pf.replace(old_pf_leaves, new_pf_leaves)

# Add 3D species geometry generators to poetic-flower.js
species_generators = '''
// =============================================================================
// SPECIES-SPECIFIC 3D PETAL & CORE TOPOLOGIES
// =============================================================================

function createPoppyPetalGeometry(width = 0.38, length = 0.52, uSegs = 14, vSegs = 18) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const wProfile = Math.sin(Math.pow(vNorm, 0.75) * Math.PI * 0.7) * 1.35;
    const currentW = width * wProfile;

    const y = Math.sin(vNorm * Math.PI * 0.45) * length;
    const zCup = -Math.sin(vNorm * Math.PI * 0.5) * (length * 0.38);

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) - 0.5;
      const x = uNorm * currentW;
      const edgeWeight = Math.pow(Math.abs(uNorm * 2), 1.4);
      const ripple = Math.sin(uNorm * Math.PI * 6.0 + vNorm * 4.0) * (0.024 * vNorm) * edgeWeight;
      const zCurv = zCup + (uNorm * uNorm * currentW * 0.35) + ripple;

      vertices.push(x, y, zCurv);
      uvs.push(u / uSegs, vNorm);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = a + 1;
      const c = (v + 1) * (uSegs + 1) + u;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createPapaverCapsule(scale = 1.0) {
  const group = new THREE.Group();
  const urnGeo = new THREE.SphereGeometry(0.045 * scale, 12, 12);
  urnGeo.scale(0.85, 1.25, 0.85);
  const urnMat = new THREE.MeshStandardMaterial({ color: 0x3e4835, roughness: 0.65 });
  const urn = new THREE.Mesh(urnGeo, urnMat);
  urn.position.y = 0.042 * scale;
  group.add(urn);

  const discGeo = new THREE.CylinderGeometry(0.042 * scale, 0.038 * scale, 0.010 * scale, 10);
  const discMat = new THREE.MeshStandardMaterial({ color: 0x272421, roughness: 0.4 });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = 0.092 * scale;
  group.add(disc);
  return group;
}

function createPeriwinklePetalGeometry(width = 0.22, length = 0.46, uSegs = 12, vSegs = 16) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const currentW = width * Math.sin(vNorm * Math.PI * 0.85);
    const skew = Math.pow(vNorm, 1.4) * (width * 0.85);
    const y = Math.sin(vNorm * Math.PI * 0.50) * length;
    const zArch = -Math.sin(vNorm * Math.PI * 0.45) * (length * 0.16);

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) - 0.5;
      const x = (uNorm * currentW) + skew;
      const twist = Math.sin(uNorm * Math.PI) * (vNorm * 0.025);
      vertices.push(x, y, zArch + twist);
      uvs.push(u / uSegs, vNorm);
    }
  }

  for (let v = 0; v < vSegs; v++) {
    for (let u = 0; u < uSegs; u++) {
      const a = v * (uSegs + 1) + u;
      const b = a + 1;
      const c = (v + 1) * (uSegs + 1) + u;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

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
    vertices.push(w * 0.5, y, zArch);
    uvs.push(0, t);
    uvs.push(1, t);
  }

  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
'''

pf = species_generators + pf

# Update buildFlowerHead() to construct true 3D species morphologies:
old_build_head = '''  buildFlowerHead() {
    const s = this.petalScale;
    this.petalHolders = [];

    // Calyx / Sepal base
    const calyxGeo = new THREE.CylinderGeometry(0.024 * s, 0.012 * s, 0.04 * s, 6);
    const calyxMesh = new THREE.Mesh(calyxGeo, this.stemMaterial);
    calyxMesh.position.y = -0.02 * s;
    this.headGroup.add(calyxMesh);

    // Torus Core (Golden botanical eye)
    const torGeo = new THREE.SphereGeometry(0.032 * s, 8, 8);
    const torMesh = new THREE.Mesh(torGeo, this.stamenMaterial);
    this.headGroup.add(torMesh);

    // Stamens with golden pollen anthers (Hero & foreground flowers only for optimal laptop performance)
    if (this.isHero || this.castShadow) {
      const stamenCount = this.isHero ? 12 : 6;
      for (let i = 0; i < stamenCount; i++) {
        const a = (i / stamenCount) * Math.PI * 2;
        const r = 0.024 * s;
        const stamenH = 0.065 * s;

        const filamentGeo = new THREE.CylinderGeometry(0.002 * s, 0.002 * s, stamenH, 4);
        const filament = new THREE.Mesh(filamentGeo, this.stemMaterial);
        filament.position.set(Math.cos(a) * r, stamenH * 0.5, Math.sin(a) * r);
        filament.rotation.z = (Math.random() - 0.5) * 0.2;
        filament.rotation.x = (Math.random() - 0.5) * 0.2;

        const antherGeo = new THREE.SphereGeometry(0.007 * s, 5, 5);
        const anther = new THREE.Mesh(antherGeo, this.stamenMaterial);
        anther.position.y = stamenH * 0.5;
        filament.add(anther);

        this.headGroup.add(filament);
      }
    }

    // Outer Petals (Articulated for blooming & unfurling)
    const n = this.numPetals;
    const petalBaseGeo = getCuppedPetalGeometry(0.24 * s, 0.44 * s, 12, 16);

    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = angle;

      const mat = (i % 2 === 0) ? this.petalMaterial : this.petalAltMaterial;
      const mesh = new THREE.Mesh(petalBaseGeo, mat);
      mesh.castShadow = this.castShadow;
      mesh.receiveShadow = true;

      // Base bloom angle
      const offset = (Math.sin(i * 2.1) * 0.06);
      mesh.rotation.x = 0.65 + offset;
      mesh.rotation.z = 0.05 * ((i % 2 === 0) ? 1 : -1);

      holder.add(mesh);
      this.headGroup.add(holder);

      this.petalHolders.push({
        holder: holder,
        mesh: mesh,
        offset: offset,
        isInner: false
      });
    }

    // Inner Petal Layer (for fuller chalice bloom on focal flowers)
    if (n >= 5 && (this.isHero || this.castShadow)) {
      const innerPetalGeo = getCuppedPetalGeometry(0.18 * s, 0.36 * s, 10, 12);
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 + (Math.PI / n);
        const holder = new THREE.Group();
        holder.rotation.y = angle;

        const innerMesh = new THREE.Mesh(innerPetalGeo, this.petalMaterial);
        innerMesh.castShadow = this.castShadow;
        innerMesh.rotation.x = 0.45;
        innerMesh.scale.set(0.85, 0.85, 0.85);

        holder.add(innerMesh);
        this.headGroup.add(holder);

        this.petalHolders.push({
          holder: holder,
          mesh: innerMesh,
          offset: 0,
          isInner: true
        });
      }
    }
  }'''

new_build_head = '''  buildFlowerHead() {
    const s = this.petalScale;
    this.petalHolders = [];

    // =========================================================================
    // 1. WILD POPPY MORPHOLOGY (4 Ruffled Scarlet Petals + Papaver Seed Capsule)
    // =========================================================================
    if (this.paletteKey === 'poppyFlame') {
      const capsule = createPapaverCapsule(s * 0.85);
      this.headGroup.add(capsule);

      // Dark velvet stamen ring
      const stamenMat = new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.4 });
      const stamenGeo = new THREE.CylinderGeometry(0.002 * s, 0.002 * s, 0.065 * s, 4);
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const st = new THREE.Mesh(stamenGeo, stamenMat);
        st.position.set(Math.cos(ang) * 0.050 * s, 0.035 * s, Math.sin(ang) * 0.050 * s);
        st.rotation.z = 0.22 * Math.cos(ang);
        st.rotation.x = 0.22 * Math.sin(ang);
        this.headGroup.add(st);
      }

      // 4 Broad Ruffled Scarlet Petals in 2 decussate pairs
      const poppyGeo = createPoppyPetalGeometry(0.38 * s, 0.52 * s, 14, 18);
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const holder = new THREE.Group();
        holder.rotation.y = ang;

        const mesh = new THREE.Mesh(poppyGeo, this.petalMaterial);
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.rotation.x = 0.70;
        holder.add(mesh);
        this.headGroup.add(holder);

        this.petalHolders.push({ holder, mesh, offset: 0, isInner: (i % 2 === 1) });
      }
      return;
    }

    // =========================================================================
    // 2. PERIWINKLE MORPHOLOGY (5 Propeller Pinwheel Blades + Coronal Eye)
    // =========================================================================
    if (this.paletteKey === 'periwinkle') {
      const throatGeo = new THREE.CylinderGeometry(0.030 * s, 0.016 * s, 0.07 * s, 5);
      const throatMat = new THREE.MeshStandardMaterial({ color: 0x364075 });
      const throatMesh = new THREE.Mesh(throatGeo, throatMat);
      throatMesh.position.y = -0.03 * s;
      this.headGroup.add(throatMesh);

      const eyeGeo = new THREE.RingGeometry(0.010 * s, 0.034 * s, 5);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, side: THREE.DoubleSide });
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
      eyeMesh.position.y = 0.003 * s;
      eyeMesh.rotation.x = -Math.PI * 0.5;
      this.headGroup.add(eyeMesh);

      // 5 Salverform Propeller Blades
      const periGeo = createPeriwinklePetalGeometry(0.24 * s, 0.48 * s, 12, 16);
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const holder = new THREE.Group();
        holder.rotation.y = ang;

        const mesh = new THREE.Mesh(periGeo, this.petalMaterial);
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.rotation.x = 0.78;
        holder.add(mesh);
        this.headGroup.add(holder);

        this.petalHolders.push({ holder, mesh, offset: 0, isInner: false });
      }
      return;
    }

    // =========================================================================
    // 3. CHAMOMILE MORPHOLOGY (16 Radiating Ray Petals + Conical Golden Dome)
    // =========================================================================
    if (this.paletteKey === 'wheatCream') {
      const coneGeo = new THREE.ConeGeometry(0.088 * s, 0.078 * s, 16);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xdeb82c,
        emissive: 0xbf8513,
        emissiveIntensity: 0.35,
        roughness: 0.50
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.y = 0.038 * s;
      this.headGroup.add(coneMesh);

      // 16 Radiating White/Cream Ray Petals
      const rayGeo = createRayPetalGeometry(0.078 * s, 0.42 * s, 12);
      const count = 16;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const holder = new THREE.Group();
        holder.rotation.y = ang;

        const mesh = new THREE.Mesh(rayGeo, this.petalMaterial);
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.rotation.x = 0.95;
        holder.add(mesh);
        this.headGroup.add(holder);

        this.petalHolders.push({ holder, mesh, offset: 0, isInner: false });
      }
      return;
    }

    // =========================================================================
    // 4. MEADOW CHALICE MORPHOLOGY (5 Cupped Eucalyptus Jade Petals + Stamens)
    // =========================================================================
    const calyxGeo = new THREE.CylinderGeometry(0.024 * s, 0.012 * s, 0.04 * s, 6);
    const calyxMesh = new THREE.Mesh(calyxGeo, this.stemMaterial);
    calyxMesh.position.y = -0.02 * s;
    this.headGroup.add(calyxMesh);

    const torGeo = new THREE.SphereGeometry(0.032 * s, 8, 8);
    const torMesh = new THREE.Mesh(torGeo, this.stamenMaterial);
    this.headGroup.add(torMesh);

    if (this.isHero || this.castShadow) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.024 * s;
        const stamenH = 0.065 * s;
        const filament = new THREE.Mesh(new THREE.CylinderGeometry(0.002 * s, 0.002 * s, stamenH, 4), this.stemMaterial);
        filament.position.set(Math.cos(a) * r, stamenH * 0.5, Math.sin(a) * r);
        const anther = new THREE.Mesh(new THREE.SphereGeometry(0.007 * s, 5, 5), this.stamenMaterial);
        anther.position.y = stamenH * 0.5;
        filament.add(anther);
        this.headGroup.add(filament);
      }
    }

    const n = 5;
    const petalBaseGeo = getCuppedPetalGeometry(0.24 * s, 0.44 * s, 12, 16);
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.y = angle;

      const mesh = new THREE.Mesh(petalBaseGeo, this.petalMaterial);
      mesh.castShadow = this.castShadow;
      mesh.receiveShadow = true;
      mesh.rotation.x = 0.65;
      holder.add(mesh);
      this.headGroup.add(holder);

      this.petalHolders.push({ holder, mesh, offset: 0, isInner: false });
    }
  }'''

assert old_build_head in pf, 'old_build_head not found in poetic-flower.js'
pf = pf.replace(old_build_head, new_build_head)

with open('src/meadow-lab/poetic-flower.js', 'w') as f:
    f.write(pf)
print('Updated poetic-flower.js with larger leaves and real species morphologies!')


# =============================================================================
# 3. Update src/meadow-lab/lab-main.js for 100-flower balanced 4-species mix
# =============================================================================
with open('src/meadow-lab/lab-main.js', 'r') as f:
    lm = f.read()

# Make sure palettePool is clean and balanced across all 4 species
old_pool = '''    // 100-flower balanced 4-species pool: 25% Periwinkle, 25% Poppy, 25% Meadow Jade, 25% Chamomile Wheat
    const palettePool = [
      'periwinkle',     // Periwinkle (Blue)
      'poppyFlame',     // Wild Poppy (Flame Scarlet)
      'eucalyptusJade', // Meadow (Eucalyptus Jade Chalice)
      'wheatCream'      // Chamomile (Golden-Wheat Cream)
    ];'''

new_pool = '''    // 100-flower balanced 4-species pool: 25% Periwinkle, 25% Poppy, 25% Meadow Jade, 25% Chamomile Wheat
    const palettePool = [
      'periwinkle',     // Periwinkle (Pinwheel Blue)
      'poppyFlame',     // Wild Poppy (Ruffled Scarlet Flame)
      'eucalyptusJade', // Meadow (Celadon Jade Chalice)
      'wheatCream'      // Chamomile (White Rays + Golden Dome)
    ];'''

if old_pool in lm:
    lm = lm.replace(old_pool, new_pool)

with open('src/meadow-lab/lab-main.js', 'w') as f:
    f.write(lm)
print('Updated lab-main.js!')

