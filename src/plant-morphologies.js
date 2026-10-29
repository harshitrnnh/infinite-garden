import * as THREE from 'three';
import {
  PeriwinkleMorphology,
  PoppyMorphology,
  ChamomileMorphology,
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
  meadow: {
    key: 'meadow',
    name: 'Meadow Chalice',
    family: 'Ranunculaceae style',
    tagline: '6 Cupped Overlapping Chalice Petals • Golden Pollen Torus',
    dotColor: '#7ca88a'
  },
  chalice: {
    key: 'chalice',
    name: 'Meadow Chalice',
    family: 'Ranunculaceae style',
    tagline: '6 Cupped Overlapping Chalice Petals • Golden Pollen Torus',
    dotColor: '#7ca88a'
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

    // Bespoke Meadow Cupped Chalice (6 cupped petals with unified single continuous articulated spine)
    const meadowChalice = new MeadowChaliceMorphology();
    const marigold = new MarigoldMorphology();

    // Instantiate bespoke 3D botanical morphologies from flower-geometries.js
    this.morphologies = {
      periwinkle: new PeriwinkleMorphology(),
      poppy: new PoppyMorphology(),
      chamomile: new ChamomileMorphology(),
      meadow: meadowChalice,
      chalice: meadowChalice, // alias
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
      morph.group.visible = (key === initialSpecies || (key === 'meadow' && initialSpecies === 'chalice'));
      this.group.add(morph.group);
    });

    this.activeMorphology = this.morphologies[initialSpecies] || this.morphologies.periwinkle;
  }

  setSpecies(speciesKey) {
    const targetKey = (speciesKey === 'chalice') ? 'meadow' : speciesKey;
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
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  triggerGust() {
    this.gustStrength = 0.85;
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

