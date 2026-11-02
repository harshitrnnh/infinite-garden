import * as THREE from 'three';
import { LivingPlant, FLOWER_SPECIES } from './plant.js';

// Pre-seeded community choreographies representing diverse Indian flora and movement expressions
export const PRESEEDED_FLOWERS = [
  {
    id: 'communal_surya_namaskar',
    name: 'Surya Namaskar (Sun Offering)',
    choreographer: 'Aarav (Varanasi)',
    species: 'marigold',
    duration: 8.0,
    fps: 20,
    position: { x: -2.1, y: 0, z: -0.6 },
    rotationY: 0.28,
    scale: 0.95,
    timestamp: Date.now() - 86400000 * 3,
    generator: (t) => {
      const p = (t / 8.0) * Math.PI * 2;
      // Rising up to the sun, bowing forward in gratitude, swaying
      const bow = Math.sin(p) * 0.45;
      const reach = Math.max(0, -Math.sin(p) * 0.95);
      const sway = Math.sin(p * 2) * 0.35;
      const armsUp = reach > 0.3 ? 1.45 : 0.05;
      const bloom = 0.30 + Math.max(0, -Math.sin(p)) * 0.65;
      return {
        spineLeanX: sway,
        spineLeanZ: bow,
        bodyShiftX: sway * 0.6,
        heightFactor: 1.0 + reach * 0.22,
        bloomRatio: bloom,
        armHeightL: armsUp,
        armHeightR: armsUp,
        armExtensionL: Math.sin(p) > 0 ? 0.9 : 0.05,
        armExtensionR: Math.sin(p) > 0 ? 0.9 : 0.05,
        armStretchUp: reach,
        wingspanSpread: Math.sin(p) > 0 ? 1.1 : 0.0,
        legLiftL: 0,
        legLiftR: 0,
        headGazeX: sway * 0.4,
        headGazeY: reach * 0.5 - bow * 0.3,
        energy: 0.25 + reach * 0.3
      };
    }
  },
  {
    id: 'communal_monsoon_flame',
    name: 'Monsoon Flame Dance',
    choreographer: 'Kavita (Shantiniketan)',
    species: 'palash',
    duration: 8.0,
    fps: 20,
    position: { x: 2.1, y: 0, z: -0.6 },
    rotationY: -0.28,
    scale: 0.95,
    timestamp: Date.now() - 86400000 * 2,
    generator: (t) => {
      const p = (t / 8.0) * Math.PI * 2;
      // Dynamic branch fanning, expressive sideways swaying, passionate bloom
      const sway = Math.sin(p) * 0.65;
      const spread = 0.5 + Math.sin(p * 2) * 0.5;
      const bloom = 0.55 + Math.cos(p) * 0.40;
      return {
        spineLeanX: sway,
        spineLeanZ: Math.sin(p * 2) * 0.25,
        bodyShiftX: sway * 0.75,
        heightFactor: 1.08 + Math.cos(p) * 0.14,
        bloomRatio: bloom,
        armHeightL: 0.8 + Math.sin(p) * 0.6,
        armHeightR: 0.8 - Math.sin(p) * 0.6,
        armExtensionL: spread * 1.3,
        armExtensionR: spread * 1.3,
        armStretchUp: Math.max(0, Math.cos(p) * 0.7),
        wingspanSpread: spread * 1.25,
        legLiftL: Math.max(0, Math.sin(p) * 0.4),
        legLiftR: Math.max(0, -Math.sin(p) * 0.4),
        headGazeX: sway * 0.5,
        headGazeY: 0,
        energy: 0.4 + spread * 0.3
      };
    }
  },
  {
    id: 'communal_nocturnal_fragrance',
    name: 'Midnight Raag (Chameli Unfurl)',
    choreographer: 'Meera (Bengaluru)',
    species: 'mogra',
    duration: 8.0,
    fps: 20,
    position: { x: -2.7, y: 0, z: -1.3 },
    rotationY: 0.42,
    scale: 0.92,
    timestamp: Date.now() - 86400000 * 1.5,
    generator: (t) => {
      const p = (t / 8.0) * Math.PI * 2;
      // Meditative, slow fragrant breathing, gentle branch rise
      const breathe = Math.sin(p) * 0.5 + 0.5;
      const gentleSway = Math.cos(p) * 0.28;
      return {
        spineLeanX: gentleSway,
        spineLeanZ: Math.sin(p) * 0.15,
        bodyShiftX: gentleSway * 0.5,
        heightFactor: 1.0 + breathe * 0.15,
        bloomRatio: 0.25 + breathe * 0.70,
        armHeightL: 0.1 + breathe * 1.1,
        armHeightR: 0.1 + breathe * 1.1,
        armExtensionL: 0.1 + breathe * 0.7,
        armExtensionR: 0.1 + breathe * 0.7,
        armStretchUp: breathe * 0.6,
        wingspanSpread: breathe * 0.8,
        legLiftL: 0,
        legLiftR: 0,
        headGazeX: gentleSway * 0.3,
        headGazeY: breathe * 0.4,
        energy: 0.15 + breathe * 0.2
      };
    }
  },
  {
    id: 'communal_gulmohar_canopy',
    name: 'Gulmohar Canopy Reach',
    choreographer: 'Vikram (Delhi)',
    species: 'gulmohar',
    duration: 8.0,
    fps: 20,
    position: { x: 2.7, y: 0, z: -1.3 },
    rotationY: -0.42,
    scale: 0.92,
    timestamp: Date.now() - 86400000 * 1,
    generator: (t) => {
      const p = (t / 8.0) * Math.PI * 2;
      // Majestic overhead branch reach and broad arching canopy
      const reach = Math.sin(p * 2) * 0.45 + 0.5;
      const arch = Math.cos(p) * 0.35;
      return {
        spineLeanX: Math.sin(p) * 0.45,
        spineLeanZ: -arch * 0.5,
        bodyShiftX: Math.sin(p) * 0.35,
        heightFactor: 1.05 + reach * 0.20,
        bloomRatio: 0.45 + reach * 0.50,
        armHeightL: 0.7 + reach * 0.9,
        armHeightR: 0.7 + reach * 0.9,
        armExtensionL: 0.5 + reach * 0.8,
        armExtensionR: 0.5 + reach * 0.8,
        armStretchUp: reach * 0.95,
        wingspanSpread: 0.4 + reach * 0.85,
        legLiftL: 0,
        legLiftR: 0,
        headGazeX: 0,
        headGazeY: reach * 0.4,
        energy: 0.3 + reach * 0.3
      };
    }
  },
  {
    id: 'communal_temple_champa',
    name: 'Temple Champa Offering',
    choreographer: 'Devcon Community',
    species: 'champa',
    duration: 8.0,
    fps: 20,
    position: { x: 0.0, y: 0, z: -1.8 },
    rotationY: 0.0,
    scale: 0.90,
    timestamp: Date.now() - 3600000 * 8,
    generator: (t) => {
      const p = (t / 8.0) * Math.PI * 2;
      // Serene petal offering, deep reverence front bow, and gentle blossom
      const bow = Math.sin(p) * 0.40;
      const open = Math.cos(p) * 0.45 + 0.5;
      return {
        spineLeanX: Math.sin(p * 2) * 0.22,
        spineLeanZ: bow,
        bodyShiftX: 0,
        heightFactor: 1.0 + Math.max(0, -bow) * 0.18,
        bloomRatio: 0.35 + open * 0.60,
        armHeightL: 0.2 + open * 0.9,
        armHeightR: 0.2 + open * 0.9,
        armExtensionL: open * 0.9,
        armExtensionR: open * 0.9,
        armStretchUp: open * 0.5,
        wingspanSpread: open * 0.95,
        legLiftL: 0,
        legLiftR: 0,
        headGazeX: 0,
        headGazeY: -bow * 0.4,
        energy: 0.2 + open * 0.2
      };
    }
  }
];

