import * as THREE from 'three';

/**
 * Creates the semi-bright, luminous atmospheric meadow environment
 * matching the sky and lighting in the reference photo
 */
export class MeadowScene {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 250);
    
    // Default camera position: Low-angle dramatic upward view (matching the reference image!)
    this.cameraTarget = new THREE.Vector3(0, 1.4, 0);
    this.currentCameraPos = new THREE.Vector3(0.3, 0.45, 1.8);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.cameraTarget);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15; // Semi-bright, luminous daylight
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Mouse Interaction State
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    // Default view: camera view from a little up, zoomed out enough to show majority of the garden
    this.spherical = {
      radius: 16.5,
      theta: 0.28,  // gentle perspective angle across meadow
      phi: 1.02     // elevated top-angle (~58°) looking across the garden
    };
    this.targetSpherical = { ...this.spherical };
    this.targetLookAt = new THREE.Vector3(0, 1.10, 0);
    this.currentLookAt = new THREE.Vector3(0, 1.10, 0);

    this.initAtmosphere();
    this.initLighting();
    this.initGround();
    this.initFloatingPollen();
    this.setupMouseEvents();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  initAtmosphere() {
    // Semi-bright, misty overcast daylight sky dome
    // Soft desaturated jade green, eucalyptus grey, and pale ivory cloud
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition + offset).y;
        vec3 col;
        if (h > 0.15) {
          float t = (h - 0.15) / 0.85;
          col = mix(midColor, topColor, pow(max(t, 0.0), exponent));
        } else {
          float t = max((h + 0.2) / 0.35, 0.0);
          col = mix(bottomColor, midColor, t);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Palette extracted from the reference image sky:
    // Muted sage green cloud (#a8bda8), eucalyptus grey (#bcc8bc), pale silvery overcast (#e2e8e0)
    const skyUniforms = {
      topColor: { value: new THREE.Color(0xdde5db) },    // Silvery pale overcast zenith
      midColor: { value: new THREE.Color(0xb2c5b3) },    // Soft sage-eucalyptus mid sky
      bottomColor: { value: new THREE.Color(0x98aa98) }, // Horizon mist
      offset: { value: 10.0 },
      exponent: { value: 0.85 }
    };

    const skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false
    });

    const skyGeo = new THREE.SphereGeometry(60, 32, 24);
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Matching gentle atmospheric fog (blends distant meadow seamlessly into the semi-bright sky)
    this.scene.fog = new THREE.FogExp2(0xb6c7b7, 0.038);
    this.renderer.setClearColor(0xb6c7b7, 1);
  }

  initLighting() {
    // 1. Soft diffused ambient skylight (semi-bright, natural outdoor feel)
    this.ambientLight = new THREE.AmbientLight(0xdbe6da, 1.25);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere Light: sky tone above, warm earth tone below
    this.hemiLight = new THREE.HemisphereLight(0xe4ede4, 0x5a6352, 0.85);
    this.hemiLight.position.set(0, 20, 0);
    this.scene.add(this.hemiLight);

    // 3. Directional Daylight Sun (diffused overcast sun with soft shadows)
    this.sunLight = new THREE.DirectionalLight(0xfff8ea, 1.5);
    this.sunLight.position.set(5, 12, 6);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 25;
    this.sunLight.shadow.camera.left = -6;
    this.sunLight.shadow.camera.right = 6;
    this.sunLight.shadow.camera.top = 6;
    this.sunLight.shadow.camera.bottom = -6;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);

    // 4. Soft subtle rim light (highlights the delicate translucent petal edges)
    this.rimLight = new THREE.DirectionalLight(0xd0e0d8, 0.95);
    this.rimLight.position.set(-6, 8, -6);
    this.scene.add(this.rimLight);
  }

  initGround() {
    // Expansive rolling meadow ground plane (holds up to 2000+ flowers across vast landscape)
    const groundSize = 130;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 80, 80);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Gentle soft knolls, rolling terrain and natural meadow dips
      const y = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 0.35 +
                Math.sin(x * 0.08 + z * 0.08) * 0.40 -
                Math.hypot(x, z) * 0.006;
      pos.setY(i, y);
    }
    groundGeo.computeVertexNormals();

    // Muted mossy lichen loam material
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x485444,
      roughness: 0.9,
      metalness: 0.05
    });

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
  }

  initFloatingPollen() {
    // Delicate floating dandelion seeds and meadow pollen spores
    const count = 120;
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 12,
        0.2 + Math.random() * 3.5,
        (Math.random() - 0.5) * 12
      );
      sizes.push(0.015 + Math.random() * 0.025);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xfffcf0,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.pollenPoints = new THREE.Points(geom, mat);
    this.scene.add(this.pollenPoints);
  }

  setupMouseEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;

      // Orbit camera around target
      this.targetSpherical.theta -= dx * 0.006;
      this.targetSpherical.phi = THREE.MathUtils.clamp(
        this.targetSpherical.phi - dy * 0.005,
        0.25, // Allow low angle looking up
        Math.PI * 0.48 // Prevent going underneath ground
      );
    });

    // Mouse wheel: zoom / glide in & out (smoothly pulls back to view all 2000 flowers)
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetSpherical.radius = THREE.MathUtils.clamp(
        this.targetSpherical.radius + e.deltaY * 0.0035,
        0.8,
        45.0
      );
    }, { passive: false });

    // Touch support for iPad / mobile / tablet (smooth 1-finger orbit & 2-finger pinch-zoom)
    let touchStartDist = 0;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouse.x = e.touches[0].clientX;
        this.prevMouse.y = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - this.prevMouse.x;
        const dy = e.touches[0].clientY - this.prevMouse.y;
        this.prevMouse.x = e.touches[0].clientX;
        this.prevMouse.y = e.touches[0].clientY;

        this.targetSpherical.theta -= dx * 0.006;
        this.targetSpherical.phi = THREE.MathUtils.clamp(
          this.targetSpherical.phi - dy * 0.005,
          0.25,
          Math.PI * 0.48
        );
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDist - dist;
        touchStartDist = dist;
        this.targetSpherical.radius = THREE.MathUtils.clamp(
          this.targetSpherical.radius + diff * 0.015,
          0.8,
          45.0
        );
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  /**
   * Sets camera preset views
   */
  setCameraPreset(presetName) {
    if (presetName === 'hero-low') {
      // Look up through the flowers against the sky (matching the reference image!)
      this.targetSpherical.radius = 1.9;
      this.targetSpherical.phi = 1.32; // Low elevation looking steeply up
      this.targetSpherical.theta = 0.22;
      this.targetLookAt.set(0.1, 1.45, 0);
    } else if (presetName === 'eye-level') {
      // Natural walking posture amidst meadow
      this.targetSpherical.radius = 2.8;
      this.targetSpherical.phi = 1.05;
      this.targetSpherical.theta = -0.35;
      this.targetLookAt.set(0, 1.2, 0);
    } else if (presetName === 'aerial') {
      // High cinematic vista overview of the grand 2,000 flower garden
      this.targetSpherical.radius = 24.0;
      this.targetSpherical.phi = 0.45;
      this.targetSpherical.theta = 0.65;
      this.targetLookAt.set(0, 1.0, 0);
    } else if (presetName === 'default' || presetName === 'overview') {
      // Default view: from a little up, zoomed out enough to show majority of the garden
      this.targetSpherical.radius = 16.5;
      this.targetSpherical.phi = 1.02;
      this.targetSpherical.theta = 0.28;
      this.targetLookAt.set(0, 1.10, 0);
    }
  }

  update(time) {
    // Smooth camera damping
    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * 0.08;
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * 0.08;
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * 0.08;

    this.currentLookAt.lerp(this.targetLookAt, 0.08);

    // Compute spherical to Cartesian camera position
    const sinPhiRadius = Math.sin(this.spherical.phi) * this.spherical.radius;
    this.camera.position.x = this.currentLookAt.x + sinPhiRadius * Math.sin(this.spherical.theta);
    this.camera.position.y = this.currentLookAt.y + Math.cos(this.spherical.phi) * this.spherical.radius;
    this.camera.position.z = this.currentLookAt.z + sinPhiRadius * Math.cos(this.spherical.theta);
    this.camera.lookAt(this.currentLookAt);

    // Drift floating pollen
    if (this.pollenPoints) {
      const pos = this.pollenPoints.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - 0.0018;
        let x = pos.getX(i) + Math.sin(time * 0.4 + i) * 0.002;
        if (y < 0.1) y = 3.6;
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}
