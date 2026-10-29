import * as THREE from 'three';
import {
  PoppyMorphology,
  PeriwinkleMorphology,
  ChamomileMorphology,
  MeadowChaliceMorphology,
  MarigoldMorphology,
  CeladonBellMorphology,
  OriginalLotusMorphology,
  OriginalHibiscusMorphology
} from './flower-geometries.js';
import { PoeticFlower } from './poetic-flower.js';
import { BodyTracker } from '../tracker.js';
import { CHOREOGRAPHY_PRESETS } from './choreography-simulator.js';

class BotanicalGeometryLab {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    // View State
    this.viewMode = 'inspection'; // 'inspection' or 'exhibition'
    this.selectedSpecies = 'poppy';
    this.isWireframe = false;
    this.isAutoRotate = true;
    this.currentBloom = 0.70;

    // Choreography & Vision State
    this.choreographySource = 'simulated'; // 'simulated' | 'webcam'
    this.currentPreset = 'surya';
    this.isPlaying = true;
    this.simTime = 0;
    this.simSpeed = 1.0;
    this.tracker = null;
    this.isCameraActive = false;
    this.isInitializingCamera = false;
    this.isUserOverridingBloom = false;
    this.isLegStanceEnabled = true; // Option 4: Stem Stance & Pelvic Weight-Shift Balancing

    // Active Kinematics
    this.kinematics = {
      spineLeanX: 0,
      spineLeanZ: 0,
      heightFactor: 1.0,
      bloomRatio: 0.70,
      armHeightL: 0.5,
      armHeightR: 0.5,
      wingspanSpread: 0.5,
      energy: 0.2,
      isVisitorPresent: true
    };

    // Mouse Navigation State
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.cameraSpherical = {
      radius: 2.8,
      theta: 0.25,
      phi: 1.20
    };
    this.targetSpherical = { ...this.cameraSpherical };
    this.targetLookAt = new THREE.Vector3(0, 1.25, 0);
    this.currentLookAt = new THREE.Vector3(0, 1.25, 0);

