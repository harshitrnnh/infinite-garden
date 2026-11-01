import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

// Simple .env parser for testing without extra dependencies
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

loadEnv();

const toEmail = process.argv[2] || process.env.TEST_RECIPIENT || 'harshit@harshitagrawal.com';
const fromEmail = process.env.SES_FROM_EMAIL || 'collectivebloom@harshitagrawal.com';
const awsRegion = process.env.AWS_REGION || 'us-east-1';

console.log('Testing Amazon SES Email Dispatch...');
console.log(`From:    ${fromEmail}`);
console.log(`To:      ${toEmail}`);
console.log(`Region:  ${awsRegion}`);

let transporter = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('Mode: AWS SESv2 SDK');
  const sesClient = new SESv2Client({
    region: awsRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand }
  });
} else if (process.env.SES_SMTP_USER && process.env.SES_SMTP_PASS) {
  console.log('Mode: AWS SES SMTP');
  const host = process.env.SES_SMTP_HOST || `email-smtp.${awsRegion}.amazonaws.com`;
  const port = parseInt(process.env.SES_SMTP_PORT || '465', 10);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SES_SMTP_USER,
      pass: process.env.SES_SMTP_PASS
    }
  });
} else {
  console.error('\n❌ Error: Neither AWS Access Key nor SES SMTP credentials found in .env or environment!');
  console.log('Please provide AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY (or SES_SMTP_USER & SES_SMTP_PASS).');
  process.exit(1);
}

try {
  const info = await transporter.sendMail({
    from: `"Devcon Collective Bloom" <${fromEmail}>`,
    replyTo: fromEmail,
    to: toEmail,
    subject: '🌸 Collective Bloom • Amazon SES Test',
    html: `
      <div style="font-family: sans-serif; background: #0b0f14; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 500px;">
        <h2 style="color: #38bdf8;">Collective Bloom • Email Configuration Verified</h2>
        <p>Amazon SES is successfully delivering emails from <strong>${fromEmail}</strong>!</p>
        <p style="color: #94a3b8; font-size: 13px;">Devcon Mumbai 2026 • Harshit Agrawal (@harshitrnnh)</p>
      </div>
    `
  });
  console.log('\n✅ Success! Email dispatched successfully.');
  console.log('Message ID:', info.messageId);
} catch (err) {
  console.error('\n❌ Failed to dispatch email via SES:');
  console.error(err.message || err);
}