// Generates frame array from generator function
function bakePreseededFrames(flowerDef) {
  const numFrames = Math.round(flowerDef.duration * flowerDef.fps);
  const frames = [];
  for (let i = 0; i < numFrames; i++) {
    const t = (i / flowerDef.fps);
    frames.push(flowerDef.generator(t));
  }
  return frames;
}

// -------------------------------------------------------------------------------------
// PROCEDURAL MEADOW GENERATION (100+ FLOWERS WITH RANDOM MOVEMENTS)
// -------------------------------------------------------------------------------------
const BOTANICAL_NAMES = [
  'Surya Kiran (Sunbeam)', 'Breeze of Varanasi', 'Genda Festive Glow', 'Flame of Vasant',
  'Midnight Mogra Dream', 'Devcon Sacred Bloom', 'Crimson Shakti', 'Monsoon Garland',
  'Temple Champa Offering', 'Ananda Golden Bloom', 'Rhythm of Malhar', 'Ganga Radiance',
  'Gulmohar Fire Canopy', 'Dusk Sandhya Glow', 'Kashi Morning Whisper', 'Narmada Gentle Ripple',
  'Nilgiri Cloud Blossom', 'Thanjavur Temple Lotus', 'Chitrakoot Dawn Petal', 'Mandala Solar Spiral',
  'Raga Bhairav Sunrise', 'Vedic Amber Blossom', 'Sandalwood Twilight', 'Jaipur Royal Marigold',
  'Kerala Monsoon Canopy', 'Himalayan Snow Mogra', 'Sundarbans Wild Orchid', 'Brahmaputra Crest',
  'Konark Sun Chariot', 'Ajanta Floral Mural', 'Ellora Stone Blossom', 'Shivalik Pine Bloom',
  'Pushkar Sacred Lake', 'Vrindavan Kadamba', 'Rishikesh Ganga Aarti', 'Darjeeling Mist Flower',
  'Udaipur Lake Palace', 'Hampi Royal Lotus', 'Madurai Jasmine Wave', 'Mysore Sandal Petal',
  'Coromandel Sea Breeze', 'Malabar Coast Garland', 'Ladakh Starlight Bloom', 'Deccan Plateau Gold',
  'Ganges Water Lily', 'Sundar Niloufar', 'Parijat Celestial Drop', 'Ashoka Grove Blossom',
  'Kadamb Rain Offering', 'Kachnar Pink Radiance', 'Rohida Desert Bloom', 'Neelakurinji Once-in-12',
  'Brahma Kamal Sacred', 'Siris Silk Flower', 'Harshringar Night Jasmine', 'Amaltas Golden Shower',
  'Palash Forest Fire', 'Champa Scented Dawn', 'Kaner Golden Bell', 'Gulab Indian Rose',
  'Kamal Pure Lotus', 'Marigold Sun Offering', 'Champak Golden Radiance', 'Parijat Dewdrop'
];

const CHOREOGRAPHER_POOL = [
  'Aarav (Varanasi)', 'Kavita (Shantiniketan)', 'Meera (Bengaluru)', 'Vikram (Delhi)',
  'Devcon Community', 'Ananya (Mumbai)', 'Rohan (Pune)', 'Priya (Jaipur)',
  'Siddharth (Chennai)', 'Tanya (Kochi)', 'Aditya (Ahmedabad)', 'Sanya (Lucknow)',
  'Nikhil (Goa)', 'Ishaan (Shimla)', 'Zara (Hyderabad)', 'Rhea (Chandigarh)',
  'Kabir (Amritsar)', 'Devcon Global Collective', 'Divya (Patna)', 'Arjun (Bhopal)',
  'Tara (Indore)', 'Manish (Surat)', 'Isha (Vadodara)', 'Pranav (Nagpur)',
  'Shreya (Coimbatore)', 'Karthik (Madurai)', 'Varun (Visakhapatnam)', 'Sneha (Guwahati)',
  'Maya (Pondicherry)', 'Amit (Rishikesh)', 'Simran (Dehradun)', 'Gaurav (Udaipur)'
];

