import nodemailer from 'nodemailer';

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
    const { toEmail, flowerName, choreographer, species, videoUrl, videoBase64, postcardBase64 } = req.body || {};

    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email is required.' });
    }

    const gmailUser = process.env.GMAIL_USER || 'infinitegardencollectivebloom@gmail.com';
    const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || 'lzammnxlcwxcscsz').replace(/\s+/g, '');

    if (!gmailUser || !gmailAppPassword) {
      console.warn('GMAIL_USER or GMAIL_APP_PASSWORD not configured on Vercel environment.');
      return res.status(500).json({
        error: 'Email service credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD.'
      });
    }

    // Configure Nodemailer Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    const displayFlower = flowerName || 'Collective Bloom Flower';
    const displayChoreographer = choreographer || 'Devcon Gardener';
    const displaySpecies = species || 'Periwinkle';
    const meadowUrl = process.env.PUBLIC_SITE_URL || 'https://collective-bloom-kappa.vercel.app/visual-lab';
    const safeFileBase = displayFlower.replace(/[^a-zA-Z0-9_-]/g, '_');

    const attachments = [];

    // 1. Raw Recorded Choreography Video (MP4 / WebM)
    if (videoBase64 && typeof videoBase64 === 'string') {
      const isWebm = videoBase64.includes('video/webm');
      const cleanBase64 = videoBase64.replace(/^data:[^;]+;base64,/, '');
      const videoBuffer = Buffer.from(cleanBase64, 'base64');

      // Ensure file is valid size (more than 15KB)
      if (videoBuffer.length > 15000) {
        attachments.push({
          filename: `${safeFileBase}_raw_choreography.${isWebm ? 'webm' : 'mp4'}`,
          content: videoBuffer,
          contentType: isWebm ? 'video/webm' : 'video/mp4'
        });
        console.log(`Attached choreography video: ${videoBuffer.length} bytes (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        console.warn(`Skipping invalid/corrupt video attachment: only ${videoBuffer.length} bytes`);
      }
    }

    // 2. Vertical 9:16 Instagram Story Postcard (Video or PNG Image)
    if (postcardBase64 && typeof postcardBase64 === 'string') {
      const isImage = postcardBase64.startsWith('data:image') || (!postcardBase64.includes('video') && !postcardBase64.includes('mp4') && !postcardBase64.includes('webm'));
      const isWebm = postcardBase64.includes('video/webm');
      const cleanPostcard = postcardBase64.replace(/^data:[^;]+;base64,/, '');
      const postcardBuffer = Buffer.from(cleanPostcard, 'base64');

      if (postcardBuffer.length > 1000) {
        if (isImage) {
          attachments.push({
            filename: `${safeFileBase}_instagram_postcard_9x16.png`,
            content: postcardBuffer,
            contentType: 'image/png'
          });
          console.log(`Attached Instagram postcard image: ${postcardBuffer.length} bytes (${(postcardBuffer.length / 1024).toFixed(1)} KB)`);
        } else {
          attachments.push({
            filename: `${safeFileBase}_instagram_postcard_9x16.${isWebm ? 'webm' : 'mp4'}`,
            content: postcardBuffer,
            contentType: isWebm ? 'video/webm' : 'video/mp4'
          });
          console.log(`Attached Instagram postcard video: ${postcardBuffer.length} bytes (${(postcardBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        }
      } else {
        console.warn(`Skipping invalid postcard attachment: only ${postcardBuffer.length} bytes`);
      }
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
            <div class="flower-meta">Choreographed by ${displayChoreographer} • ${displaySpecies.toUpperCase()}</div>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
            Thank you for bringing your movement to Collective Bloom! Your 10-second choreography is now woven into the shared 2,000-flower living artwork running live at Devcon.
          </p>
          <div style="background: rgba(56, 189, 248, 0.08); border-radius: 8px; padding: 14px 18px; margin: 18px 0; border-left: 3px solid #38bdf8;">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #f8fafc; font-size: 14px;">Attached 10-Second Videos in this Email:</p>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
              <li><strong>🎬 Raw Choreography Video (.mp4)</strong>: Your 10-second full dance animation of the living flower.</li>
              <li><strong>📱 Instagram Story Postcard Video (.mp4)</strong>: Vertical 9:16 video postcard with Devcon artwork stamp, ready for Instagram Stories, Reels, & Status.</li>
            </ul>
          </div>
          ${videoUrl ? `<p style="font-size: 14px; color: #94a3b8;">You can also stream or download your recorded animation here: <br><a href="${videoUrl}" style="color: #38bdf8; word-break: break-all;">${videoUrl}</a></p>` : ''}
          <div class="btn-container">
            <a href="${meadowUrl}" class="btn">Explore Collective Bloom & Find Your Flower</a>
          </div>
          <div class="footer">
            Devcon Southeast Asia • Collective Bloom • Crafted with WebGL & Computer Vision
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Devcon Collective Bloom" <${gmailUser}>`,
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

