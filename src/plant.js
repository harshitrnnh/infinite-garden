import * as THREE from 'three';

// Curated Botanical Color Palettes & Morphologies
export const FLOWER_SPECIES = {
  periwinkle: {
    key: 'periwinkle',
    name: 'Periwinkle',
    hindiName: 'सदाबहार (Periwinkle)',
    tagline: 'Vibrant Ultramarine Blue & Violet Wildflower',
    petalOuter: 0x5c69ad,
    petalMid: 0x414b87,
    petalInner: 0x8794d6,
    petalCore: 0x2e3566,
    stamen: 0xffeb3b,
    stem: 0x243e2e,
    leaf: 0x2d523b,
    emissiveCore: 0x6372b8,
    pollenColor: 0x8794d6,
    glowIntensity: 2.8,
    morphology: 'periwinkle'
  },
  poppy: {
    key: 'poppy',
    name: 'Poppy',
    hindiName: 'पोस्ता (Poppy Flame)',
    tagline: 'Radiant Vermilion Scarlet with Charcoal Eye',
    petalOuter: 0xeb4328,
    petalMid: 0xc42e18,
    petalInner: 0xff6b4a,
    petalCore: 0x1f1412,
    stamen: 0xf5b041,
    stem: 0x2b3826,
    leaf: 0x31472e,
    emissiveCore: 0xff3d00,
    pollenColor: 0xff6b4a,
    glowIntensity: 3.0,
    morphology: 'poppy'
  },
  chamomile: {
    key: 'chamomile',
    name: 'Chamomile',
    hindiName: 'बबूना (Chamomile Wheat)',
    tagline: 'Sunlit Ivory Cream Petals with Warm Amber Core',
    petalOuter: 0xf3eed9,
    petalMid: 0xded4b6,
    petalInner: 0xfffaea,
    petalCore: 0xdba139,
    stamen: 0xfcc860,
    stem: 0x2a4428,
    leaf: 0x32532f,
    emissiveCore: 0xf59e0b,
    pollenColor: 0xfff0aa,
    glowIntensity: 2.6,
    morphology: 'chamomile'
  },
  champa: {
    key: 'champa',
    name: 'Champa',
    hindiName: 'चंपा (Frangipani)',
    tagline: '5 Spiral Pinwheel Petals • Golden Sunlight Heart',
    petalOuter: 0xfcfaf7,
    petalMid: 0xffd11a,
    petalInner: 0xff8c00,
    petalCore: 0xffa000,
    stamen: 0xffb703,
    stem: 0x4a5d42,
    leaf: 0x2b4528,
    emissiveCore: 0xffc107,
    pollenColor: 0xffe6a3,
    glowIntensity: 2.8,
    morphology: 'champa'
  },
  meadow: {
    key: 'champa',
    name: 'Champa',
    hindiName: 'चंपा (Frangipani)',
    tagline: '5 Spiral Pinwheel Petals • Golden Sunlight Heart',
    petalOuter: 0xfcfaf7,
    petalMid: 0xffd11a,
    petalInner: 0xff8c00,
    petalCore: 0xffa000,
    stamen: 0xffb703,
    stem: 0x4a5d42,
    leaf: 0x2b4528,
    emissiveCore: 0xffc107,
    pollenColor: 0xffe6a3,
    glowIntensity: 2.8,
    morphology: 'champa'
  },
  chalice: {
    key: 'champa',
    name: 'Champa',
    hindiName: 'चंपा (Frangipani)',
    tagline: '5 Spiral Pinwheel Petals • Golden Sunlight Heart',
    petalOuter: 0xfcfaf7,
    petalMid: 0xffd11a,
    petalInner: 0xff8c00,
    petalCore: 0xffa000,
    stamen: 0xffb703,
    stem: 0x4a5d42,
    leaf: 0x2b4528,
    emissiveCore: 0xffc107,
    pollenColor: 0xffe6a3,
    glowIntensity: 2.8,
    morphology: 'champa'
  },
  lotus: {
    key: 'lotus',
    name: 'Sacred Indian Lotus',
    hindiName: 'कमल (Kamal)',
    tagline: 'National Flower of India • Divine Purity & Radiance',
    petalOuter: 0xeb4d88,    // Vivid lotus rose-pink
    petalMid: 0xf48fb1,      // Blushing petal pink
    petalInner: 0xfff0f5,    // Sacred ivory white with soft pink tip
    petalCore: 0xe6b800,     // Golden lotus torus / seed pod
    stamen: 0xffeb3b,        // Golden pollen stamens
    stem: 0x1d472c,
    leaf: 0x245a35,
    emissiveCore: 0xffd54f,
    pollenColor: 0xff80ab,
    glowIntensity: 2.8,
    morphology: 'lotus'
  },
  marigold: {
    key: 'marigold',
    name: 'Festive Indian Marigold',
    hindiName: 'गेंदा (Genda)',
    tagline: 'Auspicious Festival Bloom • Diwali & Wedding Garlands',
    petalOuter: 0xe65100,    // Deep festive saffron orange
    petalMid: 0xf57c00,      // Fiery marigold amber
    petalInner: 0xffb300,    // Sunny marigold gold
    petalCore: 0xbf360c,     // Deep roasted saffron eye
    stamen: 0xffd54f,        // Yellow-gold stamen tufts
    stem: 0x244b20,
    leaf: 0x2d6129,
    emissiveCore: 0xff9100,
    pollenColor: 0xffb74d,
    glowIntensity: 2.7,
    morphology: 'marigold'
  },
  hibiscus: {
    key: 'hibiscus',
    name: 'Royal Sacred Hibiscus',
    hindiName: 'गुड़हल (Gudhal / Jaba)',
    tagline: 'Sacred Kali & Ganesha Offering • Flame of Shakti',
    petalOuter: 0xd50000,    // Royal crimson scarlet
    petalMid: 0xe53935,      // Radiant vermilion red
    petalInner: 0xb71c1c,    // Deep velvet ruby center
    petalCore: 0x7f0000,     // Dark crimson eye
    stamen: 0xffd600,        // Golden anthers on scarlet column
    stem: 0x204523,
    leaf: 0x1b5e20,
    emissiveCore: 0xff1744,
    pollenColor: 0xff5252,
    glowIntensity: 3.0,
    morphology: 'hibiscus'
  },
  mogra: {
    key: 'mogra',
    name: 'Arabian Jasmine',
    hindiName: 'मोगरा (Mogra / Chameli)',
    tagline: 'Intoxicating Perfume • Traditional Hair Gajras & Poojas',
    petalOuter: 0xf8fafc,    // Moonlit porcelain white
    petalMid: 0xffffff,      // Pure bridal ivory
    petalInner: 0xf0fdf4,    // Translucent pearl with tender lime glow
    petalCore: 0xa7f3d0,     // Fresh jade-green throat
    stamen: 0xfef08a,        // Soft honey anthers
    stem: 0x1e4626,
    leaf: 0x225c34,
    emissiveCore: 0x6ee7b7,
    pollenColor: 0xf1f5f9,
    glowIntensity: 2.4,
    morphology: 'mogra'
  },
  palash: {
    key: 'palash',
    name: 'Flame of the Forest',
    hindiName: 'पलाश (Palash / Tesu)',
    tagline: 'Sacred Bloom of Spring • Source of Herbal Holi Colors',
    petalOuter: 0xff3d00,    // Blazing fiery neon orange
    petalMid: 0xff6e40,      // Radiant saffron flame
    petalInner: 0xdd2c00,    // Incandescent vermilion
    petalCore: 0x24120e,     // Velvety dark charcoal-crimson calyx
    stamen: 0xffa726,        // Flame anthers
    stem: 0x264124,
    leaf: 0x2d592b,
    emissiveCore: 0xff5722,
    pollenColor: 0xff7043,
    glowIntensity: 2.9,
    morphology: 'palash'
  },
  gulmohar: {
    key: 'gulmohar',
    name: 'Royal Poinciana',
    hindiName: 'गुलमोहर (Gulmohar)',
    tagline: 'Avenue of Fire • Vibrant Scarlet & Gold Canopy Bloom',
    petalOuter: 0xf44336,    // Dazzling scarlet
    petalMid: 0xff7043,      // Flame orange
    petalInner: 0xfff176,    // Sunburst yellow-spotted banner petal
    petalCore: 0xd84315,     // Crimson throat
    stamen: 0xffeb3b,        // Long arching scarlet-gold stamens
    stem: 0x224921,
    leaf: 0x33691e,
    emissiveCore: 0xffb300,
    pollenColor: 0xffab91,
    glowIntensity: 2.6,
    morphology: 'gulmohar'
  },
  champa: {
    key: 'champa',
    name: 'Temple Frangipani',
    hindiName: 'चंपा (Champa / Plumeria)',
    tagline: 'Sacred Temple Peace • Pinwheel Spiral with Sunburst Core',
    petalOuter: 0xfffdf5,    // Smooth creamy porcelain white
    petalMid: 0xfff8db,      // Warm butter ivory
    petalInner: 0xffb703,    // Deep golden yolk throat
    petalCore: 0xf59e0b,     // Radiant amber sun
    stamen: 0xffd166,        // Golden interior
    stem: 0x2b4f2c,
    leaf: 0x1e5831,
    emissiveCore: 0xfbbf24,
    pollenColor: 0xfef08a,
    glowIntensity: 2.5,
    morphology: 'champa'
  },
  iris: {
    key: 'iris',
    name: 'Wild Alpine Iris',
    hindiName: 'नीलकुसुमा (Iris)',
    tagline: 'Deep Indigo & Violet Velvet Mountain Petals',
    petalOuter: 0x4f42a6,
    petalMid: 0x7666d6,
    petalInner: 0x9b8ef0,
    petalCore: 0x312470,
    stamen: 0xffcb44,
    stem: 0x2b5236,
    leaf: 0x366944,
    emissiveCore: 0xffbb33,
    pollenColor: 0x9fa8da,
    glowIntensity: 2.4,
    morphology: 'default'
  }
};

