import { Resend } from 'resend';

const resendApiKey = typeof process !== 'undefined' && process.env ? process.env.RESEND_API_KEY : (import.meta.env ? import.meta.env.VITE_RESEND_API_KEY : null);

if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY / VITE_RESEND_API_KEY is missing.');
}

export const resend = new Resend(resendApiKey || 're_placeholder');
