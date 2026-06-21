import { Router } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { requireSession, adminAuth } from '../middleware/authMiddleware';
import { fromZonedTime } from 'date-fns-tz';
import { format, parse } from 'date-fns';
import { emailService } from '../services/emailService';
import { createZoomMeeting } from '../services/zoomService';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[ADMIN LOGIN ATTEMPT] Email: ${email}`);

  if (!email || !password) {
    console.log(`[ADMIN LOGIN FAILED] Email: ${email || 'unknown'} - Missing credentials`);
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Auth error: ${error.message}`);
      return res.status(401).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Missing user session`);
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Verify user role is admin
    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profErr) {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Profile fetch error: ${profErr.message}`);
      // Sign out to clear session from backend client
      await supabase.auth.signOut();
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (!profile || profile.role !== 'admin') {
      console.log(`[ADMIN LOGIN FAILED] Email: ${email} - Access denied: Role is ${profile?.role || 'none'}`);
      // Sign out to clear session from backend client
      await supabase.auth.signOut();
      return res.status(403).json({ error: 'Access denied: Administrative privileges required' });
    }

    console.log(`[ADMIN LOGIN SUCCESS] Email: ${email}`);
    return res.status(200).json({
      session: data.session,
      profile
    });
  } catch (err: any) {
    console.error(`[ADMIN LOGIN FAILED] Email: ${email} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Sanctuary authentication server error' });
  }
});

/**
 * POST /api/admin/clients/:id/credits
 * Atomically increments, decrements, or overwrites client credits in the membership_credits table.
 */
router.post('/clients/:id/credits', requireSession, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { creditsDelta, absoluteCredits } = req.body;

  console.log(`[ADMIN CREDITS UPDATE] Client ID: ${id}, delta: ${creditsDelta}, absolute: ${absoluteCredits}`);

  try {
    const dbClient = supabaseAdmin || supabase;

    // Fetch profile to verify user exists and get email
    const { data: profile, error: profileError } = await dbClient
      .from('user_profiles')
      .select('email')
      .eq('id', id)
      .maybeSingle();

    if (profileError || !profile) {
      console.warn(`[ADMIN CREDITS FAILED] Profile not found for client: ${id}`);
      return res.status(404).json({ error: 'Client profile not found' });
    }

    // Fetch existing credits
    const { data: mc, error: mcError } = await dbClient
      .from('membership_credits')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    let total = mc?.total_credits || 0;
    let used = mc?.used_credits || 0;
    let remaining = mc?.remaining_credits || 0;

    if (absoluteCredits !== undefined && absoluteCredits !== null) {
      remaining = Number(absoluteCredits);
      if (remaining < 0) {
        return res.status(400).json({ error: 'Remaining credits cannot be negative' });
      }
      total = remaining + used;
    } else if (creditsDelta !== undefined && creditsDelta !== null) {
      remaining = remaining + Number(creditsDelta);
      if (remaining < 0) {
        return res.status(400).json({ error: 'Remaining credits cannot be negative' });
      }
      total = total + Number(creditsDelta);
      if (total < 0) {
        total = 0;
      }
    } else {
      return res.status(400).json({ error: 'Either creditsDelta or absoluteCredits must be provided' });
    }

    // Upsert the credits
    const { data: updatedMc, error: upsertError } = await dbClient
      .from('membership_credits')
      .upsert({
        user_id: id,
        email: profile.email,
        total_credits: total,
        used_credits: used,
        remaining_credits: remaining,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('[Admin Credits API] Error updating credits:', upsertError);
      return res.status(500).json({ error: 'Failed to update client credits' });
    }

    console.log(`[ADMIN CREDITS SUCCESS] Client: ${id}. Remaining credits now: ${remaining}`);
    return res.status(200).json({
      success: true,
      credits: updatedMc
    });
  } catch (err: any) {
    console.error(`[ADMIN CREDITS FAILED] Client: ${id} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error updating client credits' });
  }
});

import { settingsService } from '../services/settingsService';

