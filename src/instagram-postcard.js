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

    this.artistName = 'Harshit Agrawal';
    this.artworkTitle = 'Collective Bloom';
    this.eventTitle = 'Devcon, Mumbai 2026';
    this.takeawayText = 'A living collective memory sculpted by human movement & generative code.';

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

      const destY = 160;
      const destH = 750;

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

    // 5. TOP HEADER: ARTIST & ARTWORK
    ctx.textAlign = 'center';

    // Subtitle badge
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b39852';
    ctx.letterSpacing = '3px';
    ctx.fillText('AN INTERACTIVE BOTANICAL CHOREOGRAPHY', w / 2, 60);

    // Main Artwork Title
    ctx.font = 'italic 700 36px "Cinzel", "Cormorant Garamond", "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#f7fbf8';
    ctx.letterSpacing = '5px';
    ctx.fillText(this.artworkTitle.toUpperCase(), w / 2, 102);

    // Artist Name
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#a6c2ad';
    ctx.letterSpacing = '3.5px';
    ctx.fillText(`BY ${this.artistName.toUpperCase()}`, w / 2, 126);

    // Decorative divider line
    ctx.strokeStyle = 'rgba(224, 197, 124, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 80, 142);
    ctx.lineTo(w / 2 + 80, 142);
    ctx.stroke();

    // 6. BOTTOM TAKEAWAY & METADATA CARD (y: 920 to 1240)
    const cardY = 925;
    const cardH = 300;
    const cardW = w - 60;
    const cardX = 30;

    // Card background plate
    ctx.fillStyle = 'rgba(15, 24, 18, 0.85)';
    ctx.strokeStyle = 'rgba(215, 235, 220, 0.18)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // Event Tag
    ctx.textAlign = 'left';
    ctx.font = '700 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#e8c15a';
    ctx.letterSpacing = '2px';
    ctx.fillText('🏛️ DEVCON, MUMBAI 2026', cardX + 24, cardY + 36);

    // Flower Title
    const flowerTitle = meta.flowerName || 'Luna Bloom';
    ctx.font = '700 24px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '1px';
    ctx.fillText(flowerTitle, cardX + 24, cardY + 70);

    // Choreographer & Species
    const dancer = meta.choreographer || 'Devcon Gardener';
    const species = meta.speciesName || 'Botanical Wildflower';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#8eb697';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(`Choreographed by ${dancer} • ${species}`, cardX + 24, cardY + 95);

    // Devcon Takeaway Narrative Quote
    ctx.font = 'italic 400 13.5px Georgia, serif';
    ctx.fillStyle = '#d2e3d5';
    ctx.letterSpacing = '0.3px';
    const quoteLines = [
      '“A living collective memory sculpted by human movement',
      '& generative code amidst the global Ethereum community.”'
    ];
    ctx.fillText(quoteLines[0], cardX + 24, cardY + 135);
    ctx.fillText(quoteLines[1], cardX + 24, cardY + 155);

    // Bottom Footer Row (QR code & scan instructions)
    if (qrImage) {
      // Draw QR Code in bottom-right of card
      const qrSize = 96;
      const qrX = cardX + cardW - qrSize - 20;
      const qrY = cardY + cardH - qrSize - 20;

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      ctx.textAlign = 'right';
      ctx.font = '600 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#e8c15a';
      ctx.letterSpacing = '1px';
      ctx.fillText('SCAN TO SAVE TO PHONE', qrX - 12, qrY + 44);

      ctx.font = '400 10.5px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#9cb5a2';
      ctx.fillText('Instagram Story & Reel', qrX - 12, qrY + 62);
    } else {
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#b39852';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('INFINITE GARDEN • DEVCON MUMBAI 2026', cardX + 24, cardY + cardH - 24);
    }
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
  async compositeVideoFromBlob(videoBlob, meta = {}, qrUrl = null, onProgress = null) {
    let qrImage = null;
    if (qrUrl) {
      try {
        const qrDataUrl = await this.generateQRCodeDataUrl(qrUrl);
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
    video.src = URL.createObjectURL(videoBlob);

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = (e) => reject(e);
      setTimeout(resolve, 2000); // Fail-safe
    });

    const duration = Math.min(10.5, Math.max(1.0, video.duration || 10.0));
    const { recorder, stop, mimeType } = this.startPostcardVideoRecording(30);

    try {
      await video.play();
    } catch (_) {}

    return new Promise((resolve) => {
      let isDone = false;
      const startTime = performance.now();

      const frameStep = () => {
        if (isDone) return;
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1.0, elapsed / duration);

        this.renderFrame(video, meta, qrImage);

        if (typeof onProgress === 'function') {
          onProgress(progress, elapsed);
        }

        if (elapsed >= duration || video.ended) {
          isDone = true;
          try { video.pause(); } catch (_) {}
          URL.revokeObjectURL(video.src);
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
