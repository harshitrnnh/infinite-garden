import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class BodyTracker {
  constructor(options = {}) {
    this.video = options.video || document.getElementById('webcam-feed');
    this.skeletonCanvas = options.skeletonCanvas || document.getElementById('skeleton-canvas');
    this.ctx = this.skeletonCanvas ? this.skeletonCanvas.getContext('2d') : null;
    this.onStatusChange = options.onStatusChange || (() => {});

    this.vision = null;
    this.landmarker = null;
    this.isTracking = false;
    this.useWebcam = true;
    this.hasCameraAccess = false;
    this.lastVideoTime = -1;
    this.lastTimestamp = -1; // Strict monotonic timestamp for MediaPipe graph
    this.isInitializing = false;
    this.errorCount = 0;

    // Output Kinematics (Smoothed for fluid organic botanical motion)
    this.kinematics = {
      spineLeanX: 0,       // Left / Right lean (-1 to 1)
      spineLeanZ: 0,       // Forward / Back lean / bow (-1 to 1)
      heightFactor: 1.0,   // Stretch / Crouch (0.75 to 1.3)
      bloomRatio: 0.06,    // Arm wingspan (0 = bud, 1 = open bloom)
      armHeightL: 0.5,     // Left hand elevation (0 to 1.8)
      armHeightR: 0.5,     // Right hand elevation (0 to 1.8)
      armExtensionL: 0.0,  // Left arm lateral reach (0 to 1.5)
      armExtensionR: 0.0,  // Right arm lateral reach (0 to 1.5)
      armStretchUp: 0.0,   // Both arms reaching upward (0 to 1)
      wingspanSpread: 0.0, // Both arms spread wide (0 to 1.5)
      legLiftL: 0.0,       // Left leg/knee raised (0 to 1)
      legLiftR: 0.0,       // Right leg/knee raised (0 to 1)
      headGazeX: 0,        // Head facing left/right
      headGazeY: 0,        // Head facing up/down
      bodyShiftX: 0,       // Lateral whole-body shift (-1 to 1)
      stanceWidth: 1.0,    // Stance width
      energy: 0,           // Motion velocity (triggers spore burst)
      isVisitorPresent: false
    };

    // Raw targets before smoothing
    this.targets = { ...this.kinematics };

    // Previous landmark history for velocity calculation
    this.prevPose = null;
    this.fpsCounter = 0;
    this.lastFpsTime = performance.now();
    this.fps = 0;

    // Fallback mouse control state
    this.mouse = { x: 0, y: 0, isDown: false, dragBloom: 0.35 };
    this.onNamaste = options.onNamaste || null;
    this.namasteFrames = 0;
    this.namasteTriggered = false;
    this.setupMouseFallback();
  }

  triggerNamaste() {
    console.log('🙏 [Easter Egg] Namaste Pose confirmed!');
    if (typeof this.onNamaste === 'function') {
      this.onNamaste();
    }
  }

  async initialize() {
    if (this.isInitializing) return;
    this.isInitializing = true;
    this.onStatusChange('loading', 'Loading vision model...');

    try {
      // 1. Initialize MediaPipe Vision Tasks — using local wasm assets first, falling back to CDN
      try {
        this.vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch (localWasmErr) {
        console.warn('Local wasm loader failed, trying CDN fallback:', localWasmErr);
        this.vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      }

      await this.createLandmarker();

      this.onStatusChange('ready', 'Starting camera...');
      await this.startCamera();
    } catch (err) {
      console.warn('MediaPipe initialization fallback to interactive mouse mode:', err);
      this.useWebcam = false;
      this.onStatusChange('fallback', `Camera unavailable: ${err.message || 'Check permissions'}`);
    } finally {
      this.isInitializing = false;
    }
  }

  async createLandmarker() {
    if (!this.vision) return;
    // Attempt GPU delegate first, fallback to CPU delegate for maximum compatibility
    const modelPath = '/pose_landmarker_lite.task';

    try {
      this.landmarker = await PoseLandmarker.createFromOptions(this.vision, {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (gpuErr) {
      console.warn('GPU delegate failed, falling back to CPU delegate:', gpuErr);
      this.landmarker = await PoseLandmarker.createFromOptions(this.vision, {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    }
    this.lastTimestamp = -1;
    this.lastVideoTime = -1;
    this.errorCount = 0;
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.useWebcam = false;
      this.onStatusChange('fallback', 'Camera API not supported in this browser');
      return;
    }

    this.onStatusChange('prompt', 'Please allow camera access in the browser prompt...');

    try {
      const isLaptopBloom = typeof window !== 'undefined' && (
        window.location.pathname.includes('laptop-bloom') ||
        (document.body && document.body.classList.contains('laptop-bloom-view'))
      );

      // 1. Enumerate available camera devices:
      // On tablet-bloom, search for wide-angle front sensor (iPad kiosk).
      // On laptop-bloom, use the default standard front camera (MacBook FaceTime HD normal view).
      let preferredDeviceId = null;
      if (!isLaptopBloom) {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            const wideFront = videoInputs.find(d => 
              /front|user|facetime/i.test(d.label) && /wide|ultra|0/i.test(d.label)
            );
            if (wideFront) {
              preferredDeviceId = wideFront.deviceId;
              console.log('Detected preferred wide front camera:', wideFront.label);
            }
          }
        } catch (e) {
          // Safe to ignore if permissions not yet granted
        }
      }

      // 2. Request camera resolution:
      // On laptop-bloom: Standard HD 16:9 webcam format (1280x720).
      // On tablet-bloom: Native 4:3 camera resolution to capture 100% of iPad sensor glass surface.
      const videoConstraints = {
        facingMode: preferredDeviceId ? undefined : 'user',
        deviceId: preferredDeviceId ? { exact: preferredDeviceId } : undefined,
        width: { ideal: 1280, min: 480 },
        height: { ideal: isLaptopBloom ? 720 : 960, min: 480 },
        aspectRatio: { ideal: isLaptopBloom ? 1.777778 : 1.333333 }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
      } catch (constraintErr) {
        console.warn('Primary camera constraints failed, falling back to basic front camera:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      }

      this.stream = stream;
      this.videoTrack = stream.getVideoTracks()[0] || null;

      // Camera Hardware Zoom:
      // On laptop-bloom: Normal 1.0x standard zoom (not zoomed out).
      // On tablet-bloom: Minimum zoom (ultra-wide on iPad) for close-proximity 4ft full body tracking.
      if (this.videoTrack && typeof this.videoTrack.getCapabilities === 'function') {
        const caps = this.videoTrack.getCapabilities();
        if (caps.zoom) {
          try {
            const targetZoom = isLaptopBloom ? 1.0 : (caps.zoom.min !== undefined ? caps.zoom.min : 1.0);
            await this.videoTrack.applyConstraints({
              advanced: [{ zoom: targetZoom }]
            });
            console.log(`Applied camera hardware zoom (${isLaptopBloom ? 'normal 1.0x' : 'ultra-wide'}):`, targetZoom);
          } catch (zoomErr) {
            console.warn('Could not set hardware zoom:', zoomErr);
          }
        }
      }

      this.video.srcObject = stream;
      await new Promise((resolve, reject) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve).catch(reject);
        };
        setTimeout(() => resolve(), 3000); // Guard timeout
      });

      if (this.skeletonCanvas && this.video.videoWidth > 0) {
        this.skeletonCanvas.width = this.video.videoWidth;
        this.skeletonCanvas.height = this.video.videoHeight;
      }

      this.hasCameraAccess = true;
      this.useWebcam = true;
      this.isTracking = true;
      this.onStatusChange('tracking', 'Camera active — Stand back so your upper body is visible');
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      this.hasCameraAccess = false;
      this.useWebcam = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.onStatusChange('denied', 'Camera permission blocked. Click URL bar icon to allow.');
      } else {
        this.onStatusChange('fallback', `Camera error: ${err.message || 'Unavailable'}`);
      }
    }
  }

  async setHardwareZoom(zoomVal) {
    if (this.videoTrack && typeof this.videoTrack.getCapabilities === 'function') {
      const caps = this.videoTrack.getCapabilities();
      if (caps.zoom) {
        const clampedZoom = Math.max(caps.zoom.min, Math.min(caps.zoom.max, zoomVal));
        try {
          await this.videoTrack.applyConstraints({
            advanced: [{ zoom: clampedZoom }]
          });
          return clampedZoom;
        } catch (e) {
          console.warn('Failed to apply hardware zoom:', e);
        }
      }
    }
    return null;
  }

  async toggleCamera() {
    if (!this.useWebcam) {
      this.useWebcam = true;
      if (!this.hasCameraAccess) {
        await this.startCamera();
      } else {
        this.onStatusChange('tracking', 'Camera active — Stand back so your upper body is visible');
      }
    } else {
      this.useWebcam = false;
      this.targets.isVisitorPresent = false;
      this.clearSkeletonCanvas();
      this.onStatusChange('fallback', 'Mouse control mode active (Move mouse to bend plant)');
    }
    return this.useWebcam;
  }

  setupMouseFallback() {
    window.addEventListener('mousemove', (e) => {
      if (this.useWebcam && this.kinematics.isVisitorPresent) return;
      // Normalized screen coordinates [-1 to 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      this.targets.spineLeanX = nx * 0.80;
      this.targets.bodyShiftX = nx * 0.60;
      this.targets.spineLeanZ = -ny * 0.50;
      this.targets.headGazeX = nx * 0.6;
      this.targets.headGazeY = -ny * 0.6;

      if (this.mouse.isDown) {
        this.targets.bloomRatio = Math.max(0.05, Math.min(1.0, (nx + 1) * 0.5));
      }
    });

    window.addEventListener('mousedown', () => {
      this.mouse.isDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    window.addEventListener('keydown', (e) => {
      const key = (e.key || '').toLowerCase();
      if (e.code === 'Space') {
        this.targets.bloomRatio = this.targets.bloomRatio > 0.6 ? 0.05 : 0.95;
      } else if (key === 'x') {
        // HANDS STRAIGHT DOWN: branches down, flower closed/bud, stem stays upright at full 1.0 height
        this.targets.armStretchUp = 0.0;
        this.targets.armHeightL = 0.0;
        this.targets.armHeightR = 0.0;
        this.targets.armExtensionL = 0.0;
        this.targets.armExtensionR = 0.0;
        this.targets.wingspanSpread = 0.0;
        this.targets.bloomRatio = 0.05; // Closed flower
        this.targets.heightFactor = 1.0; // Stays full height, not bent down
      } else if (key === 'u') {
        // HANDS STRAIGHT UP: branches up, stem grows tall, but petals stay upright (not spread out too much)
        this.targets.armStretchUp = 1.0;
        this.targets.armHeightL = 1.8;
        this.targets.armHeightR = 1.8;
        this.targets.bloomRatio = 0.16; // Hands straight up does not spread petals wide
        this.targets.heightFactor = 1.25;
      } else if (key === 'n') {
        // NEUTRAL / BODY STRAIGHT UP: flower upright chalice, branches neutral, stem 1.0
        this.targets.spineLeanX = 0.0;
        this.targets.spineLeanZ = 0.0;
        this.targets.bodyShiftX = 0.0;
        this.targets.armStretchUp = 0.0;
        this.targets.armHeightL = 0.5;
        this.targets.armHeightR = 0.5;
        this.targets.armExtensionL = 0.0;
        this.targets.armExtensionR = 0.0;
        this.targets.wingspanSpread = 0.0;
        this.targets.bloomRatio = 0.06; // Petals compact upright when arms are not spread
        this.targets.heightFactor = 1.0;
      } else if (key === 'w') {
        // Toggle spreading BOTH arms WIDE (wingspan: petals spread out completely)
        const isSpread = (this.targets.wingspanSpread || 0) > 0.5;
        this.targets.wingspanSpread = isSpread ? 0.0 : 1.4;
        this.targets.armExtensionL = isSpread ? 0.0 : 1.3;
        this.targets.armExtensionR = isSpread ? 0.0 : 1.3;
        this.targets.bloomRatio = isSpread ? 0.06 : 1.0;
      } else if (key === 'm') {
        // Keyboard testing: trigger Namaste mudra easter egg
        this.triggerNamaste();
      } else if (key === '[' || key === 'l') {
        // Toggle lifting left leg
        this.targets.legLiftL = this.targets.legLiftL > 0.5 ? 0.0 : 0.9;
        this.targets.legLiftR = 0.0;
      } else if ((key === ']' || key === 'r') && !e.metaKey && !e.ctrlKey) {
        // Toggle lifting right leg
        this.targets.legLiftR = this.targets.legLiftR > 0.5 ? 0.0 : 0.9;
        this.targets.legLiftL = 0.0;
      } else if (key === 'a') {
        // Stretch left arm outward (spread left branches)
        this.targets.armExtensionL = this.targets.armExtensionL > 0.5 ? 0.0 : 1.3;
        this.targets.armHeightL = this.targets.armExtensionL > 0.5 ? 0.9 : 0.5;
        this.targets.wingspanSpread = (this.targets.armExtensionL + this.targets.armExtensionR) * 0.5;
      } else if (key === 'd') {
        // Stretch right arm outward (spread right branches)
        this.targets.armExtensionR = this.targets.armExtensionR > 0.5 ? 0.0 : 1.3;
        this.targets.armHeightR = this.targets.armExtensionR > 0.5 ? 0.9 : 0.5;
        this.targets.wingspanSpread = (this.targets.armExtensionL + this.targets.armExtensionR) * 0.5;
      } else if (e.key === 'ArrowUp') {
        // Bend FULL FRONT (positive spineLeanZ curves stem forward toward camera)
        this.targets.spineLeanZ = Math.min(1.0, this.targets.spineLeanZ + 0.35);
        // Flower closes when body bends
        this.targets.bloomRatio = Math.max(0.08, this.targets.bloomRatio - 0.20);
      } else if (e.key === 'ArrowDown') {
        // Bend FULL BACK (negative spineLeanZ arches stem backward away from camera)
        this.targets.spineLeanZ = Math.max(-1.0, this.targets.spineLeanZ - 0.35);
        // Flower closes when body bends
        this.targets.bloomRatio = Math.max(0.08, this.targets.bloomRatio - 0.20);
      } else if (e.key === 'ArrowLeft') {
        // Bend left - direct connected sway
        this.targets.spineLeanX = Math.max(-0.85, this.targets.spineLeanX - 0.30);
        this.targets.bodyShiftX = this.targets.spineLeanX * 0.8;
        this.targets.bloomRatio = Math.max(0.08, this.targets.bloomRatio - 0.15);
      } else if (e.key === 'ArrowRight') {
        // Bend right - direct connected sway
        this.targets.spineLeanX = Math.min(0.85, this.targets.spineLeanX + 0.30);
        this.targets.bodyShiftX = this.targets.spineLeanX * 0.8;
        this.targets.bloomRatio = Math.max(0.08, this.targets.bloomRatio - 0.15);
      }
    });
  }

  update(now = performance.now()) {
    // 1. Calculate FPS
    this.fpsCounter++;
    if (now - this.lastFpsTime >= 1000) {
      this.fps = this.fpsCounter;
      this.fpsCounter = 0;
      this.lastFpsTime = now;
      const fpsEl = document.getElementById('pip-fps');
      if (fpsEl) fpsEl.textContent = `FPS: ${this.fps}`;
    }

    // 2. Run vision inference with strict monotonic timestamping
    if (
      this.useWebcam &&
      this.landmarker &&
      this.video &&
      this.video.readyState >= 2 &&
      this.video.videoWidth > 0 &&
      !this.video.paused
    ) {
      if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;

        // Ensure skeleton canvas matches the exact video resolution every frame
        if (this.skeletonCanvas && this.video.videoWidth > 0 && this.video.videoHeight > 0) {
          if (
            this.skeletonCanvas.width !== this.video.videoWidth ||
            this.skeletonCanvas.height !== this.video.videoHeight
          ) {
            this.skeletonCanvas.width = this.video.videoWidth;
            this.skeletonCanvas.height = this.video.videoHeight;
          }
        }

        // Ensure strictly increasing integer timestamps for MediaPipe graph
        let currentTimestamp = Math.floor(performance.now());
        if (currentTimestamp <= this.lastTimestamp) {
          currentTimestamp = this.lastTimestamp + 1;
        }
        this.lastTimestamp = currentTimestamp;

        try {
          const result = this.landmarker.detectForVideo(this.video, currentTimestamp);
          this.processLandmarks(result);
          this.errorCount = 0;
        } catch (inferErr) {
          console.warn('Inference error in detectForVideo:', inferErr);
          this.errorCount++;

          // If MediaPipe graph becomes corrupt, re-create the landmarker
          if (this.errorCount > 3) {
            console.warn('Re-initializing MediaPipe landmarker after repeated graph errors...');
            this.createLandmarker();
          }
        }
      }
    } else if (!this.useWebcam) {
      // Natural idle drift in fallback mode
      const idleTime = now * 0.001;
      this.targets.spineLeanX += Math.sin(idleTime * 0.8) * 0.002;
    }

    // 3. Smooth kinematics using Exponential Moving Average / Lerp
    const smoothFactor = 0.12; // Balanced responsiveness and fluidity
    for (const key of Object.keys(this.kinematics)) {
      if (typeof this.kinematics[key] === 'number') {
        this.kinematics[key] += (this.targets[key] - this.kinematics[key]) * smoothFactor;
      }
    }
    this.kinematics.isVisitorPresent = this.targets.isVisitorPresent;

    return this.kinematics;
  }

  processLandmarks(result) {
    if (!result || !result.landmarks || result.landmarks.length === 0) {
      if (this.targets.isVisitorPresent) {
        this.targets.isVisitorPresent = false;
        this.onStatusChange('tracking', 'Camera active — Stand back so your upper body is visible');
      }
      this.clearSkeletonCanvas();
      return;
    }

    if (!this.targets.isVisitorPresent) {
      this.targets.isVisitorPresent = true;
      this.onStatusChange('tracking', 'Visitor detected — Plant linked to your body');
    }

    const lm = result.landmarks[0]; // 33 normalized landmarks

    // Key MediaPipe Indices:
    // 0: Nose, 11: Left Shoulder, 12: Right Shoulder
    // 13: Left Elbow, 14: Right Elbow, 15: Left Wrist, 16: Right Wrist
    // 23: Left Hip, 24: Right Hip
    const nose = lm[0];
    const lSh = lm[11];
    const rSh = lm[12];
    const lEl = lm[13];
    const rEl = lm[14];
    const lWr = lm[15];
    const rWr = lm[16];
    const lHip = lm[23];
    const rHip = lm[24];
    const lKnee = lm[25];
    const rKnee = lm[26];
    const lAnkle = lm[27];
    const rAnkle = lm[28];

    const shoulderWidth = Math.max(0.12, Math.hypot(lSh.x - rSh.x, lSh.y - rSh.y));
    const midShoulderX = (lSh.x + rSh.x) * 0.5;
    const midShoulderY = (lSh.y + rSh.y) * 0.5;

    // 1. SIDEWAYS SWAYING (Direct, connected Torso & Shoulder Tilt - Boosted for 3-5ft standing)
    const rawShoulderTilt = (lSh.y - rSh.y) / shoulderWidth;
    const rawHeadTilt = (nose.x - midShoulderX) / shoulderWidth;
    const rawBodyShift = (midShoulderX - 0.5) * 2.8;

    // Direct, sensitive sway combining shoulder tilt, head tilt, and lateral body sway
    let rawSway = rawShoulderTilt * 1.8 + rawHeadTilt * 1.2 + rawBodyShift * 1.1;

    // Small deadzone to prevent camera jitter when sitting still
    if (Math.abs(rawSway) < 0.02) {
      rawSway = 0.0;
    } else {
      rawSway = rawSway > 0 ? (rawSway - 0.02) * 1.25 : (rawSway + 0.02) * 1.25;
    }

    // Convention:
    // Leaning to screen-left: spineLeanX is NEGATIVE (matching -X screen coordinate)
    // Leaning to screen-right: spineLeanX is POSITIVE (matching +X screen coordinate)
    this.targets.spineLeanX = -Math.max(-1.0, Math.min(1.0, rawSway));
    this.targets.bodyShiftX = -Math.max(-1.0, Math.min(1.0, rawBodyShift));

    // 2. FORWARD BOW & BACKWARD ARCH (Bending Full Front & Back)
    // Optimized for 3-5ft standing: waist/hips are in frame even without knees/feet
    let rawPitch = 0.0;
    const hasHipsInFrame = lHip && rHip && (lHip.visibility > 0.30 || rHip.visibility > 0.30);

    if (hasHipsInFrame) {
      const midHipZ = ((lHip.z || 0) + (rHip.z || 0)) * 0.5;
      const midShoulderZ = ((lSh.z || 0) + (rSh.z || 0)) * 0.5;
      const zDiff = (midHipZ - midShoulderZ);
      const headDrop = (nose.y - midShoulderY) / shoulderWidth;
      rawPitch = zDiff * 2.6 + (headDrop - 0.30) * 1.6;
    } else {
      // Upper-body only framing
      const midShoulderZ = ((lSh.z || 0) + (rSh.z || 0)) * 0.5;
      const zDiff = (midShoulderZ - (nose.z || 0));
      const headDrop = (nose.y - midShoulderY) / shoulderWidth;
      const bowForwardDelta = (zDiff - 0.14) * 2.2 + (headDrop + 0.52) * 2.0;
      rawPitch = bowForwardDelta;
    }

    // Deadzone: when upright normally, flower stands straight (spineLeanZ = 0)
    if (Math.abs(rawPitch) < 0.10) {
      rawPitch = 0.0;
    } else {
      rawPitch = (rawPitch > 0 ? rawPitch - 0.10 : rawPitch + 0.10) * 1.35;
    }
    this.targets.spineLeanZ = Math.max(-1.0, Math.min(1.0, rawPitch));

    // 3. ARM ELEVATIONS & FLOWER HEIGHT (Extrapolated from both wrists AND elbows for close 4ft view)
    const lWrElev = (lSh.y - lWr.y) / shoulderWidth;
    const rWrElev = (rSh.y - rWr.y) / shoulderWidth;
    const lElElev = (lSh.y - lEl.y) / shoulderWidth;
    const rElElev = (rSh.y - rEl.y) / shoulderWidth;

    // If hands go above screen edge, elbows still indicate overhead reach!
    const lArmElev = Math.max(lWrElev, lElElev * 1.35);
    const rArmElev = Math.max(rWrElev, rElElev * 1.35);

    // Normalize arm heights (0.0 = resting straight down at sides, 0.5 = chest/neutral, 1.2+ = reaching overhead)
    this.targets.armHeightL = Math.max(0, Math.min(2.0, (lArmElev + 0.45) * 1.05));
    this.targets.armHeightR = Math.max(0, Math.min(2.0, (rArmElev + 0.45) * 1.05));

    // Upward reach when either or both hands/elbows are lifted above shoulders
    const maxHandUp = Math.max(lArmElev, rArmElev);
    const avgHandUp = (lArmElev + rArmElev) * 0.5;
    this.targets.armStretchUp = Math.max(0, Math.min(1.0, (maxHandUp - 0.08) * 1.7));

    // FLOWER HEIGHT:
    this.targets.heightFactor = 1.0 + this.targets.armStretchUp * 0.28;

    // 4. PALM / HAND DISTANCE FROM CENTRAL STRAIGHT BODY:
    // User physical rule:
    // - If palms are near the central body -> bloom / petal spread is lesser (closed/compact ~0.06)
    // - If palms are spread out or further from central straight body -> bloom is more (up to 1.0 full bloom)
    const bodyCenterX = (lHip && rHip && (lHip.visibility > 0.25 || rHip.visibility > 0.25))
      ? (midShoulderX + (lHip.x + rHip.x) * 0.5) * 0.5
      : midShoulderX;

    // Distances of left and right wrists/palms from the central vertical body line
    const lPalmDist = Math.abs(lWr.x - bodyCenterX);
    const rPalmDist = Math.abs(rWr.x - bodyCenterX);

    // Elbow backup when arms extend to frame edges or hands leave frame
    const lElbowDist = Math.abs(lEl.x - bodyCenterX) * 1.45;
    const rElbowDist = Math.abs(rEl.x - bodyCenterX) * 1.45;

    const leftReach = Math.max(lPalmDist, lElbowDist);
    const rightReach = Math.max(rPalmDist, rElbowDist);

    // Lateral arm extensions relative to shoulder width
    this.targets.armExtensionL = Math.max(0, Math.min(1.8, (leftReach / shoulderWidth - 0.30) * 1.6));
    this.targets.armExtensionR = Math.max(0, Math.min(1.8, (rightReach / shoulderWidth - 0.30) * 1.6));

    // Overall lateral arm spread from central body
    const avgSpread = (leftReach + rightReach) * 0.5;
    const maxSpread = Math.max(leftReach, rightReach);
    const effectiveSpread = Math.max(avgSpread, maxSpread * 0.85);

    // Proportional spread ratio:
    // At rest / center body (e.g. typing, hands clasped, resting in lap): effectiveSpread <= 0.32 * shoulderWidth -> 0.0
    // Further from central body: increases progressively up to 1.50 * shoulderWidth -> 1.0 full wingspan
    const palmSpreadRatio = Math.max(0.0, Math.min(1.0, (effectiveSpread / shoulderWidth - 0.32) / 1.15));

    this.targets.wingspanSpread = palmSpreadRatio * 1.5;
    this.targets.horizontalArmSpread = palmSpreadRatio;

    // Total distance between wrists & elbows (retained for Namaste pose detection)
    const wristDist = Math.hypot(lWr.x - rWr.x, lWr.y - rWr.y);
    const elbowDist = Math.hypot(lEl.x - rEl.x, lEl.y - rEl.y);

    // 5. FLOWER BLOOM & PETAL SPREAD FORMULATION:
    // Core physical principle:
    // Petals spread strictly in proportion to how spread out the arms are sideways.
    // If hands are straight up, the petals do NOT spread out too much (reaching sky stretches stem tall, but petals stay upright).
    // Petals spread out wide ONLY in proportion to how far arms/palms are spread sideways.
    const lerpVal = (a, b, t) => a + (b - a) * t;
    const sidewaysPetalBloom = lerpVal(0.06, 1.0, palmSpreadRatio);

    // Subtle gentle opening (max ~0.16) when reaching straight up overhead without spreading sideways
    const subtleUpwardBreath = avgHandUp > 0.35 ? Math.min(0.08, (avgHandUp - 0.35) * 0.12) : 0.0;

    // Petals spread strictly proportional to sideways arm spread
    this.targets.bloomRatio = Math.max(0.06, Math.min(1.0, sidewaysPetalBloom + subtleUpwardBreath));

    // 6. LEG LIFT & BALANCING (Works both with full-body standing and sitting/desk framing!)
    let liftL = 0;
    let liftR = 0;

    // A. Standing Full-Body: Detect knee & ankle elevation
    if (lKnee && rKnee && (lKnee.visibility > 0.20 || rKnee.visibility > 0.20)) {
      const kneeDiff = (rKnee.y - lKnee.y) / shoulderWidth;
      if (kneeDiff > 0.04) liftL = Math.min(1.0, (kneeDiff - 0.04) * 4.0);
      if (kneeDiff < -0.04) liftR = Math.min(1.0, (-kneeDiff - 0.04) * 4.0);
    }
    if (lAnkle && rAnkle && (lAnkle.visibility > 0.20 || rAnkle.visibility > 0.20)) {
      const ankleDiff = (rAnkle.y - lAnkle.y) / shoulderWidth;
      if (ankleDiff > 0.05) liftL = Math.max(liftL, Math.min(1.0, (ankleDiff - 0.05) * 3.5));
      if (ankleDiff < -0.05) liftR = Math.max(liftR, Math.min(1.0, (-ankleDiff - 0.05) * 3.5));
    }

    // B. Sitting at Desk Framing: Detect knee raising entering lower camera frame
    if (lKnee && lKnee.y < 0.98) {
      liftL = Math.max(liftL, Math.min(1.0, (0.98 - lKnee.y) * 4.5 + 0.35));
    }
    if (rKnee && rKnee.y < 0.98) {
      liftR = Math.max(liftR, Math.min(1.0, (0.98 - rKnee.y) * 4.5 + 0.35));
    }

    // C. Sitting desk pelvic/thigh tilt support (even if hips are partially in frame)
    if (lHip && rHip && (lHip.visibility > 0.08 || rHip.visibility > 0.08)) {
      const hipDiff = (rHip.y - lHip.y) / shoulderWidth;
      if (hipDiff > 0.03) liftL = Math.max(liftL, Math.min(1.0, (hipDiff - 0.03) * 4.5));
      if (hipDiff < -0.03) liftR = Math.max(liftR, Math.min(1.0, (-hipDiff - 0.03) * 4.5));
    }

    // Smooth decay or manual hold
    if (liftL > 0.05) {
      this.targets.legLiftL = liftL;
    } else if (this.targets.legLiftL > 0) {
      this.targets.legLiftL = Math.max(0, this.targets.legLiftL - 0.04);
    }

    if (liftR > 0.05) {
      this.targets.legLiftR = liftR;
    } else if (this.targets.legLiftR > 0) {
      this.targets.legLiftR = Math.max(0, this.targets.legLiftR - 0.04);
    }

    // 7. Head Gaze Direction
    this.targets.headGazeX = Math.max(-0.8, Math.min(0.8, (nose.x - midShoulderX) * 3.5));
    this.targets.headGazeY = Math.max(-0.8, Math.min(0.8, (midShoulderY - nose.y) * 3.0));

    // 8. Motion Energy / Velocity
    if (this.prevPose) {
      const dL = Math.hypot(lWr.x - this.prevPose.lWr.x, lWr.y - this.prevPose.lWr.y);
      const dR = Math.hypot(rWr.x - this.prevPose.rWr.x, rWr.y - this.prevPose.rWr.y);
      const dN = Math.hypot(nose.x - this.prevPose.nose.x, nose.y - this.prevPose.nose.y);
      this.targets.energy = Math.min(1.0, (dL + dR + dN) * 8.0);
    }
    this.prevPose = { lWr: { ...lWr }, rWr: { ...rWr }, nose: { ...nose } };

    // 9. NAMASTE / ANJALI MUDRA POSE DETECTION (Easter Egg)
    // Hands clasped together in front of the chest / sternum
    const avgWristX = (lWr.x + rWr.x) * 0.5;
    const avgWristY = (lWr.y + rWr.y) * 0.5;

    const isNamastePose = (
      wristDist < shoulderWidth * 0.44 &&
      avgWristY > (nose.y + 0.04) &&
      avgWristY < (midShoulderY + shoulderWidth * 1.35) &&
      Math.abs(avgWristX - midShoulderX) < shoulderWidth * 0.38 &&
      elbowDist > wristDist * 1.7 &&
      elbowDist > shoulderWidth * 0.65
    );

    if (isNamastePose) {
      this.namasteFrames = (this.namasteFrames || 0) + 1;
      // Holding Namaste for ~14 frames (~0.45s) confirms the deliberate gesture
      if (this.namasteFrames >= 14 && !this.namasteTriggered) {
        this.namasteTriggered = true;
        this.triggerNamaste();
      }
    } else {
      this.namasteFrames = Math.max(0, (this.namasteFrames || 0) - 2);
      if (this.namasteFrames === 0) {
        this.namasteTriggered = false; // Reset lock when hands release
      }
    }

    // Render skeleton overlay in PIP
    this.drawSkeleton(lm);
  }

  drawSkeleton(lm) {
    if (!this.ctx || !this.skeletonCanvas) return;
    const w = this.skeletonCanvas.width;
    const h = this.skeletonCanvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Full Body Connected bone pairs (Head, Torso, Arms, Hands, Legs, Feet)
    const connections = [
      // Head
      [0, 1], [1, 2], [2, 3], [3, 7],
      [0, 4], [4, 5], [5, 6], [6, 8],
      [9, 10],
      [0, 11], [0, 12],
      // Shoulders & Torso
      [11, 12],
      [11, 23], [12, 24],
      [23, 24],
      // Arms
      [11, 13], [13, 15],
      [12, 14], [14, 16],
      // Hands
      [15, 17], [15, 19], [15, 21],
      [16, 18], [16, 20], [16, 22],
      // Legs
      [23, 25], [25, 27],
      [24, 26], [26, 28],
      // Feet
      [27, 29], [27, 31], [29, 31],
      [28, 30], [28, 32], [30, 32]
    ];

    // Spine column (connecting midpoint of shoulders to midpoint of hips)
    const lSh = lm[11], rSh = lm[12], lHip = lm[23], rHip = lm[24];
    if (lSh && rSh && lHip && rHip) {
      const midShX = (lSh.x + rSh.x) * 0.5 * w;
      const midShY = (lSh.y + rSh.y) * 0.5 * h;
      const midHipX = (lHip.x + rHip.x) * 0.5 * w;
      const midHipY = (lHip.y + rHip.y) * 0.5 * h;

      this.ctx.beginPath();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = 'rgba(240, 248, 255, 0.95)';
      this.ctx.shadowColor = 'rgba(160, 205, 255, 0.7)';
      this.ctx.shadowBlur = 10;
      this.ctx.moveTo(midShX, midShY);
      this.ctx.lineTo(midHipX, midHipY);
      this.ctx.stroke();
    }

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = 'rgba(235, 245, 255, 0.92)';
    this.ctx.shadowColor = 'rgba(140, 190, 255, 0.6)';
    this.ctx.shadowBlur = 8;

    for (const [i, j] of connections) {
      const p1 = lm[i];
      const p2 = lm[j];
      if (p1 && p2 && (p1.visibility === undefined || p1.visibility > 0.18) && (p2.visibility === undefined || p2.visibility > 0.18)) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * w, p1.y * h);
        this.ctx.lineTo(p2.x * w, p2.y * h);
        this.ctx.stroke();
      }
    }

    // Key Joint points (Head, Wrists, Elbows, Shoulders, Hips, Knees, Ankles)
    const keyJoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    for (const idx of keyJoints) {
      const p = lm[idx];
      if (p && (p.visibility === undefined || p.visibility > 0.18)) {
        this.ctx.beginPath();
        const isEndEffector = idx === 15 || idx === 16 || idx === 0;
        this.ctx.arc(p.x * w, p.y * h, isEndEffector ? 5.5 : 3.5, 0, Math.PI * 2);
        this.ctx.fillStyle = isEndEffector ? '#ffe082' : '#ffffff';
        this.ctx.shadowColor = isEndEffector ? 'rgba(255, 224, 130, 0.8)' : 'rgba(255, 255, 255, 0.6)';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      }
    }
    this.ctx.shadowBlur = 0;
  }

  clearSkeletonCanvas() {
    if (this.ctx && this.skeletonCanvas) {
      this.ctx.clearRect(0, 0, this.skeletonCanvas.width, this.skeletonCanvas.height);
    }
  }
}