    // Initialize 3D & Vision Systems
    this.initScene();
    this.initModels();
    this.initControls();
    this.initVisionTracker();
    this.selectSpecies(this.selectedSpecies);
    this.startLoop();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x131a15);
    this.scene.fog = new THREE.FogExp2(0x131a15, 0.045);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xe8f0ea, 0x142018, 0.85);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    keyLight.position.set(3.5, 6.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x70d8a5, 1.2);
    rimLight.position.set(-4.0, 3.5, -3.5);
    this.scene.add(rimLight);

    // Studio Circular Pedestal Floor
    const floorGeo = new THREE.CylinderGeometry(6.5, 6.8, 0.15, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a241d,
      roughness: 0.85,
      metalness: 0.1
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.position.y = -0.075;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Floating Luminous Ring around pedestal
    const ringGeo = new THREE.RingGeometry(2.2, 2.23, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe8c15a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI * 0.5;
    ringMesh.position.y = 0.005;
    this.scene.add(ringMesh);

    this.setupMouseEvents();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  initModels() {
    this.models = {
      poppy: {
        instance: new PoppyMorphology(),
        specs: {
          commonName: 'Wild Poppy (Corn Poppy)',
          latinName: 'Papaver rhoeas',
          family: 'Papaveraceae',
          petals: '4 broad crinkled/ruffled petals in 2 decussate pairs',
          core: 'Urn-shaped Papaver seed capsule with 10-ray velvety stigmatic disc crown',
          foliage: 'Articulated 5-segment continuous stem with left/right lateral branches, sculpted foliage, and companion wild poppy buds responding to hands & legs',
          note: 'True 3D ruffled paper folds mathematically computed with harmonic sine-flutter across width.'
        }
      },
      periwinkle: {
        instance: new PeriwinkleMorphology(),
        specs: {
          commonName: 'Periwinkle (Lesser Periwinkle)',
          latinName: 'Vinca minor',
          family: 'Apocynaceae',
          petals: '5 asymmetrical salverform pinwheel/propeller blades',
          core: 'Slender pentagonal tubular throat with pale white coronal star eye',
          foliage: 'Continuous articulated curved stem with lateral branching florets and glossy foliage responding to hands & legs',
          note: 'Features an oblique skew algorithm where each petal sweeps angularly outward.'
        }
      },
      chamomile: {
        instance: new ChamomileMorphology(),
        specs: {
          commonName: 'Chamomile Wheat',
          latinName: 'Matricaria chamomilla',
          family: 'Asteraceae',
          petals: '16 slender linear-elliptical horizontal/reflexed ray florets',
          core: 'Conical raised golden disk dome packed with tubular disk florets',
          foliage: 'Continuous articulated curving stem with feathery chamomile branching florets and foliage responding to hands & legs',
          note: 'Iconic golden central button dome surrounded by radiating ray petals.'
        }
      },
      marigold: {
        instance: new MarigoldMorphology(),
        specs: {
          commonName: 'Festive Indian Marigold',
          latinName: 'Tagetes erecta (Genda)',
          family: 'Asteraceae',
          petals: '4 concentric whorls of 42 fluted ruffled saffron-orange spatulate petals',
          core: 'Conical golden disk dome and tight floral bud calyx',
          foliage: 'Continuous articulated curving stem with lateral marigold floret buds and lush foliage',
          note: 'Iconic auspicious Indian festival bloom with warm saffron-to-gold gradient petals.'
        }
      },
      celadon: {
        instance: new MarigoldMorphology(),
        specs: {
          commonName: 'Festive Indian Marigold',
          latinName: 'Tagetes erecta (Genda)',
          family: 'Asteraceae',
          petals: '4 concentric whorls of 42 fluted ruffled saffron-orange spatulate petals',
          core: 'Conical golden disk dome and tight floral bud calyx',
          foliage: 'Continuous articulated curving stem with lateral marigold floret buds and lush foliage',
          note: 'Iconic auspicious Indian festival bloom with warm saffron-to-gold gradient petals.'
        }
      },
      chalice: {
        instance: new MeadowChaliceMorphology(),
        specs: {
          commonName: 'Meadow Cupped Chalice',
          latinName: 'Ranunculus / Anemone style',
          family: 'Ranunculaceae style',
          petals: '6 cupped overlapping chalice petals + 3 inner protective petals',
          core: 'Central golden pollen torus with surrounding anthers',
          foliage: 'Continuous single articulated curving stem with companion chalice florets and foliage',
          note: 'Single unified continuous spine matching the other meadow flora.'
        }
      },
      lotus: {
        instance: new OriginalLotusMorphology(),
        specs: {
          commonName: 'Sacred Indian Lotus (Original Model)',
          latinName: 'Nelumbo nucifera',
          family: 'Nelumbonaceae (From Main Installation)',
          petals: 'Multi-tiered water-lily petal whorls with rose-pink tips',
          core: 'Iconic flat-topped golden lotus torus seed pod with circular carpels',
          foliage: 'Central peltate stem with sacred floating lotus leaf pads',
          note: 'The authentic original geometry from the main installation codebase (src/plant.js).'
        }
      },
      hibiscus: {
        instance: new OriginalHibiscusMorphology(),
        specs: {
          commonName: 'Royal Sacred Hibiscus (Original Model)',
          latinName: 'Hibiscus rosa-sinensis',
          family: 'Malvaceae (From Main Installation)',
          petals: '5 broad radiant scarlet trumpet petals with scalloped margin',
          core: 'Dramatic 12-inch staminal column projecting outward with golden anthers',
          foliage: 'Serrated ovate leaves with prominent veins',
          note: 'The authentic original geometry from the main installation codebase (src/plant.js).'
        }
      }
    };

    // Add all models to scene
    Object.keys(this.models).forEach((key) => {
      const m = this.models[key];
      this.scene.add(m.instance.group);
    });

    this.positionModels();
  }

  positionModels() {
    const keys = Object.keys(this.models);

    if (this.viewMode === 'inspection') {
      keys.forEach(k => {
        const m = this.models[k];
        if (k === this.selectedSpecies) {
          m.instance.group.visible = true;
          m.instance.group.position.set(0, 0, 0);
          m.instance.group.rotation.y = 0;
        } else {
          m.instance.group.visible = false;
        }
      });
      this.targetLookAt.set(0, 1.20, 0);
    } else {
      const total = keys.length;
      keys.forEach((k, idx) => {
        const m = this.models[k];
        m.instance.group.visible = true;

        const ang = ((idx / (total - 1)) - 0.5) * 1.5;
        const radius = 3.6;
        const x = Math.sin(ang) * radius;
        const z = -Math.cos(ang) * radius + 3.0;

        m.instance.group.position.set(x, 0, z);
        m.instance.group.rotation.y = -ang * 0.7;
      });
      this.targetLookAt.set(0, 1.10, 0);
    }
  }

  selectSpecies(speciesKey) {
    if (!this.models[speciesKey]) return;
    this.selectedSpecies = speciesKey;
    this.positionModels();

    // Update specs card
    const m = this.models[speciesKey];
    const s = m.specs;

    const nameEl = document.getElementById('spec-name');
    const latinEl = document.getElementById('spec-latin');
    const familyEl = document.getElementById('spec-family');
    const petalsEl = document.getElementById('spec-petals');
    const coreEl = document.getElementById('spec-core');
    const notesEl = document.getElementById('spec-notes');

    if (nameEl) nameEl.textContent = s.commonName;
    if (latinEl) latinEl.textContent = s.latinName;
    if (familyEl) familyEl.textContent = s.family;
    if (petalsEl) petalsEl.textContent = s.petals;
    if (coreEl) coreEl.textContent = s.core;
    if (notesEl) notesEl.textContent = s.note;

    // Update active button
    document.querySelectorAll('.species-pill').forEach(btn => {
      if (btn.dataset.species === speciesKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.applyWireframe();
    this.applyBloom();
  }

  applyWireframe() {
    Object.keys(this.models).forEach(k => {
      const inst = this.models[k].instance;
      if (inst && typeof inst.setWireframe === 'function') {
        inst.setWireframe(this.isWireframe);
      } else if (inst && inst.group) {
        inst.group.traverse(child => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.wireframe = this.isWireframe);
            } else {
              child.material.wireframe = this.isWireframe;
            }
          }
        });
      }
    });
  }

  applyBloom() {
    Object.keys(this.models).forEach(k => {
      const inst = this.models[k].instance;
      if (inst && typeof inst.setBloom === 'function') {
        inst.setBloom(this.currentBloom);
      } else if (inst && typeof inst.applyKinematics === 'function') {
        inst.applyKinematics({ bloomRatio: this.currentBloom });
      }
    });
    const valText = document.getElementById('bloom-val');
    if (valText) valText.textContent = `${Math.round(this.currentBloom * 100)}%`;
  }

  /* =========================================================================
     WEBCAM & SKELETON TRACKING
     ========================================================================= */
  initVisionTracker() {
    const video = document.getElementById('webcam-feed');
    const skeletonCanvas = document.getElementById('skeleton-canvas');

    this.tracker = new BodyTracker({
      video,
      skeletonCanvas,
      onStatusChange: (status, message) => {
        this.updateVisionStatus(status, message);
      }
    });
  }

  setLegStanceBalancing(enabled) {
    this.isLegStanceEnabled = !!enabled;
    Object.values(this.models).forEach(m => {
      if (m && m.instance) {
        if (typeof m.instance.setStanceBalancing === 'function') {
          m.instance.setStanceBalancing(this.isLegStanceEnabled);
        } else if (m.instance.stem && typeof m.instance.stem.setStanceBalancing === 'function') {
          m.instance.stem.setStanceBalancing(this.isLegStanceEnabled);
        }
      }
    });

    const btn = document.getElementById('btn-toggle-stance');
    const btnText = document.getElementById('btn-stance-text');
    if (btn) btn.classList.toggle('active', this.isLegStanceEnabled);
    if (btnText) btnText.textContent = this.isLegStanceEnabled ? 'Stance Balance: ON' : 'Stance Balance: OFF';
  }

  updateVisionStatus(status, message) {
    const statusDot = document.getElementById('pip-status-dot');
    const statusMsg = document.getElementById('pip-status-msg');
    const btnLabel = document.getElementById('btn-toggle-cam-label');
    const btnToggle = document.getElementById('btn-toggle-cam');
    const overlayHint = document.getElementById('pip-overlay-hint');

    if (statusMsg) statusMsg.textContent = message;

    if (status === 'tracking') {
      if (statusDot) {
        statusDot.className = 'pip-status-dot live';
      }
      if (btnLabel) btnLabel.textContent = 'Stop Webcam';
      if (btnToggle) btnToggle.classList.add('active');
      if (overlayHint) overlayHint.classList.add('hidden');
      this.isCameraActive = true;
    } else if (status === 'loading') {
      if (statusDot) {
        statusDot.className = 'pip-status-dot loading';
      }
      if (btnLabel) btnLabel.textContent = 'Loading...';
      if (overlayHint) overlayHint.classList.remove('hidden');
    } else if (status === 'prompt') {
      if (statusDot) {
        statusDot.className = 'pip-status-dot loading';
      }
      if (btnLabel) btnLabel.textContent = 'Allow Camera...';
    } else {
      if (statusDot) {
        statusDot.className = 'pip-status-dot';
      }
      if (btnLabel) btnLabel.textContent = 'Start Webcam';
      if (btnToggle) btnToggle.classList.remove('active');
      this.isCameraActive = false;
    }
  }

  async toggleWebcam() {
    if (this.isInitializingCamera) return;

    if (!this.isCameraActive) {
      this.isInitializingCamera = true;
      this.choreographySource = 'webcam';
      this.updateSourceUI();

      // Pause auto-rotation so visitor lean aligns directly to front-facing camera coordinates
      this.isAutoRotate = false;
      const btnRotate = document.getElementById('btn-rotate');
      if (btnRotate) btnRotate.classList.remove('active');
      this.targetSpherical.theta = 0.0;

      try {
        if (!this.tracker.landmarker) {
          await this.tracker.initialize();
        } else {
          await this.tracker.startCamera();
        }
      } catch (err) {
        console.warn('Webcam start failed:', err);
      } finally {
        this.isInitializingCamera = false;
      }
    } else {
      // Stop webcam stream
      if (this.tracker.video && this.tracker.video.srcObject) {
        const stream = this.tracker.video.srcObject;
        stream.getTracks().forEach(t => t.stop());
        this.tracker.video.srcObject = null;
      }
      this.tracker.useWebcam = false;
      this.tracker.clearSkeletonCanvas();
      this.updateVisionStatus('idle', 'Camera stopped. Select Simulated Dance below to preview motions.');
      this.isCameraActive = false;

      // Switch back to simulated dance
      this.choreographySource = 'simulated';
      this.updateSourceUI();
    }
  }

  updateSourceUI() {
    const btnSim = document.getElementById('btn-source-sim');
    const btnCam = document.getElementById('btn-source-cam');
    const danceContainer = document.getElementById('dance-pills-container');

    if (this.choreographySource === 'webcam') {
      if (btnCam) btnCam.classList.add('active');
      if (btnSim) btnSim.classList.remove('active');
      if (danceContainer) danceContainer.style.opacity = '0.45';
    } else {
      if (btnSim) btnSim.classList.add('active');
      if (btnCam) btnCam.classList.remove('active');
      if (danceContainer) danceContainer.style.opacity = '1.0';
    }
  }

  /* =========================================================================
     INTERACTION CONTROLS
     ========================================================================= */
  initControls() {
    // 1. Species Selector Pills
    document.querySelectorAll('.species-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectSpecies(btn.dataset.species);
      });
    });

    // 2. View Mode Switcher
    const inspectBtn = document.getElementById('btn-mode-inspect');
    const galleryBtn = document.getElementById('btn-mode-gallery');

    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        this.viewMode = 'inspection';
        inspectBtn.classList.add('active');
        if (galleryBtn) galleryBtn.classList.remove('active');
        this.targetSpherical.radius = 2.8;
        this.positionModels();
      });
    }

    if (galleryBtn) {
      galleryBtn.addEventListener('click', () => {
        this.viewMode = 'exhibition';
        galleryBtn.classList.add('active');
        if (inspectBtn) inspectBtn.classList.remove('active');
        this.targetSpherical.radius = 5.6;
        this.targetSpherical.phi = 1.15;
        this.positionModels();
      });
    }

    // 3. Wireframe Toggle
    const wireframeBtn = document.getElementById('btn-wireframe');
    if (wireframeBtn) {
      wireframeBtn.addEventListener('click', () => {
        this.isWireframe = !this.isWireframe;
        wireframeBtn.classList.toggle('active', this.isWireframe);
        this.applyWireframe();
      });
    }

    // 4. Turntable Auto-Rotate Toggle
    const rotateBtn = document.getElementById('btn-rotate');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        this.isAutoRotate = !this.isAutoRotate;
        rotateBtn.classList.toggle('active', this.isAutoRotate);
      });
    }

    // 5. Bloom Slider (Manual override)
    const bloomSlider = document.getElementById('bloom-slider');
    if (bloomSlider) {
      bloomSlider.addEventListener('input', (e) => {
        this.isUserOverridingBloom = true;
        this.currentBloom = parseFloat(e.target.value);
        this.kinematics.bloomRatio = this.currentBloom;
        this.applyBloom();
      });
      bloomSlider.addEventListener('change', () => {
        // Allow choreography to resume driving bloom after 3 seconds of inactivity
        setTimeout(() => {
          this.isUserOverridingBloom = false;
        }, 3000);
      });
    }

    // 6. Webcam Toggle Button
    const camBtn = document.getElementById('btn-toggle-cam');
    if (camBtn) {
      camBtn.addEventListener('click', () => {
        this.toggleWebcam();
      });
    }

    // 7. PiP Minimize / Expand Button
    const minBtn = document.getElementById('btn-min-pip');
    const pipCard = document.getElementById('webcam-pip-card');
    if (minBtn && pipCard) {
      minBtn.addEventListener('click', () => {
        pipCard.classList.toggle('minimized');
        minBtn.textContent = pipCard.classList.contains('minimized') ? '◻' : '─';
      });
    }

    // 7b. Bottom Control Dock Minimize / Expand
    const minDockBtn = document.getElementById('btn-min-dock');
    const dockMinIcon = document.getElementById('dock-min-icon');
    const dockMinText = document.getElementById('dock-min-text');
    const labDock = document.getElementById('lab-dock');

    const toggleDockMinimize = () => {
      if (!labDock) return;
      const isMin = labDock.classList.toggle('minimized');
      if (dockMinIcon) dockMinIcon.textContent = isMin ? '▲' : '─';
      if (dockMinText) dockMinText.textContent = isMin ? 'Expand Controls' : 'Minimize Dock';
    };

    if (minDockBtn) {
      minDockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDockMinimize();
      });
    }

    if (labDock) {
      labDock.addEventListener('click', (e) => {
        if (labDock.classList.contains('minimized')) {
          toggleDockMinimize();
        }
      });
    }

    // Keyboard shortcut 'm' or 'h' to minimize bottom dock
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') {
        toggleDockMinimize();
      } else if (e.key === 'b' || e.key === 'B') {
        this.setLegStanceBalancing(!this.isLegStanceEnabled);
      } else if (e.key === '[' || e.key === 'z' || e.key === 'Z') {
        if (this.tracker) {
          this.tracker.targets.legLiftL = this.tracker.targets.legLiftL > 0.3 ? 0.0 : 0.95;
          this.tracker.targets.legLiftR = 0.0;
        }
      } else if (e.key === ']' || e.key === 'x' || e.key === 'X') {
        if (this.tracker) {
          this.tracker.targets.legLiftR = this.tracker.targets.legLiftR > 0.3 ? 0.0 : 0.95;
          this.tracker.targets.legLiftL = 0.0;
        }
      }
    });

    const btnStance = document.getElementById('btn-toggle-stance');
    if (btnStance) {
      btnStance.addEventListener('click', () => {
        this.setLegStanceBalancing(!this.isLegStanceEnabled);
      });
    }

    const btnLegL = document.getElementById('btn-leg-left');
    if (btnLegL) {
      btnLegL.addEventListener('click', () => {
        if (this.tracker) {
          const nextVal = (this.tracker.targets.legLiftL || 0) > 0.3 ? 0.0 : 0.95;
          this.tracker.targets.legLiftL = nextVal;
          this.tracker.targets.legLiftR = 0.0;
          btnLegL.classList.toggle('active', nextVal > 0);
          btnLegR?.classList.remove('active');
        }
      });
    }

    const btnLegR = document.getElementById('btn-leg-right');
    if (btnLegR) {
      btnLegR.addEventListener('click', () => {
        if (this.tracker) {
          const nextVal = (this.tracker.targets.legLiftR || 0) > 0.3 ? 0.0 : 0.95;
          this.tracker.targets.legLiftR = nextVal;
          this.tracker.targets.legLiftL = 0.0;
          btnLegR.classList.toggle('active', nextVal > 0);
          btnLegL?.classList.remove('active');
        }
      });
    }

    const gaugeLegsBox = document.getElementById('gauge-legs')?.parentElement;
    if (gaugeLegsBox) {
      gaugeLegsBox.style.cursor = 'pointer';
      gaugeLegsBox.title = 'Click to test leg lift foliage response';
      gaugeLegsBox.addEventListener('click', () => {
        if (this.tracker) {
          if ((this.tracker.targets.legLiftL || 0) < 0.3 && (this.tracker.targets.legLiftR || 0) < 0.3) {
            this.tracker.targets.legLiftL = 0.95;
            this.tracker.targets.legLiftR = 0.0;
          } else if ((this.tracker.targets.legLiftL || 0) >= 0.3) {
            this.tracker.targets.legLiftL = 0.0;
            this.tracker.targets.legLiftR = 0.95;
          } else {
            this.tracker.targets.legLiftL = 0.0;
            this.tracker.targets.legLiftR = 0.0;
          }
        }
      });
    }

    // 8. Choreography Source Buttons
    const btnSim = document.getElementById('btn-source-sim');
    const btnCam = document.getElementById('btn-source-cam');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        this.choreographySource = 'simulated';
        this.updateSourceUI();
      });
    }
    if (btnCam) {
      btnCam.addEventListener('click', () => {
        this.choreographySource = 'webcam';
        this.updateSourceUI();
        if (!this.isCameraActive) {
          this.toggleWebcam();
        }
      });
    }

    // 9. Simulated Dance Preset Pills
    document.querySelectorAll('.dance-pill[data-preset]').forEach(pill => {
      pill.addEventListener('click', () => {
        this.currentPreset = pill.dataset.preset;
        this.simTime = 0;
        this.choreographySource = 'simulated';
        this.updateSourceUI();

        document.querySelectorAll('.dance-pill[data-preset]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // 10. Play / Pause Button
    const playPauseBtn = document.getElementById('btn-play-pause');
    const playIcon = document.getElementById('play-pause-icon');
    const playText = document.getElementById('play-pause-text');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        if (playIcon) playIcon.textContent = this.isPlaying ? '⏸️' : '▶️';
        if (playText) playText.textContent = this.isPlaying ? 'Pause' : 'Play';
      });
    }
  }

  setupMouseEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse = { x: e.clientX, y: e.clientY };

      this.targetSpherical.theta -= dx * 0.007;
      this.targetSpherical.phi -= dy * 0.007;
      this.targetSpherical.phi = THREE.MathUtils.clamp(this.targetSpherical.phi, 0.25, Math.PI * 0.48);
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const minR = this.viewMode === 'inspection' ? 1.4 : 2.5;
      const maxR = this.viewMode === 'inspection' ? 4.8 : 8.5;
      this.targetSpherical.radius += e.deltaY * 0.003;
      this.targetSpherical.radius = THREE.MathUtils.clamp(this.targetSpherical.radius, minR, maxR);
    }, { passive: false });
  }

  updateCameraPosition() {
    this.cameraSpherical.theta += (this.targetSpherical.theta - this.cameraSpherical.theta) * 0.08;
    this.cameraSpherical.phi += (this.targetSpherical.phi - this.cameraSpherical.phi) * 0.08;
    this.cameraSpherical.radius += (this.targetSpherical.radius - this.cameraSpherical.radius) * 0.08;
    this.currentLookAt.lerp(this.targetLookAt, 0.08);

    const x = this.cameraSpherical.radius * Math.sin(this.cameraSpherical.phi) * Math.sin(this.cameraSpherical.theta);
    const y = this.cameraSpherical.radius * Math.cos(this.cameraSpherical.phi);
    const z = this.cameraSpherical.radius * Math.sin(this.cameraSpherical.phi) * Math.cos(this.cameraSpherical.theta);

    this.camera.position.set(x + this.currentLookAt.x, y + this.currentLookAt.y, z + this.currentLookAt.z);
    this.camera.lookAt(this.currentLookAt);
  }

  onResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  /* =========================================================================
     LIVE GAUGES HUD UPDATE
     ========================================================================= */
  updateGauges(k, postureText) {
    const gBloom = document.getElementById('gauge-bloom');
    const gHeight = document.getElementById('gauge-height');
    const gLean = document.getElementById('gauge-lean');
    const gWingspan = document.getElementById('gauge-wingspan');
    const postTag = document.getElementById('live-posture-text');
    const fpsTag = document.getElementById('pip-fps-tag');

    if (gBloom && k.bloomRatio !== undefined) {
      gBloom.textContent = `${Math.round(k.bloomRatio * 100)}%`;
    }
    if (gHeight && k.heightFactor !== undefined) {
      gHeight.textContent = `${k.heightFactor.toFixed(2)}x`;
    }
    if (gLean && k.spineLeanX !== undefined) {
      const deg = Math.round(k.spineLeanX * 35);
      if (Math.abs(deg) < 2) {
        gLean.textContent = '0° (Center)';
      } else if (deg < 0) {
        gLean.textContent = `Left ${Math.abs(deg)}°`;
      } else {
        gLean.textContent = `Right ${Math.abs(deg)}°`;
      }
    }
    if (gWingspan && k.wingspanSpread !== undefined) {
      gWingspan.textContent = k.wingspanSpread.toFixed(2);
    }
    if (postTag && postureText) {
      postTag.textContent = postureText;
    }

    const gArms = document.getElementById('gauge-arms');
    const gLegs = document.getElementById('gauge-legs');

    if (gArms) {
      const avgArm = ((k.armHeightL || 0.5) + (k.armHeightR || 0.5)) * 0.5;
      if (avgArm > 0.78) {
        gArms.textContent = '↑ Skyward';
      } else if (avgArm < 0.28) {
        gArms.textContent = '↓ Drooping';
      } else {
        gArms.textContent = 'Neutral';
      }
    }

    if (gLegs) {
      const legL = k.legLiftL || 0;
      const legR = k.legLiftR || 0;
      if (legL > 0.15 && legR > 0.15) {
        gLegs.textContent = this.isLegStanceEnabled ? '⚖️ Both Shift' : 'Both Legs ↑';
        gLegs.style.color = '#7de8a8';
      } else if (legL > 0.15) {
        gLegs.textContent = this.isLegStanceEnabled ? '⚖️ Crane L' : 'Left Lift';
        gLegs.style.color = '#5cb88f';
      } else if (legR > 0.15) {
        gLegs.textContent = this.isLegStanceEnabled ? '⚖️ Crane R' : 'Right Lift';
        gLegs.style.color = '#5cb88f';
      } else {
        gLegs.textContent = 'Grounded';
        gLegs.style.color = '';
      }
    }

    if (fpsTag && this.tracker) {
      fpsTag.textContent = `${this.tracker.fps || 30} FPS`;
    }

    // Synchronize bloom slider if user is not manually adjusting it
    if (!this.isUserOverridingBloom) {
      const bloomSlider = document.getElementById('bloom-slider');
      const valText = document.getElementById('bloom-val');
      if (bloomSlider && k.bloomRatio !== undefined) {
        bloomSlider.value = k.bloomRatio.toFixed(2);
      }
      if (valText && k.bloomRatio !== undefined) {
        valText.textContent = `${Math.round(k.bloomRatio * 100)}%`;
      }
    }
  }

  deriveVisitorPosture(k) {
    if (!k.isVisitorPresent) {
      return 'Resting Meadow • Waiting for Visitor';
    }
    if ((k.legLiftL || 0) > 0.32) {
      return this.isLegStanceEnabled 
        ? 'Left Leg Lift • Crane Stance & Pelvic Counter-Arch' 
        : 'Left Leg Lift • Static Stance';
    }
    if ((k.legLiftR || 0) > 0.32) {
      return this.isLegStanceEnabled 
        ? 'Right Leg Lift • Crane Stance & Pelvic Counter-Arch' 
        : 'Right Leg Lift • Static Stance';
    }
    if (k.armHeightL > 0.78 && k.armHeightR > 0.78) {
      return 'Hands High Skyward • Branches Reaching Up';
    }
    if (k.armHeightL < 0.28 && k.armHeightR < 0.28) {
      return 'Hands Resting Down • Branches Drooping';
    }
    if (k.wingspanSpread > 0.75) {
      return 'Open Wingspan • Branches & Petals Wide';
    }
    if (Math.abs(k.spineLeanX) > 0.35) {
      return k.spineLeanX > 0 ? 'Right Arc Sway • Lateral Stem Flex' : 'Left Arc Sway • Lateral Stem Flex';
    }
    if (k.spineLeanZ > 0.35) {
      return 'Deep Humble Bow • Stem Curvature';
    }
    if (k.bloomRatio > 0.85) {
      return 'Radiant Bloom • Full Unfurl';
    }
    if (k.bloomRatio < 0.35) {
      return 'Pensive Bud • Chalice Folded';
    }
    return 'Fluid Presence • Visitor Tracking';
  }

  /* =========================================================================
     ANIMATION & BOTANICAL KINEMATICS LOOP
     ========================================================================= */
  startLoop() {
    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. Compute Active Choreography Kinematics
      let activeKinematics = null;
      let postureDesc = '';

      if (this.choreographySource === 'webcam' && this.isCameraActive && this.tracker) {
        const liveK = this.tracker.update(performance.now());
        if (liveK) {
          activeKinematics = { ...liveK };
          if (this.isUserOverridingBloom) {
            activeKinematics.bloomRatio = this.currentBloom;
          }
          postureDesc = this.deriveVisitorPosture(activeKinematics);
        }
      }

      if (!activeKinematics) {
        // Simulated Choreography Presets
        if (this.isPlaying) {
          this.simTime += dt * this.simSpeed;
        }

        const preset = CHOREOGRAPHY_PRESETS[this.currentPreset] || CHOREOGRAPHY_PRESETS.surya;
        const simK = preset.evaluate(this.simTime, preset.duration);
        activeKinematics = { ...simK };

        // Layer manual tracker overrides (leg test buttons, hotkeys, sway tests) seamlessly in simulated mode
        if (this.tracker) {
          if ((this.tracker.targets.legLiftL || 0) > 0.05) {
            activeKinematics.legLiftL = Math.max(activeKinematics.legLiftL || 0, this.tracker.targets.legLiftL);
          }
          if ((this.tracker.targets.legLiftR || 0) > 0.05) {
            activeKinematics.legLiftR = Math.max(activeKinematics.legLiftR || 0, this.tracker.targets.legLiftR);
          }
          if (Math.abs(this.tracker.targets.spineLeanX || 0) > 0.04) {
            activeKinematics.spineLeanX = this.tracker.targets.spineLeanX;
          }
        }

        if (this.isUserOverridingBloom) {
          activeKinematics.bloomRatio = this.currentBloom;
        }
        postureDesc = this.deriveVisitorPosture(activeKinematics) || simK.postureDesc || preset.name;
      }

      this.kinematics = activeKinematics;
      this.updateGauges(this.kinematics, postureDesc);

      // 2. Apply Kinematics to Flower Models
      const keys = Object.keys(this.models);

      if (this.viewMode === 'inspection') {
        const activeModel = this.models[this.selectedSpecies];
        if (activeModel && activeModel.instance) {
          if (typeof activeModel.instance.applyKinematics === 'function') {
            activeModel.instance.applyKinematics(this.kinematics, dt);
          } else if (typeof activeModel.instance.update === 'function') {
            activeModel.instance.update(time, dt);
          }
        }
      } else {
        // Exhibition mode: all flowers dance together with organic harmonic phase offsets
        keys.forEach((key, idx) => {
          const m = this.models[key];
          if (m && m.instance) {
            const phase = idx * 0.42;
            const staggeredK = {
              ...this.kinematics,
              spineLeanX: this.kinematics.spineLeanX * Math.cos(phase * 0.7) + Math.sin(time * 0.8 + phase) * 0.08,
              spineLeanZ: this.kinematics.spineLeanZ * Math.cos(phase * 0.5) + Math.cos(time * 0.7 + phase) * 0.06,
              bloomRatio: THREE.MathUtils.clamp(this.kinematics.bloomRatio + Math.sin(time * 0.6 + phase) * 0.06, 0.1, 1.0),
              heightFactor: THREE.MathUtils.clamp(this.kinematics.heightFactor + Math.sin(time * 0.5 + phase) * 0.04, 0.8, 1.3),
              armHeightL: THREE.MathUtils.clamp(this.kinematics.armHeightL + Math.sin(time * 0.9 + phase) * 0.12, 0.1, 1.6),
              armHeightR: THREE.MathUtils.clamp(this.kinematics.armHeightR + Math.cos(time * 0.9 + phase) * 0.12, 0.1, 1.6),
              armExtensionL: THREE.MathUtils.clamp((this.kinematics.armExtensionL || 0.4) + Math.sin(time * 0.7 + phase) * 0.15, 0.1, 1.4),
              armExtensionR: THREE.MathUtils.clamp((this.kinematics.armExtensionR || 0.4) + Math.cos(time * 0.7 + phase) * 0.15, 0.1, 1.4),
              wingspanSpread: THREE.MathUtils.clamp(this.kinematics.wingspanSpread + Math.sin(time * 0.7 + phase) * 0.08, 0.1, 1.3),
              legLiftL: THREE.MathUtils.clamp((this.kinematics.legLiftL || 0) + Math.max(0, Math.sin(time * 0.8 + phase) * 0.10), 0, 1),
              legLiftR: THREE.MathUtils.clamp((this.kinematics.legLiftR || 0) + Math.max(0, -Math.sin(time * 0.8 + phase) * 0.10), 0, 1)
            };

            if (typeof m.instance.applyKinematics === 'function') {
              m.instance.applyKinematics(staggeredK, dt);
            } else if (typeof m.instance.update === 'function') {
              m.instance.update(time, dt);
            }
          }
        });
      }

      // 3. Turntable auto-rotation
      if (this.isAutoRotate && !this.isDragging) {
        this.targetSpherical.theta += dt * 0.22;
      }

      // 4. Update Camera & Render
      this.updateCameraPosition();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}

// Boot on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new BotanicalGeometryLab();
});