export function createRandomMovementProfile(seed) {
  const rand = (offset = 0) => {
    const x = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  const STYLES = ['sway', 'reach', 'breathe', 'monsoon', 'bow', 'spiral'];
  const style = STYLES[Math.floor(rand(1) * STYLES.length)];
  const duration = Number((6.5 + rand(2) * 5.5).toFixed(1)); // 6.5s to 12.0s seamless loop

  return {
    style: style,
    duration: duration,
    phase1: rand(3) * Math.PI * 2,
    phase2: rand(4) * Math.PI * 2,
    phase3: rand(5) * Math.PI * 2,
    phase4: rand(6) * Math.PI * 2,
    swayAmpX: Number((0.25 + rand(7) * 0.45).toFixed(3)),
    swayAmpZ: Number((0.15 + rand(8) * 0.35).toFixed(3)),
    swayHarmonic: rand(9) > 0.5 ? 2 : 1,
    bloomBase: Number((0.35 + rand(10) * 0.35).toFixed(3)),
    bloomAmp: Number((0.30 + rand(11) * 0.45).toFixed(3)),
    armHeightBase: Number((0.30 + rand(12) * 0.55).toFixed(3)),
    armHeightAmp: Number((0.35 + rand(13) * 0.55).toFixed(3)),
    wingspanBase: Number((0.40 + rand(14) * 0.40).toFixed(3)),
    wingspanAmp: Number((0.30 + rand(15) * 0.50).toFixed(3)),
    heightBase: Number((0.98 + rand(16) * 0.08).toFixed(3)),
    heightAmp: Number((0.08 + rand(17) * 0.16).toFixed(3)),
    energy: Number((0.25 + rand(18) * 0.45).toFixed(2))
  };
}

export function evaluateMovementProfile(p, t, duration) {
  const w = (2 * Math.PI) / (duration > 0 ? duration : 8.0);

  let sway = 0;
  let bow = 0;
  let bloom = 0.5;
  let armH_L = 0.5;
  let armH_R = 0.5;
  let armExt_L = 0.5;
  let armExt_R = 0.5;
  let wingspan = 0.5;
  let armStretch = 0;
  let height = 1.0;
  let bodyShift = 0;

  switch (p.style) {
    case 'reach': {
      // Reaching skyward with high branches, radiant pulsing bloom
      const reach = Math.sin(w * t + p.phase1) * 0.5 + 0.5;
      sway = Math.sin(w * t + p.phase2) * p.swayAmpX * 0.5;
      bow = Math.cos(w * t + p.phase3) * p.swayAmpZ * 0.3;
      height = p.heightBase + reach * p.heightAmp;
      bloom = THREE.MathUtils.clamp(p.bloomBase + reach * p.bloomAmp, 0.2, 1.0);
      armH_L = 0.8 + reach * 0.65;
      armH_R = 0.8 + reach * 0.65;
      armStretch = reach * 0.9;
      armExt_L = 0.6 + reach * 0.6;
      armExt_R = 0.6 + reach * 0.6;
      wingspan = THREE.MathUtils.clamp(p.wingspanBase + reach * p.wingspanAmp, 0.2, 1.3);
      break;
    }
    case 'breathe': {
      // Gentle meditative breathing, hypnotic petal unfurling
      const breathe = Math.sin(w * t + p.phase1) * 0.5 + 0.5;
      sway = Math.cos(w * t + p.phase2) * p.swayAmpX * 0.45;
      bow = Math.sin(w * t + p.phase3) * p.swayAmpZ * 0.25;
      height = p.heightBase + breathe * 0.08;
      bloom = THREE.MathUtils.clamp(0.25 + breathe * 0.70, 0.15, 1.0);
      armH_L = p.armHeightBase + breathe * p.armHeightAmp;
      armH_R = p.armHeightBase + breathe * p.armHeightAmp;
      armExt_L = p.wingspanBase + breathe * 0.4;
      armExt_R = p.wingspanBase + breathe * 0.4;
      wingspan = p.wingspanBase + breathe * 0.6;
      armStretch = breathe * 0.4;
      break;
    }
    case 'monsoon': {
      // Dynamic asymmetric wave (one arm up, one arm down alternating)
      sway = Math.sin(w * t * 2 + p.phase1) * p.swayAmpX;
      bow = Math.cos(w * t * 2 + p.phase2) * p.swayAmpZ * 0.5;
      bodyShift = sway * 0.7;
      armH_L = THREE.MathUtils.clamp(0.75 + Math.sin(w * t + p.phase3) * 0.6, 0.1, 1.4);
      armH_R = THREE.MathUtils.clamp(0.75 - Math.sin(w * t + p.phase3) * 0.6, 0.1, 1.4);
      armExt_L = 0.8 + Math.cos(w * t + p.phase4) * 0.4;
      armExt_R = 0.8 - Math.cos(w * t + p.phase4) * 0.4;
      wingspan = THREE.MathUtils.clamp(p.wingspanBase + Math.abs(Math.sin(w * t)) * p.wingspanAmp, 0.3, 1.35);
      bloom = THREE.MathUtils.clamp(p.bloomBase + Math.sin(w * t * 2 + p.phase1) * p.bloomAmp, 0.2, 1.0);
      height = p.heightBase + Math.sin(w * t) * p.heightAmp;
      break;
    }
    case 'bow': {
      // Reverence front bow, dipping low then rising tall to bloom
      bow = Math.sin(w * t + p.phase1) * p.swayAmpZ * 1.2;
      sway = Math.sin(w * t * 2 + p.phase2) * p.swayAmpX * 0.4;
      const rise = Math.max(0, -bow);
      height = p.heightBase + rise * 0.25 - Math.max(0, bow) * 0.15;
      bloom = THREE.MathUtils.clamp(p.bloomBase + rise * p.bloomAmp, 0.15, 1.0);
      armH_L = THREE.MathUtils.clamp(0.25 + rise * 1.1, 0.05, 1.4);
      armH_R = THREE.MathUtils.clamp(0.25 + rise * 1.1, 0.05, 1.4);
      wingspan = THREE.MathUtils.clamp(p.wingspanBase + rise * p.wingspanAmp, 0.15, 1.25);
      armStretch = rise * 0.85;
      break;
    }
    case 'spiral': {
      // Circular vortex whirl
      sway = Math.sin(w * t + p.phase1) * p.swayAmpX;
      bow = Math.cos(w * t + p.phase1) * p.swayAmpZ;
      bodyShift = sway * 0.6;
      bloom = THREE.MathUtils.clamp(p.bloomBase + Math.sin(w * t * 2 + p.phase2) * p.bloomAmp, 0.25, 1.0);
      armH_L = THREE.MathUtils.clamp(p.armHeightBase + Math.sin(w * t + p.phase3) * p.armHeightAmp, 0.1, 1.3);
      armH_R = THREE.MathUtils.clamp(p.armHeightBase + Math.cos(w * t + p.phase4) * p.armHeightAmp, 0.1, 1.3);
      wingspan = THREE.MathUtils.clamp(p.wingspanBase + Math.sin(w * t * 2) * p.wingspanAmp, 0.25, 1.25);
      height = p.heightBase + Math.sin(w * t * 2 + p.phase2) * p.heightAmp * 0.5;
      break;
    }
    case 'sway':
    default: {
      // Wind & Sun Sweeper
      sway = Math.sin(w * t * p.swayHarmonic + p.phase1) * p.swayAmpX;
      bow = Math.sin(w * t + p.phase2) * p.swayAmpZ;
      bodyShift = sway * 0.65;
      bloom = THREE.MathUtils.clamp(p.bloomBase + Math.sin(w * t + p.phase3) * p.bloomAmp, 0.2, 1.0);
      armH_L = THREE.MathUtils.clamp(p.armHeightBase + Math.sin(w * t + p.phase2) * p.armHeightAmp, 0.1, 1.3);
      armH_R = THREE.MathUtils.clamp(p.armHeightBase + Math.sin(w * t + p.phase2) * p.armHeightAmp, 0.1, 1.3);
      armExt_L = THREE.MathUtils.clamp(p.wingspanBase + Math.sin(w * t * 2 + p.phase4) * 0.4, 0.1, 1.2);
      armExt_R = THREE.MathUtils.clamp(p.wingspanBase + Math.sin(w * t * 2 + p.phase4) * 0.4, 0.1, 1.2);
      wingspan = THREE.MathUtils.clamp(p.wingspanBase + Math.sin(w * t * 2 + p.phase4) * p.wingspanAmp, 0.2, 1.3);
      height = p.heightBase + Math.sin(w * t * 2) * p.heightAmp;
      break;
    }
  }

  return {
    spineLeanX: sway,
    spineLeanZ: bow,
    bodyShiftX: bodyShift,
    heightFactor: height,
    bloomRatio: bloom,
    armHeightL: armH_L,
    armHeightR: armH_R,
    armExtensionL: armExt_L,
    armExtensionR: armExt_R,
    armStretchUp: armStretch,
    wingspanSpread: wingspan,
    legLiftL: 0,
    legLiftR: 0,
    headGazeX: sway * 0.4,
    headGazeY: (armH_L + armH_R) * 0.25 - bow * 0.3,
    energy: p.energy || 0.35
  };
}

export function generateProceduralMeadowFlowers(count, startIndex, meadowSlots) {
  const SPECIES_KEYS = ['lotus', 'marigold', 'hibiscus', 'mogra', 'palash', 'gulmohar', 'champa'];
  const flowers = [];

  for (let i = 0; i < count; i++) {
    const globalIdx = startIndex + i;
    const slot = meadowSlots[globalIdx % meadowSlots.length];
    const species = SPECIES_KEYS[globalIdx % SPECIES_KEYS.length];
    const name = BOTANICAL_NAMES[globalIdx % BOTANICAL_NAMES.length];
    const choreographer = CHOREOGRAPHER_POOL[globalIdx % CHOREOGRAPHER_POOL.length];
    const profile = createRandomMovementProfile(globalIdx + 42);

    const jitterX = (Math.sin(globalIdx * 3.7) * 0.2);
    const jitterZ = (Math.cos(globalIdx * 2.3) * 0.2);

    flowers.push({
      id: `communal_procedural_${globalIdx}`,
      name: name,
      choreographer: choreographer,
      species: species,
      duration: profile.duration,
      fps: 20,
      position: {
        x: Number((slot.x + jitterX).toFixed(2)),
        y: 0,
        z: Number((slot.z + jitterZ).toFixed(2))
      },
      rotationY: slot.rotY,
      scale: slot.scale,
      timestamp: Date.now() - 3600000 * (100 - i),
      profile: profile
    });
  }

  return flowers;
}

// -------------------------------------------------------------------------------------
// CHOREOGRAPHY RECORDER
// Records a visitor's physical body dance from tracker kinematics over a 10-second window
// and captures a real 10s video stream of the 3D flower for email delivery & export.
// -------------------------------------------------------------------------------------
export class ChoreographyRecorder {
  constructor(tracker, canvasProvider = null, options = {}) {
    this.tracker = tracker;
    this.canvasProvider = canvasProvider;
    this.postcardCanvasProvider = options.postcardCanvasProvider || null;
    this.onPostcardFrame = options.onPostcardFrame || null;
    this.isRecording = false;
    this.isCountingDown = false;
    this.countdownTimer = null;
    this.recordTimer = null;
    this.sampleInterval = null;
    this.recordedFrames = [];
    this.duration = options.duration || 10.0; // 10 seconds choreography window
    this.fps = options.fps || 20;        // 20 samples per second
    this.startTime = 0;
    this.mediaRecorder = null;
    this.videoChunks = [];
    this.recordedVideoBlob = null;
    this.postcardMediaRecorder = null;
    this.postcardChunks = [];
    this.recordedPostcardVideoBlob = null;
    this.recordCanvas = null;
    this.recordCtx = null;
    this.recordAnimFrame = null;
  }

  getBestVideoMimeType() {
    if (typeof MediaRecorder === 'undefined') return '';
    const codecCandidates = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    for (const candidate of codecCandidates) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }
    return '';
  }

  startCountdown(onCountdownTick, onStartRecording, onProgress, onComplete, countdownSeconds = 5) {
    if (this.isRecording || this.isCountingDown) return;
    this.isCountingDown = true;
    let count = countdownSeconds || 5;
    onCountdownTick(count);

    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        onCountdownTick(count);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.isCountingDown = false;
        onStartRecording();
        this.beginCapture(onProgress, onComplete);
      }
    }, 1000);
  }

  beginCapture(onProgress, onComplete) {
    this.isRecording = true;
    this.recordedFrames = [];
    this.videoChunks = [];
    this.recordedVideoBlob = null;
    this.postcardChunks = [];
    this.recordedPostcardVideoBlob = null;
    this.startTime = performance.now();
    const intervalMs = 1000 / this.fps;

    const sourceCanvas = typeof this.canvasProvider === 'function' ? this.canvasProvider() : this.canvasProvider;
    if (sourceCanvas && typeof MediaRecorder !== 'undefined') {
      try {
        // Enforce 16:9 recording resolution (1280x720) centered on the flower,
        // discarding any extra horizontal margins on widescreen displays.
        const targetWidth = 1280;
        const targetHeight = 720;
        const targetAspect = 16 / 9;

        // Helper to draw only the 16:9 region centered on the main flower
        const draw16to9FlowerFrame = () => {
          if (!this.recordCtx || !sourceCanvas) return;
          const sw = sourceCanvas.width;
          const sh = sourceCanvas.height;
          if (sw <= 0 || sh <= 0) return;

          const srcAspect = sw / sh;
          let sx, sy, sWidth, sHeight;

          if (srcAspect >= targetAspect) {
            // Screen is wider than 16:9 (laptops, monitors, ultra-wides, split-view).
            // Retain full vertical framing (from soil to bloom crown),
            // and trim off the excess horizontal space on left & right.
            sHeight = sh;
            sWidth = sh * targetAspect;
            sx = (sw - sWidth) * 0.5;
            sy = 0;
            this.recordCtx.drawImage(
              sourceCanvas,
              sx, sy, sWidth, sHeight,
              0, 0, targetWidth, targetHeight
            );
          } else if (srcAspect >= 1.50) {
            // Screen is slightly narrower than 16:9 (e.g. 16:10 MacBook)
            // Fit full width and ALWAYS start at the top (sy = 0) so the flower
            // crown and open sky headroom are 100% preserved!
            sWidth = sw;
            sHeight = sw / targetAspect;
            sx = 0;
            sy = 0;
            this.recordCtx.drawImage(
              sourceCanvas,
              sx, sy, sWidth, sHeight,
              0, 0, targetWidth, targetHeight
            );
          } else {
            // Screen is distinctly narrower/vertical (tablets 4:3, square, portrait)
            // Fit full vertical height into 720p so neither top nor bottom is ever cropped!
            const scale = targetHeight / sh;
            const scaledW = sw * scale;
            const destX = (targetWidth - scaledW) * 0.5;
            this.recordCtx.fillStyle = '#b6c7b7'; // Soft daylight mist matching 3D scene fog
            this.recordCtx.fillRect(0, 0, targetWidth, targetHeight);
            this.recordCtx.drawImage(
              sourceCanvas,
              0, 0, sw, sh,
              destX, 0, scaledW, targetHeight
            );
          }
        };

        // 1. Standard 16:9 HD Recording Canvas (mounted offscreen in DOM so Safari processes frames)
        this.recordCanvas = document.createElement('canvas');
        this.recordCanvas.width = targetWidth;
        this.recordCanvas.height = targetHeight;
        this.recordCanvas.id = 'raw-video-record-canvas';
        this.recordCanvas.style.position = 'fixed';
        this.recordCanvas.style.left = '-9999px';
        this.recordCanvas.style.top = '-9999px';
        this.recordCanvas.style.width = '1px';
        this.recordCanvas.style.height = '1px';
        this.recordCanvas.style.opacity = '0.01';
        this.recordCanvas.style.pointerEvents = 'none';
        this.recordCanvas.setAttribute('aria-hidden', 'true');
        if (typeof document !== 'undefined' && document.body) {
          document.body.appendChild(this.recordCanvas);
        }
        this.recordCtx = this.recordCanvas.getContext('2d');
        draw16to9FlowerFrame();

        let stream = null;
        try {
          stream = this.recordCanvas.captureStream(25);
        } catch (_) {}
        if (!stream && sourceCanvas.captureStream) {
          stream = sourceCanvas.captureStream(25);
        }

        const mime = this.getBestVideoMimeType();
        const options = { videoBitsPerSecond: 1200000 };
        if (mime) options.mimeType = mime;

        if (stream) {
          this.mediaRecorder = new MediaRecorder(stream, options);
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.videoChunks.push(e.data);
            }
          };
          this.mediaRecorder.start(250);
        }

        // 2. Vertical 9:16 Postcard Video Stream
        const postcardCanvas = typeof this.postcardCanvasProvider === 'function' ? this.postcardCanvasProvider() : this.postcardCanvasProvider;
        if (postcardCanvas && postcardCanvas.captureStream) {
          try {
            const pStream = postcardCanvas.captureStream(25);
            const pOptions = { videoBitsPerSecond: 1200000 };
            if (mime) pOptions.mimeType = mime;
            this.postcardMediaRecorder = new MediaRecorder(pStream, pOptions);
            this.postcardMediaRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                this.postcardChunks.push(e.data);
              }
            };
            this.postcardMediaRecorder.start(250);
          } catch (pErr) {
            console.warn('[ChoreographyRecorder] Postcard simultaneous recorder error (will fallback to post-composite):', pErr);
          }
        }

        // Continuous frame pump copying WebGL frames to recording canvas & updating postcard canvas
        this.recordAnimFrame = null;
        const pumpFrames = () => {
          if (!this.isRecording) return;
          try {
            draw16to9FlowerFrame();
            if (typeof this.onPostcardFrame === 'function') {
              this.onPostcardFrame();
            }
          } catch (_) {}
          this.recordAnimFrame = requestAnimationFrame(pumpFrames);
        };
        this.recordAnimFrame = requestAnimationFrame(pumpFrames);
      } catch (err) {
        console.warn('Canvas MediaRecorder stream capture not initialized:', err);
      }
    }

    this.sampleInterval = setInterval(() => {
      const elapsedSec = (performance.now() - this.startTime) / 1000;
      const progress = Math.min(1.0, elapsedSec / this.duration);

      // Snapshot active kinematics directly
      const k = this.tracker.kinematics;
      const t = this.tracker.targets || {};
      this.recordedFrames.push({
        spineLeanX: Number((k.spineLeanX ?? t.spineLeanX ?? 0).toFixed(3)),
        spineLeanZ: Number((k.spineLeanZ ?? t.spineLeanZ ?? 0).toFixed(3)),
        bodyShiftX: Number((k.bodyShiftX ?? t.bodyShiftX ?? 0).toFixed(3)),
        heightFactor: Number((k.heightFactor ?? t.heightFactor ?? 1.0).toFixed(3)),
        bloomRatio: Number((k.bloomRatio ?? t.bloomRatio ?? 0.65).toFixed(3)),
        armHeightL: Number((k.armHeightL ?? t.armHeightL ?? 0.48).toFixed(3)),
        armHeightR: Number((k.armHeightR ?? t.armHeightR ?? 0.48).toFixed(3)),
        armExtensionL: Number((k.armExtensionL ?? t.armExtensionL ?? 0).toFixed(3)),
        armExtensionR: Number((k.armExtensionR ?? t.armExtensionR ?? 0).toFixed(3)),
        armStretchUp: Number((k.armStretchUp ?? t.armStretchUp ?? 0).toFixed(3)),
        wingspanSpread: Number((k.wingspanSpread ?? t.wingspanSpread ?? 0).toFixed(3)),
        legLiftL: Number((k.legLiftL ?? t.legLiftL ?? 0).toFixed(3)),
        legLiftR: Number((k.legLiftR ?? t.legLiftR ?? 0).toFixed(3)),
        headGazeX: Number((k.headGazeX ?? t.headGazeX ?? 0).toFixed(3)),
        headGazeY: Number((k.headGazeY ?? t.headGazeY ?? 0).toFixed(3)),
        energy: Number((k.energy ?? t.energy ?? 0).toFixed(3)),
        namasteBranchCount: Number(this.tracker?.namasteCount || 0)
      });

      onProgress(progress, elapsedSec);

      if (elapsedSec >= this.duration) {
        this.finishCapture(onComplete);
      }
    }, intervalMs);
  }

  finishCapture(onComplete) {
    if (!this.isRecording) return;
    clearInterval(this.sampleInterval);
    this.sampleInterval = null;
    this.isRecording = false;

    if (this.recordAnimFrame) {
      cancelAnimationFrame(this.recordAnimFrame);
      this.recordAnimFrame = null;
    }

    if (this.recordCanvas && this.recordCanvas.parentElement) {
      this.recordCanvas.parentElement.removeChild(this.recordCanvas);
    }

    // Smooth loop boundary so start and end loop seamlessly
    this.smoothLoopBoundary();

    const finalize = () => {
      const result = {
        duration: this.duration,
        fps: this.fps,
        frames: this.recordedFrames,
        videoBlob: this.recordedVideoBlob,
        postcardVideoBlob: this.recordedPostcardVideoBlob,
        namasteBranchCount: Number(this.tracker?.namasteCount || 0)
      };
      onComplete(result);
    };

    let pendingStops = 0;
    const checkAllStopped = () => {
      if (pendingStops <= 0) finalize();
    };

    // 1. Stop Raw MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      pendingStops++;
      try {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.requestData();
        }
      } catch (_) {}
      this.mediaRecorder.onstop = () => {
        if (this.videoChunks.length > 0) {
          const type = this.mediaRecorder.mimeType || 'video/mp4';
          this.recordedVideoBlob = new Blob(this.videoChunks, { type });
          console.log(`[ChoreographyRecorder] Raw video capture complete: ${this.recordedVideoBlob.size} bytes (${(this.recordedVideoBlob.size / 1024 / 1024).toFixed(2)} MB), mime=${type}`);
        }
        pendingStops--;
        checkAllStopped();
      };
      try {
        this.mediaRecorder.stop();
      } catch (_) {
        pendingStops--;
        checkAllStopped();
      }
    }

    // 2. Stop Postcard MediaRecorder
    if (this.postcardMediaRecorder && this.postcardMediaRecorder.state !== 'inactive') {
      pendingStops++;
      try {
        if (this.postcardMediaRecorder.state === 'recording') {
          this.postcardMediaRecorder.requestData();
        }
      } catch (_) {}
      this.postcardMediaRecorder.onstop = () => {
        if (this.postcardChunks.length > 0) {
          const type = this.postcardMediaRecorder.mimeType || 'video/mp4';
          this.recordedPostcardVideoBlob = new Blob(this.postcardChunks, { type });
          console.log(`[ChoreographyRecorder] Postcard video capture complete: ${this.recordedPostcardVideoBlob.size} bytes (${(this.recordedPostcardVideoBlob.size / 1024 / 1024).toFixed(2)} MB), mime=${type}`);
        }
        pendingStops--;
        checkAllStopped();
      };
      try {
        this.postcardMediaRecorder.stop();
      } catch (_) {
        pendingStops--;
        checkAllStopped();
      }
    }

    if (pendingStops === 0) {
      finalize();
    }
  }

  smoothLoopBoundary() {
    if (this.recordedFrames.length < 10) return;
    const blendCount = 8;
    const total = this.recordedFrames.length;

    for (let i = 0; i < blendCount; i++) {
      const alpha = (i + 1) / (blendCount + 1);
      const head = this.recordedFrames[i];
      const tail = this.recordedFrames[total - blendCount + i];

      for (const key of Object.keys(head)) {
        const blended = head[key] * alpha + tail[key] * (1 - alpha);
        tail[key] = blended;
      }
    }
  }

  cancel() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.sampleInterval) clearInterval(this.sampleInterval);
    if (this.recordAnimFrame) {
      cancelAnimationFrame(this.recordAnimFrame);
      this.recordAnimFrame = null;
    }
    if (this.recordCanvas && this.recordCanvas.parentElement) {
      this.recordCanvas.parentElement.removeChild(this.recordCanvas);
    }
    this.recordCanvas = null;
    this.recordCtx = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch (_) {}
    }
    if (this.postcardMediaRecorder && this.postcardMediaRecorder.state !== 'inactive') {
      try { this.postcardMediaRecorder.stop(); } catch (_) {}
    }
    this.isCountingDown = false;
    this.isRecording = false;
    this.recordedFrames = [];
    this.videoChunks = [];
    this.recordedVideoBlob = null;
    this.postcardChunks = [];
    this.recordedPostcardVideoBlob = null;
  }
}

