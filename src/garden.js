import * as THREE from 'three';

export class GardenEnvironment {
  constructor(container) {
    this.container = container;

    // Core Three.js components
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;

    // Environment elements
    this.instancedGrass = null;
    this.instancedReeds = null;
    this.pollenParticles = null;
    this.grassTransforms = [];
    this.reedTransforms = [];
    this.pollenVelocities = [];
    this.time = 0;
    this.gustStrength = 0;

    // Camera Modes: 'studio' (live creation), 'tv' (infinite garden on HDMI TV), 'panorama' (wide communal meadow), 'inspect' (close-up)
    this.cameraMode = 'studio';
    this.isSoloMode = false;
    this.cameraGardenPos = new THREE.Vector3(0, 1.45, 4.45);
    this.cameraGardenLook = new THREE.Vector3(0, 1.30, 0);
    this.cameraSoloPos = new THREE.Vector3(0, 1.45, 4.45);
    this.cameraSoloLook = new THREE.Vector3(0, 1.30, 0);
    this.cameraPanoramaPos = new THREE.Vector3(0, 2.3, 5.4);
    this.cameraPanoramaLook = new THREE.Vector3(0, 0.85, -1.0);
    this.inspectTargetPos = new THREE.Vector3();
    this.inspectTargetLook = new THREE.Vector3();
    this.currentCameraLook = new THREE.Vector3().copy(this.cameraGardenLook);

    // Studio Mode Interactive View Angle & Zoom (Generous framing so entire flower & crown are visible at all times with open headroom)
    this.defaultStudioRadius = 5.25;
    this.defaultStudioPhi = 1.14;
    this.defaultStudioTheta = 0.04;
    this.defaultStudioLookY = 1.18;
    this.studioSpherical = { radius: this.defaultStudioRadius, theta: this.defaultStudioTheta, phi: this.defaultStudioPhi };
    this.targetStudioSpherical = { ...this.studioSpherical };
    this.studioLookAt = new THREE.Vector3(0, this.defaultStudioLookY, 0);
    this.currentStudioLook = new THREE.Vector3(0, this.defaultStudioLookY, 0);
    this.isStudioDragging = false;
    this.studioPrevMouse = { x: 0, y: 0 };

    // TV Mode Cinematic Flyover & External Mouse Exploration
    this.tvOrbitYaw = 0;
    this.tvOrbitPitch = 0.28;
    this.tvOrbitDistance = 7.5;
    this.tvCenterTarget = new THREE.Vector3(0, 1.1, -2.5);
    this.tvLastMouseTime = -100;
    this.isTvDragging = false;
    this.tvDragStart = { x: 0, y: 0 };

    this.init();
  }

