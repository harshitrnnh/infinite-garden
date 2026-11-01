import * as THREE from 'three';
import { MeadowScene } from './meadow-scene.js';
import { PoeticFlower, MEADOW_PALETTES } from './poetic-flower.js';
import {
  PoppyMorphology,
  PeriwinkleMorphology,
  ChamomileMorphology,
  MeadowChaliceMorphology,
  MarigoldMorphology,
  LotusMorphology,
  HibiscusMorphology
} from './flower-geometries.js';
import { WildGrassesField } from './wild-grasses.js';
import { CHOREOGRAPHY_PRESETS } from './choreography-simulator.js';
import { FlowerLabelSystem, resetNameDeck, nextName } from './flower-labels.js';
import { InstancedBotanicalMeadow } from './instanced-meadow.js';
import { subscribeToNewBlooms, fetchCloudChoreographies } from '../supabase.js';
import { MeadowButterflies } from './butterflies.js';

/**
 * PlantedChoreographyFlower
 * Renders a flower planted by a visitor during the webcam choreography session.
 * Faithfully loops and animates the recorded human dance frames!
 */
class PlantedChoreographyFlower {
  constructor(data, pos = { x: 0, z: 0 }, isHero = false) {
    this.isPlanted = data.isPlanted !== undefined ? data.isPlanted : true;
    this.data = data;
    this.id = data.id || ('flower_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));
    this.name = data.name || 'Sacred Meadow Bloom';
    this.choreographer = data.choreographer || 'Anonymous Choreographer';
    this.species = (data.species || 'periwinkle').toLowerCase();
    this.frames = data.frames || [];
    this.duration = data.duration > 0 ? data.duration : 10.0;
    this.playbackTime = Math.random() * this.duration; // Natural staggered phase offset
    this.seed = Math.random() * 100;
    this.isHero = isHero;

    // Instantiate bespoke morphology matching the user's chosen species
    if (this.species === 'poppy') {
      this.morphology = new PoppyMorphology();
    } else if (this.species === 'chamomile') {
      this.morphology = new ChamomileMorphology();
    } else if (this.species === 'champa' || this.species === 'meadow' || this.species === 'chalice') {
      this.morphology = new MeadowChaliceMorphology();
    } else if (this.species === 'marigold' || this.species === 'celadon') {
      this.morphology = new MarigoldMorphology();
    } else if (this.species === 'lotus') {
      this.morphology = new LotusMorphology();
    } else if (this.species === 'hibiscus') {
      this.morphology = new HibiscusMorphology();
    } else {
      this.morphology = new PeriwinkleMorphology();
    }

    // Recreate any extra branches sprouted via Namaste gesture (before or during recording)!
    const extraBranches = data.namasteBranchCount || data.extraBranches ||
      (Array.isArray(this.frames) && this.frames.length > 0
        ? Math.max(0, ...this.frames.map(f => f.namasteBranchCount || 0))
        : 0);

    if (extraBranches > 0 && this.morphology && this.morphology.stem && typeof this.morphology.stem.sproutNamasteBranch === 'function') {
      for (let b = 0; b < extraBranches; b++) {
        this.morphology.stem.sproutNamasteBranch(true);
      }
    }

    this.group = this.morphology.group;
    const s = (data.scale || 1.0) * (isHero ? 1.15 : 1.02);
    this.group.scale.set(s, s, s);
    this.group.position.set(pos.x, 0, pos.z);
    if (data.rotationY !== undefined) {
      this.group.rotation.y = data.rotationY;
    }

    this.lastKinematics = null;
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

  dispose() {
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }

  applyKinematics(kinematics, dt = 0.016) {
    if (this.morphology && typeof this.morphology.applyKinematics === 'function') {
      this.morphology.applyKinematics(kinematics, dt);
      this.lastKinematics = kinematics;
    }
  }

  /**
   * Continuous smooth playback of recorded visitor choreography or procedural breath
   */
  updatePlayback(dt = 0.016) {
    if (!this.frames || this.frames.length === 0) {
      // Procedural natural swaying & breathing for unrecorded meadow blooms
      this.playbackTime += dt;
      const t = this.playbackTime * 0.85 + this.seed;
      const swayX = Math.sin(t * 0.8) * 0.12 + Math.sin(t * 1.5) * 0.04;
      const swayZ = Math.cos(t * 0.65) * 0.09 + Math.cos(t * 1.3) * 0.03;
      const bloom = 0.58 + Math.sin(t * 0.45) * 0.18;
      const height = 0.98 + Math.sin(t * 0.35) * 0.03;
      const k = {
        spineLeanX: swayX,
        spineLeanZ: swayZ,
        bodyShiftX: swayX * 0.3,
        heightFactor: height,
        bloomRatio: bloom,
        armHeightL: 0.45 + Math.sin(t * 0.5) * 0.08,
        armHeightR: 0.45 + Math.cos(t * 0.5) * 0.08,
        wingspanSpread: 0.5,
        postureDesc: `🌱 ${this.name} • Botanical Meadow Bloom`
      };
      this.morphology.applyKinematics(k, dt);
      this.lastKinematics = k;
      return k;
    }

    this.playbackTime = (this.playbackTime + dt) % this.duration;
    const totalFrames = this.frames.length;
    const exactIndex = THREE.MathUtils.clamp((this.playbackTime / this.duration) * totalFrames, 0, totalFrames - 0.001);
    const idxA = Math.floor(exactIndex) % totalFrames;
    const idxB = (idxA + 1) % totalFrames;
    const blend = exactIndex - Math.floor(exactIndex);

    const frameA = this.frames[idxA] || this.frames[0] || {};
    const frameB = this.frames[idxB] || frameA;

    const interpolated = {
      spineLeanX: THREE.MathUtils.lerp(frameA.spineLeanX ?? 0, frameB.spineLeanX ?? 0, blend),
      spineLeanZ: THREE.MathUtils.lerp(frameA.spineLeanZ ?? 0, frameB.spineLeanZ ?? 0, blend),
      bodyShiftX: THREE.MathUtils.lerp(frameA.bodyShiftX ?? 0, frameB.bodyShiftX ?? 0, blend),
      heightFactor: THREE.MathUtils.lerp(frameA.heightFactor ?? 1.0, frameB.heightFactor ?? 1.0, blend),
      bloomRatio: THREE.MathUtils.lerp(frameA.bloomRatio ?? 0.65, frameB.bloomRatio ?? 0.65, blend),
      armHeightL: THREE.MathUtils.lerp(frameA.armHeightL ?? 0.48, frameB.armHeightL ?? 0.48, blend),
      armHeightR: THREE.MathUtils.lerp(frameA.armHeightR ?? 0.48, frameB.armHeightR ?? 0.48, blend),
      wingspanSpread: THREE.MathUtils.lerp(frameA.wingspanSpread ?? 0.5, frameB.wingspanSpread ?? 0.5, blend),
      legSpreadL: THREE.MathUtils.lerp(frameA.legSpreadL ?? 0, frameB.legSpreadL ?? 0, blend),
      legSpreadR: THREE.MathUtils.lerp(frameA.legSpreadR ?? 0, frameB.legSpreadR ?? 0, blend),
      postureDesc: `🌱 ${this.name} • Recorded Dance by ${this.choreographer}`
    };

    this.morphology.applyKinematics(interpolated, dt);
    this.lastKinematics = interpolated;
    return interpolated;
  }

  updateRandom(time, windStrength, speedMultiplier = 1.0) {
    return this.updatePlayback(0.016 * speedMultiplier);
  }

  update(time, windStrength) {
    return this.updatePlayback(0.016);
  }

  applyKinematics(kinematics, dt) {
    if (this.morphology.applyKinematics) {
      this.morphology.applyKinematics(kinematics, dt);
    }
  }

  setWireframe(wire) {
    if (this.morphology.setWireframe) {
      this.morphology.setWireframe(wire);
    }
  }
}

class MeadowVisualLab {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.sceneEnv = new MeadowScene(this.container);

    this.flowers = [];
    this.wildGrasses = null;
    this.labelSystem = null;
    this.butterflies = null;
    this.instancedMeadow = new InstancedBotanicalMeadow(this.sceneEnv.scene);
    this.flowerNames = [];  // parallel array to this.flowers
    this.windStrength = 1.0;
    this.currentHeroPalette = 'periwinkle';
    this.flowerCount = 50; // Default to 50 simulated flowers

    // Choreography Simulation State
    this.currentDanceId = 'random100'; // Default to 100 Random Dancers!
    this.isPlaying = true;
    this.danceTime = 0;
    this.danceSpeed = 1.0;
    this.isChorusMode = false;

    // Performance Monitoring State
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.currentFps = 60;
    this.currentMs = 16.6;

    // Active Spotlight Focus Timer & Glow Object
    this.spotlightTimeout = null;
    this.spotlightLight = null;
    this.activeCelebratedFlower = null;

    // Search Multi-Match Cycling State
    this.searchMatches = [];
    this.searchMatchIndex = 0;

    this.initMeadow(this.flowerCount);
    this.initControls();
    this.initSearch();
    this.initCommunalSync();
    this.startLoop();
  }

  getUserPlantedFlowers() {
    const list = [];
    const seen = new Set();

    // 1. Dedicated user plants key
    try {
      const dedicated = JSON.parse(localStorage.getItem('botanical_garden_user_plants') || '[]');
      if (Array.isArray(dedicated)) {
        dedicated.forEach(f => {
          const key = f.id || f.name;
          if (f && f.name && !seen.has(key)) {
            seen.add(key);
            list.push(f);
          }
        });
      }
    } catch (_) {}

    // 2. Communal storage list (botanical_garden_choreographies_v4)
    try {
      const communal = JSON.parse(localStorage.getItem('botanical_garden_choreographies_v4') || '[]');
      if (Array.isArray(communal)) {
        communal.forEach(f => {
          const key = f.id || f.name;
          if (f && f.id && f.id.startsWith('flower_') && !seen.has(key)) {
            seen.add(key);
            list.push(f);
          }
        });
      }
    } catch (_) {}

    return list;
  }

  initMeadow(count = 50) {
    this.flowerCount = count;

    // Reset name deck so every initMeadow gets a fresh deterministic shuffle
    resetNameDeck();

    // 1. Add Surrounding Wild Grasses & Dry Wheat Awns
    if (!this.wildGrasses) {
      this.wildGrasses = new WildGrassesField(this.sceneEnv.scene, 950, 14.5);
    }

    // 1b. Add Living Procedural Butterflies fluttering through meadow
    if (!this.butterflies) {
      this.butterflies = new MeadowButterflies(
        this.sceneEnv.scene,
        () => this.flowers,
        (x, z) => this.getTerrainHeight(x, z),
        8
      );
    }

    // Reset label system (hidden by default)
    if (!this.labelSystem) {
      this.labelSystem = new FlowerLabelSystem(
        this.sceneEnv.scene,
        this.sceneEnv.camera,
        this.container
      );
    }
    this.labelSystem.setVisible(false);

    // Clean up any existing flowers & their labels
    this.flowers.forEach(f => {
      if (f.group && f.group.children) {
        f.group.children
          .filter(c => c.isCSS2DObject)
          .forEach(c => f.group.remove(c));
      }
      if (typeof f.dispose === 'function') f.dispose();
    });
    this.flowers = [];
    this.labelSystem.labels = [];

    if (this.instancedMeadow) {
      this.instancedMeadow.clear();
    }

    // Terrain elevation function matching meadow-scene.js ground plane
    const getTerrainY = (x, z) => this.getTerrainHeight(x, z);

    // Dynamic field radius based on requested density (46m for 2,000 flowers!)
    const maxGladeRadius = count > 500 ? 46.0 : (count > 200 ? 25.0 : 12.5);

    // High-performance spatial grid for O(1) clearance & collision testing
    const cellSize = 3.0;
    const grid = new Map();
    const getGridKey = (gx, gz) => `${gx}_${gz}`;
    const insertGrid = (pos) => {
      const gx = Math.floor(pos.x / cellSize);
      const gz = Math.floor(pos.z / cellSize);
      const key = getGridKey(gx, gz);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(pos);
    };

    const isPositionClear = (x, z, reqDist) => {
      // Keep clear of initial camera corridor (0.3, 1.8)
      if (Math.hypot(x - 0.3, z - 1.8) < 1.4) return false;
      // Keep strictly within glade radius bounds
      if (Math.hypot(x, z) > maxGladeRadius) return false;

      const gx = Math.floor(x / cellSize);
      const gz = Math.floor(z / cellSize);
      const reqSq = reqDist * reqDist;

      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cell = grid.get(getGridKey(gx + dx, gz + dz));
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              const px = cell[i].x;
              const pz = cell[i].z;
              if ((x - px) * (x - px) + (z - pz) * (z - pz) < reqSq) {
                return false;
              }
            }
          }
        }
      }
      return true;
    };

    // 1. Place visitor-planted flowers first, spread across the 2D area in 360 degrees
    const userPlanted = this.getUserPlantedFlowers();
    userPlanted.forEach((pData, idx) => {
      let slot = null;
      for (let r = 2.4; r <= 24.0 && !slot; r += 0.5) {
        const step = Math.max(0.12, 2.5 / r);
        const phase = (idx * 2.39996) % (Math.PI * 2);
        for (let th = 0; th < Math.PI * 2; th += step) {
          const ang = th + phase;
          const x = Math.cos(ang) * r;
          const z = Math.sin(ang) * r;
          if (isPositionClear(x, z, 2.5)) {
            slot = { x: Number(x.toFixed(3)), z: Number(z.toFixed(3)) };
            break;
          }
        }
      }
      if (!slot) {
        slot = this.findClearPlantedSlot(2.5);
      }

      insertGrid(slot);
      const groundY = getTerrainY(slot.x, slot.z);

      const plantedFlower = new PlantedChoreographyFlower(pData, slot, idx === 0);
      plantedFlower.setPosition(slot.x, groundY, slot.z);
      this.sceneEnv.scene.add(plantedFlower.group);
      this.flowers.push(plantedFlower);

      if (this.labelSystem) {
        this.labelSystem.addLabel(plantedFlower.group, pData.name, {
          choreographer: pData.choreographer,
          species: pData.species,
          isPlanted: true
        });
      }
    });

    // 2. Compose procedural meadow flowers with all 7 bespoke botanical morphologies:
    // Lotus, Hibiscus, Marigold, Chamomile Wheat, Meadow Chalice, Poppy, Periwinkle
    const SPECIES_PALETTE = [
      'lotus',
      'hibiscus',
      'marigold',
      'chamomile',
      'meadow',
      'poppy',
      'periwinkle'
    ];

    // For 2,000 flowers:
    // First 70 flowers are full articulated skeletons (hero glade)
    // Remaining ~1,930 flowers use high-performance instanced botanical rendering (60 FPS!)
    const numArticulated = count <= 150 ? count : 70;
    const instancedList = [];

    // 3. True 2D Area Golden-Angle Distribution across the vast meadow
    const goldenAngle = 2.39996323;
    let attempt = 0;
    let ring = 0;
    const maxAttempts = count * 2200;

    while (this.flowers.length < count && attempt < maxAttempts) {
      attempt++;
      ring++;

      const progress = this.flowers.length / count;
      // Area-uniform radial expansion from 1.6m out to maxGladeRadius
      const baseRadius = 1.60 + Math.sqrt(progress) * (maxGladeRadius - 1.60);
      const radius = baseRadius + (Math.sin(ring * 1.8) * 0.45);
      const angle = ring * goldenAngle + (Math.cos(ring * 2.3) * 0.30);

      const r = Math.max(1.4, Math.min(maxGladeRadius, radius + (Math.random() - 0.5) * 0.35));
      const theta = angle + (Math.random() - 0.5) * 0.25;

      // Full 360-degree 2D area coverage across ALL sides of the rolling landscape
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Guaranteed non-intersection clearance:
      // Inner glade has generous clearance; outer vast field maintains strict 0.95m clearance
      const reqDist = count > 500 ? (r < 8.0 ? 1.45 : (r < 22.0 ? 1.15 : 0.95)) : 1.85;

      if (isPositionClear(x, z, reqDist)) {
        insertGrid({ x, z });

        const flowerIdx = this.flowers.length;
        const species = SPECIES_PALETTE[flowerIdx % SPECIES_PALETTE.length];
        const groundY = getTerrainY(x, z);
        const scale = 0.85 + (Math.cos(flowerIdx * 2.1) * 0.5 + 0.5) * 0.25;
        const flowerName = nextName() || `Meadow Bloom ${flowerIdx + 1}`;

        if (flowerIdx < numArticulated) {
          // Foreground articulated skeleton flower
          const flower = new PlantedChoreographyFlower({
            name: flowerName,
            choreographer: 'Devcon Botanical Lab',
            species: species,
            isPlanted: false,
            scale: scale,
            duration: 10.0,
            fps: 20
          }, { x, z }, false);

          flower.setPosition(x, groundY, z);
          flower.setRotationY(flowerIdx * 1.37);
          this.sceneEnv.scene.add(flower.group);
          this.flowers.push(flower);

          if (this.labelSystem) {
            this.labelSystem.addLabel(flower.group, flowerName, {
              choreographer: 'Devcon Botanical Lab',
              species: species,
              isPlanted: false
            });
          }
        } else {
          // Instanced botanical flower definition
          const instData = {
            name: flowerName,
            species: species,
            choreographer: 'Devcon Community Glade',
            x,
            y: groundY,
            z,
            scale,
            rotationY: flowerIdx * 1.37
          };
          instancedList.push(instData);

          // Lightweight proxy so search & stats track all 2,000 flowers
          this.flowers.push({
            id: `inst_${flowerIdx}`,
            name: flowerName,
            species: species,
            choreographer: 'Devcon Community Glade',
            isPlanted: false,
            isInstanced: true,
            position: { x, y: groundY, z },
            scale,
            rotationY: flowerIdx * 1.37,
            updatePlayback: () => {},
            applyKinematics: () => {},
            updateRandom: () => {},
            update: () => {}
          });
        }
      }
    }

    // Populate the high-performance instanced botanical sea
    if (instancedList.length > 0 && this.instancedMeadow) {
      this.instancedMeadow.populate(instancedList);
    }

    this.heroFlower = this.flowers[0] || null;

    // Rebuild quick select chips to include planted flowers
    this.updateQuickSelectChips();

    // Search placeholder remains static to illustrate search functionality
    const searchInput = document.getElementById('flower-search-input');
    if (searchInput) {
      searchInput.placeholder = 'Search your flower- e.g bloom trail';
    }
  }

  updateQuickSelectChips() {
    const container = document.getElementById('flower-quick-select');
    if (!container) return;
    container.innerHTML = '';
  }

  /**
   * Terrain elevation function matching meadow-scene.js ground plane.
   */
  getTerrainHeight(x, z) {
    return Math.sin(x * 0.25) * Math.cos(z * 0.25) * 0.35 +
           Math.sin(x * 0.08 + z * 0.08) * 0.40 -
           Math.hypot(x, z) * 0.006;
  }

  /**
   * Generates a luminous, feathered full 360° circle ring texture for the flower ground highlight.
   */
  getRingTexture() {
    if (this._cachedRingTexture) return this._cachedRingTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256;
    const cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    // 1. Soft atmospheric light halo
    const haloGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, 250);
    haloGrad.addColorStop(0, 'rgba(255, 245, 200, 0)');
    haloGrad.addColorStop(0.5, 'rgba(255, 230, 150, 0.08)');
    haloGrad.addColorStop(0.72, 'rgba(255, 215, 120, 0.35)');
    haloGrad.addColorStop(0.82, 'rgba(255, 245, 210, 0.75)');
    haloGrad.addColorStop(0.90, 'rgba(255, 215, 120, 0.35)');
    haloGrad.addColorStop(1, 'rgba(255, 215, 120, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 250, 0, Math.PI * 2);
    ctx.fill();

    // 2. Crisp, luminous full-circle ring core
    ctx.beginPath();
    ctx.arc(cx, cy, 205, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(255, 250, 230, 0.95)';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 16;
    ctx.stroke();

    this._cachedRingTexture = new THREE.CanvasTexture(canvas);
    return this._cachedRingTexture;
  }

  /**
   * Generates a smooth, feathered radial gradient canvas texture for the celestial glow aura.
   */
  getGlowSpriteTexture() {
    if (this._glowSpriteTexture) return this._glowSpriteTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 126);
    // Warm ethereal golden-ivory glow with soft botanical falloff
    grad.addColorStop(0, 'rgba(255, 252, 235, 0.72)');
    grad.addColorStop(0.22, 'rgba(255, 230, 160, 0.42)');
    grad.addColorStop(0.55, 'rgba(235, 195, 110, 0.13)');
    grad.addColorStop(0.82, 'rgba(210, 170, 90, 0.03)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    this._glowSpriteTexture = new THREE.CanvasTexture(canvas);
    return this._glowSpriteTexture;
  }

  /**
   * Cleanly disposes and clears all active flower spotlight and glow meshes.
   */
  clearFlowerHighlight() {
    if (this.spotlightTimeout) {
      clearTimeout(this.spotlightTimeout);
      this.spotlightTimeout = null;
    }
    if (this.spotlightLight) {
      this.sceneEnv.scene.remove(this.spotlightLight);
      if (this.spotlightLight.dispose) this.spotlightLight.dispose();
      this.spotlightLight = null;
    }
    if (this.glowSprite) {
      this.sceneEnv.scene.remove(this.glowSprite);
      if (this.glowSprite.material) this.glowSprite.material.dispose();
      this.glowSprite = null;
    }
    if (this.groundRing) {
      this.sceneEnv.scene.remove(this.groundRing);
      if (this.groundRing.geometry) this.groundRing.geometry.dispose();
      if (this.groundRing.material) this.groundRing.material.dispose();
      this.groundRing = null;
    }
    if (this.glowMesh) {
      this.sceneEnv.scene.remove(this.glowMesh);
      if (this.glowMesh.geometry) this.glowMesh.geometry.dispose();
      if (this.glowMesh.material) this.glowMesh.material.dispose();
      this.glowMesh = null;
    }
    document.querySelectorAll('.flower-name-tag.tag-celebrate-glow').forEach((el) => {
      el.classList.remove('tag-celebrate-glow');
    });
    this.activeCelebratedFlower = null;
  }

  /**
   * Focuses the camera directly on a flower, attaches a subtle warm glow around/above it,
   * highlights its floating tag showing the flower name, and maintains focus for durationSeconds.
   */
  focusOnFlowerWithGlow(flower, durationSeconds = 20) {
    if (!flower) return;

    this.clearFlowerHighlight();

    const pos = flower.group ? flower.group.position : flower.position;
    if (!pos) return;

    // 1. Smoothly glide camera toward flower (comfortably zoomed out from an elevated top angle)
    this.sceneEnv.targetLookAt.set(pos.x, (pos.y || 0) + 0.85, pos.z);
    this.sceneEnv.targetSpherical.radius = 5.8; // Zoomed out to view the complete flower and ground halo
    this.sceneEnv.targetSpherical.phi = 0.86;   // Elevated top angle looking gracefully downward at the bloom

    // 2. Subtle warm botanical sunlight PointLight focused gently on the bloom
    const glowLight = new THREE.PointLight(0xfff6dd, 1.5, 6.0, 1.2);
    glowLight.position.set(pos.x, (pos.y || 0) + 2.1, pos.z);
    this.sceneEnv.scene.add(glowLight);
    this.spotlightLight = glowLight;

    // 3. Ethereal soft glowing aura sprite hovering around and above the bloom
    const spriteMat = new THREE.SpriteMaterial({
      map: this.getGlowSpriteTexture(),
      color: 0xfff3d0,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const aura = new THREE.Sprite(spriteMat);
    aura.scale.set(2.4, 2.4, 1.0);
    aura.position.set(pos.x, (pos.y || 0) + 1.85, pos.z);
    this.sceneEnv.scene.add(aura);
    this.glowSprite = aura;

    // 4. Luminous full 360° circle ring of light conforming to meadow terrain
    const ringGeo = new THREE.PlaneGeometry(2.4, 2.4, 16, 16);
    ringGeo.rotateX(-Math.PI / 2);

    // Conform plane vertices to match the undulating meadow ground curve
    const posAttr = ringGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i) + pos.x;
      const vz = posAttr.getZ(i) + pos.z;
      const targetY = this.getTerrainHeight(vx, vz) + 0.04;
      posAttr.setY(i, targetY - (pos.y || 0));
    }
    ringGeo.computeVertexNormals();

    const ringMat = new THREE.MeshBasicMaterial({
      map: this.getRingTexture(),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(pos.x, pos.y || 0, pos.z);
    ring.renderOrder = 5;
    this.sceneEnv.scene.add(ring);
    this.groundRing = ring;

    this.activeCelebratedFlower = flower;

    // Summon 1 butterfly momentarily (~5s) to visit the searched flower and then leave
    if (this.butterflies) {
      this.butterflies.summonToFlower(flower, 5.0);
    }

    // 5. Highlight this flower's floating tag above it & ensure CSS2DRenderer is active
    if (this.labelSystem) {
      this.labelSystem.setVisible(true);

      let matchLabel = this.labelSystem.labels.find(l => {
        return l.flowerGroup === flower.group || (flower.name && l.name && l.name.toLowerCase() === flower.name.toLowerCase());
      });

      // If flower is an instanced bloom or has no label registered, create floating label anchor on the fly
      if (!matchLabel) {
        let anchorGroup = flower.group;
        if (!anchorGroup) {
          anchorGroup = new THREE.Group();
          anchorGroup.position.set(pos.x, pos.y || 0, pos.z);
          this.sceneEnv.scene.add(anchorGroup);
          flower.group = anchorGroup;
        }
        const createdName = this.labelSystem.addLabel(anchorGroup, flower.name, {
          choreographer: flower.choreographer || '',
          species: flower.species || 'periwinkle',
          isPlanted: !!flower.isPlanted
        });
        matchLabel = this.labelSystem.labels.find(l => l.name === createdName);
      }

      if (matchLabel && matchLabel.pill) {
        matchLabel.pill.classList.add('tag-celebrate-glow');
        matchLabel.highlighted = true;
      }
    }

    // 6. Restore after durationSeconds
    this.spotlightTimeout = setTimeout(() => {
      this.clearFlowerHighlight();
      if (this.labelSystem && !this.labelsVisible) {
        this.labelSystem.setVisible(false);
      }
    }, durationSeconds * 1000);
  }

  findClearPlantedSlot(minDist = 2.6) {
    // 360-degree radial candidate search across the meadow glade (up to 38m radius)
    // with large 2.6m minimum clearance to guarantee no leaf or petal intersection
    for (let r = 2.4; r <= 38.0; r += 0.5) {
      const stepAngle = Math.max(0.10, minDist / r);
      const phase = Math.random() * Math.PI * 2;
      for (let theta = 0; theta < Math.PI * 2; theta += stepAngle) {
        const ang = theta + phase;
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;

        // Skip camera vantage point
        if (Math.hypot(x - 0.3, z - 1.8) < 1.4) continue;
        if (Math.hypot(x, z) > 42.0) continue;

        let clear = true;
        for (let i = 0; i < this.flowers.length; i++) {
          const fl = this.flowers[i];
          const pos = fl.group ? fl.group.position : fl.position;
          if (!pos) continue;
          const dx = x - pos.x;
          const dz = z - pos.z;
          // Dedicated user-planted flowers get extra generous clearance (2.8m)
          const req = fl.isPlanted ? 2.8 : minDist;
          if (dx * dx + dz * dz < req * req) {
            clear = false;
            break;
          }
        }
        if (clear) return { x: Number(x.toFixed(3)), z: Number(z.toFixed(3)) };
      }
    }
    // Fallback safe glade clearing
    return { x: 7.5 + Math.random() * 3.0, z: 7.5 + Math.random() * 3.0 };
  }

  initCommunalSync() {
    const handleNewPlant = (flowerData, isLiveAlert = true) => {
      if (!flowerData || !flowerData.name) return;
      const exists = this.flowers.some(f => f.isPlanted && (f.id === flowerData.id || f.name.toLowerCase() === flowerData.name.toLowerCase()));
      if (exists) return;

      // Find guaranteed non-overlapping position with generous 2.4m clearance
      const slot = this.findClearPlantedSlot(2.4);
      const groundY = Math.sin(slot.x * 0.25) * Math.cos(slot.z * 0.25) * 0.35 +
                      Math.sin(slot.x * 0.08 + slot.z * 0.08) * 0.40 -
                      Math.hypot(slot.x, slot.z) * 0.006;

      const planted = new PlantedChoreographyFlower(flowerData, slot, true);
      planted.setPosition(slot.x, groundY, slot.z);
      this.sceneEnv.scene.add(planted.group);
      this.flowers.unshift(planted);
      this.heroFlower = planted;

      // Register label with FlowerLabelSystem so search and tags work on planted blooms
      if (this.labelSystem) {
        this.labelSystem.addLabel(planted.group, flowerData.name, {
          choreographer: flowerData.choreographer,
          species: flowerData.species,
          isPlanted: true
        });
      }

      // Cache locally on device so reloads retain cloud plants even offline
      try {
        const userPlants = JSON.parse(localStorage.getItem('botanical_garden_user_plants') || '[]');
        if (!userPlants.some(p => p.id === flowerData.id || p.name === flowerData.name)) {
          userPlants.unshift(flowerData);
          localStorage.setItem('botanical_garden_user_plants', JSON.stringify(userPlants.slice(0, 100)));
        }
      } catch (_) {}

      if (isLiveAlert) {
        // Spotlight celebrate this planted flower for 20 seconds!
        this.focusOnFlowerWithGlow(planted, 20);
      }
    };

    // 1. Cross-tab storage sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'botanical_garden_new_bloom' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload && payload.name) {
            handleNewPlant(payload, true);
          }
        } catch (_) {}
      }
    });

    // 2. BroadcastChannel
    try {
      const channel = new BroadcastChannel('botanical_garden_channel');
      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'NEW_BLOOM' && e.data.flowerData) {
          handleNewPlant(e.data.flowerData, true);
        }
      };
    } catch (_) {}

    // 3. Supabase Cloud Realtime Channel (Cross-device WebSocket: Mac Laptop -> iPad TV display)
    subscribeToNewBlooms((cloudFlower) => {
      if (cloudFlower && cloudFlower.name) {
        handleNewPlant(cloudFlower, true);
      }
    });

    // 4. Initial Cloud Fetch from Supabase (loads previous visitor flowers onto iPad)
    fetchCloudChoreographies().then((cloudFlowers) => {
      if (Array.isArray(cloudFlowers) && cloudFlowers.length > 0) {
        const reversed = [...cloudFlowers].reverse();
        reversed.forEach((f) => handleNewPlant(f, false));
      }
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const initialQuery = urlParams.get('search') || urlParams.get('flower');
        if (initialQuery && initialQuery.trim()) {
          setTimeout(() => this.doSearch(initialQuery.trim()), 300);
        }
      } catch (_) {}
    }).catch(() => {});
  }

  setFlowerCount(newCount) {
    if (this.flowerCount === newCount) return;
    this.initMeadow(newCount);

    const countBtns = document.querySelectorAll('.count-pill');
    countBtns.forEach(btn => {
      if (parseInt(btn.dataset.count, 10) === newCount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const descEl = document.getElementById('dance-desc-text');
    if (descEl && this.currentDanceId === 'random100') {
      descEl.textContent = `🎲 ${newCount} Flowers moving with independent random sway, bloom, stretch, and leaf kinematics.`;
    }
  }

  initControls() {
    // 1. Camera Preset Buttons
    const heroLowBtn = document.getElementById('btn-cam-hero-low');
    const eyeLevelBtn = document.getElementById('btn-cam-eye');
    const aerialBtn = document.getElementById('btn-cam-aerial');

    const setActiveBtn = (btn) => {
      [heroLowBtn, eyeLevelBtn, aerialBtn].forEach(b => b && b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    if (heroLowBtn) {
      heroLowBtn.addEventListener('click', () => {
        this.sceneEnv.setCameraPreset('hero-low');
        setActiveBtn(heroLowBtn);
      });
    }

    if (eyeLevelBtn) {
      eyeLevelBtn.addEventListener('click', () => {
        this.sceneEnv.setCameraPreset('eye-level');
        setActiveBtn(eyeLevelBtn);
      });
    }

    if (aerialBtn) {
      aerialBtn.addEventListener('click', () => {
        this.sceneEnv.setCameraPreset('aerial');
        setActiveBtn(aerialBtn);
      });
    }

    // 2. Palette Switcher for Hero Flower
    const paletteButtons = document.querySelectorAll('.palette-pill');
    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const palKey = btn.dataset.palette;
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchHeroPalette(palKey);
      });
    });

    // 3. Choreography Presets
    const danceButtons = document.querySelectorAll('.dance-pill');
    danceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        danceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const dance = btn.dataset.dance;
        if (dance === 'chorus') {
          this.isChorusMode = true;
          this.currentDanceId = 'surya';
        } else if (dance === 'wind') {
          this.isChorusMode = false;
          this.currentDanceId = 'wind';
        } else if (dance === 'random100') {
          this.isChorusMode = false;
          this.currentDanceId = 'random100';
        } else {
          this.isChorusMode = false;
          this.currentDanceId = dance;
        }

        const preset = CHOREOGRAPHY_PRESETS[this.currentDanceId];
        const descEl = document.getElementById('dance-desc-text');
        if (descEl) {
          if (dance === 'random100') {
            descEl.textContent = `🎲 ${this.flowerCount} Flowers moving with independent random sway, bloom, stretch, and leaf kinetics.`;
          } else if (dance === 'chorus') {
            descEl.textContent = `Entire meadow ensemble (${this.flowerCount} flowers) dancing together in synchronized harmonic wave!`;
          } else if (dance === 'wind') {
            descEl.textContent = 'Natural resting meadow with gentle breeze flutter (no human movement).';
          } else if (preset) {
            descEl.textContent = preset.desc;
          }
        }
      });
    });

    // 4. Laptop Capacity & Flower Density Buttons
    const countButtons = document.querySelectorAll('.count-pill');
    countButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.count, 10);
        if (count) {
          this.setFlowerCount(count);
        }
      });
    });

    // 5. Play / Pause Button
    const playPauseBtn = document.getElementById('btn-play-pause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        playPauseBtn.textContent = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
      });
    }

    // 6. Speed Buttons
    const speedHalf = document.getElementById('btn-speed-05');
    const speedOne = document.getElementById('btn-speed-1');
    const speedFast = document.getElementById('btn-speed-15');
    const speedBtns = [speedHalf, speedOne, speedFast];

    const setSpeed = (spd, btn) => {
      this.danceSpeed = spd;
      speedBtns.forEach(b => b && b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    if (speedHalf) speedHalf.addEventListener('click', () => setSpeed(0.5, speedHalf));
    if (speedOne) speedOne.addEventListener('click', () => setSpeed(1.0, speedOne));
    if (speedFast) speedFast.addEventListener('click', () => setSpeed(1.5, speedFast));

    // 7. Wind & Sky Sliders
    const windSlider = document.getElementById('wind-slider');
    const windValText = document.getElementById('wind-val');
    if (windSlider) {
      windSlider.addEventListener('input', (e) => {
        this.windStrength = parseFloat(e.target.value);
        if (windValText) windValText.textContent = `${Math.round(this.windStrength * 100)}%`;
      });
    }

    const skySlider = document.getElementById('sky-slider');
    const skyValText = document.getElementById('sky-val');
    if (skySlider) {
      skySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.sceneEnv.renderer.toneMappingExposure = val;
        if (skyValText) skyValText.textContent = `${val.toFixed(2)}x`;
      });
    }

    // 8. Labels Visibility Controls (labels removed & hidden by default)
    this.labelsVisible = false;
    document.body.classList.add('labels-hidden');

    this.toggleLabels = (forceState = null) => {
      this.labelsVisible = (forceState !== null) ? forceState : !this.labelsVisible;
      document.body.classList.toggle('labels-hidden', !this.labelsVisible);

      if (this.labelSystem) {
        this.labelSystem.setVisible(this.labelsVisible);
      }

      const toggleBtn = document.getElementById('btn-toggle-labels');
      const toggleText = document.getElementById('label-toggle-text');
      const toggleIcon = document.getElementById('label-toggle-icon');
      const quickBtn = document.getElementById('btn-quick-toggle-labels');
      const toggleChip = document.getElementById('chip-toggle-labels');

      if (toggleBtn) {
        toggleBtn.classList.toggle('labels-off', !this.labelsVisible);
      }
      if (toggleText) {
        toggleText.textContent = this.labelsVisible ? 'Hide Labels' : 'Show Labels';
      }
      if (toggleIcon) {
        toggleIcon.textContent = this.labelsVisible ? '🏷️' : '🚫';
      }
      if (quickBtn) {
        quickBtn.classList.toggle('labels-off', !this.labelsVisible);
        quickBtn.title = this.labelsVisible ? 'Hide all flower labels (L)' : 'Show all flower labels (L)';
        quickBtn.textContent = this.labelsVisible ? '🏷️' : '🚫';
      }
      if (toggleChip) {
        toggleChip.textContent = this.labelsVisible ? '🏷️ Labels: ON' : '🚫 Labels: OFF';
        toggleChip.classList.toggle('labels-off', !this.labelsVisible);
      }
    };

    const toggleLabelsBtn = document.getElementById('btn-toggle-labels');
    if (toggleLabelsBtn) {
      toggleLabelsBtn.addEventListener('click', () => this.toggleLabels());
    }

    const quickToggleBtn = document.getElementById('btn-quick-toggle-labels');
    if (quickToggleBtn) {
      quickToggleBtn.addEventListener('click', () => this.toggleLabels());
    }

    // Keyboard shortcuts: Press 'L' to toggle labels, 'H' to toggle UI (when not typing in search input)
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.toggleLabels();
      } else if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        hideUiBtn?.click();
      }
    });

    // 9. Hide / Show All UI Button (Zen mode - default UI hidden)
    const hideUiBtn = document.getElementById('btn-hide-ui');
    if (hideUiBtn) {
      let uiVisible = false; // Hidden by default (Zen mode)
      hideUiBtn.title = 'Show UI';
      hideUiBtn.addEventListener('click', () => {
        uiVisible = !uiVisible;
        document.body.classList.toggle('ui-hidden', !uiVisible);
        hideUiBtn.title = uiVisible ? 'Hide UI' : 'Show UI';
        // When hiding entire UI, also hide labels
        if (this.labelSystem) {
          this.labelSystem.setVisible(uiVisible && this.labelsVisible);
        }
      });
    }
  }

  initSearch() {
    const input         = document.getElementById('flower-search-input');
    const clearBtn      = document.getElementById('flower-search-clear');
    const countEl       = document.getElementById('search-result-count');
    const cycleControls = document.getElementById('search-cycle-controls');
    const cycleLabel    = document.getElementById('cycle-index-label');
    const prevBtn       = document.getElementById('search-prev-btn');
    const nextBtn       = document.getElementById('search-next-btn');

    if (!input) return;

    const navigateMatch = (delta) => {
      if (!this.searchMatches || this.searchMatches.length === 0) return;
      const total = this.searchMatches.length;
      this.searchMatchIndex = (this.searchMatchIndex + delta + total) % total;

      if (cycleLabel) {
        cycleLabel.textContent = `${this.searchMatchIndex + 1}/${total}`;
      }

      const activeFlower = this.searchMatches[this.searchMatchIndex];
      if (activeFlower) {
        this.focusOnFlowerWithGlow(activeFlower, 20);
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateMatch(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateMatch(1);
      });
    }

    this.updateChipActive = (query) => {
      const q = (query || '').trim().toLowerCase();
      const chips = document.querySelectorAll('.flower-chip');
      chips.forEach(chip => {
        const name = (chip.dataset.name || '').toLowerCase();
        const isMatch = q.length > 0 && (name === q || name.includes(q) || q.includes(name));
        chip.classList.toggle('active', isMatch);
      });
    };

    this.doSearch = (query) => {
      if (!this.labelSystem) return;

      const q = (query || '').trim();
      this.updateChipActive(q);

      if (q.length === 0) {
        this.clearFlowerHighlight();
        this.labelSystem.clearSearch();
        this.searchMatches = [];
        this.searchMatchIndex = 0;
        if (countEl) countEl.textContent = '';
        if (cycleControls) cycleControls.classList.add('hidden');
        clearBtn && clearBtn.classList.remove('visible');
        return;
      }

      clearBtn && clearBtn.classList.add('visible');

      // 1. Gather all matched flowers across both articulated/planted flowers and proxies
      const qLower = q.toLowerCase();
      const matchedFlowers = this.flowers.filter(f => (f.name || '').toLowerCase().includes(qLower));
      this.searchMatches = matchedFlowers;
      this.searchMatchIndex = 0;

      // 2. Highlight tags in 3D scene
      this.labelSystem.search(q);

      const totalMatches = matchedFlowers.length;

      if (countEl) {
        countEl.textContent = totalMatches === 0
          ? 'No flowers found'
          : `${totalMatches} flower${totalMatches === 1 ? '' : 's'} found in meadow`;
      }

      // 3. Multi-match cycle controls
      if (cycleControls && cycleLabel) {
        if (totalMatches > 1) {
          cycleControls.classList.remove('hidden');
          cycleLabel.textContent = `1/${totalMatches}`;
        } else {
          cycleControls.classList.add('hidden');
        }
      }

      // 4. Immediately spotlight & focus the first matched flower for 20 seconds!
      if (totalMatches > 0) {
        this.focusOnFlowerWithGlow(matchedFlowers[0], 20);
      }
    };

    input.addEventListener('input', (e) => this.doSearch(e.target.value));

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        this.doSearch('');
        input.blur();
      } else if (e.key === 'Enter') {
        navigateMatch(1);
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        this.doSearch('');
        input.focus();
      });
    }

    // Direct URL parameter auto-search (?search= or ?flower=)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get('search') || urlParams.get('flower');
      if (initialQuery && initialQuery.trim()) {
        const q = initialQuery.trim();
        input.value = q;
        setTimeout(() => this.doSearch(q), 500);
      }
    } catch (_) {}
  }

  switchHeroPalette(paletteKey) {
    const pal = MEADOW_PALETTES[paletteKey];
    if (!pal || !this.heroFlower) return;

    this.currentHeroPalette = paletteKey;

    if (this.heroFlower.petalMaterial) {
      this.heroFlower.palette = pal;
      this.heroFlower.petalMaterial.color.setHex(pal.petalPrimary);
      if (this.heroFlower.petalAltMaterial) this.heroFlower.petalAltMaterial.color.setHex(pal.petalSecondary);
      if (this.heroFlower.leafMaterial) this.heroFlower.leafMaterial.color.setHex(pal.leafColor);
      if (this.heroFlower.stamenMaterial) {
        this.heroFlower.stamenMaterial.color.setHex(pal.antherColor);
        this.heroFlower.stamenMaterial.emissive.setHex(pal.pistilColor);
      }
    }

    const descEl = document.getElementById('active-palette-desc');
    if (descEl) {
      descEl.textContent = `${pal.name} — ${pal.desc}`;
    }
  }

  updateChoreographyHUD(k) {
    // 1. Posture Action Text
    const postureText = document.getElementById('live-posture-text');
    if (postureText) {
      postureText.textContent = k.postureDesc || 'Dancing in harmony';
    }

    // 2. Metrics Gauges
    const bloomGauge = document.getElementById('gauge-bloom');
    const heightGauge = document.getElementById('gauge-height');
    const leanGauge = document.getElementById('gauge-lean');
    const wingspanGauge = document.getElementById('gauge-wingspan');

    if (bloomGauge) bloomGauge.textContent = `${Math.round((k.bloomRatio || 0.5) * 100)}%`;
    if (heightGauge) heightGauge.textContent = `${(k.heightFactor || 1.0).toFixed(2)}x`;
    if (leanGauge) {
      const angleDeg = Math.round((k.spineLeanX || 0) * 28);
      leanGauge.textContent = `${angleDeg > 0 ? '+' : ''}${angleDeg}°`;
    }
    if (wingspanGauge) wingspanGauge.textContent = `${Math.round((k.wingspanSpread || 0.5) * 100)}%`;

    // 3. Update Visual Dancer Silhouette SVG in HUD
    this.updateDancerSilhouette(k);

    // 4. Update Progress Bar
    const progBar = document.getElementById('dance-progress-bar');
    if (progBar && k.progress !== undefined) {
      progBar.style.width = `${Math.round(k.progress * 100)}%`;
    }
  }

  updateDancerSilhouette(k) {
    const spineLine = document.getElementById('dancer-spine');
    const leftArm = document.getElementById('dancer-arm-l');
    const rightArm = document.getElementById('dancer-arm-r');
    const headCircle = document.getElementById('dancer-head');

    if (!spineLine || !leftArm || !rightArm) return;

    const leanX = (k.spineLeanX || 0) * 18;
    const bowY = (k.spineLeanZ || 0) * 10;
    const stretchY = ((k.heightFactor || 1.0) - 1.0) * 12;

    const chestX = 50 + leanX * 0.6;
    const chestY = 45 + bowY - stretchY;
    const headX = 50 + leanX;
    const headY = 22 + bowY - stretchY;

    if (headCircle) {
      headCircle.setAttribute('cx', headX);
      headCircle.setAttribute('cy', headY);
    }

    spineLine.setAttribute('x1', 50);
    spineLine.setAttribute('y1', 75);
    spineLine.setAttribute('x2', chestX);
    spineLine.setAttribute('y2', chestY);

    const armElevL = k.armHeightL || 0.5;
    const armElevR = k.armHeightR || 0.5;
    const spread = (k.wingspanSpread || 0.5) * 26;

    const leftHandX = chestX - 16 - spread;
    const leftHandY = chestY + 16 - (armElevL * 42);

    const rightHandX = chestX + 16 + spread;
    const rightHandY = chestY + 16 - (armElevR * 42);

    leftArm.setAttribute('x1', chestX);
    leftArm.setAttribute('y1', chestY);
    leftArm.setAttribute('x2', leftHandX);
    leftArm.setAttribute('y2', leftHandY);

    rightArm.setAttribute('x1', chestX);
    rightArm.setAttribute('y1', chestY);
    rightArm.setAttribute('x2', rightHandX);
    rightArm.setAttribute('y2', rightHandY);
  }

  startLoop() {
    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      if (this.isPlaying) {
        this.danceTime += dt * this.danceSpeed;
      }

      // 1. Performance Diagnostics (Live FPS & Frametime ms)
      this.frameCount++;
      const now = performance.now();
      const elapsed = now - this.lastFpsTime;
      if (elapsed >= 500) {
        this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
        this.currentMs = (dt * 1000).toFixed(1);
        this.frameCount = 0;
        this.lastFpsTime = now;

        const fpsValEl = document.getElementById('fps-val');
        const msValEl = document.getElementById('ms-val');
        const fpsDotEl = document.getElementById('fps-dot');

        if (fpsValEl) fpsValEl.textContent = this.currentFps;
        if (msValEl) msValEl.textContent = `(${this.currentMs}ms)`;
        if (fpsDotEl) {
          if (this.currentFps >= 55) {
            fpsDotEl.style.backgroundColor = '#4ade80';
            fpsDotEl.style.boxShadow = '0 0 10px #4ade80';
          } else if (this.currentFps >= 40) {
            fpsDotEl.style.backgroundColor = '#facc15';
            fpsDotEl.style.boxShadow = '0 0 10px #facc15';
          } else {
            fpsDotEl.style.backgroundColor = '#f87171';
            fpsDotEl.style.boxShadow = '0 0 10px #f87171';
          }
        }
      }

      // 1. Hardware-accelerated update of instanced botanical meadow blooms
      if (this.instancedMeadow) {
        const preset = (this.currentDanceId !== 'random100' && this.currentDanceId !== 'wind')
          ? CHOREOGRAPHY_PRESETS[this.currentDanceId]
          : null;
        this.instancedMeadow.update(this.danceTime, this.windStrength, this.danceSpeed, preset);
      }

      // 2. Evaluate Choreography & Kinematics for foreground articulated flowers
      let heroKinematics = null;

      // Update foreground flowers in the meadow
      for (let i = 0; i < this.flowers.length; i++) {
        const fl = this.flowers[i];
        if (fl.isInstanced) continue; // Instanced blooms updated in hardware batched pass!

        if (fl.isPlanted) {
          // VISITOR PLANTED FLOWER:
          // Faithfully loop and play back the authentic recorded dance kinematics!
          const k = fl.updatePlayback(dt * this.danceSpeed);
          if (fl === this.heroFlower && k) {
            heroKinematics = k;
          }
        } else if (this.currentDanceId === 'random100') {
          // Procedural random dancer
          const k = fl.updateRandom(this.danceTime, this.windStrength, this.danceSpeed);
          if (fl === this.heroFlower && !heroKinematics) {
            heroKinematics = k;
          }
        } else if (this.currentDanceId === 'wind') {
          fl.update(time, this.windStrength);
        } else {
          // Preset Choreography (Surya Namaskar, Monsoon, Prana, Spiral)
          const preset = CHOREOGRAPHY_PRESETS[this.currentDanceId];
          if (preset) {
            if (this.isChorusMode) {
              const flKinematics = preset.evaluate(this.danceTime + i * 0.25, preset.duration);
              fl.applyKinematics(flKinematics, dt);
            } else if (fl === this.heroFlower) {
              const k = preset.evaluate(this.danceTime, preset.duration);
              fl.applyKinematics(k, dt);
              heroKinematics = k;
            } else {
              fl.updateRandom(this.danceTime * 0.7, this.windStrength * 0.85, 0.85);
            }
          }
        }
      }

      if (this.currentDanceId === 'wind' && !heroKinematics) {
        heroKinematics = {
          spineLeanX: Math.sin(time) * 0.1,
          spineLeanZ: 0,
          armHeightL: 0.5,
          armHeightR: 0.5,
          wingspanSpread: 0.5,
          heightFactor: 1.0,
          bloomRatio: 0.65,
          postureDesc: 'Ambient Meadow Breeze • Soft wind flutter'
        };
      }

      if (heroKinematics) {
        this.updateChoreographyHUD(heroKinematics);
      }

      // 3. Animate wild meadow grasses & wheat
      if (this.wildGrasses) {
        this.wildGrasses.update(time, this.windStrength);
      }

      // 3b. Animate fluttering meadow butterflies
      if (this.butterflies) {
        this.butterflies.update(time, dt);
      }

      // 3b. Subtle organic breathing of active highlight glow if present
      if (this.glowSprite) {
        const pulse = Math.sin(time * 2.4) * 0.08;
        this.glowSprite.scale.set(2.4 + pulse, 2.4 + pulse, 1.0);
      }
      if (this.groundRing) {
        const ringPulse = Math.sin(time * 2.0) * 0.03;
        this.groundRing.scale.set(1.0 + ringPulse, 1.0 + ringPulse, 1.0);
      }

      // 4. Update scene & camera
      this.sceneEnv.update(time);

      // 5. Render floating CSS2D flower name tags
      if (this.labelSystem) {
        this.labelSystem.update();
      }
    };

    animate();
  }
}

// Boot on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new MeadowVisualLab();
});
