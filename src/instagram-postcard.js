import QRCode from 'qrcode';

/**
 * Instagram Vertical (9:16) Postcard & Video Generator
 * Artwork: "Collective Bloom"
 * Artist: Harshit Agrawal
 * Event: Devcon, Mumbai 2026
 */
export class InstagramPostcardGenerator {
  constructor(options = {}) {
    this.width = options.width || 720;
    this.height = options.height || 1280; // 9:16 vertical ratio for Instagram Stories / Reels

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.id = 'postcard-render-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.ensureMounted();

    this.artistName = 'Harshit Agrawal (@harshitrnnh)';
    this.artworkTitle = 'Collective Bloom';
    this.topSubtitle = 'An Interactively Grown Garden';
    this.eventTitle = 'Collective Bloom • Devcon, Mumbai 2026';

    // Floating atmospheric dust spores for postcard ambiance
    this.particles = [];
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: 1.0 + Math.random() * 2.2,
        speedY: -0.3 - Math.random() * 0.6,
        alpha: 0.2 + Math.random() * 0.5
      });
    }
  }

  ensureMounted() {
    if (typeof document !== 'undefined' && document.body && !this.canvas.parentElement) {
      this.canvas.style.position = 'fixed';
      this.canvas.style.left = '-9999px';
      this.canvas.style.top = '-9999px';
      this.canvas.style.width = '1px';
      this.canvas.style.height = '1px';
      this.canvas.style.opacity = '0.01';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.canvas);
    }
  }

  /**
   * Generates a data URL for a QR code linking to the video or cloud URL
   */
  async generateQRCodeDataUrl(url) {
    try {
      return await QRCode.toDataURL(url, {
        width: 130,
        margin: 1,
        color: {
          dark: '#0e1711',
          light: '#f5faf6'
        }
      });
    } catch (err) {
      console.warn('QR Code generation error:', err);
      return null;
    }
  }

  /**
   * Renders a single vertical frame combining:
   * - Atmospheric botanical background
   * - Top Artwork & Artist Header
   * - Centered 3D Dancing Bloom
   * - Bottom Devcon Mumbai 2026 takeaway card & QR code
   */
  renderFrame(sourceCanvas, meta = {}, qrImage = null) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Deep atmospheric background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0c130f');
    bgGrad.addColorStop(0.35, '#152119');
    bgGrad.addColorStop(0.70, '#101a14');
    bgGrad.addColorStop(1, '#080d0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Animated floating ambient pollen spores
    ctx.fillStyle = '#e8d89e';
    for (const p of this.particles) {
      p.y += p.speedY;
      if (p.y < 0) p.y = h;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 3. Elegant postcard hairline border
    ctx.strokeStyle = 'rgba(215, 235, 220, 0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // 4. Center 3D Flower Viewport (Cropped from WebGL canvas or Video element)
    const sw = (sourceCanvas && (sourceCanvas.videoWidth || sourceCanvas.width)) || 0;
    const sh = (sourceCanvas && (sourceCanvas.videoHeight || sourceCanvas.height)) || 0;
    if (sourceCanvas && sw > 0 && sh > 0) {
      // Vertical focus crop around the flower
      const cropH = sh * 0.86;
      const cropW = Math.min(sw, cropH * (w / 780));
      const sx = (sw - cropW) / 2;
      const sy = sh * 0.08;

      const destY = 145;
      const destH = 785;

      // Subtle glow behind flower
      const flowerGlow = ctx.createRadialGradient(w / 2, destY + destH * 0.45, 40, w / 2, destY + destH * 0.45, 340);
      flowerGlow.addColorStop(0, 'rgba(125, 175, 140, 0.18)');
      flowerGlow.addColorStop(0.6, 'rgba(70, 110, 85, 0.06)');
      flowerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flowerGlow;
      ctx.fillRect(0, destY, w, destH);

      ctx.save();
      ctx.drawImage(sourceCanvas, sx, sy, cropW, cropH, 0, destY, w, destH);
      ctx.restore();

      // Soft vignette blend around the flower viewport
      const topFade = ctx.createLinearGradient(0, destY, 0, destY + 90);
      topFade.addColorStop(0, '#0c130f');
      topFade.addColorStop(1, 'rgba(12, 19, 15, 0)');
      ctx.fillStyle = topFade;
      ctx.fillRect(0, destY, w, 90);

      const botFade = ctx.createLinearGradient(0, destY + destH - 90, 0, destY + destH);
      botFade.addColorStop(0, 'rgba(16, 26, 20, 0)');
      botFade.addColorStop(1, '#101a14');
      ctx.fillStyle = botFade;
      ctx.fillRect(0, destY + destH - 90, w, 90);
    }

    // 5. TOP HEADER
    ctx.textAlign = 'center';

    // Top Subtitle: 'An Interactively Grown Garden'
    ctx.font = '600 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b39852';
    ctx.letterSpacing = '2.5px';
    ctx.fillText('AN INTERACTIVELY GROWN GARDEN', w / 2, 60);

    // Main Artwork Title: 'COLLECTIVE BLOOM'
    ctx.font = 'italic 700 36px "Cinzel", "Cormorant Garamond", "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#f7fbf8';
    ctx.letterSpacing = '5px';
    ctx.fillText(this.artworkTitle.toUpperCase(), w / 2, 102);

    // Decorative divider line
    ctx.strokeStyle = 'rgba(224, 197, 124, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 80, 120);
    ctx.lineTo(w / 2 + 80, 120);
    ctx.stroke();

    // 6. BOTTOM TAKEAWAY & METADATA CARD (y: 948 to 1198)
    const cardY = 948;
    const cardH = 250;
    const cardW = w - 60;
    const cardX = 30;

    // Card background plate
    ctx.fillStyle = 'rgba(15, 24, 18, 0.88)';
    ctx.strokeStyle = 'rgba(215, 235, 220, 0.18)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // 1. Flower Tag / Title (starts directly at top of card; nothing above it)
    const displayFlowerTitle = (meta.flowerName && meta.flowerName.trim() && meta.flowerName.trim().toLowerCase() !== 'luna bloom')
      ? meta.flowerName.trim()
      : (meta.speciesName || 'Living Flower');
    ctx.textAlign = 'left';
    ctx.font = '700 30px "Cinzel", "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '0.8px';
    ctx.fillText(displayFlowerTitle, cardX + 26, cardY + 54);

    // 2. Choreographer Name:
    // Only include 'Choreographed by ____' if the person entered a name.
    // If blank or generic 'Devcon Gardener', do not show this line.
    const rawDancer = (meta.choreographer || '').trim();
    const isGenericDancer = !rawDancer ||
      rawDancer.toLowerCase() === 'devcon gardener' ||
      rawDancer.toLowerCase() === 'anonymous dancer';
    const hasDancer = !isGenericDancer;

    if (hasDancer) {
      ctx.font = '500 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#8eb697';
      ctx.letterSpacing = '0.4px';
      const speciesSuffix = meta.speciesName ? ` • ${meta.speciesName}` : '';
      ctx.fillText(`Choreographed by ${rawDancer}${speciesSuffix}`, cardX + 26, cardY + 88);
    } else if (meta.speciesName && (displayFlowerTitle || '').toLowerCase() !== meta.speciesName.toLowerCase()) {
      ctx.font = '500 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#8eb697';
      ctx.letterSpacing = '0.4px';
      ctx.fillText(meta.speciesName, cardX + 26, cardY + 88);
    }

    // 3. QR Code linking to Infinite Garden Meadow
    if (qrImage) {
      const qrSize = 84;
      const qrX = cardX + cardW - qrSize - 20;
      const qrY = cardY + 28;

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      ctx.textAlign = 'right';
      ctx.font = '600 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#e8c15a';
      ctx.letterSpacing = '1px';
      ctx.fillText('INFINITE GARDEN', qrX - 12, qrY + 38);

      ctx.font = '400 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#9cb5a2';
      ctx.fillText('Scan to Explore', qrX - 12, qrY + 54);

      ctx.textAlign = 'left';
    }

    // 4. Bottom Line: 'COLLECTIVE BLOOM • DEVCON, MUMBAI 2026'
    ctx.font = '600 11.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b39852';
    ctx.letterSpacing = '1.8px';
    ctx.fillText('COLLECTIVE BLOOM • DEVCON, MUMBAI 2026', cardX + 26, cardY + cardH - 46);

    // 5. Artist Credit in little bigger font directly below the Collective Bloom line:
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f0ce6f';
    ctx.letterSpacing = '0.8px';
    ctx.fillText('An Artwork by Harshit Agrawal (@harshitrnnh)', cardX + 26, cardY + cardH - 22);
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Captures an instant high-res PNG image postcard
   */
  exportStillPostcardPNG(filename = 'Collective_Bloom_Postcard.png') {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: this.canvas.toDataURL('image/png'),
          filename
        });
      }, 'image/png');
    });
  }

  /**
   * Starts recording the 9:16 vertical canvas into an MP4/WebM video stream
   */
  startPostcardVideoRecording(fps = 30) {
    const stream = this.canvas.captureStream(fps);
    let mimeType = 'video/webm';

    // Prioritize MP4 video codecs (never audio codecs on canvas stream)
    const codecCandidates = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    for (const candidate of codecCandidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) {
        mimeType = candidate;
        break;
      }
    }

    const chunks = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1300000 // Optimized crisp mobile stream under serverless payload limits
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(100);

    return {
      recorder,
      mimeType,
      stop: () => {
        return new Promise((resolve) => {
          try {
            if (recorder.state === 'recording') {
              recorder.requestData();
            }
          } catch (_) {}
          recorder.onstop = () => {
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const videoBlob = new Blob(chunks, { type: mimeType });
            resolve({ videoBlob, mimeType, extension: ext });
          };
          try {
            recorder.stop();
          } catch (_) {
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const videoBlob = new Blob(chunks, { type: mimeType });
            resolve({ videoBlob, mimeType, extension: ext });
          }
        });
      }
    };
  }

  /**
   * Renders the postcard onto a target preview canvas thumbnail (scaled down)
   */
  renderToPreviewCanvas(previewCanvas, sourceCanvas, meta = {}, qrImage = null) {
    if (!previewCanvas) return;
    this.renderFrame(sourceCanvas, meta, qrImage);
    const pctx = previewCanvas.getContext('2d');
    pctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    pctx.drawImage(
      this.canvas,
      0, 0, this.width, this.height,
      0, 0, previewCanvas.width, previewCanvas.height
    );
  }

  /**
   * Takes the captured 10s video blob from choreography recording,
   * composites each frame inside the 9:16 vertical Instagram postcard layout,
   * and returns an MP4 (or WebM fallback) video blob ready for mobile & Instagram.
   */
  async compositeVideoFromBlob(videoBlob, meta = {}, qrUrl = 'https://collective-bloom-kappa.vercel.app/infinite-garden', onProgress = null) {
    let qrImage = null;
    const targetQrUrl = qrUrl || 'https://collective-bloom-kappa.vercel.app/infinite-garden';
    if (targetQrUrl) {
      try {
        const qrDataUrl = await this.generateQRCodeDataUrl(targetQrUrl);
        if (qrDataUrl) {
          qrImage = await new Promise((res) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = qrDataUrl;
          });
        }
      } catch (err) {
        console.warn('Postcard video QR generation warning:', err);
      }
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true; // Prevents browser from stalling before target duration
    // Must be in DOM offscreen so browser decodes all frames with GPU acceleration
    video.style.position = 'fixed';
    video.style.left = '-9999px';
    video.style.top = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'none';
    if (typeof document !== 'undefined' && document.body) {
      document.body.appendChild(video);
    }
    video.src = URL.createObjectURL(videoBlob);

    await new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      video.onloadedmetadata = () => {
        // Fix for Chrome WebM duration bug: seek to tail to force full cluster parsing
        if (video.duration === Infinity || !isFinite(video.duration)) {
          video.currentTime = 1e101;
          video.ontimeupdate = () => {
            video.ontimeupdate = null;
            video.currentTime = 0;
            done();
          };
        } else {
          done();
        }
      };
      video.onerror = done;
      setTimeout(done, 1500); // Fail-safe
    });

    // The full recorded choreography session is strictly 10.0 seconds
    const targetDuration = 10.0;
    const { recorder, stop, mimeType } = this.startPostcardVideoRecording(25);

    try {
      video.currentTime = 0;
      await video.play();
    } catch (_) {}

    return new Promise((resolve) => {
      let isDone = false;
      const startTime = performance.now();

      const frameStep = () => {
        if (isDone) return;
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1.0, elapsed / targetDuration);

        // Watchdog: If playback paused prematurely before 10s, resume it immediately
        if (video.paused && elapsed < targetDuration - 0.25) {
          try { video.play(); } catch (_) {}
        }

        this.renderFrame(video, meta, qrImage);

        if (typeof onProgress === 'function') {
          onProgress(progress, elapsed);
        }

        // Strictly guarantee the full 10.0 seconds of recording is captured
        if (elapsed >= targetDuration) {
          isDone = true;
          try { video.pause(); } catch (_) {}
          URL.revokeObjectURL(video.src);
          if (video.parentNode) {
            video.parentNode.removeChild(video);
          }
          stop().then((result) => {
            resolve({
              ...result,
              filename: `Collective_Bloom_${(meta.flowerName || 'Bloom').replace(/[^a-zA-Z0-9_-]/g, '_')}_Devcon_2026.${result.extension}`
            });
          });
        } else {
          requestAnimationFrame(frameStep);
        }
      };

      requestAnimationFrame(frameStep);
    });
  }
}