  init() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    // 1. Perspective Camera — Curated Front View Framing
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 350);
    this.camera.position.copy(this.cameraGardenPos);
    this.camera.lookAt(this.currentCameraLook);

    // 2. WebGL Renderer with High Dynamic Range & Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    this.container.appendChild(this.renderer.domElement);

    // 3. Atmosphere & Fog — Semi-bright eucalyptus daylight mist matching visual lab
    const fogColor = new THREE.Color(0xb6c7b7);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.022);
    this.renderer.setClearColor(fogColor, 1);

    this.setupLighting();
    this.setupSkyDome();
    this.setupGround();
    this.setupWildGrass();
    // Tall grass/reeds removed (only short grass is kept)
    this.setupPollenSystem();
    this.setupStudioOrbitControls();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupLighting() {
    // 1. Soft diffused ambient daylight skylight (bright, natural outdoor feel)
    const ambientLight = new THREE.AmbientLight(0xdbe6da, 1.35);
    this.scene.add(ambientLight);

    // 2. Soft sky & earth hemisphere fill (eucalyptus sky above, warm sage ground below)
    const hemiLight = new THREE.HemisphereLight(0xe4ede4, 0x5a6352, 1.05);
    hemiLight.position.set(0, 15, 0);
    this.scene.add(hemiLight);

    // 3. Directional Daylight Sun (diffused overcast sun with soft shadows)
    const dirLight = new THREE.DirectionalLight(0xfffaea, 2.2);
    dirLight.position.set(3.5, 9.0, 4.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 18;
    dirLight.shadow.bias = -0.0008;
    this.scene.add(dirLight);

    // 4. Luminous rim light from behind to illuminate petal translucency
    const rimLight = new THREE.DirectionalLight(0xd8e8df, 1.25);
    rimLight.position.set(-4.5, 6.0, -4.0);
    this.scene.add(rimLight);

    // 5. Fresh ground bounce light (reveals petal undersides and foliage shadows)
    const bounceLight = new THREE.DirectionalLight(0x7da885, 0.45);
    bounceLight.position.set(0, -2, 2);
    this.scene.add(bounceLight);
  }

  setupSkyDome() {
    // Expansive gradient sky dome matching visual lab daylight palette
    const skyGeo = new THREE.SphereGeometry(260, 32, 20);
    skyGeo.scale(-1, 1, 1);

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#dde5db');  // Zenith pale silvery overcast
    grad.addColorStop(0.45, '#b2c5b3'); // Soft sage-eucalyptus mid sky
    grad.addColorStop(0.85, '#98aa98'); // Horizon mist
    grad.addColorStop(1.0, '#445240');  // Earth blend
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  }

  setupGround() {
    // Expansive rolling meadow ground plane - seamless horizon without visible boundaries or edges
    const groundSize = 250;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 72, 72);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Gentle subtle undulation away from center
      const dist = Math.hypot(x, z);
      const bump = dist > 0.8 ? Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.10 : 0;
      pos.setY(i, bump);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x445240,
      roughness: 0.90,
      metalness: 0.03
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  setupWildGrass() {
    // Low, delicate short grass blades (kept low to ground, never blocking flower)
    const count = 420;
    const bladeGeo = new THREE.ConeGeometry(0.016, 0.35, 3);
    bladeGeo.translate(0, 0.175, 0);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x4a6944,
      roughness: 0.7,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.instancedGrass = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
    this.instancedGrass.receiveShadow = true;

    const dummy = new THREE.Object3D();
    this.grassTransforms = [];

    for (let i = 0; i < count; i++) {
      let x, z;
      while (true) {
        x = (Math.random() - 0.5) * 6.5;
        z = -0.3 - Math.random() * 3.5;
        if (Math.hypot(x, z) > 0.9) break;
      }

      const scaleY = 0.45 + Math.random() * 0.45; // short grass (0.15m to 0.31m)
      const scaleXZ = 0.6 + Math.random() * 0.5;
      const rotY = Math.random() * Math.PI * 2;
      const tiltX = (Math.random() - 0.5) * 0.25;
      const tiltZ = (Math.random() - 0.5) * 0.25;

      dummy.position.set(x, 0, z);
      dummy.rotation.set(tiltX, rotY, tiltZ);
      dummy.scale.set(scaleXZ, scaleY, scaleXZ);
      dummy.updateMatrix();

      this.instancedGrass.setMatrixAt(i, dummy.matrix);

      this.grassTransforms.push({
        basePos: new THREE.Vector3(x, 0, z),
        baseRot: new THREE.Euler(tiltX, rotY, tiltZ),
        scale: new THREE.Vector3(scaleXZ, scaleY, scaleXZ),
        phase: Math.random() * Math.PI * 2,
        flex: 0.04 + Math.random() * 0.04
      });
    }

    this.instancedGrass.instanceMatrix.needsUpdate = true;
    this.scene.add(this.instancedGrass);
  }

  setupReedField() {
    // Tall grass and tall reeds removed per user specification: only short grass is kept.
    this.instancedReeds = null;
    this.reedTransforms = [];
  }

  setupPollenSystem() {
    // Floating glowing pollen/spores drifting in the air
    const count = 280;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 1] = 0.1 + Math.random() * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: 0.002 + Math.random() * 0.004,
        z: (Math.random() - 0.5) * 0.003
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Canvas particle texture (soft luminous orb)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const rad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    rad.addColorStop(0, 'rgba(255, 240, 190, 0.95)');
    rad.addColorStop(0.35, 'rgba(240, 215, 140, 0.55)');
    rad.addColorStop(1, 'rgba(180, 220, 180, 0)');
    pCtx.fillStyle = rad;
    pCtx.fillRect(0, 0, 32, 32);

    const pTex = new THREE.CanvasTexture(pCanvas);
    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      map: pTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.pollenParticles = new THREE.Points(geom, pMat);
    this.pollenVelocities = velocities;
    this.scene.add(this.pollenParticles);
  }

  setPollenColor(colorHex) {
    if (this.pollenParticles && this.pollenParticles.material) {
      this.pollenParticles.material.color.setHex(colorHex);
    }
  }

  triggerGust() {
    this.gustStrength = 0.45;
  }

  addSporeBurst(count = 35) {
    if (!this.pollenParticles) return;
    const pos = this.pollenParticles.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pos.count);
      // Spawn near the flower head
      pos.setXYZ(
        idx,
        (Math.random() - 0.5) * 0.6,
        1.6 + (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.6
      );
    }
    pos.needsUpdate = true;
  }

  update(dt, visitorEnergy = 0) {
    this.time += dt;

    // Decay gust
    this.gustStrength *= Math.exp(-dt * 2.2);

    const totalWind = Math.sin(this.time * 1.5) * 0.06 + this.gustStrength + visitorEnergy * 0.1;

    // 1. Animate Grass Field Sway
    if (this.instancedGrass && this.grassTransforms) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.grassTransforms.length; i++) {
        const t = this.grassTransforms[i];
        const sway = Math.sin(this.time * 2.0 + t.phase) * t.flex + totalWind * 0.3;

        dummy.position.copy(t.basePos);
        dummy.rotation.set(
          t.baseRot.x + sway * 0.4,
          t.baseRot.y,
          t.baseRot.z + sway
        );
        dummy.scale.copy(t.scale);
        dummy.updateMatrix();

        this.instancedGrass.setMatrixAt(i, dummy.matrix);
      }
      this.instancedGrass.instanceMatrix.needsUpdate = true;
    }

    // 2. Animate Reeds
    if (this.instancedReeds && this.reedTransforms) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.reedTransforms.length; i++) {
        const t = this.reedTransforms[i];
        const sway = Math.sin(this.time * 1.3 + t.phase) * 0.03 + totalWind * 0.2;

        dummy.position.copy(t.basePos);
        dummy.rotation.set(
          t.baseRot.x,
          t.baseRot.y,
          t.baseRot.z + sway
        );
        dummy.scale.copy(t.scale);
        dummy.updateMatrix();

        this.instancedReeds.setMatrixAt(i, dummy.matrix);
      }
      this.instancedReeds.instanceMatrix.needsUpdate = true;
    }

    // 3. Animate Pollen Specks Drift
    if (this.pollenParticles) {
      const pos = this.pollenParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + this.pollenVelocities[i].y + visitorEnergy * 0.003;
        let x = pos.getX(i) + this.pollenVelocities[i].x + totalWind * 0.004;
        let z = pos.getZ(i) + this.pollenVelocities[i].z;

        if (y > 3.8) {
          y = 0.1;
          x = (Math.random() - 0.5) * 4.0;
          z = (Math.random() - 0.5) * 3.0;
        }

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    // Smooth camera transition between modes
    if (this.cameraMode === 'studio' || this.isSoloMode) {
      // Damped spherical camera orbit & zoom interpolation
      this.studioSpherical.theta += (this.targetStudioSpherical.theta - this.studioSpherical.theta) * 0.085;
      this.studioSpherical.phi += (this.targetStudioSpherical.phi - this.studioSpherical.phi) * 0.085;
      this.studioSpherical.radius += (this.targetStudioSpherical.radius - this.studioSpherical.radius) * 0.085;

      const sx = this.studioSpherical.radius * Math.sin(this.studioSpherical.phi) * Math.sin(this.studioSpherical.theta);
      const sy = this.studioSpherical.radius * Math.cos(this.studioSpherical.phi);
      const sz = this.studioSpherical.radius * Math.sin(this.studioSpherical.phi) * Math.cos(this.studioSpherical.theta);

      this.cameraGardenPos.set(
        this.studioLookAt.x + sx,
        this.studioLookAt.y + sy,
        this.studioLookAt.z + sz
      );
      this.currentStudioLook.lerp(this.studioLookAt, 0.085);
      this.cameraGardenLook.copy(this.currentStudioLook);
    }

    let targetPos = this.cameraGardenPos;
    let targetLook = this.cameraGardenLook;

    if (this.cameraMode === 'tv') {
      const isMouseActive = (this.time - this.tvLastMouseTime) < 12.0;
      if (isMouseActive) {
        // Controlled by external mouse: orbit and glide around communal glade
        const camX = this.tvCenterTarget.x + Math.sin(this.tvOrbitYaw) * Math.cos(this.tvOrbitPitch) * this.tvOrbitDistance;
        const camZ = this.tvCenterTarget.z + Math.cos(this.tvOrbitYaw) * Math.cos(this.tvOrbitPitch) * this.tvOrbitDistance;
        const camY = this.tvCenterTarget.y + Math.sin(this.tvOrbitPitch) * this.tvOrbitDistance;
        targetPos = new THREE.Vector3(camX, Math.max(0.6, camY), camZ);
        targetLook = this.tvCenterTarget;
      } else {
        // Autonomous cinematic drone sweep through 100+ blooms in natural amphitheater
        const droneT = this.time * 0.06;
        const droneR = 6.2 + Math.sin(droneT * 0.5) * 2.2;
        const droneX = Math.sin(droneT) * droneR;
        const droneZ = -4.2 + Math.cos(droneT * 0.7) * 3.8;
        const droneY = 2.6 + Math.sin(droneT * 1.2) * 0.6;
        targetPos = new THREE.Vector3(droneX, droneY, droneZ + 4.5);
        targetLook = new THREE.Vector3(droneX * 0.35, 1.15, droneZ);
      }
    } else if (this.cameraMode === 'panorama') {
      // Gentle cinematic panoramic drift across the communal meadow
      const orbitX = Math.sin(this.time * 0.12) * 1.4;
      const orbitY = 2.2 + Math.cos(this.time * 0.08) * 0.15;
      targetPos = new THREE.Vector3(orbitX, orbitY, this.cameraPanoramaPos.z);
      targetLook = this.cameraPanoramaLook;
    } else if (this.cameraMode === 'inspect') {
      targetPos = this.inspectTargetPos;
      targetLook = this.inspectTargetLook;
    } else if (this.isSoloMode) {
      targetPos = this.cameraSoloPos;
      targetLook = this.cameraSoloLook;
    }

    this.camera.position.lerp(targetPos, 0.06);
    this.currentCameraLook.lerp(targetLook, 0.06);
    this.camera.lookAt(this.currentCameraLook);

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  // Interactive mouse/touch orbit & zoom controls for Studio Choreography Mode
  setupStudioOrbitControls() {
    const el = this.renderer.domElement;
    if (!el) return;

    el.addEventListener('mousedown', (e) => {
      if (this.cameraMode !== 'studio' && !this.isSoloMode) return;
      if (e.button !== 0) return; // Left click only
      this.isStudioDragging = true;
      this.studioPrevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isStudioDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isStudioDragging) return;
      const dx = e.clientX - this.studioPrevMouse.x;
      const dy = e.clientY - this.studioPrevMouse.y;
      this.studioPrevMouse = { x: e.clientX, y: e.clientY };

      this.targetStudioSpherical.theta -= dx * 0.007;
      this.targetStudioSpherical.phi -= dy * 0.007;
      this.targetStudioSpherical.phi = THREE.MathUtils.clamp(
        this.targetStudioSpherical.phi,
        0.20,
        Math.PI * 0.49
      );
    });

    el.addEventListener('wheel', (e) => {
      if (this.cameraMode !== 'studio' && !this.isSoloMode) return;
      e.preventDefault();
      this.targetStudioSpherical.radius += e.deltaY * 0.003;
      this.targetStudioSpherical.radius = THREE.MathUtils.clamp(
        this.targetStudioSpherical.radius,
        1.2,
        6.0
      );
    }, { passive: false });

    // Touch support for tablets / touch displays
    let touchDist = 0;
    el.addEventListener('touchstart', (e) => {
      if (this.cameraMode !== 'studio' && !this.isSoloMode) return;
      if (e.touches.length === 1) {
        this.isStudioDragging = true;
        this.studioPrevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isStudioDragging = false;
        touchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.cameraMode !== 'studio' && !this.isSoloMode) return;
      if (e.touches.length === 1 && this.isStudioDragging) {
        const dx = e.touches[0].clientX - this.studioPrevMouse.x;
        const dy = e.touches[0].clientY - this.studioPrevMouse.y;
        this.studioPrevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        this.targetStudioSpherical.theta -= dx * 0.007;
        this.targetStudioSpherical.phi -= dy * 0.007;
        this.targetStudioSpherical.phi = THREE.MathUtils.clamp(
          this.targetStudioSpherical.phi,
          0.20,
          Math.PI * 0.49
        );
      } else if (e.touches.length === 2 && touchDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchDist - dist;
        touchDist = dist;
        this.targetStudioSpherical.radius += diff * 0.01;
        this.targetStudioSpherical.radius = THREE.MathUtils.clamp(
          this.targetStudioSpherical.radius,
          1.2,
          6.0
        );
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isStudioDragging = false;
      touchDist = 0;
    });
  }

  // Enables external mouse drag-orbit & scroll-zoom for exploring TV mode
  enableTVMouseControls() {
    window.addEventListener('mousedown', (e) => {
      if (this.cameraMode !== 'tv' && this.cameraMode !== 'inspect') return;
      if (e.target.closest('button') || e.target.closest('.flower-inspect-card')) return;
      this.isTvDragging = true;
      this.tvDragStart = { x: e.clientX, y: e.clientY };
      this.tvLastMouseTime = this.time;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isTvDragging) return;
      const dx = e.clientX - this.tvDragStart.x;
      const dy = e.clientY - this.tvDragStart.y;
      this.tvDragStart = { x: e.clientX, y: e.clientY };
      this.tvLastMouseTime = this.time;

      this.tvOrbitYaw -= dx * 0.005;
      this.tvOrbitPitch = THREE.MathUtils.clamp(this.tvOrbitPitch + dy * 0.004, 0.05, 0.85);
    });

    window.addEventListener('mouseup', () => {
      this.isTvDragging = false;
    });

    window.addEventListener('wheel', (e) => {
      if (this.cameraMode !== 'tv' && this.cameraMode !== 'inspect') return;
      this.tvLastMouseTime = this.time;
      this.tvOrbitDistance = THREE.MathUtils.clamp(this.tvOrbitDistance + e.deltaY * 0.008, 2.5, 18.0);
    }, { passive: true });
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    return this.cameraMode;
  }

  focusPlantedFlower(flowerRecord, durationSeconds = 20) {
    if (!flowerRecord) return;
    this.cameraMode = 'inspect';
    const pos = flowerRecord.meta.position || { x: 0, y: 0, z: 0 };
    const offsetX = pos.x > 0 ? 0.35 : (pos.x < 0 ? -0.35 : 0);
    this.inspectTargetPos.set(pos.x + offsetX, 2.10, pos.z + 2.85);
    this.inspectTargetLook.set(pos.x, 0.85, pos.z);

    // After 20 seconds of inspecting a searched or recently planted flower,
    // smoothly pan out to the default view (elevated and zoomed out to showcase the garden)
    clearTimeout(this.inspectPanTimeout);
    this.inspectPanTimeout = setTimeout(() => {
      if (this.cameraMode === 'inspect') {
        if (this.isTvMode || document.body.classList.contains('tv-mode')) {
          this.cameraMode = 'tv';
        } else {
          this.resetToStudio();
        }
      }
    }, durationSeconds * 1000);
  }

  resetToStudio() {
    clearTimeout(this.inspectPanTimeout);
    this.cameraMode = 'studio';
    if (this.targetStudioSpherical) {
      this.targetStudioSpherical.radius = this.defaultStudioRadius || 4.45;
      this.targetStudioSpherical.phi = this.defaultStudioPhi || 1.16;
      this.targetStudioSpherical.theta = this.defaultStudioTheta || 0.08;
    }
    if (this.studioLookAt) {
      this.studioLookAt.set(0, this.defaultStudioLookY || 1.30, 0);
    }
  }

  setSoloMode(isSolo) {
    this.isSoloMode = isSolo;
    if (this.instancedGrass) this.instancedGrass.visible = !isSolo;
    if (this.instancedReeds) this.instancedReeds.visible = !isSolo;
    return this.isSoloMode;
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