// -------------------------------------------------------------------------------------
// COMMUNAL GARDEN MANAGER
// Manages the ever-growing collective field of dancing Indian flowers
// -------------------------------------------------------------------------------------
export class CommunityGardenManager {
  constructor(scene, garden) {
    this.scene = scene;
    this.garden = garden;
    this.storageKey = 'botanical_garden_choreographies_v4';
    this.plantedFlowers = []; // array of { meta, plant, playbackTime, phaseOffset }
    this.meadowSlots = this.generateMeadowSlots();
    this.selectedFlower = null;

    try {
      localStorage.removeItem('botanical_garden_choreographies_v1');
      localStorage.removeItem('botanical_garden_choreographies_v2');
      localStorage.removeItem('botanical_garden_choreographies_v3');
    } catch (_) {}

    this.initGarden();
  }

  // Generates concentric organic slots in the meadow glade around the hero flower (supporting 150+ blooms)
  generateMeadowSlots() {
    const slots = [];
    // Ring 1 (Flanking hero flower in intimate glade)
    slots.push({ x: -2.1, z: -0.6, rotY: 0.28, scale: 0.95 });
    slots.push({ x: 2.1, z: -0.6, rotY: -0.28, scale: 0.95 });
    slots.push({ x: -2.7, z: -1.3, rotY: 0.40, scale: 0.92 });
    slots.push({ x: 2.7, z: -1.3, rotY: -0.40, scale: 0.92 });
    slots.push({ x: 0.0, z: -1.8, rotY: 0.0, scale: 0.90 });

    // Ring 2 (Immediate next user-planted slots - close, bold, visible!)
    slots.push({ x: -1.2, z: -1.0, rotY: 0.22, scale: 0.94 });
    slots.push({ x: 1.2, z: -1.0, rotY: -0.22, scale: 0.94 });
    slots.push({ x: -3.4, z: -0.6, rotY: 0.48, scale: 0.95 });
    slots.push({ x: 3.4, z: -0.6, rotY: -0.48, scale: 0.95 });
    slots.push({ x: -1.7, z: -1.9, rotY: 0.28, scale: 0.90 });
    slots.push({ x: 1.7, z: -1.9, rotY: -0.28, scale: 0.90 });
    slots.push({ x: 0.0, z: -2.5, rotY: 0.0, scale: 0.88 });

    // Ring 3 (Amphitheater meadow horizon)
    slots.push({ x: -3.5, z: -1.8, rotY: 0.52, scale: 0.88 });
    slots.push({ x: 3.5, z: -1.8, rotY: -0.52, scale: 0.88 });
    slots.push({ x: -2.3, z: -2.6, rotY: 0.35, scale: 0.85 });
    slots.push({ x: 2.3, z: -2.6, rotY: -0.35, scale: 0.85 });
    slots.push({ x: -1.2, z: -3.2, rotY: 0.18, scale: 0.82 });
    slots.push({ x: 1.2, z: -3.2, rotY: -0.18, scale: 0.82 });

    // Concentric procedural expansion for up to 150+ visitor flowers in natural amphitheater
    const totalSlots = 150;
    for (let i = slots.length; i < totalSlots; i++) {
      const t = (i - 16) / (totalSlots - 16);
      const r = 3.2 + Math.sqrt(t) * 11.2; // Radius expands from 3.2m to 14.4m
      // Natural organic arc spanning balanced left-to-right (-75° to +75°) across the field
      const theta = (((i * 0.6180339887) % 1.0) - 0.5) * Math.PI * 0.92;
      const x = Math.sin(theta) * r;
      const z = -Math.cos(theta) * r - 0.8;
      const scale = THREE.MathUtils.clamp(0.85 - t * 0.30, 0.55, 0.85);
      const rotY = Math.atan2(-x, -z) + (Math.sin(i * 1.7) * 0.25);
      slots.push({
        x: Number(x.toFixed(2)),
        z: Number(z.toFixed(2)),
        rotY: Number(rotY.toFixed(2)),
        scale: Number(scale.toFixed(2))
      });
    }

    return slots;
  }

