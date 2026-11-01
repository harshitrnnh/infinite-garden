import * as THREE from 'three';

// Curated Color Palettes derived directly from the reference image
// Semi-bright, luminous botanical tones with periwinkle blues, poppy flame, wheat, lavender & jade
export const MEADOW_PALETTES = {
  periwinkle: {
    key: 'periwinkle',
    name: 'Periwinkle Dream',
    desc: 'Soft indigo & ultramarine petals with delicate violet blush and lilac stem',
    stemColor: 0x6e788c,
    stemHighlight: 0x8a96ad,
    leafColor: 0x5e6d7a,
    leafHighlight: 0x8597a8,
    petalPrimary: 0x5c69ad,     // Vibrant periwinkle blue
    petalSecondary: 0x414b87,   // Deep indigo undertone
    petalAccent: 0x8794d6,      // Pale sky-blue petal rim
    petalInside: 0x6a77bc,
    pistilColor: 0xe8c15a,      // Warm pollen gold
    antherColor: 0xffe27a,
    tag: 'Primary Blue Wildflower'
  },
  poppyFlame: {
    key: 'poppyFlame',
    name: 'Poppy Flame',
    desc: 'Vibrant vermilion scarlet with glowing amber center and warm earth stem',
    stemColor: 0x635745,
    stemHighlight: 0x8a7b63,
    leafColor: 0x54634f,
    leafHighlight: 0x7a8e74,
    petalPrimary: 0xeb4328,     // Rich poppy scarlet
    petalSecondary: 0xc42e18,   // Deep crimson base
    petalAccent: 0xff6b4a,      // Luminous vermilion margin
    petalInside: 0xdc381f,
    pistilColor: 0x2b1e19,      // Charcoal velvet eye
    antherColor: 0xf5b041,
    tag: 'Vibrant Focal Poppy'
  },
  wildLavender: {
    key: 'wildLavender',
    name: 'Wild Heather & Thistle',
    desc: 'Gentle mauve and misty thistle petals with sage-silver foliage',
    stemColor: 0x676961,
    stemHighlight: 0x898c82,
    leafColor: 0x596357,
    leafHighlight: 0x7c8a79,
    petalPrimary: 0x8d7cb5,     // Soft lavender mauve
    petalSecondary: 0x6f5e94,   // Dusty purple shadow
    petalAccent: 0xb5a7d6,      // Silvery thistle edge
    petalInside: 0x9a89c4,
    pistilColor: 0xd4c275,
    antherColor: 0xffebb0,
    tag: 'Muted Heather Bloom'
  },
  wheatCream: {
    key: 'wheatCream',
    name: 'Chamomile Wheat',
    desc: 'Warm ivory and sun-bleached parchment with warm apricot core',
    stemColor: 0x736c58,
    stemHighlight: 0x9c937a,
    leafColor: 0x626651,
    leafHighlight: 0x8b9173,
    petalPrimary: 0xf3eed9,     // Warm cream
    petalSecondary: 0xded4b6,   // Soft parchment shade
    petalAccent: 0xfffaea,      // Sunlit tip
    petalInside: 0xe8ddbe,
    pistilColor: 0xdba139,      // Rich saffron core
    antherColor: 0xfcc860,
    tag: 'Sunlit Cream Flora'
  },
  eucalyptusJade: {
    key: 'eucalyptusJade',
    name: 'Celadon Jade',
    desc: 'Translucent moon-white with cool jade throat and eucalyptus foliage',
    stemColor: 0x56695b,
    stemHighlight: 0x7c9482,
    leafColor: 0x4f6b57,
    leafHighlight: 0x72997d,
    petalPrimary: 0xebf2ec,     // Translucent pale jade-white
    petalSecondary: 0xbed4c4,   // Tender mint shadow
    petalAccent: 0xf7fcf8,      // Pearlescent margin
    petalInside: 0xcbe3d2,
    pistilColor: 0x7aa687,
    antherColor: 0xf5df98,
    tag: 'Ethereal Celadon Bloom'
  }
};

