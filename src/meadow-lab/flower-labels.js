import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ── Name pools ──────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Luna', 'Sora', 'Mira', 'Zara', 'Asha', 'Nova', 'Vera', 'Lyra',
  'Aria', 'Cleo', 'Iris', 'Reva', 'Elan', 'Tara', 'Opal', 'Sage',
  'Finn', 'Zion', 'Kai', 'Rumi', 'Cruz', 'Theo', 'Beau', 'Luca',
  'Juno', 'Ren', 'Wren', 'Nico', 'Dara', 'Skye', 'Pax', 'Ember',
  'Fern', 'Reed', 'Orion', 'Poet', 'Blaze', 'River', 'Storm', 'Dawn'
];

const FLOWER_WORDS = [
  'Bloom', 'Petal', 'Blossom', 'Drift', 'Champa', 'Crown', 'Glow',
  'Reach', 'Sway', 'Whisper', 'Spark', 'Burst', 'Wave', 'Breath',
  'Rise', 'Float', 'Curl', 'Flare', 'Haze', 'Mist', 'Dew', 'Shine'
];

export const FEATURED_FLOWER_NAMES = [
  'Luna Bloom',
  'Nova Drift',
  'Ember Glow',
  'Storm Petal',
  'Iris Sway',
  'Wren Rise'
];

/**
 * Build a shuffled deck of every first×word combination.
 * This guarantees names like "Luna Bloom" always appear — no luck needed.
 */
function buildNameDeck() {
  const deck = [];
  for (const first of FIRST_NAMES) {
    for (const word of FLOWER_WORDS) {
      deck.push(`${first} ${word}`);
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Shared deck — rebuilt each time initMeadow runs (via reset())
let _deck = [];
let _deckIdx = 0;

export function resetNameDeck() {
  const fullDeck = buildNameDeck();
  const remaining = fullDeck.filter(name => !FEATURED_FLOWER_NAMES.includes(name));
  // Guarantee the 6 selectable flowers are the very first 6 in the meadow
  _deck = [...FEATURED_FLOWER_NAMES, ...remaining];
  _deckIdx = 0;
}

resetNameDeck();

export function nextName() {
  if (_deckIdx >= _deck.length) {
    // Exhausted — rebuild and restart
    _deck = buildNameDeck();
    _deckIdx = 0;
  }
  return _deck[_deckIdx++];
}

// ── FlowerLabelSystem ────────────────────────────────────────────────────────
export class FlowerLabelSystem {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {HTMLElement} container  – same container that holds the WebGL canvas
   */
  constructor(scene, camera, container) {
    this.scene     = scene;
    this.camera    = camera;
    this.container = container;
    this.labels    = [];   // { css2dObj, pill, name, flowerGroup, highlighted }
    this.visible   = false;

    // CSS2D renderer layered on top of the WebGL canvas
    this.css2dRenderer = new CSS2DRenderer();
    this.css2dRenderer.setSize(container.clientWidth || window.innerWidth,
                               container.clientHeight || window.innerHeight);
    Object.assign(this.css2dRenderer.domElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      zIndex: '5'
    });
    container.appendChild(this.css2dRenderer.domElement);

    window.addEventListener('resize', () => {
      this.css2dRenderer.setSize(container.clientWidth || window.innerWidth,
                                 container.clientHeight || window.innerHeight);
    });
  }

  /** Attach a floating label to a Three.js Group (flower.group) */
  addLabel(flowerGroup, name = null, metadata = {}) {
    const tagName = name || nextName();
    const choreographer = metadata.choreographer || '';
    const species = metadata.species || '';
    const isPlanted = !!metadata.isPlanted;

    const author = (choreographer && choreographer !== 'Devcon Botanical Lab' && choreographer !== 'Devcon Community Glade' && choreographer !== 'Devcon Gardener') ? choreographer : '';

    // Build the DOM pill
    const pill = document.createElement('div');
    pill.className = 'flower-name-tag' + (isPlanted ? ' tag-planted' : '');
    
    if (isPlanted) {
      pill.innerHTML = `<span class="tag-badge">🌱</span><span class="tag-title">${tagName}</span>${author ? `<span class="tag-author">by ${author}</span>` : ''}`;
    } else {
      pill.innerHTML = `<span class="tag-title">${tagName}</span>${author ? `<span class="tag-author">by ${author}</span>` : ''}`;
    }
    pill.dataset.flowerName = tagName.toLowerCase();

    const obj = new CSS2DObject(pill);
    // Float the label directly above the bloom crown
    obj.position.set(0, 2.35, 0);
    flowerGroup.add(obj);

    const record = {
      css2dObj: obj,
      pill,
      name: tagName,
      choreographer,
      species,
      flowerGroup,
      isPlanted,
      highlighted: false
    };

    this.labels.push(record);
    return tagName;
  }

  /**
   * Helper: Normalize string for robust, case-agnostic comparison
   */
  normalizeStr(str) {
    if (!str) return '';
    return String(str)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Search – highlights matching labels, dims others.
   * Completely case-agnostic (handles uppercase, lowercase, mixed case, accents).
   * Matches flower title/message, choreographer, or species name.
   */
  search(query) {
    const q = this.normalizeStr(query);
    if (q.length === 0) {
      this.clearSearch();
      return 0;
    }

    let matchCount = 0;

    this.labels.forEach(lbl => {
      const nameNorm = this.normalizeStr(lbl.name);
      const authorNorm = this.normalizeStr(lbl.choreographer);
      const speciesNorm = this.normalizeStr(lbl.species);

      // Case-agnostic substring match across name, choreographer, or species
      const matches = nameNorm.includes(q) || authorNorm.includes(q) || speciesNorm.includes(q);
      lbl.highlighted = matches;

      lbl.pill.classList.toggle('tag-match', matches);
      lbl.pill.classList.toggle('tag-dimmed', !matches);

      if (matches) matchCount++;
    });

    return matchCount;
  }

  /** Clear all search highlights */
  clearSearch() {
    this.labels.forEach(lbl => {
      lbl.highlighted = false;
      lbl.pill.classList.remove('tag-match', 'tag-dimmed');
    });
  }

  /**
   * Returns the first matched label entry (for camera fly-to).
   * Completely case-agnostic.
   */
  firstMatch(query) {
    const q = this.normalizeStr(query);
    if (q.length === 0) return null;

    return this.labels.find(lbl => {
      const nameNorm = this.normalizeStr(lbl.name);
      const authorNorm = this.normalizeStr(lbl.choreographer);
      const speciesNorm = this.normalizeStr(lbl.species);
      return nameNorm.includes(q) || authorNorm.includes(q) || speciesNorm.includes(q);
    }) || null;
  }

  /** Show / hide all labels */
  setVisible(v) {
    this.visible = v;
    this.css2dRenderer.domElement.style.display = v ? '' : 'none';
  }

  /** Returns a random name from the current label set (for UI hints) */
  randomExampleName() {
    if (this.labels.length === 0) return 'Luna Bloom';
    const idx = Math.floor(Math.random() * this.labels.length);
    return this.labels[idx].name;
  }

  /** Called every frame after the WebGL render */
  update() {
    this.css2dRenderer.render(this.scene, this.camera);
  }
}