  initGarden() {
    let savedList = [];
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) savedList = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read saved garden choreographies:', e);
    }

    if (!savedList || savedList.length === 0) {
      // 1. Bake signature pre-seeded communal flowers
      const initialSignatures = PRESEEDED_FLOWERS.map((def) => ({
        id: def.id,
        name: def.name,
        choreographer: def.choreographer,
        species: def.species,
        duration: def.duration,
        fps: def.fps,
        position: def.position,
        rotationY: def.rotationY,
        scale: def.scale,
        timestamp: def.timestamp,
        frames: bakePreseededFrames(def)
      }));

      // 2. Expand up to 100 flowers with organic random movements!
      const needed = 100 - initialSignatures.length;
      const proceduralMeadow = generateProceduralMeadowFlowers(needed, initialSignatures.length, this.meadowSlots);
      savedList = initialSignatures.concat(proceduralMeadow);
      this.saveToStorage(savedList);
    } else if (savedList.length < 100) {
      // If previous storage had fewer than 100 flowers, top it up to 100!
      const needed = 100 - savedList.length;
      const additional = generateProceduralMeadowFlowers(needed, savedList.length, this.meadowSlots);
      savedList = savedList.concat(additional);
      this.saveToStorage(savedList);
    }

    // Instantiate living plants for all 100+ choreographies
    savedList.forEach((flowerData, idx) => {
      this.instantiatePlantedFlower(flowerData, idx);
    });
  }

  instantiatePlantedFlower(flowerData, slotIndex = 0) {
    const species = flowerData.species || 'lotus';
    // Instantiate in streamlined 'communal' mode to easily support 100+ dancing flowers at 60 FPS
    const plant = new LivingPlant(species, 'communal');

    // Determine position from flowerData or next meadow slot
    const slot = this.meadowSlots[slotIndex % this.meadowSlots.length];
    const pos = flowerData.position || { x: slot.x, y: 0, z: slot.z };
    const rotY = flowerData.rotationY !== undefined ? flowerData.rotationY : slot.rotY;
    const scale = flowerData.scale !== undefined ? flowerData.scale : slot.scale;

    plant.setPosition(pos.x, 0, pos.z);
    plant.setRotationY(rotY);
    plant.setScale(scale);

    // Recreate any extra branches sprouted via Namaste gesture (1 Namaste = 1 branch, capped to 2)
    const extraBranches = Math.min(2, Math.max(0, flowerData.namasteBranchCount || flowerData.extraBranches ||
      (Array.isArray(flowerData.frames) && flowerData.frames.length > 0
        ? Math.max(0, ...flowerData.frames.map(f => f.namasteBranchCount || 0))
        : 0)));
    if (extraBranches > 0 && typeof plant.sproutNamasteBranch === 'function') {
      for (let b = 0; b < extraBranches; b++) {
        plant.sproutNamasteBranch();
      }
    }

    // Tag the 3D group for raycasting / inspection
    plant.group.userData = {
      isPlantedFlower: true,
      flowerId: flowerData.id,
      name: flowerData.name,
      choreographer: flowerData.choreographer,
      species: flowerData.species
    };

    if (this.flowersVisible !== undefined) {
      plant.group.visible = this.flowersVisible;
    }

    this.scene.add(plant.group);

    const record = {
      meta: flowerData,
      plant: plant,
      playbackTime: (slotIndex * 1.6) % (flowerData.duration || 8.0), // Staggered phase offset for harmonious choir
      phaseOffset: slotIndex * 0.75
    };

    this.plantedFlowers.push(record);
    return record;
  }

  // Toggles visibility of all planted communal flowers (hidden on Mac creator screen, visible on TV screen)
  setFlowersVisible(visible) {
    this.flowersVisible = visible;
    this.plantedFlowers.forEach((f) => {
      if (f.plant && f.plant.group) {
        f.plant.group.visible = visible;
      }
    });
  }

  // Receives and instantiates real-time blooms broadcasted from the Mac screen to the TV
  handleRemoteBloom(flowerData) {
    if (!flowerData || !flowerData.id) return null;
    const exists = this.plantedFlowers.some((f) => f.meta.id === flowerData.id);
    if (exists) return null;

    const slotIdx = this.plantedFlowers.length;
    const record = this.instantiatePlantedFlower(flowerData, slotIdx);
    if (this.garden) {
      this.garden.addSporeBurst(80);
      this.garden.focusPlantedFlower(record);
    }
    return record;
  }

  plantNewFlower({ name, choreographer, species, frames, duration, fps, namasteBranchCount, extraBranches }) {
    const slotIdx = this.plantedFlowers.length;
    const slot = this.meadowSlots[slotIdx % this.meadowSlots.length];

    // Slight organic jitter so no two flowers look completely identical
    const jitterX = (Math.random() - 0.5) * 0.35;
    const jitterZ = (Math.random() - 0.5) * 0.35;

    const flowerData = {
      id: 'flower_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: name || 'Indian Sacred Bloom',
      choreographer: choreographer || 'Anonymous Choreographer',
      species: species || 'lotus',
      duration: duration || 8.0,
      fps: fps || 20,
      position: { x: Number((slot.x + jitterX).toFixed(2)), y: 0, z: Number((slot.z + jitterZ).toFixed(2)) },
      rotationY: Number((slot.rotY + (Math.random() - 0.5) * 0.2).toFixed(2)),
      scale: Number((slot.scale * (0.92 + Math.random() * 0.14)).toFixed(2)),
      namasteBranchCount: Math.min(2, Math.max(0, namasteBranchCount || extraBranches || 0)),
      timestamp: Date.now(),
      frames: frames
    };

    // Instantiate in 3D scene
    const record = this.instantiatePlantedFlower(flowerData, slotIdx);

    // Save to persistent storage
    const currentList = this.getSerializedList();
    currentList.push(flowerData);
    this.saveToStorage(currentList);

    // Trigger visual celebratory gust
    if (this.garden) {
      this.garden.addSporeBurst(50);
    }
    record.plant.triggerGust();

    return record;
  }

  saveToStorage(list) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable:', e);
    }
  }

  getSerializedList() {
    return this.plantedFlowers.map(f => f.meta);
  }

  getPlantedFlowers() {
    return this.plantedFlowers;
  }

  // Updates and loops choreography for all planted flowers in the garden
  update(dt) {
    for (let i = 0; i < this.plantedFlowers.length; i++) {
      const f = this.plantedFlowers[i];

      // Procedural movement profile evaluation (100% smooth trigonometric kinematics)
      if (f.meta.profile) {
        const duration = f.meta.duration > 0 ? f.meta.duration : 8.0;
        f.playbackTime = ((f.playbackTime || 0) + dt) % duration;
        const kinematics = evaluateMovementProfile(f.meta.profile, f.playbackTime, duration);
        f.plant.update(kinematics, dt);
        continue;
      }

      const frames = f.meta.frames;
      if (!frames || frames.length === 0) continue;

      const duration = f.meta.duration > 0 ? f.meta.duration : 8.0;
      f.playbackTime = ((f.playbackTime || 0) + dt) % duration;
      const totalFrames = frames.length;
      if (totalFrames === 0) continue;

      const exactIndex = THREE.MathUtils.clamp((f.playbackTime / duration) * totalFrames, 0, totalFrames - 0.001);
      const idxA = Math.floor(exactIndex) % totalFrames;
      const idxB = (idxA + 1) % totalFrames;
      const blend = exactIndex - Math.floor(exactIndex);

      const frameA = frames[idxA] || frames[0] || {};
      const frameB = frames[idxB] || frameA;

      // Smooth interpolation between recorded frames
      const interpolated = {
        spineLeanX: THREE.MathUtils.lerp(frameA.spineLeanX ?? 0, frameB.spineLeanX ?? 0, blend),
        spineLeanZ: THREE.MathUtils.lerp(frameA.spineLeanZ ?? 0, frameB.spineLeanZ ?? 0, blend),
        bodyShiftX: THREE.MathUtils.lerp(frameA.bodyShiftX ?? 0, frameB.bodyShiftX ?? 0, blend),
        heightFactor: THREE.MathUtils.lerp(frameA.heightFactor ?? 1.0, frameB.heightFactor ?? 1.0, blend),
        bloomRatio: THREE.MathUtils.lerp(frameA.bloomRatio ?? 0.65, frameB.bloomRatio ?? 0.65, blend),
        armHeightL: THREE.MathUtils.lerp(frameA.armHeightL ?? 0.48, frameB.armHeightL ?? 0.48, blend),
        armHeightR: THREE.MathUtils.lerp(frameA.armHeightR ?? 0.48, frameB.armHeightR ?? 0.48, blend),
        armExtensionL: THREE.MathUtils.lerp(frameA.armExtensionL ?? 0, frameB.armExtensionL ?? 0, blend),
        armExtensionR: THREE.MathUtils.lerp(frameA.armExtensionR ?? 0, frameB.armExtensionR ?? 0, blend),
        armStretchUp: THREE.MathUtils.lerp(frameA.armStretchUp ?? 0, frameB.armStretchUp ?? 0, blend),
        wingspanSpread: THREE.MathUtils.lerp(frameA.wingspanSpread ?? 0, frameB.wingspanSpread ?? 0, blend),
        legLiftL: THREE.MathUtils.lerp(frameA.legLiftL ?? 0, frameB.legLiftL ?? 0, blend),
        legLiftR: THREE.MathUtils.lerp(frameA.legLiftR ?? 0, frameB.legLiftR ?? 0, blend),
        headGazeX: THREE.MathUtils.lerp(frameA.headGazeX ?? 0, frameB.headGazeX ?? 0, blend),
        headGazeY: THREE.MathUtils.lerp(frameA.headGazeY ?? 0, frameB.headGazeY ?? 0, blend),
        energy: THREE.MathUtils.lerp(frameA.energy ?? 0, frameB.energy ?? 0, blend)
      };

      // Animate living plant instance
      f.plant.update(interpolated, dt);
    }
  }

  // Raycasting for clicking on a flower in the 3D scene
  findFlowerAtRay(raycaster) {
    const plantGroups = this.plantedFlowers.map(f => f.plant.group);
    const intersects = raycaster.intersectObjects(plantGroups, true);
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && hitObj.parent && hitObj.parent !== this.scene) {
        if (hitObj.userData && hitObj.userData.isPlantedFlower) {
          return this.plantedFlowers.find(f => f.meta.id === hitObj.userData.flowerId);
        }
        hitObj = hitObj.parent;
      }
    }
    return null;
  }
}
