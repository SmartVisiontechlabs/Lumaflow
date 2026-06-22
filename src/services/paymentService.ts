import { logger } from '../utils/logger';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const paymentService = {
  async createCheckoutSession(bookingData: any) {
    try {
      const response = await fetch(`${API_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Payment API Error:', errorText);

        throw new Error(errorText || 'Failed to initialize payment.');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      logger.error('Payment Session Error:', error);
      throw error;
    }
  },

  async createPackageCheckoutSession(pkgData: { packageId: string; email: string; fullName: string; userId?: string }) {
    try {
      const response = await fetch(`${API_URL}/payments/create-package-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pkgData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Package Payment API Error:', errorText);
        throw new Error(errorText || 'Failed to initialize package payment.');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      logger.error('Package Payment Session Error:', error);
      throw error;
    }
  },

  async confirmPayment(sessionId: string) {
    const endpoint = `${API_URL}/payments/confirm`;
    logger.log('[paymentService] Confirming payment session...');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to confirm ritual payment.';
        try {
          const errorData = await response.json();
          logger.log('[paymentService] Error response received');
          errorMessage = errorData.error || errorMessage;
        } catch (jsonErr) {
          logger.error('[paymentService] Failed to parse error response JSON', jsonErr);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.log('[paymentService] Payment confirmed successfully');
      return data;
    } catch (error) {
      logger.error('[paymentService] Payment Confirmation Error:', error);
      throw error;
    }
  }
};
