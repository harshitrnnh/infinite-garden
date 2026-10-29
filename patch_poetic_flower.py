import re

with open('src/meadow-lab/poetic-flower.js', 'r') as f:
    code = f.read()

# =============================================================================
# 1. Add Procedural Species Geometry Generators & Caches
# =============================================================================
species_generators = '''
/**
 * Procedural Ruffled Poppy Petal Geometry
 */
function createPoppyPetalGeometry(width = 0.38, length = 0.52, uSegs = 14, vSegs = 18) {
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

/**
 * Procedural Periwinkle Pinwheel Propeller Petal
 */
function createPeriwinklePetalGeometry(width = 0.22, length = 0.46, uSegs = 12, vSegs = 16) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    const currentW = width * Math.sin(vNorm * Math.PI * 0.85);
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

/**
 * Procedural Chamomile Radiating Ray Petal
 */
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

const POPPY_PETAL_CACHE = new Map();
function getPoppyPetalGeometry(width, length) {
  const key = `${width.toFixed(3)}_${length.toFixed(3)}`;
  if (!POPPY_PETAL_CACHE.has(key)) {
    POPPY_PETAL_CACHE.set(key, createPoppyPetalGeometry(width, length, 14, 18));
  }
  return POPPY_PETAL_CACHE.get(key);
}

const PERIWINKLE_PETAL_CACHE = new Map();
function getPeriwinklePetalGeometry(width, length) {
  const key = `${width.toFixed(3)}_${length.toFixed(3)}`;
  if (!PERIWINKLE_PETAL_CACHE.has(key)) {
    PERIWINKLE_PETAL_CACHE.set(key, createPeriwinklePetalGeometry(width, length, 12, 16));
  }
  return PERIWINKLE_PETAL_CACHE.get(key);
}

const RAY_PETAL_CACHE = new Map();
function getRayPetalGeometry(width, length) {
  const key = `${width.toFixed(3)}_${length.toFixed(3)}`;
  if (!RAY_PETAL_CACHE.has(key)) {
    RAY_PETAL_CACHE.set(key, createRayPetalGeometry(width, length, 12));
  }
  return RAY_PETAL_CACHE.get(key);
}
'''

# Insert species generators before PETAL_GEO_CACHE
target_anchor = '// ============================================================================\n// PERFORMANCE CACHES FOR 100+ FLOWERS'
assert target_anchor in code, 'target_anchor not found'
code = code.replace(target_anchor, species_generators + '\n' + target_anchor)

