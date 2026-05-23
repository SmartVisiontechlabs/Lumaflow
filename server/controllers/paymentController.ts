import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';

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
      selectedPackage,
      journeyType
    } = req.body;

    try {
      const packagePrice = selectedPackage?.price || 45; // Fallback to $45
      const packageName = selectedPackage?.name || 'Single Session';
      const packageCredits = selectedPackage?.credits || 1;

      console.log('--- STRIPE CHECKOUT SESSION CREATION ---');
      console.log('User Email:', email);
      console.log('Full Name:', fullName);
      console.log('Selected Session:', selectedSession);
      console.log('Duration:', duration);
      console.log('Package:', packageName);
      console.log('Success URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`);

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
          journeyType: journeyType || '',
        },
      });

      console.log('Created Stripe Checkout Session ID:', session.id);
      console.log('Session Metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('----------------------------------------');

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe Session Error:', error);
      res.status(500).json({ error: `Failed to initialize sanctuary payment: ${error.message || error}` });
    }
  },

  async confirmPayment(req: Request, res: Response) {
    console.log('[PAYMENT CONFIRM]');
    console.log("req.body:", JSON.stringify(req.body, null, 2));
    console.log("req.query:", JSON.stringify(req.query, null, 2));

    const { session_id } = req.body;

    if (!session_id) {
      console.error("Confirmation Error: Missing session ID");
      return res.status(400).json({ error: 'Missing session ID' });
    }

    try {
      // 1. Retrieve session from Stripe
      console.log(`[confirmPayment] Retrieving session from Stripe for ID: ${session_id}`);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      console.log(`[confirmPayment] Stripe session retrieved. Payment status: ${session.payment_status}`);

      console.log(`[confirmPayment] Validating payment_intent. Status: ${session.payment_status}, Intent ID: ${session.payment_intent}`);
      if (session.payment_status !== 'paid') {
        console.error(`[confirmPayment] Payment status not paid: ${session.payment_status}`);
        return res.status(400).json({ error: `Payment not completed. Stripe Payment Status: ${session.payment_status}` });
      }

      console.log('[STRIPE VERIFIED]');

      // 2. Check for existing booking with this payment ID (idempotency)
      console.log(`[confirmPayment] Checking for existing booking for payment ID: ${session_id}`);
      const { data: existingBooking, error: checkError } = await bookingService.getBookingByPaymentId(session_id);
      
      if (existingBooking) {
        console.log('DUPLICATE PAYMENT CONFIRMATION PREVENTED, RETURNING EXISTING:', session_id);
        console.log('Existing Booking Reference:', existingBooking.bookingReference);
        console.log('[BOOKING COMPLETE]');
        return res.json({
          success: true,
          booking: existingBooking,
          alreadyProcessed: true
        });
      }

      if (checkError) {
        console.error('Idempotency Check Error (non-blocking):', checkError);
      }

      // 3. Extract metadata
      const meta = session.metadata;
      if (!meta) {
        console.error('[confirmPayment] No metadata found in Stripe session');
        throw new Error('No metadata found in Stripe session');
      }
      console.log('[confirmPayment] Session metadata:', JSON.stringify(meta, null, 2));

      // 3.5 Auto account creation / profile check
      console.log(`[confirmPayment] Provisioning account for: ${meta.email}`);
      const { userId } = await authService.provisionUserAccount(meta.email, meta.fullName);
      console.log(`[confirmPayment] Account provisioned with User ID: ${userId}`);

      // 4. Create booking (Zoom meetings and emails are triggered inside createBooking sequentially)
      console.log('[confirmPayment] Attempting to create booking via bookingService...');
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
        packageId: meta.packageId,
        packageName: meta.packageName,
        packagePrice: meta.packagePrice ? parseFloat(meta.packagePrice) : undefined,
        packageCredits: meta.packageCredits ? parseInt(meta.packageCredits) : undefined,
        journeyType: meta.journeyType || '',
        userId: userId || null
      });
      
      console.log('[confirmPayment] Booking successfully created:', booking.bookingReference);
      console.log('[BOOKING COMPLETE]');

      res.json({
        success: true,
        booking: booking
      });
    } catch (error: any) {
      console.error('Payment Confirmation Outer Catch Error:', error);
      res.status(500).json({ error: `Payment confirmation failed: ${error.message || error}` });
    }
  }
};
