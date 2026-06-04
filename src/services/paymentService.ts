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
    const endpoint = `${API_URL}/payments/confirm`;
    console.log("CONFIRM PAYMENT START");
    console.log("sessionId", sessionId);
    console.log("endpoint", endpoint);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      console.log("response", response);

      if (!response.ok) {
        let errorMessage = 'Failed to confirm ritual payment.';
        try {
          const errorData = await response.json();
          console.log("error response body", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonErr) {
          console.error("Failed to parse error response JSON", jsonErr);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("confirmPayment success data:", data);
      return data;
    } catch (error) {
      console.error('Payment Confirmation Error:', error);
      throw error;
    }
  }
};