# =============================================================================
# 2. Update buildArticulatedStem: LARGER LEAVES ALONG MAIN STEM
# =============================================================================
old_stem_leaves = '''      // Clean stem base: NO leaves at segments 0 and 1.
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

new_stem_leaves = '''      // Clean stem base: NO leaves at segments 0 and 1.
      // Attach NOTICEABLY LARGER sculpted leaves above branches along segments 2, 3, 4 till top flower!
      if (i >= 2 && i <= 4) {
        const isLeft = (i % 2 === 0);
        const leafGroup = new THREE.Group();
        leafGroup.position.y = (i === 4) ? segH * 0.55 : segH * 0.75;
        leafGroup.rotation.y = (i * 2.4) + (isLeft ? 0.35 : -0.35);

        const baseRotX = 0.32 + (i - 2) * 0.08;
        leafGroup.rotation.x = baseRotX;

        // Noticeably larger, fuller cauline leaves along main stem
        const leafLen = 0.55 - (i - 2) * 0.08; // i=2: 0.55m, i=3: 0.47m, i=4: 0.39m
        const leafW = 0.135 - (i - 2) * 0.018; // i=2: 0.135m, i=3: 0.117m, i=4: 0.099m
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

        // Additional alternating leaf on Segment 3 for lush foliage balance
        if (i === 3) {
          const secondLeafGroup = new THREE.Group();
          secondLeafGroup.position.y = segH * 0.45;
          secondLeafGroup.rotation.y = (i * 2.4) + Math.PI + 0.35;
          secondLeafGroup.rotation.x = 0.34;
          const secondGeo = getLanceolateLeafGeometry(0.46, 0.115, 8);
          const secondMesh = new THREE.Mesh(secondGeo, this.leafMaterial);
          secondMesh.castShadow = this.castShadow;
          secondLeafGroup.add(secondMesh);
          segGroup.add(secondLeafGroup);
          this.leafHolders.push({ group: secondLeafGroup, baseRotX: 0.34, isLeft: !isLeft });
        }

        // Sub-floral leaf on top segment 4 just below flower head
        if (i === 4) {
          const subLeafGroup = new THREE.Group();
          subLeafGroup.position.y = segH * 0.88;
          subLeafGroup.rotation.y = -1.2;
          subLeafGroup.rotation.x = 0.28;
          const subGeo = getLanceolateLeafGeometry(0.28, 0.070, 8);
          const subMesh = new THREE.Mesh(subGeo, this.leafMaterial);
          subLeafGroup.add(subMesh);
          segGroup.add(subLeafGroup);
          this.leafHolders.push({ group: subLeafGroup, baseRotX: 0.28, isLeft: !isLeft });
        }
      }'''

assert old_stem_leaves in code, 'old_stem_leaves not found'
code = code.replace(old_stem_leaves, new_stem_leaves)

# =============================================================================
# 3. Update buildFlowerHead() with 4 DISTINCT SPECIES MORPHOLOGIES
# =============================================================================
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
      const innerCount = 3;
      const innerPetalGeo = getCuppedPetalGeometry(0.18 * s, 0.36 * s, 10, 14);
      for (let j = 0; j < innerCount; j++) {
        const a = (j / innerCount) * Math.PI * 2 + (Math.PI / n);
        const holder = new THREE.Group();
        holder.rotation.y = a;

        const innerMesh = new THREE.Mesh(innerPetalGeo, this.petalMaterial);
        innerMesh.rotation.x = 0.45;
        innerMesh.castShadow = this.castShadow;
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
    // SPECIES 1: PERIWINKLE (Vinca Minor)
    // 5 Salverform Propeller Blades • Pentagonal Throat • Star Coronal Eye
    // =========================================================================
    if (this.paletteKey === 'periwinkle') {
      // Pentagonal tubular throat
      const throatGeo = new THREE.CylinderGeometry(0.034 * s, 0.018 * s, 0.08 * s, 5);
      const throatMat = new THREE.MeshStandardMaterial({ color: 0x3a457a });
      const throatMesh = new THREE.Mesh(throatGeo, throatMat);
      throatMesh.position.y = -0.04 * s;
      this.headGroup.add(throatMesh);

      // Star-shaped white coronal eye ring
      const eyeGeo = new THREE.RingGeometry(0.012 * s, 0.038 * s, 5);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, side: THREE.DoubleSide });
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
      eyeMesh.position.y = 0.002 * s;
      eyeMesh.rotation.x = -Math.PI * 0.5;
      this.headGroup.add(eyeMesh);

      // Central golden pollen eye
      const dotGeo = new THREE.SphereGeometry(0.014 * s, 6, 6);
      const dotMesh = new THREE.Mesh(dotGeo, this.stamenMaterial);
      dotMesh.position.y = 0.006 * s;
      this.headGroup.add(dotMesh);

      // 5 Pinwheel Propeller Blades
      const count = 5;
      const bladeGeo = getPeriwinklePetalGeometry(0.24 * s, 0.48 * s);
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const holder = new THREE.Group();
        holder.rotation.y = ang;

        const mat = (i % 2 === 0) ? this.petalMaterial : this.petalAltMaterial;
        const mesh = new THREE.Mesh(bladeGeo, mat);
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.rotation.x = 0.70;
        holder.add(mesh);
        this.headGroup.add(holder);

        this.petalHolders.push({
          holder: holder,
          mesh: mesh,
          offset: (Math.sin(i * 1.5) * 0.03),
          minAngle: 0.25,
          maxAngle: 1.18,
          isInner: false
        });
      }
      return;
    }

    // =========================================================================
    // SPECIES 2: WILD POPPY (Papaver Rhoeas)
    // 4 Broad Ruffled Crinkled Petals • Velvet Stigmatic Seed Capsule Collar
    // =========================================================================
    if (this.paletteKey === 'poppyFlame') {
      // Papaver Seed Capsule with Crown Rays
      const capsule = createPapaverCapsule(1.05 * s);
      this.headGroup.add(capsule);

      // Ring of velvety dark stamens with pollen anthers
      const stamenMat = new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.4 });
      const stamenGeo = new THREE.CylinderGeometry(0.002 * s, 0.002 * s, 0.075 * s, 4);
      const stamenCount = (this.isHero || this.castShadow) ? 22 : 12;
      for (let i = 0; i < stamenCount; i++) {
        const ang = (i / stamenCount) * Math.PI * 2;
        const st = new THREE.Mesh(stamenGeo, stamenMat);
        st.position.set(Math.cos(ang) * 0.065 * s, 0.038 * s, Math.sin(ang) * 0.065 * s);
        st.rotation.z = 0.25 * Math.cos(ang);
        st.rotation.x = 0.25 * Math.sin(ang);
        this.headGroup.add(st);
      }

      // 4 Large Ruffled Scarlet Petals (2 Outer, 2 Inner Orthogonal)
      const poppyGeo = getPoppyPetalGeometry(0.38 * s, 0.52 * s);
      const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
      for (let i = 0; i < 4; i++) {
        const holder = new THREE.Group();
        holder.rotation.y = angles[i];

        const isInner = (i % 2 === 1);
        const mesh = new THREE.Mesh(poppyGeo, this.petalMaterial);
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.rotation.x = isInner ? 0.60 : 0.72;
        mesh.scale.set(isInner ? 0.94 : 1.0, isInner ? 0.94 : 1.0, isInner ? 0.94 : 1.0);

        holder.add(mesh);
        this.headGroup.add(holder);

        this.petalHolders.push({
          holder: holder,
          mesh: mesh,
          offset: (i % 2 === 1 ? -0.05 : 0.05),
          minAngle: isInner ? 0.18 : 0.25,
          maxAngle: isInner ? 0.95 : 1.08,
          isInner: isInner
        });
      }
      return;
    }

    // =========================================================================
    // SPECIES 3: CHAMOMILE WHEAT (Matricaria)
    // 16 Radiating White Ray Petals • Conical Raised Golden Disk Florets
    // =========================================================================
    if (this.paletteKey === 'wheatCream') {
      // Conical Raised Golden Disk Dome Center
      const diskGeo = new THREE.ConeGeometry(0.092 * s, 0.082 * s, 16);
      const diskMat = new THREE.MeshStandardMaterial({
        color: 0xdeb82c,
        emissive: 0xbf8513,
        emissiveIntensity: 0.35,
        roughness: 0.50
      });
      const diskMesh = new THREE.Mesh(diskGeo, diskMat);
      diskMesh.position.y = 0.041 * s;
      this.headGroup.add(diskMesh);

      // Calyx underside
      const calyxGeo = new THREE.CylinderGeometry(0.038 * s, 0.015 * s, 0.03 * s, 8);
      const calyxMesh = new THREE.Mesh(calyxGeo, this.stemMaterial);
      calyxMesh.position.y = -0.015 * s;
      this.headGroup.add(calyxMesh);

      // 16 Radiating Ray Petals
      const rayGeo = getRayPetalGeometry(0.082 * s, 0.44 * s);
      const count = 16;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const holder = new THREE.Group();
        holder.rotation.y = ang;

        const mesh = new THREE.Mesh(rayGeo, this.petalMaterial);
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.rotation.x = 0.92;
        holder.add(mesh);
        this.headGroup.add(holder);

        this.petalHolders.push({
          holder: holder,
          mesh: mesh,
          offset: (Math.sin(i * 2.3) * 0.05),
          minAngle: 0.38,
          maxAngle: 1.35,
          isInner: false
        });
      }
      return;
    }

    // =========================================================================
    // SPECIES 4: MEADOW CHALICE (Eucalyptus Jade / Wild Lavender)
    // 5 Cupped Jade Petals • Golden Anther Crown • Layered Inner Chalice
    // =========================================================================
    // Calyx / Sepal base
    const calyxGeo = new THREE.CylinderGeometry(0.024 * s, 0.012 * s, 0.04 * s, 6);
    const calyxMesh = new THREE.Mesh(calyxGeo, this.stemMaterial);
    calyxMesh.position.y = -0.02 * s;
    this.headGroup.add(calyxMesh);

    // Torus Core (Golden botanical eye)
    const torGeo = new THREE.SphereGeometry(0.032 * s, 8, 8);
    const torMesh = new THREE.Mesh(torGeo, this.stamenMaterial);
    this.headGroup.add(torMesh);

    // Stamens with golden pollen anthers
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

    // Outer Petals
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

      const offset = (Math.sin(i * 2.1) * 0.06);
      mesh.rotation.x = 0.65 + offset;
      mesh.rotation.z = 0.05 * ((i % 2 === 0) ? 1 : -1);

      holder.add(mesh);
      this.headGroup.add(holder);

      this.petalHolders.push({
        holder: holder,
        mesh: mesh,
        offset: offset,
        minAngle: 0.24,
        maxAngle: 0.92,
        isInner: false
      });
    }

    // Inner Petal Layer
    if (n >= 5 && (this.isHero || this.castShadow)) {
      const innerCount = 3;
      const innerPetalGeo = getCuppedPetalGeometry(0.18 * s, 0.36 * s, 10, 14);
      for (let j = 0; j < innerCount; j++) {
        const a = (j / innerCount) * Math.PI * 2 + (Math.PI / n);
        const holder = new THREE.Group();
        holder.rotation.y = a;

        const innerMesh = new THREE.Mesh(innerPetalGeo, this.petalMaterial);
        innerMesh.rotation.x = 0.45;
        innerMesh.castShadow = this.castShadow;
        holder.add(innerMesh);
        this.headGroup.add(holder);

        this.petalHolders.push({
          holder: holder,
          mesh: innerMesh,
          offset: 0,
          minAngle: 0.18,
          maxAngle: 0.65,
          isInner: true
        });
      }
    }
  }'''

