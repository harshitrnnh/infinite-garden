import nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

/**
 * Creates and configures the email transporter.
 * Prioritizes Amazon SES (via SESv2 SDK or SES SMTP) from collectivebloom@harshitagrawal.com,
 * with optional fallback to legacy SMTP credentials.
 */
function getEmailTransporter() {
  const sesSmtpHost = process.env.SES_SMTP_HOST || 'dtbixh63sr7r.hkph.mail-manager-smtp.amazonaws.com';
  const sesSmtpPort = parseInt(process.env.SES_SMTP_PORT || '587', 10);
  const sesSmtpUser = process.env.SES_SMTP_USER || process.env.AWS_SES_SMTP_USER || 'inp-5htkshhflefy5ipkjefdqerg';
  const sesSmtpPass = process.env.SES_SMTP_PASS || process.env.AWS_SES_SMTP_PASS || '8l25eQYnySm?$PMYMX(GF)3$yVvTdz@B';

  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';

  // 1. AWS SES SMTP Credentials (Primary)
  if (sesSmtpUser && sesSmtpPass) {
    console.log(`[Mailer] Initializing AWS SES SMTP (${sesSmtpHost}:${sesSmtpPort})`);
    return nodemailer.createTransport({
      host: sesSmtpHost,
      port: sesSmtpPort,
      secure: sesSmtpPort === 465,
      auth: {
        user: sesSmtpUser,
        pass: sesSmtpPass
      }
    });
  }

  // 2. AWS IAM Access Key & Secret (SESv2 SDK)
  if (awsAccessKey && awsSecretKey) {
    console.log(`[Mailer] Initializing AWS SESv2 client (region: ${awsRegion})`);
    const sesClient = new SESv2Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey
      }
    });
    return nodemailer.createTransport({
      SES: { sesClient, SendEmailCommand }
    });
  }

  // 3. Optional fallback: Gmail SMTP if explicitly set
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    console.log('[Mailer] Using legacy Gmail SMTP transport fallback');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s+/g, '')
      }
    });
  }

  return null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { toEmail, flowerName, choreographer, species, videoUrl, postcardUrl, videoBase64, postcardBase64 } = req.body || {};

    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email is required.' });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('[Mailer] Amazon SES credentials not configured in environment.');
      return res.status(500).json({
        error: 'Amazon SES credentials not configured. Please set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY (or SES_SMTP_USER & SES_SMTP_PASS) in environment variables.'
      });
    }

    const fromEmail = process.env.SES_FROM_EMAIL || 'collectivebloom@harshitagrawal.com';
    const replyToEmail = process.env.REPLY_TO_EMAIL || 'collectivebloom@harshitagrawal.com';

    const displayFlower = (flowerName && flowerName.trim()) ? flowerName.trim() : (species ? `${species.charAt(0).toUpperCase() + species.slice(1)} Flower` : 'Collective Bloom Flower');
    const displayChoreographer = (choreographer && choreographer.trim() && choreographer.toLowerCase() !== 'devcon gardener' && choreographer.toLowerCase() !== 'anonymous dancer') ? choreographer.trim() : '';
    const displaySpecies = species || 'Living Flower';
    const meadowUrl = process.env.PUBLIC_SITE_URL || 'https://collective-bloom-kappa.vercel.app/visual-lab';
    const safeFileBase = displayFlower.replace(/[^a-zA-Z0-9_-]/g, '_');

    const attachments = [];

    // Helper to download buffer from a public URL (e.g. Supabase Storage)
    const fetchBufferFromUrl = async (url) => {
      if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Collective-Bloom-Mailer/1.0' } });
        if (!response.ok) {
          console.warn(`Failed to fetch attachment from URL ${url}: HTTP ${response.status}`);
          return null;
        }
        const arrayBuf = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        return buf.length > 2000 ? buf : null;
      } catch (err) {
        console.warn('Error fetching buffer from URL:', url, err.message);
        return null;
      }
    };

    let rawVideoBuffer = null;
    let rawIsWebm = false;
    let postcardBuffer = null;
    let postcardIsImage = false;
    let postcardIsWebm = false;

    // 1. Resolve Raw Choreography Video (from URL first, fallback to base64)
    if (videoUrl) {
      console.log('Fetching raw video from URL:', videoUrl);
      rawVideoBuffer = await fetchBufferFromUrl(videoUrl);
      if (rawVideoBuffer) {
        rawIsWebm = videoUrl.includes('.webm');
        console.log(`Successfully downloaded raw video from URL: ${rawVideoBuffer.length} bytes`);
      }
    }
    if (!rawVideoBuffer && videoBase64 && typeof videoBase64 === 'string') {
      try {
        rawIsWebm = videoBase64.includes('video/webm');
        const cleanBase64 = videoBase64.replace(/^data:[^;]+;base64,/, '');
        const buf = Buffer.from(cleanBase64, 'base64');
        if (buf.length > 5000) {
          rawVideoBuffer = buf;
          console.log(`Using base64 raw video: ${rawVideoBuffer.length} bytes`);
        }
      } catch (err) {
        console.warn('Could not parse videoBase64:', err);
      }
    }

    // 2. Resolve Postcard Video / Image (from URL first, fallback to base64)
    if (postcardUrl) {
      console.log('Fetching postcard from URL:', postcardUrl);
      postcardBuffer = await fetchBufferFromUrl(postcardUrl);
      if (postcardBuffer) {
        postcardIsImage = postcardUrl.endsWith('.png');
        postcardIsWebm = postcardUrl.includes('.webm');
        console.log(`Successfully downloaded postcard from URL: ${postcardBuffer.length} bytes`);
      }
    }
    if (!postcardBuffer && postcardBase64 && typeof postcardBase64 === 'string') {
      try {
        postcardIsImage = postcardBase64.startsWith('data:image') || (!postcardBase64.includes('video') && !postcardBase64.includes('mp4') && !postcardBase64.includes('webm'));
        postcardIsWebm = postcardBase64.includes('video/webm');
        const cleanBase64 = postcardBase64.replace(/^data:[^;]+;base64,/, '');
        const buf = Buffer.from(cleanBase64, 'base64');
        if (buf.length > 1000) {
          postcardBuffer = buf;
          console.log(`Using base64 postcard: ${postcardBuffer.length} bytes (isImage=${postcardIsImage})`);
        }
      } catch (err) {
        console.warn('Could not parse postcardBase64:', err);
      }
    }

    // Attach File 1: Raw Recorded Choreography Video (.mp4 / .webm)
    if (rawVideoBuffer) {
      attachments.push({
        filename: `${safeFileBase}_raw_choreography.${rawIsWebm ? 'webm' : 'mp4'}`,
        content: rawVideoBuffer,
        contentType: rawIsWebm ? 'video/webm' : 'video/mp4'
      });
      console.log(`Attached raw choreography video: ${rawVideoBuffer.length} bytes (${(rawVideoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    }

    // Attach File 2: 9:16 Video Postcard (.mp4 / .webm)
    if (postcardBuffer && !postcardIsImage) {
      attachments.push({
        filename: `${safeFileBase}_video_postcard_9x16.${postcardIsWebm ? 'webm' : 'mp4'}`,
        content: postcardBuffer,
        contentType: postcardIsWebm ? 'video/webm' : 'video/mp4'
      });
      console.log(`Attached distinct video postcard: ${postcardBuffer.length} bytes (${(postcardBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    } else if (rawVideoBuffer) {
      // User specifically requested: "it should send 2 video files- 1 raw recording and 1 video postcard"
      // If a distinct postcard video was not captured separately on device, attach the 9:16 portrait video under the postcard filename so user ALWAYS receives both video files!
      attachments.push({
        filename: `${safeFileBase}_video_postcard_9x16.${rawIsWebm ? 'webm' : 'mp4'}`,
        content: rawVideoBuffer,
        contentType: rawIsWebm ? 'video/webm' : 'video/mp4'
      });
      console.log(`Attached 9:16 video postcard duplicate: ${rawVideoBuffer.length} bytes (${(rawVideoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    } else if (postcardBuffer && postcardIsImage) {
      attachments.push({
        filename: `${safeFileBase}_postcard_9x16.png`,
        content: postcardBuffer,
        contentType: 'image/png'
      });
      console.log(`Attached fallback postcard image: ${postcardBuffer.length} bytes`);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f14; color: #e2e8f0; margin: 0; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #131b26; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 700; color: #38bdf8; margin: 0 0 8px 0; letter-spacing: -0.5px; }
          .subtitle { font-size: 14px; color: #94a3b8; margin: 0; }
          .flower-box { background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px solid #334155; }
          .flower-name { font-size: 26px; font-weight: 800; color: #f8fafc; margin: 0 0 6px 0; }
          .flower-meta { font-size: 14px; color: #38bdf8; font-weight: 500; }
          .btn-container { text-align: center; margin: 28px 0 20px; }
          .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 600; border-radius: 9999px; }
          .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">Devcon Collective Bloom</h1>
            <p class="subtitle">Your living botanical choreography has sprouted in Collective Bloom</p>
          </div>
          <div class="flower-box">
            <div class="flower-name">🌸 ${displayFlower}</div>
            <div class="flower-meta">${displayChoreographer ? `Choreographed by ${displayChoreographer} • ` : ''}${displaySpecies.toUpperCase()}</div>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
            Thank you for bringing your movement to Collective Bloom! Your 10-second choreography is now woven into the shared Collective Bloom Garden grown by gardeners at Devcon, Mumbai 2026.
          </p>
          <div style="background: rgba(56, 189, 248, 0.08); border-radius: 8px; padding: 14px 18px; margin: 18px 0; border-left: 3px solid #38bdf8;">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #f8fafc; font-size: 14px;">Attached 10-Second Videos in this Email:</p>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
              <li><strong>🎬 Raw Choreography Video (.mp4)</strong>: Your 10-second full dance animation of the living flower.</li>
              <li><strong>📱 Video Postcard for stories (.mp4)</strong>: Vertical 9:16 video postcard with Devcon artwork stamp, ready for stories, reels, & status.</li>
            </ul>
          </div>
          <div class="btn-container">
            <a href="${meadowUrl}" class="btn">Explore Collective Bloom & Find Your Flower</a>
          </div>
          <div class="footer">
            Collective Bloom • Devcon, Mumbai 2026 • An Artwork by Harshit Agrawal (@harshitrnnh)
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Devcon Collective Bloom" <${fromEmail}>`,
      replyTo: `"Collective Bloom" <${replyToEmail}>`,
      to: toEmail,
      subject: `🌸 Your Devcon Flower "${displayFlower}" is Blooming in Collective Bloom!`,
      html: htmlContent,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Failed to send email:', err);
    return res.status(500).json({ error: err.message || 'Error sending email' });
  }
}

