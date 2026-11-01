import * as THREE from 'three';
import {
  PeriwinkleMorphology,
  PoppyMorphology,
  ChamomileMorphology,
  ChampaMorphology,
  MeadowChaliceMorphology,
  MarigoldMorphology,
  LotusMorphology,
  HibiscusMorphology
} from './meadow-lab/flower-geometries.js';

export const CHOREOGRAPHY_SPECIES_META = {
  periwinkle: {
    key: 'periwinkle',
    name: 'Periwinkle',
    family: 'Apocynaceae',
    tagline: '5 Salverform Propeller Petals • Pentagonal Throat',
    dotColor: '#6372b8'
  },
  poppy: {
    key: 'poppy',
    name: 'Wild Poppy',
    family: 'Papaveraceae',
    tagline: '4 Ruffled Scarlet Petals • Urn-Shaped Capsule Crown',
    dotColor: '#eb4328'
  },
  chamomile: {
    key: 'chamomile',
    name: 'Chamomile Wheat',
    family: 'Asteraceae',
    tagline: '16 Radiating Ray Petals • Conical Golden Disk Dome',
    dotColor: '#e8c15a'
  },
  champa: {
    key: 'champa',
    name: 'Champa (Frangipani)',
    family: 'Apocynaceae (Plumeria)',
    tagline: '5 Spiral Pinwheel Petals • Golden Sunlight Heart',
    dotColor: '#ffd166'
  },
  meadow: {
    key: 'champa',
    name: 'Champa (Frangipani)',
    family: 'Apocynaceae (Plumeria)',
    tagline: '5 Spiral Pinwheel Petals • Golden Sunlight Heart',
    dotColor: '#ffd166'
  },
  chalice: {
    key: 'champa',
    name: 'Champa (Frangipani)',
    family: 'Apocynaceae (Plumeria)',
    tagline: '5 Spiral Pinwheel Petals • Golden Sunlight Heart',
    dotColor: '#ffd166'
  },
  marigold: {
    key: 'marigold',
    name: 'Festive Marigold',
    family: 'Asteraceae (Genda)',
    tagline: 'Concentric Ruffled Rosette • Golden Saffron Pom-Pom',
    dotColor: '#f59e0b'
  },
  celadon: {
    key: 'celadon',
    name: 'Festive Marigold',
    family: 'Asteraceae (Genda)',
    tagline: 'Concentric Ruffled Rosette • Golden Saffron Pom-Pom',
    dotColor: '#f59e0b'
  },
  lotus: {
    key: 'lotus',
    name: 'Sacred Lotus',
    family: 'Nelumbonaceae',
    tagline: 'Multi-Layered Water-Lily Petals • Golden Seed Pod Torus',
    dotColor: '#eb4d88'
  },
  hibiscus: {
    key: 'hibiscus',
    name: 'Royal Hibiscus',
    family: 'Malvaceae',
    tagline: 'Flared Scarlet Trumpet Petals • Projecting Staminal Column',
    dotColor: '#dc2626'
  }
};

/**
 * StudioFlowerManager holds the exact 3D flower morphologies
 * from flower-geometries.html and mounts them into the choreography studio.
 */
export class StudioFlowerManager {
  constructor(initialSpecies = 'periwinkle') {
    this.group = new THREE.Group();
    this.currentSpecies = initialSpecies;
    this.gustStrength = 0;

    const champa = new ChampaMorphology();
    const marigold = new MarigoldMorphology();

    // Instantiate bespoke 3D botanical morphologies from flower-geometries.js
    this.morphologies = {
      periwinkle: new PeriwinkleMorphology(),
      poppy: new PoppyMorphology(),
      chamomile: new ChamomileMorphology(),
      champa: champa,
      meadow: champa, // alias
      chalice: champa, // alias
      marigold: marigold,
      celadon: marigold, // alias
      lotus: new LotusMorphology(),
      hibiscus: new HibiscusMorphology()
    };

    // Mount each unique morphology under this.group and control visibility
    const mounted = new Set();
    Object.keys(this.morphologies).forEach((key) => {
      const morph = this.morphologies[key];
      if (mounted.has(morph)) return;
      mounted.add(morph);
      morph.group.position.set(0, 0, 0);
      const isInitialMatch = (key === initialSpecies ||
        (['champa', 'meadow', 'chalice'].includes(initialSpecies) && ['champa', 'meadow', 'chalice'].includes(key)));
      morph.group.visible = isInitialMatch;
      this.group.add(morph.group);
    });

    this.activeMorphology = this.morphologies[initialSpecies] || this.morphologies.periwinkle;
  }

  setSpecies(speciesKey) {
    let targetKey = speciesKey;
    if (targetKey === 'chalice' || targetKey === 'meadow') targetKey = 'champa';
    if (!this.morphologies[targetKey]) return;
    this.currentSpecies = targetKey;

    const activeGroup = this.morphologies[targetKey].group;
    const checked = new Set();
    Object.keys(this.morphologies).forEach((key) => {
      const morph = this.morphologies[key];
      if (checked.has(morph)) return;
      checked.add(morph);
      morph.group.visible = (morph.group === activeGroup);
    });

    this.activeMorphology = this.morphologies[targetKey];
    this.triggerGust();

    // Re-sprout existing namaste branches on the new morphology if user switched species
    if (this.totalNamasteCount > 0 && this.activeMorphology && this.activeMorphology.stem) {
      const needed = this.totalNamasteCount - (this.activeMorphology.stem.namasteBranchCount || 0);
      for (let i = 0; i < needed; i++) {
        const b = this.activeMorphology.stem.sproutNamasteBranch();
        if (b) {
          b.growthScale = 1.0;
          b.group.scale.set(1.0, 1.0, 1.0);
        }
      }
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  triggerGust() {
    this.gustStrength = 0.85;
  }

  sproutNamasteBranch() {
    this.totalNamasteCount = (this.totalNamasteCount || 0) + 1;
    if (this.activeMorphology && this.activeMorphology.stem && typeof this.activeMorphology.stem.sproutNamasteBranch === 'function') {
      return this.activeMorphology.stem.sproutNamasteBranch();
    }
    return null;
  }

  update(kinematics, dt = 0.016) {
    if (!this.activeMorphology) return;

    // Decay gust impulse
    this.gustStrength *= Math.max(0, 1 - dt * 2.8);

    // Clone kinematics and add gentle breeze impulse if active
    const k = { ...kinematics };
    if (this.gustStrength > 0.01) {
      const gustOffset = Math.sin(Date.now() * 0.006) * this.gustStrength * 0.35;
      k.spineLeanX = (k.spineLeanX || 0) + gustOffset;
    }

    // Apply real-time MediaPipe human body kinematics to the active morphology
    if (typeof this.activeMorphology.applyKinematics === 'function') {
      this.activeMorphology.applyKinematics(k, dt);
    }
  }
}