assert old_build_head in code, 'old_build_head not found in poetic-flower.js'
code = code.replace(old_build_head, new_build_head)

# =============================================================================
# 4. Update applyKinematics to use ph.minAngle & ph.maxAngle
# =============================================================================
old_bloom_loop = '''    // 3. Dynamic Petal Bloom (Unfurls from tight bud to radiant open chalice)
    for (let p = 0; p < this.petalHolders.length; p++) {
      const ph = this.petalHolders[p];
      if (ph.isInner) {
        // Inner petals: 0.15 (closed bud) to 0.65 (open)
        ph.mesh.rotation.x = THREE.MathUtils.lerp(0.18, 0.65, this.currentBloom);
      } else {
        // Outer chalice: 0.25 (closed bud cup) to 0.92 (expansive radiant open)
        const targetAngle = THREE.MathUtils.lerp(0.24, 0.92, this.currentBloom) + ph.offset;
        ph.mesh.rotation.x = targetAngle;
      }

      // Petals expand slightly when fully unfurled
      const petalScale = THREE.MathUtils.lerp(0.85, 1.15, this.currentBloom);
      ph.mesh.scale.set(petalScale, petalScale, petalScale);
    }'''

new_bloom_loop = '''    // 3. Dynamic Petal Bloom (Species-specific unfurling with custom angle ranges)
    for (let p = 0; p < this.petalHolders.length; p++) {
      const ph = this.petalHolders[p];
      const minA = (ph.minAngle !== undefined) ? ph.minAngle : (ph.isInner ? 0.18 : 0.24);
      const maxA = (ph.maxAngle !== undefined) ? ph.maxAngle : (ph.isInner ? 0.65 : 0.92);
      const targetAngle = THREE.MathUtils.lerp(minA, maxA, this.currentBloom) + (ph.offset || 0);
      ph.mesh.rotation.x = targetAngle;

      // Petals expand slightly when fully unfurled
      const petalScale = THREE.MathUtils.lerp(0.88, 1.12, this.currentBloom);
      ph.mesh.scale.set(petalScale, petalScale, petalScale);
    }'''

assert old_bloom_loop in code, 'old_bloom_loop not found in poetic-flower.js'
code = code.replace(old_bloom_loop, new_bloom_loop)

with open('src/meadow-lab/poetic-flower.js', 'w') as f:
    f.write(code)

print("poetic-flower.js updated successfully with larger leaves and 4 distinct species morphologies!")
