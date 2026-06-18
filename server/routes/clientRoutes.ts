import { Router, Request, Response } from 'express';
import { requireSession } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabase';
import { stripe } from '../config/stripe';
import { fromZonedTime } from 'date-fns-tz';

const router = Router();

// Extend Request interface locally
interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

// 1. GET /api/client/upcoming-booking
router.get('/upcoming-booking', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = req.profile;
    if (!profile) {
      return res.status(401).json({ error: 'Profile not found in session' });
    }

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .or(`user_id.eq.${profile.id},email.eq.${profile.email}`)
      .order('selected_date', { ascending: true });

    if (error) {
      console.error('[upcoming-booking] Error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to retrieve bookings' });
    }

    if (!bookings || bookings.length === 0) {
      return res.json({ upcomingBooking: null });
    }

    const now = new Date();
    const activeBookings = bookings.filter((b: any) => {
      if (b.booking_status === 'cancelled') return false;
      const tz = b.timezone || 'America/New_York';
      const startUTC = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tz);
      const durationMs = (b.duration || 60) * 60 * 1000;
      return startUTC.getTime() + durationMs > now.getTime();
    });

    // Sort by selected date and time ascending
    activeBookings.sort((a: any, b: any) => {
      const tzValA = a.timezone || 'America/New_York';
      const tzValB = b.timezone || 'America/New_York';
      const timeA = fromZonedTime(`${a.selected_date}T${a.selected_time}:00`, tzValA).getTime();
      const timeB = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tzValB).getTime();
      return timeA - timeB;
    });

    const upcomingBooking = activeBookings.length > 0 ? activeBookings[0] : null;
    return res.json({ upcomingBooking });
  } catch (err: any) {
    console.error('[upcoming-booking] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. GET /api/client/journey-stats
router.get('/journey-stats', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = req.profile;
    if (!profile) {
      return res.status(401).json({ error: 'Profile not found in session' });
    }

    // A. Completed Rituals
    const { data: completedBookings, error: completedErr } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .or(`user_id.eq.${profile.id},email.eq.${profile.email}`)
      .eq('booking_status', 'completed');

    if (completedErr) {
      console.error('[journey-stats] Error fetching completed bookings:', completedErr);
      return res.status(500).json({ error: 'Failed to retrieve completed bookings' });
    }
    const completedRituals = completedBookings ? completedBookings.length : 0;

    // B. Remaining Credits
    const { data: membership, error: memErr } = await supabaseAdmin
      .from('membership_credits')
      .select('remaining_credits')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (memErr) {
      console.error('[journey-stats] Error fetching membership credits:', memErr);
    }

    const { data: packages, error: pkgErr } = await supabaseAdmin
      .from('user_packages')
      .select('remaining_credits')
      .ilike('user_email', profile.email)
      .eq('status', 'active');

    if (pkgErr) {
      console.error('[journey-stats] Error fetching active packages:', pkgErr);
    }

    let remainingCredits = 0;
    if (membership) {
      remainingCredits = membership.remaining_credits;
    } else if (packages) {
      remainingCredits = packages.reduce((sum: number, p: any) => sum + (p.remaining_credits || 0), 0);
    }

    // C. Upcoming Rituals
    const { data: allUserBookings, error: upcomingErr } = await supabaseAdmin
      .from('bookings')
      .select('selected_date, selected_time, timezone, booking_status, duration')
      .or(`user_id.eq.${profile.id},email.eq.${profile.email}`);

    if (upcomingErr) {
      console.error('[journey-stats] Error fetching all user bookings:', upcomingErr);
      return res.status(500).json({ error: 'Failed to retrieve upcoming bookings count' });
    }

    const now = new Date();
    const upcomingBookingsList = (allUserBookings || []).filter((b: any) => {
      if (b.booking_status !== 'confirmed') return false;
      const tz = b.timezone || 'America/New_York';
      const startUTC = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tz);
      const durationMs = (b.duration || 60) * 60 * 1000;
      return startUTC.getTime() + durationMs > now.getTime();
    });
    const upcomingBookings = upcomingBookingsList.length;

    return res.json({
      completedRituals,
      remainingCredits,
      upcomingBookings
    });
  } catch (err: any) {
    console.error('[journey-stats] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 3. GET /api/client/payments
router.get('/payments', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = req.profile;
    if (!profile) {
      return res.status(401).json({ error: 'Profile not found in session' });
    }

    const { data: paidBookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .or(`user_id.eq.${profile.id},email.eq.${profile.email}`)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[payments] Error fetching paid bookings:', error);
      return res.status(500).json({ error: 'Failed to retrieve paid bookings' });
    }

    if (!paidBookings || paidBookings.length === 0) {
      return res.json([]);
    }

    const payments = [];
    for (const b of paidBookings) {
      let receiptUrl = null;
      const sessionId = b.stripe_payment_id;
      if (sessionId && sessionId.startsWith('cs_')) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent.latest_charge']
          });
          const paymentIntent = session.payment_intent as any;
          const latestCharge = paymentIntent?.latest_charge;
          receiptUrl = latestCharge?.receipt_url || null;
        } catch (err) {
          console.error(`[GET /payments] Error expanding Stripe session ${sessionId}:`, err);
        }
      }
      payments.push({
        bookingId: b.id,
        ritual: b.selected_session,
        amount: b.package_price || 0,
        status: 'Paid',
        paymentMethod: 'Stripe',
        receiptUrl,
        paymentDate: b.created_at
      });
    }

    return res.json(payments);
  } catch (err: any) {
    console.error('[payments] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
