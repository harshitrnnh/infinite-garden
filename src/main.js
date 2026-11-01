import * as THREE from 'three';
import { GardenEnvironment } from './garden.js';
import { LivingPlant, FLOWER_SPECIES } from './plant.js';
import { StudioFlowerManager, CHOREOGRAPHY_SPECIES_META } from './plant-morphologies.js';
import { BodyTracker } from './tracker.js';
import { ChoreographyRecorder, CommunityGardenManager } from './choreography.js';
import { InstagramPostcardGenerator } from './instagram-postcard.js';
import { saveChoreographyToCloud, uploadVideoToCloud } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('canvas-container');
  const statusBadge = document.getElementById('tracking-status');
  const statusText = document.getElementById('status-text');
  const visitorGuide = document.getElementById('visitor-guide');
  const dismissGuideBtn = document.getElementById('dismiss-guide-btn');
  const flowerSelect = document.getElementById('flower-palette');
  const metricBloom = document.getElementById('metric-bloom');
  const metricLean = document.getElementById('metric-lean');
  const metricHeight = document.getElementById('metric-height');
  const toggleCameraBtn = document.getElementById('toggle-camera-btn');
  const cameraBtnLabel = document.getElementById('camera-btn-label');
  const togglePipBtn = document.getElementById('toggle-pip-btn');
  const pipContainer = document.getElementById('pip-container');
  const pipCloseBtn = document.getElementById('pip-close-btn');
  const toggleWindBtn = document.getElementById('toggle-wind-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const fallbackHint = document.getElementById('fallback-hint');
  const cameraPromptBanner = document.getElementById('camera-prompt-banner');
  const promptTitle = document.getElementById('prompt-title');
  const promptDesc = document.getElementById('prompt-desc');
  const promptEnableBtn = document.getElementById('prompt-enable-btn');

  // Choreography & Communal Garden Elements
  const recordChoreographyBtn = document.getElementById('record-choreography-btn');
  const choreographBtnLabel = document.getElementById('choreograph-btn-label');
  const togglePanoramaBtn = document.getElementById('toggle-panorama-btn');
  const panoramaBtnLabel = document.getElementById('panorama-btn-label');
  const gardenCountBadge = document.getElementById('garden-count-badge');
  const gardenCountText = document.getElementById('garden-count-text');

  // Countdown & Recording HUD
  const recordCountdownOverlay = document.getElementById('record-countdown-overlay');
  const countdownNum = document.getElementById('countdown-num');
  const recordingActiveHud = document.getElementById('recording-active-hud');
  const recordProgressBar = document.getElementById('record-progress-bar');
  const recordTimerText = document.getElementById('record-timer-text');
  const recordCancelBtn = document.getElementById('record-cancel-btn');

  // Planting Modal & Email Delivery Elements
  const plantingModal = document.getElementById('planting-modal');
  const flowerNameInput = document.getElementById('flower-name-input');
  const choreographerInput = document.getElementById('choreographer-input');
  const speciesConfirmPill = document.getElementById('species-confirm-pill');
  const speciesPillIcon = document.getElementById('species-pill-icon');
  const speciesPillName = document.getElementById('species-pill-name');
  const randomNameBtn = document.getElementById('random-name-btn');
  const plantingCancelBtn = document.getElementById('planting-cancel-btn');
  const plantingRerecordBtn = document.getElementById('planting-rerecord-btn');
  const plantingDownloadBtn = document.getElementById('planting-download-btn');
  const plantingSubmitBtn = document.getElementById('planting-submit-btn');

  const charNum = document.getElementById('char-num');
  const titleCharCount = document.getElementById('title-char-count');
  const sendEmailToggle = document.getElementById('send-email-toggle');
  const emailInputContainer = document.getElementById('email-input-container');
  const visitorEmailInput = document.getElementById('visitor-email-input');
  const plantingEmailBtn = document.getElementById('planting-email-btn');

  const deliveryToast = document.getElementById('delivery-toast');
  const toastMessage = document.getElementById('toast-message');
  const toastDownloadBtn = document.getElementById('toast-download-btn');
  const toastCloseBtn = document.getElementById('toast-close-btn');
  const toastOkBtn = document.getElementById('toast-ok-btn');
  const toastQrRow = document.getElementById('toast-qr-row');
  const toastQrImg = document.getElementById('toast-qr-img');
  const toastPostcardBtn = document.getElementById('toast-postcard-btn');
  let toastDismissTimer = null;

  // Instagram Story (9:16) Postcard & QR Elements
  const postcardPreviewCanvas = document.getElementById('postcard-preview-canvas');
  const postcardQrImg = document.getElementById('postcard-qr-img');
  const plantingInstagramBtn = document.getElementById('planting-instagram-btn');
  const plantingPostcardBtn = document.getElementById('planting-postcard-btn');
  const igBtnLabel = document.getElementById('ig-btn-label');
  const instagramPostcard = new InstagramPostcardGenerator();
  let currentQrImageElement = null;
  let currentQrDownloadUrl = '';

  // Flower Inspect Card
  const flowerInspectCard = document.getElementById('flower-inspect-card');
  const inspectFlowerName = document.getElementById('inspect-flower-name');
  const inspectSpeciesName = document.getElementById('inspect-species-name');
  const inspectChoreographer = document.getElementById('inspect-choreographer');
  const inspectLoopTime = document.getElementById('inspect-loop-time');
  const inspectCloseBtn = document.getElementById('inspect-close-btn');
  const inspectNextBtn = document.getElementById('inspect-next-btn');
  const inspectReturnBtn = document.getElementById('inspect-return-btn');

  // 1. Detect TV Mode vs Creator/Choreography Station Mode
  const urlParams = new URLSearchParams(window.location.search);
  const isTvMode = urlParams.get('mode') === 'tv' || urlParams.get('tv') === '1';

  // Cross-display zero-latency communication between Mac Creator screen and HDMI TV display
  const gardenChannel = ('BroadcastChannel' in window) ? new BroadcastChannel('devcon_garden_sync') : null;

  // 2. Initialize 3D Environment
  const garden = new GardenEnvironment(container);

  // 3. Instantiate Live Creator Plant with exact morphologies from flower-geometries.html
  let currentSpecies = 'periwinkle';
  const plant = new StudioFlowerManager(currentSpecies);
  plant.setPosition(0, 0, 0);
  garden.scene.add(plant.group);

  // 4. Initialize Communal Garden Manager (Pre-seeded & User Planted Flowers)
  const communityManager = new CommunityGardenManager(garden.scene, garden);

  // Synchronize initial visibility based on display role:
  if (isTvMode) {
    // TV DISPLAY: Full infinite communal garden, hero creator flower hidden, TV camera & external mouse enabled
    document.body.classList.add('tv-mode');
    plant.group.visible = false;
    communityManager.setFlowersVisible(true);
    garden.setCameraMode('tv');
    garden.enableTVMouseControls();
  } else {
    // MAC CREATOR / CHOREOGRAPHY STATION:
    // User requirement: Choreography mode shouldn't show all the flowers!
    // Visitor sees ONLY their own hero flower in a clean, pristine studio.
    plant.group.visible = true;
    communityManager.setFlowersVisible(false);
  }

  const tvCountText = document.getElementById('tv-count-text');
  const updateGardenCountUI = () => {
    const total = communityManager.getPlantedFlowers().length;
    if (gardenCountText) {
      gardenCountText.textContent = `${total} Community Blooms`;
    }
    if (tvCountText) {
      tvCountText.textContent = `🌱 ${total} Blooms Dancing`;
    }
  };
  updateGardenCountUI();

  const showCelebrationBanner = (flowerData) => {
    if (!isTvMode) return;
    const celebrationBanner = document.getElementById('tv-celebration-banner');
    const celebrationTitle = document.getElementById('celebration-title');
    const celebrationDesc = document.getElementById('celebration-desc');
    if (celebrationBanner && celebrationTitle && celebrationDesc) {
      celebrationTitle.textContent = `New Bloom: "${flowerData.name}"!`;
      celebrationDesc.textContent = `Choreographed by ${flowerData.choreographer || 'a Visitor'} • Just planted in the meadow`;
      celebrationBanner.classList.remove('hidden');
      setTimeout(() => {
        celebrationBanner.classList.add('hidden');
      }, 6500);
    }
  };

  // Listen for real-time plant synchronization across browser tabs/windows (BroadcastChannel)
  if (gardenChannel) {
    gardenChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'NEW_BLOOM') {
        const flowerData = event.data.flowerData;
        communityManager.handleRemoteBloom(flowerData);
        updateGardenCountUI();
        if (isTvMode) {
          garden.addSporeBurst(80);
          showCelebrationBanner(flowerData);
        }
      }
    };
  }

  // Cross-window storage listener fallback
  window.addEventListener('storage', (event) => {
    if (event.key === 'botanical_garden_new_bloom' && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue);
        if (payload && payload.id) {
          communityManager.handleRemoteBloom(payload);
          updateGardenCountUI();
          if (isTvMode) {
            garden.addSporeBurst(80);
            showCelebrationBanner(payload);
          }
        }
      } catch (err) {
        console.warn('Storage sync failed:', err);
      }
    }
  });

  // 5. Initialize Vision & Body Tracking (Skipped on TV screen to save 100% CPU for rendering)
  const tracker = new BodyTracker({
    video: document.getElementById('webcam-feed'),
    skeletonCanvas: document.getElementById('skeleton-canvas'),
    onStatusChange: (status, message) => {
      statusText.textContent = message;

      if (status === 'tracking') {
        statusBadge.classList.add('connected');
        fallbackHint.classList.add('hidden');
        cameraPromptBanner.classList.add('hidden');
        cameraBtnLabel.textContent = 'Webcam Active';
      } else if (status === 'prompt') {
        statusBadge.classList.remove('connected');
        cameraPromptBanner.classList.remove('hidden');
        promptTitle.textContent = 'Camera Access Requested';
        promptDesc.textContent = 'Click "Enable Camera" and select "Allow" in your browser so your body can control the plant.';
      } else if (status === 'denied') {
        statusBadge.classList.remove('connected');
        cameraPromptBanner.classList.remove('hidden');
        fallbackHint.classList.remove('hidden');
        cameraBtnLabel.textContent = 'Mouse Fallback';
        promptTitle.textContent = 'Camera Access Blocked';
        promptDesc.textContent = 'Camera is blocked in browser settings. Click the camera icon in your browser URL bar to allow it, then click Retry.';
      } else if (status === 'fallback') {
        statusBadge.classList.remove('connected');
        fallbackHint.classList.remove('hidden');
        cameraPromptBanner.classList.add('hidden');
        cameraBtnLabel.textContent = 'Mouse Fallback';
      } else {
        statusBadge.classList.remove('connected');
      }
    }
  });

  // EASTER EGG: Namaste Mudra Sprouting
  // When the dancer performs Namaste gesture, a new living flower branch sprouts with golden spores!
  let namasteToastTimeout = null;
  const showNamasteEasterEggToast = () => {
    let pill = document.getElementById('namaste-easter-egg-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'namaste-easter-egg-pill';
      pill.className = 'namaste-easter-egg-pill';
      document.body.appendChild(pill);
    }
    pill.innerHTML = `<span>🙏</span> <span>Namaste! A new flower branch has sprouted</span>`;
    pill.classList.remove('hidden');

    clearTimeout(namasteToastTimeout);
    namasteToastTimeout = setTimeout(() => {
      if (pill) pill.classList.add('hidden');
    }, 3200);
  };

  tracker.onNamaste = () => {
    console.log('🙏 Namaste detected! Sprouting new living flower branch...');
    if (plant && typeof plant.sproutNamasteBranch === 'function') {
      plant.sproutNamasteBranch();
    }
    if (garden && typeof garden.addSporeBurst === 'function') {
      garden.addSporeBurst(80);
    }
    showNamasteEasterEggToast();
  };

  // Start vision model only on creator station (keeps TV display ultra-lean)
  if (!isTvMode) {
    tracker.initialize();
  }

  // 5. Initialize Choreography Recorder (with dual 3D canvas raw video & 9:16 postcard video stream capture)
  const choreographyRecorder = new ChoreographyRecorder(
    tracker,
    () => garden.renderer?.domElement,
    {
      postcardCanvasProvider: () => {
        instagramPostcard.ensureMounted();
        return instagramPostcard.canvas;
      },
      onPostcardFrame: () => {
        const meta = getPostcardMeta();
        instagramPostcard.renderFrame(garden.renderer?.domElement, meta, currentQrImageElement);
      }
    }
  );
  let lastRecordedChoreography = null;

  // Poetic Names Pool (Strictly capped to <= 20 characters)
  const POETIC_NAMES = [
    'Luna Bloom',           // 10
    'Lotus of Shanti',      // 15
    'Breeze of Varanasi',   // 18
    'Genda Festive Glow',   // 18
    'Flame of Vasant',      // 15
    'Midnight Mogra',       // 14
    'Devcon Sacred Bloom',  // 19
    'Crimson Shakti',       // 14
    'Monsoon Garland',      // 15
    'Temple Champa',        // 13
    'Ananda Golden Bloom',  // 19
    'Rhythm of Malhar',     // 16
    'Morning Radiance',     // 16
    'Gulmohar Fire',        // 13
    'Sandhya Bloom'         // 13
  ];

  const getRandomPoeticName = () => {
    return POETIC_NAMES[Math.floor(Math.random() * POETIC_NAMES.length)];
  };

  // 6. UI Interactions & Event Handlers
  promptEnableBtn.addEventListener('click', async () => {
    cameraPromptBanner.classList.add('hidden');
    await tracker.startCamera();
  });

  const promptDismissBtn = document.getElementById('prompt-dismiss-btn');
  if (promptDismissBtn) {
    promptDismissBtn.addEventListener('click', () => {
      cameraPromptBanner.classList.add('hidden');
    });
  }

  dismissGuideBtn.addEventListener('click', () => {
    visitorGuide.classList.add('hidden');
  });

  const flowerCards = document.querySelectorAll('.flower-card');
  const storyName = document.getElementById('story-name');
  const storyTagline = document.getElementById('story-tagline');

  const switchSpecies = (speciesKey) => {
    currentSpecies = speciesKey;
    const meta = CHOREOGRAPHY_SPECIES_META[speciesKey] || FLOWER_SPECIES[speciesKey];

    plant.setSpecies(speciesKey);

    if (flowerSelect) flowerSelect.value = speciesKey;

    flowerCards.forEach((card) => {
      card.classList.toggle('active', card.dataset.species === speciesKey);
    });

    if (storyName && storyTagline && meta) {
      storyName.textContent = meta.name;
      storyTagline.textContent = meta.tagline || '';
    }

    const activeFlowerTitle = document.getElementById('active-flower-title');
    if (activeFlowerTitle && meta) {
      activeFlowerTitle.textContent = (meta.name || speciesKey).toUpperCase();
    }

    if (garden.setPollenColor && meta) {
      const pColor = meta.dotColor ? parseInt(meta.dotColor.replace('#', '0x')) : (meta.pollenColor || 0x8794d6);
      garden.setPollenColor(pColor);
      garden.addSporeBurst(45);
    }
    plant.triggerGust();
  };

  flowerSelect.addEventListener('change', (e) => {
    switchSpecies(e.target.value);
  });

  flowerCards.forEach((card) => {
    card.addEventListener('click', () => {
      switchSpecies(card.dataset.species);
    });
  });

  // Initialize with Periwinkle
  switchSpecies('periwinkle');

  toggleCameraBtn.addEventListener('click', () => {
    const isWebcam = tracker.toggleCamera();
    cameraBtnLabel.textContent = isWebcam ? 'Webcam Active' : 'Mouse Fallback';
  });

  const togglePip = () => {
    pipContainer.classList.toggle('minimized');
  };
  togglePipBtn.addEventListener('click', togglePip);
  pipCloseBtn.addEventListener('click', () => {
    pipContainer.classList.add('minimized');
  });

  const triggerBreeze = () => {
    garden.triggerGust();
    plant.triggerGust();
    garden.addSporeBurst(60);
  };
  toggleWindBtn.addEventListener('click', triggerBreeze);

  // Panorama Meadow Walk Mode
  let isPanoramaMode = false;
  const togglePanorama = () => {
    isPanoramaMode = !isPanoramaMode;
    if (isPanoramaMode) {
      garden.setCameraMode('panorama');
      communityManager.setFlowersVisible(true);
      togglePanoramaBtn.classList.add('active');
      panoramaBtnLabel.textContent = 'Studio View';
      flowerInspectCard.classList.add('hidden');
    } else {
      garden.resetToStudio();
      communityManager.setFlowersVisible(false);
      togglePanoramaBtn.classList.remove('active');
      panoramaBtnLabel.textContent = 'Meadow Walk';
    }
  };
  togglePanoramaBtn.addEventListener('click', togglePanorama);
  gardenCountBadge.addEventListener('click', togglePanorama);

  // Clean Screen Mode (Hide UI)
  const toggleUiBtn = document.getElementById('toggle-ui-btn');
  const restoreUiBtn = document.getElementById('restore-ui-btn');
  const toggleCleanView = () => {
    document.body.classList.toggle('clean-view');
    const isClean = document.body.classList.contains('clean-view');
    restoreUiBtn.classList.toggle('hidden', !isClean);
  };
  toggleUiBtn.addEventListener('click', toggleCleanView);
  restoreUiBtn.addEventListener('click', toggleCleanView);

  // Installation Fullscreen Toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullScreen);
  }

  // -----------------------------------------------------------------------------------
  // TABLET & LAPTOP BLOOM VIEWPORT & INLET CONTROLS (Fullscreen Flower + Floating Inlet)
  // -----------------------------------------------------------------------------------
  const isTabletBloom = window.location.pathname.includes('tablet-bloom') || window.location.pathname.includes('laptop-bloom') || document.body.classList.contains('tablet-bloom-view');
  const isLaptopBloom = window.location.pathname.includes('laptop-bloom') || document.body.classList.contains('laptop-bloom-view');

  if (isTabletBloom) {
    // Natural frontal portrait view with subtle top angle into petals
    const TABLET_BLOOM_RADIUS = isLaptopBloom ? 4.35 : 4.85; // Natural framing for laptop widescreen or vertical tablet
    const TABLET_BLOOM_PHI = 1.10; // Gently elevated top angle (~63° from vertical / ~27° above horizontal)
    const TABLET_BLOOM_THETA = 0.04; // Centered
    const TABLET_BLOOM_LOOK_Y = 1.00; // Framed comfortably on flower center

    if (garden && garden.studioSpherical) {
      garden.studioSpherical.radius = TABLET_BLOOM_RADIUS;
      garden.targetStudioSpherical.radius = TABLET_BLOOM_RADIUS;
      garden.studioSpherical.phi = TABLET_BLOOM_PHI;
      garden.targetStudioSpherical.phi = TABLET_BLOOM_PHI;
      garden.studioSpherical.theta = TABLET_BLOOM_THETA;
      garden.targetStudioSpherical.theta = TABLET_BLOOM_THETA;

      if (garden.studioLookAt) {
        garden.studioLookAt.set(0, TABLET_BLOOM_LOOK_Y, 0);
      }
      if (garden.currentStudioLook) {
        garden.currentStudioLook.set(0, TABLET_BLOOM_LOOK_Y, 0);
      }
    }

    // Reset view helper
    const resetFlowerView = () => {
      if (garden && garden.targetStudioSpherical) {
        garden.targetStudioSpherical.radius = TABLET_BLOOM_RADIUS;
        garden.targetStudioSpherical.phi = TABLET_BLOOM_PHI;
        garden.targetStudioSpherical.theta = TABLET_BLOOM_THETA;
        if (garden.studioLookAt) garden.studioLookAt.set(0, TABLET_BLOOM_LOOK_Y, 0);
      }
    };

    const orbitHint = document.querySelector('.tablet-orbit-hint');
    if (orbitHint) {
      orbitHint.style.cursor = 'pointer';
      orbitHint.style.pointerEvents = 'auto';
      orbitHint.addEventListener('click', resetFlowerView);
    }

    const flowerCanvas = document.getElementById('canvas-container');
    if (flowerCanvas) {
      flowerCanvas.addEventListener('dblclick', resetFlowerView);
    }

    const cameraPane = document.getElementById('camera-pane');
    const fovToggleBtn = document.getElementById('inlet-fov-toggle');
    const fovLabel = document.getElementById('fov-label');
    const cornerToggleBtn = document.getElementById('inlet-corner-toggle');
    const minToggleBtn = document.getElementById('inlet-minimize-toggle');
    const minIcon = document.getElementById('min-icon');
    const zoomInBtn = document.getElementById('inlet-zoom-in');
    const zoomOutBtn = document.getElementById('inlet-zoom-out');
    const zoomValLabel = document.getElementById('inlet-zoom-val');

    let isCoverMode = true; // Default object-fit: cover (matches index.html exact 1:1 skeleton size)

    if (fovToggleBtn) {
      fovToggleBtn.addEventListener('click', () => {
        isCoverMode = !isCoverMode;
        if (cameraPane) {
          cameraPane.classList.toggle('inlet-fit-contain', !isCoverMode);
        }
        if (fovLabel) {
          fovLabel.textContent = isCoverMode ? 'Fill' : 'Contain';
        }
      });
    }

    let currentHardwareZoom = 1.0;
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', async () => {
        currentHardwareZoom = Math.max(0.5, +(currentHardwareZoom - 0.2).toFixed(1));
        if (tracker && typeof tracker.setHardwareZoom === 'function') {
          const applied = await tracker.setHardwareZoom(currentHardwareZoom);
          if (applied !== null && zoomValLabel) {
            zoomValLabel.textContent = `${applied.toFixed(1)}x`;
          }
        }
      });
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', async () => {
        currentHardwareZoom = Math.min(2.5, +(currentHardwareZoom + 0.2).toFixed(1));
        if (tracker && typeof tracker.setHardwareZoom === 'function') {
          const applied = await tracker.setHardwareZoom(currentHardwareZoom);
          if (applied !== null && zoomValLabel) {
            zoomValLabel.textContent = `${applied.toFixed(1)}x`;
          }
        }
      });
    }

    if (cornerToggleBtn) {
      cornerToggleBtn.addEventListener('click', () => {
        if (cameraPane) {
          cameraPane.classList.toggle('corner-left');
        }
      });
    }

    const sizeToggleBtn = document.getElementById('inlet-size-toggle');
    const sizeClasses = ['', 'inlet-size-large', 'inlet-size-compact'];
    let sizeIndex = 0;

    if (sizeToggleBtn) {
      sizeToggleBtn.addEventListener('click', () => {
        sizeIndex = (sizeIndex + 1) % sizeClasses.length;
        if (cameraPane) {
          cameraPane.classList.remove('inlet-size-large', 'inlet-size-compact');
          if (sizeClasses[sizeIndex]) {
            cameraPane.classList.add(sizeClasses[sizeIndex]);
          }
        }
      });
    }

    if (minToggleBtn) {
      minToggleBtn.addEventListener('click', () => {
        if (cameraPane) {
          const isMin = cameraPane.classList.toggle('minimized');
          if (minIcon) minIcon.textContent = isMin ? '+' : '−';
        }
      });
    }

    // Center Stage Guide Modal Toggle
    const csTipBtn = document.getElementById('inlet-centerstage-tip-btn');
    const csModal = document.getElementById('centerstage-modal');
    const csCloseBtn = document.getElementById('centerstage-close-btn');
    const csGotItBtn = document.getElementById('centerstage-gotit-btn');

    if (csTipBtn && csModal) {
      csTipBtn.addEventListener('click', () => {
        csModal.classList.remove('hidden');
      });
    }
    if (csCloseBtn && csModal) {
      csCloseBtn.addEventListener('click', () => {
        csModal.classList.add('hidden');
      });
    }
    if (csGotItBtn && csModal) {
      csGotItBtn.addEventListener('click', () => {
        csModal.classList.add('hidden');
      });
    }
  }

  // -----------------------------------------------------------------------------------
  // HEADER ACTION BUTTONS (TV LAUNCH & HOW-TO-RECORD GUIDE MODAL)
  // -----------------------------------------------------------------------------------
  const launchTvBtn = document.getElementById('launch-tv-btn');
  if (launchTvBtn) {
    launchTvBtn.addEventListener('click', () => {
      const tvUrl = window.location.origin + window.location.pathname + '?mode=tv';
      window.open(tvUrl, '_blank');
    });
  }

  const recordingGuideModal = document.getElementById('recording-guide-modal');
  const openGuideBtn = document.getElementById('open-guide-btn');
  const guideModalCloseBtn = document.getElementById('guide-modal-close-btn');
  const guideModalBackdrop = document.getElementById('guide-modal-backdrop');
  const guideReadyBtn = document.getElementById('guide-ready-btn');

  const setGuideModalVisible = (show) => {
    if (!recordingGuideModal) return;
    if (show) {
      recordingGuideModal.classList.remove('hidden');
    } else {
      recordingGuideModal.classList.add('hidden');
    }
  };

  if (openGuideBtn) openGuideBtn.addEventListener('click', () => setGuideModalVisible(true));
  if (guideModalCloseBtn) guideModalCloseBtn.addEventListener('click', () => setGuideModalVisible(false));
  if (guideModalBackdrop) guideModalBackdrop.addEventListener('click', () => setGuideModalVisible(false));
  if (guideReadyBtn) guideReadyBtn.addEventListener('click', () => setGuideModalVisible(false));

  // -----------------------------------------------------------------------------------
  // CHOREOGRAPHY RECORDING WORKFLOW
  // -----------------------------------------------------------------------------------
  const startRecordingChoreography = () => {
    // Reset any open inspect or modal
    flowerInspectCard.classList.add('hidden');
    plantingModal.classList.add('hidden');
    setGuideModalVisible(false);
    garden.resetToStudio();
    communityManager.setFlowersVisible(false); // Clean studio for choreography!
    isPanoramaMode = false;
    togglePanoramaBtn.classList.remove('active');
    panoramaBtnLabel.textContent = 'Meadow Walk';

    // Show countdown overlay
    recordCountdownOverlay.classList.remove('hidden');

    choreographyRecorder.startCountdown(
      (count) => {
        countdownNum.textContent = count;
      },
      () => {
        // Countdown completed: start recording
        recordCountdownOverlay.classList.add('hidden');
        recordingActiveHud.classList.remove('hidden');
        recordProgressBar.style.width = '0%';
        recordTimerText.textContent = '0.0s / 10.0s';
      },
      (progress, elapsedSec) => {
        recordProgressBar.style.width = `${Math.round(progress * 100)}%`;
        recordTimerText.textContent = `${elapsedSec.toFixed(1)}s / 10.0s`;
      },
      (result) => {
        // Recording complete: open planting dialog
        recordingActiveHud.classList.add('hidden');
        lastRecordedChoreography = result;
        openPlantingModal();
      }
    );
  };

  recordCancelBtn.addEventListener('click', () => {
    choreographyRecorder.cancel();
    recordCountdownOverlay.classList.add('hidden');
    recordingActiveHud.classList.add('hidden');
  });

  recordChoreographyBtn.addEventListener('click', () => {
    startRecordingChoreography();
  });

  // Character Counter & Email Input Handlers
  const updateTitleCharCount = () => {
    if (!flowerNameInput) return;
    const len = flowerNameInput.value.length;
    if (charNum) charNum.textContent = len;
    if (titleCharCount) {
      if (len >= 20) {
        titleCharCount.classList.add('limit-reached');
      } else {
        titleCharCount.classList.remove('limit-reached');
      }
    }
  };

  if (flowerNameInput) {
    flowerNameInput.addEventListener('input', updateTitleCharCount);
  }

  if (sendEmailToggle && emailInputContainer) {
    sendEmailToggle.addEventListener('change', () => {
      if (sendEmailToggle.checked) {
        emailInputContainer.classList.remove('collapsed');
      } else {
        emailInputContainer.classList.add('collapsed');
      }
    });
  }

  // Instagram Postcard & Dynamic Mobile QR Generator (Points directly to Infinite Garden Meadow)
  const getShareUrl = (flowerNameToSearch = null) => {
    const name = flowerNameToSearch || flowerNameInput?.value?.trim()?.slice(0, 20);
    if (name && name.toLowerCase() !== 'luna bloom') {
      return `https://collective-bloom-kappa.vercel.app/infinite-garden?search=${encodeURIComponent(name)}`;
    }
    return 'https://collective-bloom-kappa.vercel.app/infinite-garden';
  };

  const getPostcardMeta = () => {
    const speciesMeta = CHOREOGRAPHY_SPECIES_META[currentSpecies] || FLOWER_SPECIES[currentSpecies] || {};
    const inputTitle = flowerNameInput?.value.trim().slice(0, 20);
    const inputDancer = choreographerInput?.value.trim();
    const cleanDancer = (inputDancer && inputDancer.toLowerCase() !== 'devcon gardener' && inputDancer.toLowerCase() !== 'anonymous dancer') ? inputDancer : '';
    return {
      flowerName: inputTitle || speciesMeta.name || 'Living Flower',
      choreographer: cleanDancer,
      speciesName: speciesMeta.name || 'Botanical Wildflower',
      artworkTitle: 'Collective Bloom',
      artistName: 'Harshit Agrawal (@harshitrnnh)',
      eventTitle: 'Devcon, Mumbai 2026'
    };
  };

  const updatePostcardPreview = () => {
    if (!postcardPreviewCanvas) return;
    const meta = getPostcardMeta();
    instagramPostcard.renderToPreviewCanvas(
      postcardPreviewCanvas,
      garden.renderer?.domElement,
      meta,
      currentQrImageElement
    );
  };

  const refreshPostcardAndQR = async () => {
    currentQrDownloadUrl = getShareUrl();
    const qrDataUrl = await instagramPostcard.generateQRCodeDataUrl(currentQrDownloadUrl);
    if (qrDataUrl) {
      if (postcardQrImg) postcardQrImg.src = qrDataUrl;
      if (toastQrImg) toastQrImg.src = qrDataUrl;

      const img = new Image();
      img.onload = () => {
        currentQrImageElement = img;
        updatePostcardPreview();
      };
      img.src = qrDataUrl;
    } else {
      updatePostcardPreview();
    }
  };

  const openPlantingModal = () => {
    const meta = CHOREOGRAPHY_SPECIES_META[currentSpecies] || FLOWER_SPECIES[currentSpecies];
    // Do not force generic 'Devcon Gardener' - leave empty if not typed by user
    if (choreographerInput.value === 'Devcon Gardener' || choreographerInput.value === 'Anonymous Dancer') {
      choreographerInput.value = '';
    }
    updateTitleCharCount();
    speciesPillName.textContent = meta ? meta.name : 'Living Flower';
    speciesPillIcon.textContent =
      currentSpecies === 'periwinkle' ? '🌸' :
      currentSpecies === 'poppy' ? '🌺' :
      currentSpecies === 'chamomile' ? '🌼' :
      currentSpecies === 'marigold' || currentSpecies === 'celadon' ? '🏵️' :
      currentSpecies === 'lotus' ? '🪷' :
      currentSpecies === 'hibiscus' ? '🌺' : '🌿';

    refreshPostcardAndQR();

    plantingModal.classList.remove('hidden');
    setTimeout(() => flowerNameInput.focus(), 100);
  };

  if (flowerNameInput) {
    flowerNameInput.addEventListener('input', () => {
      updateTitleCharCount();
      updatePostcardPreview();
    });
  }

  if (choreographerInput) {
    choreographerInput.addEventListener('input', () => {
      updatePostcardPreview();
    });
  }

  // 1. Download 9:16 Vertical Instagram Story Video (MP4 / WebM)
  if (plantingInstagramBtn) {
    plantingInstagramBtn.addEventListener('click', async () => {
      if (!lastRecordedChoreography) return;
      const meta = getPostcardMeta();
      const origText = igBtnLabel ? igBtnLabel.textContent : 'Instagram Story (9:16)';
      plantingInstagramBtn.disabled = true;

      try {
        if (lastRecordedChoreography.postcardVideoBlob) {
          const ext = lastRecordedChoreography.postcardVideoBlob.type.includes('mp4') ? 'mp4' : 'webm';
          const filename = `Collective_Bloom_${(meta.flowerName || 'Bloom').replace(/[^a-zA-Z0-9_-]/g, '_')}_Devcon_2026.${ext}`;
          downloadToDisk(lastRecordedChoreography.postcardVideoBlob, filename, lastRecordedChoreography.postcardVideoBlob.type);
        } else if (lastRecordedChoreography.videoBlob) {
          if (igBtnLabel) igBtnLabel.textContent = 'Rendering Story...';
          const shareQrUrl = getShareUrl(meta.flowerName);
          const result = await instagramPostcard.compositeVideoFromBlob(
            lastRecordedChoreography.videoBlob,
            meta,
            shareQrUrl,
            (progress) => {
              if (igBtnLabel) igBtnLabel.textContent = `Story ${(progress * 100).toFixed(0)}%`;
            }
          );
          downloadToDisk(result.videoBlob, result.filename, result.mimeType);
        } else {
          // Fallback if no video blob: export still postcard
          const still = await instagramPostcard.exportStillPostcardPNG();
          downloadToDisk(still.blob, `Collective_Bloom_${meta.flowerName}_Story.png`, 'image/png');
        }

        if (igBtnLabel) igBtnLabel.textContent = '✅ Saved Story!';
        setTimeout(() => {
          if (igBtnLabel) igBtnLabel.textContent = origText;
          plantingInstagramBtn.disabled = false;
        }, 2200);
      } catch (err) {
        console.warn('Error compositing Instagram story video:', err);
        if (igBtnLabel) igBtnLabel.textContent = '⚠️ Export Error';
        plantingInstagramBtn.disabled = false;
      }
    });
  }

  // 2. Download Still 9:16 Postcard (PNG)
  const downloadStillPostcard = async () => {
    const meta = getPostcardMeta();
    instagramPostcard.renderFrame(garden.renderer?.domElement, meta, currentQrImageElement);
    const still = await instagramPostcard.exportStillPostcardPNG(
      `Collective_Bloom_Harshit_Agrawal_${meta.flowerName}_Devcon_2026.png`
    );
    downloadToDisk(still.blob, still.filename, 'image/png');
  };

  if (plantingPostcardBtn) {
    plantingPostcardBtn.addEventListener('click', async () => {
      const orig = plantingPostcardBtn.textContent;
      plantingPostcardBtn.textContent = '📸 Saving...';
      await downloadStillPostcard();
      plantingPostcardBtn.textContent = '✅ Saved Postcard!';
      setTimeout(() => {
        plantingPostcardBtn.textContent = orig;
      }, 2000);
    });
  }

  if (toastPostcardBtn) {
    toastPostcardBtn.addEventListener('click', async () => {
      await downloadStillPostcard();
    });
  }

  randomNameBtn.addEventListener('click', () => {
    flowerNameInput.value = getRandomPoeticName().slice(0, 20);
    updateTitleCharCount();
  });

  plantingCancelBtn.addEventListener('click', () => {
    plantingModal.classList.add('hidden');
  });

  plantingRerecordBtn.addEventListener('click', () => {
    plantingModal.classList.add('hidden');
    startRecordingChoreography();
  });

  // Local Disk Download Helper for Every Choreography Recording
  const downloadToDisk = (blobOrString, filename, mimeType) => {
    try {
      let blob;
      if (blobOrString instanceof Blob) {
        blob = blobOrString;
      } else {
        blob = new Blob([blobOrString], { type: mimeType || 'application/json' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } catch (err) {
      console.warn('Error saving choreography recording to local disk:', err);
    }
  };

  const downloadChoreographyToLocalDisk = (flowerName, species, rec) => {
    if (!rec) return;
    const safeName = (flowerName || 'bloom').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // 1. Download captured 10s video blob (WebM)
    if (rec.videoBlob) {
      const videoFileName = `${safeName}_${species}_${timestamp}.webm`;
      downloadToDisk(rec.videoBlob, videoFileName, 'video/webm');
    }

    // 2. Download full choreography motion frames & metadata (JSON)
    const choreographyPayload = {
      name: flowerName,
      species: species,
      duration: rec.duration || 10.0,
      fps: rec.fps || 20,
      recordedAt: new Date().toISOString(),
      frameCount: (rec.frames || []).length,
      frames: rec.frames || []
    };
    const jsonStr = JSON.stringify(choreographyPayload, null, 2);
    const jsonFileName = `${safeName}_${species}_choreography_${timestamp}.json`;
    setTimeout(() => {
      downloadToDisk(jsonStr, jsonFileName, 'application/json');
    }, 350);
  };

  // Direct Email Dispatch (Uploads videos to cloud first, then sends email with both attachments)
  const dispatchVisitorEmail = async (flowerName, choreographerName, visitorEmail) => {
    if (!visitorEmail || !visitorEmail.includes('@') || !lastRecordedChoreography) {
      alert('Please enter a valid email address.');
      if (visitorEmailInput) visitorEmailInput.focus();
      return false;
    }

    try {
      const safeName = (flowerName || 'bloom').replace(/[^a-zA-Z0-9_-]/g, '_');
      const timestamp = Date.now();

      let videoUrl = null;
      let postcardUrl = null;

      // 1. Upload Raw Video to Supabase Storage
      if (lastRecordedChoreography.videoBlob && lastRecordedChoreography.videoBlob.size > 2000) {
        try {
          const rawFilename = `${safeName}_raw_${timestamp}.mp4`;
          videoUrl = await uploadVideoToCloud(lastRecordedChoreography.videoBlob, rawFilename);
          console.log('[Email Dispatch] Uploaded raw video to cloud:', videoUrl);
        } catch (uErr) {
          console.warn('[Email Dispatch] Raw video cloud upload note:', uErr);
        }
      }

      // 2. Upload Postcard Video to Supabase Storage (composited with user's custom tag & choreographer name)
      let postcardBlob = null;
      if (lastRecordedChoreography.videoBlob && lastRecordedChoreography.videoBlob.size > 2000) {
        try {
          const compMeta = {
            flowerName: flowerName || '',
            choreographer: choreographerName || '',
            speciesName: (CHOREOGRAPHY_SPECIES_META[currentSpecies] || FLOWER_SPECIES[currentSpecies] || {}).name || 'Botanical Wildflower',
            artworkTitle: 'Collective Bloom',
            artistName: 'Harshit Agrawal (@harshitrnnh)',
            eventTitle: 'Devcon, Mumbai 2026'
          };
          const shareQrUrl = getShareUrl(flowerName);
          const compResult = await instagramPostcard.compositeVideoFromBlob(
            lastRecordedChoreography.videoBlob,
            compMeta,
            shareQrUrl
          );
          if (compResult && compResult.videoBlob) {
            postcardBlob = compResult.videoBlob;
            console.log('[Email Dispatch] Custom postcard video composited:', postcardBlob.size, 'bytes');
          }
        } catch (cErr) {
          console.warn('[Email Dispatch] Postcard video compositing note:', cErr);
        }
      }
      if (!postcardBlob && lastRecordedChoreography.postcardVideoBlob) {
        postcardBlob = lastRecordedChoreography.postcardVideoBlob;
      }

      if (postcardBlob && postcardBlob.size > 2000) {
        try {
          const postFilename = `${safeName}_postcard_${timestamp}.mp4`;
          postcardUrl = await uploadVideoToCloud(postcardBlob, postFilename);
          console.log('[Email Dispatch] Uploaded postcard video to cloud:', postcardUrl);
        } catch (uErr) {
          console.warn('[Email Dispatch] Postcard video cloud upload note:', uErr);
        }
      }

      const emailPayload = {
        toEmail: visitorEmail,
        flowerName,
        choreographer: choreographerName,
        species: currentSpecies,
        videoUrl: videoUrl || undefined,
        postcardUrl: postcardUrl || undefined
      };

      // Fallback: If cloud upload was not available and blob is < 3MB, send base64
      if (!videoUrl && lastRecordedChoreography.videoBlob && lastRecordedChoreography.videoBlob.size < 3000000) {
        const blobToBase64 = (blob) => new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(blob);
        });
        emailPayload.videoBase64 = await blobToBase64(lastRecordedChoreography.videoBlob);
      }

      console.log('[Email Dispatch] Triggering /api/send-email with payload:', {
        toEmail: visitorEmail,
        flowerName,
        hasVideoUrl: !!emailPayload.videoUrl,
        hasPostcardUrl: !!emailPayload.postcardUrl
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Email Dispatch] API responded with error:', response.status, errorText);
        return false;
      }

      const resJson = await response.json();
      console.log('[Email Dispatch] Email dispatched successfully:', resJson);
      return true;
    } catch (err) {
      console.error('[Email Dispatch] Unexpected error:', err);
      return false;
    }
  };

  if (plantingEmailBtn) {
    plantingEmailBtn.addEventListener('click', async () => {
      if (!lastRecordedChoreography) return;
      const flowerName = flowerNameInput.value.trim().slice(0, 20) || (CHOREOGRAPHY_SPECIES_META[currentSpecies]?.name || 'Living Flower');
      const choreographerName = (choreographerInput.value.trim() && choreographerInput.value.trim().toLowerCase() !== 'devcon gardener' && choreographerInput.value.trim().toLowerCase() !== 'anonymous dancer')
        ? choreographerInput.value.trim()
        : '';
      const visitorEmail = visitorEmailInput ? visitorEmailInput.value.trim() : '';

      const origText = plantingEmailBtn.textContent;
      plantingEmailBtn.textContent = '⏳ Sending...';
      plantingEmailBtn.disabled = true;

      const ok = await dispatchVisitorEmail(flowerName, choreographerName, visitorEmail);
      if (ok) {
        plantingEmailBtn.textContent = '✅ Email Sent!';
      } else {
        plantingEmailBtn.textContent = '⚠️ Check Email';
      }
      setTimeout(() => {
        plantingEmailBtn.textContent = origText;
        plantingEmailBtn.disabled = false;
      }, 2500);
    });
  }

  if (plantingDownloadBtn) {
    plantingDownloadBtn.addEventListener('click', () => {
      if (!lastRecordedChoreography) return;
      const flowerName = flowerNameInput.value.trim().slice(0, 20) || (CHOREOGRAPHY_SPECIES_META[currentSpecies]?.name || 'Living Flower');
      downloadChoreographyToLocalDisk(flowerName, currentSpecies, lastRecordedChoreography);
      const origText = plantingDownloadBtn.textContent;
      plantingDownloadBtn.textContent = '✅ Saved to Disk!';
      setTimeout(() => {
        plantingDownloadBtn.textContent = origText;
      }, 2000);
    });
  }

  plantingSubmitBtn.addEventListener('click', () => {
    if (!lastRecordedChoreography) return;

    const flowerName = flowerNameInput.value.trim().slice(0, 20) || (CHOREOGRAPHY_SPECIES_META[currentSpecies]?.name || 'Living Flower');
    const choreographerName = (choreographerInput.value.trim() && choreographerInput.value.trim().toLowerCase() !== 'devcon gardener' && choreographerInput.value.trim().toLowerCase() !== 'anonymous dancer')
      ? choreographerInput.value.trim()
      : '';
    const wantEmail = sendEmailToggle ? sendEmailToggle.checked : true;
    const visitorEmail = visitorEmailInput ? visitorEmailInput.value.trim() : '';

    if (wantEmail && (!visitorEmail || !visitorEmail.includes('@'))) {
      alert('Please enter a valid email address to receive your 10-second video, or uncheck the email checkbox to plant without email.');
      if (visitorEmailInput) visitorEmailInput.focus();
      return;
    }

    // Plant in Communal Garden
    const newRecord = communityManager.plantNewFlower({
      name: flowerName,
      choreographer: choreographerName,
      species: currentSpecies,
      frames: lastRecordedChoreography.frames,
      duration: lastRecordedChoreography.duration || 10.0,
      fps: lastRecordedChoreography.fps || 20
    });

    plantingModal.classList.add('hidden');
    updateGardenCountUI();

    // Broadcast across windows to the TV display in real-time
    if (gardenChannel) {
      gardenChannel.postMessage({
        type: 'NEW_BLOOM',
        flowerData: newRecord.meta
      });
    }

    // Save motion data + video recording to Supabase Cloud & Realtime channel
    // Pushes instant bloom directly to iPad & TV display!
    saveChoreographyToCloud({
      id: newRecord.meta.id,
      name: flowerName,
      choreographer: choreographerName,
      species: currentSpecies,
      duration: lastRecordedChoreography.duration || 10.0,
      fps: lastRecordedChoreography.fps || 20,
      frames: lastRecordedChoreography.frames
    }, lastRecordedChoreography.videoBlob).catch((err) => {
      console.warn('Supabase cloud save note:', err);
    });

    try {
      localStorage.setItem('botanical_garden_new_bloom', JSON.stringify({
        ...newRecord.meta,
        _t: Date.now()
      }));

      // Dedicated persistent storage for visitor planted flowers across all lab environments
      const userPlants = JSON.parse(localStorage.getItem('botanical_garden_user_plants') || '[]');
      const filtered = userPlants.filter(p => p.id !== newRecord.meta.id);
      filtered.unshift({
        id: newRecord.meta.id,
        name: flowerName,
        choreographer: choreographerName,
        species: currentSpecies,
        duration: lastRecordedChoreography.duration || 10.0,
        fps: lastRecordedChoreography.fps || 20,
        frames: lastRecordedChoreography.frames,
        timestamp: Date.now()
      });
      localStorage.setItem('botanical_garden_user_plants', JSON.stringify(filtered.slice(0, 50)));
    } catch (_) {}

    // Configure downloadable video link in toast notification
    if (lastRecordedChoreography.videoBlob && toastDownloadBtn) {
      const isMp4 = lastRecordedChoreography.videoBlob.type.includes('mp4');
      const ext = isMp4 ? 'mp4' : 'mp4'; // default extension for universal mobile opening
      const safeName = flowerName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const videoUrl = URL.createObjectURL(lastRecordedChoreography.videoBlob);
      toastDownloadBtn.href = videoUrl;
      toastDownloadBtn.download = `${safeName}_10s_dance.${ext}`;
      toastDownloadBtn.style.display = 'inline-flex';
    }

    // Handle 10-Second Animation Email Delivery Option
    if (wantEmail && visitorEmail && visitorEmail.includes('@')) {
      // Save delivery dispatch into exhibition queue
      try {
        const dispatches = JSON.parse(localStorage.getItem('botanical_garden_email_dispatches') || '[]');
        dispatches.push({
          id: 'disp_' + Date.now(),
          email: visitorEmail,
          title: flowerName,
          choreographer: choreographerName,
          species: currentSpecies,
          duration: 10.0,
          timestamp: Date.now(),
          hasVideo: !!lastRecordedChoreography.videoBlob
        });
        localStorage.setItem('botanical_garden_email_dispatches', JSON.stringify(dispatches));
      } catch (_) {}

      // Asynchronously trigger serverless email dispatch with raw video and 9:16 postcard
      dispatchVisitorEmail(flowerName, choreographerName, visitorEmail).then((ok) => {
        if (ok) {
          console.log('Choreography email sent successfully to', visitorEmail);
        } else {
          console.warn('Choreography email dispatch failed for', visitorEmail);
        }
      });

      if (toastMessage) {
        toastMessage.innerHTML = isTabletBloom
          ? `Your living bloom "<strong>${flowerName}</strong>" has sprouted in Collective Bloom! Videos emailed to <strong>${visitorEmail}</strong>.`
          : `Saved recording to disk & emailed 10-second animation video and postcard of "<strong>${flowerName}</strong>" to <strong>${visitorEmail}</strong>.`;
      }
    } else {
      if (toastMessage) {
        toastMessage.innerHTML = isTabletBloom
          ? `Your living bloom "<strong>${flowerName}</strong>" has sprouted in Collective Bloom!`
          : `Your flower "<strong>${flowerName}</strong>" has been planted in Collective Bloom!`;
      }
    }

    if (deliveryToast) {
      deliveryToast.classList.remove('hidden');
    }

    // Auto-dismiss confirmation toast (3.5s for tablet bloom, 8.5s for lab)
    if (toastDismissTimer) clearTimeout(toastDismissTimer);
    toastDismissTimer = setTimeout(() => {
      if (deliveryToast) deliveryToast.classList.add('hidden');
    }, isTabletBloom ? 3500 : 8500);

    // Spore burst & breeze celebration
    garden.addSporeBurst(80);
    plant.triggerGust();

    // On Creator Station: keep choreography studio pristine!
    // Flowers stay hidden so creator has pure focus on their hero plant.
    communityManager.setFlowersVisible(false);
    garden.resetToStudio();
  });

  // Wire Delivery Toast buttons
  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      if (deliveryToast) deliveryToast.classList.add('hidden');
    });
  }
  if (toastOkBtn) {
    toastOkBtn.addEventListener('click', () => {
      if (deliveryToast) deliveryToast.classList.add('hidden');
    });
  }

  // -----------------------------------------------------------------------------------
  // FLOWER INSPECTION & RAYCASTING
  // -----------------------------------------------------------------------------------
  let currentInspectedIndex = 0;

  const showInspectCard = (flowerRecord) => {
    if (!flowerRecord) return;
    const meta = flowerRecord.meta;
    const sp = FLOWER_SPECIES[meta.species] || FLOWER_SPECIES.lotus;

    inspectFlowerName.textContent = meta.name;
    inspectSpeciesName.textContent = `${sp.hindiName} • ${sp.name}`;
    inspectChoreographer.textContent = meta.choreographer || 'Community Dancer';
    inspectLoopTime.textContent = `${(meta.duration || 8.0).toFixed(1)}s seamless dance loop`;

    flowerInspectCard.classList.remove('hidden');

    const list = communityManager.getPlantedFlowers();
    currentInspectedIndex = list.findIndex(f => f.meta.id === meta.id);
  };

  inspectCloseBtn.addEventListener('click', () => {
    flowerInspectCard.classList.add('hidden');
    garden.resetToStudio();
  });

  inspectReturnBtn.addEventListener('click', () => {
    flowerInspectCard.classList.add('hidden');
    garden.resetToStudio();
  });

  inspectNextBtn.addEventListener('click', () => {
    const list = communityManager.getPlantedFlowers();
    if (list.length === 0) return;
    currentInspectedIndex = (currentInspectedIndex + 1) % list.length;
    const nextFlower = list[currentInspectedIndex];
    garden.focusPlantedFlower(nextFlower);
    showInspectCard(nextFlower);
  });

  // Raycaster for clicking flowers directly in 3D
  const raycaster = new THREE.Raycaster();
  const mousePos = new THREE.Vector2();
  let mouseDownCoord = { x: 0, y: 0 };

  window.addEventListener('mousedown', (e) => {
    mouseDownCoord = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', (e) => {
    // Only trigger if click was not a long drag
    const dist = Math.hypot(e.clientX - mouseDownCoord.x, e.clientY - mouseDownCoord.y);
    if (dist > 8) return;

    // Ignore if clicking UI buttons/modals
    if (e.target.closest('.installation-hud') || e.target.closest('.visitor-guide') || e.target.closest('.indian-flower-dock') || e.target.closest('.pip-container') || e.target.closest('.planting-modal-backdrop') || e.target.closest('.flower-inspect-card') || e.target.closest('.recording-active-hud')) {
      return;
    }

    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mousePos, garden.camera);
    const hitFlower = communityManager.findFlowerAtRay(raycaster);

    if (hitFlower) {
      garden.focusPlantedFlower(hitFlower);
      showInspectCard(hitFlower);
      hitFlower.plant.triggerGust();
      garden.addSporeBurst(30);
    }
  });

  // Keyboard Controls for Completely Mouse-Free Installation Experience
  window.addEventListener('keydown', (e) => {
    // 1. Enter key: Submit & plant flower if planting modal is open (even when input has focus)
    if (e.key === 'Enter') {
      if (!plantingModal.classList.contains('hidden')) {
        e.preventDefault();
        plantingSubmitBtn.click();
        return;
      }
    }

    // 2. Escape key: Cancel active recording or close modals
    if (e.key === 'Escape') {
      if (choreographyRecorder.isRecording || choreographyRecorder.isCountingDown) {
        choreographyRecorder.cancel();
        recordCountdownOverlay.classList.add('hidden');
        recordingActiveHud.classList.add('hidden');
        return;
      }
      setGuideModalVisible(false);
      flowerInspectCard.classList.add('hidden');
      plantingModal.classList.add('hidden');
      garden.resetToStudio();
      communityManager.setFlowersVisible(false);
      return;
    }

    // If typing in input, ignore remaining single-key triggers
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    const key = (e.key || '').toLowerCase();

    // 3. Spacebar / R / C: Start Recording Choreography (or plant if modal is open)
    if (e.code === 'Space' || key === ' ' || key === 'r' || key === 'c') {
      e.preventDefault();
      if (!plantingModal.classList.contains('hidden')) {
        plantingSubmitBtn.click();
      } else if (!choreographyRecorder.isRecording && !choreographyRecorder.isCountingDown) {
        startRecordingChoreography();
      }
      return;
    }

    // 4. Quick Species Switching (1–7: Periwinkle, Poppy, Chamomile Wheat, Champa, Festive Marigold, Sacred Lotus, Royal Hibiscus)
    if (key === '1') switchSpecies('periwinkle');
    if (key === '2') switchSpecies('poppy');
    if (key === '3') switchSpecies('chamomile');
    if (key === '4') switchSpecies('champa');
    if (key === '5') switchSpecies('marigold');
    if (key === '6') switchSpecies('lotus');
    if (key === '7') switchSpecies('hibiscus');

    // 5. Gallery & Guide controls
    if (key === '?' || key === 'i') setGuideModalVisible(recordingGuideModal.classList.contains('hidden'));
    if (key === 'm') togglePanorama();
    if (key === 'h') toggleCleanView();
    if (key === 'f') toggleFullScreen();
    if (key === 'b') triggerBreeze();
  });

  // 7. Main Render Loop
  let lastTime = performance.now();
  let lastSporeBurstTime = 0;

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min(0.1, (now - lastTime) * 0.001);
    lastTime = now;

    // Update body tracking safely
    let kinematics = tracker.kinematics;
    try {
      kinematics = tracker.update(now) || kinematics;
    } catch (trackerErr) {
      console.warn('Tracker update error:', trackerErr);
    }

    // Spore burst triggered by visitor motion energy
    const isGestureSpore = (kinematics.energy > 0.65) || (kinematics.armStretchUp > 0.75) || (kinematics.legLiftL > 0.7 || kinematics.legLiftR > 0.7);
    if (isGestureSpore && now - lastSporeBurstTime > 1300) {
      garden.addSporeBurst(30);
      lastSporeBurstTime = now;
    }

    try {
      // 1. Update Live Hero Plant (Real-Time Physical Pose)
      plant.update(kinematics, dt);

      // 2. Update Communal Garden Choir (Playback of All Planted Flowers' Choreographies)
      communityManager.update(dt);
    } catch (plantErr) {
      console.warn('Plant update error:', plantErr);
    }

    // 3. Update HUD metrics
    if (metricBloom) {
      metricBloom.textContent = `${Math.round((kinematics.bloomRatio || 0) * 100)}%`;
    }
    if (metricLean) {
      const degrees = Math.round((kinematics.spineLeanX || 0) * 45);
      metricLean.textContent = `${degrees > 0 ? '+' : ''}${degrees}°`;
    }
    if (metricHeight) {
      metricHeight.textContent = `${(kinematics.heightFactor || 1.0).toFixed(2)}x`;
    }

    // 4. Render 3D garden environment (Camera lerp, grass, reeds, pollen)
    try {
      garden.update(dt, kinematics.energy);
    } catch (renderErr) {
      console.error('Garden render error:', renderErr);
    }
  }

  requestAnimationFrame(animate);
});
