import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { bookingService } from '../services/bookingService';

export const paymentController = {
  async createCheckoutSession(req: Request, res: Response) {
    const { 
      fullName, 
      email, 
      selectedSession, 
      duration, 
      selectedDate, 
      selectedTime, 
      intentions, 
      emotion, 
      timezone, 
      sessionFormat,
      selectedPackage
    } = req.body;

    try {
      const packagePrice = selectedPackage?.price || 45; // Fallback to $45
      const packageName = selectedPackage?.name || 'Single Session';
      const packageCredits = selectedPackage?.credits || 1;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${packageName}: ${selectedSession}`,
                description: `${duration} minute ${sessionFormat} ritual journey`,
              },
              unit_amount: packagePrice * 100, // Price in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?booking_cancelled=true`,
        metadata: {
          fullName,
          email,
          selectedSession,
          duration: duration.toString(),
          selectedDate,
          selectedTime,
          intentions: intentions || '',
          emotion,
          timezone,
          sessionFormat,
          packageId: selectedPackage?.id || '',
          packageName,
          packagePrice: packagePrice.toString(),
          packageCredits: packageCredits.toString(),
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe Session Error:', error);
      res.status(500).json({ error: 'Failed to initialize sanctuary payment.' });
    }
  },

  async confirmPayment(req: Request, res: Response) {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    try {
      // 1. Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      // 2. Check for existing booking with this payment ID (idempotency)
      const { data: existingBooking, error: checkError } = await bookingService.getBookingByPaymentId(session_id);
      
      if (existingBooking) {
        console.log('DUPLICATE PAYMENT CONFIRMATION PREVENTED:', session_id);
        return res.json({
          ...existingBooking,
          alreadyProcessed: true
        });
      }

      if (checkError) {
        console.error('Idempotency Check Error:', checkError);
      }

      // 3. Extract metadata
      const meta = session.metadata;
      if (!meta) throw new Error('No metadata found in session');

      // 4. Create booking
      const booking = await bookingService.createBooking({
        fullName: meta.fullName,
        email: meta.email,
        selectedSession: meta.selectedSession,
        duration: parseInt(meta.duration),
        selectedDate: meta.selectedDate,
        selectedTime: meta.selectedTime,
        intentions: meta.intentions,
        emotion: meta.emotion,
        timezone: meta.timezone,
        sessionFormat: meta.sessionFormat,
        stripe_payment_id: session_id,
        // Include package metadata safely
        packageId: meta.packageId,
        packageName: meta.packageName,
        packagePrice: meta.packagePrice ? parseFloat(meta.packagePrice) : undefined,
        packageCredits: meta.packageCredits ? parseInt(meta.packageCredits) : undefined
      });

      res.json(booking);
    } catch (error: any) {
      console.error('Payment Confirmation Error:', error);
      res.status(500).json({ error: 'Failed to confirm ritual payment.' });
    }
  }
};
