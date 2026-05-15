const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        console.error('Payment API Error:', errorText);

        throw new Error(errorText || 'Failed to initialize payment.');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Payment Session Error:', error);
      throw error;
    }
  },

  async confirmPayment(sessionId: string) {
    try {
      const response = await fetch(`${API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm ritual.');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment Confirmation Error:', error);
      throw error;
    }
  }
};