router.get('/settings/:key', requireSession, adminAuth, async (req, res) => {
  const { key } = req.params;
  try {
    const data = await settingsService.getSettings(key, {});
    return res.status(200).json({ value: data });
  } catch (err: any) {
    console.error(`[ADMIN GET SETTINGS FAILED] Key: ${key} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error loading settings' });
  }
});

router.put('/settings/:key', requireSession, adminAuth, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    const result = await settingsService.saveSettings(key, value);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error(`[ADMIN PUT SETTINGS FAILED] Key: ${key} - Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error updating settings' });
  }
});

router.post('/change-password', requireSession, adminAuth, async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const userId = (req as any).user.id;
    console.log(`[ADMIN PASSWORD UPDATE ATTEMPT] User: ${userId}`);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase Admin client is not initialized' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('[Admin Password API] Error updating password:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[ADMIN PASSWORD UPDATE SUCCESS] User: ${userId}`);
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    console.error(`[ADMIN PASSWORD UPDATE FAILED] Server error:`, err);
    return res.status(500).json({ error: err.message || 'Server error updating password' });
  }
});

/**
 * GET /api/admin/test-zoom
 * Secure diagnostic endpoint to test real Zoom Server-to-Server OAuth and meeting API creation.
 */
router.get('/test-zoom', requireSession, adminAuth, async (req, res) => {
  console.log('[ADMIN TEST-ZOOM] Received request to test Zoom API...');
  try {
    const defaultStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const zoomResult = await createZoomMeeting({
      topic: 'LumaFlow Diagnostic Test Meeting',
      startTime: defaultStartTime,
      duration: 60,
    }, true); // true = throwOnError, so we can capture the raw exception

    console.log('[ADMIN TEST-ZOOM] Success:', zoomResult);
    return res.status(200).json({
      success: true,
      message: 'Zoom meeting created successfully',
      meeting: zoomResult
    });
  } catch (err: any) {
    console.error('[ADMIN TEST-ZOOM] Error:', err.message || err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown error occurred during Zoom meeting creation',
      stack: err.stack
    });
  }
});

/**
 * GET /api/admin/finance
 * Returns detailed financial dashboard metrics, booking analytics, client KPIs, and monthly revenue data.
 */
router.get('/finance', requireSession, adminAuth, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;

    // 1. Fetch all bookings with pricing and creation dates
    const { data: bookings, error: bookingsErr } = await dbClient
      .from('bookings')
      .select('package_price, created_at, booking_status, selected_date, selected_time, timezone, duration, stripe_payment_id, user_id, email, payment_status');

    if (bookingsErr) {
      console.error('[admin/finance] Error retrieving bookings:', bookingsErr);
      return res.status(500).json({ error: 'Failed to retrieve booking transactions' });
    }

    // 2. Fetch all user profiles to compute client counts
    const { data: profiles, error: profilesErr } = await dbClient
      .from('user_profiles')
      .select('id, email, role');

    if (profilesErr) {
      console.error('[admin/finance] Error retrieving profiles:', profilesErr);
      return res.status(500).json({ error: 'Failed to retrieve client profiles' });
    }

    // 3. Fetch user packages and packages for membership metrics
    const { data: userPackages, error: upErr } = await dbClient
      .from('user_packages')
      .select('*');

    if (upErr) {
      console.warn('[admin/finance] Error retrieving user packages:', upErr);
    }

    const { data: packagesList, error: pkgListErr } = await dbClient
      .from('packages')
      .select('*');

    if (pkgListErr) {
      console.warn('[admin/finance] Error retrieving packages list:', pkgListErr);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Financial Metrics init
    let revenueToday = 0;
    let revenueMonth = 0;
    let revenueYear = 0;
    let totalRevenue = 0;

    const monthlyDataMap: Record<string, number> = {};
    let revenuePrevMonth = 0;

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);

    // Booking Metrics init
    let upcomingSessions = 0;
    let completedSessions = 0;
    let cancelledSessions = 0;

    const clientBookingCounts: Record<string, number> = {};

    for (const b of (bookings || [])) {
      const isPaid = b.payment_status === 'paid';
      const isStripeCash = b.stripe_payment_id && b.stripe_payment_id !== 'credit_booking';

      // Sum up cash payments for revenue metrics
      if (isPaid && isStripeCash) {
        const price = Number(b.package_price) || 0;
        const createdDate = new Date(b.created_at);
        const createdYear = createdDate.getFullYear();
        const createdMonth = createdDate.getMonth();
        const createdDayStr = createdDate.toISOString().split('T')[0];

        totalRevenue += price;

        if (createdDayStr === todayStr) {
          revenueToday += price;
        }
        if (createdYear === currentYear && createdMonth === currentMonth) {
          revenueMonth += price;
        }
        if (createdYear === prevMonthDate.getFullYear() && createdMonth === prevMonthDate.getMonth()) {
          revenuePrevMonth += price;
        }
        if (createdYear === currentYear) {
          revenueYear += price;
        }

        const monthKey = `${createdYear}-${String(createdMonth + 1).padStart(2, '0')}`;
        monthlyDataMap[monthKey] = (monthlyDataMap[monthKey] || 0) + price;
      }

      // Compute booking counts
      if (b.booking_status === 'completed') {
        completedSessions++;
      } else if (b.booking_status === 'cancelled') {
        cancelledSessions++;
      } else if (b.booking_status === 'confirmed') {
        const tz = b.timezone || 'America/New_York';
        const startUTC = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tz);
        const durationMs = (b.duration || 60) * 60 * 1000;
        if (startUTC.getTime() + durationMs > now.getTime()) {
          upcomingSessions++;
        } else {
          completedSessions++; // Confirmed past bookings count as completed
        }
      }

      // Track active client booking counts
      if (b.booking_status === 'confirmed' || b.booking_status === 'completed') {
        const clientKey = b.user_id || b.email.toLowerCase();
        clientBookingCounts[clientKey] = (clientBookingCounts[clientKey] || 0) + 1;
      }
    }

    // Growth percentage calculation
    let growthPercent = 0;
    if (revenuePrevMonth > 0) {
      growthPercent = Number((((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100).toFixed(1));
    } else if (revenueMonth > 0) {
      growthPercent = 100;
    }

    // Client Metrics calculation
    const clients = (profiles || []).filter((p: any) => p.role === 'client');
    const totalClients = clients.length;
    let activeClients = 0;
    let returningClients = 0;

    for (const key of Object.keys(clientBookingCounts)) {
      const count = clientBookingCounts[key];
      if (count >= 1) activeClients++;
      if (count >= 2) returningClients++;
    }

    // Historical monthly data (last 6 months) for chart
    const monthlyAnalytics = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      monthlyAnalytics.push({
        month: label,
        revenue: monthlyDataMap[key] || 0
      });
    }

    // Membership Metrics calculation
    const packagesMap = new Map(packagesList?.map(p => [p.id, p]) || []);
    let activePackagesCount = 0;
    let expiredPackagesCount = 0;
    let creditsUsed = 0;
    let creditsRemaining = 0;
    let packageRevenue = 0;

    for (const up of (userPackages || [])) {
      const isExpired = up.expires_at ? new Date(up.expires_at) <= now : false;
      if (up.status === 'active' && !isExpired) {
        activePackagesCount++;
      } else {
        expiredPackagesCount++;
      }

      creditsUsed += Number(up.used_credits) || 0;
      creditsRemaining += Number(up.remaining_credits) || 0;

      const pkg = up.package_id ? (packagesMap.get(up.package_id) as any) : null;
      const price = pkg ? Number(pkg.price) : 0;
      packageRevenue += price;
    }

    return res.json({
      revenue: {
        today: revenueToday,
        month: revenueMonth,
        year: revenueYear,
        total: totalRevenue,
        previousMonth: revenuePrevMonth,
        growthPercent
      },
      bookings: {
        upcoming: upcomingSessions,
        completed: completedSessions,
        cancelled: cancelledSessions
      },
      clients: {
        total: totalClients,
        active: activeClients,
        returning: returningClients
      },
      monthlyAnalytics,
      membershipAnalytics: {
        activePackagesCount,
        expiredPackagesCount,
        creditsUsed,
        creditsRemaining,
        packageRevenue
      }
    });
  } catch (err: any) {
    console.error('[admin/finance] Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error fetching finance stats' });
  }
});

/**
 * GET /api/admin/waitlist
 * Returns all waitlist entries, ordered by preferred_date and created_at.
 */
router.get('/waitlist', requireSession, adminAuth, async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('waitlist_entries')
      .select('*')
      .order('preferred_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Admin Waitlist API] Error fetching waitlist:', error);
      return res.status(500).json({ error: 'Failed to fetch waitlist entries' });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[Admin Waitlist API] Server error:', err);
    return res.status(500).json({ error: err.message || 'Server error fetching waitlist' });
  }
});

/**
 * POST /api/admin/waitlist/:id/notify
 * Manually notifies a specific waitlist entry and marks it as notified = true.
 */
router.post('/waitlist/:id/notify', requireSession, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data: entry, error: fetchErr } = await dbClient
      .from('waitlist_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !entry) {
      console.warn(`[Admin Waitlist API] Waitlist entry not found: ${id}`);
      return res.status(404).json({ error: 'Waitlist entry not found' });
    }

    // Call emailService.sendWaitlistAlert
    const formattedDate = format(parse(entry.preferred_date, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy');
    await emailService.sendWaitlistAlert(entry.email, entry.name, formattedDate, entry.preferred_time);

    // Mark as notified in db
    const { error: updateError } = await dbClient
      .from('waitlist_entries')
      .update({ notified: true })
      .eq('id', id);

    if (updateError) {
      console.error('[Admin Waitlist API] Error marking entry as notified:', updateError);
      return res.status(500).json({ error: 'Failed to update waitlist entry status' });
    }

    return res.status(200).json({ success: true, message: 'Waitlist client notified successfully' });
  } catch (err: any) {
    console.error('[Admin Waitlist API] Server error:', err);
    return res.status(500).json({ error: err.message || 'Server error notifying waitlist client' });
  }
});

/**
 * DELETE /api/admin/waitlist/:id
 * Removes a waitlist entry.
 */
router.delete('/waitlist/:id', requireSession, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const dbClient = supabaseAdmin || supabase;
    const { error } = await dbClient
      .from('waitlist_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin Waitlist API] Error deleting waitlist entry:', error);
      return res.status(500).json({ error: 'Failed to delete waitlist entry' });
    }

    return res.status(200).json({ success: true, message: 'Waitlist entry removed' });
  } catch (err: any) {
    console.error('[Admin Waitlist API] Server error:', err);
    return res.status(500).json({ error: err.message || 'Server error deleting waitlist entry' });
  }
});

/**
 * POST /api/admin/bookings/:id/provision-zoom
 * Manually provisions or regenerates a Zoom meeting for a virtual booking.
 */
router.post('/bookings/:id/provision-zoom', requireSession, adminAuth, async (req, res) => {
  const { id } = req.params;
  console.log(`[MANUAL ZOOM PROVISIONING] Booking ID: ${id}`);

  try {
    const dbClient = supabaseAdmin || supabase;

    // 1. Fetch the booking
    const { data: booking, error: fetchErr } = await dbClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !booking) {
      console.warn(`[Manual Zoom API] Booking not found: ${id}`);
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.session_format?.toLowerCase() !== 'virtual') {
      return res.status(400).json({ error: 'Only virtual sessions can have Zoom meetings provisioned' });
    }

    // 2. Parse date-time
    const dateStr = booking.selected_date; // 'YYYY-MM-DD'
    const timeStr = booking.selected_time; // 'HH:MM'
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const zonedStart = fromZonedTime(dateTimeStr, 'America/New_York');

    // 3. Call Zoom service to create meeting
    const zoomResult = await createZoomMeeting({
      topic: `${booking.selected_session || 'Healing Session'} with Alanna`,
      startTime: zonedStart.toISOString(),
      duration: Number(booking.duration || 60),
    });

    // 4. Update the booking row
    const { data: updatedBooking, error: updateErr } = await dbClient
      .from('bookings')
      .update({
        zoom_meeting_id: zoomResult.meetingId,
        zoom_join_url: zoomResult.joinUrl,
        zoom_start_url: zoomResult.hostUrl,
        meeting_password: zoomResult.password,
        meeting_type: '2',
        calendar_status: 'scheduled',
        zoom_status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('[Manual Zoom API] Error updating booking:', updateErr);
      return res.status(500).json({ error: 'Failed to save Zoom details in database' });
    }

    console.log(`[Manual Zoom API] Successfully provisioned Zoom for ${booking.booking_reference}`);
    return res.status(200).json({
      success: true,
      booking: updatedBooking
    });
  } catch (err: any) {
    console.error('[Manual Zoom API] Server error:', err);
    return res.status(500).json({ error: err.message || 'Server error provisioning Zoom meeting' });
  }
});

export default router;

