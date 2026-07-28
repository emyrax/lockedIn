import dotenv from 'dotenv';

dotenv.config();

let resendClient = null;

async function getResendClient() {
  if (!resendClient) {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail({ to, subject, html }) {
  try {
    const resend = await getResendClient();
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NUESA UNN <nuesa@nuesaunn.ng>',
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

export function generateOtpEmail(otp, name) {
  return {
    subject: 'NUESA UNN — Email Verification Code',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #ff7700; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">NUESA UNN</h1>
          <p style="color: white; opacity: 0.9;">Faculty of Engineering</p>
        </div>
        <div style="padding: 32px 24px; background: #f9fafb;">
          <h2>Hello ${name},</h2>
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ff7700;">${otp}</span>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email.</p>
        </div>
        <div style="background: #0a0a0a; padding: 16px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2026 NUESA UNN. All rights reserved.</p>
        </div>
      </div>
    `,
  };
}

export function generate2faEmail(otp, name) {
  return {
    subject: 'NUESA UNN — Login Verification Code',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #007f00; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">NUESA UNN</h1>
          <p style="color: white; opacity: 0.9;">Secure Login</p>
        </div>
        <div style="padding: 32px 24px; background: #f9fafb;">
          <h2>Hi ${name},</h2>
          <p>Your two-factor authentication code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #007f00;">${otp}</span>
          </div>
          <p>This code expires in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you did not attempt to log in, secure your account immediately.</p>
        </div>
        <div style="background: #0a0a0a; padding: 16px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2026 NUESA UNN. All rights reserved.</p>
        </div>
      </div>
    `,
  };
}