export class LivingPlant {
  constructor(speciesKey = 'lotus', detailLevel = 'full') {
    this.detailLevel = detailLevel; // 'full' (hero interactive flower) or 'communal' (optimized for 100+ field)
    this.group = new THREE.Group();
    this.species = FLOWER_SPECIES[speciesKey] || FLOWER_SPECIES.lotus;

    // Base Transform in the Communal Garden
    this.basePosition = new THREE.Vector3(0, 0, 0);
    this.baseRotation = new THREE.Euler(0, 0, 0);
    this.baseScale = new THREE.Vector3(1, 1, 1);

    // Materials
    this.materials = {};
    this.initMaterials();

    // Stem Segments Hierarchy (communal: 5 segments at 0.24m; full: 6 segments at 0.20m = ~1.2m base height)
    this.numSegments = this.detailLevel === 'communal' ? 5 : 6;
    this.segmentHeight = this.detailLevel === 'communal' ? 0.24 : 0.20;
    this.segments = [];
    this.branchlets = [];

    // Separate petal / stamen tracking for smooth rebuilding
    this.floretPetals = [];
    this.floretStamens = [];
    this.mainPetals = [];
    this.mainStamens = [];
    this.petals = [];
    this.stamens = [];

    // Secondary animated components
    this.staminalColumn = null;

    this.buildRootBase();
    this.buildSkeleton();
    this.buildFloweryBranches();
    this.buildFlowerHead();

    this.petals = [...this.floretPetals, ...this.mainPetals];
    this.stamens = [...this.floretStamens, ...this.mainStamens];

    // Secondary animation state
    this.idleTime = 0;
    this.currentBloom = 0.35;
    this.gustImpulse = 0;
    this.currentArmL = 0.35;
    this.currentArmR = 0.35;
    this.currentArmExtL = 0;
    this.currentArmExtR = 0;
    this.currentArmStretchUp = 0;
    this.currentLegLiftL = 0;
    this.currentLegLiftR = 0;
    this.currentLeanX = 0;
    this.currentLeanZ = 0;
    this.currentHeight = 1.0;
  }