/**
 * Creates an organic vertebrae segment geometry with botanical color bands
 */
function createSegmentGeometry(height, rBottom, rTop, t0, t1, radialSegs = 8) {
  const vertSegs = 5;
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const colors = [];

  for (let y = 0; y <= vertSegs; y++) {
    const vNorm = y / vertSegs;
    const currentY = vNorm * height;
    const globalT = THREE.MathUtils.lerp(t0, t1, vNorm);
    const r = THREE.MathUtils.lerp(rBottom, rTop, vNorm);

    // Subtle gentle s-curve inflection built into natural posture
    const sBendX = Math.sin(globalT * Math.PI * 1.25) * 0.035;
    const sBendZ = Math.cos(globalT * Math.PI * 1.1) * 0.02;

    for (let j = 0; j <= radialSegs; j++) {
      const theta = (j / radialSegs) * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);

      const vx = sBendX + r * cos;
      const vy = currentY;
      const vz = sBendZ + r * sin;
      vertices.push(vx, vy, vz);

      normals.push(cos, 0.1, sin);
      uvs.push(j / radialSegs, globalT);

      // Subtle organic botanical bands along stem (lilac, soft terracotta, and sage rings as in reference art)
      const ringNoise = Math.sin(globalT * 26.0) * 0.5 + 0.5;
      const cBase = new THREE.Color(0.36, 0.42, 0.35); // soft sage
      const cLilac = new THREE.Color(0.48, 0.46, 0.58); // dusty lilac
      const cWarm = new THREE.Color(0.58, 0.48, 0.38);  // warm straw / terracotta
      
      const cMix = cBase.clone().lerp(cLilac, ringNoise * 0.45).lerp(cWarm, Math.sin(globalT * 14.0 + 1.2) * 0.25);
      colors.push(cMix.r, cMix.g, cMix.b);
    }
  }

  for (let y = 0; y < vertSegs; y++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = y * (radialSegs + 1) + j;
      const b = (y + 1) * (radialSegs + 1) + j;
      const c = (y + 1) * (radialSegs + 1) + (j + 1);
      const d = y * (radialSegs + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a delicate, folded, cupped petal geometry (wild poppy / anemone style)
 */
function createCuppedPetalGeometry(width = 0.28, length = 0.48, uSegs = 12, vSegs = 16) {
  const vertices = [];
  const uvs = [];
  const indices = [];
  const colors = [];

  for (let v = 0; v <= vSegs; v++) {
    const vNorm = v / vSegs;
    
    // Width envelope: narrow base claw, swells wide around 0.65, soft scalloped tip
    let wProfile;
    if (vNorm < 0.2) {
      wProfile = Math.sin(vNorm / 0.2 * Math.PI * 0.5) * 0.55;
    } else {
      wProfile = 0.55 + Math.sin((vNorm - 0.2) / 0.8 * Math.PI) * 0.55;
    }
    const currentW = width * wProfile;

    // Cup curve profile (bending outwards then gently curling in/up at tip)
    const y = Math.sin(vNorm * Math.PI * 0.46) * length;
    const zBase = Math.pow(vNorm, 1.35) * (length * 0.48);

    for (let u = 0; u <= uSegs; u++) {
      const uNorm = (u / uSegs) * 2 - 1; // -1 to +1 across petal width
      const x = uNorm * currentW * 0.5;

      // Cross-sectional bowl/dish curvature (center dips back, edges cup forward)
      const dishCurve = Math.pow(Math.abs(uNorm), 1.6) * (0.045 * wProfile);
      // Delicate flutter along petal outer margin
      const flutter = (vNorm > 0.6) ? Math.sin(uNorm * Math.PI * 3.5 + vNorm * 4) * 0.012 : 0;
      const z = zBase + dishCurve + flutter;

      vertices.push(x, y, z);
      uvs.push(u / uSegs, vNorm);

      // Subtle gradient across petal
      const baseTint = new THREE.Color(0.88, 0.90, 0.96);
      const rimTint = new THREE.Color(1.0, 1.0, 1.0);
      const c = baseTint.clone().lerp(rimTint, Math.pow(vNorm, 1.2));
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

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a slender, long, folded lanceolate leaf
 */
function createLanceolateLeafGeometry(length = 0.65, width = 0.085, segs = 14) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const y = Math.sin(t * Math.PI * 0.48) * length;
    const zArch = Math.sin(t * Math.PI) * (length * 0.22);
    const w = Math.sin(t * Math.PI * 0.85) * width;

    // 3 vertices across leaf for central midrib crease
    vertices.push(-w * 0.5, y, zArch + 0.015);
    uvs.push(0, t);

    vertices.push(0, y, zArch);
    uvs.push(0.5, t);

    vertices.push(w * 0.5, y, zArch + 0.015);
    uvs.push(1, t);
  }

  for (let i = 0; i < segs; i++) {
    const row1 = i * 3;
    const row2 = (i + 1) * 3;
    indices.push(row1 + 0, row2 + 0, row1 + 1);
    indices.push(row2 + 0, row2 + 1, row1 + 1);
    indices.push(row1 + 1, row2 + 1, row1 + 2);
    indices.push(row2 + 1, row2 + 2, row1 + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}


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

// ============================================================================
// PERFORMANCE CACHES FOR 100+ FLOWERS (ZERO DUPLICATE MEMORY & ULTRA FAST FPS)
// ============================================================================
const PETAL_GEO_CACHE = new Map();
function getCuppedPetalGeometry(width, length, uSegs = 12, vSegs = 16) {
  const key = `${width.toFixed(3)}_${length.toFixed(3)}_${uSegs}_${vSegs}`;
  if (!PETAL_GEO_CACHE.has(key)) {
    PETAL_GEO_CACHE.set(key, createCuppedPetalGeometry(width, length, uSegs, vSegs));
  }
  return PETAL_GEO_CACHE.get(key);
}

const LEAF_GEO_CACHE = new Map();
function getLanceolateLeafGeometry(length, width, segs = 12) {
  const key = `${length.toFixed(3)}_${width.toFixed(3)}_${segs}`;
  if (!LEAF_GEO_CACHE.has(key)) {
    LEAF_GEO_CACHE.set(key, createLanceolateLeafGeometry(length, width, segs));
  }
  return LEAF_GEO_CACHE.get(key);
}

const SEG_GEO_CACHE = new Map();
function getSegmentGeometry(height, r0, r1, t0, t1, radialSegs = 8) {
  const key = `${height.toFixed(3)}_${r0.toFixed(3)}_${r1.toFixed(3)}_${t0.toFixed(2)}_${t1.toFixed(2)}_${radialSegs}`;
  if (!SEG_GEO_CACHE.has(key)) {
    const geom = createSegmentGeometry(height, r0, r1, t0, t1, radialSegs);
    geom.translate(0, height * 0.5, 0);
    SEG_GEO_CACHE.set(key, geom);
  }
  return SEG_GEO_CACHE.get(key);
}

const MATERIAL_CACHE = new Map();
function getPaletteMaterials(paletteKey, isDedicated = false) {
  const pal = MEADOW_PALETTES[paletteKey] || MEADOW_PALETTES.periwinkle;
  if (isDedicated) {
    return createPaletteMaterials(pal);
  }
  if (!MATERIAL_CACHE.has(paletteKey)) {
    MATERIAL_CACHE.set(paletteKey, createPaletteMaterials(pal));
  }
  return MATERIAL_CACHE.get(paletteKey);
}

function createPaletteMaterials(pal) {
  return {
    stem: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.65,
      metalness: 0.05,
      flatShading: false
    }),
    petalPrimary: new THREE.MeshPhysicalMaterial({
      color: pal.petalPrimary,
      roughness: 0.42,
      metalness: 0.04,
      sheen: 0.45,
      sheenColor: new THREE.Color(0xffffff),
      sheenRoughness: 0.4,
      side: THREE.DoubleSide
    }),
    petalSecondary: new THREE.MeshPhysicalMaterial({
      color: pal.petalSecondary,
      roughness: 0.38,
      metalness: 0.06,
      sheen: 0.40,
      sheenColor: new THREE.Color(0xf0e6ff),
      sheenRoughness: 0.4,
      side: THREE.DoubleSide
    }),
    leaf: new THREE.MeshStandardMaterial({
      color: pal.leafColor,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide
    }),
    stamen: new THREE.MeshStandardMaterial({
      color: pal.antherColor,
      emissive: pal.pistilColor,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.15
    })
  };
}

/**
 * Poetic Wildflower with Full Body Kinematics & Independent Motion Profile
 * Supports human posture mapping & 100-flower capacity testing:
 * - 5 vertebrae articulation for spine lean (sway left/right & bow/arch)
 * - Stem elongation (hands reaching overhead)
 * - Chalice petal bloom/unfurl (bloom ratio)
 * - Lanceolate leaf elevation and wingspan fanning
 * - Independent organic sway, breathing bloom, and stretch cycles
 */
export class PoeticFlower {
  constructor(paletteKey = 'periwinkle', options = {}) {
    this.paletteKey = paletteKey;
    this.palette = MEADOW_PALETTES[paletteKey] || MEADOW_PALETTES.periwinkle;
    this.height = options.height || (1.6 + Math.random() * 0.5);
    this.numPetals = options.numPetals || 5;
    this.petalScale = options.petalScale || 1.0;
    this.phaseOffset = options.phaseOffset || Math.random() * Math.PI * 2;
    this.swaySpeed = options.swaySpeed || (0.9 + Math.random() * 0.4);
    this.isHero = !!options.isHero;
    this.castShadow = options.castShadow !== undefined ? options.castShadow : (this.isHero || Math.random() < 0.2);

    this.group = new THREE.Group();

    // Kinematic Tracking State (smooth lerping)
    this.currentSwayX = 0;
    this.currentSwayZ = 0;
    this.currentHeight = 1.0;
    this.currentBloom = 0.55;
    this.currentWingspan = 0.5;
    this.currentArmL = 0.5;
    this.currentArmR = 0.5;

    // Independent Random Movement Profile for 100-flower stress test
    this.randomProfile = {
      speedX: 0.75 + Math.random() * 1.5,
      speedZ: 0.65 + Math.random() * 1.3,
      speedBloom: 0.50 + Math.random() * 1.1,
      speedStretch: 0.40 + Math.random() * 0.9,
      phaseX: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      phaseBloom: Math.random() * Math.PI * 2,
      phaseStretch: Math.random() * Math.PI * 2,
      ampSwayX: 0.07 + Math.random() * 0.16,
      ampSwayZ: 0.05 + Math.random() * 0.13,
      minBloom: 0.20 + Math.random() * 0.20,
      maxBloom: 0.75 + Math.random() * 0.25,
      minStretch: 0.92 + Math.random() * 0.06,
      maxStretch: 1.16 + Math.random() * 0.16,
      armSpeedL: 0.65 + Math.random() * 0.9,
      armSpeedR: 0.65 + Math.random() * 0.9,
      phaseArmL: Math.random() * Math.PI * 2,
      phaseArmR: Math.random() * Math.PI * 2,
      wingspanSpeed: 0.55 + Math.random() * 0.8,
      phaseWingspan: Math.random() * Math.PI * 2,
      noiseDrift: (Math.random() - 0.5) * 0.04
    };

    // Structural elements
    this.segments = [];       // Array of { group, mesh, baseSegH }
    this.petalHolders = [];   // Array of { holder, mesh, offset }
    this.leafHolders = [];    // Array of { group, baseRotX, isLeft }
    this.sideBud = null;

    this.initMaterials();
    this.buildArticulatedStem();
  }

  initMaterials() {
    const mats = getPaletteMaterials(this.paletteKey, this.isHero);
    this.stemMaterial = mats.stem;
    this.petalMaterial = mats.petalPrimary;
    this.petalAltMaterial = mats.petalSecondary;
    this.leafMaterial = mats.leaf;
    this.stamenMaterial = mats.stamen;
  }

  buildArticulatedStem() {
    this.segments = [];
    this.leafHolders = [];
    let parent = this.group;

    const numSegs = 5;
    const segH = this.height / numSegs;

    for (let i = 0; i < numSegs; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.y = (i === 0) ? 0 : segH;

      const t0 = i / numSegs;
      const t1 = (i + 1) / numSegs;
      const r0 = THREE.MathUtils.lerp(0.024, 0.011, t0);
      const r1 = THREE.MathUtils.lerp(0.024, 0.011, t1);

      const geom = getSegmentGeometry(segH, r0, r1, t0, t1, 8);
      const mesh = new THREE.Mesh(geom, this.stemMaterial);
      mesh.castShadow = this.castShadow;
      mesh.receiveShadow = true;
      segGroup.add(mesh);

      // Clean stem base: NO leaves at segments 0 and 1.
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
      }

      // Add secondary side branch with nodding bud on segment 3 (foreground only)
      if (i === 2 && this.castShadow && Math.random() > 0.45) {
        this.buildSideBud(segGroup, segH);
      }

      parent.add(segGroup);
      this.segments.push({
        group: segGroup,
        mesh: mesh,
        baseSegH: segH
      });
      parent = segGroup;
    }

    // Mount Flower Head at top of highest segment
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = segH;
    parent.add(this.headGroup);

    this.buildFlowerHead();
  }

  buildFlowerHead() {
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
  }

  buildSideBud(parentGroup, segH) {
    const budGroup = new THREE.Group();
    budGroup.position.set(0.04, segH * 0.5, 0.02);

    const pedGeo = new THREE.CylinderGeometry(0.006, 0.010, 0.22, 5);
    pedGeo.translate(0, 0.11, 0);
    const pedMesh = new THREE.Mesh(pedGeo, this.stemMaterial);
    budGroup.add(pedMesh);

    budGroup.rotation.z = 0.45;
    budGroup.rotation.x = 0.25;

    // Subtle small branch leaflets
    const bLeafGeo1 = getLanceolateLeafGeometry(0.12, 0.032, 6);
    const bLeafMesh1 = new THREE.Mesh(bLeafGeo1, this.leafMaterial);
    bLeafMesh1.position.set(0, 0.07, 0);
    bLeafMesh1.rotation.z = -0.32;
    budGroup.add(bLeafMesh1);

    const bLeafGeo2 = getLanceolateLeafGeometry(0.09, 0.025, 6);
    const bLeafMesh2 = new THREE.Mesh(bLeafGeo2, this.leafMaterial);
    bLeafMesh2.position.set(0, 0.15, 0);
    bLeafMesh2.rotation.z = 0.28;
    budGroup.add(bLeafMesh2);

    // Nodding unopened bud egg
    const budHead = new THREE.Group();
    budHead.position.set(0, 0.22, 0);
    budHead.rotation.x = 0.5;

    const eggGeo = new THREE.SphereGeometry(0.038, 7, 8);
    eggGeo.scale(0.7, 1.25, 0.7);
    const eggMesh = new THREE.Mesh(eggGeo, this.petalAltMaterial);
    budHead.add(eggMesh);

    budGroup.add(budHead);
    parentGroup.add(budGroup);
    this.sideBud = budGroup;
  }

  /**
   * Applies simulated human body choreography kinematics:
   * - spineLeanX (sway left/right)
   * - spineLeanZ (bow forward/arch back)
   * - armHeightL & armHeightR (hands up/down)
   * - wingspanSpread (arms wide)
   * - heightFactor (stretch upward)
   * - bloomRatio (bud vs radiant bloom)
   */
  applyKinematics(kinematics, dt = 0.016) {
    const swayX = (kinematics.spineLeanX || 0) * 1.05;
    const swayZ = (kinematics.spineLeanZ || 0) * 1.25;
    const heightFactor = kinematics.heightFactor || 1.0;
    const bloomRatio = kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : 0.6;
    const wingspan = kinematics.wingspanSpread !== undefined ? kinematics.wingspanSpread : 0.5;
    const armL = kinematics.armHeightL !== undefined ? kinematics.armHeightL : 0.5;
    const armR = kinematics.armHeightR !== undefined ? kinematics.armHeightR : 0.5;

    // Smooth responsive interpolation
    this.currentSwayX += (swayX - this.currentSwayX) * 0.20;
    this.currentSwayZ += (swayZ - this.currentSwayZ) * 0.20;
    this.currentHeight += (heightFactor - this.currentHeight) * 0.18;
    this.currentBloom += (bloomRatio - this.currentBloom) * 0.18;
    this.currentWingspan += (wingspan - this.currentWingspan) * 0.18;
    this.currentArmL += (armL - this.currentArmL) * 0.18;
    this.currentArmR += (armR - this.currentArmR) * 0.18;

    const numSegs = this.segments.length;
    let cumZ = 0;
    let cumX = 0;

    // 1. Distribute spine flexion across 5 articulated vertebrae
    this.segments.forEach((segObj, i) => {
      const t = (i + 1) / numSegs;
      // Progressive curve from ground anchor upward
      const flex = (i === 0) ? 0.18 : (0.45 + 0.95 * t);
      
      const rotZ = -(this.currentSwayX / numSegs) * flex;
      const rotX = (this.currentSwayZ / numSegs) * flex;

      segObj.group.rotation.z = rotZ;
      segObj.group.rotation.x = rotX;
      segObj.mesh.scale.y = this.currentHeight;

      if (i > 0) {
        segObj.group.position.y = segObj.baseSegH * this.currentHeight;
      }

      cumZ += rotZ;
      cumX += rotX;
    });

    // 2. Flower Head Gaze & Nodding (follows stem curvature)
    if (this.headGroup) {
      this.headGroup.position.y = (this.height / numSegs) * this.currentHeight;
      this.headGroup.rotation.z = -cumZ * 0.35;
      this.headGroup.rotation.x = 0.28 + cumX * 0.40;
    }

    // 3. Dynamic Petal Bloom (Species-specific unfurling + horizontal arms spread completely)
    const wingspanDrive = THREE.MathUtils.clamp((this.currentWingspan - 0.35) * 1.4, 0.0, 1.4);
    for (let p = 0; p < this.petalHolders.length; p++) {
      const ph = this.petalHolders[p];
      const minA = (ph.minAngle !== undefined) ? ph.minAngle : (ph.isInner ? 0.18 : 0.24);
      const maxA = (ph.maxAngle !== undefined) ? ph.maxAngle : (ph.isInner ? 0.65 : 0.92);
      const extraSpread = wingspanDrive * 0.25;
      const targetAngle = THREE.MathUtils.lerp(minA, maxA + extraSpread, this.currentBloom) + (ph.offset || 0);
      ph.mesh.rotation.x = targetAngle;

      // Petals expand and spread radially when arms are stretched out horizontally
      const petalScale = THREE.MathUtils.lerp(0.88, 1.12 + wingspanDrive * 0.16, this.currentBloom);
      ph.mesh.scale.set(petalScale, petalScale, petalScale);
    }

    // 4. Leaves Elevate with Arms and Fan with Wingspan
    for (let l = 0; l < this.leafHolders.length; l++) {
      const lh = this.leafHolders[l];
      const armElev = (lh.isLeft ? this.currentArmL : this.currentArmR) - 0.5;
      // Hands UP: leaves reach upward; Hands DOWN: leaves droop
      lh.group.rotation.x = lh.baseRotX - armElev * 0.50;
      // Arms wide: leaves fan outward
      const spreadScale = 1.0 + this.currentWingspan * 0.45;
      lh.group.scale.set(spreadScale, spreadScale, spreadScale);
    }
  }

  /**
   * Ambient wind-only update (when not driven by body choreography)
   */
  update(time, windStrength = 1.0) {
    const t = time * this.swaySpeed + this.phaseOffset;
    const swayX = Math.sin(t * 1.1) * 0.08 * windStrength;
    const swayZ = Math.cos(t * 0.85) * 0.06 * windStrength;
    const bloom = 0.65 + Math.sin(t * 1.5) * 0.08 * windStrength;

    this.applyKinematics({
      spineLeanX: swayX,
      spineLeanZ: swayZ,
      armHeightL: 0.5 + Math.sin(t) * 0.1,
      armHeightR: 0.5 + Math.cos(t) * 0.1,
      wingspanSpread: 0.5,
      heightFactor: 1.0,
      bloomRatio: bloom
    });
  }

  /**
   * Independent organic movement for 100-flower capacity testing
   * Each flower calculates its own unique sway, breathing bloom, and stem stretch!
   */
  updateRandom(time, windStrength = 1.0, speedMultiplier = 1.0) {
    const rp = this.randomProfile;
    const t = time * speedMultiplier;

    const tX = t * rp.speedX + rp.phaseX;
    const tZ = t * rp.speedZ + rp.phaseZ;
    const tBloom = t * rp.speedBloom + rp.phaseBloom;
    const tStretch = t * rp.speedStretch + rp.phaseStretch;

    // Organic swaying & nodding with compound harmonics
    const swayX = (Math.sin(tX) * rp.ampSwayX + Math.sin(tX * 2.1) * 0.03 + rp.noiseDrift) * windStrength;
    const swayZ = (Math.cos(tZ) * rp.ampSwayZ + Math.cos(tZ * 1.7) * 0.02) * windStrength;

    // Individual petal unfurling cycle (breathing chalice bud to radiant open bloom)
    const bloomProgress = (Math.sin(tBloom) * 0.5 + 0.5);
    const bloomRatio = THREE.MathUtils.lerp(rp.minBloom, rp.maxBloom, bloomProgress);

    // Individual stem stretch
    const stretchProgress = (Math.sin(tStretch) * 0.5 + 0.5);
    const heightFactor = THREE.MathUtils.lerp(rp.minStretch, rp.maxStretch, stretchProgress);

    // Individual leaf reach and wingspan fanning
    const armL = Math.sin(t * rp.armSpeedL + rp.phaseArmL) * 0.35 + 0.5;
    const armR = Math.cos(t * rp.armSpeedR + rp.phaseArmR) * 0.35 + 0.5;
    const wingspan = Math.sin(t * rp.wingspanSpeed + rp.phaseWingspan) * 0.35 + 0.5;

    const kinematics = {
      spineLeanX: swayX,
      spineLeanZ: swayZ,
      armHeightL: armL,
      armHeightR: armR,
      wingspanSpread: wingspan,
      heightFactor: heightFactor,
      bloomRatio: bloomRatio,
      postureDesc: '100 Flowers • Independent Random Choreography'
    };

    this.applyKinematics(kinematics);
    return kinematics;
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setRotationY(rad) {
    this.group.rotation.y = rad;
  }

  setScale(s) {
    this.group.scale.set(s, s, s);
  }

  setWireframe(wire) {
    this.group.traverse(child => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.wireframe = wire);
        } else {
          child.material.wireframe = wire;
        }
      }
    });
  }

  setBloom(val) {
    this.applyKinematics({ bloomRatio: val });
  }

  dispose() {
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
