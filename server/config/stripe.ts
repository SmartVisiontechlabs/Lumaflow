import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing from environment variables');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_missing_key_placeholder', {
  apiVersion: '2023-10-16' as any,
});