  initMaterials() {
    this.materials.stem = new THREE.MeshStandardMaterial({
      color: this.species.stem,
      roughness: 0.52,
      metalness: 0.05,
      flatShading: false
    });

    this.materials.leaf = new THREE.MeshStandardMaterial({
      color: this.species.leaf,
      roughness: 0.42,
      metalness: 0.03,
      side: THREE.DoubleSide
    });

    this.materials.petalOuter = new THREE.MeshStandardMaterial({
      color: this.species.petalOuter,
      roughness: 0.32,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    this.materials.petalMid = new THREE.MeshStandardMaterial({
      color: this.species.petalMid || this.species.petalOuter,
      roughness: 0.30,
      metalness: 0.03,
      side: THREE.DoubleSide
    });

    this.materials.petalInner = new THREE.MeshStandardMaterial({
      color: this.species.petalInner,
      roughness: 0.28,
      metalness: 0.03,
      side: THREE.DoubleSide
    });

    this.materials.petalCore = new THREE.MeshStandardMaterial({
      color: this.species.petalCore,
      roughness: 0.25,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.materials.stamen = new THREE.MeshStandardMaterial({
      color: this.species.stamen,
      roughness: 0.2,
      metalness: 0.1,
      emissive: this.species.emissiveCore,
      emissiveIntensity: 0.7
    });

    this.materials.scarletColumn = new THREE.MeshStandardMaterial({
      color: 0xd50000,
      roughness: 0.28,
      metalness: 0.04
    });

    this.materials.darkCalyx = new THREE.MeshStandardMaterial({
      color: 0x22130e,
      roughness: 0.65,
      metalness: 0.02
    });

    this.materials.groundMound = new THREE.MeshStandardMaterial({
      color: 0x121713,
      roughness: 0.95,
      metalness: 0.02
    });
  }

  updateMaterialColors() {
    this.materials.stem.color.setHex(this.species.stem);
    this.materials.leaf.color.setHex(this.species.leaf);
    this.materials.petalOuter.color.setHex(this.species.petalOuter);
    this.materials.petalMid.color.setHex(this.species.petalMid || this.species.petalOuter);
    this.materials.petalInner.color.setHex(this.species.petalInner);
    this.materials.petalCore.color.setHex(this.species.petalCore);
    this.materials.stamen.color.setHex(this.species.stamen);
    this.materials.stamen.emissive.setHex(this.species.emissiveCore);

    if (this.coreLight) {
      this.coreLight.color.setHex(this.species.emissiveCore);
      this.coreLight.intensity = this.species.glowIntensity;
    }
  }

  setSpecies(speciesKey) {
    if (!FLOWER_SPECIES[speciesKey]) return;
    this.species = FLOWER_SPECIES[speciesKey];

    this.updateMaterialColors();
    this.rebuildFlowerHead();
    this.rebuildFlorets();
  }

  rebuildFlowerHead() {
    if (!this.flowerReceptacle) return;

    // Safely remove and dispose previous meshes from flowerReceptacle
    while (this.flowerReceptacle.children.length > 0) {
      const child = this.flowerReceptacle.children[0];
      this.flowerReceptacle.remove(child);
      child.traverse((node) => {
        if (node.geometry) node.geometry.dispose();
      });
    }

    this.buildFlowerHead();

    this.mainPetals.forEach((p) => {
      let layerBloom = this.currentBloom;
      if (p.layer === 'inner') {
        layerBloom = Math.max(0, (this.currentBloom - 0.12) / 0.88);
      } else if (p.layer === 'mid') {
        layerBloom = Math.max(0, (this.currentBloom - 0.06) / 0.94);
      }
      p.currentAngleY = THREE.MathUtils.lerp(p.closedAngleY, p.openAngleY, layerBloom);
      p.hinge.rotation.y = -p.currentAngleY;
    });

    this.petals = [...this.floretPetals, ...this.mainPetals];
    this.stamens = [...this.floretStamens, ...this.mainStamens];
  }

  rebuildFlorets() {
    this.floretPetals = [];
    this.floretStamens = [];

    this.branchlets.forEach((b) => {
      const fg = b.floretGroup;
      while (fg.children.length > 0) {
        const child = fg.children[0];
        fg.remove(child);
        child.traverse((node) => {
          if (node.geometry) node.geometry.dispose();
        });
      }
      this.buildFloret(fg, b.floretScale || 0.55);
    });

    this.floretPetals.forEach((p) => {
      let layerBloom = this.currentBloom;
      if (p.layer === 'floretInner') {
        layerBloom = Math.max(0, (this.currentBloom - 0.08) / 0.92);
      } else if (p.layer === 'floretOuter') {
        layerBloom = Math.max(0, (this.currentBloom - 0.03) / 0.97);
      }
      p.currentAngleY = THREE.MathUtils.lerp(p.closedAngleY, p.openAngleY, layerBloom);
      p.hinge.rotation.y = -p.currentAngleY;
    });

    this.petals = [...this.floretPetals, ...this.mainPetals];
    this.stamens = [...this.floretStamens, ...this.mainStamens];
  }

  buildRootBase() {
    const isCommunal = this.detailLevel === 'communal';
    // Flush flat ground soil bed (flat disk, flush with ground plane y = 0.0)
    const moundGeo = new THREE.CylinderGeometry(0.70, 0.95, 0.02, isCommunal ? 16 : 32);
    const moundMesh = new THREE.Mesh(moundGeo, this.materials.groundMound);
    moundMesh.position.y = -0.01; // Flush with ground y = 0.0
    moundMesh.receiveShadow = true;
    this.group.add(moundMesh);

    this.rootSpursL = [];
    this.rootSpursR = [];

    if (isCommunal) {
      // Streamlined: 2 flat anchoring roots
      [-0.45, 0.45].forEach((angle) => {
        const spurGeo = new THREE.ConeGeometry(0.035, 0.28, 5);
        spurGeo.translate(0, 0.14, 0);
        spurGeo.rotateZ(1.52);
        spurGeo.rotateY(angle);
        const spurMesh = new THREE.Mesh(spurGeo, this.materials.stem);
        spurMesh.position.y = 0.005;
        this.group.add(spurMesh);
      });
      return;
    }

    // Left root tendrils resting flat on the earth
    const leftAngles = [-Math.PI * 0.42, -Math.PI * 0.65, -Math.PI * 0.25];
    leftAngles.forEach((angle, i) => {
      const rootPivot = new THREE.Group();
      rootPivot.rotation.y = angle;
      rootPivot.position.set(0, 0.005, 0);

      const len = 0.32 + i * 0.04;
      const rootGeo = new THREE.ConeGeometry(0.032, len, 8);
      rootGeo.translate(0, len * 0.5, 0);
      rootGeo.rotateZ(1.52); // Hugging soil completely flat
      const rootMesh = new THREE.Mesh(rootGeo, this.materials.stem);
      rootMesh.castShadow = true;
      rootMesh.receiveShadow = true;
      rootPivot.add(rootMesh);

      this.group.add(rootPivot);
      this.rootSpursL.push({ pivot: rootPivot, baseRotY: angle });
    });

    // Right root tendrils resting flat on the earth
    const rightAngles = [Math.PI * 0.42, Math.PI * 0.65, Math.PI * 0.25];
    rightAngles.forEach((angle, i) => {
      const rootPivot = new THREE.Group();
      rootPivot.rotation.y = angle;
      rootPivot.position.set(0, 0.005, 0);

      const len = 0.32 + i * 0.04;
      const rootGeo = new THREE.ConeGeometry(0.032, len, 8);
      rootGeo.translate(0, len * 0.5, 0);
      rootGeo.rotateZ(1.52); // Hugging soil completely flat
      const rootMesh = new THREE.Mesh(rootGeo, this.materials.stem);
      rootMesh.castShadow = true;
      rootMesh.receiveShadow = true;
      rootPivot.add(rootMesh);

      this.group.add(rootPivot);
      this.rootSpursR.push({ pivot: rootPivot, baseRotY: angle });
    });

    // Steady front/back anchoring roots resting flat
    [0.12, Math.PI - 0.12].forEach((angle) => {
      const spurGeo = new THREE.ConeGeometry(0.035, 0.28, 7);
      spurGeo.translate(0, 0.14, 0);
      spurGeo.rotateZ(1.52); // Completely flat on ground
      spurGeo.rotateY(angle);
      const spurMesh = new THREE.Mesh(spurGeo, this.materials.stem);
      spurMesh.position.y = 0.005;
      this.group.add(spurMesh);
    });
  }

  buildSkeleton() {
    let parent = this.group;
    const isCommunal = this.detailLevel === 'communal';
    const radSegs = isCommunal ? 8 : 12;

    for (let i = 0; i < this.numSegments; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.y = i === 0 ? 0.00 : this.segmentHeight;

      const t0 = i / this.numSegments;
      const t1 = (i + 1) / this.numSegments;
      const rBottom = THREE.MathUtils.lerp(0.054, 0.026, t0);
      const rTop = THREE.MathUtils.lerp(0.054, 0.026, t1);

      const geom = new THREE.CylinderGeometry(rTop, rBottom, this.segmentHeight, radSegs);
      geom.translate(0, this.segmentHeight * 0.5, 0);

      const mesh = new THREE.Mesh(geom, this.materials.stem);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      segGroup.add(mesh);

      // Leaves along lower segments (curling gently outward)
      const maxLeaves = isCommunal ? 2 : 3;
      if (i >= 1 && i <= maxLeaves) {
        const leafSide = i % 2 === 0 ? 1 : -1;
        const leafPivot = new THREE.Group();
        leafPivot.position.y = this.segmentHeight * 0.85;
        leafPivot.rotation.y = (i * 1.85) % (Math.PI * 2);
        leafPivot.rotation.z = leafSide * 0.82;
        leafPivot.rotation.x = 0.15;

        const isPoppy = this.species === 'poppy';
        const leafLength = (0.38 - i * 0.04) * (isPoppy ? 0.45 : 1.0);
        const leafWidth = (0.10 - i * 0.01) * (isPoppy ? 0.45 : 1.0);
        const leafGeom = this.createSculptedLeafGeometry(leafLength, leafWidth);
        const leafMesh = new THREE.Mesh(leafGeom, this.materials.leaf);
        leafMesh.castShadow = true;
        leafMesh.receiveShadow = true;
        leafPivot.add(leafMesh);

        segGroup.add(leafPivot);
      }

      parent.add(segGroup);
      this.segments.push({ group: segGroup, mesh: mesh });
      parent = segGroup;
    }

    // Top Pedicel (Curves flower head forward to FACE front viewer)
    this.neckGroup = new THREE.Group();
    this.neckGroup.position.y = this.segmentHeight;
    this.baseNeckAngleX = Math.PI * 0.38;
    this.neckGroup.rotation.x = this.baseNeckAngleX;
    parent.add(this.neckGroup);

    // Receptacle mount
    this.flowerReceptacle = new THREE.Group();
    this.flowerReceptacle.position.y = 0.10;
    this.neckGroup.add(this.flowerReceptacle);
  }

  buildFloweryBranches() {
    this.branchlets = [];
    const isCommunal = this.detailLevel === 'communal';

    // Communal flowers use 2 expressive branches; hero full flowers use 4
    // Angled upward at natural asymmetrical botanical angles (never horizontal)
    const branchConfigs = isCommunal ? [
      { segIdx: 1, side: -1, len: 0.52, baseAngleZ: -0.52, baseAngleY: 0.35, baseAngleX: 0.12, floretScale: 0.74 },
      { segIdx: 2, side: 1, len: 0.58, baseAngleZ: 0.62, baseAngleY: -0.30, baseAngleX: 0.10, floretScale: 0.80 }
    ] : [
      { segIdx: 1, side: -1, len: 0.52, baseAngleZ: -0.52, baseAngleY: 0.35, baseAngleX: 0.12, floretScale: 0.74 },
      { segIdx: 2, side: 1, len: 0.58, baseAngleZ: 0.62, baseAngleY: -0.30, baseAngleX: 0.10, floretScale: 0.80 },
      { segIdx: 3, side: -1, len: 0.48, baseAngleZ: -0.46, baseAngleY: -0.35, baseAngleX: 0.16, floretScale: 0.68 },
      { segIdx: 4, side: 1, len: 0.42, baseAngleZ: 0.56, baseAngleY: 0.28, baseAngleX: 0.14, floretScale: 0.62 }
    ];

    branchConfigs.forEach((cfg) => {
      const seg = this.segments[cfg.segIdx].group;
      const pivot = new THREE.Group();
      pivot.position.y = this.segmentHeight * 0.50;
      pivot.rotation.y = cfg.baseAngleY;
      pivot.rotation.z = cfg.baseAngleZ;
      pivot.rotation.x = cfg.baseAngleX;

      // 1. Arching sculpted branchlet stem
      const stemGeom = new THREE.CylinderGeometry(0.016, 0.026, cfg.len, isCommunal ? 6 : 8);
      stemGeom.translate(0, cfg.len * 0.5, 0);
      const stemMesh = new THREE.Mesh(stemGeom, this.materials.stem);
      stemMesh.castShadow = true;
      pivot.add(stemMesh);

      // 2. Primary sculpted foliage leaf along the branchlet
      const leafLen = cfg.len * 0.76;
      const leafW = leafLen * 0.26;
      const leafGeom = this.createSculptedLeafGeometry(leafLen, leafW);
      const leafMesh = new THREE.Mesh(leafGeom, this.materials.leaf);
      leafMesh.castShadow = true;
      leafMesh.position.set(0, cfg.len * 0.40, 0);
      leafMesh.rotation.z = cfg.side === -1 ? -0.32 : 0.32;
      leafMesh.rotation.x = 0.22;
      pivot.add(leafMesh);

      // Secondary sculpted leaf (for hero flower only)
      if (!isCommunal) {
        const subLeafLen = leafLen * 0.68;
        const subLeafGeom = this.createSculptedLeafGeometry(subLeafLen, leafW * 0.80);
        const subLeafMesh = new THREE.Mesh(subLeafGeom, this.materials.leaf);
        subLeafMesh.castShadow = true;
        subLeafMesh.position.set(0, cfg.len * 0.72, 0);
        subLeafMesh.rotation.z = cfg.side === -1 ? 0.30 : -0.30;
        subLeafMesh.rotation.x = -0.18;
        pivot.add(subLeafMesh);
      }

      // 3. Blooming Secondary Floret at Branchlet Tip
      const floretGroup = new THREE.Group();
      floretGroup.position.set(0, cfg.len, 0);
      floretGroup.rotation.z = cfg.side === -1 ? 0.45 : -0.45;
      floretGroup.rotation.x = Math.PI * 0.32;
      pivot.add(floretGroup);

      this.buildFloret(floretGroup, cfg.floretScale);

      seg.add(pivot);

      this.branchlets.push({
        pivot: pivot,
        side: cfg.side,
        baseAngleZ: cfg.baseAngleZ,
        baseAngleX: cfg.baseAngleX,
        floretGroup: floretGroup,
        floretScale: cfg.floretScale
      });
    });
  }

  buildFloret(parentGroup, scale) {
    const s = scale;
    const isCommunal = this.detailLevel === 'communal';

    // Calyx sepals (3 for communal, 4 for hero)
    const numSepals = isCommunal ? 3 : 4;
    for (let i = 0; i < numSepals; i++) {
      const angle = (i / numSepals) * Math.PI * 2;
      const sAnchor = new THREE.Group();
      sAnchor.rotation.z = angle;
      const sHinge = new THREE.Group();
      sHinge.rotation.y = 0.45;
      sAnchor.add(sHinge);

      const sepalGeom = this.buildRadialPetalGeometry(0.10 * s, 0.035 * s, 0.01 * s);
      const sepalMesh = new THREE.Mesh(sepalGeom, this.materials.stem);
      sHinge.add(sepalMesh);
      parentGroup.add(sAnchor);
    }

    // Glowing floret pistil
    const pistilGeo = new THREE.SphereGeometry(0.04 * s, isCommunal ? 6 : 10, isCommunal ? 6 : 10);
    pistilGeo.scale(1.0, 1.0, 0.6);
    const pistilMesh = new THREE.Mesh(pistilGeo, this.materials.stamen);
    pistilMesh.position.z = 0.01 * s;
    parentGroup.add(pistilMesh);

    // Miniature stamens (only on hero full flower)
    if (!isCommunal) {
      const numStamens = 6;
      for (let i = 0; i < numStamens; i++) {
        const angle = (i / numStamens) * Math.PI * 2;
        const stAnchor = new THREE.Group();
        stAnchor.rotation.z = angle;
        const stHinge = new THREE.Group();
        stAnchor.add(stHinge);

        const filGeo = new THREE.CylinderGeometry(0.002 * s, 0.003 * s, 0.07 * s, 4);
        filGeo.rotateZ(-Math.PI / 2);
        filGeo.translate(0.035 * s, 0, 0.02 * s);
        const filMesh = new THREE.Mesh(filGeo, this.materials.stem);
        stHinge.add(filMesh);

        const antGeo = new THREE.SphereGeometry(0.01 * s, 6, 6);
        const antMesh = new THREE.Mesh(antGeo, this.materials.stamen);
        antMesh.position.set(0.07 * s, 0, 0.025 * s);
        stHinge.add(antMesh);

        parentGroup.add(stAnchor);
        this.floretStamens.push({ hinge: stHinge });
      }
    }

    // Outer Layer Petals tailored to species morphology
    const morph = this.species.morphology || 'default';
    let floretCount = 5;
    let floretGeom = null;

    if (morph === 'periwinkle') {
      floretCount = 5;
      floretGeom = this.buildPeriwinklePetalGeometry(0.14 * s, 0.26 * s);
    } else if (morph === 'poppy') {
      floretCount = 4;
      floretGeom = this.buildPoppyPetalGeometry(0.24 * s, 0.30 * s);
    } else if (morph === 'chamomile') {
      floretCount = 12;
      floretGeom = this.buildChamomileRayGeometry(0.045 * s, 0.24 * s);
    } else if (morph === 'meadow') {
      floretCount = 5;
      floretGeom = this.buildRadialPetalGeometry(0.14 * s, 0.07 * s, 0.02 * s);
    } else {
      floretCount = isCommunal ? 5 : 6;
      floretGeom = this.buildRadialPetalGeometry(0.24 * s, 0.075 * s, 0.025 * s);
    }

    for (let i = 0; i < floretCount; i++) {
      const angle = (i / floretCount) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const mesh = new THREE.Mesh(floretGeom, this.materials.petalOuter);
      mesh.castShadow = true;
      hinge.add(mesh);

      parentGroup.add(anchor);
      this.floretPetals.push({
        hinge: hinge,
        layer: 'floretOuter',
        closedAngleY: 1.15,
        openAngleY: -0.12,
        currentAngleY: 1.15
      });
    }

    // Inner Layer Petals (only for multi-layered species like lotus/marigold)
    if (!isCommunal && (morph === 'lotus' || morph === 'marigold' || morph === 'default')) {
      const numInner = 5;
      for (let i = 0; i < numInner; i++) {
        const angle = ((i + 0.5) / numInner) * Math.PI * 2;
        const anchor = new THREE.Group();
        anchor.rotation.z = angle;
        const hinge = new THREE.Group();
        anchor.add(hinge);

        const geom = this.buildRadialPetalGeometry(0.17 * s, 0.055 * s, 0.02 * s);
        const mesh = new THREE.Mesh(geom, this.materials.petalInner);
        mesh.castShadow = true;
        hinge.add(mesh);

        parentGroup.add(anchor);
        this.floretPetals.push({
          hinge: hinge,
          layer: 'floretInner',
          closedAngleY: 1.25,
          openAngleY: 0.10,
          currentAngleY: 1.25
        });
      }
    }
  }

  createSculptedLeafGeometry(length, width) {
    const rows = 14;
    const cols = 6;
    const geom = new THREE.PlaneGeometry(width, length, cols, rows);
    geom.translate(0, length * 0.5, 0);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const v = Math.max(0, Math.min(1, y / length));
      const u = x / Math.max(0.001, width * 0.5);

      const profile = Math.sin(Math.pow(v, 0.6) * Math.PI);
      pos.setX(i, x * (0.05 + 0.95 * profile));

      const rib = (1 - Math.abs(u)) * 0.02 * profile;
      const archZ = Math.sin(v * Math.PI * 0.85) * (length * 0.22);
      pos.setZ(i, rib - archZ);
    }

    geom.computeVertexNormals();
    return geom;
  }

  // --- Dispatcher for Flower Head Construction by Indian Flower Morphology ---
  buildFlowerHead() {
    this.mainPetals = [];
    this.mainStamens = [];

    // Core point light inside flower (only on hero creator flower to preserve WebGL light budget)
    if (this.detailLevel !== 'communal') {
      this.coreLight = new THREE.PointLight(this.species.emissiveCore, this.species.glowIntensity || 2.4, 3.2);
      this.coreLight.position.set(0, 0, 0.12);
      this.flowerReceptacle.add(this.coreLight);
    }

    if (this.detailLevel === 'communal') {
      this.buildCommunalHead();
      return;
    }

    const morph = this.species.morphology || 'default';
    if (morph === 'periwinkle') {
      this.buildPeriwinkleHead();
    } else if (morph === 'poppy') {
      this.buildPoppyHead();
    } else if (morph === 'chamomile') {
      this.buildChamomileHead();
    } else if (morph === 'meadow') {
      this.buildMeadowHead();
    } else if (morph === 'lotus') {
      this.buildLotusHead();
    } else if (morph === 'marigold') {
      this.buildMarigoldHead();
    } else if (morph === 'hibiscus') {
      this.buildHibiscusHead();
    } else if (morph === 'mogra') {
      this.buildMograHead();
    } else if (morph === 'palash') {
      this.buildPalashHead();
    } else if (morph === 'champa') {
      this.buildChampaHead();
    } else if (morph === 'gulmohar') {
      this.buildGulmoharHead();
    } else {
      this.buildDefaultHead();
    }
  }

  // Streamlined, high-performance communal flower head (11 petals, 4 sepals, 1 glowing core)
  // Saves over 75% draw calls per flower while retaining expressive blooming
  buildCommunalHead() {
    // 1. Calyx sepals
    this.addSepals(4, 0.16, 0.045, 0.015);

    // 2. Central glowing seed receptacle / disc
    const podGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.035, 12);
    podGeo.rotateX(Math.PI / 2);
    const podMesh = new THREE.Mesh(podGeo, this.materials.petalCore || this.materials.stamen);
    podMesh.position.z = 0.02;
    this.flowerReceptacle.add(podMesh);

    // 3. Glowing pistil sphere
    const pistilGeo = new THREE.SphereGeometry(0.038, 8, 8);
    const pistilMesh = new THREE.Mesh(pistilGeo, this.materials.stamen);
    pistilMesh.position.z = 0.035;
    this.flowerReceptacle.add(pistilMesh);

    // 4. Outer Layer Petals (6 large expressive petals)
    const numOuter = 6;
    for (let i = 0; i < numOuter; i++) {
      const angle = (i / numOuter) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const geom = this.buildRadialPetalGeometry(0.38, 0.14, 0.035);
      const mesh = new THREE.Mesh(geom, this.materials.petalOuter);
      mesh.castShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 1.25,
        openAngleY: -0.15,
        currentAngleY: 1.25
      });
    }

    // 5. Inner Layer Petals (5 offset petals)
    const numInner = 5;
    for (let i = 0; i < numInner; i++) {
      const angle = ((i + 0.5) / numInner) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const geom = this.buildRadialPetalGeometry(0.28, 0.10, 0.028);
      const mesh = new THREE.Mesh(geom, this.materials.petalInner);
      mesh.castShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'inner',
        closedAngleY: 1.35,
        openAngleY: 0.12,
        currentAngleY: 1.35
      });
    }
  }

  // --- A. PERIWINKLE (Vinca minor) ---
  // 5 salverform propeller/pinwheel petals with pentagonal throat & coronal star
  buildPeriwinkleHead() {
    // 1. Pentagonal tubular throat
    const throatGeo = new THREE.CylinderGeometry(0.042, 0.022, 0.09, 5);
    throatGeo.rotateX(Math.PI / 2);
    const throatMat = new THREE.MeshStandardMaterial({
      color: 0x2e3566,
      roughness: 0.45
    });
    const throatMesh = new THREE.Mesh(throatGeo, throatMat);
    throatMesh.position.z = -0.04;
    this.flowerReceptacle.add(throatMesh);

    // 2. Star-shaped white coronal eye ring
    const eyeGeo = new THREE.RingGeometry(0.015, 0.045, 5);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xf0f4ff,
      side: THREE.DoubleSide
    });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.z = 0.008;
    this.flowerReceptacle.add(eyeMesh);

    // 3. Central golden stamen dot
    const centerGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const centerMesh = new THREE.Mesh(centerGeo, this.materials.stamen);
    centerMesh.position.z = 0.015;
    this.flowerReceptacle.add(centerMesh);

    // 4. 5 Asymmetrical salverform propeller petals
    const petalGeo = this.buildPeriwinklePetalGeometry(0.24, 0.52);
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const mesh = new THREE.Mesh(petalGeo, this.materials.petalOuter);
      mesh.castShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 1.25,
        openAngleY: -0.06,
        currentAngleY: 1.25
      });
    }

    // 5. Sepals (5 slender calyx lobes)
    this.addSepals(5, 0.14, 0.028, 0.01);
  }

  // --- B. WILD POPPY (Papaver rhoeas) ---
  // 4 broad crinkled ruffled petals with central Papaver capsule & velvety stamens
  buildPoppyHead() {
    // 1. Authentic Papaver seed capsule in center
    const capsuleGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.052, 0.038, 0.10, 14);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3d4a36,
      roughness: 0.55
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.z = 0.05;
    capsuleGroup.add(bodyMesh);

    // 10-ray velvety stigmatic disc crown
    const crownGeo = new THREE.CylinderGeometry(0.060, 0.052, 0.018, 14);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x1f1412,
      roughness: 0.4
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.z = 0.105;
    capsuleGroup.add(crownMesh);

    const rayGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.05, 4);
    for (let i = 0; i < 10; i++) {
      const ray = new THREE.Mesh(rayGeo, crownMat);
      const ang = (i / 10) * Math.PI * 2;
      ray.position.set(Math.cos(ang) * 0.028, Math.sin(ang) * 0.028, 0.11);
      ray.rotation.z = ang + Math.PI / 2;
      capsuleGroup.add(ray);
    }
    this.flowerReceptacle.add(capsuleGroup);

    // 2. Ring of 28 dark charcoal stamens surrounding capsule
    const stamenMat = new THREE.MeshStandardMaterial({ color: 0x1a1514, roughness: 0.4 });
    const stamenGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.08, 4);
    stamenGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2;
      const st = new THREE.Mesh(stamenGeo, stamenMat);
      st.position.set(Math.cos(ang) * 0.075, Math.sin(ang) * 0.075, 0.045);
      st.rotation.y = 0.28 * Math.cos(ang);
      st.rotation.x = -0.28 * Math.sin(ang);
      this.flowerReceptacle.add(st);
    }

    // 3. 4 massive ruffled crinkled scarlet petals in 2 decussate pairs
    const outerPoppyGeo = this.buildPoppyPetalGeometry(0.48, 0.62, 16, 20);
    const innerPoppyGeo = this.buildPoppyPetalGeometry(0.44, 0.56, 16, 20);

    // Outer pair
    for (let i = 0; i < 2; i++) {
      const angle = i * Math.PI;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const mesh = new THREE.Mesh(outerPoppyGeo, this.materials.petalOuter);
      mesh.castShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 1.05,
        openAngleY: -0.18,
        currentAngleY: 1.05
      });
    }

    // Inner pair (perpendicular to outer pair)
    for (let i = 0; i < 2; i++) {
      const angle = i * Math.PI + Math.PI * 0.5;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const mesh = new THREE.Mesh(innerPoppyGeo, this.materials.petalMid || this.materials.petalInner);
      mesh.castShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'inner',
        closedAngleY: 1.22,
        openAngleY: 0.02,
        currentAngleY: 1.22
      });
    }

    this.addSepals(2, 0.20, 0.09, 0.03);
  }

  // --- C. CHAMOMILE WHEAT (Matricaria chamomilla) ---
  // 16 slender radiating ray petals surrounding a conical golden disk dome
  buildChamomileHead() {
    // 1. Raised conical golden disk dome packed with disk florets
    const domeGeo = new THREE.ConeGeometry(0.12, 0.10, 24);
    domeGeo.rotateX(Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xdeb82c,
      emissive: 0x9e6d08,
      emissiveIntensity: 0.35,
      roughness: 0.52
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.z = 0.05;
    this.flowerReceptacle.add(domeMesh);

    // 2. 16 radiating slender ray petals
    const rayGeo = this.buildChamomileRayGeometry(0.082, 0.46, 14);
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const mesh = new THREE.Mesh(rayGeo, this.materials.petalOuter);
      mesh.castShadow = true;
      mesh.position.set(0.05, 0, 0.015);
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 1.30,
        openAngleY: -0.18,
        currentAngleY: 1.30
      });
    }

    this.addSepals(12, 0.08, 0.02, 0.005);
  }

  // --- D. MEADOW CHALICE (Campanula carpatica) ---
  // Translucent nodding bell-cup with recurved pointed petal lobes
  buildMeadowHead() {
    // 1. Campanulate chalice bell body
    const bellGeo = new THREE.ConeGeometry(0.24, 0.48, 20, 10, true);
    bellGeo.rotateX(-Math.PI / 2);
    const bellMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6f4ea,
      roughness: 0.35,
      metalness: 0.04,
      transmission: 0.3,
      thickness: 0.03,
      side: THREE.DoubleSide
    });
    const bellMesh = new THREE.Mesh(bellGeo, bellMat);
    bellMesh.position.z = 0.24;
    this.flowerReceptacle.add(bellMesh);

    // 2. 5 flared pointed petal lobes
    const lobeGeo = this.buildRadialPetalGeometry(0.18, 0.12, 0.03);
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      hinge.position.set(0, 0, 0.46);
      anchor.add(hinge);

      const mesh = new THREE.Mesh(lobeGeo, bellMat);
      mesh.castShadow = true;
      mesh.position.set(0.18, 0, 0);
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 0.85,
        openAngleY: -0.45,
        currentAngleY: 0.85
      });
    }

    // 3. Central honey pistil
    const pistilGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.22, 6);
    pistilGeo.rotateX(Math.PI / 2);
    const pistilMesh = new THREE.Mesh(pistilGeo, this.materials.pistil);
    pistilMesh.position.z = 0.12;
    this.flowerReceptacle.add(pistilMesh);

    this.addSepals(5, 0.16, 0.03, 0.015);
  }

  // 1. SACRED INDIAN LOTUS (कमल - Kamal)
  buildLotusHead() {
    // Calyx sepals
    this.addSepals(6, 0.16, 0.045, 0.015);

    // Central Torus Disc (Iconic flat-topped golden lotus seed-pod receptacle)
    const torusGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.038, 16);
    torusGeo.rotateX(Math.PI / 2);
    const torusMesh = new THREE.Mesh(torusGeo, this.materials.petalCore);
    torusMesh.position.z = 0.025;
    this.flowerReceptacle.add(torusMesh);

    // Miniature carpel pore dots on top of the lotus pod
    const carpelCount = 7;
    for (let c = 0; c < carpelCount; c++) {
      const cAngle = (c / carpelCount) * Math.PI * 2;
      const cDist = 0.045;
      const dotGeo = new THREE.SphereGeometry(0.007, 6, 6);
      const dotMesh = new THREE.Mesh(dotGeo, this.materials.stem);
      dotMesh.position.set(Math.cos(cAngle) * cDist, Math.sin(cAngle) * cDist, 0.046);
      this.flowerReceptacle.add(dotMesh);
    }

    // Dense crown of 20 golden stamens fringing the lotus torus
    const numStamens = 20;
    for (let i = 0; i < numStamens; i++) {
      const angle = (i / numStamens) * Math.PI * 2;
      const sAnchor = new THREE.Group();
      sAnchor.rotation.z = angle;
      const sHinge = new THREE.Group();
      sAnchor.add(sHinge);

      const filGeo = new THREE.CylinderGeometry(0.002, 0.003, 0.09, 4);
      filGeo.rotateZ(-Math.PI / 2);
      filGeo.translate(0.045, 0, 0.03);
      const filMesh = new THREE.Mesh(filGeo, this.materials.stamen);
      sHinge.add(filMesh);

      const antGeo = new THREE.SphereGeometry(0.009, 6, 6);
      const antMesh = new THREE.Mesh(antGeo, this.materials.stamen);
      antMesh.position.set(0.09, 0, 0.038);
      sHinge.add(antMesh);

      this.flowerReceptacle.add(sAnchor);
      this.mainStamens.push({ hinge: sHinge });
    }

    // 3 Concentric Layers of Broad Cupped Lotus Petals
    // Outer Petals (8 wide lotus rose petals)
    this.buildPetalRing({
      count: 8,
      geom: this.buildLotusPetalGeometry(0.42, 0.16, 0.055),
      mat: this.materials.petalOuter,
      layer: 'outer',
      closedAngleY: 1.15,
      openAngleY: -0.18
    });

    // Mid Petals (8 offset blushing pink petals)
    this.buildPetalRing({
      count: 8,
      offset: 0.5,
      geom: this.buildLotusPetalGeometry(0.34, 0.13, 0.05),
      mat: this.materials.petalMid,
      layer: 'mid',
      closedAngleY: 1.25,
      openAngleY: 0.08
    });

    // Inner Petals (6 sacred translucent ivory petals)
    this.buildPetalRing({
      count: 6,
      offset: 0.25,
      geom: this.buildLotusPetalGeometry(0.25, 0.10, 0.045),
      mat: this.materials.petalInner,
      layer: 'inner',
      closedAngleY: 1.35,
      openAngleY: 0.32
    });
  }

  // 2. FESTIVE INDIAN MARIGOLD (गेंदा - Genda)
  buildMarigoldHead() {
    this.addSepals(8, 0.14, 0.04, 0.015);

    // Central Marigold Fluffy Cushion
    const cushionGeo = new THREE.SphereGeometry(0.065, 14, 14);
    cushionGeo.scale(1.0, 1.0, 0.7);
    const cushionMesh = new THREE.Mesh(cushionGeo, this.materials.petalCore);
    cushionMesh.position.z = 0.02;
    this.flowerReceptacle.add(cushionMesh);

    // 4 Concentric Layers of Ruffled, Wavy Pompom Petals (34 total petals)
    // Tier 1: Outer Saffron Petals (10 ruffled petals)
    this.buildPetalRing({
      count: 10,
      geom: this.buildMarigoldPetalGeometry(0.38, 0.12, 0.038, 4),
      mat: this.materials.petalOuter,
      layer: 'outer',
      closedAngleY: 1.10,
      openAngleY: -0.22
    });

    // Tier 2: Mid-Outer Warm Amber Petals (9 offset ruffled petals)
    this.buildPetalRing({
      count: 9,
      offset: 0.5,
      geom: this.buildMarigoldPetalGeometry(0.32, 0.11, 0.042, 4),
      mat: this.materials.petalMid,
      layer: 'mid',
      closedAngleY: 1.20,
      openAngleY: -0.05
    });

    // Tier 3: Mid-Inner Bright Gold Petals (8 offset ruffled petals)
    this.buildPetalRing({
      count: 8,
      offset: 0.25,
      geom: this.buildMarigoldPetalGeometry(0.24, 0.09, 0.035, 3),
      mat: this.materials.petalInner,
      layer: 'inner',
      closedAngleY: 1.28,
      openAngleY: 0.15
    });

    // Tier 4: Heart Petals (7 dense golden core petals)
    this.buildPetalRing({
      count: 7,
      offset: 0.75,
      geom: this.buildMarigoldPetalGeometry(0.18, 0.075, 0.03, 3),
      mat: this.materials.petalInner,
      layer: 'inner',
      closedAngleY: 1.38,
      openAngleY: 0.38
    });
  }

  // 3. ROYAL SACRED HIBISCUS (गुड़हल - Gudhal / Jaba)
  buildHibiscusHead() {
    this.addSepals(5, 0.18, 0.05, 0.02);

    // Deep Velvet Ruby Center
    const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    eyeGeo.scale(1.0, 1.0, 0.5);
    const eyeMesh = new THREE.Mesh(eyeGeo, this.materials.petalCore);
    eyeMesh.position.z = 0.015;
    this.flowerReceptacle.add(eyeMesh);

    // 5 Massive Flared Crimson Scarlet Petals with delicate rippled margins
    const numPetals = 5;
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const geom = this.buildHibiscusPetalGeometry(0.48, 0.24);
      const mesh = new THREE.Mesh(geom, this.materials.petalOuter);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 1.10,
        openAngleY: -0.25,
        currentAngleY: 1.10
      });
    }

    // ICONIC BOTANICAL FEATURE: Long Projecting Scarlet Staminal Column!
    // Extends 0.22m forward from the center with golden anthers & 5-part stigma pad
    const colGroup = new THREE.Group();
    colGroup.position.set(0, 0, 0.02);
    // Graceful forward reach along +Z
    colGroup.rotation.x = 0.06;

    const colLen = 0.22;
    const colGeo = new THREE.CylinderGeometry(0.009, 0.015, colLen, 8);
    colGeo.rotateX(Math.PI / 2);
    colGeo.translate(0, 0, colLen * 0.5);
    const colMesh = new THREE.Mesh(colGeo, this.materials.scarletColumn);
    colGroup.add(colMesh);

    // Ring of 16 Golden Anthers on Filament Tufts along upper third of column
    const antherRows = 3;
    const perRow = 5;
    for (let r = 0; r < antherRows; r++) {
      const zPos = colLen * (0.62 + r * 0.11);
      for (let a = 0; a < perRow; a++) {
        const aAngle = (a / perRow) * Math.PI * 2 + r * 0.4;
        const antherAnchor = new THREE.Group();
        antherAnchor.position.set(0, 0, zPos);
        antherAnchor.rotation.z = aAngle;

        const filGeo = new THREE.CylinderGeometry(0.0015, 0.002, 0.035, 4);
        filGeo.rotateZ(-Math.PI / 2);
        filGeo.translate(0.018, 0, 0);
        const filMesh = new THREE.Mesh(filGeo, this.materials.scarletColumn);
        antherAnchor.add(filMesh);

        const antGeo = new THREE.SphereGeometry(0.008, 6, 6);
        antGeo.scale(1.2, 0.8, 1);
        const antMesh = new THREE.Mesh(antGeo, this.materials.stamen);
        antMesh.position.set(0.036, 0, 0);
        antherAnchor.add(antMesh);

        colGroup.add(antherAnchor);
      }
    }

    // 5-Lobed Velvet Ruby Stigma Pads at Apex of the Column
    for (let s = 0; s < 5; s++) {
      const sAngle = (s / 5) * Math.PI * 2;
      const padGeo = new THREE.SphereGeometry(0.009, 8, 8);
      padGeo.scale(1.0, 1.2, 0.8);
      const padMesh = new THREE.Mesh(padGeo, this.materials.petalCore);
      padMesh.position.set(Math.cos(sAngle) * 0.016, Math.sin(sAngle) * 0.016, colLen + 0.012);
      colGroup.add(padMesh);
    }

    this.flowerReceptacle.add(colGroup);
    this.staminalColumn = colGroup;
  }

  // 4. ARABIAN JASMINE / MOGRA (मोगरा - Mogra / Chameli)
  buildMograHead() {
    this.addSepals(8, 0.14, 0.03, 0.012);

    // Tender fresh jade-green core pistil
    const coreGeo = new THREE.SphereGeometry(0.05, 12, 12);
    coreGeo.scale(1.0, 1.0, 0.6);
    const coreMesh = new THREE.Mesh(coreGeo, this.materials.petalCore);
    coreMesh.position.z = 0.02;
    this.flowerReceptacle.add(coreMesh);

    // 16 Delicate Starry White Petals in 2 Offset Whorls
    // Outer Whorl (8 starry moonlit white petals)
    this.buildPetalRing({
      count: 8,
      geom: this.buildRadialPetalGeometry(0.36, 0.095, 0.022),
      mat: this.materials.petalOuter,
      layer: 'outer',
      closedAngleY: 1.15,
      openAngleY: -0.14
    });

    // Inner Whorl (8 offset pure ivory petals)
    this.buildPetalRing({
      count: 8,
      offset: 0.5,
      geom: this.buildRadialPetalGeometry(0.28, 0.075, 0.020),
      mat: this.materials.petalInner,
      layer: 'inner',
      closedAngleY: 1.25,
      openAngleY: 0.12
    });

    // 8 Delicate Cream Stamens
    this.addStandardStamens(8, 0.08);
  }

  // 5. FLAME OF THE FOREST / PALASH (पलाश - Palash / Tesu)
  buildPalashHead() {
    // Velvety dark charcoal-crimson calyx cup
    const calyxCupGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.09, 12);
    calyxCupGeo.rotateX(Math.PI / 2);
    const calyxCup = new THREE.Mesh(calyxCupGeo, this.materials.darkCalyx);
    calyxCup.position.z = -0.02;
    this.flowerReceptacle.add(calyxCup);

    // 8 Sickle/Beak Curved Flame Keel Petals
    const numFlame = 8;
    for (let i = 0; i < numFlame; i++) {
      const angle = (i / numFlame) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const geom = this.buildPalashKeelGeometry(0.44, 0.13);
      const mesh = new THREE.Mesh(geom, i % 2 === 0 ? this.materials.petalOuter : this.materials.petalMid);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: i % 2 === 0 ? 'outer' : 'mid',
        closedAngleY: 1.15,
        openAngleY: -0.15,
        currentAngleY: 1.15
      });
    }

    // Arching flame-colored stamens
    this.addStandardStamens(10, 0.11);
  }

  // 6. ROYAL POINCIANA / GULMOHAR (गुलमोहर - Gulmohar)
  buildGulmoharHead() {
    this.addSepals(5, 0.16, 0.04, 0.015);

    // 5 Spreading Flame Petals: 4 scarlet lateral petals + 1 distinctive yellow-spotted banner petal
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const geom = this.buildHibiscusPetalGeometry(0.40, 0.16);
      // Banner petal (topmost, i=0) uses petalInner with sunburst yellow
      const isBanner = i === 0;
      const mat = isBanner ? this.materials.petalInner : this.materials.petalOuter;
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: isBanner ? 'inner' : 'outer',
        closedAngleY: 1.12,
        openAngleY: -0.22,
        currentAngleY: 1.12
      });
    }

    // 10 Long Arching Scarlet-Gold Stamens
    this.addStandardStamens(10, 0.14);
  }

  // 7. TEMPLE FRANGIPANI / CHAMPA (चंपा - Champa)
  buildChampaHead() {
    this.addSepals(5, 0.12, 0.035, 0.01);

    // Golden Sun Center Throat
    const throatGeo = new THREE.SphereGeometry(0.05, 12, 12);
    throatGeo.scale(1.0, 1.0, 0.6);
    const throatMesh = new THREE.Mesh(throatGeo, this.materials.petalCore);
    throatMesh.position.z = 0.02;
    this.flowerReceptacle.add(throatMesh);

    // 5 Thick Velvet Overlapping Pinwheel Petals in a Spiral
    const numPetals = 5;
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const geom = this.buildChampaPetalGeometry(0.40, 0.17);
      const mesh = new THREE.Mesh(geom, this.materials.petalOuter);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: 'outer',
        closedAngleY: 1.18,
        openAngleY: -0.10,
        currentAngleY: 1.18
      });
    }

    this.addStandardStamens(5, 0.06);
  }

  // Default Head Builder (Alpine Iris, etc.)
  buildDefaultHead() {
    this.addSepals(6, 0.16, 0.045, 0.015);

    const corePistilGeo = new THREE.SphereGeometry(0.06, 16, 16);
    corePistilGeo.scale(1.0, 1.0, 0.65);
    const corePistilMesh = new THREE.Mesh(corePistilGeo, this.materials.petalCore);
    corePistilMesh.position.z = 0.02;
    this.flowerReceptacle.add(corePistilMesh);

    this.addStandardStamens(12, 0.11);

    // Outer Petals (7 slender petals)
    this.buildPetalRing({
      count: 7,
      geom: this.buildRadialPetalGeometry(0.44, 0.13, 0.045),
      mat: this.materials.petalOuter,
      layer: 'outer',
      closedAngleY: 1.15,
      openAngleY: -0.15
    });

    // Mid Petals (7 offset petals)
    this.buildPetalRing({
      count: 7,
      offset: 0.5,
      geom: this.buildRadialPetalGeometry(0.34, 0.10, 0.05),
      mat: this.materials.petalInner,
      layer: 'mid',
      closedAngleY: 1.25,
      openAngleY: 0.10
    });

    // Inner Heart Petals (5 petals)
    this.buildPetalRing({
      count: 5,
      offset: 0.25,
      geom: this.buildRadialPetalGeometry(0.23, 0.07, 0.035),
      mat: this.materials.petalCore,
      layer: 'inner',
      closedAngleY: 1.35,
      openAngleY: 0.35
    });
  }

  // --- Helper Methods for Assembling Floral Elements ---
  addSepals(count, length, width, dish) {
    const calyxGroup = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const sepalAnchor = new THREE.Group();
      sepalAnchor.rotation.z = angle;
      const sepalHinge = new THREE.Group();
      sepalHinge.rotation.y = 0.55;
      sepalAnchor.add(sepalHinge);

      const sepalGeom = this.buildRadialPetalGeometry(length, width, dish);
      const sepalMesh = new THREE.Mesh(sepalGeom, this.materials.stem);
      sepalHinge.add(sepalMesh);
      calyxGroup.add(sepalAnchor);
    }
    this.flowerReceptacle.add(calyxGroup);
  }

  addStandardStamens(count, len) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.1;
      const sAnchor = new THREE.Group();
      sAnchor.rotation.z = angle;
      const sHinge = new THREE.Group();
      sAnchor.add(sHinge);

      const filGeo = new THREE.CylinderGeometry(0.0025, 0.004, len, 4);
      filGeo.rotateZ(-Math.PI / 2);
      filGeo.translate(len * 0.5, 0, 0.03);
      const filMesh = new THREE.Mesh(filGeo, this.materials.stem);
      sHinge.add(filMesh);

      const antGeo = new THREE.SphereGeometry(0.011, 6, 6);
      antGeo.scale(1.2, 0.8, 1);
      const antMesh = new THREE.Mesh(antGeo, this.materials.stamen);
      antMesh.position.set(len, 0, 0.038);
      sHinge.add(antMesh);

      this.flowerReceptacle.add(sAnchor);
      this.mainStamens.push({ hinge: sHinge });
    }
  }

  buildPetalRing({ count, offset = 0, geom, mat, layer, closedAngleY, openAngleY }) {
    for (let i = 0; i < count; i++) {
      const angle = ((i + offset) / count) * Math.PI * 2;
      const anchor = new THREE.Group();
      anchor.rotation.z = angle;
      const hinge = new THREE.Group();
      anchor.add(hinge);

      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      hinge.add(mesh);

      this.flowerReceptacle.add(anchor);
      this.mainPetals.push({
        hinge: hinge,
        layer: layer,
        closedAngleY: closedAngleY,
        openAngleY: openAngleY,
        currentAngleY: closedAngleY
      });
    }
  }

  // --- Specific Procedural Geometries for Wild Meadow Flowers ---

  // Periwinkle: 5 Asymmetrical Salverform Propeller Blades with Oblique Swept Skew
  buildPeriwinklePetalGeometry(width = 0.22, length = 0.46, uSegs = 12, vSegs = 16) {
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let v = 0; v <= vSegs; v++) {
      const vNorm = v / vSegs;
      const currentW = width * Math.sin(vNorm * Math.PI * 0.85);

      // Propeller skew: blade sweeps sideways as it extends outward
      const skew = Math.pow(vNorm, 1.4) * (width * 0.45);
      const x = vNorm * length;
      const z = Math.pow(vNorm, 1.6) * 0.08;

      for (let u = 0; u <= uSegs; u++) {
        const uNorm = (u / uSegs) * 2 - 1;
        const y = uNorm * currentW * 0.5 + skew;
        vertices.push(x, y, z);
        uvs.push(vNorm, u / uSegs);
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

  // Poppy: Broad Paper-Thin Crinkled/Ruffled Petal with Harmonic Edge Undulation
  buildPoppyPetalGeometry(width = 0.42, length = 0.56, uSegs = 16, vSegs = 20) {
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let v = 0; v <= vSegs; v++) {
      const vNorm = v / vSegs;
      const currentW = width * (0.15 + 0.85 * Math.sin(Math.pow(vNorm, 0.7) * Math.PI));

      const x = vNorm * length;
      const zBase = Math.pow(vNorm, 1.5) * (length * 0.18);

      for (let u = 0; u <= uSegs; u++) {
        const uNorm = (u / uSegs) * 2 - 1;
        const y = uNorm * currentW * 0.5;

        // Cup curvature across petal width
        const dish = Math.pow(Math.abs(uNorm), 1.8) * (currentW * 0.26);

        // Natural harmonic ruffles/crinkles along outer petal margin
        const ruffles = (vNorm > 0.35)
          ? Math.sin(uNorm * Math.PI * 4.5 + vNorm * 5.0) * (0.024 * vNorm)
          + Math.cos(uNorm * Math.PI * 9.0) * (0.009 * vNorm)
          : 0;

        const z = zBase + dish + ruffles;

        vertices.push(x, y, z);
        uvs.push(vNorm, u / uSegs);
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

  // Chamomile: Slender Radiating Ray Petals with Downward Terminal Reflex
  buildChamomileRayGeometry(width = 0.082, length = 0.44, segs = 14) {
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const w = width * Math.sin(t * Math.PI * 0.9);
      const x = t * length;
      const zArch = -Math.pow(t, 2) * (length * 0.15);

      vertices.push(x, -w * 0.5, zArch);
      uvs.push(t, 0);
      vertices.push(x, w * 0.5, zArch);
      uvs.push(t, 1);
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

  // --- Procedural Petal Geometry Generators for Diverse Indian Flowers ---
  buildRadialPetalGeometry(length, width, dish) {
    const segsLength = 16;
    const segsWidth = 10;
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let il = 0; il <= segsLength; il++) {
      const v = il / segsLength;
      const x = v * length;
      const widthFactor = Math.sin(Math.PI * Math.pow(v, 0.8)) * (1.0 - 0.22 * v);
      const currentWidth = width * (0.05 + 0.95 * widthFactor);

      const dishZ = Math.sin(v * Math.PI) * dish;
      const reflexZ = -Math.pow(v, 1.8) * (dish * 0.5);

      for (let iw = 0; iw <= segsWidth; iw++) {
        const uNorm = (iw / segsWidth) * 2 - 1;
        const y = uNorm * currentWidth * 0.5;
        const cup = (1 - uNorm * uNorm) * dishZ;
        const z = cup + reflexZ;

        vertices.push(x, y, z);
        uvs.push(v, iw / segsWidth);
      }
    }

    for (let il = 0; il < segsLength; il++) {
      for (let iw = 0; iw < segsWidth; iw++) {
        const a = il * (segsWidth + 1) + iw;
        const b = a + 1;
        const c = (il + 1) * (segsWidth + 1) + iw;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Sacred Indian Lotus Spoon Petal (Nelumbo nucifera)
  buildLotusPetalGeometry(length, width, cup) {
    const segsLength = 18;
    const segsWidth = 12;
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let il = 0; il <= segsLength; il++) {
      const v = il / segsLength;
      const x = v * length;
      // Lotus obovate profile: slender base, swells to maximum width at 65% length, tapers to fine tip
      const profile = Math.sin(Math.PI * Math.pow(v, 0.75)) * (0.15 + 0.85 * Math.sin(v * Math.PI * 0.9));
      const currentWidth = width * profile;

      // Lotus boat-keel hollow: deep smooth scoop in middle
      const scoopZ = Math.sin(v * Math.PI * 0.85) * cup;

      for (let iw = 0; iw <= segsWidth; iw++) {
        const uNorm = (iw / segsWidth) * 2 - 1;
        const y = uNorm * currentWidth * 0.5;
        const z = (1 - uNorm * uNorm) * scoopZ;

        vertices.push(x, y, z);
        uvs.push(v, iw / segsWidth);
      }
    }

    for (let il = 0; il < segsLength; il++) {
      for (let iw = 0; iw < segsWidth; iw++) {
        const a = il * (segsWidth + 1) + iw;
        const b = a + 1;
        const c = (il + 1) * (segsWidth + 1) + iw;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Festive Indian Marigold Ruffled Pompom Petal (Tagetes erecta)
  buildMarigoldPetalGeometry(length, width, dish, ruffles = 4) {
    const segsLength = 16;
    const segsWidth = 12;
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let il = 0; il <= segsLength; il++) {
      const v = il / segsLength;
      const x = v * length;
      // Flared spatula shape with scalloped ruffled apex
      const widthFactor = Math.pow(v, 0.65) * (0.2 + 0.8 * Math.sin(v * Math.PI * 0.7));
      const currentWidth = width * widthFactor;

      for (let iw = 0; iw <= segsWidth; iw++) {
        const uNorm = (iw / segsWidth) * 2 - 1;
        const y = uNorm * currentWidth * 0.5;

        // Signature undulating ruffles along the outer petal margin
        const ripple = Math.sin(uNorm * Math.PI * ruffles + v * 2.5) * (dish * 0.7) * v;
        const cup = (1 - uNorm * uNorm) * dish * Math.sin(v * Math.PI);
        const z = cup + ripple;

        vertices.push(x, y, z);
        uvs.push(v, iw / segsWidth);
      }
    }

    for (let il = 0; il < segsLength; il++) {
      for (let iw = 0; iw < segsWidth; iw++) {
        const a = il * (segsWidth + 1) + iw;
        const b = a + 1;
        const c = (il + 1) * (segsWidth + 1) + iw;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Broad Flared Hibiscus Petal with crinkled undulating margin (Hibiscus rosa-sinensis)
  buildHibiscusPetalGeometry(length, width) {
    const segsLength = 16;
    const segsWidth = 14;
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let il = 0; il <= segsLength; il++) {
      const v = il / segsLength;
      const x = v * length;
      // Wide fan-shaped flare
      const currentWidth = width * Math.sin(Math.PI * Math.pow(v, 0.55));

      for (let iw = 0; iw <= segsWidth; iw++) {
        const uNorm = (iw / segsWidth) * 2 - 1;
        const y = uNorm * currentWidth * 0.5;

        // Gentle petal flare dish + delicate crinkles along outer margin
        const dish = (1 - uNorm * uNorm) * 0.035 * Math.sin(v * Math.PI);
        const marginRipples = Math.sin(uNorm * Math.PI * 5) * 0.015 * Math.pow(v, 2.0);
        const reflex = -Math.pow(v, 1.6) * 0.02;
        const z = dish + marginRipples + reflex;

        vertices.push(x, y, z);
        uvs.push(v, iw / segsWidth);
      }
    }

    for (let il = 0; il < segsLength; il++) {
      for (let iw = 0; iw < segsWidth; iw++) {
        const a = il * (segsWidth + 1) + iw;
        const b = a + 1;
        const c = (il + 1) * (segsWidth + 1) + iw;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Curved Flame / Sickle Keel Petal of Palash (Butea monosperma)
  buildPalashKeelGeometry(length, width) {
    const segsLength = 16;
    const segsWidth = 10;
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let il = 0; il <= segsLength; il++) {
      const v = il / segsLength;
      const x = v * length;
      // Beak/sickle taper
      const profile = Math.sin(Math.PI * Math.pow(v, 0.7)) * (1.0 - 0.3 * v);
      const currentWidth = width * profile;

      // Dramatic curved arching keel in Z
      const keelZ = Math.sin(v * Math.PI * 0.8) * (length * 0.28);

      for (let iw = 0; iw <= segsWidth; iw++) {
        const uNorm = (iw / segsWidth) * 2 - 1;
        const y = uNorm * currentWidth * 0.5;
        const curl = (1 - Math.abs(uNorm)) * 0.025;
        const z = keelZ + curl;

        vertices.push(x, y, z);
        uvs.push(v, iw / segsWidth);
      }
    }

    for (let il = 0; il < segsLength; il++) {
      for (let iw = 0; iw < segsWidth; iw++) {
        const a = il * (segsWidth + 1) + iw;
        const b = a + 1;
        const c = (il + 1) * (segsWidth + 1) + iw;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Thick Velvet Spiral Pinwheel Petal of Champa / Frangipani (Plumeria)
  buildChampaPetalGeometry(length, width) {
    const segsLength = 16;
    const segsWidth = 10;
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let il = 0; il <= segsLength; il++) {
      const v = il / segsLength;
      const x = v * length;
      // Rounded paddle shape
      const profile = Math.sin(Math.pow(v, 0.6) * Math.PI);
      const currentWidth = width * profile;

      for (let iw = 0; iw <= segsWidth; iw++) {
        const uNorm = (iw / segsWidth) * 2 - 1;
        const y = uNorm * currentWidth * 0.5;

        // Characteristic spiral twist of pinwheel petals
        const spiralTwist = uNorm * v * 0.035;
        const cup = (1 - uNorm * uNorm) * 0.02 * Math.sin(v * Math.PI);
        const z = cup + spiralTwist;

        vertices.push(x, y, z);
        uvs.push(v, iw / segsWidth);
      }
    }

    for (let il = 0; il < segsLength; il++) {
      for (let iw = 0; iw < segsWidth; iw++) {
        const a = il * (segsWidth + 1) + iw;
        const b = a + 1;
        const c = (il + 1) * (segsWidth + 1) + iw;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  setPosition(x, y, z) {
    this.basePosition.set(x, y, z);
    this.group.position.copy(this.basePosition);
  }

  setRotationY(rad) {
    this.baseRotation.y = rad;
    this.group.rotation.copy(this.baseRotation);
  }

  setScale(s) {
    this.baseScale.set(s, s, s);
    this.group.scale.copy(this.baseScale);
  }

  triggerGust() {
    this.gustImpulse = 0.45;
  }

  update(kinematics, dt) {
    this.idleTime += dt;

    // Decay wind gust impulse
    this.gustImpulse *= Math.exp(-dt * 2.5);

    // Natural gentle breathing wind oscillation
    const breath = Math.sin(this.idleTime * 1.5) * 0.025;
    const windNoise = breath + Math.cos(this.idleTime * 0.8) * 0.015 + this.gustImpulse;

    // 1. Ground mound & root base anchored at designated base coordinates
    this.group.position.copy(this.basePosition);
    this.group.rotation.copy(this.baseRotation);
    this.group.scale.copy(this.baseScale);

    this.currentLegLiftL = THREE.MathUtils.lerp(this.currentLegLiftL, kinematics.legLiftL || 0, 0.15);
    this.currentLegLiftR = THREE.MathUtils.lerp(this.currentLegLiftR, kinematics.legLiftR || 0, 0.15);

    // Root tendrils: stay 100% flat on the earth (ground never swells or lifts)
    if (this.rootSpursL) {
      this.rootSpursL.forEach((spur) => {
        spur.pivot.rotation.x = 0;
        spur.pivot.rotation.z = 0;
        spur.pivot.position.set(0, 0.005, 0);
      });
    }

    if (this.rootSpursR) {
      this.rootSpursR.forEach((spur) => {
        spur.pivot.rotation.x = 0;
        spur.pivot.rotation.z = 0;
        spur.pivot.position.set(0, 0.005, 0);
      });
    }

    // Stem dynamically balances on grounded side from the stem segments above ground, keeping ground motionless
    const legTiltZ = (this.currentLegLiftL - this.currentLegLiftR) * 0.18;

    // 2. Sideways swaying & Forward/Back Bending: Direct 1-to-1 tracking
    const shiftBendX = (kinematics.bodyShiftX || 0) * 0.70;
    const leanBendX = (kinematics.spineLeanX || 0) * 0.95;
    const rawBendX = THREE.MathUtils.clamp(shiftBendX + leanBendX, -1.2, 1.2);
    // Forward bow (+) and backward arch (-) depth pitch
    const rawBendZ = THREE.MathUtils.clamp(kinematics.spineLeanZ || 0, -1.0, 1.0);

    // Responsive lerp so flower follows body directly with zero sluggishness
    this.currentLeanX = THREE.MathUtils.lerp(this.currentLeanX, rawBendX, 0.24);
    this.currentLeanZ = THREE.MathUtils.lerp(this.currentLeanZ, rawBendZ, 0.22);

    const totalSwayX = this.currentLeanX * 1.25 + windNoise * 0.08;
    // Bending full front curves full flower front; bending full back arches full flower back
    const totalSwayZ = this.currentLeanZ * 1.45;

    let cumRotZ = 0;
    let cumRotX = 0;
    // Flower height ONLY stretches UP (1.0 to 1.35x); hands down never shrinks stem below 1.0
    const targetHeight = THREE.MathUtils.clamp(kinematics.heightFactor || 1.0, 1.0, 1.35);
    this.currentHeight = THREE.MathUtils.lerp(this.currentHeight || 1.0, targetHeight, 0.18);
    const scaledSegHeight = this.segmentHeight * this.currentHeight;

    this.segments.forEach((segObj, i) => {
      const seg = segObj.group;
      const mesh = segObj.mesh;

      if (i > 0) {
        seg.position.y = scaledSegHeight;
      }
      mesh.scale.y = this.currentHeight;
      mesh.scale.x = 1.0;
      mesh.scale.z = 1.0;

      const bendProgress = (i + 1) / this.numSegments;
      // Progressive curve from base upward; base stays anchored flush at ground
      const flexFactor = i === 0 ? 0.15 : (0.55 + 0.95 * bendProgress);
      const segLegTilt = i === 0 ? 0 : (legTiltZ / (this.numSegments - 1));
      const segAngleZ = -(totalSwayX / this.numSegments) * flexFactor + segLegTilt;
      const segAngleX = (totalSwayZ / this.numSegments) * flexFactor;

      seg.rotation.z = segAngleZ;
      seg.rotation.x = segAngleX;
      cumRotZ += segAngleZ;
      cumRotX += segAngleX;
    });

    // 3. Arm Gestures: Hands UP = Branches UP, Hands DOWN = Branches DOWN only, Hands STRETCHED OUT = Branches STRETCH OUT
    this.currentArmL = THREE.MathUtils.lerp(this.currentArmL, kinematics.armHeightL !== undefined ? kinematics.armHeightL : 0.45, 0.22);
    this.currentArmR = THREE.MathUtils.lerp(this.currentArmR, kinematics.armHeightR !== undefined ? kinematics.armHeightR : 0.45, 0.22);
    this.currentArmExtL = THREE.MathUtils.lerp(this.currentArmExtL, kinematics.armExtensionL || 0, 0.22);
    this.currentArmExtR = THREE.MathUtils.lerp(this.currentArmExtR, kinematics.armExtensionR || 0, 0.22);
    this.currentArmStretchUp = THREE.MathUtils.lerp(this.currentArmStretchUp, kinematics.armStretchUp || 0, 0.22);

    this.branchlets.forEach((b, idx) => {
      const isLeft = b.side === -1;
      const armElev = isLeft ? this.currentArmL : this.currentArmR;
      const armExt = isLeft ? this.currentArmExtL : this.currentArmExtR;

      // 1) Vertical arm drive:
      // armElev ~ 0.0 (hands straight down) -> verticalLiftDrive ~ -1.0 (branches droop down toward soil)
      // armElev ~ 0.48 (neutral) -> verticalLiftDrive ~ 0.0
      // armElev ~ 1.2+ (hands straight up) -> verticalLiftDrive ~ +1.0 to 1.3 (branches reach up to heavens)
      const verticalLiftDrive = THREE.MathUtils.clamp((armElev - 0.48) / 0.50, -1.0, 1.4);

      // 2) Lateral arm drive (hands stretched out horizontally / wingspan):
      const wingspanRatio = kinematics.wingspanSpread ?? 0;
      const spreadDrive = THREE.MathUtils.clamp(armExt * 0.75 + wingspanRatio * 0.75, 0.0, 1.6);

      // Branch length physically stretches out when spreading arms
      const stretchReach = 1.0 + spreadDrive * 0.60;
      b.pivot.scale.set(stretchReach, stretchReach, stretchReach);

      const flutter = Math.sin(this.idleTime * 2.5 + idx * 1.5) * 0.025 + (kinematics.energy ?? 0) * 0.06;

      let targetZ = b.baseAngleZ;
      let targetX = b.baseAngleX + flutter;

      if (isLeft) {
        // Left branch (baseAngleZ -0.52): facing upward-left
        // Reaching up angles up towards -0.26, resting stays at gentle upward angle (never horizontal)
        const upDownZ = verticalLiftDrive > 0 ? (verticalLiftDrive * 0.22) : (verticalLiftDrive * 0.12);
        const spreadZ = -spreadDrive * 0.20;
        targetZ = Math.min(-0.26, Math.max(-0.64, b.baseAngleZ + upDownZ + spreadZ));
        b.pivot.rotation.z = targetZ;
      } else {
        // Right branch (baseAngleZ +0.62): facing upward-right at slightly different angle
        // Reaching up angles up towards +0.32, resting stays at gentle upward angle (never horizontal)
        const upDownZ = verticalLiftDrive > 0 ? (-verticalLiftDrive * 0.22) : (-verticalLiftDrive * 0.12);
        const spreadZ = spreadDrive * 0.20;
        targetZ = Math.max(0.32, Math.min(0.72, b.baseAngleZ + upDownZ + spreadZ));
        b.pivot.rotation.z = targetZ;
      }

      // Gentle forward inclination
      if (verticalLiftDrive < 0) {
        targetX += (-verticalLiftDrive) * 0.12;
      }
      b.pivot.rotation.x = targetX;

      // Branch tip floret: angles down when hands down, looks up to sky when hands up
      if (b.floretGroup) {
        b.floretGroup.rotation.x = Math.PI * 0.32 - verticalLiftDrive * 0.50;
      }
    });

    // 4. Flower Head: Gracefully follows stem curve (full front when bowing front, full back when arching back)
    const skyTilt = this.currentArmStretchUp * 0.35;

    this.neckGroup.position.y = scaledSegHeight;
    this.neckGroup.rotation.z = THREE.MathUtils.lerp(this.neckGroup.rotation.z, -cumRotZ * 0.25, 0.15);
    this.neckGroup.rotation.x = THREE.MathUtils.lerp(
      this.neckGroup.rotation.x,
      this.baseNeckAngleX + cumRotX * 0.40 - skyTilt,
      0.15
    );

    const armTiltZ = (this.currentArmExtL - this.currentArmExtR) * 0.22;
    const gazeX = THREE.MathUtils.clamp(kinematics.headGazeX || 0, -0.8, 0.8);
    const gazeY = THREE.MathUtils.clamp(kinematics.headGazeY || 0, -0.8, 0.8);

    this.flowerReceptacle.rotation.z = THREE.MathUtils.lerp(this.flowerReceptacle.rotation.z, armTiltZ, 0.12);
    this.flowerReceptacle.rotation.y = THREE.MathUtils.lerp(this.flowerReceptacle.rotation.y, gazeX * 0.38, 0.1);
    this.flowerReceptacle.rotation.x = THREE.MathUtils.lerp(this.flowerReceptacle.rotation.x, -gazeY * 0.22, 0.1);

    // Subtle sway on Hibiscus staminal column
    if (this.staminalColumn) {
      const colSwayX = Math.sin(this.idleTime * 2.0) * 0.04 + totalSwayX * 0.1;
      const colSwayY = Math.cos(this.idleTime * 1.8) * 0.03;
      this.staminalColumn.rotation.y = colSwayX;
      this.staminalColumn.rotation.x = 0.06 + colSwayY;
    }

    // 5. Blooming Petals Aperture
    // Directly governed by master kinematics.bloomRatio (body straightness, hands up/down, wingspan)
    const targetBloom = THREE.MathUtils.clamp(kinematics.bloomRatio !== undefined ? kinematics.bloomRatio : 0.65, 0.04, 1.0);
    this.currentBloom = THREE.MathUtils.lerp(this.currentBloom, targetBloom, 0.15);

    this.petals.forEach((p) => {
      let layerBloom = this.currentBloom;
      if (p.layer === 'inner') {
        layerBloom = Math.max(0, (this.currentBloom - 0.12) / 0.88);
      } else if (p.layer === 'mid') {
        layerBloom = Math.max(0, (this.currentBloom - 0.06) / 0.94);
      } else if (p.layer === 'floretInner') {
        layerBloom = Math.max(0, (this.currentBloom - 0.08) / 0.92);
      } else if (p.layer === 'floretOuter') {
        layerBloom = Math.max(0, (this.currentBloom - 0.03) / 0.97);
      }

      const targetAngleY = THREE.MathUtils.lerp(p.closedAngleY, p.openAngleY, layerBloom);
      p.currentAngleY = THREE.MathUtils.lerp(p.currentAngleY, targetAngleY, 0.15);
      p.hinge.rotation.y = -p.currentAngleY;
    });

    // Stamens spread and emerge with full bloom
    this.stamens.forEach((stamen) => {
      stamen.hinge.rotation.y = THREE.MathUtils.lerp(0.35, -0.15, this.currentBloom);
    });

    // Core light glow intensifies as bloom opens, multiplying with sky reach
    if (this.coreLight) {
      const glowMultiplier = 1.0 + this.currentArmStretchUp * 0.8;
      this.coreLight.intensity = THREE.MathUtils.lerp(0.8, (this.species.glowIntensity || 2.4) * glowMultiplier, this.currentBloom);
    }
    this.materials.stamen.emissiveIntensity = THREE.MathUtils.lerp(0.3, 1.4, this.currentBloom);
  }
}
