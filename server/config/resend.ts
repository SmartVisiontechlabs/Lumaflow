import { Resend } from 'resend';

// Strictly use process.env for the server environment
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️ CRITICAL: RESEND_API_KEY is missing in backend environment.');
}

export const resend = new Resend(resendApiKey || 're_placeholder');
